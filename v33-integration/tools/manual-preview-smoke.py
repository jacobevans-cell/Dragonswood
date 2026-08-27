#!/usr/bin/env python3
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from manual_preview_server import PreviewHandler


def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(PreviewHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    forbidden = []
    with sync_playwright() as pw:
        launch = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
        if Path('/usr/bin/chromium').exists():
            launch['executable_path'] = '/usr/bin/chromium'
        browser = pw.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000})
        context.on('request', lambda request: forbidden.append(request.url) if any(host in request.url for host in ('firebaseio.com', 'googleapis.com', 'gstatic.com')) else None)

        launcher = context.new_page()
        launcher.goto(f'{base}/v33-integration/manual-preview.html', wait_until='domcontentloaded')
        launcher.get_by_role('heading', name='Dragonswood V3.3').wait_for()
        launcher.get_by_role('button', name='Reset local preview').click()

        student = context.new_page()
        student.goto(f'{base}/v33-integration/student-manual-preview.html#arcade', wait_until='domcontentloaded')
        student.get_by_role('heading', name='Arcade Time', exact=True).wait_for()
        student.get_by_text('3 / 3 Tokens').wait_for()
        student.get_by_role('button', name='Open Arcade Time').click()
        arcade_frame = student.frame_locator('iframe[title="Dragonswood Arcade"]')
        arcade_frame.get_by_role('button', name='Use 3 Tokens — Start 30 Minutes').click()
        arcade_frame.locator('.arcade-time-badge').wait_for(state='visible')
        arcade_frame.get_by_role('heading', name='Arcade Games').wait_for()

        teacher = context.new_page()
        teacher.goto(f'{base}/v33-integration/teacher-manual-preview.html#arcade', wait_until='domcontentloaded')
        teacher.get_by_role('heading', name='Arcade Time Command').wait_for()
        teacher.get_by_text('Local preview state only').wait_for()
        teacher.get_by_role('button', name='Refresh selected').click()
        teacher.get_by_text('Session active').wait_for()
        teacher.get_by_role('button', name='Lock Arcade Now').click()
        teacher.get_by_role('button', name='Lock class now').click()
        student.get_by_role('heading', name='Arcade is closed right now').wait_for()
        assert student.locator('iframe[title="Dragonswood Arcade"]').count() == 0

        kingdom = context.new_page()
        kingdom.goto(f'{base}/v33-integration/student-manual-preview.html#kingdom', wait_until='domcontentloaded')
        kingdom_frame = kingdom.frame_locator('iframe[title="Kingdom Wars tester realm"]')
        kingdom_frame.get_by_role('heading', name='KINGDOM WARS').wait_for()
        kingdom_frame.get_by_text('Hidden Tester Realm.').wait_for()

        module = context.new_page()
        module.goto(f'{base}/v33-integration/student-manual-preview.html#module/math-operations', wait_until='domcontentloaded')
        frame = module.locator('iframe[data-manual-preview-read-only="true"]')
        frame.wait_for()
        assert frame.get_attribute('sandbox') == 'allow-same-origin'

        browser.close()
    server.shutdown();server.server_close()
    if forbidden:
        raise AssertionError(f'Preview attempted forbidden network requests: {forbidden}')
    print('V3.3 isolated manual browser preview: PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
