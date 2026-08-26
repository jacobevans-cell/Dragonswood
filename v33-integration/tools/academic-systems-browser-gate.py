#!/usr/bin/env python3
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import time
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
PASSWORD = 'V33-Gate-Only-2026!'


class QuietHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *_args):
        return


def sign_in(page, email, app_name=''):
    page.get_by_role('button', name='Sign in with Google').wait_for(timeout=30000)
    page.evaluate(
        """async ({email,password,appName}) => {
          const appModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const authModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
          let app=null;
          for(let attempt=0;attempt<120&&!app;attempt++){
            app=appModule.getApps().find(candidate=>candidate.name===(appName||'[DEFAULT]'))||null;
            if(!app)await new Promise(resolve=>setTimeout(resolve,50));
          }
          if(!app)throw new Error(`Firebase app ${appName||'[DEFAULT]'} did not become ready.`);
          await authModule.signInWithEmailAndPassword(authModule.getAuth(app),email,password);
        }""",
        {'email': email, 'password': PASSWORD, 'appName': app_name},
    )


def wait_authorized(page, expected_heading, route):
    deadline = time.monotonic() + 30
    last = {'status': 'unknown', 'message': ''}
    while time.monotonic() < deadline:
        last = page.evaluate("() => ({status:integrationSession?.status||'',message:integrationSession?.message||''})")
        if last['status'] == 'authorized':
            page.evaluate("route => { location.hash='#'+route }", route)
            page.get_by_role('heading', name=expected_heading).wait_for(timeout=10000)
            return
        if last['status'] in ('error', 'unauthorized', 'blocked'):
            raise AssertionError(f'V3.3 authorization failed: {last}')
        page.wait_for_timeout(100)
    raise AssertionError(f'V3.3 authorization timed out: {last}')


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
            context.on('request', lambda request: forbidden.append(request.url) if 'dragonswood-9289e' in request.url or 'firestore.googleapis.com' in request.url else None)

            student = context.new_page()
            student.goto(f'{base}/v33-integration/student-test.html?dw-env=emulator#scribe', wait_until='domcontentloaded')
            sign_in(student, 'grade5@explore.academy')
            wait_authorized(student, 'Turn your ideas into magic', 'scribe')
            student.get_by_role('heading', name='Teacher Mission').wait_for()
            response = 'The fairest realm rule gives every scholar a turn because shared choices protect people and make the whole kingdom stronger.'
            student.get_by_label('Your writing').fill(response)
            student.wait_for_timeout(800)
            student.get_by_role('button', name='Submit quickwrite').click()
            student.get_by_role('heading', name='Checkpoint submitted').wait_for(timeout=10000)
            student.get_by_role('button', name='Done').click()
            student.evaluate("location.hash='#games'")
            student.get_by_role('heading', name='Choose your adventure').wait_for()
            assert student.locator('.game-card').count() == 6
            assert student.evaluate("""() => DWV33Academic.GAME_CATALOG.every(game => {
              const mod=DWV33Modules.definition(game.id);
              return mod && DWV33Modules.href(game.id,location.href,'emulator').includes('dw-env=emulator');
            })""")

            teacher = context.new_page()
            teacher.goto(f'{base}/v33-integration/teacher-test.html?dw-env=emulator#gradebook', wait_until='domcontentloaded')
            sign_in(teacher, 'jacobicusjax@gmail.com', 'DragonswoodV33TeacherIntegration')
            wait_authorized(teacher, 'Dragonswood Gradebook', 'gradebook')
            teacher.locator('.grade-table').get_by_text('Fifth', exact=True).wait_for()
            teacher.evaluate("location.hash='#scribe'")
            teacher.get_by_role('heading', name='Scribe Arena Command').wait_for()
            teacher.get_by_text('Mission active', exact=True).wait_for()
            response_card = teacher.locator('.pass-card').filter(has_text='Fifth').first
            response_card.get_by_role('button', name='Review').click()
            teacher.get_by_role('heading', name='Review Fifth').wait_for()
            teacher.locator('#writing-review-score').fill('18')
            teacher.locator('#writing-review-feedback').fill('Strong evidence and a clear reason.')
            teacher.get_by_role('button', name='Save review').click()
            teacher.locator('#toast').get_by_text('Teacher review saved to the fictional emulator.').wait_for(timeout=10000)
            browser.close()
    finally:
        server.shutdown()
        server.server_close()

    if forbidden:
        raise AssertionError(f'Academic Systems attempted a production Firebase request: {forbidden}')
    print('V3.3 Academic Systems browser gate: PASS (Scribe + gradebook + 11-game catalog)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
