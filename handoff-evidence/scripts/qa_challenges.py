from playwright.sync_api import sync_playwright
BASE = "http://127.0.0.1:3000/"
def set_slider(page, label, value):
    s = page.locator(".control-slider", has_text=label).locator("input[type=range]")
    s.evaluate("""(el, v) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })); }""", value)
def met(page):
    return page.locator("button:has-text('أتممت التجربة')").count() == 1
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    page = b.new_page(viewport={"width": 1366, "height": 768})
    page.goto(BASE); page.evaluate("localStorage.clear()")
    # Motion: friction on, m=5, F=25 → a=3, run to finish
    page.goto(f"{BASE}#/playground/motion-acceleration"); page.wait_for_selector(".sim-svg")
    page.locator(".control-toggle").first.click()
    set_slider(page, "قوة الدفع", 25); set_slider(page, "كتلة العربة", 5)
    page.click("button:has-text('تشغيل')"); page.wait_for_timeout(6500)
    print("motion met:", met(page), "|", page.locator(".reading").nth(1).inner_text().replace("\n"," "))
    # Lever: 4kg@1m vs 2kg@2m
    page.goto(f"{BASE}#/playground/lever-balance"); page.wait_for_selector(".sim-svg")
    set_slider(page, "كتلة الثقل الأيمن", 4); set_slider(page, "بُعد الثقل الأيمن", 1)
    set_slider(page, "كتلة الثقل الأيسر", 2); set_slider(page, "بُعد الثقل الأيسر", 2)
    page.wait_for_timeout(1500); print("lever met:", met(page))
    # Orbit: M=2.7, r=1.4 → ≈368 days, wait one orbit (~4 s)
    page.goto(f"{BASE}#/playground/planet-orbits"); page.wait_for_selector(".sim-svg")
    set_slider(page, "كتلة النجم", 2.7); set_slider(page, "نصف قطر المدار", 1.4)
    page.wait_for_timeout(5000)
    print("orbit met:", met(page), "|", page.locator(".reading").nth(1).inner_text().replace("\n"," "))
    # Fractions: 6/8
    page.goto(f"{BASE}#/playground/fractions-area"); page.wait_for_selector(".sim-svg")
    set_slider(page, "المقام", 8); set_slider(page, "البسط", 6); page.wait_for_timeout(200)
    print("fractions met:", met(page), "|", page.locator(".sim-stage").locator("text=أبسط").count())
    # States: heat to 120 then cool to -20
    page.goto(f"{BASE}#/playground/matter-states"); page.wait_for_selector(".sim-svg")
    set_slider(page, "درجة حرارة السخّان", 120); page.wait_for_timeout(9000)
    print("states mid:", page.locator(".reading").nth(1).inner_text().replace("\n"," "), "| met:", met(page))
    set_slider(page, "درجة حرارة السخّان", -20); page.wait_for_timeout(9500)
    print("states end:", page.locator(".reading").nth(1).inner_text().replace("\n"," "), "| met:", met(page))
    b.close()
