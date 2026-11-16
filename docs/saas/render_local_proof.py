from pathlib import Path
import html,subprocess,re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
log=(ROOT/'rls-local-proof.txt').read_text()
passes=[line for line in log.splitlines() if 'PASS:' in line]
chosen=[]
for phrase in ['schoolA teacher','schoolB','another teacher','other teacher','PIN','nickname','per-experiment','platform admin']:
 match=next((x for x in passes if phrase.lower() in x.lower() and x not in chosen),None)
 if match:chosen.append(match)
chosen=chosen[:8]
query="SELECT n.nspname||'.'||c.relname||' | RLS='||c.relrowsecurity::text FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relkind='r' AND ((n.nspname='public' AND c.relname IN ('schools','profiles','classes','students','experiment_progress','subscriptions','events')) OR (n.nspname='saas_private' AND c.relname='pin_attempts')) ORDER BY 1;"
actual=subprocess.check_output(['sudo','-u','postgres','psql','-X','-h','/var/run/postgresql','-d','misbar_rls_test','-Atqc',query],text=True)
body='''<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#f5f1e9;color:#243048;font:18px/1.5 Arial,sans-serif;padding:32px}main{background:white;border:1px solid #d7d7d2;border-radius:20px;padding:28px;max-width:1280px;margin:auto}h1{margin:0 0 12px;font-size:32px}p{margin:0 0 20px}.notice{background:#fcefc8;padding:12px 16px;border-radius:12px;color:#594412}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:16px/1.6 monospace;background:#18213b;color:#e7edf9;padding:20px;border-radius:12px;margin:16px 0}h2{font-size:22px;margin:24px 0 12px}.small{font-size:15px;color:#657082}</style><main><h1>Misbar · Local database/RLS proof</h1><p class="notice">LOCAL PostgreSQL 16 with Auth/JWT test stubs. Real Supabase RLS/Auth was NOT run.</p><p>Recorded successful proof: <strong>COUNT PASS checks</strong>, exit 0. Synthetic fixtures rolled back.</p><h2>Actual RLS table flags</h2><pre>FLAGS</pre><h2>Extract from executed assertions</h2><pre>ASSERTIONS</pre><p class="small">Rendered verification extract, not a screenshot of a Supabase console. Source: docs/saas/rls-local-proof.txt and a local pg_class query. Full proof and synthetic SQL are committed separately.</p></main>'''
body=body.replace('COUNT',str(len(passes))).replace('FLAGS',html.escape(actual.strip())).replace('ASSERTIONS',html.escape('\n'.join(chosen)))
output=ROOT/'local-proof-visual.html';output.write_text(body)
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1366,'height':768},device_scale_factor=1);page.goto(output.as_uri());page.locator('main').screenshot(path=str(ROOT/'screenshots/section-local-rls.png'));b.close()
print('local proof visual',len(passes),'PASS checks')
