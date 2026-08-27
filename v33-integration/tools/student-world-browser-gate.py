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

def sign_in(page):
    page.get_by_role('button', name='Sign in with Google').wait_for(timeout=30000)
    page.evaluate("""async ({email,password}) => {
      const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
      const auth=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
      let app=null;for(let i=0;i<120&&!app;i++){app=apps.getApps().find(x=>x.name==='[DEFAULT]')||null;if(!app)await new Promise(r=>setTimeout(r,50));}
      if(!app)throw new Error('Student Firebase app did not become ready.');
      await auth.signInWithEmailAndPassword(auth.getAuth(app),email,password);
    }""", {'email':'grade5@explore.academy','password':PASSWORD})

def route(page, name, heading):
    page.evaluate("name => { location.hash='#'+name }", name)
    page.get_by_role('heading', name=heading).wait_for(timeout=30000)

def mark_required_work_complete(page):
    page.evaluate("""() => {
      state.dailyAccessUnlocked = true;
      state.recoverySummary = {
        dateKey: state.missionDate,
        checked: true,
        count: 0,
        days: []
      };
    }""")
    assert page.evaluate(
        "() => unfinishedRequiredWork('student-world-gate').length === 0"
    )

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
        context=browser.new_context(viewport={'width':1440,'height':1000})
        context.on('request',lambda req: forbidden.append(req.url) if 'dragonswood-9289e' in req.url or 'firestore.googleapis.com' in req.url else None)
        page=context.new_page()
        page.goto(f'{base}/v33-integration/student-test.html?dw-env=emulator#day',wait_until='domcontentloaded')
        sign_in(page)
        deadline=time.monotonic()+30
        while time.monotonic()<deadline:
          status=page.evaluate("() => integrationSession?.status||''")
          if status=='authorized': break
          if status in ('error','unauthorized','blocked'): raise AssertionError(page.evaluate("() => integrationSession"))
          page.wait_for_timeout(100)
        page.wait_for_function("() => state?.recoverySummary?.checked === true", timeout=30000)
        route(page,'day','Know what’s next')
        page.locator('.timeline-row h3').filter(has_text='Live Emulator Math').first.wait_for()
        page.get_by_text('Science Showcase',exact=True).wait_for()
        job=page.get_by_role('button',name="Check off today’s job")
        if job.count(): job.click()
        page.get_by_role('button',name='Today is complete').wait_for(timeout=10000)

        # Optional Student World features are tested only after this fictional
        # browser fixture represents completed Morning and Recovery work.
        mark_required_work_complete(page)
        route(page,'leaderboards','Celebrate class champions')
        page.get_by_text('Fifth (You!)',exact=True).wait_for()
        assert page.locator('.rank-row').first.get_by_text('92',exact=False).count()
        page.evaluate("location.hash='#module/adventurer-hall'")
        hall=page.locator('iframe[title="Adventurer Hall & Pet Sanctuary"]')
        hall.wait_for(); assert 'dw-env=emulator' in (hall.get_attribute('src') or '')
        hall_frame=page.frame_locator('iframe[title="Adventurer Hall & Pet Sanctuary"]')
        hall_frame.get_by_text('Connected as Fifth',exact=False).wait_for(timeout=30000)
        hatch=hall_frame.get_by_role('button',name='HATCH ONE EGG',exact=True)
        hatch.wait_for(timeout=30000);hatch.click()
        hall_frame.get_by_role('button',name='CONTINUE',exact=True).wait_for(timeout=30000)
        hall_frame.get_by_role('button',name='CONTINUE',exact=True).click()
        hall_frame.locator('#status').filter(has_text='🥚').wait_for(timeout=30000)

        # Hatching can refresh the live student snapshot, so restore this
        # fixture's completed-work condition before testing the Boss module.
        mark_required_work_complete(page)
        page.evaluate("location.hash='#module/boss-battle'")
        boss=page.locator('iframe[title="Daily Boss Battle"]')
        boss.wait_for(); assert 'dw-env=emulator' in (boss.get_attribute('src') or '')
        page.frame_locator('iframe[title="Daily Boss Battle"]').locator('#battle').wait_for(timeout=30000)
        browser.close()
    finally:
      server.shutdown();server.server_close()
    if forbidden: raise AssertionError(f'Student World attempted a production Firebase request: {forbidden}')
    print('V3.3 Student World browser gate: PASS (My Day + job + Hall/pets + boss + leaderboard)')
    return 0

if __name__=='__main__': raise SystemExit(main())
