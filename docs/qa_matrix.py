import json, os, re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
URL=os.environ.get('QA_URL','http://localhost:3000')
IDS=['motion-acceleration','lever-balance','planet-orbits','fractions-area','light-refraction','matter-states']
ROUTES=['heroes','lobby','vault','ranks','catalog','dashboard']+['playground/'+id for id in IDS]
results=[];errors=[];warnings=[];bad_requests=[]
SHOTS=ROOT/'screenshots';SHOTS.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
    for lang in ['ar','en']:
      for theme in ['light','night']:
        context=browser.new_context(viewport={'width':1366,'height':768},reduced_motion='reduce')
        context.add_init_script("localStorage.setItem('misbar:lang:v1',JSON.stringify(%s));localStorage.setItem('misbar:theme:v1',JSON.stringify(%s));if(!localStorage.getItem('misbar:student:v1'))localStorage.setItem('misbar:student:v1',JSON.stringify({nickname:'بطل الفضاء',avatarId:'rocket',stars:12,heroId:'sharara',completedChallenges:[],claimedMissions:[],unlockedOutfits:[]}));"%(json.dumps(lang),json.dumps(theme)))
        page=context.new_page()
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('console',lambda m:errors.append(m.text) if m.type=='error' else warnings.append(m.text) if m.type=='warning' else None)
        page.on('response',lambda r:bad_requests.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
        for w,h in [(1366,768),(1536,864),(1920,1080),(390,844)]:
          page.set_viewport_size({'width':w,'height':h})
          for route in ROUTES:
            page.goto(URL+'/#/'+route)
            page.wait_for_selector('#view-heading')
            page.wait_for_timeout(120)
            data=page.evaluate('''() => {
              const d=document.documentElement;
              let rect=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
              return {width:d.scrollWidth,height:d.scrollHeight,lang:d.lang,dir:d.dir,theme:d.dataset.theme,svg:rect('.sim-svg'),challenge:rect('.challenge-bar'),workspace:rect('.sim-workspace'),heading:document.querySelector('#view-heading').textContent.trim(),meta:document.querySelector('meta[name="theme-color"]').content,bg:getComputedStyle(d).getPropertyValue('--bg-canvas').trim(),hero:rect('.hero-stage__img'),text:document.body.innerText};
            }''')
            checks={
              'horizontal':data['width']<=w,
              'language':data['lang']==lang and data['dir']==('rtl' if lang=='ar' else 'ltr'),
              'theme':data['theme']==theme and data['meta'].lower()==data['bg'].lower(),
              'keys':not re.search(r'\b(?:catalog|lab|app|common|game)\.[a-z]',data['text']),
              'english':not (lang=='en' and re.search('[\u0600-\u06ff]',data['text'].replace('العربية',''))),
            }
            if route.startswith('playground/'):
              checks['stage']=bool(data['svg']) and data['svg']['height']>150 and data['svg']['bottom']<=h+1
              checks['order']=data['challenge']['bottom']<=data['workspace']['top']+1
            if w>=1024 and route not in ['catalog','dashboard']:checks['desktopNoScroll']=data['height']<=h+1
            if w==390 and data['hero']:checks['mobileHero']=data['hero']['height']<=h*.4+1
            row={'route':route,'w':w,'h':h,'lang':lang,'theme':theme,'checks':checks,'pass':all(checks.values()),'geometry':{k:v for k,v in data.items() if k!='text'}}
            results.append(row)
            if w==1366 and h==768 and ((lang=='ar' and theme=='night' and route not in ['catalog','dashboard']) or route=='catalog' or (lang=='en' and theme=='night' and route=='lobby')):
              page.screenshot(path=str(SHOTS/(route.replace('/','-')+'-'+lang+'-'+theme+'-1366.png')),full_page=True)
            if w==390 and route=='catalog' and theme=='light':page.screenshot(path=str(SHOTS/('catalog-'+lang+'-light-390.png')),full_page=True)
            if route.startswith('playground/') and w==1366:
              page.locator('.playground-header__help').click()
              page.wait_for_selector('dialog[open]')
              assert page.locator('.help-modal__title').inner_text().strip()
              page.keyboard.press('Escape')
              page.wait_for_selector('dialog[open]',state='hidden')
        context.close()
    browser.close()
report={'results':results,'errors':errors,'warnings':warnings,'bad_requests':bad_requests,'pass':all(r['pass'] for r in results) and not errors and not bad_requests}
ROOT.joinpath('qa-matrix.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
failed=[r for r in results if not r['pass']]
print('matrix',len(results),'failed',len(failed),'errors',len(errors),'bad requests',len(bad_requests),'warnings',len(warnings))
for r in failed:print(r['route'],r['w'],r['lang'],r['theme'],{k:v for k,v in r['checks'].items() if not v},r['geometry']['height'], r['geometry'].get('svg'))
print('errors',errors[:10]);print('bad requests',bad_requests[:10]);print('warnings',warnings[:10])
assert report['pass']
