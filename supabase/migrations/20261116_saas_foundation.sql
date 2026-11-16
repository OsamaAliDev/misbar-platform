-- Phase 5A: run after supabase/schema.sql, as the migration owner (postgres).
-- Auth is provided by Supabase; no auth stubs or seeded production identities here.
BEGIN;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE SCHEMA IF NOT EXISTS saas_private;
REVOKE ALL ON SCHEMA saas_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public, saas_private TO authenticated;

-- Preserve an existing pgcrypto installation wherever the operator put it;
-- fully qualify its functions in locked-path private wrappers, never relocate it.
DO $wrapper$
DECLARE ns text;
BEGIN
  SELECT n.nspname INTO ns FROM pg_extension e JOIN pg_namespace n ON n.oid=e.extnamespace WHERE e.extname='pgcrypto';
  EXECUTE format('CREATE FUNCTION saas_private.hash_pin(p_pin text) RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS %L',
    format('SELECT %I.crypt(p_pin,%I.gen_salt(''bf'',12))',ns,ns));
  EXECUTE format('CREATE FUNCTION saas_private.verify_pin(p_pin text,p_hash text) RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS %L',
    format('SELECT p_hash = %I.crypt(p_pin,p_hash)',ns));
  EXECUTE format('CREATE FUNCTION saas_private.account_key(p_code text,p_nick text) RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS %L',
    format('SELECT encode(%I.digest(lower(btrim(p_code)) || chr(31) || lower(btrim(p_nick)),''sha256''),''hex'')',ns));
END $wrapper$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE role IS NULL OR role NOT IN ('student','teacher','school_admin','platform_admin')) THEN
    RAISE EXCEPTION 'Phase5A: unsupported legacy profile role (including parent/NULL); operator must explicitly resolve roles before migration';
  END IF;
END $$;

CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id);
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student','teacher','school_admin','platform_admin'));
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_school_unique UNIQUE (id,school_id);
-- NOT VALID preserves legacy staff profiles lacking a school; they have no access
-- until an operator provisions them. Every new/updated row must satisfy this check.
ALTER TABLE public.profiles ADD CONSTRAINT profiles_tenant_role_check CHECK (
  (role = 'platform_admin' AND school_id IS NULL) OR
  (role IN ('teacher','school_admin') AND school_id IS NOT NULL) OR role = 'student'
) NOT VALID;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_auth_user_fk FOREIGN KEY (id) REFERENCES auth.users(id) NOT VALID;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.classes WHERE school_id IS NULL) THEN
    RAISE EXCEPTION 'Phase5A: populated legacy classes have NULL school_id; operator must create/map schools and teachers explicitly before migration';
  END IF;
END $$;
ALTER TABLE public.classes ALTER COLUMN school_id SET NOT NULL;
ALTER TABLE public.classes ALTER COLUMN teacher_id SET NOT NULL;
ALTER TABLE public.classes ADD CONSTRAINT classes_id_school_unique UNIQUE (id,school_id);
ALTER TABLE public.classes ADD CONSTRAINT classes_teacher_school_fk FOREIGN KEY (teacher_id,school_id) REFERENCES public.profiles(id,school_id);
ALTER TABLE public.classes ADD CONSTRAINT classes_name_check CHECK (char_length(btrim(name)) BETWEEN 1 AND 120);
ALTER TABLE public.classes ADD CONSTRAINT classes_code_check CHECK (join_code ~ '^[A-Za-z0-9_-]{4,32}$');
CREATE UNIQUE INDEX classes_join_code_ci ON public.classes (lower(join_code));

CREATE TABLE public.subscriptions (
  school_id uuid PRIMARY KEY REFERENCES public.schools(id),
  plan text NOT NULL CHECK (char_length(btrim(plan)) BETWEEN 1 AND 40),
  status text NOT NULL CHECK (status IN ('active','inactive','expired','suspended')),
  student_limit integer NOT NULL CHECK (student_limit BETWEEN 0 AND 100000),
  valid_until timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Match server/progress.mjs pseudonym character policy without locale-dependent
-- POSIX alpha classes: explicit Unicode 17.0 L / L+M+N ranges (Node properties).
-- Staff must request aliases; syntax cannot distinguish aliases from real names.
CREATE FUNCTION saas_private.valid_nickname(p_name text) RETURNS boolean
LANGUAGE sql IMMUTABLE STRICT SET search_path = pg_catalog AS $$
  -- JavaScript String.length counts supplementary code points as two units.
  SELECT char_length(p_name) + char_length(regexp_replace(p_name,U&'[^\+010000-\+10FFFF]','','g')) BETWEEN 2 AND 24
    AND p_name = btrim(p_name) AND p_name = normalize(p_name,NFC)
    AND p_name COLLATE pg_catalog."C" ~ '^[0-9A-Za-zª²³µ¹º¼-¾À-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-ԯԱ-Ֆՙՠ-ֈ֑-ׇֽֿׁׂׅׄא-תׯ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺ߽ࠀ-࠭ࡀ-࡛ࡠ-ࡪࡰ-ࢇࢉ-࢏ࢗ-ࣣ࣡-ॣ०-९ॱ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱ৴-৹ৼ৾ਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ૹ-૿ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍୕-ୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱ-୷ஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௲ఀ-ఌఎ-ఐఒ-నప-హ఼-ౄె-ైొ-్ౕౖౘ-ౚ౜ౝౠ-ౣ౦-౯౸-౾ಀ-ಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖ೜-ೞೠ-ೣ೦-೯ೱ-ೳഀ-ഌഎ-ഐഒ-ൄെ-ൈൊ-ൎൔ-ൣ൦-൸ൺ-ൿඁ-ඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟ෦-෯ෲෳก-ฺเ-๎๐-๙ກຂຄຆ-ຊຌ-ຣລວ-ຽເ-ໄໆ່-໎໐-໙ໜ-ໟༀ༘༙༠-༳༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟፩-፼ᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-᜕ᜟ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩៰-៹᠋-᠍᠏-᠙ᠠ-ᡸᢀ-ᢪᢰ-ᣵᤀ-ᤞᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧚ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧ᪰-᫝᫠-᫫ᬀ-ᭌ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽᲀ-ᲊᲐ-ᲺᲽ-Ჿ᳐-᳔᳒-ᳺᴀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ⁰ⁱ⁴-⁹ⁿ-₉ₐ-ₜ⃐-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎ⅐-↉①-⒛⓪-⓿❶-➓Ⰰ-ⳤⳫ-ⳳ⳽ⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎ㆒-㆕ㆠ-ㆿㇰ-ㇿ㈠-㈩㉈-㉏㉑-㉟㊀-㊉㊱-㊿㐀-䶿一-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙲ꙴ-꙽ꙿ-꛱ꜗ-ꜟꜢ-ꞈꞋ-Ƛ꟱-ꠧ꠬꠰-꠵ꡀ-ꡳꢀ-ꣅ꣐-꣙꣠-ꣷꣻꣽ-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꧠ-ꧾꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭩꭰ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︯ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ𐀀-𐀋𐀍-𐀦𐀨-𐀺𐀼𐀽𐀿-𐁍𐁐-𐁝𐂀-𐃺𐄇-𐄳𐅀-𐅸𐆊𐆋𐇽𐊀-𐊜𐊠-𐋐𐋠-𐋻𐌀-𐌣𐌭-𐍊𐍐-𐍺𐎀-𐎝𐎠-𐏃𐏈-𐏏𐏑-𐏕𐐀-𐒝𐒠-𐒩𐒰-𐓓𐓘-𐓻𐔀-𐔧𐔰-𐕣𐕰-𐕺𐕼-𐖊𐖌-𐖒𐖔𐖕𐖗-𐖡𐖣-𐖱𐖳-𐖹𐖻𐖼𐗀-𐗳𐘀-𐜶𐝀-𐝕𐝠-𐝧𐞀-𐞅𐞇-𐞰𐞲-𐞺𐠀-𐠅𐠈𐠊-𐠵𐠷𐠸𐠼𐠿-𐡕𐡘-𐡶𐡹-𐢞𐢧-𐢯𐣠-𐣲𐣴𐣵𐣻-𐤛𐤠-𐤹𐥀-𐥙𐦀-𐦷𐦼-𐧏𐧒-𐨃𐨅𐨆𐨌-𐨓𐨕-𐨗𐨙-𐨵𐨸-𐨿𐨺-𐩈𐩠-𐩾𐪀-𐪟𐫀-𐫇𐫉-𐫦𐫫-𐫯𐬀-𐬵𐭀-𐭕𐭘-𐭲𐭸-𐮑𐮩-𐮯𐰀-𐱈𐲀-𐲲𐳀-𐳲𐳺-𐴧𐴰-𐴹𐵀-𐵥𐵩-𐵭𐵯-𐶅𐹠-𐹾𐺀-𐺩𐺫𐺬𐺰𐺱𐻂-𐻇𐻺-𐼧𐼰-𐽔𐽰-𐾅𐾰-𐿋𐿠-𐿶𑀀-𑁆𑁒-𑁵𑁿-𑂺𑃂𑃐-𑃨𑃰-𑃹𑄀-𑄴𑄶-𑄿𑅄-𑅇𑅐-𑅳𑅶𑆀-𑇄𑇉-𑇌𑇎-𑇚𑇜𑇡-𑇴𑈀-𑈑𑈓-𑈷𑈾-𑉁𑊀-𑊆𑊈𑊊-𑊍𑊏-𑊝𑊟-𑊨𑊰-𑋪𑋰-𑋹𑌀-𑌃𑌅-𑌌𑌏𑌐𑌓-𑌨𑌪-𑌰𑌲𑌳𑌵-𑌹𑌻-𑍄𑍇𑍈𑍋-𑍍𑍐𑍗𑍝-𑍣𑍦-𑍬𑍰-𑍴𑎀-𑎉𑎋𑎎𑎐-𑎵𑎷-𑏀𑏅𑏅𑎸-𑏊𑏌-𑏓𑏡𑏢𑐀-𑑊𑑐-𑑙𑑞-𑑡𑒀-𑓅𑓇𑓐-𑓙𑖀-𑖵𑖸-𑗀𑗘-𑗝𑘀-𑙀𑙄𑙐-𑙙𑚀-𑚸𑛀-𑛉𑛐-𑛣𑜀-𑜚𑜝-𑜫𑜰-𑜻𑝀-𑝆𑠀-𑠺𑢠-𑣲𑣿-𑤆𑤉𑤌-𑤓𑤕𑤖𑤘-𑤵𑤷𑤸𑤻-𑥃𑥐-𑥙𑦠-𑦧𑦪-𑧗𑧚-𑧡𑧣𑧤𑨀-𑨾𑩇𑩐-𑪙𑪝𑪰-𑫸𑭠-𑭧𑯀-𑯠𑯰-𑯹𑰀-𑰈𑰊-𑰶𑰸-𑱀𑱐-𑱬𑱲-𑲏𑲒-𑲧𑲩-𑲶𑴀-𑴆𑴈𑴉𑴋-𑴶𑴺𑴼𑴽𑴿-𑵇𑵐-𑵙𑵠-𑵥𑵧𑵨𑵪-𑶎𑶐𑶑𑶓-𑶘𑶠-𑶩𑶰-𑷛𑷠-𑷩𑻠-𑻶𑼀-𑼐𑼒-𑼺𑼾-𑽂𑽐-𑽚𑾰𑿀-𑿔𒀀-𒎙𒐀-𒑮𒒀-𒕃𒾐-𒿰𓀀-𓐯𓑀-𓑕𓑠-𔏺𔐀-𔙆𖄀-𖄹𖠀-𖨸𖩀-𖩞𖩠-𖩩𖩰-𖪾𖫀-𖫉𖫐-𖫭𖫰-𖫴𖬀-𖬶𖭀-𖭃𖭐-𖭙𖭛-𖭡𖭣-𖭷𖭽-𖮏𖵀-𖵬𖵰-𖵹𖹀-𖺖𖺠-𖺸𖺻-𖻓𖼀-𖽊𖽏-𖾇𖾏-𖾟𖿠𖿡𖿣𖿤𖿰-𖿶𗀀-𘳕𘳿-𘴞𘶀-𘷲𚿰-𚿳𚿵-𚿻𚿽𚿾𛀀-𛄢𛄲𛅐-𛅒𛅕𛅤-𛅧𛅰-𛋻𛰀-𛱪𛱰-𛱼𛲀-𛲈𛲐-𛲙𛲝𛲞𜳰-𜳹𜼀-𜼭𜼰-𜽆𝅥-𝅩𝅭-𝅲𝅻-𝆂𝆅-𝆋𝆪-𝆭𝉂-𝉄𝋀-𝋓𝋠-𝋳𝍠-𝍸𝐀-𝑔𝑖-𝒜𝒞𝒟𝒢𝒥𝒦𝒩-𝒬𝒮-𝒹𝒻𝒽-𝓃𝓅-𝔅𝔇-𝔊𝔍-𝔔𝔖-𝔜𝔞-𝔹𝔻-𝔾𝕀-𝕄𝕆𝕊-𝕐𝕒-𝚥𝚨-𝛀𝛂-𝛚𝛜-𝛺𝛼-𝜔𝜖-𝜴𝜶-𝝎𝝐-𝝮𝝰-𝞈𝞊-𝞨𝞪-𝟂𝟄-𝟋𝟎-𝟿𝨀-𝨶𝨻-𝩬𝩵𝪄𝪛-𝪟𝪡-𝪯𝼀-𝼞𝼥-𝼪𞀀-𞀆𞀈-𞀘𞀛-𞀡𞀣𞀤𞀦-𞀪𞀰-𞁭𞂏𞄀-𞄬𞄰-𞄽𞅀-𞅉𞅎𞊐-𞊮𞋀-𞋹𞓐-𞓹𞗐-𞗺𞛀-𞛞𞛠-𞛵𞛾𞛿𞟠-𞟦𞟨-𞟫𞟭𞟮𞟰-𞟾𞠀-𞣄𞣇-𞣖𞤀-𞥋𞥐-𞥙𞱱-𞲫𞲭-𞲯𞲱-𞲴𞴁-𞴭𞴯-𞴽𞸀-𞸃𞸅-𞸟𞸡𞸢𞸤𞸧𞸩-𞸲𞸴-𞸷𞸹𞸻𞹂𞹇𞹉𞹋𞹍-𞹏𞹑𞹒𞹔𞹗𞹙𞹛𞹝𞹟𞹡𞹢𞹤𞹧-𞹪𞹬-𞹲𞹴-𞹷𞹹-𞹼𞹾𞺀-𞺉𞺋-𞺛𞺡-𞺣𞺥-𞺩𞺫-𞺻🄀-🄌🯰-🯹𠀀-𪛟𪜀-𫠝𫠠-𬺭𬺰-𮯠𮯰-𮹝丽-𪘀𰀀-𱍊𱍐-𳑹󠄀-󠇯 _.-]+$'
    AND p_name COLLATE pg_catalog."C" ~ '[A-Za-zªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙՠ-ֈא-תׯ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࡠ-ࡪࡰ-ࢇࢉ-࢏ࢠ-ࣉऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱৼਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚ౜ౝౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽ೜-ೞೠೡೱೲഄ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄຆ-ຊຌ-ຣລວ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛱ-ᛸᜀ-ᜑᜟ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡸᢀ-ᢄᢇ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭌᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲊᲐ-ᲺᲽ-Ჿᳩ-ᳬᳮ-ᳳᳵᳶᳺᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎↃↄⰀ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々〆〱-〵〻〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎㆠ-ㆿㇰ-ㇿ㐀-䶿一-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛥꜗ-ꜟꜢ-ꞈꞋ-Ƛ꟱-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꣾꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭩꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ𐀀-𐀋𐀍-𐀦𐀨-𐀺𐀼𐀽𐀿-𐁍𐁐-𐁝𐂀-𐃺𐊀-𐊜𐊠-𐋐𐌀-𐌟𐌭-𐍀𐍂-𐍉𐍐-𐍵𐎀-𐎝𐎠-𐏃𐏈-𐏏𐐀-𐒝𐒰-𐓓𐓘-𐓻𐔀-𐔧𐔰-𐕣𐕰-𐕺𐕼-𐖊𐖌-𐖒𐖔𐖕𐖗-𐖡𐖣-𐖱𐖳-𐖹𐖻𐖼𐗀-𐗳𐘀-𐜶𐝀-𐝕𐝠-𐝧𐞀-𐞅𐞇-𐞰𐞲-𐞺𐠀-𐠅𐠈𐠊-𐠵𐠷𐠸𐠼𐠿-𐡕𐡠-𐡶𐢀-𐢞𐣠-𐣲𐣴𐣵𐤀-𐤕𐤠-𐤹𐥀-𐥙𐦀-𐦷𐦾𐦿𐨀𐨐-𐨓𐨕-𐨗𐨙-𐨵𐩠-𐩼𐪀-𐪜𐫀-𐫇𐫉-𐫤𐬀-𐬵𐭀-𐭕𐭠-𐭲𐮀-𐮑𐰀-𐱈𐲀-𐲲𐳀-𐳲𐴀-𐴣𐵊-𐵥𐵯-𐶅𐺀-𐺩𐺰𐺱𐻂-𐻇𐼀-𐼜𐼧𐼰-𐽅𐽰-𐾁𐾰-𐿄𐿠-𐿶𑀃-𑀷𑁱𑁲𑁵𑂃-𑂯𑃐-𑃨𑄃-𑄦𑅄𑅇𑅐-𑅲𑅶𑆃-𑆲𑇁-𑇄𑇚𑇜𑈀-𑈑𑈓-𑈫𑈿𑉀𑊀-𑊆𑊈𑊊-𑊍𑊏-𑊝𑊟-𑊨𑊰-𑋞𑌅-𑌌𑌏𑌐𑌓-𑌨𑌪-𑌰𑌲𑌳𑌵-𑌹𑌽𑍐𑍝-𑍡𑎀-𑎉𑎋𑎎𑎐-𑎵𑎷𑏑𑏓𑐀-𑐴𑑇-𑑊𑑟-𑑡𑒀-𑒯𑓄𑓅𑓇𑖀-𑖮𑗘-𑗛𑘀-𑘯𑙄𑚀-𑚪𑚸𑜀-𑜚𑝀-𑝆𑠀-𑠫𑢠-𑣟𑣿-𑤆𑤉𑤌-𑤓𑤕𑤖𑤘-𑤯𑤿𑥁𑦠-𑦧𑦪-𑧐𑧡𑧣𑨀𑨋-𑨲𑨺𑩐𑩜-𑪉𑪝𑪰-𑫸𑯀-𑯠𑰀-𑰈𑰊-𑰮𑱀𑱲-𑲏𑴀-𑴆𑴈𑴉𑴋-𑴰𑵆𑵠-𑵥𑵧𑵨𑵪-𑶉𑶘𑶰-𑷛𑻠-𑻲𑼂𑼄-𑼐𑼒-𑼳𑾰𒀀-𒎙𒒀-𒕃𒾐-𒿰𓀀-𓐯𓑁-𓑆𓑠-𔏺𔐀-𔙆𖄀-𖄝𖠀-𖨸𖩀-𖩞𖩰-𖪾𖫐-𖫭𖬀-𖬯𖭀-𖭃𖭣-𖭷𖭽-𖮏𖵀-𖵬𖹀-𖹿𖺠-𖺸𖺻-𖻓𖼀-𖽊𖽐𖾓-𖾟𖿠𖿡𖿣𖿲𖿳𗀀-𘳕𘳿-𘴞𘶀-𘷲𚿰-𚿳𚿵-𚿻𚿽𚿾𛀀-𛄢𛄲𛅐-𛅒𛅕𛅤-𛅧𛅰-𛋻𛰀-𛱪𛱰-𛱼𛲀-𛲈𛲐-𛲙𝐀-𝑔𝑖-𝒜𝒞𝒟𝒢𝒥𝒦𝒩-𝒬𝒮-𝒹𝒻𝒽-𝓃𝓅-𝔅𝔇-𝔊𝔍-𝔔𝔖-𝔜𝔞-𝔹𝔻-𝔾𝕀-𝕄𝕆𝕊-𝕐𝕒-𝚥𝚨-𝛀𝛂-𝛚𝛜-𝛺𝛼-𝜔𝜖-𝜴𝜶-𝝎𝝐-𝝮𝝰-𝞈𝞊-𝞨𝞪-𝟂𝟄-𝟋𝼀-𝼞𝼥-𝼪𞀰-𞁭𞄀-𞄬𞄷-𞄽𞅎𞊐-𞊭𞋀-𞋫𞓐-𞓫𞗐-𞗭𞗰𞛀-𞛞𞛠-𞛢𞛤𞛥𞛧-𞛭𞛰-𞛴𞛾𞛿𞟠-𞟦𞟨-𞟫𞟭𞟮𞟰-𞟾𞠀-𞣄𞤀-𞥃𞥋𞸀-𞸃𞸅-𞸟𞸡𞸢𞸤𞸧𞸩-𞸲𞸴-𞸷𞸹𞸻𞹂𞹇𞹉𞹋𞹍-𞹏𞹑𞹒𞹔𞹗𞹙𞹛𞹝𞹟𞹡𞹢𞹤𞹧-𞹪𞹬-𞹲𞹴-𞹷𞹹-𞹼𞹾𞺀-𞺉𞺋-𞺛𞺡-𞺣𞺥-𞺩𞺫-𞺻𠀀-𪛟𪜀-𫠝𫠠-𬺭𬺰-𮯠𮯰-𮹝丽-𪘀𰀀-𱍊𱍐-𳑹]'
$$;

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id),
  class_id uuid NOT NULL,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nickname text NOT NULL CHECK (saas_private.valid_nickname(nickname)),
  pin_hash text NOT NULL CHECK (pin_hash LIKE '$2a$12$%' AND char_length(pin_hash)=60),
  stars integer NOT NULL DEFAULT 12 CHECK (stars BETWEEN 0 AND 28),
  hero_id text CHECK (hero_id IN ('lubna','shihab','nour','suhail','sharara')),
  avatar_id text NOT NULL DEFAULT 'rocket' CHECK (avatar_id IN ('rocket','planet','atom','star')),
  completed_challenges text[] NOT NULL DEFAULT '{}' CHECK (completed_challenges <@ ARRAY['motion-acceleration','lever-balance','planet-orbits','fractions-area','light-refraction','matter-states']::text[] AND cardinality(completed_challenges)<=6),
  claimed_missions text[] NOT NULL DEFAULT '{}' CHECK (claimed_missions <@ ARRAY['first-discovery','two-experiments','science-tour']::text[] AND cardinality(claimed_missions)<=3),
  unlocked_outfits text[] NOT NULL DEFAULT '{}' CHECK (cardinality(unlocked_outfits)<=15),
  imported boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT students_class_school_fk FOREIGN KEY (class_id,school_id) REFERENCES public.classes(id,school_id),
  UNIQUE (id,school_id)
);
CREATE UNIQUE INDEX students_nickname_class_ci ON public.students(class_id,lower(nickname));
CREATE INDEX students_school_idx ON public.students(school_id);
CREATE INDEX classes_teacher_idx ON public.classes(teacher_id);
CREATE TABLE public.experiment_progress (
  student_id uuid NOT NULL,
  school_id uuid NOT NULL,
  experiment_id text NOT NULL CHECK (experiment_id IN ('motion-acceleration','lever-balance','planet-orbits','fractions-area','light-refraction','matter-states')),
  stars integer NOT NULL DEFAULT 1 CHECK (stars BETWEEN 0 AND 1),
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id,experiment_id),
  FOREIGN KEY (student_id,school_id) REFERENCES public.students(id,school_id) ON DELETE CASCADE
);
CREATE TABLE saas_private.pin_attempts (
  account_key text PRIMARY KEY,
  failures integer NOT NULL DEFAULT 0 CHECK (failures BETWEEN 0 AND 5),
  window_started timestamptz NOT NULL DEFAULT now()
);

-- Remove every legacy policy, not merely the known anonymous events policy.
DO $$
DECLARE p record; t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['events','schools','profiles','classes','students','experiment_progress','subscriptions'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated',t);
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I',p.policyname,t);
    END LOOP;
  END LOOP;
END $$;
ALTER TABLE saas_private.pin_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON saas_private.pin_attempts FROM PUBLIC,anon,authenticated;
-- No client policies or privileges on events / attempts. Owner-only data.

CREATE FUNCTION saas_private.caller_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()
  AND auth.jwt()->>'role' = 'authenticated'
  AND ((p.role = 'student' AND auth.jwt()->'is_anonymous' = 'true'::jsonb
        AND EXISTS (SELECT 1 FROM public.students s WHERE s.auth_user_id=p.id AND s.school_id=p.school_id))
    OR (p.role IN ('teacher','school_admin','platform_admin') AND COALESCE(auth.jwt()->'is_anonymous','false'::jsonb) = 'false'::jsonb))
$$;
CREATE FUNCTION saas_private.caller_school() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT school_id FROM public.profiles WHERE id=auth.uid() AND saas_private.caller_role() IS NOT NULL
$$;
CREATE FUNCTION saas_private.owns_class(p_class uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT EXISTS (SELECT 1 FROM public.classes c WHERE c.id=p_class AND c.school_id=saas_private.caller_school()
    AND (saas_private.caller_role()='school_admin' OR (saas_private.caller_role()='teacher' AND c.teacher_id=auth.uid())))
$$;
CREATE FUNCTION saas_private.reads_student(p_student uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT EXISTS (SELECT 1 FROM public.students s WHERE s.id=p_student AND
    ((saas_private.caller_role()='student' AND s.auth_user_id=auth.uid()) OR saas_private.owns_class(s.class_id)))
$$;
CREATE FUNCTION saas_private.valid_teacher(p_teacher uuid,p_school uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id=p_teacher AND school_id=p_school AND p_school=saas_private.caller_school()
    AND (saas_private.caller_role()='school_admin' OR (saas_private.caller_role()='teacher' AND p_teacher=auth.uid())) AND role IN ('teacher','school_admin'))
$$;
CREATE FUNCTION saas_private.student_json(p_student uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT jsonb_build_object('id',id,'nickname',nickname,'stars',stars,'heroId',hero_id,'avatarId',avatar_id,
    'completedChallenges',completed_challenges,'claimedMissions',claimed_missions,'unlockedOutfits',unlocked_outfits)
  FROM public.students WHERE id=p_student
$$;
CREATE FUNCTION saas_private.mission_ready(p_id text,p_completed text[]) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path = pg_catalog AS $$
  SELECT CASE p_id WHEN 'first-discovery' THEN cardinality(p_completed)>=1
    WHEN 'two-experiments' THEN cardinality(p_completed)>=2
    WHEN 'science-tour' THEN p_completed && ARRAY['motion-acceleration','lever-balance','light-refraction','matter-states']::text[]
      AND 'planet-orbits'=ANY(p_completed) AND 'fractions-area'=ANY(p_completed)
    ELSE false END
$$;

CREATE POLICY schools_staff_read ON public.schools FOR SELECT TO authenticated
  USING (saas_private.caller_role() IN ('teacher','school_admin') AND id=saas_private.caller_school());
CREATE POLICY subscriptions_staff_read ON public.subscriptions FOR SELECT TO authenticated
  USING (saas_private.caller_role() IN ('teacher','school_admin') AND school_id=saas_private.caller_school());
CREATE POLICY profiles_scoped_read ON public.profiles FOR SELECT TO authenticated USING (
  (id=auth.uid() AND saas_private.caller_role() IS NOT NULL) OR
  (saas_private.caller_role()='school_admin' AND school_id=saas_private.caller_school()) OR
  (saas_private.caller_role()='teacher' AND role='student' AND EXISTS
    (SELECT 1 FROM public.students s WHERE s.auth_user_id=profiles.id AND saas_private.owns_class(s.class_id)))
);
-- Row-local checks also authorize INSERT ... RETURNING; a table-lookup STABLE
-- helper cannot see a newly inserted class in the same statement's snapshot.
CREATE POLICY classes_staff_read ON public.classes FOR SELECT TO authenticated USING (
  school_id=saas_private.caller_school()
  AND (saas_private.caller_role()='school_admin' OR (saas_private.caller_role()='teacher' AND teacher_id=auth.uid()))
);
CREATE POLICY classes_staff_insert ON public.classes FOR INSERT TO authenticated WITH CHECK (
  school_id=saas_private.caller_school()
  AND saas_private.valid_teacher(teacher_id,school_id)
  AND (saas_private.caller_role()='school_admin' OR (saas_private.caller_role()='teacher' AND teacher_id=auth.uid()))
);
CREATE POLICY classes_staff_update ON public.classes FOR UPDATE TO authenticated
  USING (saas_private.owns_class(id))
  WITH CHECK (saas_private.owns_class(id));
CREATE POLICY classes_staff_delete ON public.classes FOR DELETE TO authenticated
  USING (saas_private.owns_class(id));
CREATE POLICY students_scoped_read ON public.students FOR SELECT TO authenticated USING (saas_private.reads_student(id));
CREATE POLICY progress_scoped_read ON public.experiment_progress FOR SELECT TO authenticated USING (saas_private.reads_student(student_id));
GRANT SELECT ON public.schools,public.subscriptions,public.profiles,public.classes,public.experiment_progress TO authenticated;
GRANT INSERT (school_id,teacher_id,name,join_code), UPDATE (name,join_code), DELETE ON public.classes TO authenticated;
-- Explicit column grant: SELECT * and SELECT pin_hash must both fail for clients.
GRANT SELECT (id,school_id,class_id,auth_user_id,nickname,stars,hero_id,avatar_id,completed_challenges,claimed_missions,unlocked_outfits,imported,created_at) ON public.students TO authenticated;

CREATE FUNCTION public.student_login(p_class_code text,p_nickname text,p_pin text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE k text; a saas_private.pin_attempts%ROWTYPE; s public.students%ROWTYPE; old_uid uuid; u uuid:=auth.uid();
BEGIN
  IF u IS NULL OR auth.jwt()->>'role' IS DISTINCT FROM 'authenticated' OR auth.jwt()->'is_anonymous' IS DISTINCT FROM 'true'::jsonb THEN
    RETURN jsonb_build_object('ok',false,'error','forbidden');
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id=u AND role<>'student') THEN
    RETURN jsonb_build_object('ok',false,'error','forbidden');
  END IF;
  IF p_class_code IS NULL OR char_length(p_class_code) NOT BETWEEN 4 AND 32
    OR p_nickname IS NULL OR char_length(btrim(p_nickname)) NOT BETWEEN 1 AND 24
    OR p_pin IS NULL OR p_pin !~ '^[0-9]{4}$' THEN
    RETURN jsonb_build_object('ok',false,'error','invalid_credentials');
  END IF;
  -- Hash the normalized account key; no plaintext nickname/PIN in attempts.
  k:=saas_private.account_key(p_class_code,p_nickname);
  INSERT INTO saas_private.pin_attempts(account_key) VALUES(k) ON CONFLICT DO NOTHING;
  SELECT * INTO a FROM saas_private.pin_attempts WHERE account_key=k FOR UPDATE;
  IF a.window_started <= now()-interval '15 minutes' THEN
    UPDATE saas_private.pin_attempts SET failures=0,window_started=now() WHERE account_key=k;
    a.failures:=0;
  END IF;
  IF a.failures>=5 THEN RETURN jsonb_build_object('ok',false,'error','rate_limited'); END IF;
  -- Identity lock serializes concurrent logins from the same Auth UID.
  PERFORM 1 FROM auth.users WHERE id=u FOR UPDATE;
  SELECT st.* INTO s FROM public.students st JOIN public.classes c ON c.id=st.class_id
    WHERE lower(c.join_code)=lower(btrim(p_class_code)) AND lower(st.nickname)=lower(btrim(p_nickname)) FOR UPDATE OF st;
  IF s.id IS NULL OR saas_private.verify_pin(p_pin,s.pin_hash) IS DISTINCT FROM true THEN
    UPDATE saas_private.pin_attempts SET failures=failures+1 WHERE account_key=k RETURNING failures INTO a.failures;
    RETURN jsonb_build_object('ok',false,'error',CASE WHEN a.failures>=5 THEN 'rate_limited' ELSE 'invalid_credentials' END);
  END IF;
  -- Never move an already-bound identity to another child.
  IF EXISTS (SELECT 1 FROM public.students WHERE auth_user_id=u AND id<>s.id) THEN
    RETURN jsonb_build_object('ok',false,'error','forbidden');
  END IF;
  old_uid:=s.auth_user_id;
  UPDATE public.students SET auth_user_id=u WHERE id=s.id;
  INSERT INTO public.profiles(id,school_id,role,display_name) VALUES(u,s.school_id,'student',NULL)
    ON CONFLICT (id) DO UPDATE SET school_id=excluded.school_id,role='student',display_name=NULL
    WHERE profiles.role='student';
  IF old_uid IS NOT NULL AND old_uid<>u THEN
    DELETE FROM public.profiles p WHERE p.id=old_uid AND p.role='student'
      AND NOT EXISTS (SELECT 1 FROM public.students WHERE auth_user_id=old_uid)
      AND NOT EXISTS (SELECT 1 FROM public.classes WHERE teacher_id=old_uid);
  END IF;
  UPDATE saas_private.pin_attempts SET failures=0,window_started=now() WHERE account_key=k;
  RETURN jsonb_build_object('ok',true,'studentId',s.id,'schoolId',s.school_id);
END $$;

CREATE FUNCTION public.saas_session() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE r text:=saas_private.caller_role(); sc uuid:=saas_private.caller_school(); st public.students%ROWTYPE;
BEGIN
  IF r IS NULL THEN RETURN jsonb_build_object('error','session_expired'); END IF;
  IF r='student' THEN SELECT * INTO st FROM public.students WHERE auth_user_id=auth.uid(); END IF;
  RETURN jsonb_build_object('mode','supabase','userId',auth.uid(),'role',r,'schoolId',sc,'studentId',st.id,
    'student',saas_private.student_json(st.id),'canEarn',r='student','imported',COALESCE(st.imported,false));
END $$;

CREATE FUNCTION public.create_student(p_class_id uuid,p_nickname text,p_pin text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE sc uuid; sid uuid;
  -- ECMAScript trim whitespace; controls never remain in the stored nickname.
  nick text:=normalize(btrim(p_nickname,U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF'),NFC);
BEGIN
  IF NOT saas_private.owns_class(p_class_id) THEN RETURN jsonb_build_object('error','forbidden'); END IF;
  IF saas_private.valid_nickname(nick) IS DISTINCT FROM true OR p_pin IS NULL OR p_pin !~ '^[0-9]{4}$' THEN
    RETURN jsonb_build_object('error','invalid_input');
  END IF;
  SELECT school_id INTO sc FROM public.classes WHERE id=p_class_id;
  INSERT INTO public.students(school_id,class_id,nickname,pin_hash)
    VALUES(sc,p_class_id,nick,saas_private.hash_pin(p_pin)) RETURNING id INTO sid;
  RETURN jsonb_build_object('student',saas_private.student_json(sid));
EXCEPTION WHEN unique_violation THEN RETURN jsonb_build_object('error','duplicate_nickname');
END $$;

CREATE FUNCTION public.apply_student_action(p_action jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE s public.students%ROWTYPE; typ text; ident text; h text; sl integer; threshold integer; reward integer;
BEGIN
  IF saas_private.caller_role() IS DISTINCT FROM 'student' THEN RETURN jsonb_build_object('error','forbidden'); END IF;
  -- Keep the child row lock: duplicate concurrent awards remain idempotent.
  SELECT * INTO s FROM public.students WHERE auth_user_id=auth.uid() FOR UPDATE;
  IF s.id IS NULL THEN RETURN jsonb_build_object('error','session_expired'); END IF;
  IF jsonb_typeof(p_action) IS DISTINCT FROM 'object' THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
  typ:=p_action->>'type';
  CASE typ
  WHEN 'completeChallenge' THEN
    ident:=p_action->>'experimentId';
    IF ident IS NULL OR NOT ident=ANY(ARRAY['motion-acceleration','lever-balance','planet-orbits','fractions-area','light-refraction','matter-states']) THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
    IF NOT ident=ANY(s.completed_challenges) THEN
      UPDATE public.students SET completed_challenges=array_append(completed_challenges,ident),stars=least(28,stars+1) WHERE id=s.id;
      INSERT INTO public.experiment_progress(student_id,school_id,experiment_id) VALUES(s.id,s.school_id,ident) ON CONFLICT DO NOTHING;
    END IF;
  WHEN 'claimMission' THEN
    ident:=p_action->>'missionId';
    reward:=CASE ident WHEN 'first-discovery' THEN 2 WHEN 'two-experiments' THEN 3 WHEN 'science-tour' THEN 5 ELSE NULL END;
    IF reward IS NULL THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
    IF NOT ident=ANY(s.claimed_missions) THEN
      IF NOT saas_private.mission_ready(ident,s.completed_challenges) THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
      UPDATE public.students SET claimed_missions=array_append(claimed_missions,ident),stars=least(28,stars+reward) WHERE id=s.id;
    END IF;
  WHEN 'chooseHero' THEN
    h:=p_action->>'heroId';
    IF h IS NULL OR NOT h=ANY(ARRAY['lubna','shihab','nour','suhail','sharara']) THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
    UPDATE public.students SET hero_id=h WHERE id=s.id;
  WHEN 'setAvatar' THEN
    ident:=p_action->>'avatarId';
    IF ident IS NULL OR NOT ident=ANY(ARRAY['rocket','planet','atom','star']) THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
    UPDATE public.students SET avatar_id=ident WHERE id=s.id;
  WHEN 'unlockOutfit' THEN
    h:=p_action->>'heroId';
    IF h IS NULL OR NOT h=ANY(ARRAY['lubna','shihab','nour','suhail','sharara']) OR (p_action->>'slot') IS NULL OR (p_action->>'slot') !~ '^[2-4]$' THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
    sl:=(p_action->>'slot')::int;
    threshold:=CASE sl WHEN 2 THEN 16 WHEN 3 THEN 22 WHEN 4 THEN 28 END;
    IF s.stars<threshold THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
    ident:=h || ':' || sl;
    IF NOT ident=ANY(s.unlocked_outfits) THEN UPDATE public.students SET unlocked_outfits=array_append(unlocked_outfits,ident) WHERE id=s.id; END IF;
  ELSE RETURN jsonb_build_object('error','invalid_input');
  END CASE;
  RETURN jsonb_build_object('student',saas_private.student_json(s.id),'canEarn',true);
END $$;

CREATE FUNCTION public.import_student_progress(p_progress jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE s public.students%ROWTYPE; sc uuid; comp text[]; missions text[]; outfits text[]; hero text; avatar text; total integer; ident text; threshold integer;
BEGIN
  IF saas_private.caller_role() IS DISTINCT FROM 'student' THEN RETURN jsonb_build_object('error','forbidden'); END IF;
  SELECT school_id INTO sc FROM public.students WHERE auth_user_id=auth.uid();
  SELECT * INTO s FROM public.students WHERE auth_user_id=auth.uid() FOR UPDATE;
  IF s.id IS NULL THEN RETURN jsonb_build_object('error','session_expired'); END IF;
  IF s.imported THEN RETURN jsonb_build_object('student',saas_private.student_json(s.id),'canEarn',true,'imported',true); END IF;
  IF jsonb_typeof(p_progress) IS DISTINCT FROM 'object' OR octet_length(p_progress::text)>32768 THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
  IF jsonb_typeof(COALESCE(p_progress->'completedChallenges','[]'))<>'array'
    OR jsonb_typeof(COALESCE(p_progress->'claimedMissions','[]'))<>'array'
    OR jsonb_typeof(COALESCE(p_progress->'unlockedOutfits','[]'))<>'array' THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
  SELECT COALESCE(array_agg(DISTINCT x),'{}') INTO comp FROM jsonb_array_elements_text(COALESCE(p_progress->'completedChallenges','[]')) AS j(x);
  SELECT COALESCE(array_agg(DISTINCT x),'{}') INTO missions FROM jsonb_array_elements_text(COALESCE(p_progress->'claimedMissions','[]')) AS j(x);
  SELECT COALESCE(array_agg(DISTINCT x),'{}') INTO outfits FROM jsonb_array_elements_text(COALESCE(p_progress->'unlockedOutfits','[]')) AS j(x);
  IF cardinality(comp)>6 OR EXISTS (SELECT 1 FROM unnest(comp) x WHERE x IS NULL OR NOT x=ANY(ARRAY['motion-acceleration','lever-balance','planet-orbits','fractions-area','light-refraction','matter-states']))
    OR cardinality(missions)>3 OR EXISTS (SELECT 1 FROM unnest(missions) x WHERE x IS NULL OR NOT x=ANY(ARRAY['first-discovery','two-experiments','science-tour']))
    OR cardinality(outfits)>15 OR EXISTS (SELECT 1 FROM unnest(outfits) x WHERE x IS NULL OR x !~ '^(lubna|shihab|nour|suhail|sharara):[2-4]$') THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
  hero:=p_progress->>'heroId'; avatar:=COALESCE(p_progress->>'avatarId','rocket');
  IF (hero IS NOT NULL AND NOT hero=ANY(ARRAY['lubna','shihab','nour','suhail','sharara'])) OR NOT avatar=ANY(ARRAY['rocket','planet','atom','star']) THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
  IF p_progress ? 'stars' AND (jsonb_typeof(p_progress->'stars')<>'number' OR (p_progress->>'stars') !~ '^[0-9]{1,2}$') THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
  total:=COALESCE((p_progress->>'stars')::integer,12);
  IF total>28 THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
  FOREACH ident IN ARRAY missions LOOP
    IF NOT saas_private.mission_ready(ident,comp) THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
  END LOOP;
  FOREACH ident IN ARRAY outfits LOOP
    threshold:=CASE right(ident,1) WHEN '2' THEN 16 WHEN '3' THEN 22 WHEN '4' THEN 28 END;
    IF total<threshold THEN RETURN jsonb_build_object('error','invalid_input'); END IF;
  END LOOP;
  -- One legacy import is deliberately untrusted but bounded. Merge existing server
  -- awards so importing after a challenge can never reset its one-time marker.
  SELECT COALESCE(array_agg(DISTINCT x),'{}') INTO comp FROM unnest(comp || s.completed_challenges) x;
  SELECT COALESCE(array_agg(DISTINCT x),'{}') INTO missions FROM unnest(missions || s.claimed_missions) x;
  SELECT COALESCE(array_agg(DISTINCT x),'{}') INTO outfits FROM unnest(outfits || s.unlocked_outfits) x;
  UPDATE public.students SET stars=greatest(stars,total),completed_challenges=comp,claimed_missions=missions,
    unlocked_outfits=outfits,hero_id=COALESCE(hero,hero_id),avatar_id=avatar,imported=true WHERE id=s.id;
  INSERT INTO public.experiment_progress(student_id,school_id,experiment_id) SELECT s.id,sc,x FROM unnest(comp) x ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('student',saas_private.student_json(s.id),'canEarn',true,'imported',true);
END $$;

CREATE FUNCTION public.platform_counts() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
BEGIN
  IF saas_private.caller_role() IS DISTINCT FROM 'platform_admin' THEN RETURN jsonb_build_object('error','forbidden'); END IF;
  RETURN jsonb_build_object('schoolCount',(SELECT count(*) FROM public.schools),
    'classCount',(SELECT count(*) FROM public.classes),'studentCount',(SELECT count(*) FROM public.students));
END $$;

-- Revoke default EXECUTE immediately within the same transaction. Private JSON
-- helpers intentionally are not exposed; only non-leaking RLS predicates granted.
DO $$
DECLARE f record;
BEGIN
  FOR f IN SELECT p.oid::regprocedure AS sig FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='saas_private' OR (n.nspname='public' AND p.proname IN
      ('student_login','saas_session','create_student','import_student_progress','apply_student_action','platform_counts')) LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.sig);
  END LOOP;
END $$;
GRANT EXECUTE ON FUNCTION saas_private.caller_role(),saas_private.caller_school(),saas_private.owns_class(uuid),saas_private.reads_student(uuid),saas_private.valid_teacher(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_login(text,text,text),public.saas_session(),public.create_student(uuid,text,text),public.import_student_progress(jsonb),public.apply_student_action(jsonb),public.platform_counts() TO authenticated;
COMMIT;
