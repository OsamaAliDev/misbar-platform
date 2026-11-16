"""Batch 2 Playground QA: layout fit, horizontal overflow, console errors, help modal."""
import json
import sys
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3000/"
IDS = ["motion-acceleration", "lever-balance", "planet-orbits", "fractions-area", "light-refraction", "matter-states"]
VIEWPORTS = [(1366, 768), (1280, 657), (768, 1024), (390, 844), (320, 568)]
OUT = "/home/ubuntu/work/shots"
only = sys.argv[1:]  # optional experiment filter

problems = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
    for (w, h) in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
        page = ctx.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        for exp in IDS:
            if only and exp not in only:
                continue
            page.goto(f"{BASE}#/playground/{exp}")
            page.wait_for_selector(".sim-svg")
            page.wait_for_timeout(900)
            m = page.evaluate("""() => {
              const d = document.documentElement;
              const r = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), Math.round(b.width), Math.round(b.height)]; };
              const body = document.querySelector('.sim-controls__body');
              return {
                sw: d.scrollWidth, cw: d.clientWidth, sh: d.scrollHeight, ch: d.clientHeight,
                header: r('.playground-header'), stage: r('.sim-stage__canvas'), strip: r('.result-strip'),
                controls: r('.sim-controls'), bar: r('.challenge-bar'),
                bodyScroll: body ? [body.scrollHeight, body.clientHeight] : null,
                small: [...document.querySelectorAll('button, input[type=range]')].filter(b => { const x = b.getBoundingClientRect(); return x.width > 0 && (x.height < 44 || x.width < 44); }).map(b => (b.getAttribute('aria-label') || b.textContent || b.type).trim().slice(0, 30) + ' ' + Math.round(b.getBoundingClientRect().width) + 'x' + Math.round(b.getBoundingClientRect().height)),
              };
            }""")
            tag = f"{exp}@{w}x{h}"
            if m["sw"] > m["cw"]:
                problems.append(f"{tag}: horizontal overflow {m['sw']} > {m['cw']}")
            if w >= 1024 and h >= 600 and m["sh"] > m["ch"]:
                problems.append(f"{tag}: vertical overflow {m['sh']} > {m['ch']}")
            if m["small"]:
                problems.append(f"{tag}: small targets {m['small']}")
            print(tag, json.dumps({k: m[k] for k in ['sh', 'ch', 'stage', 'strip', 'controls', 'bar', 'bodyScroll']}))
            page.screenshot(path=f"{OUT}/pg_{exp}_{w}.png", full_page=True)
        if errors:
            problems.append(f"console errors @{w}: {errors[:5]}")
        ctx.close()

    # Help modal at desktop and mobile
    for (w, h) in [(1366, 768), (390, 844)]:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        page = ctx.new_page()
        page.goto(f"{BASE}#/playground/light-refraction")
        page.wait_for_selector(".sim-svg")
        page.click(".playground-header__help")
        page.wait_for_timeout(400)
        info = page.evaluate("""() => { const d = document.querySelector('dialog.help-modal'); const b = d.getBoundingClientRect();
          return { open: d.open, steps: d.querySelectorAll('.help-step').length, top: Math.round(b.top), bottom: Math.round(b.bottom), h: innerHeight,
                   focus: document.activeElement && document.activeElement.getAttribute('aria-label') }; }""")
        print("modal", w, info)
        page.screenshot(path=f"{OUT}/modal_{w}.png")
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
        print("modal closed:", not page.evaluate("document.querySelector('dialog.help-modal').open"),
              "focus back:", page.evaluate("document.activeElement.className"))
        ctx.close()
    browser.close()

print("\nPROBLEMS:" if problems else "\nNo problems found.")
for item in problems:
    print(" -", item)
