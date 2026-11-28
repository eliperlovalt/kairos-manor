"""vx3-M (WO-M1): the furniture tiers and pools. python pinst_test.py FOLDER [page]
- the pools are made, and the fine tier is on;
- at the fixed spots (the view test off, as for the shadow map) every pooled piece whose cell is drawn is drawn exactly once, as its middle copy or its fine copy, and none whose cell is cut;
- every kind with a fine carving: the fine box and the halved middle box agree to one fine cell (so nothing floats, sinks or grows into a doorway);
- beside each fine piece the fine copy is shown within three seconds, inside the budget (pieces, triangles, megabytes);
- no page errors."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
from ftime3_spots import ALL

ONCE = r"""()=>{const V=__vx,P=V.pinst.P;V.pinst.step();V.pinst.full(true);let bad=0,shown=0,fine=0;const why=[];
 for(const pl of P.pools){const mid=pl.ims[0]?pl.ims[0].count:0;let want=0;for(const it of pl.items){if(!pl.on||it.cg.cut)continue;if(it.fine)fine++;else want++}
   if(mid!==want){bad++;if(why.length<4)why.push(pl.r.kind+' '+mid+'/'+want)}shown+=mid}
 let fs=0;for(const F of V.pinst.F.M.values())if(F.ims[0])fs+=F.ims[0].count;if(fs!==fine){bad++;why.push('fine '+fs+'/'+fine)}
 V.pinst.full(false);return {bad,why,shown,fine}}"""
BOX = r"""()=>{const V=__vx,F=V.pinst.F,out=[];for(const F1 of F.M.values()){const r=F1.r,R=V.PROPS.build(r.kind,r.o||{});let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
   for(const v of R.V.values()){x0=Math.min(x0,v[0]);x1=Math.max(x1,v[0]);y0=Math.min(y0,v[1]);y1=Math.max(y1,v[1]);z0=Math.min(z0,v[2]);z1=Math.max(z1,v[2])}const u=R.unit,f=[(x0-.5)*u,(x1+.5)*u,y0*u,(y1+1)*u,(z0-.5)*u,(z1+.5)*u],B=V.pbox(r),m=[B.x0,B.x1,B.y0,B.y1,B.z0,B.z1];
   const d=Math.max(...f.map((a,i)=>Math.abs(a-m[i])));out.push([r.kind,+d.toFixed(3),+u.toFixed(4)])}return out}"""
NEAR = r"""(kind)=>{const it=__vx.pq.find(it=>it.r.kind===kind&&it.bid&&it.pool);if(!it)return null;return [it.x+Math.sin(it.th)*2.5,it.y-.5,it.z+Math.cos(it.th)*2.5,it.th+Math.PI]}"""
GO = "([x,y,z,yaw])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=yaw;P.pitch=.1;P.vy=0;P.sit=null}"
STATE = "()=>{const F=__vx.pinst.F;return {shown:F.shown,tris:F.trisShown,mb:F.bytes/1048576,max:F.max,cap:F.tris,mbcap:F.mb}}"

def main():
    folder = sys.argv[1]; page = sys.argv[2] if len(sys.argv) > 2 else 'index.html'
    fails = []; ok = lambda c, m: print(('PASS ' if c else 'FAIL ') + m) or (None if c else fails.append(m))
    with serve(folder) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, page)
        pg.wait_for_function('window.__vx && window.__vx.TM && window.__vx.TM.wall', timeout=300000)
        pg.wait_for_timeout(4000)
        pg.evaluate("()=>{if(__vx.GOV){__vx.GOV.off=true;__vx.govSet(0)}__vx.setMode('walk')}")
        n = pg.evaluate("()=>[__vx.pinst.P.pools.length,__vx.pinst.P.items,__vx.pinst.F.on,__vx.pinst.F.M.size]")
        ok(n[0] > 20 and n[1] > 500 and n[2], 'pools made: %d pools, %d pieces, fine tier on, %d fine kinds' % (n[0], n[1], n[3]))
        for nm in ['lawn', 'saloon', 'state_hall', 'morning', 'grand_stair', 'village']:
            pg.evaluate(GO, ALL[nm]); pg.wait_for_timeout(800)
            r = pg.evaluate(ONCE)
            ok(r['bad'] == 0, '%s: every pooled piece drawn once (%d middle, %d fine) %s' % (nm, r['shown'], r['fine'], ' '.join(r['why'])))
        for kind, d, u in pg.evaluate(BOX):
            ok(d <= u * 1.05, '%s: fine and middle boxes agree (%.3f, one fine cell %.4f)' % (kind, d, u))
        for kind in ['wingChairFine', 'teaServiceFine', 'seeingStoneFine']:
            pos = pg.evaluate(NEAR, kind)
            if not pos: ok(False, kind + ': placed and pooled'); continue
            pg.evaluate(GO, pos); pg.wait_for_timeout(3000)
            pg.evaluate("()=>__vx.pinst.step()"); r = pg.evaluate(ONCE); s = pg.evaluate(STATE)
            ok(r['fine'] >= 1 and r['bad'] == 0, '%s: the fine copy shows beside it (%d fine)' % (kind, r['fine']))
            ok(s['shown'] <= s['max'] and s['tris'] <= s['cap'] and s['mb'] <= s['mbcap'], '%s: inside the budget (%d pieces, %d triangles, %.2f MB)' % (kind, s['shown'], s['tris'], s['mb']))
        ok(not err, 'no page errors %s' % err[:3])
        b.close()
    print('pinst_test: %d failed' % len(fails)); sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
