import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent
URL='http://127.0.0.1:3000'
ROUTES=['heroes','lobby','vault','ranks','catalog','dashboard','playground/motion-acceleration','playground/lever-balance','playground/planet-orbits','playground/fractions-area','playground/light-refraction','playground/matter-states']
rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox'])
 for lang in ['ar','en']:
  for theme in ['light','night']:
   c=b.new_context(viewport={'width':1366,'height':768},reduced_motion='reduce');c.add_init_script("localStorage.setItem('misbar:lang:v1',JSON.stringify(%s));localStorage.setItem('misbar:theme:v1',JSON.stringify(%s));localStorage.setItem('misbar:student:v1',JSON.stringify({heroId:'nour',nickname:'Comet Kid',avatarId:'rocket',stars:12,completedChallenges:[],claimedMissions:[],unlockedOutfits:[]}));"%(json.dumps(lang),json.dumps(theme)));page=c.new_page()
   for width,height in [(1366,768),(390,844)]:
    page.set_viewport_size({'width':width,'height':height})
    for route in ROUTES:
     page.goto(URL+'/#/'+route);page.reload();page.wait_for_selector('#view-heading');page.evaluate('document.fonts.ready');page.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
     data=page.evaluate('''() => {
      const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width&&r.height&&s.visibility!=='hidden'&&s.display!=='none'&&!el.closest('[aria-hidden=true]')};
      const touch=[];
      for(const el of document.querySelectorAll('button,a,input,select,textarea,[role=button]')){
       if(el.disabled)continue;
       let target=el;
       if(el.matches('input[type=radio]'))target=el.closest('label')||el;
       if(!visible(target)||el.tabIndex<0)continue;
       const r=target.getBoundingClientRect();if(r.width<43.9||r.height<43.9)touch.push({class:target.className,tag:target.tagName,width:r.width,height:r.height,text:target.textContent.trim().slice(0,100)});
      }
      const small=[];
      for(const el of document.querySelectorAll('p,.hero-card__bio,.control__hint')){
       if(!visible(el)||el.classList.contains('visually-hidden'))continue;
       let style=getComputedStyle(el);if(parseFloat(style.fontSize)<16)small.push({class:el.className,tag:el.tagName,size:style.fontSize,text:el.textContent.trim().slice(0,150)});
      }
      const motion=[...document.querySelectorAll('*')].filter(visible).filter(el=>getComputedStyle(el).animationName!=='none'&&getComputedStyle(el).animationDuration.split(',').some(x=>parseFloat(x)>0.01)).map(el=>el.className);
      return {width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,touchFailures:touch,smallBodyText:small,motionFailures:motion};
     }''');data.update(route=route,lang=lang,theme=theme,w=width,h=height);rows.append(data)
   c.close()
 b.close()
report={'rows':rows,'touchFailures':sum(len(x['touchFailures']) for x in rows),'smallTextFailures':sum(len(x['smallBodyText']) for x in rows),'horizontalFailures':sum(x['width']>x['w'] for x in rows),'motionFailures':sum(len(x['motionFailures']) for x in rows)}
(OUT/'usability-raw.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print({k:v for k,v in report.items() if k!='rows'})
for key in ['touchFailures','smallBodyText']:
 unique={json.dumps(v,ensure_ascii=False,sort_keys=True) for row in rows for v in row[key]}
 print(key,'unique',len(unique))
 for v in sorted(unique):print(v)
