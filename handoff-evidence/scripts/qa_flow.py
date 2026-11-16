"""Functional checks: challenge → +1 star once, persisted; reset; lever balance; catalog intact."""
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000/"


def stars(page):
    return page.locator(".star-counter").inner_text().strip()


def set_slider(page, label, value):
    """Set a ControlSlider (by its visible label) through the native range input."""
    slider = page.locator(".control-slider", has_text=label).locator("input[type=range]")
    slider.evaluate(
        """(el, v) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
             set.call(el, String(v)); el.dispatchEvent(new Event('input', { bubbles: true })); }""",
        value,
    )


with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    ctx = b.new_context(viewport={"width": 1366, "height": 768})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

    page.goto(BASE)
    page.evaluate("localStorage.clear()")
    page.goto(f"{BASE}#/playground/light-refraction")
    page.wait_for_selector(".sim-svg")
    print("start stars:", stars(page))

    # Not met → retry hint
    page.click("button:has-text('تحقق من التحدي')")
    print("retry msg:", page.locator(".challenge-bar__message").inner_text()[:70])

    # Glass → air at 60° = total internal reflection
    page.locator(".control-choice", has_text="الوسط الأول").locator("button", has_text="الزجاج").click()
    page.locator(".control-choice", has_text="الوسط التاني").locator("button", has_text="الهواء").click()
    set_slider(page, "زاوية السقوط", 60)
    page.wait_for_timeout(200)
    print("status:", page.locator(".sim-stage__status, .status-chip").first.inner_text())
    claim = page.locator("button:has-text('أتممت التجربة')")
    print("claim visible:", claim.is_visible())
    claim.click()
    page.wait_for_timeout(300)
    print("after claim stars:", stars(page), "| done disabled:", page.locator("button:has-text('تم إنجاز التحدي')").is_disabled())
    print("storage:", page.evaluate("JSON.stringify(Object.fromEntries(Object.entries(localStorage)))")[:300])

    # Reload → persisted, still completed, cannot re-earn
    page.reload()
    page.wait_for_selector(".sim-svg")
    print("after reload stars:", stars(page), "| done:", page.locator("button:has-text('تم إنجاز التحدي')").count())

    # Reset restores defaults (angle back to 40)
    set_slider(page, "زاوية السقوط", 70)
    page.click("button:has-text('إعادة ضبط')")
    page.wait_for_timeout(200)
    print("after reset angle:", page.locator(".control-slider", has_text="زاوية السقوط").locator("input").input_value())

    # Lever: balanced indicator
    page.goto(f"{BASE}#/playground/lever-balance")
    page.wait_for_selector(".sim-svg")
    set_slider(page, "كتلة الثقل الأيسر", 2)
    page.wait_for_timeout(1500)
    print("lever status:", page.locator(".sim-stage__status, .status-chip").first.inner_text())

    # Back to catalog → header + 6 cards, star balance updated there too
    page.click(".playground-header__back")
    page.wait_for_selector(".experiment-card")
    print("catalog cards:", page.locator(".experiment-card").count(), "| hash:", page.evaluate("location.hash"))
    print("catalog star balance:", page.locator(".star-balance").inner_text().strip())
    print("errors:", errors[:5])
    b.close()
