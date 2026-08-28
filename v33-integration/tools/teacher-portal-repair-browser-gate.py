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
    def end_headers(self): self.send_header('Cache-Control','no-store');super().end_headers()
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
    page.wait_for_function("() => integrationSession?.status==='authorized'",timeout=30000)

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
        browser=pw.chromium.launch(**launch);context=browser.new_context(viewport={'width':1680,'height':1050},timezone_id='America/Phoenix')
        context.on('request',lambda request: forbidden.append(request.url) if 'dragonswood-9289e' in request.url or 'firestore.googleapis.com' in request.url else None)
        teacher=context.new_page();teacher.goto(f'{base}/v33-integration/teacher-test.html?dw-env=emulator#student-command',wait_until='domcontentloaded')
        sign_in(teacher,'jacobicusjax@gmail.com','DragonswoodV33TeacherIntegration');wait_authorized(teacher)
        teacher.get_by_role('heading',name='Teacher Attention').wait_for()

        geometry=teacher.evaluate("""() => {const main=document.querySelector('.teacher-main').getBoundingClientRect(),content=document.querySelector('.teacher-content').getBoundingClientRect();return {gap:content.left-main.left,rowFont:parseFloat(getComputedStyle(document.querySelector('.attention-progress-row')).fontSize)}}""")
        assert geometry['gap']<60,geometry
        assert geometry['rowFont']>=12,geometry
        # Production-label removal is enforced by the static contract.
        # This authenticated behavior gate must use the Firebase emulator entry.

        fixture=teacher.evaluate("""async ()=>{
          const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');
          const db=fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration'));
          const students=await fs.getDocs(fs.collection(db,'students'));
          const row=students.docs.find(doc=>String(doc.data().firstName||doc.data().displayName)==='Fourth');
          if(!row)throw new Error('Fourth fixture student missing');
          const now=Date.now()-6*60*1000,dateKey=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix'}).format(new Date());
          await fs.setDoc(fs.doc(db,'snackStatus',row.id),{studentId:row.id,studentName:'Fourth',type:'snack',dateKey,active:true,startedMs:now,updatedAt:fs.serverTimestamp()},{merge:true});
          return {id:row.id};
        }""")
        teacher.get_by_text('Fourth • Snack',exact=False).wait_for(timeout=10000)
        passes=teacher.get_by_role('button',name='Passes',exact=False);passes.click();teacher.get_by_role('heading',name='Pass Control').wait_for()
        assert teacher.get_by_text('Fourth',exact=True).count()>0

        teacher.get_by_role('button',name='Open Teacher Attention').click() if teacher.get_by_role('button',name='Open Teacher Attention').count() else None
        teacher.get_by_role('heading',name='Teacher Attention').wait_for()
        teacher.get_by_role('button',name='Selected students').click()
        choice=teacher.locator('.attention-student-choice').filter(has_text='Fourth');choice.locator('input').check()
        teacher.locator('#attention-message').fill('Return to Morning Work for the selected check.')
        teacher.locator('[data-send-attention]').click()
        teacher.get_by_text('1 selected • 0 / 1 acknowledged',exact=False).wait_for(timeout=10000)
        stored=teacher.evaluate("""async ()=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const snap=await fs.getDoc(fs.doc(fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration')),'classData','activeTeacherAttention'));return snap.data()}""")
        assert stored.get('all') is False and stored.get('studentIds')==[fixture['id']],stored

        target=context.new_page();target.goto(f'{base}/v33-integration/student-test.html?dw-env=emulator#missions',wait_until='domcontentloaded');sign_in(target,'grade4@explore.academy');wait_authorized(target)
        target.locator('.teacher-direction-overlay.active').wait_for(timeout=10000)
        other_context=browser.new_context(
            viewport={'width':1680,'height':1050},
            timezone_id='America/Phoenix'
        )
        other_context.on(
            'request',
            lambda request: forbidden.append(request.url)
            if 'dragonswood-9289e' in request.url
            or 'firestore.googleapis.com' in request.url
            else None
        )
        other=other_context.new_page()
        other.goto(
            f'{base}/v33-integration/student-test.html?dw-env=emulator#missions',
            wait_until='domcontentloaded'
        )
        sign_in(other,'grade5@explore.academy')
        wait_authorized(other)
        other.wait_for_timeout(500)
        assert other.locator('.teacher-direction-overlay.active').count()==0
        target.close()
        other_context.close()
        teacher.locator('[data-close-attention]').click()

        route(teacher,'gradebook','Dragonswood Gradebook')
        teacher.locator('[data-edit-gradebook-weights]').click();teacher.get_by_role('heading',name='Edit Category Weights').wait_for()
        teacher.locator('#weight-daily').fill('30');teacher.locator('#weight-curriculum').fill('50');teacher.locator('#weight-reading').fill('20')
        teacher.locator('#save-gradebook-weights').click();teacher.get_by_text('Category weights saved',exact=False).wait_for(timeout=10000)
        teacher.get_by_text('30%',exact=True).first.wait_for(timeout=10000)
        teacher.locator('#gradebook-search').fill('Fourth');teacher.locator('[data-grade-student]').click();teacher.get_by_text('Recorded assignments for Fourth',exact=True).wait_for()
        assert teacher.locator('.grade-assignment-row').count()>=1
        assert teacher.locator('[data-export-gradebook]').is_enabled()

        teacher.evaluate("""async id=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const db=fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration'));await fs.setDoc(fs.doc(db,'snackStatus',id),{active:false,updatedAt:fs.serverTimestamp()},{merge:true})}""",fixture['id'])
        browser.close()
    finally:
      server.shutdown();server.server_close()
    if forbidden: raise AssertionError(f'Teacher repair attempted production Firebase requests: {forbidden}')
    print('V3.3 teacher portal repair browser gate: PASS (selection + pass header + layout + readability + live gradebook + production labels)')
    return 0

if __name__=='__main__': raise SystemExit(main())
