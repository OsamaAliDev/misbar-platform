from pathlib import Path
import json
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent;SHOTS=OUT/'screenshots/C-AFTER';SHOTS.mkdir(parents=True,exist_ok=True);rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox'])
 for lang in ['ar','en']:
  for theme in ['light','night']:
   for width,height in [(1366,768),(390,844)]:
    c=b.new_context(viewport={'width':width,'height':height},reduced_motion='reduce');c.add_init_script("localStorage.setItem('misbar:lang:v1',JSON.stringify(%s));localStorage.setItem('misbar:theme:v1',JSON.stringify(%s));localStorage.setItem('misbar:student:v1',JSON.stringify({heroId:'nour',nickname:'Comet Kid',avatarId:'rocket',stars:12,completedChallenges:[],claimedMissions:[],unlockedOutfits:[]}));"%(json.dumps(lang),json.dumps(theme)));page=c.new_page();page.goto('http://127.0.0.1:3000/#/');page.wait_for_selector('[data-grade-id=primary-4]')
    def shot(name):
     page.evaluate('document.fonts.ready');page.evaluate('Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))');page.wait_for_timeout(100);path=SHOTS/f'C-AFTER-{name}-{lang}-{theme}-{width}x{height}-fullpage.png';page.screenshot(path=str(path),full_page=True);rows.append({'step':name,'lang':lang,'theme':theme,'width':width,'height':height,'path':str(path)})
    shot('01-grades');page.locator('[data-grade-id=prep-2]').click();shot('02-subjects');page.locator('[data-subject-id=science]').click();shot('03-semesters');page.locator('[data-term-id="1"]').click();page.wait_for_selector('#experiment-title-matter-states');shot('04-verified-water-states');page.locator('[data-action=free-experiments]').click();page.locator('[data-grade-id=prep-1]').click();page.locator('[data-subject-id=science]').click();page.locator('[data-term-id="1"]').click();page.wait_for_selector('#experiment-title-planet-orbits');shot('05-needs-teacher-review-2025');page.locator('.curriculum-browser__actions button').first.click();page.locator('[data-term-id="2"]').click();shot('06-honest-coming-soon');c.close()
 b.close()
(OUT/'curriculum-screenshots.json').write_text(json.dumps(rows,indent=2)+'\n');print('Curriculum full-size screenshots:',len(rows))
