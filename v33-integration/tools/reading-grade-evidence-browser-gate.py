#!/usr/bin/env python3
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from threading import Thread
import time
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError
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

def set_emulator_document(collection,document_id,data):
    url=f'{FIRESTORE_REST}/{quote(collection,safe="")}/{quote(document_id,safe="")}'
    request=Request(url,data=json.dumps({'fields':firestore_fields(data)}).encode(),method='PATCH',headers={'Authorization':'Bearer owner','Content-Type':'application/json'})
    with urlopen(request,timeout=15) as response:
        if response.status not in (200,201): raise AssertionError(f'Fixture seed failed: {collection}/{document_id} ({response.status})')

def assert_emulator_document_missing(collection,document_id):
    url=f'{FIRESTORE_REST}/{quote(collection,safe="")}/{quote(document_id,safe="")}'
    try:
        with urlopen(Request(url,headers={'Authorization':'Bearer owner'}),timeout=15):
            raise AssertionError(f'Expected no pre-seeded evidence at {collection}/{document_id}')
    except HTTPError as error:
        if error.code!=404: raise

class QuietHandler(SimpleHTTPRequestHandler):
    def end_headers(self): self.send_header('Cache-Control','no-store');super().end_headers()
    def log_message(self,*_args): return

def sign_in(page,email,app_name):
    page.get_by_role('button',name='Sign in with Google').wait_for(timeout=30000)
    page.evaluate("""async ({email,password,appName})=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const auth=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');let app;for(let i=0;i<120&&!app;i++){app=apps.getApps().find(x=>x.name===appName);if(!app)await new Promise(r=>setTimeout(r,50))}if(!app)throw Error('Firebase app unavailable');await auth.signInWithEmailAndPassword(auth.getAuth(app),email,password)}""",{'email':email,'password':PASSWORD,'appName':app_name})

def wait_authorized(page):
    deadline=time.monotonic()+30
    while time.monotonic()<deadline:
        state=page.evaluate("() => ({status:integrationSession?.status||'',message:integrationSession?.message||''})")
        if state['status']=='authorized': return
        if state['status'] in ('error','unauthorized','blocked'): raise AssertionError(f'Authorization failed: {state}')
        page.wait_for_timeout(100)
    raise AssertionError('Authorization timed out')

def main():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}';forbidden=[]
    try:
      with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
        if Path('/usr/bin/chromium').exists(): launch['executable_path']='/usr/bin/chromium'
        browser=pw.chromium.launch(**launch)
        teacher_context=browser.new_context(viewport={'width':1680,'height':1050},timezone_id='America/Phoenix')
        student_context=browser.new_context(viewport={'width':1440,'height':1000},timezone_id='America/Phoenix')
        for context in (teacher_context,student_context): context.on('request',lambda request: forbidden.append(request.url) if 'dragonswood-9289e' in request.url or 'firestore.googleapis.com' in request.url else None)

        teacher=teacher_context.new_page();teacher.goto(f'{base}/v33-integration/teacher-test.html?dw-env=emulator#gradebook',wait_until='domcontentloaded');sign_in(teacher,'jacobicusjax@gmail.com','DragonswoodV33TeacherIntegration');wait_authorized(teacher)
        scholar=teacher.evaluate("() => students.find(row=>row.name==='Fourth')")
        if not scholar: raise AssertionError('Fourth grade browser fixture is missing from the teacher roster')
        date_key=teacher.evaluate("new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix'}).format(new Date())")
        reading_id=f"{scholar['id']}_{date_key}_witches"
        assert_emulator_document_missing('readingSessions',reading_id)
        set_emulator_document('classData','gradebookSettings',{'daily':40,'curriculum':40,'reading':20,'readingTargetMinutes':20,'readingAssignedDateKeys':[date_key],'readingTargetsByDate':{date_key:1},'gradeIntegrityVersion':2})

        student_logs=[]
        student=student_context.new_page();student.on('console',lambda message: student_logs.append(f'{message.type}: {message.text}'));student.goto(f'{base}/v33-integration/student-test.html?dw-env=emulator#module/class-reader',wait_until='domcontentloaded');sign_in(student,'grade4@explore.academy','[DEFAULT]');wait_authorized(student)
        assignment=student.evaluate("() => ({target:state.reading?.targetMinutes,dates:state.reading?.assignedDateKeys||[]})")
        assert assignment['target']==1 and date_key in assignment['dates'],assignment
        student.evaluate("""() => { window.__readingGateHeartbeats=0;window.addEventListener('message',event=>{if(event.origin===location.origin&&event.data?.type==='dw-witches-reading-heartbeat')window.__readingGateHeartbeats++}) }""")
        iframe=student.locator('iframe[title="The Witches Class Reader"]');iframe.wait_for(timeout=30000)
        deadline=time.monotonic()+30;reader=None
        while time.monotonic()<deadline and reader is None:
            reader=next((candidate for candidate in student.frames if 'witches-reader.html' in candidate.url),None)
            if reader is None: student.wait_for_timeout(100)
        if reader is None: raise AssertionError('The real Witches reader iframe did not load')
        reader.wait_for_function("() => typeof markDragonswoodReadingActive==='function' && typeof DRAGONSWOOD_READING_HEARTBEAT_MS==='number'",timeout=30000)
        student.bring_to_front();reader.locator('body').click(position={'x':120,'y':120});reader.wait_for_function("() => dragonswoodLastReadingActivity > 0 && document.hasFocus()",timeout=10000)
        student.wait_for_function("() => window.__readingGateHeartbeats >= 1",timeout=35000)
        deadline=time.monotonic()+10;stored=None
        while time.monotonic()<deadline and stored is None:
            stored=teacher.evaluate("""async id=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const snap=await fs.getDoc(fs.doc(fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration')),'readingSessions',id));return snap.exists()?snap.data():null}""",reading_id)
            if stored is None: student.wait_for_timeout(100)
        if stored is None: raise AssertionError(f'Real reader heartbeat did not create Firestore evidence: assignment={assignment!r}; console={student_logs!r}')
        assert stored['activeSeconds']==15,stored

        # A page in another BrowserContext can remain focused independently in
        # headless Chromium. Hide the reader with a sibling tab in the same
        # student context, then prove the page is hidden before waiting through
        # another full heartbeat interval.
        student_cover=student_context.new_page();student_cover.goto('about:blank');student_cover.bring_to_front()
        student.wait_for_function("() => document.hidden === true",timeout=10000)
        student_cover.wait_for_timeout(17000)
        unchanged=teacher.evaluate("""async id=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');const fs=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js');const snap=await fs.getDoc(fs.doc(fs.getFirestore(apps.getApp('DragonswoodV33TeacherIntegration')),'readingSessions',id));return snap.exists()?snap.data():null}""",reading_id)
        assert unchanged and unchanged['activeSeconds']==15,unchanged
        assert 'targetMinutes' not in unchanged and 'lastHeartbeatMs' not in unchanged
        assert unchanged.get('bookTitle')=='The Witches' and unchanged.get('studentName')=='Fourth'

        teacher.bring_to_front();teacher.evaluate("location.hash='#gradebook'");teacher.get_by_role('heading',name='Dragonswood Gradebook').wait_for();teacher.locator('#gradebook-search').fill('Fourth');row=teacher.locator('[data-grade-student]').filter(has_text='Fourth');row.get_by_text('0.3 verified min',exact=False).wait_for(timeout=10000);row.get_by_text('Incomplete',exact=True).wait_for();row.get_by_text('Provisional',exact=True).wait_for();assert row.get_by_text('Complete evidence',exact=True).count()==0
        browser.close()
    finally:
      server.shutdown();server.server_close()
    if forbidden: raise AssertionError(f'Reading grade gate attempted production Firebase: {forbidden}')
    print('V3.3 reading grade browser gate: PASS (reader heartbeat → rules → Firestore → teacher gradebook; hidden reader pauses)')
    return 0

if __name__=='__main__': raise SystemExit(main())
