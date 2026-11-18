"""Focused hero-select QA only. New browser contexts; no shared MCP browser/data reset."""
import json
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path('/home/ubuntu/misbar-full-main-ddIQSk')
OUT = Path('/home/ubuntu/misbar-fulltask-20261118')
URL = 'http://127.0.0.1:3000'
IDS = ['lubna', 'shihab', 'nour', 'suhail', 'sharara']
VIEWPORTS = [(1366, 768), (1536, 864), (1920, 1080), (390, 844), (390, 768)]
MEASURE = """() => {
  const rect = e => {const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
  const visible = e => {if(!e || e.closest('.visually-hidden'))return false;const s=getComputedStyle(e),r=rect(e);return s.display!=='none'&&s.visibility!=='hidden'&&r.width>1&&r.height>1;};
  const d=document.documentElement;
  const text=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()) {const node=walker.currentNode,el=node.parentElement;if(!node.textContent.trim() || !visible(el) || el.closest('.icon,script,style'))continue;text.push({text:node.textContent.trim(),font:parseFloat(getComputedStyle(el).fontSize),rect:rect(el)});}
  const cards=[...document.querySelectorAll('.hero-card')].map(el=>{
    const input=el.querySelector('input'),img=el.querySelector('img'),name=el.querySelector('.hero-card__name'),bio=el.querySelector('.hero-card__bio'),title=el.querySelector('.hero-card__title');
    const featured=el.closest('.is-featured')!==null;
    const cardRect=rect(el),bioRect=rect(bio),titleRect=rect(title);
    return {id:input.value,checked:input.checked,featured,card:cardRect,name:rect(name),stage:rect(el.querySelector('.hero-card__stage')),image:rect(img),imageLoaded:img.complete&&img.naturalWidth>0,loading:img.loading,nameVisible:visible(name),bioVisible:visible(bio),titleVisible:visible(title),bio:bio.textContent.trim(),title:title.textContent.trim(),describedBy:input.getAttribute('aria-describedby'),detailsFit:!featured||(bioRect.bottom<=cardRect.bottom+1&&bioRect.x>=cardRect.x-1&&bioRect.right<=cardRect.right+1&&titleRect.bottom<=cardRect.bottom+1),animation:getComputedStyle(img).animationName};
  });
  const targets=[...document.querySelectorAll('button,a,.hero-card')].filter(visible).map(e=>({tag:e.tagName,text:e.innerText.trim(),rect:rect(e)}));
  return {viewport:{width:innerWidth,height:innerHeight},scroll:{width:d.scrollWidth,height:d.scrollHeight},lang:d.lang,dir:d.dir,theme:d.dataset.theme,selected:cards.filter(c=>c.checked).map(c=>c.id),featured:cards.find(c=>c.featured)?.id,radios:cards.map(c=>c.id),cards,text,targets,header:rect(document.querySelector('.game-header')),head:rect(document.querySelector('.game-page__head')),grid:rect(document.querySelector('.hero-select__grid')),footer:rect(document.querySelector('.hero-select__footer')),continue:rect(document.querySelector('.hero-select__continue')),continueDisabled:document.querySelector('.hero-select__continue').disabled,profile:JSON.parse(localStorage.getItem('misbar:student:v1'))};
}"""

def image_content(card):
    im = Image.open(ROOT / 'public' / 'heroes' / f"{card['id']}-outfit1.webp").convert('RGBA')
    bbox = im.getchannel('A').getbbox()
    scale = min(card['image']['width'] / im.width, card['image']['height'] / im.height)
    return {'width': (bbox[2] - bbox[0]) * scale, 'height': (bbox[3] - bbox[1]) * scale, 'scale':scale}


def wait(page):
    page.wait_for_selector('.hero-select')
    page.evaluate('document.fonts.ready')
    page.wait_for_function("[...document.querySelectorAll('.hero-select img')].every(i=>i.complete&&i.naturalWidth>0)")
    page.wait_for_timeout(80)


def measure(page, lang, theme, state):
    data = page.evaluate(MEASURE)
    w, h = data['viewport']['width'], data['viewport']['height']
    for card in data['cards']:
        card['renderedCharacter'] = image_content(card)
    tests = {
        'noVerticalScroll':data['scroll']['height'] <= h + 1,
        'noHorizontalScroll':data['scroll']['width'] <= w,
        'language':data['lang']==lang and data['dir']==('rtl' if lang=='ar' else 'ltr'),
        'theme':data['theme']==theme,
        'fiveNativeRadios':data['radios']==IDS,
        'allNamesVisible':all(c['nameVisible'] and c['name']['bottom']<=h+1 and c['name']['x']>=0 and c['name']['right']<=w+1 for c in data['cards']),
        'featuredOnlyDetails':sum(c['bioVisible'] for c in data['cards'])==1 and sum(c['titleVisible'] for c in data['cards'])==1,
        'fullDetailsFit':all(c['detailsFit'] for c in data['cards']),
        'bodyTextAtLeast16':all(t['font']>=16 for t in data['text']),
        'targetsAtLeast44':all(t['rect']['width']>=43.99 and t['rect']['height']>=43.99 for t in data['targets']),
        'continueVisible':data['continue']['bottom']<=h+1 and data['continue']['x']>=0 and data['continue']['right']<=w+1,
        'eagerImagesLoaded':all(c['imageLoaded'] and c['loading']=='eager' for c in data['cards']),
        'reducedMotion':all(c['animation']=='none' for c in data['cards']),
        'noAutoSelect':data['selected']==([] if state=='preview' else [state]),
    }
    if w == 390:
        tests['mobileImageBoxAtMost40vh']=all(c['image']['height']<=h*.4+1 for c in data['cards'])
        featured = next(c for c in data['cards'] if c['featured'])
        old_scale = min(177/600, 294/900)
        tests['featuredCharacterLargerThanOld']=featured['renderedCharacter']['scale'] > old_scale
    else:
        tests['alternativesLargerThanOld21vh']=all(c['image']['height']>h*.21 for c in data['cards'] if not c['featured'])
    return {'lang':lang,'theme':theme,'state':state,'checks':tests,'pass':all(tests.values()),'data':data}

results=[];errors=[];requests=[];screenshots=[];functional=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
    for lang in ['ar','en']:
        for theme in ['light','night']:
            for w,h in VIEWPORTS:
                ctx=browser.new_context(viewport={'width':w,'height':h},reduced_motion='reduce')
                ctx.add_init_script("if(!localStorage.getItem('misbar:lang:v1'))localStorage.setItem('misbar:lang:v1',JSON.stringify(%s));if(!localStorage.getItem('misbar:theme:v1'))localStorage.setItem('misbar:theme:v1',JSON.stringify(%s));" % (json.dumps(lang),json.dumps(theme)))
                page=ctx.new_page()
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.on('response',lambda r:requests.append({'status':r.status,'url':r.url}) if r.status>=400 else None)
                page.goto(URL);wait(page)
                assert page.url.endswith('#/heroes')
                assert page.locator('.hero-select__continue').is_disabled()
                results.append(measure(page,lang,theme,'preview'))
                initial=page.evaluate("JSON.parse(localStorage.getItem('misbar:student:v1'))")
                firstshot=OUT / f'hero-owner-{lang}-{theme}-{w}x{h}-preview.png'
                if w in [1366, 390]:
                    page.screenshot(path=str(firstshot),full_page=True);screenshots.append(str(firstshot))
                for hero_id in IDS:
                    # Click the actual large label touch target, not a synthetic state write.
                    page.locator('.hero-card').filter(has=page.locator(f'input[value="{hero_id}"]')).click()
                    wait(page)
                    results.append(measure(page,lang,theme,hero_id))
                    after=page.evaluate("JSON.parse(localStorage.getItem('misbar:student:v1'))")
                    assert {k:v for k,v in initial.items() if k!='heroId'}=={k:v for k,v in after.items() if k!='heroId'}
                shot=OUT / f'hero-owner-{lang}-{theme}-{w}x{h}-selected.png'
                if w in [1366, 390]:
                    page.screenshot(path=str(shot),full_page=True);screenshots.append(str(shot))
                # Native radio keyboard navigation must stay available when placement moves.
                radio=page.locator('input[value="sharara"]');radio.focus()
                focus=page.evaluate("getComputedStyle(document.activeElement.closest('.hero-card')).outlineWidth")
                assert float(focus.replace('px',''))>=3
                page.keyboard.press('ArrowDown');wait(page)
                assert page.locator('input[value="lubna"]').is_checked()
                page.keyboard.press('ArrowUp');wait(page)
                assert page.locator('input[value="sharara"]').is_checked()
                page.reload();wait(page)
                assert page.locator('input[value="sharara"]').is_checked()
                before=page.evaluate("JSON.parse(localStorage.getItem('misbar:student:v1'))")
                # Switch real AR/EN and light/night controls, return to original state.
                page.locator('#lang-toggle').click();wait(page)
                assert page.locator('html').get_attribute('lang')!=lang
                page.locator('#lang-toggle').click();wait(page)
                assert page.locator('html').get_attribute('lang')==lang
                page.locator('#theme-toggle').click();wait(page)
                assert page.locator('html').get_attribute('data-theme')!=theme
                page.locator('#theme-toggle').click();wait(page)
                assert page.locator('html').get_attribute('data-theme')==theme
                assert page.evaluate("JSON.parse(localStorage.getItem('misbar:student:v1'))")==before
                page.locator('.hero-select__continue').click()
                page.wait_for_selector('.lobby')
                assert page.url.endswith('#/lobby')
                functional.append({'lang':lang,'theme':theme,'viewport':[w,h],'firstVisitRedirect':True,'continueOpensLobby':True,'radioKeyboard':True,'focusOutline':focus,'profilePreserved':True,'reloadChoicePreserved':True,'headerSwitchesPreservedProfile':True})
                ctx.close()
    browser.close()
report={'results':results,'functional':functional,'screenshots':screenshots,'errors':errors,'badRequests':requests,'pass':all(r['pass'] for r in results) and not errors and not requests}
(OUT / 'hero-owner-evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
summary={'measuredStates':len(results),'noScrollPass':sum(r['checks']['noVerticalScroll'] and r['checks']['noHorizontalScroll'] for r in results),'failedStates':sum(not r['pass'] for r in results),'functionalContexts':len(functional),'screenshots':len(screenshots),'errors':errors,'badRequests':requests,'pass':report['pass']}
print(json.dumps(summary,ensure_ascii=False,indent=2))
for r in results:
    if not r['pass']:
        d=r['data']; print('FAIL',r['lang'],r['theme'],d['viewport'],r['state'],{k:v for k,v in r['checks'].items() if not v},'scroll',d['scroll'])
        print('small text',[(t['text'],t['font']) for t in d['text'] if t['font']<16])
        print('small targets',[(t['text'],t['rect']) for t in d['targets'] if t['rect']['width']<43.99 or t['rect']['height']<43.99])
        print('featured',next(c for c in d['cards'] if c['featured']))
(OUT / 'hero-owner-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
assert report['pass'], 'Focused hero-select checks failed; see hero-owner-evidence.json'
