import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
URL=os.environ.get('QA_URL','http://localhost:3000'); results=[];errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox'])
 for lang in ['ar','en']:
  for theme in ['light','night']:
   context=b.new_context(reduced_motion='reduce')
   context.add_init_script("localStorage.setItem('misbar:lang:v1',JSON.stringify(%s));localStorage.setItem('misbar:theme:v1',JSON.stringify(%s));localStorage.setItem('misbar:student:v1',JSON.stringify({nickname:'Comet Kid',heroId:'sharara',avatarId:'rocket',stars:12,completedChallenges:[],claimedMissions:[],unlockedOutfits:[]}));"%(json.dumps(lang),json.dumps(theme)))
   page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
   for w,h in [(390,844),(768,1024),(1024,768),(1366,768)]:
    page.set_viewport_size({'width':w,'height':h});page.goto(URL+'/#/catalog');link=page.locator('.app-header__greeting');link.wait_for(state='visible')
    row=page.evaluate("()=>{let r=document.querySelector('.app-header__greeting').getBoundingClientRect();return {visible:r.width>0&&r.height>=44,inside:r.left>=0&&r.right<=innerWidth,pageWidth:document.documentElement.scrollWidth,buttonText:document.querySelector('.mascot-badge__text').textContent,avatar:document.querySelector('.app-header__greeting img').complete,duplicate:document.querySelectorAll('.mascot-strip').length};}")
    row.update(w=w,lang=lang,theme=theme)
    row['pass']=row['visible'] and row['inside'] and row['pageWidth']<=w and row['avatar'] and row['duplicate']==0
    if lang=='ar' and theme=='light' and w in [390,768]:page.screenshot(path=str(ROOT/'screenshots'/f'greeting-ar-light-{w}.png'),full_page=False)
    link.click();page.wait_for_selector('.lobby');row['click']=page.url.endswith('#/lobby');row['pass']=row['pass'] and row['click'];results.append(row)
   context.close()
 b.close()
report={'results':results,'errors':errors,'pass':all(r['pass'] for r in results) and not errors}
ROOT.joinpath('qa-greeting.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('greeting',report['pass'],len(results),errors);assert report['pass']
