"""The door-to-door axes (His Grace's rule, 28 Nov): wherever two doors face each other across a room or a passage, the strip between them is clear, as wide as the doors' common
width, end to end, and nothing movable stands on it. python axis_check.py FOLDER [--json OUT] [--rows N]
A door is found as the Inspector's clear-way check finds one: an opening in a room's or hall's wall, open at foot and head height, with a lid over it, five blocks wide or less
(a wider opening is the open end of a passage, which the clear-way check covers).
A piece counts if it stands on the floor and rises past foot height (its top 0.6 or more above the floor), and is not a rug, a hung piece, a hanging light or the building itself. Report only (exit 0)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright

JS = r"""()=>{const V=__vx,G=V.G,vis=(x,y,z)=>{const g=G(Math.round(x),Math.round(y),Math.round(z));return !!g&&!V.isInv(g)},f2=v=>+v.toFixed(2);
 const SKIP=/^(rug|ragRug|dado|cornice|panelling|pictureRail|ceilingRose|sash|doorDouble|daisDoor|stageCurtain|column|balustrade|balPost|fireplace|pierGlass|bellPull|portrait|tapestry|chandelier|chandelierGilt|chandelierIron|lanternPendant|lantern|billiardLight|wallLantern|sconce)$/;
 const rooms=[];V.BLD.forEach((B,b)=>{if(B&&B.rooms)for(const r of B.rooms)rooms.push(Object.assign({b,hall:0},r))});for(const h of V.HALLS)rooms.push(Object.assign({b:h.bid,hall:1},h));
 const doorsOf=r=>{const y=r.y,D=[],line=(side,cells)=>{let run=null;for(const[a,x,z,dx,dz]of cells){let ok=vis(x,y,z)&&!vis(x,y+1,z)&&!vis(x,y+2,z);if(ok){let lid=false;for(let e=3;e<=9;e++)if(vis(x,y+e,z)){lid=true;break}ok=lid}
       if(ok){if(run&&a===run.a1+1)run.a1=a;else{if(run)D.push(run);run={side,a0:a,a1:a}}}else if(run){D.push(run);run=null}}if(run)D.push(run)};
   const C=(f)=>{const o=[];return o};
   line('n',Array.from({length:r.x1-r.x0-1},(_,i)=>[r.x0+1+i,r.x0+1+i,r.z0]));line('s',Array.from({length:r.x1-r.x0-1},(_,i)=>[r.x0+1+i,r.x0+1+i,r.z1]));
   line('w',Array.from({length:r.z1-r.z0-1},(_,i)=>[r.z0+1+i,r.x0,r.z0+1+i]));line('e',Array.from({length:r.z1-r.z0-1},(_,i)=>[r.z0+1+i,r.x1,r.z0+1+i]));return D.filter(d=>d.a1-d.a0+1<=5)};
 const P=[];for(const it of V.pq){const r=it.r;if(!r||!r.kind||it.wint||SKIP.test(r.kind))continue;let B;try{B=V.pbox(r)}catch(e){continue}if(!B||B.y1<.6||B.y0>.3)continue;
   const th=it.th||0,c=Math.cos(th),s=Math.sin(th);let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const lx of[B.x0,B.x1])for(const lz of[B.z0,B.z1]){const x=it.x+lx*c+lz*s,z=it.z-lx*s+lz*c;x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z)}
   P.push({k:r.kind,bid:it.bid||0,x:it.x,y:it.y,z:it.z,x0,x1,z0,z1,y0:it.y+B.y0,y1:it.y+B.y1})}
 const R={axes:0,hits:[],rooms:0};const seen=new Set();
 for(const r of rooms){const D=doorsOf(r);if(D.length<2)continue;R.rooms++;
   for(const[A,Bs]of[['n','s'],['w','e']]){for(const a of D.filter(d=>d.side===A))for(const b of D.filter(d=>d.side===Bs)){const lo=Math.max(a.a0,b.a0),hi=Math.min(a.a1,b.a1);if(lo>hi)continue;R.axes++;
       const ns=A==='n';const s0=lo-.5,s1=hi+.5;
       for(const p of P){if(p.bid!==r.b||p.y0>r.y+2.5||p.y1<r.y+.6+.5)continue;if(!(p.x>r.x0&&p.x<r.x1&&p.z>r.z0&&p.z<r.z1))continue;const a0=ns?p.x0:p.z0,a1=ns?p.x1:p.z1;if(a1<=s0+.05||a0>=s1-.05)continue;
         const key=p.k+'@'+f2(p.x)+','+f2(p.z);if(seen.has(key))continue;seen.add(key);R.hits.push([p.k,(r.n||'passage')+' (bld '+r.b+', y '+r.y+')',f2(p.x),f2(p.y),f2(p.z),'on the axis between the '+A+' door ('+a.a0+' to '+a.a1+') and the '+Bs+' door ('+b.a0+' to '+b.a1+'), strip '+f2(s0)+' to '+f2(s1)])}}}}
 return R}"""

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; folder = args[0]
    rows = int(sys.argv[sys.argv.index('--rows') + 1]) if '--rows' in sys.argv else 40
    with serve(folder) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, 'index.html')
        pg.wait_for_function('window.__vx && window.__vx.TM && window.__vx.TM.wall', timeout=300000); pg.wait_for_timeout(2000)
        R = pg.evaluate(JS); b.close()
    print('AXIS CHECK  %s: %d rooms with two or more doors, %d door-to-door axes' % (folder, R['rooms'], R['axes']))
    print('  pieces on a door-to-door axis      %d' % len(R['hits']))
    for h in R['hits'][:rows]: print('      ' + ' | '.join(str(v) for v in h))
    if '--json' in sys.argv: json.dump(R, open(sys.argv[sys.argv.index('--json') + 1], 'w'), indent=0)
    if err: print('page errors', err[:3])

if __name__ == '__main__':
    main()
