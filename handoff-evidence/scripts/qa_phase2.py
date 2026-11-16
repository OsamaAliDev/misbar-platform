"""Phase 2 smoke test: game screens, first-visit redirect, guide wiring.

Usage: python3 qa_phase2.py [base_url] [out_dir]
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:3000/'
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else '/home/ubuntu/work/phase2')
OUT.mkdir(parents=True, exist_ok=True)
KEY = 'misbar:student:v1'

problems = []


def attach(page, tag):
    page.on('console', lambda m: m.type in ('error', 'warning') and problems.append(f'[{tag}] console {m.type}: {m.text}'))
    page.on('pageerror', lambda e: problems.append(f'[{tag}] pageerror: {e}'))
    page.on('response', lambda r: r.status >= 400 and problems.append(f'[{tag}] HTTP {r.status} {r.url}'))


def overflow(page):
    return page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')


def settle(page, ms=500):
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(ms)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    for width, height in [(1366, 768), (768, 1024), (390, 844), (320, 640)]:
        ctx = browser.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1)
        page = ctx.new_page()
        tag = f'{width}'
        attach(page, tag)

        # 1) First visit on the catalog root → hero select, URL replaced.
        page.goto(BASE)
        page.evaluate('localStorage.clear()')
        page.goto(BASE + '#/')
        page.reload()
        settle(page)
        url = page.url
        theme = page.evaluate("document.querySelector('[data-theme]')?.dataset.theme")
        body_bg = page.evaluate('getComputedStyle(document.body).backgroundColor')
        print(f'{tag} first visit → {url.split("#")[-1]} theme={theme} body={body_bg} overflow={overflow(page)}')
        if not url.endswith('#/heroes'):
            problems.append(f'[{tag}] first visit did not land on #/heroes: {url}')
        page.screenshot(path=str(OUT / f'heroes_empty_{tag}.png'), full_page=True)

        # 2) Pick Lubna (keyboard-accessible radio) and check storage.
        page.locator('.hero-card:has(input[value="lubna"])').click()
        page.wait_for_timeout(900)
        stored = json.loads(page.evaluate(f'localStorage.getItem("{KEY}")'))
        print(f'{tag} heroId stored: {stored.get("heroId")}')
        if stored.get('heroId') != 'lubna':
            problems.append(f'[{tag}] hero choice not stored')
        page.screenshot(path=str(OUT / f'heroes_selected_{tag}.png'), full_page=True)

        # Arrow-key navigation between radios.
        page.locator('input[name="hero"][value="lubna"]').focus()
        page.keyboard.press('ArrowLeft')
        page.wait_for_timeout(200)
        after_key = json.loads(page.evaluate(f'localStorage.getItem("{KEY}")')).get('heroId')
        print(f'{tag} after ArrowLeft heroId: {after_key}')
        page.locator('.hero-card:has(input[value="lubna"])').click()
        page.wait_for_timeout(200)

        # 3) Continue → lobby.
        page.locator('.hero-select__continue').click()
        settle(page, 700)
        print(f'{tag} lobby url={page.url.split("#")[-1]} overflow={overflow(page)} h1={page.locator("#view-heading").inner_text()}')
        page.screenshot(path=str(OUT / f'lobby_{tag}.png'), full_page=True)

        # 4) Vault and ranks.
        for route in ('vault', 'ranks'):
            page.goto(BASE + f'#/{route}')
            settle(page, 600)
            print(f'{tag} {route} overflow={overflow(page)}')
            page.screenshot(path=str(OUT / f'{route}_{tag}.png'), full_page=True)

        # 5) Catalog (cream) with the hero greeting + lobby link.
        page.goto(BASE + '#/')
        settle(page, 600)
        theme = page.evaluate("document.querySelector('[data-theme]')?.dataset.theme")
        body_bg = page.evaluate('getComputedStyle(document.body).backgroundColor')
        print(f'{tag} catalog theme={theme} body={body_bg} overflow={overflow(page)} lobby links={page.locator("a[href=\'#/lobby\']").count()}')
        page.screenshot(path=str(OUT / f'catalog_{tag}.png'), full_page=True)

        # 6) Lab: hero guide in the challenge bar; wrong answer + help modal.
        page.goto(BASE + '#/playground/motion-acceleration')
        settle(page, 800)
        bar = page.locator('.challenge-bar')
        print(f'{tag} lab bubble: {bar.locator(".challenge-bar__message").inner_text()[:90]}')
        page.locator('.challenge-bar .btn').click()
        page.wait_for_timeout(300)
        print(f'{tag} lab wrong: {bar.locator(".challenge-bar__message").inner_text()[:90]}')
        fit = page.evaluate('document.documentElement.scrollHeight - window.innerHeight')
        print(f'{tag} lab vertical overflow={fit} horizontal={overflow(page)}')
        page.screenshot(path=str(OUT / f'lab_{tag}.png'), full_page=True)
        page.locator('.playground-header__help').click()
        page.wait_for_timeout(500)
        print(f'{tag} modal title: {page.locator("#help-modal-title").inner_text()} | bubble: {page.locator(".help-modal__bubble").inner_text()[:70]}')
        page.screenshot(path=str(OUT / f'lab_help_{tag}.png'))
        page.keyboard.press('Escape')
        ctx.close()

    browser.close()

print('\nPROBLEMS:' if problems else '\nNo problems found.')
for item in dict.fromkeys(problems):
    print(' -', item)
