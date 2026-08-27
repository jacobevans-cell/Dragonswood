#!/usr/bin/env python3
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import time
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
PASSWORD='V33-Gate-Only-2026!'

class QuietHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store');super().end_headers()
    def log_message(self,*_args): return

def sign_in(page,email,app_name=''):
    page.get_by_role('button',name='Sign in with Google').wait_for(timeout=30000)
    page.evaluate("""async ({email,password,appName})=>{
      const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
      const auth=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
      let app=null;for(let i=0;i<120&&!app;i++){app=apps.getApps().find(x=>x.name===(appName||'[DEFAULT]'))||null;if(!app)await new Promise(r=>setTimeout(r,50));}
      if(!app)throw new Error('Firebase app did not become ready.');
      await auth.signInWithEmailAndPassword(auth.getAuth(app),email,password);
    }""",{'email':email,'password':PASSWORD,'appName':app_name})

def wait_authorized(page):
    deadline=time.monotonic()+30;last={}
    while time.monotonic()<deadline:
        last=page.evaluate("() => ({status:integrationSession?.status||'',message:integrationSession?.message||''})")
        if last['status']=='authorized': return
        if last['status'] in ('error','unauthorized','blocked'): raise AssertionError(last)
        page.wait_for_timeout(100)
    raise AssertionError(f'Authorization timed out: {last}')

def route(page,name,heading):
    page.evaluate("name=>{location.hash='#'+name}",name)
    page.get_by_role('heading',name=heading).wait_for(timeout=30000)

def main():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}';forbidden=[]
    try:
      with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
        if Path('/usr/bin/chromium').exists(): launch['executable_path']='/usr/bin/chromium'
        browser=pw.chromium.launch(**launch);context=browser.new_context(viewport={'width':1440,'height':1000},timezone_id='America/Phoenix')
        live_project='dragonswood-'+'9289e';live_api='firestore.googleapis'+'.com'
        context.on('request',lambda request: forbidden.append(request.url) if live_project in request.url or live_api in request.url else None)

        teacher=context.new_page();teacher.goto(f'{base}/v33-integration/teacher-test.html?dw-env=emulator#student-command',wait_until='domcontentloaded')
        sign_in(teacher,'jacobicusjax@gmail.com','DragonswoodV33TeacherIntegration');wait_authorized(teacher)
        teacher.get_by_role('heading',name='Choose Students').wait_for()
        teacher.locator('[data-review-recognition]').click();teacher.get_by_role('heading',name='Recognition Requests').wait_for()
        teacher.locator('#dialog-root').get_by_role('button',name='Approve +1 XP',exact=True).click();teacher.locator('#toast').get_by_text('Recognition approved',exact=False).wait_for(timeout=10000)

        route(teacher,'passes','Pass Control')
        fourth_request=teacher.locator('.pass-card').filter(has_text='Fourth')
        fourth_request.get_by_role('button',name='Approve',exact=True).click()
        fourth_request.wait_for(state='detached',timeout=10000)
        no_class_request=teacher.locator('.pass-card').filter(has_text='NoClass')
        no_class_request.get_by_role('button',name='Deny',exact=True).click()
        teacher.get_by_text('No students waiting.',exact=True).wait_for(timeout=10000)
        fifth_active=teacher.locator('.active-pass').filter(has_text='Fifth')
        fifth_active.get_by_role('button',name='Mark Returned',exact=True).click()
        teacher.get_by_text('No active passes.',exact=True).wait_for(timeout=10000)

        route(teacher,'rewards','Class Rewards & Goals')
        teacher.locator('#class-points-reason').fill('Browser gate reward');teacher.locator('[data-points="5"]').click()
        teacher.locator('.class-point-number strong').get_by_text('70',exact=True).wait_for(timeout=10000)
        teacher.locator('#universal-amount').fill('5');teacher.locator('.flex-bank').get_by_role('button',name='Assign',exact=True).click()
        teacher.locator('.universal-points').get_by_text('19',exact=True).wait_for(timeout=10000)

        route(teacher,'jobs','Guild Jobs & Payroll');teacher.locator('.payroll-total strong').get_by_text('50 Gold',exact=True).wait_for()
        teacher.locator('.payroll-panel').get_by_role('button',name='Approve Friday Payroll',exact=True).click();teacher.locator('#confirm-payroll').click()
        teacher.locator('#toast').get_by_text('1 payroll payment',exact=False).wait_for(timeout=10000)
        payroll_done=teacher.locator('.payroll-panel [data-payroll][disabled]')
        payroll_done.wait_for(timeout=10000)
        assert 'Friday Payroll Approved' in (payroll_done.text_content() or '')

        route(teacher,'schedule','Schedule & Calendar');teacher.locator('.timeline-teacher-row b').get_by_text('Live Emulator Math',exact=True).wait_for()
        teacher.locator('[data-save-schedule]').click();teacher.locator('#toast').get_by_text('schedule saved to the fictional Firebase emulator.',exact=False).wait_for(timeout=10000)

        route(teacher,'leaderboards','Leaderboard Command');teacher.locator('[data-reward-leaders]').click();teacher.locator('#confirm-leader-rewards').click()
        teacher.locator('#toast').get_by_text('new weekly leaderboard reward',exact=False).wait_for(timeout=10000)

        student=context.new_page();student.goto(f'{base}/v33-integration/student-test.html?dw-env=emulator#adventure',wait_until='domcontentloaded')
        sign_in(student,'grade5@explore.academy');wait_authorized(student);student.get_by_role('heading',name='Ready for today’s quest?').wait_for()
        readable=student.evaluate("() => DWV33Narration.readableText('#page-content')")
        assert 'Sign out' not in readable and 'Start today’s mission' not in readable
        student.locator('[data-read]').first.click();student.wait_for_function("() => !!window.DWNarrator",timeout=30000)
        student.locator('.dw-narrator').wait_for(timeout=10000);assert student.locator('.dw-narrator-launcher').count()==1
        browser.close()
    finally:
      server.shutdown();server.server_close()
    if forbidden: raise AssertionError(f'Teacher Operations attempted a production Firebase request: {forbidden}')
    print('V3.3 Teacher Operations + Cedar browser gate: PASS (passes + recognition + rewards + payroll + schedule + leaders + narration)')
    return 0

if __name__=='__main__': raise SystemExit(main())
