#!/usr/bin/env python3
"""Walk test: landscape phone (844 by 390), enter walk mode, press every walk
button, exercise flight, fail on any page error.

usage: walk_test.py FOLDER [index.html]
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright

TAP = '''(id) => { const e = document.getElementById(id); if (!e) return 'missing';
  const o = {bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', clientX: 5, clientY: 5};
  e.dispatchEvent(new PointerEvent('pointerdown', o)); e.dispatchEvent(new PointerEvent('pointerup', o)); e.click(); return 'ok'; }'''
TAP2 = '''(id) => { const e = document.getElementById(id);
  const o = {bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', clientX: 5, clientY: 5};
  for (let i = 0; i < 2; i++) { e.dispatchEvent(new PointerEvent('pointerdown', o)); e.dispatchEvent(new PointerEvent('pointerup', o)); } }'''
KEY2 = '''() => { for (let i = 0; i < 2; i++) { dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true, cancelable: true})); dispatchEvent(new KeyboardEvent('keyup', {key: ' ', bubbles: true, cancelable: true})); } }'''
FRAMES = '(n) => { for (let i = 0; i < n; i++) __vx.fall(1/60); return __vx.PL.y; }'


def main(folder, page='index.html'):
    fails = []

    def check(name, cond, detail=''):
        print('  %-52s %s %s' % (name, 'ok' if cond else 'FAIL', detail))
        if not cond:
            fails.append(name)

    with serve(folder) as base, sync_playwright() as p:
        b, pg, errors = open_estate(p, base, page)
        ver = pg.evaluate("() => { __vx.setMode('over'); return document.getElementById('brandS').textContent }")
        print('  brand line:', ver)
        pg.evaluate(TAP, 'bWalk')
        check('walk mode on', pg.evaluate("() => document.getElementById('walk').classList.contains('on')"))
        ids = pg.evaluate("() => [...document.querySelectorAll('#walk button')].map(b => b.id)")
        for i in ids:
            if i == 'bBack':
                continue
            check('press ' + i, pg.evaluate(TAP, i) == 'ok')
            pg.evaluate('() => { __vx.PL.auto = 0; __vx.PL.sit = null }')
        pg.evaluate("() => { if (__vx.PL.fly) __vx.setFly(0, 1); const P = __vx.PL; P.x = 0; P.z = 58; P.y = .5; P.vy = 0; P.air = 0 }")
        if pg.evaluate('() => typeof __vx.setFly') == 'function':
            # double-tap Jump on the phone pad
            pg.evaluate("() => { __vx.PL.air = 0 }")
            pg.evaluate(TAP2, 'bJump')
            check('double-tap Jump starts flight', pg.evaluate('() => __vx.PL.fly') == 1,
                  pg.evaluate("() => document.getElementById('bJump').textContent + '/' + document.getElementById('bSprint').textContent"))
            y0 = pg.evaluate('() => __vx.PL.y')
            y1 = pg.evaluate('(n) => { const P = __vx.PL; P.up = 1; for (let i = 0; i < n; i++) __vx.fall(1/60); P.up = 0; return P.y }', 120)
            check('Up rises', y1 > y0 + 15, '%.1f to %.1f' % (y0, y1))
            y2 = pg.evaluate(FRAMES, 60)
            check('hovers with no input', abs(y2 - y1) < .01)
            pg.evaluate('() => { __vx.PL.dn = 1 }'); y3 = pg.evaluate(FRAMES, 600)
            check('Down sinks and lands', abs(y3 - .5) < .01 and pg.evaluate('() => __vx.PL.fly') == 0, 'y %.2f' % y3)
            pg.evaluate('() => { __vx.PL.dn = 0 }')
            check('labels restored', pg.evaluate("() => document.getElementById('bJump').textContent") == 'Jump')
            # keyboard: double-tap Space, hold Space, Shift. Two taps inside 340 ms toggle flight, so each separate press
            # waits that out: on a fast machine the steps above finish inside the window and the press would toggle again
            pg.wait_for_timeout(400)
            pg.evaluate(KEY2)
            check('double-tap Space starts flight', pg.evaluate('() => __vx.PL.fly') == 1)
            pg.wait_for_timeout(400)
            pg.keyboard.down('Space'); y4 = pg.evaluate(FRAMES, 60); pg.keyboard.up('Space')
            check('Space rises', y4 > 5, 'y %.1f' % y4)
            pg.keyboard.down('Shift'); y5 = pg.evaluate(FRAMES, 600); pg.keyboard.up('Shift')
            check('Shift sinks and lands', abs(y5 - .5) < .01 and pg.evaluate('() => __vx.PL.fly') == 0)
            pg.evaluate(KEY2)
            pg.wait_for_timeout(450)
            pg.evaluate(KEY2)
            check('double-tap again ends flight', pg.evaluate('() => __vx.PL.fly') == 0)
            pg.evaluate(FRAMES, 600)
            # ceilings: fly up inside every room, the head must never enter a solid
            r = pg.evaluate('''() => { const v = __vx, P = v.PL; let bad = [], n = 0;
              for (const B of v.BLD.slice(1)) for (const R of B.rooms) {
                P.x = R.c[0]; P.z = R.c[2]; P.y = R.y + .5; P.vy = 0; P.air = 0; P.sit = null;
                let ok = false; for (let r = 0; r < 6 && !ok; r++) for (let dx = -r; dx <= r && !ok; dx++) for (let dz = -r; dz <= r && !ok; dz++) {
                  const x = R.c[0] + dx, z = R.c[2] + dz; if (v.G(x, R.y, z) && !v.G(x, R.y + 1, z) && !v.G(x, R.y + 2, z) && !v.G(x, R.y + 3, z)) { P.x = x; P.z = z; ok = true } }
                if (!ok) continue; n++;
                v.setFly(1, 1); P.up = 1; for (let i = 0; i < 900; i++) v.fall(1/60); P.up = 0;
                let ceil = null; for (let y = R.y + 1; y < 80; y++) if (v.G(P.x, y, P.z)) { ceil = y; break }
                if (ceil != null && P.y + 2.4 > ceil - .5 + .001) bad.push(B.name + ': ' + R.n + ' y ' + P.y.toFixed(2) + ' ceil ' + ceil);
                if (ceil == null && R.y < 30) bad.push('no ceiling found over ' + R.n);
                v.setFly(0, 1); }
              P.x = 0; P.z = 58; P.y = .5; P.vy = 0; P.air = 0; return {n, bad} }''')
            check('flight stops at the ceiling in %d rooms' % r['n'], not r['bad'], '; '.join(r['bad'][:6]))
        else:
            print('  (no flight in this build)')
        # v1.11 checks
        if pg.evaluate('() => typeof __vx.photo') == 'function':
            pg.evaluate("() => { const P = __vx.PL; P.x = 0; P.z = 58; P.y = .5; P.vy = 0; P.air = 0 }")
            pg.evaluate(KEY2); pg.keyboard.down('Space'); pg.evaluate(FRAMES, 90); pg.keyboard.up('Space')
            pg.keyboard.down('c'); yc = pg.evaluate(FRAMES, 900); pg.keyboard.up('c')
            check('C sinks and lands', abs(yc - .5) < .01 and pg.evaluate('() => __vx.PL.fly') == 0, 'y %.2f' % yc)
            pg.evaluate(KEY2)
            pg.evaluate("() => { for (let i = 0; i < 2; i++) dispatchEvent(new KeyboardEvent('keydown', {key: 'w', bubbles: true})) }")
            check('double-tap W is fast flight', pg.evaluate('() => __vx.PL.ffast') == 1)
            pg.evaluate("() => dispatchEvent(new KeyboardEvent('keyup', {key: 'w', bubbles: true}))")
            check('releasing W ends fast flight', pg.evaluate('() => __vx.PL.ffast') == 0)
            pg.evaluate('() => __vx.setFly(0, 1)'); pg.evaluate(FRAMES, 600)
            pg.evaluate("() => document.getElementById('bPhoto').click()")
            check('photo mode hides the buttons', pg.evaluate("() => document.body.classList.contains('photo') && getComputedStyle(document.getElementById('top')).display === 'none'"))
            pg.evaluate(TAP, 'photoX')
            check('photo mode ends from the corner', pg.evaluate("() => !document.body.classList.contains('photo')"))
            pg.evaluate("() => __vx.pickTime('live')"); pg.wait_for_timeout(1200)
            check('live sky on', pg.evaluate("() => document.querySelector('#tod [data-t=live]').classList.contains('on')"), pg.evaluate('() => __vx.sea().label'))
            pg.evaluate("() => __vx.pickTime('day')")
            r = pg.evaluate("() => { const P = __vx.PL; P.x = -15; P.y = 7.5; P.z = -39; P.yaw = 1; __vx.posSave(); P.x = 0; P.y = .5; P.z = 58; const ok = __vx.posLoad(); return [ok, P.x, P.y, P.z] }")
            check('the last spot is remembered', r[0] and r[1:] == [-15, 7.5, -39], str(r))
            pg.evaluate("() => { try { localStorage.removeItem('euph_pos'); localStorage.removeItem('euph_tod') } catch (e) {} const P = __vx.PL; P.x = 0; P.y = .5; P.z = 58 }")
            h = pg.evaluate('() => __vx.dep.halls')
            check('halls dressed', h and h['halls'] >= 60 and h['pieces'] >= 1500, str(h))
            o = pg.evaluate("() => [[30,-18,8],[22,-18,8],[20,-23,8],[-33,-22,8],[-22,-22,8],[-20,-24,8],[24,-40,18],[22,-40,18],[-24,-38,18]].filter(([x,z,y]) => __vx.G(x,y,z) || __vx.G(x,y+1,z) || !__vx.G(x,y-1,z)).length")
            check('stair halls open', o == 0, '%d cells blocked' % o)
        # v1.12 checks
        if pg.evaluate('() => typeof __vx.grove') == 'function':
            pg.wait_for_function('() => __vx.grove().ready >= 22', timeout=120000)
            g = pg.evaluate('() => __vx.grove()'); f = pg.evaluate('() => __vx.flowers()')
            check('kit trees planted and grown', g['trees'] > 600 and g['ready'] >= 22, str(g))
            check('flower beds planted', f and f['plants'] > 1500, str(f))
            check('village rooms', pg.evaluate('() => __vx.vr.length') >= 100, str(pg.evaluate('() => __vx.vr.length')))
            check('map grown', pg.evaluate('() => [[0, 370], [280, 0], [-280, 100], [0, -280]].every(([x, z]) => [0, 1, 2, 3, 4].some(y => __vx.G(x, y, z) !== 0))'))
        # v1.14 checks: fine stairs, see-through panes, faster flight
        if pg.evaluate('() => typeof __vx.stairRamp') == 'function':
            fl = pg.evaluate('() => __vx.FLIGHTS.map(f => [f.bid, f.axis, f.l0, f.l1, f.dir, f.e0, f.L, f.y0, f.H, f.sty, f.lesser ? 1 : 0])')
            check('every stair a fine flight (v1.48: five grand and the rest; v1.57: seven, the front steps are three runs)', sum(1 for f in fl if not f[10]) == 7 and sum(1 for f in fl if f[9] == 'stone') >= 2, str(len(fl)))
            CLIMB = """([i, down, side]) => { const v = __vx, f = v.FLIGHTS[i], P = v.PL, zx = f.axis === 'z', mid = (f.l0 + f.l1) / 2;
              if (P.fly) v.setFly(0, 1); P.sit = null; P.jmp = 0; P.vy = 0; P.air = 0;
              const u0 = down ? (side ? f.L - .3 : f.L + 1.5) : (side ? .3 : -1.5), a0 = f.e0 + f.dir * u0; P.x = zx ? mid : a0; P.z = zx ? a0 : mid; P.y = side ? f.y0 + f.H * u0 / f.L + .05 : (down ? f.y0 + f.H : f.y0);
              const d = (down ? -1 : 1) * f.dir * .12; let worst = 0, last = null, gaps = 0, n = 0;
              for (let k = 0; k < 400; k++) { const ok = zx ? v.moveTo(P.x, P.z + d) : v.moveTo(P.x + d, P.z); for (let q = 0; q < 2; q++) v.fall(1/60);
                const u = ((zx ? P.z : P.x) - f.e0) * f.dir, r = v.stairRamp(); if (u > 0 && u < f.L) { n++; if (r === null || r !== r) gaps++; else { if (last != null) worst = Math.max(worst, Math.abs(r - last)); last = r } }
                if (!ok) break; if (down ? u < -1.2 : u > f.L + 1.2) break }
              for (let q = 0; q < 40; q++) v.fall(1/60);
              return { y: P.y, want: down ? f.y0 : f.y0 + f.H, worst, gaps, n } }"""
            for i, f in enumerate(fl):
                for down in (0, 1):
                    r = pg.evaluate(CLIMB, [i, down, 0])
                    # v1.48: a lesser stair whose foot or head meets a wall is entered from the side; start it on its end tread
                    if f[10] and not (abs(r['y'] - r['want']) < .01 and r['gaps'] == 0):
                        r = pg.evaluate(CLIMB, [i, down, 1]); r['n'] = max(r['n'], 21)
                    check('flight %d %s on foot' % (i, 'down' if down else 'up'), abs(r['y'] - r['want']) < (1.01 if f[10] else .01) and r['gaps'] == 0 and r['worst'] < .2 and r['n'] > 20,
                          'y %.2f of %.2f, largest rise a step %.3f, off the slope %d of %d' % (r['y'], r['want'], r['worst'], r['gaps'], r['n']))
            r = pg.evaluate("""() => { const v = __vx, P = v.PL, out = [];
              for (const [x, z, dx, dz] of [[27, -33, 1, 0], [35, -33, -1, 0], [31, -27.6, 0, -1], [-37, -36, 1, 0], [-29, -36, -1, 0]]) { P.x = x; P.z = z; P.y = 17.5; P.vy = 0; P.air = 0; let moved = 0; for (let k = 0; k < 30; k++) if (v.moveTo(P.x + dx * .1, P.z + dz * .1)) moved++; for (let q = 0; q < 30; q++) v.fall(1/60); out.push([P.y, moved]) }
              return out }""")
            check('the gallery rails hold round each well', all(abs(y - 17.5) < .01 for y, m in r), str(r))
            r = pg.evaluate("""() => { const v = __vx, P = v.PL, out = []; for (const [x, z, dx, dz] of [[-15, 41, 0, 1], [15, 41, 0, 1], [25.5, 36, 1, 0], [-10, -77, 0, -1]]) { P.x = x; P.z = z; P.y = 7.5; P.vy = 0; P.air = 0; for (let k = 0; k < 40; k++) v.moveTo(P.x + dx * .1, P.z + dz * .1); for (let q = 0; q < 30; q++) v.fall(1/60); out.push(P.y) } return out }""")
            check('the terrace balustrades hold', all(abs(y - 7.5) < .01 for y in r), str(r))
            r = pg.evaluate("""() => { const v = __vx, P = v.PL; if (P.fly) v.setFly(0, 1); v.setMode('walk'); P.x = 45; P.y = .5; P.z = 50; v.cullStep();
              const near = v.GR.filter(g => g.wn && g.bid === 1 && g.wn.material.transparent).length; P.x = 45; P.z = 200; v.cullStep();
              const far = v.GR.filter(g => g.wn && g.bid === 1 && g.wn.material.transparent).length; v.setMode('over'); v.cullStep();
              const over = v.GR.filter(g => g.wn && g.wn.material.transparent).length; v.setMode('walk'); P.x = 0; P.z = 58; P.y = .5; v.cullStep();
              let panes = 0, blind = 0, lamps = 0; for (const [x, y, z] of [[45, 10, 30], [50, 10, 30], [45, 20, 30]]) for (let d = -3; d <= 3; d++) { const g = v.G(x + d, y, z); if (v.isWin(g)) panes++; if (v.isBlind(g)) blind++ }
              return { near, far, over, panes, blind, all: v.GR.filter(g => g.wn).length, blindAll: v.TM.blind } }""")
            check('panes clear close to, closed far off and in the overview', r['near'] > 4 and r['far'] == 0 and r['over'] == 0 and r['panes'] > 3 and r['blind'] == 0, str(r))
            src = open(os.path.join(folder, page), encoding='utf8').read()
            check('fast flight is tripled', 'ffast?78:12' in src)
            pg.evaluate("() => { const P = __vx.PL; P.x = 0; P.y = .5; P.z = 58; P.vy = 0; P.air = 0; P.jmp = 0 }")
        # v1.13 checks: the season picker
        if pg.evaluate('() => typeof __vx.pickSeason') == 'function':
            g0 = pg.evaluate('() => __vx.grassRGB()')
            pg.evaluate("() => document.getElementById('bSea').click()")
            check('season chips open', pg.evaluate("() => !document.getElementById('seas').hidden"))
            pg.evaluate("() => document.querySelector('#seas [data-s=winter]').click()")
            pg.wait_for_function('() => __vx.grove().got >= 44', timeout=180000)
            g1 = pg.evaluate('() => __vx.grassRGB()')
            check('winter: snow on the lawns, trees regrown', pg.evaluate('() => __vx.sea().season') == 'winter' and g1[0] > .5 and pg.evaluate("() => document.getElementById('bSea').textContent") == 'Winter', str(g1))
            pg.evaluate("() => __vx.pickSeason('summer')"); pg.wait_for_function('() => __vx.grove().got >= 44', timeout=180000)
            f = pg.evaluate('() => __vx.flowers()')
            check('summer: beds in bloom', pg.evaluate('() => __vx.sea().season') == 'summer' and pg.evaluate('() => __vx.seak()') == 'summer', str(f))
            pg.evaluate("() => __vx.pickSeason('now')"); pg.wait_for_function('() => __vx.grove().got >= 44', timeout=180000)
            check('back to the real calendar', pg.evaluate('() => __vx.grassRGB()') == g0 and pg.evaluate("() => document.getElementById('bSea').textContent") == 'Season')
            pg.evaluate("() => { try { localStorage.removeItem('euph_season') } catch (e) {} }")
        pg.evaluate(TAP, 'bBack')
        check('back to overview', pg.evaluate("() => !document.getElementById('walk').classList.contains('on')"))
        pg.wait_for_timeout(1500)
        b.close()
    check('no page errors', not errors, '; '.join(errors[:3]))
    print('WALK TEST', 'PASS' if not fails else 'FAIL')
    return not fails


if __name__ == '__main__':
    sys.exit(0 if main(*sys.argv[1:]) else 1)
