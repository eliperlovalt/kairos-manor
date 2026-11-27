"""Shared harness: serve a folder, open the Estate in headless Chromium with
three.js routed to the local npm copy, and collect page errors."""
import contextlib, functools, http.server, os, socketserver, threading

THREE = os.path.join(os.environ.get('EH_NODE_MODULES', '/home/claude/tools/node_modules'), 'three')
CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/'


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


@contextlib.contextmanager
def serve(folder):
    h = functools.partial(_Quiet, directory=folder)
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), h)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    try:
        yield 'http://127.0.0.1:%d/' % srv.server_address[1]
    finally:
        srv.shutdown()


def _route(route):
    url = route.request.url
    if url.startswith(CDN):
        path = os.path.join(THREE, url[len(CDN):].split('?')[0])
        if os.path.isfile(path):
            return route.fulfill(path=path, content_type='application/javascript')
        return route.fulfill(status=404, body='')
    if url.startswith('http://127.0.0.1') or url.startswith('blob:'):
        return route.continue_()
    return route.abort()  # fonts, worker, anything else outside


OWNER_LINKS = "try{localStorage.setItem('eh-links',JSON.stringify({urls:{golem:'https://golem.invalid/',datahub:'https://datahub.invalid/',globe:'https://globe.invalid/',chat:'https://chat.invalid/',pardes:'https://pardes.invalid/'}}))}catch(e){}"

def open_estate(p, base, page='index.html', w=844, h=390, timeout=180000, owner=None):
    # v1.70: the house is tested as its owner sees it unless a test asks for a visitor (owner=False, or EH_VISITOR=1).
    # The owner's device is the one that holds private links; the tests give it stand-in links that lead nowhere.
    if owner is None: owner = os.environ.get('EH_VISITOR') != '1'
    browser = p.chromium.launch(executable_path=(os.environ.get('CHROME') or None), args=['--no-sandbox','--use-gl=angle', '--use-angle=swiftshader',
                                      '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    ctx = browser.new_context(viewport={'width': w, 'height': h}, has_touch=True,
                              is_mobile=False, device_scale_factor=1)
    if owner: ctx.add_init_script(OWNER_LINKS)
    pg = ctx.new_page()
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.route('**/*', _route)
    pg.goto(base + page, wait_until='domcontentloaded', timeout=timeout)
    pg.wait_for_function('window.__vx && window.__vx.BLD', timeout=timeout)
    return browser, pg, errors
