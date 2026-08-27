#!/usr/bin/env python3
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse

REPO_ROOT = Path(__file__).resolve().parents[2]


class PreviewHandler(SimpleHTTPRequestHandler):
    def preview_kingdom_html(self):
        source = Path(self.directory) / 'kingdom-test.html'
        html = source.read_text(encoding='utf-8')
        import_map = '''<script type="importmap">
  {"imports":{"./kingdom-wars/kingdom-wars-test-access.mjs":"./kingdom-wars/manual-preview-access.mjs"}}
</script>
'''
        marker = '<script type="module" src="kingdom-wars/kingdom-wars-test-app.mjs"></script>'
        if marker not in html:
            raise RuntimeError('Kingdom Wars tester module marker was not found.')
        return html.replace(marker, import_map + marker, 1).encode('utf-8')

    def blocked_path(self):
        parts = [part for part in Path(unquote(urlsplit(self.path).path)).parts if part not in ('/', '')]
        return any(part.startswith('.') for part in parts)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        self.send_header(
            'Content-Security-Policy',
            "default-src 'self' data: blob:; "
            "connect-src 'self'; "
            "font-src 'self' data:; "
            "frame-src 'self' about:; "
            "img-src 'self' data: blob:; "
            "media-src 'self' data: blob:; "
            "object-src 'none'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
        )
        super().end_headers()

    def do_GET(self):
        if self.blocked_path():
            self.send_error(404, 'Not found')
            return
        if urlsplit(self.path).path == '/kingdom-manual-preview.html':
            payload = self.preview_kingdom_html()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            try:
                self.wfile.write(payload)
            except (BrokenPipeError, ConnectionResetError):
                pass
            return
        super().do_GET()

    def do_HEAD(self):
        if self.blocked_path():
            self.send_error(404, 'Not found')
            return
        super().do_HEAD()

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            # Browser automation may cancel an in-flight asset when a locked
            # iframe is intentionally removed. That is expected preview behavior.
            return

    def list_directory(self, path):
        self.send_error(404, 'Not found')
        return None

    def log_message(self, format, *args):
        return


def main():
    parser = argparse.ArgumentParser(description='Serve the isolated Dragonswood V3.3 manual preview.')
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', default=4173, type=int)
    args = parser.parse_args()
    handler = partial(PreviewHandler, directory=str(REPO_ROOT))
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f'Dragonswood manual preview: http://127.0.0.1:{args.port}/v33-integration/manual-preview.html', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
