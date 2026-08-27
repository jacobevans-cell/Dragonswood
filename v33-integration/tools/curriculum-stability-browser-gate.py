#!/usr/bin/env python3
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import importlib.util
import sys
import time

from playwright.sync_api import sync_playwright

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]
PASSWORD = 'V33-Gate-Only-2026!'
STUDENT = 'grade5@explore.academy'
TEACHER = 'jacobicusjax@gmail.com'

stage_spec = importlib.util.spec_from_file_location(
    'stage4_gate', Path(__file__).with_name('stage-4-browser-gate.py')
)
stage4 = importlib.util.module_from_spec(stage_spec)
stage_spec.loader.exec_module(stage4)


def sign_in_as(frame, email):
    frame.wait_for_function(
        """async () => {
          const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const auth=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
          const all=apps.getApps();
          return all.length>0&&Boolean(auth.getAuth(all[0]).emulatorConfig);
        }""",
        timeout=30000,
    )
    frame.evaluate(
        """async ({email,password}) => {
          const apps=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js');
          const authModule=await import('https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js');
          const auth=authModule.getAuth(apps.getApps()[0]);
          if(!auth.currentUser||auth.currentUser.email!==email){
            await authModule.signInWithEmailAndPassword(auth,email,password);
          }
        }""",
        {'email': email, 'password': PASSWORD},
    )


def wait_for_refresh(frame, minimum_count):
    frame.wait_for_function(
        """minimum => {
          const row=window.DWCurriculumRenderCoordinator?.diagnostics?.();
          return row&&!row.pending&&row.renderCount>=minimum;
        }""",
        arg=minimum_count,
        timeout=30000,
    )


def main():
    server = ThreadingHTTPServer(
        ('127.0.0.1', 0), partial(stage4.QuietHandler, directory=str(ROOT))
    )
    Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
    forbidden = []

    try:
        with sync_playwright() as pw:
            launch = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
            if Path('/usr/bin/chromium').exists():
                launch['executable_path'] = '/usr/bin/chromium'
            browser = pw.chromium.launch(**launch)
            context = browser.new_context(
                viewport={'width': 1440, 'height': 1000},
                timezone_id='America/Phoenix',
            )
            context.on(
                'request',
                lambda request: forbidden.append(request.url)
                if 'dragonswood-9289e' in request.url or 'firestore.googleapis.com' in request.url
                else None,
            )

            page = context.new_page()
            page.goto(
                f'{base}/v33-integration/student-test.html?dw-env=emulator#missions',
                wait_until='domcontentloaded',
            )
            stage4.sign_in(page)
            stage4.wait_for_authorized_portal(page)
            page.locator('button[data-module="curriculum-quest"]').click()
            iframe = page.locator('iframe[title="Curriculum & Recovery Quest"]')
            iframe.wait_for(timeout=30000)
            curriculum = iframe.element_handle().content_frame()
            assert curriculum is not None
            sign_in_as(curriculum, STUDENT)
            curriculum.get_by_role(
                'heading', name='5th Grade • Semester 1 • Day 14'
            ).wait_for(timeout=30000)
            curriculum.wait_for_function(
                """() => Boolean(
                  window.DWCurriculumRenderCoordinator&&
                  window.__DW_NO_VIDEO_LESSON_ENGINE_V2__&&
                  window.__DW_CURRICULUM_INTERACTION_ENGINE_V5624__&&
                  window.__DW_CURRICULUM_ANSWER_INTEGRITY_V56253__&&
                  window.__DW_MATH_AUTO_GRADING_CURRICULUM__
                )""",
                timeout=30000,
            )
            wait_for_refresh(curriculum, 1)

            page.evaluate(
                """() => {
                  const frame=document.querySelector('iframe[title="Curriculum & Recovery Quest"]');
                  window.__stableCurriculumFrame=frame;
                  window.__stableCurriculumWindow=frame.contentWindow;
                }"""
            )

            curriculum.evaluate(
                """() => {
                  for(const x of rows().filter(item=>Number(item.day)<=Number(S.day))){
                    const state=st(x.id);state.watched=true;S.items[x.id]=state;
                  }
                  render('browser-prime');
                }"""
            )

            setup = curriculum.evaluate(
                """() => {
                  document.querySelector('[data-tab="recovery"]').click();
                  const day=[...document.querySelectorAll('#recovery [data-recovery-day]')]
                    .find(node=>!node.classList.contains('locked-day'));
                  if(!day)throw new Error('No unlocked Recovery Day is available.');
                  day.open=true;
                  const mission=[...day.querySelectorAll('[data-mission-id]')]
                    .find(node=>node.querySelector('textarea[id^="actText-"]'));
                  if(!mission)throw new Error('No Recovery written-response mission is available.');
                  mission.open=true;
                  const field=mission.querySelector('textarea[id^="actText-"]');
                  const draft='My unfinished response keeps this exact cursor position.';
                  field.value=draft;field.dispatchEvent(new Event('input',{bubbles:true}));
                  field.focus({preventScroll:true});field.setSelectionRange(13,21,'forward');
                  field.scrollIntoView({block:'center'});window.scrollBy(0,80);
                  return {day:day.dataset.recoveryDay,mission:mission.dataset.missionId,
                    field:field.id,draft,scrollY:window.scrollY,
                    count:window.DWCurriculumRenderCoordinator.diagnostics().renderCount};
                }"""
            )
            curriculum.evaluate(
                """() => {
                  for(const reason of ['no-video-installed','interactions-installed',
                    'answer-policy-installed','math-autograding-installed']){
                    window.DWCurriculumRenderCoordinator.request(reason);
                  }
                }"""
            )
            wait_for_refresh(curriculum, setup['count'] + 1)
            preserved = curriculum.evaluate(
                """expected => {
                  const mission=document.querySelector(`[data-mission-id="${CSS.escape(expected.mission)}"]`);
                  const day=document.querySelector(`[data-recovery-day="${CSS.escape(expected.day)}"]`);
                  const field=document.getElementById(expected.field),diag=DWCurriculumRenderCoordinator.diagnostics();
                  const local=localStorage.getItem(`dragonswood_q1_curriculum_drafts_v1_${currentStudent.uid}`)||'';
                  return {tab:document.querySelector('#curriculumTabs .active')?.dataset.tab,
                    missionOpen:!!mission?.open,dayOpen:!!day?.open,value:field?.value,
                    focused:document.activeElement===field,start:field?.selectionStart,end:field?.selectionEnd,
                    scrollY:window.scrollY,renderCount:diag.renderCount,draftScoped:local.includes(expected.draft)};
                }""",
                setup,
            )
            assert preserved['tab'] == 'recovery'
            assert preserved['missionOpen'] and preserved['dayOpen']
            assert preserved['value'] == setup['draft'] and preserved['focused']
            assert preserved['start'] == 13 and preserved['end'] == 21
            assert abs(preserved['scrollY'] - setup['scrollY']) <= 160
            assert preserved['renderCount'] == setup['count'] + 1
            assert preserved['draftScoped']

            auto = curriculum.evaluate(
                """() => {
                  document.querySelector('[data-tab="recovery"]').click();
                  for(const mission of document.querySelectorAll('#recovery [data-mission-id]')){
                    const id=mission.dataset.missionId,x=findItem(id),q=x?autoQuestionsFor(x):[];
                    if(q.length<2)continue;
                    if(!document.querySelector(`input[name="auto-${CSS.escape(id)}-0"]`))continue;
                    mission.open=true;mission.scrollIntoView({block:'center'});
                    const correct=q[0].choices.find(value=>DWGrading.questionAnswerEquivalent(q[0],value));
                    const wrong=q[1].choices.find(value=>!DWGrading.questionAnswerEquivalent(q[1],value));
                    if(correct!==undefined&&wrong!==undefined)return {id,correct,wrong,scrollY:window.scrollY};
                  }
                  throw new Error('No two-question Recovery practice mission is available.');
                }"""
            )
            before = curriculum.evaluate("DWCurriculumRenderCoordinator.diagnostics().renderCount")
            curriculum.evaluate(
                """row => {dwCurriculumAnswerSelect(row.id,0,row.correct);dwCurriculumAnswerSubmit(row.id,0)}""",
                auto,
            )
            wait_for_refresh(curriculum, before + 1)
            correct = curriculum.evaluate(
                """row => {
                  const mission=document.querySelector(`[data-mission-id="${CSS.escape(row.id)}"]`);
                  const field=document.querySelector(`input[name="auto-${CSS.escape(row.id)}-0"]`)?.closest('fieldset');
                  return {saved:st(row.id).autoAnswers?.[0]===row.correct,
                    feedback:field?.querySelector('.activity-feedback')?.textContent||'',
                    open:!!mission?.open,tab:document.querySelector('#curriculumTabs .active')?.dataset.tab,
                    scrollY:window.scrollY};
                }""",
                auto,
            )
            assert correct['saved'] and 'Correct' in correct['feedback']
            assert correct['open'] and correct['tab'] == 'recovery'
            assert abs(correct['scrollY'] - auto['scrollY']) <= 180

            before = curriculum.evaluate("DWCurriculumRenderCoordinator.diagnostics().renderCount")
            curriculum.evaluate(
                """row => {dwCurriculumAnswerSelect(row.id,1,row.wrong);dwCurriculumAnswerSubmit(row.id,1)}""",
                auto,
            )
            wait_for_refresh(curriculum, before + 1)
            incorrect = curriculum.evaluate(
                """row => {
                  const mission=document.querySelector(`[data-mission-id="${CSS.escape(row.id)}"]`);
                  const field=document.querySelector(`input[name="auto-${CSS.escape(row.id)}-1"]`)?.closest('fieldset');
                  return {draft:st(row.id).dwAnswerPolicy?.drafts?.[1],
                    feedback:field?.querySelector('.activity-feedback')?.textContent||'',
                    open:!!mission?.open,tab:document.querySelector('#curriculumTabs .active')?.dataset.tab};
                }""",
                auto,
            )
            assert incorrect['draft'] == auto['wrong']
            assert any(word in incorrect['feedback'] for word in ('Not yet', 'Recorded', 'review'))
            assert incorrect['open'] and incorrect['tab'] == 'recovery'

            written = curriculum.evaluate(
                """async () => {
                  document.querySelector('[data-tab="current"]').click();
                  for(const mission of document.querySelectorAll('#current [data-mission-id]')){
                    const id=mission.dataset.missionId,x=findItem(id),spec=x?activitySpec(x):null;
                    const field=document.getElementById(`actText-${id}`);
                    if(!x||x.subject==='Math'||spec?.kind!=='explain'||!field)continue;
                    const concepts=(lessonWords(x)||[]).slice(0,8);
                    const response=`I used ${concepts.join(' and ')} as lesson evidence because the observation shows a clear cause and effect, and I checked each detail to support my answer correctly.`;
                    field.value=response;field.dispatchEvent(new Event('input',{bubbles:true}));
                    if(!validateActivity(x).ok)continue;
                    const state=st(id),questions=autoQuestionsFor(x);
                    state.watched=true;state.autoAnswers={};
                    questions.forEach((q,i)=>state.autoAnswers[i]=String(q.answer));
                    const policy=state.dwAnswerPolicy||{};policy.submitted={};policy.locked={};policy.results={};policy.attempts={};policy.drafts={};policy.revealed=true;
                    questions.forEach((q,i)=>{policy.submitted[i]=true;policy.locked[i]=true;policy.results[i]='correct';policy.attempts[i]=1;policy.drafts[i]=String(q.answer)});
                    state.dwAnswerPolicy=policy;
                    const interaction=window.__DW_CURRICULUM_INTERACTION_TEST__?.interactionSpec?.(x);
                    if(interaction)state.dwInteraction={version:'56.24.2',specId:interaction.id,passed:true,completedAt:Date.now()};
                    S.items[id]=state;mission.open=true;field.focus({preventScroll:true});
                    mission.scrollIntoView({block:'center'});const scrollY=window.scrollY;
                    await checkActivity(id);
                    return {id,response,scrollY};
                  }
                  throw new Error('No deterministic written Current Quest application was available.');
                }"""
            )
            current_count = curriculum.evaluate("DWCurriculumRenderCoordinator.diagnostics().renderCount")
            current_state = curriculum.evaluate(
                """row => {
                  const mission=document.querySelector(`[data-mission-id="${CSS.escape(row.id)}"]`),field=document.getElementById(`actText-${row.id}`);
                  return {practiced:!!st(row.id).practiced,complete:missionComplete(findItem(row.id)),
                    done:mission?.classList.contains('done'),open:!!mission?.open,value:field?.value,
                    tab:document.querySelector('#curriculumTabs .active')?.dataset.tab,scrollY:window.scrollY,
                    count:DWCurriculumRenderCoordinator.diagnostics().renderCount};
                }""",
                written,
            )
            if current_state['count'] < current_count:
                raise AssertionError('Curriculum render counter moved backward.')
            assert current_state['practiced'] and current_state['complete'] and current_state['done']
            assert current_state['open'] and current_state['value'] == written['response']
            assert current_state['tab'] == 'current'
            assert abs(current_state['scrollY'] - written['scrollY']) <= 180

            retained = curriculum.evaluate(
                """exclude => {
                  document.querySelector('[data-tab="recovery"]').click();
                  for(const mission of document.querySelectorAll('#recovery [data-mission-id]')){
                    const id=mission.dataset.missionId,x=findItem(id);if(!x||id===exclude)continue;
                    const state=st(id),questions=autoQuestionsFor(x);state.watched=true;state.practiced=true;
                    state.practiceEvidence='Completed Recovery application remains visible.';state.autoAnswers={};
                    questions.forEach((q,i)=>state.autoAnswers[i]=String(q.answer));
                    const policy=state.dwAnswerPolicy||{};policy.submitted={};policy.locked={};policy.results={};policy.attempts={};policy.drafts={};policy.revealed=true;
                    questions.forEach((q,i)=>{policy.submitted[i]=true;policy.locked[i]=true;policy.results[i]='correct';policy.attempts[i]=1;policy.drafts[i]=String(q.answer)});
                    state.dwAnswerPolicy=policy;
                    const spec=window.__DW_CURRICULUM_INTERACTION_TEST__?.interactionSpec?.(x);
                    if(spec)state.dwInteraction={version:'56.24.2',specId:spec.id,passed:true,completedAt:Date.now()};
                    S.items[id]=state;mission.open=true;rememberMissionOpen(id,true);mission.scrollIntoView({block:'center'});
                    if(!missionComplete(x))continue;
                    save();const count=DWCurriculumRenderCoordinator.diagnostics().renderCount;
                    DWCurriculumRenderCoordinator.request('recovery-completion');
                    return {id,count,scrollY:window.scrollY};
                  }
                  throw new Error('No Recovery mission could be completed for retention coverage.');
                }""",
                setup['mission'],
            )
            wait_for_refresh(curriculum, retained['count'] + 1)
            retained_state = curriculum.evaluate(
                """row => {const mission=document.querySelector(`[data-mission-id="${CSS.escape(row.id)}"]`);
                  return {present:!!mission,done:mission?.classList.contains('done'),open:!!mission?.open,
                    tab:document.querySelector('#curriculumTabs .active')?.dataset.tab,scrollY:window.scrollY}}""",
                retained,
            )
            assert retained_state['present'] and retained_state['done'] and retained_state['open']
            assert retained_state['tab'] == 'recovery'
            assert abs(retained_state['scrollY'] - retained['scrollY']) <= 180

            interaction = curriculum.evaluate(
                """() => {
                  document.querySelector('[data-tab="recovery"]').click();
                  for(const root of document.querySelectorAll('#recovery .dw-interactive:not(.passed)')){
                    const mission=root.closest('[data-mission-id]'),x=findItem(root.dataset.itemId);
                    const spec=window.__DW_CURRICULUM_INTERACTION_TEST__?.interactionSpec?.(x);
                    if(!mission||!spec)continue;
                    mission.open=true;mission.scrollIntoView({block:'center'});
                    for(const chip of spec.chips){
                      const chipNode=root.querySelector(`[data-chip-id="${CSS.escape(chip.id)}"]`);
                      const zone=root.querySelector(`[data-zone-id="${CSS.escape(chip.zone)}"]`);
                      const transfer=new DataTransfer();
                      chipNode.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:transfer}));
                      zone.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:transfer}));
                      zone.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:transfer}));
                    }
                    dwCurriculumInteractionCheck(root.dataset.itemId);
                    return {id:root.dataset.itemId,scrollY:window.scrollY,
                      count:DWCurriculumRenderCoordinator.diagnostics().renderCount};
                  }
                  throw new Error('No incomplete Recovery interaction was available.');
                }"""
            )
            wait_for_refresh(curriculum, interaction['count'] + 1)
            interaction_state = curriculum.evaluate(
                """row => {const mission=document.querySelector(`[data-mission-id="${CSS.escape(row.id)}"]`);
                  return {passed:!!mission?.querySelector('.dw-interactive.passed'),open:!!mission?.open,
                    tab:document.querySelector('#curriculumTabs .active')?.dataset.tab,scrollY:window.scrollY}}""",
                interaction,
            )
            assert interaction_state['passed'] and interaction_state['open']
            assert interaction_state['tab'] == 'recovery'
            assert abs(interaction_state['scrollY'] - interaction['scrollY']) <= 180

            override = curriculum.evaluate(
                """() => {
                  document.querySelector('[data-tab="recovery"]').click();
                  for(const mission of document.querySelectorAll('#recovery [data-mission-id]')){
                    const id=mission.dataset.missionId,x=findItem(id),questions=x?autoQuestionsFor(x):[];
                    if(!questions.length)continue;
                    const state=st(id);state.practiced=true;state.practiceEvidence='Teacher-approved browser fixture response';
                    state.overrideStatus='approved';state.autoAnswers={};S.items[id]=state;save();
                    mission.open=true;mission.scrollIntoView({block:'center'});
                    const count=DWCurriculumRenderCoordinator.diagnostics().renderCount;
                    DWCurriculumRenderCoordinator.request('teacher-override-snapshot');
                    return {id,count,scrollY:window.scrollY};
                  }
                  throw new Error('No Recovery mission was available for teacher override simulation.');
                }"""
            )
            wait_for_refresh(curriculum, override['count'] + 1)
            override_state = curriculum.evaluate(
                """row => {const mission=document.querySelector(`[data-mission-id="${CSS.escape(row.id)}"]`);
                  return {approved:(mission?.querySelector(`#overrideBtn-${CSS.escape(row.id)}`)?.textContent||'').includes('APPROVED'),
                    open:!!mission?.open,tab:document.querySelector('#curriculumTabs .active')?.dataset.tab,
                    scrollY:window.scrollY}}""",
                override,
            )
            assert override_state['approved'] and override_state['open']
            assert override_state['tab'] == 'recovery'
            assert abs(override_state['scrollY'] - override['scrollY']) <= 180

            debounce = curriculum.evaluate(
                """() => {const d=DWCurriculumRenderCoordinator.diagnostics();save();return {count:d.renderCount,href:location.href}}"""
            )
            curriculum.wait_for_timeout(900)
            debounce_after = curriculum.evaluate(
                """() => ({count:DWCurriculumRenderCoordinator.diagnostics().renderCount,href:location.href})"""
            )
            assert debounce_after == debounce

            visibility = curriculum.evaluate(
                """() => {
                  const before={count:DWCurriculumRenderCoordinator.diagnostics().renderCount,href:location.href,
                    tab:document.querySelector('#curriculumTabs .active')?.dataset.tab};
                  const probe=document.createElement('video');let paused=false;
                  Object.defineProperty(probe,'paused',{configurable:true,get:()=>false});
                  probe.pause=()=>{paused=true};document.body.appendChild(probe);
                  Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
                  document.dispatchEvent(new Event('visibilitychange'));
                  delete document.hidden;probe.remove();
                  const after={count:DWCurriculumRenderCoordinator.diagnostics().renderCount,href:location.href,
                    tab:document.querySelector('#curriculumTabs .active')?.dataset.tab};
                  return {paused,before,after};
                }"""
            )
            assert visibility['paused'] and visibility['before'] == visibility['after']

            curriculum.evaluate("() => {for(let i=0;i<8;i++)postCurriculumMissionState()}")
            page.wait_for_timeout(500)
            iframe_state = page.evaluate(
                """() => {
                  const frame=document.querySelector('iframe[title="Curriculum & Recovery Quest"]');
                  return {sameElement:frame===window.__stableCurriculumFrame,
                    sameWindow:frame.contentWindow===window.__stableCurriculumWindow,
                    checked:state.recoverySummary?.checked===true};
                }"""
            )
            assert iframe_state['sameElement'] and iframe_state['sameWindow'] and iframe_state['checked']
            page.evaluate("render()")
            page.wait_for_timeout(250)
            assert page.evaluate(
                """() => {const frame=document.querySelector('iframe[title="Curriculum & Recovery Quest"]');
                  return frame===window.__stableCurriculumFrame&&frame.contentWindow===window.__stableCurriculumWindow}"""
            )

            for tab in ('current', 'recovery', 'videos'):
                curriculum.locator(f'[data-tab="{tab}"]').click()
                assert curriculum.locator(f'#{tab}').is_visible()
                assert (curriculum.locator(f'#{tab}').inner_text() or '').strip()

            teacher = context.new_page()
            teacher.goto(
                f'{base}/curriculum-quest.html?dw-env=emulator',
                wait_until='domcontentloaded',
            )
            sign_in_as(teacher, TEACHER)
            teacher.locator('#teacherBadge').wait_for(state='visible', timeout=30000)
            teacher.locator('#teacherStudent').wait_for(state='visible', timeout=30000)
            teacher.wait_for_function(
                """() => document.querySelectorAll('#teacherStudent option').length > 1""",
                timeout=30000,
            )
            assert teacher.locator('#teacherStudent option').count() > 1
            assert not teacher.locator('[data-tab="videos"]').evaluate(
                "node => node.classList.contains('hidden')"
            )
            teacher.locator('[data-tab="videos"]').click()
            assert teacher.locator('#videos').is_visible()

            browser.close()
    finally:
        server.shutdown()
        server.server_close()

    if forbidden:
        raise AssertionError(
            f'Curriculum stability gate attempted production Firebase access: {forbidden}'
        )
    print('V3.3 Curriculum stability browser gate: PASS (10 reset, draft, grading, interaction, override, debounce, focus, iframe, and teacher-view behaviors)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
