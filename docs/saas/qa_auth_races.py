import os,json,re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent;URL=os.environ.get('QA_URL','http://localhost:3000');EVENTS=[]
GUEST={'nickname':'Guest Alias','avatarId':'rocket','stars':15,'heroId':'shihab','completedChallenges':['fractions-area'],'claimedMissions':['first-discovery'],'unlockedOutfits':[]}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1366,'height':768},reduced_motion='reduce');page=c.new_page();page.set_default_timeout(10000)
 def req(path,body=None,token=None,method=None):
  r=c.request.fetch(URL+'/api/saas'+path,method=method or ('POST' if body is not None else 'GET'),data=body,headers={'Authorization':'Bearer '+token} if token else {})
  assert r.ok,(r.status,path,r.text());return r.json()
 def auth(email='teacher@misbar.test',password='MockTeacher!2026'):return req('/staff/login',{'email':email,'password':password})['accessToken']
 def credential():return page.evaluate("JSON.parse(sessionStorage.getItem('misbar:saas:session:v1')||'null')?.accessToken")
 def snapshot():return page.evaluate("JSON.parse(localStorage.getItem('misbar:student:v1'))")
 def initialize(token):
  page.add_init_script("if(!sessionStorage.getItem('misbar:qa:initialized')){sessionStorage.setItem('misbar:saas:session:v1',JSON.stringify({accessToken:%s}));}sessionStorage.setItem('misbar:qa:initialized','true');localStorage.setItem('misbar:lang:v1',JSON.stringify('en'));if(!localStorage.getItem('misbar:student:v1'))localStorage.setItem('misbar:student:v1',JSON.stringify(%s));"%(json.dumps(token),json.dumps(GUEST)))
 def staff_login():
  page.wait_for_selector('#staff-login-email');page.locator('#staff-login-email').fill('other@misbar.test');page.locator('#staff-login-password').fill('MockOther!2026');page.locator('form button[type=submit]').click();page.wait_for_selector('#class-name')
 def record(name):EVENTS.append({'name':name,'pass':True});print(name,flush=True)
 try:
  old=auth();initialize(old);held=[]
  def hold_restore(route):
   if route.request.headers.get('authorization')=='Bearer '+old:held.append(route)
   else:route.continue_()
  page.route('**/api/saas/session',hold_restore)
  page.goto(URL+'/#/heroes');page.wait_for_selector('input[name=hero]');page.wait_for_timeout(150)
  assert held and page.locator('input[name=hero]').first.is_disabled();assert snapshot()==GUEST
  record('stored credential restoration blocks guest mutations and guest-key writes')
  page.evaluate("location.hash='#/teacher-login'");page.wait_for_selector('.saas-header');page.locator('.saas-header button').filter(has_text='Sign out').click();page.wait_for_selector('#staff-login-email');assert not credential();staff_login();new=credential();assert new and new!=old
  for route in list(held):
   try:route.fulfill(status=401,json={'error':'session_expired'})
   except Exception:pass
  page.wait_for_timeout(120);assert credential()==new and page.url.endswith('#/classes');assert snapshot()==GUEST
  record('late old restoration401 cannot clear a newer login')
  page.unroute('**/api/saas/session',hold_restore)
  delayed=[]
  def hold_logout(route):delayed.append(route)
  page.route('**/api/saas/logout',hold_logout)
  page.evaluate("location.hash='#/teacher-login'");page.wait_for_selector('.saas-login-card strong');page.locator('.saas-header button').filter(has_text='Sign out').click();page.wait_for_selector('#staff-login-email');assert not credential();staff_login();newer=credential();assert newer and newer!=new
  for route in list(delayed):route.fulfill(status=200,json={'success':True})
  page.wait_for_timeout(150);assert credential()==newer and page.url.endswith('#/classes')
  record('logout clears immediately and delayed revocation cannot clear or reroute a newer login')
  page.unroute('**/api/saas/logout',hold_logout)
  # New independent page so the prior init script cannot seed a retired credential on reload.
  page.close();c.close();c=b.new_context(viewport={'width':1366,'height':768},reduced_motion='reduce');page=c.new_page();page.set_default_timeout(10000)
  staff_token=auth();cl=req('/classes',{'name':'Race regression'},staff_token)['class'];nickname='Race Alias '+cl['id'][:5];req('/classes/'+cl['id']+'/students',{'nickname':nickname,'pin':'4321'},staff_token)
  student_token=req('/student/login',{'classCode':cl['joinCode'],'nickname':nickname,'pin':'4321'})['accessToken'];req('/student/import',{'progress':GUEST},student_token)
  initialize(student_token);held_actions=[]
  def hold_action(route):held_actions.append(route)
  page.route('**/api/saas/student/action',hold_action);page.goto(URL+'/#/heroes');page.wait_for_selector('input[name=hero]:not(:disabled)');page.locator('input[value=lubna]').click(force=True);page.wait_for_timeout(100);assert held_actions
  page.evaluate("location.hash='#/student-login'");page.wait_for_selector('.saas-login-card strong');page.locator('.saas-header button').filter(has_text='Sign out').click();page.wait_for_selector('#staff-login-email')
  page.evaluate("location.hash='#/student-login'");page.wait_for_selector('#student-login-code');page.locator('#student-login-code').fill(cl['joinCode']);page.locator('#student-login-nickname').fill(nickname);page.locator('#student-login-pin').fill('4321');page.locator('form button[type=submit]').click();page.wait_for_selector('.catalog');new_student_token=credential();assert new_student_token!=student_token
  stale={**GUEST,'id':req('/session',token=new_student_token)['student']['id'],'heroId':'lubna','stars':28}
  for route in held_actions:
   try:route.fulfill(status=200,json={'student':stale,'canEarn':True})
   except Exception:pass
  page.wait_for_timeout(150);page.evaluate("location.hash='#/heroes'");page.wait_for_selector('input[name=hero]:not(:disabled)');assert page.locator('input[value=shihab]').is_checked();assert snapshot()==GUEST
  record('late old school action cannot hydrate a re-login with the same mock userId')
  report={'pass':True,'mode':'mock with deliberate delayed-response fixtures','events':EVENTS}
 except Exception as e:
  page.screenshot(path=str(ROOT/'screenshots/auth-race-failure.png'));report={'pass':False,'error':str(e),'events':EVENTS};raise
 finally:
  ROOT.joinpath('qa-auth-races.json').write_text(json.dumps(report,indent=2));b.close()
 print('auth lifecycle race checks PASS',len(EVENTS))
