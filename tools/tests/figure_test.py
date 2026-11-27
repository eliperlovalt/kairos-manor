"""The figures (v1.72). python3 tools/tests/figure_test.py FOLDER
Every person of the household is a fine figure on bones, and each is one draw:
  1. each role and each House, many times over: two eyes with their whites, brows, a nose, a mouth, two ears; ten parts, none empty;
     the fine copy within 1,400 faces and the far copy within 560
  2. in the page: every person but Kairos is such a figure; a figure in view is one mesh; one out of view works out no bones
  3. the fine copy is made when His Grace comes near and gives way to the far copy when he leaves; no more than the kept number are held
  4. figures walk: thighs, knees and arms turn
Exit 1 on any failure."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1]; fails=[]
def check(name, ok, detail=''):
    print('  %-74s %s %s'%(name,'ok' if ok else 'FAIL',detail if not ok else ''))
    if not ok: fails.append(name)
CARVE="""()=>{const V=__vx,F=V.fig,bad=[];let n=0,nq=0,fq=0,mxn=0,mxf=0;
 const roles=['footman','cellarman','hallboy','housekeeper','housemaid','cook','kitchenmaid','scullery','gardener','groom','farmhand','priest','villager','player'],houses=['gold','silver','white','copper','blue','yellow','green','violet','orange','grey','obsidian','brown','pink','red',null];
 const one=(role,h,i,child)=>{let sd=(i*7919+(role?role.length*131:17)+(h?h.length*977:5))>>>0;const r=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
   const o=F.spec(role,h,i%2?'The Convalescent Ward':'The Wireless Room',r,i,child),W=F.build(o),tag=(role||'member')+'/'+h+'/'+i,ew='#efe9df';
   if(W.at(-3,44,3)!==ew||W.at(2,44,3)!==ew||W.at(-2,44,3)!==o.eye||W.at(1,44,3)!==o.eye)bad.push(tag+' eyes');
   if(!W.at(-1,43,4)||!W.at(0,42,4))bad.push(tag+' nose');if(!W.at(-1,40,3)||!W.at(-3,45,3))bad.push(tag+' mouth or brow');if(!W.at(-5,43,0)||!W.at(4,43,0))bad.push(tag+' ears');
   const parts=new Set();for(let k=0;k<W.c.length;k++)if(W.c[k])parts.add(W.p[k]);if(parts.size!==10)bad.push(tag+' parts '+parts.size);
   const a=F.quads(W).n,b=F.quads(F.half(W)).n;n++;nq+=a;fq+=b;mxn=Math.max(mxn,a);mxf=Math.max(mxf,b);if(a>1400)bad.push(tag+' fine '+a);if(b>560)bad.push(tag+' far '+b);if(W.pal.length>200)bad.push(tag+' colours '+W.pal.length)};
 for(const role of roles)for(let i=0;i<10;i++)one(role,role==='villager'?null:'brown',i,role==='villager'&&i%4===3);
 for(const h of houses)for(let i=0;i<10;i++)one(null,h,i,false);
 return {n,meanNear:Math.round(nq/n),meanFar:Math.round(fq/n),maxNear:mxn,maxFar:mxf,bad}}"""
LIVE="""()=>{const V=__vx;let people=0,fine=0,multi=0,idle=0,near=0,far=0;for(const e of V.life){if(e.kind!=='person'||e.kh)continue;people++;const u=e.fig.userData;if(!u.fig2)continue;fine++;
   let vis=0;e.fig.traverse(m=>{if(m.isMesh&&m.visible)vis++});if(vis>1)multi++;if(!(e.fig.visible&&e.wrap.visible)&&e.wrap.matrixWorldAutoUpdate)idle++;if(u.near)near++;if(u.far)far++}
 return {people,fine,multi,idle,near,far,kept:V.fig.Q.list.length,keep:V.fig.Q.keep}}"""
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base,w=844,h=390)
    def tick(n=4):   # a headless page draws a frame only when one is asked for
        for _ in range(n): pg.screenshot(clip={'x':0,'y':0,'width':8,'height':8})
    C=pg.evaluate(CARVE)
    check('carved %d figures: eyes, brows, nose, mouth, ears, ten parts'%C['n'], not C['bad'], str(C['bad'][:6]))
    check('fine copy: mean %d faces, most %d (limit 1,400)'%(C['meanNear'],C['maxNear']), C['maxNear']<=1400)
    check('far copy: mean %d faces, most %d (limit 560)'%(C['meanFar'],C['maxFar']), C['maxFar']<=560)
    pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0);__vx.setMode('walk');__vx.setFP(true);__vx.setFly(1,1)}");tick(8)
    L=pg.evaluate(LIVE)
    check('every person but Kairos is a fine figure (%d of %d)'%(L['fine'],L['people']), L['people']>100 and L['fine']==L['people'])
    check('a figure in view is one mesh', L['multi']==0, str(L['multi']))
    check('a figure out of view works out no bones', L['idle']==0, str(L['idle']))
    # walk up to an outdoor figure, then away
    W=pg.evaluate("()=>{const V=__vx;let b=null;for(const e of V.life){if(e.kind!=='person'||e.indoor||e.kh)continue;if(!b||Math.hypot(e.x-8,e.z-58)<Math.hypot(b.x-8,b.z-58))b=e}window.__w=b;b.wait=0;b.tgt=[b.x+9,b.z+2];b.b=[b.x-12,b.x+12,b.z-12,b.z+12];return {x:b.x,y:b.y,z:b.z}}")
    pg.evaluate("([x,y,z])=>{const P=__vx.PL;P.x=x;P.y=y-.7;P.z=z+6;P.yaw=0;P.pitch=0;P.vy=0}",[W['x'],W['y'],W['z']]);tick(6)
    N=pg.evaluate("()=>{const u=window.__w.fig.userData,r=k=>Math.abs(u[k].rotation.x);return {near:!!(u.near&&u.near.visible),far:!!(u.far&&u.far.visible),move:Math.max(r('l1'),r('l2')),knee:Math.max(r('s1'),r('s2')),arm:Math.max(r('a1'),r('a2')),skirt:u.skirt}}")
    check('near His Grace the fine copy is shown and the far one is not', N['near'] and not N['far'], str(N))
    M=[N];
    for k in range(6):
        tick(2);M.append(pg.evaluate("()=>{const u=window.__w.fig.userData,r=k=>Math.abs(u[k].rotation.x);window.__w.wait=0;return {move:Math.max(r('l1'),r('l2')),knee:Math.max(r('s1'),r('s2')),arm:Math.max(r('a1'),r('a2')),skirt:u.skirt}}"))
    mv=max(m['move'] for m in M);kn=max(m['knee'] for m in M);ar=max(m['arm'] for m in M)
    check('a walking figure turns its thighs, knees and arms', mv>.05 and ar>.05 and (kn>.05 or M[0]['skirt']), 'thigh %.2f knee %.2f arm %.2f'%(mv,kn,ar))
    pg.evaluate("([x,y,z])=>{const P=__vx.PL;P.x=x;P.y=y-.7;P.z=z+60;P.yaw=0;P.pitch=0;P.vy=0}",[W['x'],W['y'],W['z']]);tick(6)
    N=pg.evaluate("()=>{const u=window.__w.fig.userData;return {near:!!(u.near&&u.near.visible),far:!!(u.far&&u.far.visible)}}")
    check('far from His Grace the far copy is shown', N['far'] and not N['near'], str(N))
    L=pg.evaluate(LIVE)
    check('fine copies held (%d) within the kept number (%d)'%(L['kept'],L['keep']), L['kept']<=L['keep']+1)
    check('no page errors', not err, str(err[:2])); b.close()
print('figure_test: %s'%('FAILED '+str(len(fails)) if fails else 'passed'))
sys.exit(1 if fails else 0)
