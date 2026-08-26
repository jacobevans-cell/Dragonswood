#!/usr/bin/env python3
from pathlib import Path
from urllib.parse import urlparse
from io import BytesIO
import json, mimetypes, subprocess, sys, argparse
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
REPO_ROOT=ROOT.parent
BASE='fc6298808affc7faa642a8605cccb96fb96bce47'
VIEWPORT={'width':1440,'height':1000}
ROUTES={
  'student':['adventure','missions','games','scribe','day','hall','boss','leaderboards'],
  'teacher':['student-command','gradebook','scribe','rewards','passes','jobs','schedule','tools','leaderboards'],
}

def git_show(path):
    return subprocess.check_output(['git','show',f'{BASE}:v33-integration/{path}'],cwd=REPO_ROOT,text=True)

def skeleton(kind):
    body_class='student-app' if kind=='student' else 'teacher-app'
    return f'''<!doctype html><html><head><meta charset="utf-8"><base href="http://v33.local/"><link rel="stylesheet" href="css/dragonswood.css"></head><body class="{body_class}"><a class="skip-link" href="#page-content">Skip to content</a><div id="app"></div><div id="toast" class="toast" role="status" aria-live="polite"></div><div id="dialog-root"></div></body></html>'''

def serve_local(route):
    parsed=urlparse(route.request.url)
    rel=parsed.path.lstrip('/')
    p=(ROOT/rel).resolve()
    try:
        p.relative_to(ROOT)
    except ValueError:
        route.abort(); return
    if p.is_file():
        ctype=mimetypes.guess_type(str(p))[0] or 'application/octet-stream'
        route.fulfill(status=200,body=p.read_bytes(),content_type=ctype)
    else:
        route.fulfill(status=404,body=b'not found')

def setup_page(page,kind,mode):
    page.set_content(skeleton(kind),wait_until='domcontentloaded')
    if mode=='baseline':
        code=git_show(f'js/{kind}-app.js')
        page.add_script_tag(content=code)
    else:
        page.add_script_tag(content=(ROOT/'tools/visual-fixture-runtime.js').read_text())
        page.add_script_tag(content=(ROOT/f'js/{kind}-app.js').read_text())
    page.wait_for_timeout(80)

def render_route(page,route_name):
    page.evaluate("r => { location.hash = '#' + r; }",route_name)
    page.wait_for_timeout(35)
    return page.screenshot(full_page=False,animations='disabled')

def compare_png(a,b):
    ia=Image.open(BytesIO(a)).convert('RGBA')
    ib=Image.open(BytesIO(b)).convert('RGBA')
    if ia.size!=ib.size:
        return {'equal':False,'sizeA':ia.size,'sizeB':ib.size,'bbox':'size-mismatch','diffPixels':None}
    diff=ImageChops.difference(ia,ib)
    bbox=diff.getbbox()
    if bbox is None:
        return {'equal':True,'size':ia.size,'bbox':None,'diffPixels':0}
    # Count pixels with any changed channel.
    d=diff.convert('RGB')
    changed=sum(1 for px in d.getdata() if px!=(0,0,0))
    return {'equal':False,'size':ia.size,'bbox':bbox,'diffPixels':changed}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--kind',choices=['student','teacher','all'],default='all')
    args=parser.parse_args()
    selected=ROUTES if args.kind=='all' else {args.kind:ROUTES[args.kind]}
    outdir=ROOT/'test-results'/'visual-pixel-regression'
    outdir.mkdir(parents=True,exist_ok=True)
    report={'baselineCommit':BASE,'viewport':VIEWPORT,'routes':{},'passed':True}
    with sync_playwright() as pw:
        launch={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
        if Path('/usr/bin/chromium').exists(): launch['executable_path']='/usr/bin/chromium'
        browser=pw.chromium.launch(**launch)
        context=browser.new_context(viewport=VIEWPORT,device_scale_factor=1)
        context.route('http://v33.local/**',serve_local)
        for kind,routes in selected.items():
            p1=context.new_page(); p2=context.new_page()
            try:
                setup_page(p1,kind,'baseline')
                setup_page(p2,kind,'current')
                for r in routes:
                    base_png=render_route(p1,r)
                    cur_png=render_route(p2,r)
                    result=compare_png(base_png,cur_png)
                    key=f'{kind}:{r}'
                    report['routes'][key]=result
                    if not result['equal']:
                        report['passed']=False
                        (outdir/f'{kind}-{r}-baseline.png').write_bytes(base_png)
                        (outdir/f'{kind}-{r}-current.png').write_bytes(cur_png)
                    print(f"{'PASS' if result['equal'] else 'FAIL'} {key}: diffPixels={result.get('diffPixels')}", flush=True)
            finally:
                p1.close(); p2.close()
        browser.close()
    report_path=ROOT/'test-results'/f"visual-pixel-regression-{args.kind}.json"
    report_path.write_text(json.dumps(report,indent=2)+'\n')
    if not report['passed']:
        print(f'V3.3 17-route pixel regression: FAIL — see {report_path}',file=sys.stderr)
        return 1
    print(f"V3.3 pixel regression: PASS (0 changed pixels on {sum(len(v) for v in selected.values())} {args.kind} route(s))")
    return 0

if __name__=='__main__':
    raise SystemExit(main())
