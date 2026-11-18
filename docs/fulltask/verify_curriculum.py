import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent;ROOT=Path('/home/ubuntu/misbar-full-main-ddIQSk');DATA=json.loads((ROOT/'src/data/curriculum-evidence.json').read_text());URL='http://127.0.0.1:3000';ROWS=[];ERRORS=[];BAD=[];SHOTS=OUT/'screenshots/C-AFTER';SHOTS.mkdir(parents=True,exist_ok=True)
GRADES=['primary-4','primary-5','primary-6','prep-1','prep-2','prep-3']
BASE={'heroId':'sharara','nickname':'Comet Kid','avatarId':'rocket','stars':21,'completedChallenges':['fractions-area'],'claimedMissions':['mission-first-challenge'],'unlockedOutfits':['sharara:outfit2']}
def profile(page):return page.evaluate("JSON.parse(localStorage.getItem('misbar:student:v1'))")
def visibleIDs(page):return page.locator('.experiment-card__title').evaluate_all("els=>els.map(el=>el.id.replace('experiment-title-',''))")
def free(page):
 button=page.locator('[data-action=free-experiments]')
 if button.count():button.click()
 page.wait_for_selector('[data-grade-id=primary-4]')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox'])
 for lang in ['ar','en']:
  for theme in ['light','night']:
   for width,height in [(1366,768),(390,844)]:
    c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');c.add_init_script("localStorage.setItem('misbar:lang:v1',JSON.stringify(%s));localStorage.setItem('misbar:theme:v1',JSON.stringify(%s));localStorage.setItem('misbar:student:v1',JSON.stringify(%s));"%(json.dumps(lang),json.dumps(theme),json.dumps(BASE)));page=c.new_page();page.on('pageerror',lambda e:ERRORS.append(str(e)));page.on('console',lambda m:ERRORS.append(m.text) if m.type=='error' else None);page.on('response',lambda r:BAD.append({'url':r.url,'status':r.status}) if r.status>=400 else None);page.goto(URL+'/#/');page.wait_for_selector('[data-grade-id=primary-4]');initial=profile(page);assert len(visibleIDs(page))==6
    for grade in GRADES:
     for subject in ['science','math']:
      free(page);page.locator('[data-grade-id='+grade+']').click();page.locator('[data-subject-id='+subject+']').click();page.evaluate('document.fonts.ready')
      term_buttons=page.locator('[data-term-id]')
      terms=term_buttons.evaluate_all('els=>els.map(el=>Number(el.dataset.termId))') or [None]
      for idx,term in enumerate(terms):
       if idx:page.locator('.curriculum-browser__actions button').first.click()
       if term is not None:page.locator('[data-term-id="'+str(term)+'"]').click()
       page.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
       expected={m['experimentId'] for m in DATA['mappings'] if m['gradeId']==grade and m['subject']==subject and (term is None or not m['terms'] or term in m['terms'])};actual=set(visibleIDs(page));assert actual==expected,(grade,subject,term,expected,actual)
       assert profile(page)==initial;assert page.locator('html').get_attribute('data-theme')==theme
       assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
       if not expected:assert page.locator('.curriculum-browser__empty').is_visible()
       visible=page.locator('body').inner_text();assert not (lang=='en' and re.search('[\u0600-\u06ff]',visible.replace('العربية',''))),visible
       ROWS.append({'grade':grade,'subject':subject,'term':term,'lang':lang,'theme':theme,'w':width,'expected':sorted(expected),'actual':sorted(actual),'progressUnchanged':True,'noHorizontalScroll':True,'pass':True})
      if grade=='primary-4' and subject=='science':page.screenshot(path=str(SHOTS/f'C-AFTER-grade-subject-{lang}-{theme}-{width}px.png'),full_page=True)
      if visibleIDs(page):
       first=visibleIDs(page)[0];page.locator('.experiment-card').first.get_by_role('button').click();page.wait_for_selector('.sim-svg');assert profile(page)==initial;page.locator('.playground-header__back').click();page.wait_for_selector('[data-testid=curriculum-browser]');assert set(visibleIDs(page))==expected;page.reload();page.wait_for_selector('[data-testid=curriculum-browser]');assert set(visibleIDs(page))==expected
      free(page);assert len(visibleIDs(page))==6;assert profile(page)==initial
    page.locator('[data-grade-id=prep-3]').click();page.locator('[data-subject-id=math]').click()
    buttons=page.locator('[data-term-id]')
    if buttons.count():buttons.first.click()
    prev=set(visibleIDs(page));page.locator('#lang-toggle').click();page.wait_for_function("document.documentElement.lang!=="+json.dumps(lang));page.wait_for_selector('[data-testid=curriculum-browser]');assert set(visibleIDs(page))==prev;assert profile(page)==initial;assert page.locator('html').get_attribute('data-theme')==theme
    c.close()
 b.close()
report={'cases':ROWS,'errors':ERRORS,'bad':BAD,'pass':not ERRORS and not BAD};(OUT/'curriculum-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Curriculum states',len(ROWS),'PASS',report['pass']);assert report['pass']
