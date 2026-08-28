#!/usr/bin/env python3
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
PASSWORD='V33-Gate-Only-2026!'

class QuietHandler(SimpleHTTPRequestHandler):
    def end_headers(self): self.send_header('Cache-Control','no-store');super().end_headers()
    def log_message(self,*_args): return

def main():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}';forbidden=[]
    try:
      with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
        if Path('/usr/bin/chromium').exists(): launch['executable_path']='/usr/bin/chromium'
        browser=pw.chromium.launch(**launch);context=browser.new_context(viewport={'width':1680,'height':1050},timezone_id='America/Phoenix')
        context.on('request',lambda request: forbidden.append(request.url) if 'dragonswood-9289e' in request.url or 'firestore.googleapis.com' in request.url else None)
        page=context.new_page();page.goto(f'{base}/v33-integration/teacher-test.html?dw-env=emulator#student-command',wait_until='domcontentloaded')
        page.get_by_role('button',name='Sign in with Google').wait_for(timeout=30000)
        page.evaluate("""async ({email,password})=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const auth=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');let app;for(let i=0;i<120&&!app;i++){app=apps.getApps().find(x=>x.name==='DragonswoodV33TeacherIntegration');if(!app)await new Promise(r=>setTimeout(r,50))}await auth.signInWithEmailAndPassword(auth.getAuth(app),email,password)}""",{'email':'jacobicusjax@gmail.com','password':PASSWORD})
        page.wait_for_function("() => integrationSession?.status==='authorized'",timeout=30000)
        page.get_by_role('heading',name='Teacher Attention').wait_for()
        attention=page.locator('.teacher-attention-panel')
        assert page.evaluate("getComputedStyle(document.querySelector('.teacher-attention-scroll')).overflowY")=='visible'
        assert 'Alerts permanently on' not in page.locator('body').inner_text()

        fixture=page.evaluate("""async ()=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const db=fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration')),snap=await fs.getDocs(fs.collection(db,'students')),rows=snap.docs.slice(0,2).map(d=>({id:d.id,name:d.data().firstName||d.data().displayName||'Scholar'}));if(rows.length<2)throw new Error('Need two fixture students');await fs.setDoc(fs.doc(db,'classData','activeTeacherAttention'),{active:false,updatedAt:fs.serverTimestamp()},{merge:true});return rows}""")
        attention.get_by_role('button',name='Selected students').wait_for(timeout=10000)
        attention.get_by_role('button',name='Selected students').click()
        checks=attention.locator('[data-attention-student]');checks.nth(0).check();checks.nth(1).check()
        selected_badge=attention.locator('.attention-audience .selected-badge')
        selected_badge.wait_for();assert selected_badge.inner_text()=='2 selected'
        assert attention.locator('[data-send-attention]').is_visible()
        attention.locator('#attention-message').fill('Two-student evidence check.');attention.locator('[data-send-attention]').click()
        attention.get_by_text('2 selected • 0 / 2 acknowledged',exact=False).wait_for(timeout=10000)
        stored=page.evaluate("""async ()=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');return (await fs.getDoc(fs.doc(fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration')),'classData','activeTeacherAttention'))).data()}""")
        assert stored.get('all') is False and len(stored.get('studentIds',[]))==2,stored
        attention.locator('[data-close-attention]').click()

        date_key=page.evaluate("new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix'}).format(new Date())")
        page.evaluate("""async ({student,dateKey})=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const db=fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration'));await fs.setDoc(fs.doc(db,'classData','gradebookSettings'),{daily:40,curriculum:40,reading:20,readingTargetMinutes:20,readingAssignedDateKeys:[dateKey],updatedAt:fs.serverTimestamp()},{merge:true});await fs.setDoc(fs.doc(db,'readingSessions',`${student.id}_${dateKey}_witches`),{studentId:student.id,studentName:student.name,bookId:'witches',bookTitle:'The Witches',dateKey,activeSeconds:1080,targetMinutes:20,firstPage:24,lastPage:31,pages:[24,31],status:'in-progress',updatedAt:fs.serverTimestamp()},{merge:true});await fs.setDoc(fs.doc(db,'snackRequests',`${student.id}_${dateKey}`),{studentId:student.id,studentName:student.name,dateKey,status:'pending',createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()},{merge:true})}""",{'student':fixture[0],'dateKey':date_key})
        page.locator('[data-page="passes"]').click();page.get_by_role('heading',name='Pass Control').wait_for();page.locator('.pass-list').get_by_text(fixture[0]['name'],exact=True).first.wait_for(timeout=10000)
        page.evaluate("location.hash='#gradebook'");page.get_by_role('heading',name='Dragonswood Gradebook').wait_for();page.get_by_text('Witches Time',exact=True).wait_for();page.locator('#gradebook-search').fill(fixture[0]['name']);row=page.locator('[data-grade-student]').filter(has_text=fixture[0]['name']);row.get_by_text('18 verified min',exact=False).wait_for(timeout=10000);row.click();page.get_by_text('18/20 verified min',exact=False).wait_for(timeout=10000)
        page.locator('[data-reading-settings]').click();dialog=page.get_by_role('dialog');dialog.get_by_role('heading',name='Assign The Witches Reading').wait_for();dialog.get_by_text('Time counts only while',exact=False).wait_for();dialog.get_by_role('button',name='Cancel').click()

        page.evaluate("location.hash='#jobs'");page.get_by_role('heading',name='Guild Jobs & Payroll').wait_for();page.locator('.metric-grid .metric').first.click();dialog=page.get_by_role('dialog');dialog.get_by_text('calculated from the live weekly job records',exact=False).wait_for();dialog.get_by_role('button',name='Close details').click()
        page.evaluate("location.hash='#rewards'");page.get_by_role('heading',name='Class Rewards & Goals').wait_for();page.locator('.goal-card').first.click(position={'x':20,'y':20});page.get_by_role('dialog').get_by_text('Current balance:',exact=False).wait_for()
        browser.close()
    finally:
      server.shutdown();server.server_close()
    if forbidden: raise AssertionError(f'Production Firebase request detected: {forbidden}')
    print('V3.3 teacher live evidence browser gate: PASS (multi-chime + pass receipt + clickable evidence + Witches time grade)')
    return 0

if __name__=='__main__': raise SystemExit(main())
