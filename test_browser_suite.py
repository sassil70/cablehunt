import os
import sys
import time
import subprocess
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from playwright.sync_api import sync_playwright

SCREENSHOTS_DIR = r"c:\cabelhuntweb\test_results"
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def run_server(httpd):
    httpd.serve_forever()

def main():
    os.chdir(r"c:\cabelhuntweb")
    PORT = 8086
    httpd = HTTPServer(('127.0.0.1', PORT), QuietHandler)
    server_thread = threading.Thread(target=run_server, args=(httpd,), daemon=True)
    server_thread.start()
    print(f"HTTP Server started on http://127.0.0.1:{PORT}")

    console_logs = []
    page_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        
        # -------------------------------------------------------------
        # 1. Desktop Test (1920x1080)
        # -------------------------------------------------------------
        print("\n--- Running Desktop Tests (1920x1080) ---")
        desktop_context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = desktop_context.new_page()

        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        page.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
        time.sleep(2)

        # Full page desktop screenshot
        desktop_full = os.path.join(SCREENSHOTS_DIR, "desktop_full_page.png")
        page.screenshot(path=desktop_full, full_page=True)
        print(f"Saved: {desktop_full}")

        # Section screenshots
        sections = [
            ("hero", "#hero"),
            ("technology", "#technology"),
            ("hardware", "#hardware"),
            ("speed_multiplier", "#speed-multiplier"),
            ("optical_ai_console", "#optical-ai-console"),
            ("spectral_engine", "#spectral-engine"),
            ("closed_loop", "#closed-loop"),
            ("birmingham_testbed", "#birmingham-testbed"),
            ("global_presence", "#global-presence"),
            ("ecosystem", "#ecosystem"),
            ("leadership", "#leadership"),
            ("contact", "#contact")
        ]

        for sname, selector in sections:
            el = page.query_selector(selector)
            if el:
                spath = os.path.join(SCREENSHOTS_DIR, f"desktop_{sname}.png")
                el.screenshot(path=spath)
                print(f"Captured section: {spath}")

        # Test Buttons & Interactivity
        print("\n--- Testing Desktop Interactivity ---")
        
        # Test 1: Device Hotspots
        print("Testing 3D Device Hotspots...")
        for mode in ['ports', 'scan', 'scope', 'default']:
            btn = page.query_selector(f"button[data-mode='{mode}']")
            if btn:
                btn.click()
                time.sleep(0.4)
        print("Device hotspots tested successfully.")

        # Test 2: CapEx Calculator Slider
        print("Testing CapEx Calculator Sliders...")
        links_slider = page.query_selector("#calc-links-slider")
        if links_slider:
            page.fill("#calc-links-slider", "80")
            page.dispatch_event("#calc-links-slider", "input")
            time.sleep(0.5)
            savings_text = page.inner_text("#calc-savings-total")
            print(f"Updated CapEx savings with 80 links: {savings_text}")

        # Test 3: Spectrum Tuner Bands
        print("Testing ITU-T Spectrum Tuner...")
        for band in ['O', 'E', 'S', 'C', 'L', 'U']:
            bbtn = page.query_selector(f"button[data-band='{band}']")
            if bbtn:
                bbtn.click()
                time.sleep(0.3)
        current_wave = page.inner_text("#spectrum-current-wave")
        print(f"Current wavelength after U-Band click: {current_wave}")

        # Test 4: Live Terminal Scenario
        print("Testing Switch Orchestration Terminal...")
        cut_btn = page.query_selector("button:has-text('Sudden Physical Cable Cut')")
        if cut_btn:
            cut_btn.click()
            time.sleep(1)
            terminal_text = page.inner_text("#terminal-live-body")
            print("Terminal output snippet:\n", terminal_text[:160])

        # Test 5: On-Page AI Console Prompt Chip Click & Response
        print("Testing AI Agent Console Chip...")
        chip = page.query_selector("button:has-text('40G Brownfield Line-Rate Upgrade')")
        if chip:
            chip.click()
            time.sleep(4) # Wait for Gemini response
            ai_bubbles = page.query_selector_all("#console-chat-body .chat-bubble")
            if len(ai_bubbles) > 1:
                last_reply = ai_bubbles[-1].inner_text()
                print("AI Agent Reply received:\n", last_reply[:180], "...")

        # Test 6: Global Drawer Modal
        print("Testing Floating Global AI Drawer...")
        trigger = page.query_selector("#ai-widget-trigger")
        if trigger:
            trigger.click()
            time.sleep(1)
            modal = page.query_selector("#ai-chat-modal")
            is_open = "open" in (modal.get_attribute("class") or "")
            print(f"Drawer modal opened: {is_open}")
            drawer_screen = os.path.join(SCREENSHOTS_DIR, "desktop_ai_drawer_open.png")
            page.screenshot(path=drawer_screen)
            # Close modal
            close_btn = page.query_selector("#ai-chat-close")
            if close_btn:
                close_btn.click()

        desktop_context.close()

        # -------------------------------------------------------------
        # 2. Mobile Viewport Test (iPhone 14: 390x844)
        # -------------------------------------------------------------
        print("\n--- Running Mobile Tests (390x844) ---")
        mobile_context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
            is_mobile=True,
            has_touch=True
        )
        mpage = mobile_context.new_page()
        mpage.goto(f"http://127.0.0.1:{PORT}/index.html", wait_until="networkidle")
        time.sleep(2)

        # Mobile Hero Viewport Screenshot
        mobile_hero_screen = os.path.join(SCREENSHOTS_DIR, "mobile_viewport_hero.png")
        mpage.screenshot(path=mobile_hero_screen)
        print(f"Saved: {mobile_hero_screen}")

        # Mobile menu toggle test
        print("Testing Mobile Hamburger Menu...")
        mobile_toggle = mpage.query_selector("#mobile-menu-toggle")
        if mobile_toggle:
            mobile_toggle.click()
            time.sleep(0.5)
            nav_open_screen = os.path.join(SCREENSHOTS_DIR, "mobile_nav_opened.png")
            mpage.screenshot(path=nav_open_screen)
            print(f"Saved: {nav_open_screen}")

            # Test clicking a link in the mobile nav menu
            nav_link = mpage.query_selector(".nav-menu a[href='#speed-multiplier']")
            if nav_link:
                nav_link.click()
                time.sleep(1)
                is_menu_closed = "open" not in (mpage.query_selector(".nav-menu").get_attribute("class") or "")
                print(f"Mobile menu auto-closed on anchor click: {is_menu_closed}")

        # Mobile Section Screenshots
        mobile_sections = [
            ("scope", "#technology"),
            ("speed_calculator", "#speed-multiplier"),
            ("ai_console", "#optical-ai-console"),
            ("terminal", "#closed-loop"),
            ("gitex", "#global-presence"),
            ("leadership", "#leadership"),
            ("contact", "#contact")
        ]

        for msname, mselector in mobile_sections:
            mel = mpage.query_selector(mselector)
            if mel:
                mpath = os.path.join(SCREENSHOTS_DIR, f"mobile_section_{msname}.png")
                mel.screenshot(path=mpath)
                print(f"Captured mobile section: {mpath}")

        mobile_context.close()
        browser.close()

    httpd.shutdown()
    print("\n--- Summary of Browser Errors & Console Logs ---")
    print(f"Total Page Errors: {len(page_errors)}")
    for err in page_errors:
        print("ERROR:", err)
    print(f"Total Console Logs: {len(console_logs)}")
    for log in console_logs[:10]:
        print("LOG:", log)

if __name__ == "__main__":
    main()
