import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
URL=os.environ.get('QA_URL','http://localhost:3000')
IDS=['motion-acceleration','lever-balance','planet-orbits','fractions-area','light-refraction','matter-states']
results=[];errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
    page=browser.new_page()
    page.on('pageerror',lambda e: errors.append(str(e)))
    for w,h in [(1366,768),(1536,864),(1920,1080),(390,844)]:
        page.set_viewport_size({'width':w,'height':h})
        for id in IDS:
            page.goto(URL+'/#/playground/'+id)
            page.wait_for_selector('.sim-svg')
            page.wait_for_timeout(200)
            row=page.evaluate('''() => {
              let d=document.documentElement; let rect=s=>{let r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
              return {pageHeight:d.scrollHeight,pageWidth:d.scrollWidth,svg:rect('.sim-svg'),challenge:rect('.challenge-bar'),workspace:rect('.sim-workspace')};
            }''')
            row.update(id=id,w=w,h=h)
            row['pass']=row['pageWidth']<=w and row['challenge']['bottom']<=row['workspace']['top']+1 and (row['pageHeight']<=h if w>=1024 else row['svg']['bottom']<=h)
            results.append(row)
    browser.close()
output={'results':results,'errors':errors}
ROOT.joinpath('qa-layout-current.json').write_text(json.dumps(output,indent=2))
for r in results: print(r['id'],r['w'],r['pass'],'height',r['pageHeight'],'svg-bottom',round(r['svg']['bottom']))
print('errors',errors)
assert all(r['pass'] for r in results) and not errors
