from pathlib import Path
import hashlib, sys
root=Path(__file__).resolve().parents[1]
manifest=root/'visual-freeze-baseline.sha256'
expected={}
for raw in manifest.read_text().splitlines():
    raw=raw.strip()
    if not raw: continue
    digest, rel=raw.split(None,1)
    rel=rel.strip().lstrip('*')
    # Original package manifest prefixes the model directory. Strip it for candidate root.
    prefix='v33-approved-visual-model/dragonswood-v33-test/'
    if rel.startswith(prefix): rel=rel[len(prefix):]
    expected[rel]=digest
bad=[]
for rel,digest in expected.items():
    p=root/rel
    if not p.exists(): bad.append(f'MISSING {rel}'); continue
    actual=hashlib.sha256(p.read_bytes()).hexdigest()
    if actual!=digest: bad.append(f'CHANGED {rel}')
# Prevent new frozen-family files from sneaking in.
protected_roots=[root/'css',root/'assets'/'art']
actual=set()
for pr in protected_roots:
    if pr.exists():
        for p in pr.rglob('*'):
            if p.is_file(): actual.add(p.relative_to(root).as_posix())
extra=sorted(actual-set(expected))
for rel in extra: bad.append(f'NEW PROTECTED FILE {rel}')
if bad:
    print('V3.3 VISUAL FREEZE CHECK: FAIL')
    for item in bad: print(' -',item)
    sys.exit(1)
print(f'V3.3 VISUAL FREEZE CHECK: PASS ({len(expected)} protected CSS/art files unchanged)')
