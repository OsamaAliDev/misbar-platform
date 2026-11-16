import json,os,re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent;URL=os.environ.get('QA_URL','http://localhost:3000');RESULTS=[];ERRORS=[];WARNINGS=[]
flow=json.loads((ROOT/'qa-school-flow.json').read_text()) if (ROOT/'qa-school-flow.json').exists() else {}
class_id=flow.get('classId')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox'])
 for lang in ['ar','en']:
  for theme in ['light','night']:
   c=b.new_context(reduced_motion='reduce');c.add_init_script("if(!localStorage.getItem('misbar:lang:v1'))localStorage.setItem('misbar:lang:v1',JSON.stringify(%s));if(!localStorage.getItem('misbar:theme:v1'))localStorage.setItem('misbar:theme:v1',JSON.stringify(%s));"%(json.dumps(lang),json.dumps(theme)))
   page=c.new_page();page.set_default_timeout(10000);page.on('pageerror',lambda e:ERRORS.append(str(e)));page.on('console',lambda m:ERRORS.append(m.text) if m.type=='error' else WARNINGS.append(m.text) if m.type=='warning' else None)
   for w,h in [(1366,768),(1920,1080),(768,1024),(390,844),(320,740)]:
    page.set_viewport_size({'width':w,'height':h})
    for route in ['teacher-login','student-login']:
     page.goto(URL+'/#/'+route);page.wait_for_selector('.saas-mock');page.wait_for_timeout(80)
     data=page.evaluate("()=>{const d=document.documentElement;return{width:d.scrollWidth,height:d.scrollHeight,lang:d.lang,dir:d.dir,theme:d.dataset.theme,text:document.querySelector('main').innerText,targets:[...document.querySelectorAll('main button,main input')].filter(e=>e.offsetWidth).map(e=>e.getBoundingClientRect().height)}}")
     ok=data['width']<=w and (w<1024 or data['height']<=h+1) and data['lang']==lang and data['theme']==theme and min(data['targets'])>=44 and not re.search(r'\bsaas\.[a-z]',data['text'])
     RESULTS.append({'route':route,'w':w,'h':h,'lang':lang,'theme':theme,'pass':ok,'geometry':{k:v for k,v in data.items() if k!='text'}})
     if w==390 and theme=='night' and route=='student-login':page.screenshot(path=str(ROOT/'screenshots'/f'student-login-{lang}-night-390.png'))
   # Authenticate through actual mock Auth for staff screens, not intercepted fixtures.
   page.goto(URL+'/#/teacher-login');page.wait_for_selector('#staff-login-email');page.locator('#staff-login-email').fill('teacher@misbar.test');page.locator('#staff-login-password').fill('MockTeacher!2026');page.locator('form button[type=submit]').click();page.wait_for_selector('#class-name')
   for w,h in [(1366,768),(1920,1080),(768,1024),(390,844),(320,740)]:
    page.set_viewport_size({'width':w,'height':h})
    for route in ['classes']+(['class-roster/'+class_id] if class_id else []):
     page.goto(URL+'/#/'+route);page.wait_for_selector('#class-name' if route=='classes' else '#enrollment-nickname');page.wait_for_timeout(120)
     data=page.evaluate("()=>{const d=document.documentElement;return{width:d.scrollWidth,height:d.scrollHeight,lang:d.lang,dir:d.dir,theme:d.dataset.theme,text:document.querySelector('main').innerText,heading:document.querySelector('#view-heading').textContent,targets:[...document.querySelectorAll('main button,main input')].filter(e=>e.offsetWidth).map(e=>e.getBoundingClientRect().height)}}")
     ok=data['width']<=w and (w<1024 or data['height']<=h+1) and min(data['targets'])>=44 and data['lang']==lang and data['theme']==theme and not re.search(r'\b(?:saas|game)\.[a-z]',data['text'])
     RESULTS.append({'route':route,'w':w,'h':h,'lang':lang,'theme':theme,'pass':ok,'geometry':{k:v for k,v in data.items() if k!='text'}})
     if w==1366 and theme=='night' and lang=='ar' and route.startswith('class-roster/'):page.screenshot(path=str(ROOT/'screenshots/roster-ar-night-1366.png'))
   c.close()
 b.close()
report={'mode':'mock','results':RESULTS,'errors':ERRORS,'warnings':WARNINGS,'pass':all(x['pass'] for x in RESULTS) and not ERRORS and not WARNINGS,'classRosterIncluded':bool(class_id)}
ROOT.joinpath('qa-school-matrix.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('school matrix',len(RESULTS),'pass',report['pass'],'errors',ERRORS,'warnings',WARNINGS)
for r in RESULTS:
 if not r['pass']:print('FAILED',r)
assert report['pass'] and class_id
