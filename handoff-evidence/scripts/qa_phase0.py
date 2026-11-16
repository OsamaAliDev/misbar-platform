"""Phase 0 evidence: GitHub repo page + the site built from a fresh GitHub clone."""
import time
from playwright.sync_api import sync_playwright

OUT = "/home/ubuntu/work/phase0"
SITE = "http://127.0.0.1:4173/"

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])

    # 1) GitHub repository page (public) — file list + latest commit.
    gh = b.new_page(viewport={"width": 1366, "height": 1100}, device_scale_factor=1)
    gh.goto("https://github.com/OsamaAliDev/misbar-platform", wait_until="domcontentloaded", timeout=60000)
    gh.wait_for_timeout(4000)
    gh.screenshot(path=f"{OUT}/01_github_repo.png")
    print("github title:", gh.title())
    print("has 6a07098:", "6a07098" in gh.content())

    # 2) README rendered on GitHub (tech stack section).
    gh.goto("https://github.com/OsamaAliDev/misbar-platform/blob/main/README.md", wait_until="domcontentloaded", timeout=60000)
    gh.wait_for_timeout(4000)
    heading = gh.get_by_text("Tech stack (actual)").first
    heading.scroll_into_view_if_needed()
    gh.evaluate("window.scrollBy(0, -120)")
    gh.wait_for_timeout(500)
    gh.screenshot(path=f"{OUT}/02_github_readme_stack.png")

    # 3–4) Site built from the GitHub clone: catalog + playground.
    site = b.new_page(viewport={"width": 1366, "height": 768}, device_scale_factor=1)
    errors = []
    site.on("pageerror", lambda e: errors.append(str(e)))
    site.goto(SITE)
    site.wait_for_selector(".experiment-card")
    site.evaluate("document.fonts.ready")
    site.wait_for_timeout(1200)
    site.screenshot(path=f"{OUT}/03_site_catalog_from_github.png", full_page=True)
    print("cards:", site.locator(".experiment-card").count())

    site.goto(f"{SITE}#/playground/motion-acceleration")
    site.wait_for_selector(".sim-svg")
    site.wait_for_timeout(2500)
    site.screenshot(path=f"{OUT}/04_site_playground_from_github.png")
    print("playground h1:", site.locator("h1").first.inner_text())
    print("errors:", errors)
    b.close()
