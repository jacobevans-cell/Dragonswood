#!/usr/bin/env python3
from pathlib import Path
import re, sys
root=Path(sys.argv[1] if len(sys.argv)>1 else '.')
js=root/'dragonswood-grayson-mode.js'
fail=[]; passed=[]
def check(cond,msg): (passed if cond else fail).append(msg)
s=js.read_text(encoding='utf-8') if js.exists() else ''
check(js.exists(),'Grayson engine exists')
check("const VERSION='58.0'" in s,'v58.0 engine installed')
check('GIVE UP / SKIP → NEXT' in s,'Give Up / Skip button exists')
check("round%3===0?'cross':'primary'" in s,'every third challenge is cross-subject')
check('rewardFree:true' in s,'reward-free contract preserved')
check('gradeForRound' in s and '7+((Math.max(1,r)-1)%4)' in s,'Grade 7-10 cycle exists')
check('visibleContextText' in s and 'detectContext' in s,'visible current-topic detection exists')
check('Math • Division' in s and 'Science • Chemistry' in s and 'ELA • Reading' in s and 'History / Social Studies' in s,'four subject families exist')

targets=[
'math-operations-quest.html','fraction-forge.html','decimal-deception.html','elemental-laboratory.html','arcane-forge.html','cosmic-architect.html','spelling-practice.html','the_witches_pages_1_15_interactive_test.html','witches-reader.html','daily-quest.html','curriculum-quest.html','boss-battle.html','long-division-quest.html','long-division-custom.html']
seen=0
for name in targets:
    p=root/name
    if not p.exists(): continue
    seen+=1
    t=p.read_text(encoding='utf-8',errors='ignore')
    refs=re.findall(r'dragonswood-grayson-mode\.js\?v=([0-9.]+)',t)
    check(refs==['58.0'],f'{name} loads Grayson exactly once at v58.0')
check(seen>=8,f'Grayson is attached to broad academic surface ({seen} target pages found)')
for m in passed: print('PASS:',m)
for m in fail: print('FAIL:',m)
print(f'\nRESULT: {len(passed)} passed, {len(fail)} failed')
sys.exit(1 if fail else 0)
