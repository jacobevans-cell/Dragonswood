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
    page.get_by_role('button', name='Sign in with Google').wait_for(timeout=30000)
    page.evaluate(
        """async ({email,password}) => {
          const appModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const authModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
          let app=null;
          for(let attempt=0;attempt<100&&!app;attempt++){
            try{app=appModule.getApp()}catch{await new Promise(resolve=>setTimeout(resolve,50))}
          }
          if(!app)throw new Error('V3.3 Firebase app did not become ready.');
          await authModule.signInWithEmailAndPassword(authModule.getAuth(app),email,password);
        }""",
        {'email': EMAIL, 'password': PASSWORD},
    )


def wait_for_authorized(page):
    deadline=time.monotonic()+30
    while time.monotonic()<deadline:
        state=page.evaluate("() => typeof integrationSession==='undefined'?{status:'missing'}:{status:integrationSession.status||'',message:integrationSession.message||''}")
        if state['status']=='authorized':
            page.get_by_role('button', name='Passes').wait_for(timeout=10000)
            return
        if state['status'] in ('error','unauthorized','blocked'):
            raise AssertionError(f'V3.3 authorization failed: {state}')
        page.wait_for_timeout(100)
    raise AssertionError('V3.3 authorization timed out')


def pass_action(page, pass_type, expected_action, expected_label):
    page.wait_for_function(
        "({type,action}) => state.passes?.rows?.[type]?.action === action",
        arg={'type': pass_type, 'action': expected_action},
        timeout=10000,
    )
    page.get_by_role('button', name='Passes').click()
    button=page.locator(f'[data-use-student-pass="{pass_type}"]')
    button.wait_for(timeout=10000)
    if button.inner_text().strip()!=expected_label:
        raise AssertionError(f'{pass_type} expected {expected_label!r}, got {button.inner_text().strip()!r}')
    button.click()
    page.locator('[role="dialog"]').wait_for(state='detached', timeout=10000)


def main():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    forbidden=[]
    try:
        with sync_playwright() as pw:
            launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
            if Path('/usr/bin/chromium').exists(): launch['executable_path']='/usr/bin/chromium'
            browser=pw.chromium.launch(**launch)
            context=browser.new_context(viewport={'width':1440,'height':1000},timezone_id='America/Phoenix')
            context.on('request',lambda request: forbidden.append(request.url) if 'dragonswood-9289e' in request.url or 'firestore.googleapis.com' in request.url else None)
            page=context.new_page()
            page.goto(f'{base}/v33-integration/student-test.html?dw-env=emulator#adventure',wait_until='domcontentloaded')
            sign_in(page)
            wait_for_authorized(page)
            # Teacher Operations runs first and correctly returns the seeded
            # active visit. Exercise a complete fresh cycle from that state.
            pass_action(page,'bathroom','start','🚻 Use Bathroom pass')
            pass_action(page,'bathroom','return','✅ I am back')
            pass_action(page,'bathroom','start','🚻 Use Bathroom pass')
            page.wait_for_function(
                "() => state.passes?.rows?.bathroom?.action === 'return'",
                timeout=10000,
            )
            page.get_by_role('button', name='Passes').click()
            page.locator('[data-use-student-pass="bathroom"]').get_attribute('disabled')
            assert page.locator('[data-use-student-pass="bathroom"]').inner_text().strip()=='✅ I am back'
            browser.close()
    finally:
        server.shutdown();server.server_close()
    if forbidden:
        raise AssertionError(f'Student beta gate attempted production Firebase: {forbidden}')
    print('V3.3 student beta browser gate: PASS (live pass return + start transaction)')
    return 0


if __name__=='__main__':
    raise SystemExit(main())
