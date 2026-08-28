from pathlib import Path
import re
root = Path(__file__).parent
html = (root/'index.html').read_text(encoding='utf-8')
issues=[]
ids=re.findall(r'\bid="([^"]+)"',html)
dups=sorted({x for x in ids if ids.count(x)>1})
if dups: issues.append(f'duplicate IDs: {dups}')
if '<style' in html.lower(): issues.append('inline <style> block found')
for css in (root/'css').glob('*.css'):
    txt=css.read_text(encoding='utf-8')
    if '!important' in txt: issues.append(f'!important found in {css.name}')
for ref in re.findall(r'(?:href|src)="([^"]+)"',html):
    if ref.startswith(('http:','https:','#')): continue
    local_ref = re.split(r'[?#]', ref, maxsplit=1)[0]
    if not (root/local_ref).exists(): issues.append(f'missing reference: {ref}')
for js in (root/'js').glob('*.js'):
    if '\x00' in js.read_text(encoding='utf-8'): issues.append(f'NUL byte in {js.name}')
print('ALL GATES PASSED' if not issues else '\n'.join('FAIL: '+i for i in issues))
raise SystemExit(0 if not issues else 1)
