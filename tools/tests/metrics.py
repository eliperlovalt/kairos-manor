"""Load, memory and draw metrics, two builds taken in turn. python metrics.py BASE NEW [runs] [page]
Load: time to the first frame (__vx ready), main-thread long tasks in the first 20 s, the boot phases (__vx.TM).
Memory: JS heap after a full collection; geometry bytes held for the card (each array counted once).
Draws: draw calls and triangles at the ftime3 spots (governor off, walk mode), looking up from the lawn, and the overview.
The medians of the runs are printed side by side."""
import sys, os, json, statistics
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, _route
from playwright.sync_api import sync_playwright
from ftime3_spots import ALL

SPOTS = dict(ALL); SPOTS['lawn_up'] = [0, 0, 58, 0, -0.45]
GEO = """()=>{const seen=new Set(),arr=new Set();let b=0,n=0;const add=a=>{if(a&&a.array&&!arr.has(a.array)){arr.add(a.array);b+=a.array.byteLength}};
 __vx.scene.traverse(o=>{const g=o.geometry;if(o.isInstancedMesh)add(o.instanceMatrix);if(!g||seen.has(g))return;seen.add(g);n++;for(const k in g.attributes)add(g.attributes[k]);add(g.index)});
 const m=__vx.renderer.info.memory;return {geoms:n,geoMB:+(b/1048576).toFixed(1),glGeoms:m.geometries,textures:m.textures,programs:(__vx.renderer.info.programs||[]).length}}"""


def tick(pg, n=4):
    """A headless page draws a frame only when one is asked for: without this every spot read the same stale frame (VOXEL III, v1.78)."""
    for _ in range(n):
        pg.screenshot(clip={'x': 0, 'y': 0, 'width': 8, 'height': 8}); pg.wait_for_timeout(120)


def run(folder, page):
    with serve(folder) as base, sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROME') or None, args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info'])
        ctx = b.new_context(viewport={'width': 844, 'height': 390}, has_touch=True, device_scale_factor=1)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.route('**/*', _route)
        cdp = ctx.new_cdp_session(pg)
        pg.add_init_script("window.__lt=[];try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push([Math.round(e.startTime),Math.round(e.duration)])}).observe({type:'longtask',buffered:true})}catch(e){}")
        pg.goto(base + page, wait_until='domcontentloaded', timeout=240000)
        pg.wait_for_function('window.__vx && window.__vx.BLD', timeout=240000, polling=50)
        ready = pg.evaluate('performance.now()')
        tm = pg.evaluate('JSON.parse(JSON.stringify(__vx.TM))')
        pg.wait_for_timeout(20000)
        lt = pg.evaluate('window.__lt')
        cdp.send('HeapProfiler.enable'); cdp.send('HeapProfiler.collectGarbage'); cdp.send('HeapProfiler.collectGarbage')
        heap = cdp.send('Runtime.getHeapUsage')
        mem = pg.evaluate(GEO); mem['heapMB'] = round(heap['usedSize'] / 1048576, 1)
        pg.evaluate("()=>{if(__vx.GOV){__vx.GOV.off=true;__vx.govSet(0)}__vx.setMode('walk')}")
        pg.wait_for_timeout(3000)
        draws = {}
        for nm, s in SPOTS.items():
            x, y, z, yaw = s[:4]; pitch = s[4] if len(s) > 4 else .1
            pg.evaluate("([x,y,z,yaw,pt])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=pt;P.vy=0;P.sit=null}", [x, y, z, yaw, pitch]); pg.wait_for_timeout(1600); tick(pg)
            draws[nm] = pg.evaluate("()=>{const i=__vx.renderer.info.render;return [i.calls,i.triangles]}")
        pg.evaluate("()=>__vx.setMode('over')"); pg.wait_for_timeout(2500); tick(pg)
        draws['overview'] = pg.evaluate("()=>{const i=__vx.renderer.info.render;return [i.calls,i.triangles]}")
        b.close()
    return dict(ready=round(ready), tm=tm, longMs=sum(d for s, d in lt), maxLong=max([d for s, d in lt] or [0]), mem=mem, draws=draws, errors=errs)


if __name__ == '__main__':
    A, B = sys.argv[1], sys.argv[2]; runs = int(sys.argv[3]) if len(sys.argv) > 3 else 2; page = sys.argv[4] if len(sys.argv) > 4 else 'index.html'
    R = {0: [], 1: []}
    for r in range(runs):
        for k, f in ((0, A), (1, B)) if r % 2 == 0 else ((1, B), (0, A)):
            R[k].append(run(f, page)); print('run', r, 'build', k, 'ready', R[k][-1]['ready'], 'heap', R[k][-1]['mem']['heapMB'], flush=True)
    med = lambda k, f: statistics.median(f(x) for x in R[k])
    print()
    rows = [('ready ms', lambda x: x['ready']), ('long tasks ms', lambda x: x['longMs']), ('longest task ms', lambda x: x['maxLong']),
            ('heap MB', lambda x: x['mem']['heapMB']), ('geometry MB', lambda x: x['mem']['geoMB']), ('geometries', lambda x: x['mem']['geoms'])]
    for k in R[0][0]['tm']:
        if isinstance(R[0][0]['tm'][k], (int, float)) and k in R[1][0]['tm']:
            rows.append(('  TM ' + k, (lambda kk: lambda x: x['tm'].get(kk, 0) if isinstance(x['tm'].get(kk, 0), (int, float)) else 0)(k)))
    for name, f in rows:
        a, b = med(0, f), med(1, f); print('%-18s base %9.1f   new %9.1f   %+6.1f%%' % (name, a, b, (100 * (b - a) / a) if a else 0))
    print()
    for nm in R[0][0]['draws']:
        da, db = R[0][0]['draws'][nm], R[1][0]['draws'][nm]
        print('%-13s draws %4d > %4d   tris %5dk > %5dk  %+5.1f%%' % (nm, da[0], db[0], da[1] / 1000, db[1] / 1000, 100 * (db[1] - da[1]) / max(1, da[1])))
    print('errors', R[0][0]['errors'], R[1][0]['errors'])
    json.dump(R, open(os.path.join(os.environ.get('TEMP', '.'), 'metrics_last.json'), 'w'))
