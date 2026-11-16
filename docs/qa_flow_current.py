import json, os, re
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
URL=os.environ.get('QA_URL','http://localhost:3000')
events=[]; errors=[];bad=[]
def profile(page):return page.evaluate("JSON.parse(localStorage.getItem('misbar:student:v1'))")
def slider(page,name,value):
    el=page.get_by_role('slider',name=re.compile(name,re.I))
    el.evaluate("(el,value)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));}",value)
def record(page,label):
    state=profile(page);events.append({'step':label,'student':state,'route':page.url,'lang':page.locator('html').get_attribute('lang'),'theme':page.locator('html').get_attribute('data-theme')});print(label,state['stars'],flush=True)
def visit(page,route):page.goto(URL+'/#/'+route);page.wait_for_selector('#view-heading')
def claim(page):
    page.locator('.challenge-bar__btn--claim').wait_for(timeout=20000)
    before=profile(page)['stars'];page.locator('.challenge-bar__btn--claim').click()
    page.locator('.challenge-bar__btn--done').wait_for();assert profile(page)['stars']==before+1
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1366,'height':768})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
    page.on('response',lambda r:bad.append((r.status,r.url)) if r.status>=400 else None)
    page.goto(URL);page.wait_for_selector('.hero-select')
    assert page.url.endswith('#/heroes') and profile(page)['stars']==12
    assert page.locator('html').get_attribute('data-theme')=='night'
    # Native choice then actual continue action.
    page.locator('input[type=radio][value=sharara]').check(force=True)
    page.locator('.hero-select__continue').click()
    page.wait_for_selector('.lobby');assert profile(page)['heroId']=='sharara'
    record(page,'first visit and hero selection')
    page.locator('#lang-toggle').focus();page.keyboard.press('Enter')
    page.wait_for_function("document.documentElement.lang==='en'")
    page.wait_for_function("document.activeElement.id==='lang-toggle'")
    assert page.url.endswith('#/lobby') and profile(page)['heroId']=='sharara'
    page.locator('.lobby__enter').click();page.wait_for_selector('.catalog')
    assert page.locator('html').get_attribute('data-theme')=='light'
    page.locator('#theme-toggle').click()
    page.wait_for_function("document.documentElement.dataset.theme==='night'")
    record(page,'language keyboard refocus and default themes')
    # Fractions — choose 6/8 = 75%, award once.
    visit(page,'playground/fractions-area')
    assert page.locator('html').get_attribute('data-theme')=='night'
    slider(page,'Denominator',8);slider(page,'Numerator',6);claim(page)
    record(page,'fraction challenge earned')
    page.reload();page.wait_for_selector('.challenge-bar__btn--done')
    assert profile(page)['stars']==13
    visit(page,'lobby');page.locator('.mission-card__claim').first.click()
    assert profile(page)['stars']==15
    assert 'Inventor' in page.locator('.lobby__rank-name').inner_text()
    record(page,'first mission and rank change')
    # Lever — different masses, equal torques, allow beam to settle.
    visit(page,'playground/lever-balance')
    slider(page,'Right.*mass|mass.*right',4);slider(page,'Right.*distance|distance.*right',1)
    slider(page,'Left.*mass|mass.*left',2);slider(page,'Left.*distance|distance.*left',2)
    page.wait_for_timeout(2800)  # Allow the original beam settling condition to stabilize.
    claim(page);record(page,'lever challenge earned')
    visit(page,'lobby');page.locator('.mission-card__claim').first.click()
    assert profile(page)['stars']==19
    assert 'Lab Captain' in page.locator('.lobby__rank-name').inner_text()
    record(page,'second mission and rank change')
    visit(page,'vault');page.locator('.outfit-slot__unlock').first.click()
    assert profile(page)['stars']==19 and len(profile(page)['unlockedOutfits'])==1
    record(page,'vault unlock without spending')
    # Every header language switch: keep route, hero and earned progress.
    saved=profile(page)
    for route in ['heroes','lobby','vault','ranks','catalog','dashboard','playground/fractions-area']:
      visit(page,route)
      page.locator('#lang-toggle').click();page.wait_for_function("document.documentElement.lang==='ar'")
      page.wait_for_function("document.activeElement.id==='lang-toggle'")
      assert profile(page)==saved
      page.locator('#lang-toggle').click();page.wait_for_function("document.documentElement.lang==='en'")
      page.wait_for_function("document.activeElement.id==='lang-toggle'")
      assert profile(page)==saved
      page.locator('#theme-toggle').click();page.wait_for_function("document.documentElement.dataset.theme==='light'")
      page.locator('#theme-toggle').click();page.wait_for_function("document.documentElement.dataset.theme==='night'")
    page.reload();page.wait_for_selector('.sim-svg')
    assert profile(page)==saved and page.locator('html').get_attribute('lang')=='en'
    assert page.locator('html').get_attribute('data-theme')=='night'
    assert page.locator('.challenge-bar__btn--done').count()==1
    record(page,'all header switches and persistent reload')
    # Direct lab defaults cream with no stored explicit choice.
    other=browser.new_page();visit(other,'playground/light-refraction')
    assert other.locator('html').get_attribute('data-theme')=='light';other.close()
    browser.close()
report={'pass':not errors and not bad,'events':events,'errors':errors,'bad_requests':bad,'earned_via_ui':True,'reward_seeding':False}
ROOT.joinpath('qa-flow-current.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('flow PASS',report['pass'],errors,bad)
assert report['pass']
