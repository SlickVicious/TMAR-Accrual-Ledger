import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from playwright.sync_api import sync_playwright
from pathlib import Path

html = Path('TMAR-Accrual-Ledger.html').resolve()
url = 'file:///' + html.as_posix()

errors = []

def on_console(msg):
    errors.append((msg.type, msg.text, msg.location))

def on_pageerror(err):
    errors.append(('pageerror', str(err), {}))

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.on('console', on_console)
    page.on('pageerror', on_pageerror)
    page.goto(url, wait_until='domcontentloaded', timeout=20000)
    page.wait_for_timeout(3000)
    browser.close()

print(f'Total messages: {len(errors)}')
for t, m, loc in errors:
    print(f'[{t.upper()}] {m[:300]}')
    if loc:
        print(f'  -> {loc}')
