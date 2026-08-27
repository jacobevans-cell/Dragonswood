#!/usr/bin/env python3
from pathlib import Path
import re, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
fail=[]

def check(ok,msg):
    print(('PASS' if ok else 'FAIL')+': '+msg)
    if not ok: fail.append(msg)

required=[ROOT/'launcher.html',ROOT/'student-test.html',ROOT/'teacher-test.html',ROOT/'css/dragonswood.css',ROOT/'css/tester-launcher.css',ROOT/'js/student-app.js',ROOT/'js/teacher-app.js']
for p in required: check(p.exists(),f'{p.relative_to(ROOT)} exists')
check(not (ROOT/'index.html').exists(),'production filename index.html absent')
check(not (ROOT/'teacher.html').exists(),'production filename teacher.html absent')

textfiles=[p for p in ROOT.rglob('*') if p.is_file() and p.suffix.lower() in {'.html','.css','.js'}]
sources='\n'.join(p.read_text(errors='ignore') for p in textfiles)
html='\n'.join(p.read_text(errors='ignore').lower() for p in textfiles if p.suffix=='.html')
check('style="' not in sources and "style='" not in sources,'no inline style attributes')
check('<style' not in html,'no HTML style blocks')
check('!important' not in sources,'no !important declarations')
check('@layer reset, tokens, base, layout, components, utilities, states;' in (ROOT/'css/dragonswood.css').read_text(),'required CSS cascade layers declared')
check('<progress' in (ROOT/'js/student-app.js').read_text() and '<progress' in (ROOT/'js/teacher-app.js').read_text(),'semantic progress components used')

for js in [ROOT/'js/student-app.js',ROOT/'js/teacher-app.js']:
    r=subprocess.run(['node','--check',str(js)],capture_output=True,text=True)
    check(r.returncode==0,f'{js.name} JavaScript syntax')

student_refs=list((ROOT/'assets/reference/student').glob('*.jpg'))
teacher_refs=list((ROOT/'assets/reference/teacher').glob('*.jpg'))
check(len(student_refs)==8,f'8 student references packaged ({len(student_refs)} found)')
check(len(teacher_refs)==9,f'9 teacher screenshot files packaged ({len(teacher_refs)} found)')

student_js=(ROOT/'js/student-app.js').read_text()
teacher_js=(ROOT/'js/teacher-app.js').read_text()
check("const TESTER_KEY = 'dw-v33-tester'" in student_js,'student local storage is tester-namespaced')
for dangerous in [r'initializeApp\s*\(',r'firebaseio\.com',r'firestore\s*\(',r'getFirestore\s*\(',r'fetch\s*\(']:
    check(not re.search(dangerous,sources,re.I),f'no live-network pattern: {dangerous}')

for route in ['adventure','missions','games','scribe','day','hall','boss','leaderboards']:
    check(route in student_js,f'student route {route} represented')
for route in ['student-command','gradebook','scribe','rewards','passes','jobs','schedule','tools','leaderboards']:
    check(route in teacher_js,f'teacher route {route} represented')

for asset in ['student-reference-atmosphere.jpg','student-reference-frame.png','dragonswood-crest-v33.jpg','teacher-command-crest.png','hall-character-v33.jpg','boss-arena-v33.jpg']:
    check((ROOT/'assets/art'/asset).exists(),f'V3.3 fidelity asset {asset} exists')

check('student-test.html#adventure' in (ROOT/'launcher.html').read_text(),'launcher points to student tester')
check('teacher-test.html#student-command' in (ROOT/'launcher.html').read_text(),'launcher points to teacher tester')

if fail:
    print(f'\n{len(fail)} verification failure(s).')
    sys.exit(1)
print('\nALL STATIC V3.3 SAFE-TESTER CHECKS PASSED.')
