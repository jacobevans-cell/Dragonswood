#!/usr/bin/env python3
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import time
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
EMAIL = 'grade5@explore.academy'
PASSWORD = 'V33-Gate-Only-2026!'


class QuietHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *_args):
        return


def sign_in(page):
    page.wait_for_function("window.DWV33Integration?.environment === 'emulator'")
    # DWV33Integration is published before its async Firebase SDK/bootstrap
    # finishes. The visible sign-in control is the reliable signal that the
    # default app and Auth emulator connection are ready for this fixture login.
    page.get_by_role('button', name='Sign in with Google').wait_for(timeout=30000)
    page.evaluate(
        """async ({email,password}) => {
          const appModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const authModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
          let app=null;
          for(let attempt=0;attempt<100&&!app;attempt++){
            try{app=appModule.getApp()}catch{await new Promise(resolve=>setTimeout(resolve,50))}
          }
          if(!app)throw new Error('V3.3 Firebase app did not become ready for the browser gate.');
          const auth=authModule.getAuth(app);
          await authModule.signInWithEmailAndPassword(auth,email,password);
        }""",
        {'email': EMAIL, 'password': PASSWORD},
    )


def wait_for_authorized_portal(page):
    deadline = time.monotonic() + 30
    last = {'status': 'unknown', 'message': ''}
    while time.monotonic() < deadline:
        last = page.evaluate(
            """() => typeof integrationSession === 'undefined'
              ? ({status:'missing',message:'integrationSession is not defined'})
              : ({status:integrationSession.status||'',message:integrationSession.message||''})"""
        )
        if last['status'] == 'authorized':
            page.evaluate("location.hash='#missions'")
            page.get_by_role('heading', name='Your quest path').wait_for(timeout=10000)
            return
        if last['status'] in ('error', 'unauthorized', 'blocked'):
            raise AssertionError(f"V3.3 authorization failed: {last}")
        page.wait_for_timeout(100)
    raise AssertionError(f"V3.3 authorization timed out: {last}")


def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    forbidden = []

    try:
        with sync_playwright() as pw:
            launch = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
            if Path('/usr/bin/chromium').exists():
                launch['executable_path'] = '/usr/bin/chromium'
            browser = pw.chromium.launch(**launch)
            context = browser.new_context(viewport={'width': 1440, 'height': 1000})
            context.on(
                'request',
                lambda request: forbidden.append(request.url)
                if 'dragonswood-9289e' in request.url or 'firestore.googleapis.com' in request.url
                else None,
            )

            page = context.new_page()
            page.goto(f'{base}/v33-integration/student-test.html?dw-env=emulator#missions', wait_until='domcontentloaded')
            sign_in(page)
            wait_for_authorized_portal(page)
            morning = page.locator('.mission-row').filter(has_text='Morning Math Quest')
            morning.locator('.eyebrow', has_text='COMPLETE').wait_for()

            page.evaluate("location.hash='#module/daily-quest'")
            daily_frame = page.locator('iframe[title="Today\'s Daily Quest"]')
            daily_frame.wait_for()
            assert 'dw-env=emulator' in (daily_frame.get_attribute('src') or '')
            page.frame_locator('iframe[title="Today\'s Daily Quest"]').get_by_text("Today's quest is unlocked.", exact=False).wait_for(timeout=30000)

            page.evaluate("location.hash='#missions'")
            page.get_by_role('heading', name='Your quest path').wait_for()
            page.locator('button[data-module="curriculum-quest"]').click()
            curriculum_frame = page.locator('iframe[title="Curriculum & Recovery Quest"]')
            curriculum_frame.wait_for()
            assert 'dw-env=emulator' in (curriculum_frame.get_attribute('src') or '')
            curriculum = page.frame_locator('iframe[title="Curriculum & Recovery Quest"]')
            curriculum.get_by_role('heading', name='5th Grade • Semester 1 • Day 14').wait_for(timeout=30000)
            assert curriculum.locator('#authStatus').text_content() == '✓ Signed in'

            browser.close()
    finally:
        server.shutdown()
        server.server_close()

    if forbidden:
        raise AssertionError(f'Stage 4 attempted a production Firebase request: {forbidden}')
    print('V3.3 Stage 4 embedded Daily + Curriculum browser gate: PASS')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
