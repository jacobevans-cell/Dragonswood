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

        teacher=context.new_page();teacher.goto(f'{base}/v33-integration/teacher-test.html?dw-env=emulator&dw-arcade-writes=EMULATOR_ONLY#student-command',wait_until='domcontentloaded')
        sign_in(teacher,'jacobicusjax@gmail.com','DragonswoodV33TeacherIntegration');wait_authorized(teacher)
        teacher.get_by_role('heading',name='Choose Students').wait_for()
        today=teacher.evaluate("state.operations.dateKey")
        teacher.evaluate("""async ({today})=>{
          const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');
          const db=fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration'));
          await fs.setDoc(fs.doc(db,'classCalendarEvents','legacy-browser-event'),{title:'Legacy Browser Event',icon:'📅',category:'school',startDate:today,endDate:today,startTime:'09:15',endTime:'09:45'});
          await fs.setDoc(fs.doc(db,'classData','secondRecess'),{history:[{amount:1,reason:'Legacy class reward',at:'2026-08-01'}]},{merge:true});
        }""",{'today':today})
        teacher.locator('[data-open-passes]').get_by_text('2',exact=True).wait_for(timeout=10000)
        teacher.locator('.attention-strip .attention-item').filter(has_text='Recognition requests').click();teacher.get_by_role('heading',name='Recognition Requests').wait_for()
        teacher.locator('#dialog-root').get_by_role('button',name='Approve +1 XP',exact=True).click();teacher.locator('#toast').get_by_text('Recognition approved',exact=False).wait_for(timeout=10000)

        route(teacher,'passes','Pass Control')
        fourth_request=teacher.locator('.pass-card').filter(has_text='Fourth')
        fourth_request.get_by_role('button',name='Approve',exact=True).click()
        fourth_request.wait_for(state='detached',timeout=10000)
        no_class_request=teacher.locator('.pass-card').filter(has_text='NoClass')
        no_class_request.get_by_role('button',name='Deny',exact=True).click()
        teacher.get_by_text('No students waiting.',exact=True).wait_for(timeout=10000)
        # Stage 4 already returned the seeded visit through the student UI.
        teacher.get_by_text('No active passes.',exact=True).wait_for(timeout=10000)
        teacher.evaluate("""async ({today})=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const db=fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration'));await fs.setDoc(fs.doc(db,'passStatus','overdue-browser'),{studentId:'overdue-browser',studentName:'Overdue Scholar',type:'outOfSeat',dateKey:today,active:true,startedMs:Date.now()-301000,startedAtText:'5 min ago'});}""",{'today':today})
        overdue_card=teacher.locator('.pass-card.pass-overdue').filter(has_text='Overdue Scholar');overdue_card.wait_for(timeout=10000);overdue_card.get_by_text('OVERDUE',exact=True).wait_for();assert 'Overdue' in overdue_card.inner_text() and 'currently active' not in overdue_card.inner_text()
        teacher.evaluate("""async ()=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const db=fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration'));await fs.setDoc(fs.doc(db,'passStatus','overdue-browser'),{active:false},{merge:true});}""")
        overdue_card.wait_for(state='detached',timeout=10000)
        released_slot=teacher.evaluate("""async ()=>{
          const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const store=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');
          const app=apps.getApp('DragonswoodV33TeacherIntegration');
          const snap=await store.getDoc(store.doc(store.getFirestore(app),'bathroomSlots','boy'));
          return snap.exists()?snap.data():{};
        }""")
        assert released_slot.get('occupied') is False
        assert released_slot.get('studentId')==''
        assert released_slot.get('activeVisitId')==''

        route(teacher,'rewards','Class Rewards & Goals')
        body_text=teacher.locator('body').inner_text();assert 'Shared class points' not in body_text and 'Universal point bank' not in body_text
        teacher.get_by_role('heading',name='🕹️ Arcade Tokens').wait_for()
        first_goal=teacher.locator('.goal-card').first
        first_goal.click(position={'x':20,'y':20});legacy_dialog=teacher.get_by_role('dialog');legacy_dialog.get_by_text('+1 • Legacy adjustment',exact=True).wait_for();assert '0 + 1 = 0' not in legacy_dialog.inner_text();legacy_dialog.get_by_role('button',name='Close evidence').click()

        route(teacher,'arcade','Arcade Time Command')
        assert teacher.locator('#arcade-period').evaluate("el=>el.tagName")=='SELECT'
        teacher.locator('#arcade-period').get_by_text('Live Emulator Math',exact=False).wait_for()
        assert teacher.get_by_text('One-time session refund',exact=True).count()==0
        arcade_checks=teacher.locator('[data-arcade-student]');assert arcade_checks.count()>=2
        arcade_checks.nth(0).check();arcade_checks.nth(1).check();teacher.get_by_role('heading',name='2 selected',exact=True).first.wait_for()
        selected_names=teacher.locator('.arcade-roster-checklist').inner_text();assert selected_names

        route(teacher,'tools','Classroom Tools')
        teacher.get_by_role('button',name='Open Seating Command & Room Builder').click()
        seating_frame=teacher.frame_locator('iframe[title="Seating Command and Room Builder"]')
        seating_frame.get_by_role('heading',name='Seating Command').wait_for(timeout=30000)
        assert seating_frame.get_by_text('Teacher authorization required',exact=True).count()==0
        teacher.get_by_role('dialog').get_by_role('button',name='Close seating tools').click()

        route(teacher,'jobs','Guild Jobs & Payroll');teacher.locator('.payroll-total strong').get_by_text('50 Gold',exact=True).wait_for()
        teacher.locator('.payroll-panel').get_by_role('button',name='Approve Friday Payroll',exact=True).click();teacher.locator('#confirm-payroll').click()
        teacher.locator('#toast').get_by_text('1 payroll payment',exact=False).wait_for(timeout=10000)
        payroll_done=teacher.locator('.payroll-panel [data-payroll][disabled]')
        payroll_done.wait_for(timeout=10000)
        assert 'Friday Payroll Approved' in (payroll_done.text_content() or '')

        route(teacher,'schedule','Schedule & Calendar');teacher.locator('.timeline-teacher-row b').get_by_text('Live Emulator Math',exact=True).wait_for()
        teacher.get_by_text('Legacy Browser Event',exact=True).wait_for(timeout=10000)
        teacher.locator(f'[data-calendar-date="{today}"]').wait_for();assert 'has-events' in (teacher.locator(f'[data-calendar-date="{today}"]').get_attribute('class') or '')
        teacher.locator('[data-calendar-add]').click();calendar_dialog=teacher.get_by_role('dialog');calendar_dialog.locator('#calendar-title').fill('Browser Added Event');calendar_dialog.locator('#calendar-start-date').fill(today);calendar_dialog.locator('#calendar-end-date').fill(today);calendar_dialog.get_by_role('button',name='Add event').click()
        added=teacher.locator('[data-calendar-event]').filter(has_text='Browser Added Event');added.wait_for(timeout=10000);added.get_by_role('button',name='Edit').click();edit_dialog=teacher.get_by_role('dialog');edit_dialog.locator('#calendar-title').fill('Browser Updated Event');edit_dialog.get_by_role('button',name='Save changes').click()
        updated=teacher.locator('[data-calendar-event]').filter(has_text='Browser Updated Event');updated.wait_for(timeout=10000);updated.get_by_role('button',name='Delete').click();teacher.get_by_role('dialog').get_by_role('button',name='Delete event').click();updated.wait_for(state='detached',timeout=10000)
        teacher.locator('[data-save-schedule]').click();teacher.locator('#toast').get_by_text('schedule saved to the fictional Firebase emulator.',exact=False).wait_for(timeout=10000)

        route(teacher,'leaderboards','Leaderboard Command');assert teacher.get_by_text('Historic Scholar',exact=True).count()==0
        teacher.get_by_role('button',name='All Time').click();teacher.get_by_role('heading',name='All-Time XP Standings').wait_for();teacher.get_by_text('Historic Scholar',exact=True).wait_for(timeout=10000);assert teacher.locator('[data-reward-leaders]').count()==0
        teacher.get_by_role('button',name='This Week').click();teacher.get_by_role('heading',name='Weekly XP Standings').wait_for();teacher.locator('[data-reward-leaders]').click();teacher.locator('#confirm-leader-rewards').click()
        teacher.locator('#toast').get_by_text('new weekly leaderboard reward',exact=False).wait_for(timeout=10000)

        student=context.new_page();student.goto(f'{base}/v33-integration/student-test.html?dw-env=emulator#adventure',wait_until='domcontentloaded')
        sign_in(student,'grade5@explore.academy');wait_authorized(student);student.get_by_role('heading',name='Ready for today’s quest?').wait_for()
        readable=student.evaluate("() => DWV33Narration.readableText('#page-content')")
        assert 'Sign out' not in readable and 'Start today’s mission' not in readable
        student.locator('[data-read]').first.click();student.wait_for_function("() => !!window.DWNarrator",timeout=30000)
        student.locator('.dw-narrator').wait_for(timeout=10000);assert student.locator('.dw-narrator-launcher').count()==1
        student.wait_for_selector('#dwSuggestButton',timeout=30000);student.evaluate("showToast('Pass request sent to your teacher.')");student.locator('#toast.show').wait_for()
        toast_box=student.locator('#toast').bounding_box();suggest_box=student.locator('#dwSuggestButton').bounding_box();assert toast_box and suggest_box
        intersects=not (toast_box['x']+toast_box['width']<=suggest_box['x'] or suggest_box['x']+suggest_box['width']<=toast_box['x'] or toast_box['y']+toast_box['height']<=suggest_box['y'] or suggest_box['y']+suggest_box['height']<=toast_box['y'])
        assert not intersects,f'Pass toast intersects suggestion control: toast={toast_box}, suggestion={suggest_box}'
        browser.close()
    finally:
      server.shutdown();server.server_close()
    if forbidden: raise AssertionError(f'Teacher Operations attempted a production Firebase request: {forbidden}')
    print('V3.3 Teacher daily-use browser gate: PASS (nine repairs + Seating auth + legacy calendar CRUD + toast geometry)')
    return 0

if __name__=='__main__': raise SystemExit(main())
