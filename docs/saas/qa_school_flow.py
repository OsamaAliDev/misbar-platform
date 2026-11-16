import json,os,time,re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
URL=os.environ.get('QA_URL','http://localhost:3000');RUN=str(int(time.time()))[-7:]
events=[];errors=[];warnings=[]

with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox'])
 c=b.new_context(viewport={'width':1366,'height':768},reduced_motion='reduce')
 c.add_init_script("if(!localStorage.getItem('misbar:lang:v1'))localStorage.setItem('misbar:lang:v1',JSON.stringify('en'))")
 page=c.new_page();page.set_default_timeout(12000)
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('console',lambda m:errors.append(m.text) if m.type=='error' else warnings.append(m.text) if m.type=='warning' else None)
 def nav(route):
  page.goto(URL+'/#/'+route);page.wait_for_selector('#view-heading');page.wait_for_timeout(80);page.evaluate('document.fonts.ready.then(()=>true)')
 def token():return page.evaluate("JSON.parse(sessionStorage.getItem('misbar:saas:session:v1')||'null')?.accessToken")
 def api(path,method='GET',body=None):
  r=c.request.fetch(URL+'/api/saas'+path,method=method,headers={'Authorization':'Bearer '+token()},data=body)
  return r.status,r.json()
 def session():
  status,j=api('/session');assert status==200,j;return j
 def guest():return page.evaluate("JSON.parse(localStorage.getItem('misbar:student:v1'))")
 def record(name,details=None):events.append({'name':name,'details':details});print(name,details,flush=True)
 def staff(email='teacher@misbar.test',password='MockTeacher!2026'):
  nav('teacher-login');page.wait_for_selector('#staff-login-email');page.locator('#staff-login-email').fill(email);page.locator('#staff-login-password').fill(password);page.locator('form button[type=submit]').click();page.wait_for_url(re.compile(r'#/(classes|platform-admin)$'))
 def logout():
  nav('teacher-login');page.wait_for_selector('.saas-login-card strong')
  page.locator('.saas-header button').filter(has_text='Sign out').click()
  page.wait_for_function("sessionStorage.getItem('misbar:saas:session:v1')===null")
  page.wait_for_selector('#staff-login-email')
 def student_login(code,nick):
  nav('student-login');page.wait_for_selector('#student-login-code');page.locator('#student-login-code').fill(code);page.locator('#student-login-nickname').fill(nick);page.locator('#student-login-pin').fill('٤٣٢١');page.locator('form button[type=submit]').click();page.wait_for_url(re.compile(r'#/(catalog|heroes|lobby)?$'));page.wait_for_timeout(250)
 def set_slider(label,value):
  page.get_by_role('slider',name=re.compile(label)).evaluate("(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(v));el.dispatchEvent(new Event('input',{bubbles:true}));}",value)
 try:
  nav('teacher-login');page.wait_for_selector('.saas-mock');page.screenshot(path=str(ROOT/'screenshots/section-staff-login.png'))
  nav('student-login');page.wait_for_selector('#student-login-code');page.screenshot(path=str(ROOT/'screenshots/section-student-login.png'))
  # Guest earns actual challenge/mission rewards, never seeded completion lists.
  nav('catalog');page.wait_for_selector('.hero-select');page.locator('input[value=sharara]').check(force=True);page.locator('.hero-select__continue').click();page.wait_for_selector('.lobby')
  nav('playground/fractions-area');set_slider('Denominator',8);set_slider('Numerator',6);page.locator('.challenge-bar__btn--claim').wait_for();page.locator('.challenge-bar__btn--claim').click();page.locator('.challenge-bar__btn--done').wait_for()
  nav('lobby');page.locator('.mission-card__claim').first.click();page.wait_for_function("JSON.parse(localStorage.getItem('misbar:student:v1')).stars===15")
  original=guest();assert original['stars']==15;record('guest earned and retained15',{'stars':15})
  staff();page.locator('#class-name').fill('Orbit Lab '+RUN);page.locator('form button[type=submit]').click();page.locator('.saas-class-row').filter(has_text=RUN).wait_for()
  status,j=api('/classes');assert status==200;cl=next(x for x in j['classes'] if RUN in x['name']);code=cl['joinCode'];assert code
  page.screenshot(path=str(ROOT/'screenshots/section-classes.png'));record('teacher class created with usable join code',{'classId':cl['id'],'joinCode':code})
  page.locator('.saas-class-row').filter(has_text=RUN).locator('button').first.click();page.wait_for_selector('#enrollment-nickname')
  nick='Comet '+RUN;page.locator('#enrollment-nickname').fill(nick);page.locator('#enrollment-pin').fill('4321');page.locator('form button[type=submit]').click();page.locator('.saas-roster-table tbody tr').filter(has_text=nick).wait_for();assert page.locator('#enrollment-pin').input_value()==''
  record('student enrolled with nickname and server PIN',{'nickname':nick});logout();assert guest()==original
  student_login(code,nick)
  for _ in range(30):
   s=session()
   if s.get('imported'):break
   page.wait_for_timeout(100)
  assert s['imported'] and s['student']['stars']==15,s;assert guest()==original
  record('one-time import preserves guest',{'stars':15,'imported':True})
  # School reward changes canonical server progress, not the guest snapshot.
  nav('playground/lever-balance')
  for label,v in [('Right weight mass',4),('Right weight distance',1),('Left weight mass',2),('Left weight distance',2)]:set_slider(label,v)
  page.wait_for_timeout(2800);page.locator('.challenge-bar__btn--claim').click();page.locator('.challenge-bar__btn--done').wait_for();assert session()['student']['stars']==16
  nav('lobby');page.locator('.mission-card__claim').first.click();page.wait_for_timeout(250);assert session()['student']['stars']==19;assert guest()==original;page.screenshot(path=str(ROOT/'screenshots/section-storage.png'))
  nav('vault');page.locator('.outfit-slot__unlock').first.click();page.wait_for_timeout(250);assert session()['student']['stars']==19 and session()['student']['unlockedOutfits'];record('canonical school reward/rank/unlock without spending',{'stars':19,'guestStars':15})
  logout();staff();nav('class-roster/'+cl['id']);page.locator('.saas-roster-table tbody tr').filter(has_text=nick).wait_for();assert '19' in page.locator('.saas-roster-table tbody tr').filter(has_text=nick).inner_text();page.screenshot(path=str(ROOT/'screenshots/section-roster.png'));record('teacher roster reflects server stars and rank',{'stars':19})
  logout();student_login(code,nick);assert session()['student']['stars']==19;assert guest()==original;record('re-login does not import again',{'stars':19})
  record('foundation-only scope: subscription gate and platform management deferred')
  report={'pass':not errors and not warnings,'mode':'mock','events':events,'errors':errors,'warnings':warnings,'classId':cl['id'],'nickname':nick,'joinCode':code}
 except Exception as e:
  page.screenshot(path=str(ROOT/'screenshots/flow-failure.png'));report={'pass':False,'error':str(e),'events':events,'errors':errors,'warnings':warnings};raise
 finally:
  ROOT.joinpath('qa-school-flow.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));b.close()
 assert report['pass'],report
 print('school flow PASS',len(events),flush=True)
