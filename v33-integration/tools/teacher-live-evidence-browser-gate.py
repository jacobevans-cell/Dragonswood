#!/usr/bin/env python3
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
from urllib.parse import quote
from urllib.request import Request, urlopen
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
PASSWORD='V33-Gate-Only-2026!'
FIRESTORE_REST='http://127.0.0.1:8080/v1/projects/demo-dragonswood-v33/databases/(default)/documents'

def firestore_value(value):
    if value is None: return {'nullValue':None}
    if isinstance(value,bool): return {'booleanValue':value}
    if isinstance(value,int): return {'integerValue':str(value)}
    if isinstance(value,float): return {'doubleValue':value}
    if isinstance(value,str): return {'stringValue':value}
    if isinstance(value,list): return {'arrayValue':{'values':[firestore_value(item) for item in value]}}
    if isinstance(value,dict): return {'mapValue':{'fields':firestore_fields(value)}}
    raise TypeError(f'Unsupported Firestore fixture value: {type(value).__name__}')

def firestore_fields(data):
    return {key:firestore_value(value) for key,value in data.items()}

def seed_emulator_document(collection,document_id,data):
    url=f'{FIRESTORE_REST}/{quote(collection,safe="")}/{quote(document_id,safe="")}'
    request=Request(url,data=json.dumps({'fields':firestore_fields(data)}).encode(),method='PATCH',headers={'Authorization':'Bearer owner','Content-Type':'application/json'})
    with urlopen(request,timeout=15) as response:
        if response.status not in (200,201): raise AssertionError(f'Fixture seed failed: {collection}/{document_id} ({response.status})')

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

        fixture=page.evaluate("""async ()=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const db=fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration')),snap=await fs.getDocs(fs.collection(db,'students')),all=snap.docs.map(d=>({id:d.id,name:d.data().firstName||d.data().displayName||'Scholar'})),preferred=all.find(row=>row.name==='Fifth'),rows=[preferred,...all.filter(row=>row!==preferred)].filter(Boolean).slice(0,2);if(rows.length<2)throw new Error('Need two fixture students');await fs.setDoc(fs.doc(db,'classData','activeTeacherAttention'),{active:false,updatedAt:fs.serverTimestamp()},{merge:true});return rows}""")
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
        student=fixture[0]
        seed_emulator_document('classData','gradebookSettings',{'daily':40,'curriculum':40,'reading':20,'readingTargetMinutes':20,'readingAssignedDateKeys':[date_key],'readingTargetsByDate':{date_key:20},'gradeIntegrityVersion':2})
        seed_emulator_document('readingSessions',f"{student['id']}_{date_key}_witches",{'studentId':student['id'],'studentName':student['name'],'bookId':'witches','bookTitle':'The Witches','dateKey':date_key,'activeSeconds':1080,'firstPage':24,'lastPage':31,'pages':[24,31],'status':'in-progress'})
        seed_emulator_document('snackRequests',f"{student['id']}_{date_key}",{'studentId':student['id'],'studentName':student['name'],'dateKey':date_key,'status':'pending'})
        page.locator('[data-page="passes"]').click();page.get_by_role('heading',name='Pass Control').wait_for();page.locator('.pass-list').get_by_text(fixture[0]['name'],exact=True).first.wait_for(timeout=10000)
        page.evaluate("location.hash='#gradebook'");page.get_by_role('heading',name='Dragonswood Gradebook').wait_for();page.get_by_text('WITCHES TIME',exact=True).first.wait_for();page.locator('#gradebook-search').fill(fixture[0]['name']);row=page.locator('[data-grade-student]').filter(has_text=fixture[0]['name']);row.get_by_text('18 verified min',exact=False).wait_for(timeout=10000);assert row.get_by_text('Provisional',exact=True).is_visible();assert row.get_by_text('Complete evidence',exact=True).count()==0;row.click();page.get_by_text('18/20 verified min',exact=False).wait_for(timeout=10000)
        with page.expect_download() as download_info: page.locator('[data-export-gradebook]').click()
        csv=Path(download_info.value.path()).read_text(encoding='utf-8')
        assert csv.splitlines()[0]=='"Scholar","Grade","Total","Total Status","Daily Quest","Curriculum Quest","Witches Time","Verified Minutes","Reading Status","Incomplete Assignments"',csv.splitlines()[0]
        assert f'"{student["name"]}"' in csv and '"Incomplete"' in csv and '"18"' in csv
        page.locator('[data-reading-settings]').click();dialog=page.get_by_role('dialog');dialog.get_by_role('heading',name='Assign The Witches Reading').wait_for();dialog.get_by_text('Time counts only while',exact=False).wait_for();assert dialog.locator('#reading-target-minutes').input_value()=='20';dialog.get_by_role('button',name='Remove assignment').click();dialog.wait_for(state='detached',timeout=10000);row=page.locator('[data-grade-student]').filter(has_text=fixture[0]['name']);row.get_by_text('Recorded',exact=True).wait_for(timeout=10000)
        removal=page.evaluate("""async ({id,dateKey})=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const db=fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration')),settings=(await fs.getDoc(fs.doc(db,'classData','gradebookSettings'))).data(),evidence=await fs.getDoc(fs.doc(db,'readingSessions',`${id}_${dateKey}_witches`));return {targets:settings.readingTargetsByDate||{},dates:settings.readingAssignedDateKeys||[],evidenceExists:evidence.exists()}}""",{'id':student['id'],'dateKey':date_key})
        assert removal=={'targets':{},'dates':[],'evidenceExists':True},removal

        page.evaluate("location.hash='#jobs'");page.get_by_role('heading',name='Guild Jobs & Payroll').wait_for();page.locator('.metric-grid .metric').first.click();dialog=page.get_by_role('dialog');dialog.get_by_text('calculated from the live weekly job records',exact=False).wait_for();dialog.get_by_role('button',name='Close details').click()
        page.evaluate("location.hash='#rewards'");page.get_by_role('heading',name='Class Rewards & Goals').wait_for();page.locator('.goal-card').first.click(position={'x':20,'y':20});page.get_by_role('dialog').get_by_text('Current balance:',exact=False).wait_for()
        browser.close()
    finally:
      server.shutdown();server.server_close()
    if forbidden: raise AssertionError(f'Production Firebase request detected: {forbidden}')
    print('V3.3 teacher live evidence browser gate: PASS (multi-chime + pass receipt + clickable evidence + Witches time grade)')
    return 0

if __name__=='__main__': raise SystemExit(main())
