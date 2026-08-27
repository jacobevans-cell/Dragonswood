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


def sign_in_embedded_frame(frame, label):
    """Make emulator fixture authentication deterministic inside module iframes."""
    frame.wait_for_function(
        """async () => {
          const appModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const authModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
          const apps=appModule.getApps();
          if(!apps.length)return false;
          const auth=authModule.getAuth(apps[0]);
          return Boolean(auth.emulatorConfig);
        }""",
        timeout=30000,
    )
    frame.evaluate(
        """async ({email,password}) => {
          const appModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const authModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
          let auth=null;
          for(let attempt=0;attempt<200;attempt++){
            const apps=appModule.getApps();
            if(apps.length){
              const candidate=authModule.getAuth(apps[0]);
              if(candidate.emulatorConfig){auth=candidate;break}
            }
            await new Promise(resolve=>setTimeout(resolve,50));
          }
          if(!auth)throw new Error('Embedded Firebase Auth did not become ready on the emulator.');
          if(!auth.currentUser||auth.currentUser.email!==email){
            await authModule.signInWithEmailAndPassword(auth,email,password);
          }
        }""",
        {'email': EMAIL, 'password': PASSWORD},
    )
    if 'dw-env=emulator' not in frame.url:
        raise AssertionError(f'{label} did not retain the fictional emulator environment: {frame.url}')


def wait_for_daily_ready(frame):
    status = frame.locator('#status')
    status.wait_for(timeout=30000)
    deadline = time.monotonic() + 30
    last = ''
    while time.monotonic() < deadline:
        last = (status.text_content() or '').strip()
        if "Today's quest is unlocked." in last:
            return
        if any(marker in last for marker in (
            'sealed or unavailable:',
            'Dragonswood profile error:',
            'requires an Explore Academy',
        )):
            raise AssertionError(f'Daily Quest rejected the fictional emulator fixture: {last}')
        frame.wait_for_timeout(100)
    body = ' '.join((frame.locator('body').inner_text() or '').split())[:1200]
    raise AssertionError(f'Daily Quest did not reach its unlocked state. status={last!r}; body={body!r}')


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
            # The fixture intentionally seeds an active Bathroom pass. The
            # restored safety layer requires check-in before Daily Missions.
            active_pass = page.locator('[data-active-pass-overlay].active')
            if active_pass.count():
                active_pass.wait_for(timeout=10000)
                active_pass.get_by_role(
                    'button', name='✅ I AM BACK — RETURN PASS'
                ).click()
                active_pass.wait_for(state='hidden', timeout=30000)
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
            # Daily Quest uses the scholar's local school date. The Codespace
            # runs in UTC, so pin this fixture to Dragonswood's Arizona clock
            # to match the Phoenix date used by the emulator seed.
            context = browser.new_context(
                viewport={'width': 1440, 'height': 1000},
                timezone_id='America/Phoenix',
            )
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
            daily = daily_frame.element_handle().content_frame()
            assert daily is not None
            sign_in_embedded_frame(daily, 'Daily Quest')
            wait_for_daily_ready(daily)

            page.evaluate("location.hash='#missions'")
            page.get_by_role('heading', name='Your quest path').wait_for()
            page.locator('button[data-module="curriculum-quest"]').click()
            curriculum_frame = page.locator('iframe[title="Curriculum & Recovery Quest"]')
            curriculum_frame.wait_for()
            assert 'dw-env=emulator' in (curriculum_frame.get_attribute('src') or '')
            curriculum = curriculum_frame.element_handle().content_frame()
            assert curriculum is not None
            sign_in_embedded_frame(curriculum, 'Curriculum Quest')
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
