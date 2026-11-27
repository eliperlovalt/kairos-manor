"""The walker bot. python3 tools/tests/walkbot.py FOLDER [rounds=3] [--strict] [--json OUT]
It walks the Estate on foot with the page's own movement code (moveTo and fall: real gravity, real collisions, never flight):
  every pair of rooms joined by a door, both ways; every stair, up and down; a circuit of the grounds.
A route is found on the block grid (free cell, floor under it, no furniture footprint) and then walked for real, step by step.
It reports: routes walked, falls (dropped more than 1.6 below the route), sticks (no way on for 2 s of walking),
pass-throughs (the walker's feet inside a solid block or a furniture footprint he did not start in), and rooms with no way in.
Each later round walks the same routes with the waypoints nudged aside, so a hundred rounds are a hundred different walks.
Exit 1 with --strict if there is a fall or a pass-through."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
args=[a for a in sys.argv[1:] if not a.startswith('--')]
folder=args[0]; rounds=int(args[1]) if len(args)>1 else 3
strict='--strict' in sys.argv; out=None
if '--json' in sys.argv: out=sys.argv[sys.argv.index('--json')+1]
BOT=r"""(rounds)=>{const V=__vx,PL=V.PL,G=V.G;V.setMode('walk');V.setFly(0,1);PL.sit=null;
const WATER=new Set();{const g0=G(-40,-1,90);if(g0)WATER.add(g0)}
const solid=(x,y,z)=>G(x,y,z)!==0,free=(x,y,z)=>!solid(x,y,z)&&!solid(x,y+1,z),stood=(x,y,z)=>V.stood?V.stood(x,y,z):false;
const floorOK=(x,y,z)=>{const g=G(x,y-1,z);return g!==0&&!WATER.has(g)};
const key=(x,y,z)=>x+','+y+','+z;
const BODY=new Set();for(const e of V.life||[])if(e.static||e.seated||(e.r||0)>=.7){const r=Math.ceil((e.r||.4)+.3);for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)for(let dy=-1;dy<=1;dy++)BODY.add(key(Math.round(e.x)+dx,Math.round(e.y)+dy,Math.round(e.z)+dz))}
const onStair=(x,y,z)=>{for(const f of V.FLIGHTS){const st=f.e0+f.dir*.5,en=st+f.dir*(f.L+1),p=f.axis==='z'?z:x,l=f.axis==='z'?x:z;if(l>=f.l0-1&&l<=f.l1+1&&p>=Math.min(st,en)-1&&p<=Math.max(st,en)+1&&y>=f.base&&y<=f.base+f.H+2)return true}return false};
/* a move: level, one down, or one up. Up onto an unseen block only on a stair (stairs are climbed on unseen steps; a rail is an unseen block too, and nobody climbs a rail) */
function nbrs(x,y,z){const o=[];for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz;
    if(free(nx,y,nz)){if(stood(nx,y,nz)||stood(x+dx/2,y,z+dz/2))continue;let ny=y;if(!solid(nx,ny-1,nz))ny--;if(floorOK(nx,ny,nz)&&free(nx,ny,nz)&&!stood(nx,ny,nz)&&!BODY.has(key(nx,ny,nz)))o.push([nx,ny,nz,ny===y?1:3])}
    else if(solid(nx,y,nz)&&free(nx,y+1,nz)&&!solid(x,y+2,z)&&!stood(nx,y+1,nz)&&floorOK(nx,y+1,nz)&&(!V.isInv(G(nx,y,nz))||onStair(nx,y,nz)))o.push([nx,y+1,nz,3])}return o}
function path(a,b,box,cap){const Q=[[a],[],[],[]],dist=new Map([[key(...a),0]]),from=new Map([[key(...a),null]]);let n=0,cur=0,left=1;
  while(left>0&&n<(cap||60000)){while(!Q[cur%4].length)cur++;const c=Q[cur%4].pop();left--;const kc=key(c[0],c[1],c[2]);if(dist.get(kc)<cur)continue;n++;
    if(c[0]===b[0]&&c[1]===b[1]&&c[2]===b[2]){const p=[];let k=kc;while(k){p.push(k.split(',').map(Number));k=from.get(k)}return p.reverse()}
    for(const d of nbrs(c[0],c[1],c[2])){if(box&&(d[0]<box[0]||d[0]>box[2]||d[2]<box[1]||d[2]>box[3]||d[1]<box[4]||d[1]>box[5]))continue;const k=key(d[0],d[1],d[2]),nd=cur+d[3];if(!(dist.get(k)<=nd)){dist.set(k,nd);from.set(k,kc);Q[nd%4].push(d);left++}}}return null}
/* a place to stand is one with somewhere to go: not the kneehole of a desk */
const roomy=(x,y,z)=>{const q=[[x,y,z]],seen=new Set([key(x,y,z)]);let n=0;while(q.length&&n<10){const c=q.pop();n++;for(const d of nbrs(c[0],c[1],c[2])){const k=key(d[0],d[1],d[2]);if(!seen.has(k)){seen.add(k);q.push(d)}}}return seen.size>=9};
const spot=(cx,y,cz,R,box)=>{cx=Math.round(cx);cz=Math.round(cz);for(let r=0;r<=R;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const x=cx+dx,z=cz+dz;if(box&&(x<=box.x0||x>=box.x1||z<=box.z0||z>=box.z1))continue;if(free(x,y,z)&&floorOK(x,y,z)&&!stood(x,y,z)&&roomy(x,y,z))return[x,y,z]}return null};
const rep={routes:0,walked:0,falls:[],sticks:[],through:[],noPath:[],noWayIn:[],steps:0};
let seed=7;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
function walk(name,p,jit){PL.x=p[0][0];PL.z=p[0][2];PL.y=p[0][1]-.5;PL.vy=0;PL.air=0;PL.fly=0;PL.sit=null;rep.walked++;const fy0=p[0][1],in0=stood(PL.x,fy0,PL.z);
  for(let i=1;i<p.length;i++){const last=i===p.length-1,tx=p[i][0]+(last?0:jit*(rnd()-.5)),tz=p[i][2]+(last?0:jit*(rnd()-.5));let still=0,best=1e9;
    for(let s=0;s<400;s++){const dx=tx-PL.x,dz=tz-PL.z,d=Math.hypot(dx,dz);if(d<.16)break;const st=Math.min(.14,d),ux=dx/d,uz=dz/d;rep.steps++;
      let ok=V.moveTo(PL.x+ux*st,PL.z+uz*st);if(!ok&&Math.abs(ux)>.05)ok=V.moveTo(PL.x+Math.sign(ux)*st,PL.z);if(!ok&&Math.abs(uz)>.05)ok=V.moveTo(PL.x,PL.z+Math.sign(uz)*st);
      for(let k=0;k<3;k++)V.fall(.02);
      const fy=Math.round(PL.y+.5),gx=Math.round(PL.x),gz=Math.round(PL.z);
      if(solid(gx,fy,gz)){rep.through.push([name,'in a solid block',+PL.x.toFixed(1),fy,+PL.z.toFixed(1)]);return}
      if(!in0&&stood(PL.x,fy,PL.z)){rep.through.push([name,'in a furniture footprint',+PL.x.toFixed(1),fy,+PL.z.toFixed(1)]);return}
      if(PL.y+.5<Math.min(p[i][1],p[i-1][1])-1.6){rep.falls.push([name,+PL.x.toFixed(1),+(PL.y+.5).toFixed(1),+PL.z.toFixed(1),'route at y '+p[i][1]]);return}
      if(d<best-.01){best=d;still=0}else if(++still>66){rep.sticks.push([name,+PL.x.toFixed(1),fy,+PL.z.toFixed(1),'making for '+p[i].join(' ')]);return}}}}
/* 1. rooms joined by a door */
const routes=[];
V.BLD.forEach((B,b)=>{if(!B||!B.rooms)return;const T=B.rooms.map(R=>({R,t:spot((R.x0+R.x1)/2,R.y+1,(R.z0+R.z1)/2,Math.max(2,(Math.max(R.x1-R.x0,R.z1-R.z0)>>1)-1),R)}));const linked=new Set();
  for(let i=0;i<T.length;i++)for(let j=i+1;j<T.length;j++){const A=T[i],C=T[j];if(!A.t||!C.t||A.R.y!==C.R.y)continue;const a=A.R,c=C.R;if(!(a.x0<=c.x1&&c.x0<=a.x1&&a.z0<=c.z1&&c.z0<=a.z1))continue;
    const box=[Math.min(a.x0,c.x0),Math.min(a.z0,c.z0),Math.max(a.x1,c.x1),Math.max(a.z1,c.z1),a.y,a.y+3],p=path(A.t,C.t,box,20000);if(p){routes.push([(a.n||'?')+' > '+(c.n||'?'),p,box]);linked.add(i);linked.add(j)}}
  T.forEach((A,i)=>{if(!A.t)rep.noWayIn.push([B.name||b,A.R.n,'no free floor found near its middle']);else if(!linked.has(i))A.lone=1});
  /* a room with no door to a neighbour may still open on a passage or a stair: try the way to the building's first linked room */
  const home=T.find((A,i)=>linked.has(i));T.forEach(A=>{if(A.lone&&home){const p=path(A.t,home.t,null,900000);if(p)routes.push([(A.R.n||'?')+' > '+(home.R.n||'?')+' (by the passages)',p]);else rep.noWayIn.push([B.name||b,A.R.n,'no way found from '+A.t.join(' ')+' to '+home.R.n])}})});
const nRooms=routes.length;
/* 2. stairs */
for(const f of V.FLIGHTS){const st=f.e0+f.dir*.5,lane=Math.round((f.l0+f.l1)/2),at=(p)=>f.axis==='z'?[lane,p]:[p,lane];const b0=at(Math.round(st+f.dir*(f.L+1))),sd=(pp,l)=>f.axis==='z'?[l,pp]:[pp,l],cand=[at(Math.round(st-f.dir)),sd(Math.round(st),f.l0-1),sd(Math.round(st),f.l1+1),sd(Math.round(st+f.dir),f.l0-1),sd(Math.round(st+f.dir),f.l1+1),sd(Math.round(st),f.l0-2),sd(Math.round(st),f.l1+2)];
  const B2=spot(b0[0],f.base+f.H+1,b0[1],3);let A=null,a0=cand[0];for(const c of cand){if(free(c[0],f.base+1,c[1])&&floorOK(c[0],f.base+1,c[1])){A=[c[0],f.base+1,c[1]];if(B2&&path(A,B2,[Math.min(A[0],B2[0])-6,Math.min(A[2],B2[2])-6,Math.max(A[0],B2[0])+6,Math.max(A[2],B2[2])+6,f.base,f.base+f.H+3],40000))break}}const nm='stair bid '+f.bid+' '+f.axis+' lanes '+f.l0+'..'+f.l1+' from y '+f.base+' to '+(f.base+f.H);if(!A||!B2){rep.noPath.push([nm,'no free foot or head',JSON.stringify([a0,b0])]);continue}
  const p=path(A,B2,[Math.min(A[0],B2[0])-6,Math.min(A[2],B2[2])-6,Math.max(A[0],B2[0])+6,Math.max(A[2],B2[2])+6,f.base,f.base+f.H+3],40000);if(!p){rep.noPath.push([nm,'does not reach the floor above',A.join(' ')+' to '+B2.join(' ')]);continue}routes.push([nm,p])}
const nStairs=routes.length-nRooms;
/* 3. the grounds: a circuit */
const W=[[0,60],[0,80],[14,72],[0,92],[0,130],[32,145],[32,154],[23,154],[0,176],[-23,166],[-32,160],[0,150],[-60,128],[0,110],[60,40],[110,-56],[110,-80],[120,-60],[70,-130],[40,-120],[0,-100],[0,-146],[0,-153],[30,-170],[-40,-160],[-60,-110],[-110,-70],[-150,-76],[-100,60],[-60,56],[-20,56],[0,60]];
for(let i=0;i<W.length-1;i++){const gy=(x,z)=>{const y=V.groundY(x,z);return y==null?null:y};const ya=gy(W[i][0],W[i][1]),yb=gy(W[i+1][0],W[i+1][1]);const A=ya==null?null:spot(W[i][0],ya,W[i][1],6),B2=yb==null?null:spot(W[i+1][0],yb,W[i+1][1],6),nm='grounds '+W[i].join(',')+' > '+W[i+1].join(',');
  if(!A||!B2){rep.noPath.push([nm,'no free ground at an end']);continue}const p=path(A,B2,[Math.min(A[0],B2[0])-40,Math.min(A[2],B2[2])-40,Math.max(A[0],B2[0])+40,Math.max(A[2],B2[2])+40,-3,9],250000);if(!p){rep.noPath.push([nm,'no way found']);continue}routes.push([nm,p])}
rep.routes=routes.length;rep.rooms=nRooms;rep.stairs=nStairs;rep.grounds=routes.length-nRooms-nStairs;
for(const R of routes){const p=R[1],bk=path(p[p.length-1],p[0],R[2]||null,R[2]?40000:250000);R[3]=bk;if(!bk)rep.noPath.push([R[0]+' (back)','a way there, none back'])}
for(let r=0;r<rounds;r++)for(const[nm,p,bx,bk]of routes){walk(nm,p,r?.3:0);if(bk)walk(nm+' (back)',bk,r?.3:0)}   /* nudged up to .15 aside: the walker is .6 wide, a doorway of one block leaves him .2 a side */
const uniq=a=>{const m=new Map();for(const x of a){const k=JSON.stringify(x);m.set(k,(m.get(k)||0)+1)}return[...m].map(([k,n])=>[n,...JSON.parse(k)])};
rep.falls=uniq(rep.falls);rep.sticks=uniq(rep.sticks);rep.through=uniq(rep.through);return rep}"""
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base,w=480,h=300)
    pg.wait_for_timeout(2500)
    pg.set_default_timeout(1500000)
    rep=pg.evaluate(BOT,rounds)
    b.close()
print('WALKER BOT  %s  rounds %d'%(folder,rounds))
print('  routes %d (rooms joined by a door %d, stairs %d, grounds %d), walked %d times both ways, %d steps'%(rep['routes'],rep['rooms'],rep['stairs'],rep['grounds'],rep['walked'],rep['steps']))
for k,label in (('falls','falls'),('through','pass-throughs'),('sticks','sticks'),('noPath','no route'),('noWayIn','rooms with no way in')):
    v=rep[k]; print('  %-22s %d'%(label,len(v)))
    for row in v[:40]: print('      '+' | '.join(str(x) for x in row))
    if len(v)>40: print('      ... and %d more'%(len(v)-40))
if out: json.dump(rep,open(out,'w'),indent=1)
bad=len(rep['falls'])+len(rep['through'])
print('WALKER BOT %s'%('PASS' if not bad else 'FOUND %d'%bad))
sys.exit(1 if (strict and bad) else 0)
