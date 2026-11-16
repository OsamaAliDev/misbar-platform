"""Responsive QA for Misbar Batch 1.

For each viewport: screenshot, horizontal-overflow check, clipped-text check
on filter pills / buttons, touch-target sizes and grid column count. Also
exercises search, filters and navigation to the placeholder views.
"""
import json
import sys

from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:3000/"
OUT = "/home/ubuntu/work/shots"
VIEWPORTS = [(1366, 900), (768, 1024), (480, 900), (390, 844), (320, 700)]

MEASURE = """
() => {
  const doc = document.documentElement;
  const clipped = [];
  for (const el of document.querySelectorAll('.filter-pill, .btn, .badge, .star-balance, .student-chip__name, .brand__word')) {
    const s = getComputedStyle(el);
    if (s.position === 'absolute' && el.clientWidth <= 1) continue;
    if (el.scrollWidth > el.clientWidth + 1) clipped.push(el.textContent.trim());
  }
  const pills = [...document.querySelectorAll('.filter-pill')].map(p => {
    const r = p.getBoundingClientRect();
    return { text: p.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right) };
  });
  const small = [];
  for (const el of document.querySelectorAll('button, input, a')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    if (r.height < 44 || r.width < 44) small.push({ t: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) });
  }
  const grid = document.querySelector('.catalog__grid');
  const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : null;
  const container = document.querySelector('.app-container').getBoundingClientRect();
  const outOfView = [...document.querySelectorAll('body *')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && (r.right > window.innerWidth + 0.5 || r.left < -0.5) && !el.closest('.visually-hidden') && getComputedStyle(el).position !== 'absolute';
  }).map(el => el.className || el.tagName).slice(0, 8);
  return {
    innerWidth: window.innerWidth,
    scrollWidth: doc.scrollWidth,
    hOverflow: doc.scrollWidth > window.innerWidth,
    clipped, pills, small, cols,
    container: { left: Math.round(container.left), width: Math.round(container.width) },
    outOfView,
    fontsOk: document.fonts.check('700 16px Cairo'),
    iconFont: document.fonts.check('20px "Material Symbols Outlined"'),
  };
}
"""

results = {}
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    for w, h in VIEWPORTS:
        page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        page.goto(URL, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(600)
        results[f"{w}"] = page.evaluate(MEASURE)
        page.screenshot(path=f"{OUT}/catalog_{w}.png", full_page=True)
        page.close()

    # Interaction checks at 390px
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.goto(URL, wait_until="networkidle")
    page.evaluate("localStorage.clear()")
    page.reload(wait_until="networkidle")
    checks = {}
    checks["stored_student"] = page.evaluate("localStorage.getItem('misbar:student:v1')")
    count = lambda: page.locator(".experiment-card").count()
    checks["initial_cards"] = count()
    page.fill("input[type=search]", "الضوء")
    page.wait_for_timeout(200)
    checks["search_الضوء"] = page.locator(".experiment-card__title").all_inner_texts()
    page.fill("input[type=search]", "الكواكب")
    page.wait_for_timeout(200)
    checks["search_الكواكب"] = page.locator(".experiment-card__title").all_inner_texts()
    page.fill("input[type=search]", "زززز")
    page.wait_for_timeout(200)
    checks["search_nomatch_empty_state"] = page.locator(".catalog__empty").count()
    page.screenshot(path=f"{OUT}/empty_390.png", full_page=True)
    page.click("text=عرض كل التجارب")
    page.wait_for_timeout(200)
    checks["after_reset"] = count()
    page.click(".filter-pill--physics")
    page.wait_for_timeout(200)
    checks["filter_physics"] = count()
    page.click(".filter-pill--math")
    page.wait_for_timeout(200)
    checks["filter_math"] = page.locator(".experiment-card__title").all_inner_texts()
    page.click(".filter-pill--astronomy")
    page.wait_for_timeout(200)
    checks["filter_astronomy"] = page.locator(".experiment-card__title").all_inner_texts()
    page.click(".filter-pill--physics")
    page.fill("input[type=search]", "حرارة")
    page.wait_for_timeout(200)
    checks["physics+حرارة"] = page.locator(".experiment-card__title").all_inner_texts()
    page.click(".filter-pill--all")
    page.fill("input[type=search]", "")
    page.wait_for_timeout(200)
    page.locator(".experiment-card__cta").nth(0).click()
    page.wait_for_timeout(400)
    checks["playground_hash"] = page.evaluate("location.hash")
    checks["playground_h1"] = page.locator("h1#view-heading").inner_text()
    checks["playground_focus"] = page.evaluate("document.activeElement.id")
    page.screenshot(path=f"{OUT}/playground_390.png", full_page=True)
    page.get_by_role("button", name="العودة للمكتبة").first.click()
    page.wait_for_timeout(400)
    checks["back_hash"] = page.evaluate("location.hash")
    checks["back_cards"] = count()
    page.click("#open-dashboard")
    page.wait_for_timeout(400)
    checks["dashboard_hash"] = page.evaluate("location.hash")
    checks["dashboard_h1"] = page.locator("h1#view-heading").inner_text()
    page.screenshot(path=f"{OUT}/dashboard_390.png", full_page=True)
    page.go_back()
    page.wait_for_timeout(400)
    checks["browser_back_hash"] = page.evaluate("location.hash")
    checks["title"] = page.title()
    page.close()

    page = browser.new_page(viewport={"width": 1366, "height": 900})
    page.goto(URL + "#/playground/light-refraction", wait_until="networkidle")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{OUT}/playground_1366.png", full_page=True)
    page.goto(URL + "#/dashboard", wait_until="networkidle")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{OUT}/dashboard_1366.png", full_page=True)
    browser.close()

results["interactions"] = checks
print(json.dumps(results, ensure_ascii=False, indent=1))
