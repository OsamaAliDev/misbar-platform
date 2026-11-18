import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent;rows=[];errors=[]
IDS=['motion-acceleration','lever-balance','planet-orbits','fractions-area','light-refraction','matter-states']
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox'])
 for lang in ['ar','en']:
  for width,height in [(1366,768),(390,844)]:
   for ident in IDS:
    c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');c.add_init_script("localStorage.setItem('misbar:lang:v1',JSON.stringify(%s));"%json.dumps(lang));page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:3000');page.wait_for_selector('.hero-select');page.locator('label.hero-card').filter(has=page.locator('input[value=nour]')).click();page.locator('a.game-header__library').click();page.wait_for_selector('.catalog');page.locator('.experiment-card').filter(has=page.locator('#experiment-title-'+ident)).get_by_role('button').click();page.wait_for_selector('.sim-svg');assert page.url.endswith('#/playground/'+ident);page.locator('.playground-header__back').click();page.wait_for_selector('.catalog');rows.append({'lang':lang,'w':width,'experiment':ident,'taps':3,'fromFreshFirstVisit':True,'backToCatalog':True,'pass':True});c.close()
 b.close()
report={'rows':rows,'errors':errors,'pass':not errors};(OUT/'navigation-proof.json').write_text(json.dumps(report,indent=2)+'\n');print('Navigation',len(rows),'PASS',report['pass']);assert report['pass']
