#!/usr/bin/env python3
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import time
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
PASSWORD='V33-Gate-Only-2026!'

class Quiet(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store');super().end_headers()
    def log_message(self,*_args): pass

def sign_in(page):
    page.get_by_role('button',name='Sign in with Google').wait_for(timeout=30000)
    page.evaluate("""async ({email,password})=>{const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js'),auth=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');let app;for(let i=0;i<120&&!app;i++){app=apps.getApps().find(x=>x.name==='[DEFAULT]');if(!app)await new Promise(r=>setTimeout(r,50))}if(!app)throw Error('Firebase app unavailable');await auth.signInWithEmailAndPassword(auth.getAuth(app),email,password)}""",{'email':'grade5@explore.academy','password':PASSWORD})

def main():
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start();base=f'http://127.0.0.1:{server.server_port}'
    errors=[]
    try:
      with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
        if Path('/usr/bin/chromium').exists(): launch['executable_path']='/usr/bin/chromium'
        browser=pw.chromium.launch(**launch)
        context=browser.new_context(viewport={'width':1366,'height':768})
        page=context.new_page();page.on('pageerror',lambda err: errors.append(str(err)))
        page.goto(f'{base}/v33-integration/student-test.html?dw-env=emulator#day',wait_until='domcontentloaded');sign_in(page)
        deadline=time.monotonic()+30
        while time.monotonic()<deadline:
            status=page.evaluate("() => integrationSession?.status||''")
            if status=='authorized': break
            if status in ('error','unauthorized','blocked'): raise AssertionError(page.evaluate("() => integrationSession"))
            page.wait_for_timeout(100)
        page.wait_for_function("() => state?.worldConnected === true && state?.recoverySummary?.checked === true && state?.passes?.rows?.bathroom",timeout=30000)
        # Hall/profile/Math behavior is the target of this gate. Required-work
        # enforcement has separate inherited browser coverage. Hold this
        # fictional scholar's approved access stable across async snapshots.
        # The identity fixture intentionally starts with an active bathroom
        # pass. Return it through the real production UI before routing.
        if page.evaluate("() => state.passes.rows.bathroom.action === 'return'"):
            overlay=page.locator('[data-active-pass-overlay].active')
            overlay.wait_for(timeout=10000)
            overlay.locator('[data-return-active-pass="bathroom"]').click()
            page.wait_for_function(
                "() => state.passes?.rows?.bathroom?.action !== 'return'",
                timeout=10000,
            )
            overlay.wait_for(state='hidden',timeout=10000)
        page.wait_for_function("() => !blockingPass()",timeout=10000)
        page.evaluate("""()=>{Object.defineProperties(state,{dailyAccessUnlocked:{configurable:true,get:()=>true,set:()=>{}},dailyAccessOverride:{configurable:true,get:()=>true,set:()=>{}}});state.recoverySummary={dateKey:state.missionDate,checked:true,count:0,days:[]};render()}""")
        page.wait_for_function("() => unfinishedRequiredWork('hall').length === 0",timeout=30000)

        # Portal profile renders canonical class as locked and preserves image geometry.
        page.evaluate("location.hash='#hall'");page.locator('.student-page-hall').wait_for(timeout=30000)
        page.get_by_text('YOUR CLASS • LOCKED',exact=True).wait_for()
        assert page.locator('[data-class]').count()==0
        profile_geometry=page.locator('.hall-character img').evaluate("el=>({fit:getComputedStyle(el).objectFit,w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})")
        assert profile_geometry['fit']=='contain' and profile_geometry['w']>0 and profile_geometry['h']>0
        assert profile_geometry['scroll']<=profile_geometry['client']+1

        # Full Hall keeps active companion in natural flow at Chromebook and narrow widths.
        page.evaluate("location.hash='#module/adventurer-hall'")
        frame_el=page.locator('iframe[title="Adventurer Hall & Pet Sanctuary"]');frame_el.wait_for()
        hall=page.frame_locator('iframe[title="Adventurer Hall & Pet Sanctuary"]')
        hall.get_by_text('Connected as Fifth',exact=False).wait_for(timeout=30000)
        hall.get_by_role('button',name='🥚 PET SANCTUARY').click()
        aside=hall.locator('.pet-layout>aside')
        assert aside.evaluate("el=>getComputedStyle(el).position")=='static'
        assert hall.locator('body').evaluate("el=>el.scrollWidth<=el.clientWidth+1")
        hall.get_by_role('button',name='▶ PLAY').click();hall.get_by_role('button',name='✨ SHOW ABILITY').click()
        page.set_viewport_size({'width':760,'height':720});page.wait_for_timeout(150)
        assert hall.locator('body').evaluate("el=>el.scrollWidth<=el.clientWidth+1")

        # Every Math operation/difficulty starts cleanly; Easy/Normal coaching and Hard lock remain.
        page.set_viewport_size({'width':1366,'height':768});page.evaluate("""()=>{state.dailyAccessOverride=true;state.dailyAccessUnlocked=true;state.recoverySummary={dateKey:state.missionDate,checked:true,count:0,days:[]};location.hash='#module/math-operations'}""")
        math_el=page.locator('iframe[title="Math Operations Quest"]');math_el.wait_for(timeout=30000)
        math=page.frame_locator('iframe[title="Math Operations Quest"]')
        math.locator('#next').wait_for(timeout=30000)
        for difficulty in ('easy','normal','hard'):
          for operation in ('addition','subtraction','multiplication','division','mixed'):
            math.locator(f'button.difficulty-btn[data-difficulty="{difficulty}"]').click()
            math.locator(f'button.op-btn[data-operation="{operation}"]').click()
            math.locator('#next').click()
            math.locator('.student-cell-input').first.wait_for(timeout=5000)
            if difficulty=='hard':
              assert math.locator('#hintBtn').is_disabled()
            else:
              math.locator('#hintBtn').click();math.locator('#hintPanel:not(.hidden)').wait_for(timeout=5000)
            page.evaluate("location.hash='#missions'");page.wait_for_timeout(50)
            page.evaluate("""()=>{state.dailyAccessOverride=true;state.dailyAccessUnlocked=true;state.recoverySummary={dateKey:state.missionDate,checked:true,count:0,days:[]};location.hash='#module/math-operations'}""")
            math_el=page.locator('iframe[title="Math Operations Quest"]');math_el.wait_for(timeout=30000);math=page.frame_locator('iframe[title="Math Operations Quest"]');math.locator('#next').wait_for(timeout=30000)
        browser.close()
    finally:
      server.shutdown();server.server_close()
    if errors: raise AssertionError('Browser console errors: '+repr(errors))
    print('V3.3 Hall/profile/Math browser gate: PASS (Chromebook + narrow Hall, canonical class, all Math modes)')
    return 0

if __name__=='__main__': raise SystemExit(main())
