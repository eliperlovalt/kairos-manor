"""The connection checker. python3 tools/tests/connect_check.py FOLDER [--json OUT] [--rows N]
It reads the built house and lists, with coordinates:
  float   a standing piece with nothing under it (more than a tenth of a block of air: no floor, no piece, no wall or ceiling it hangs from)
  sunk    a standing piece whose foot is more than a tenth of a block inside the floor
  clash   two standing pieces run into one another (the middle of the smaller inside the larger; a chair at a table is not one)
  door    a door opening with no floor beyond it, or a wall
  hole    floor cells missing inside a room (small ones are faults; big ones are wells and voids, listed apart)
  glass   glass at eye level in a wall between two rooms
  clear   anything see-through at eye height inside a house (a clear pane or glass with air both sides, within the building's walls)
  dead    a clickable object with nothing to open
Report only (exit 0). The counts go in each commit message."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=[a for a in sys.argv[1:] if not a.startswith('--')][0]
rows=int(sys.argv[sys.argv.index('--rows')+1]) if '--rows' in sys.argv else 25
out=sys.argv[sys.argv.index('--json')+1] if '--json' in sys.argv else None
JS=r"""()=>{const V=__vx,G=V.G,R={float:[],sunk:[],clash:[],door:[],hole:[],void:[],glass:[],dead:[],pieces:0,standing:0,doors:0,rooms:0,objects:0};
const solidV=(x,y,z)=>{const g=G(x,y,z);return g!==0&&!V.isInv(g)},r1=v=>+v.toFixed(1);const WATER=new Set();{const g=G(-120,-1,90);if(g)WATER.add(g)}
const DECOR=/rug|carpet|runner|dado|panel|cornice|sash|portrait|tapestry|sconce|curtain|door|arch|balustr|beam|truss|garland|stocking|light|lantern|chandel|bellPull|shelf|peg|rail|antler|banner|coatOfArms|hymn|notice|wallMap|calendar|keyCab|rack|pelmet|coffer|ceiling|rose|skirting|frieze|pictureRail|clockWall|wallClock|trophy|mount|bracket|sign|flag|bunting|vine|ivy|wreath|holly|tinsel|bush|net|string|eave/i;
const SEAT=/chair|stool|windsor|fauteuil|settle|bench|pew|seat/i,TABLE=/table|desk|bureau|piano|counter|altar|bar|dresser/i;
const F=[];for(const it of V.pq){if(!it.r||!it.r.b)continue;R.pieces++;const inf=it.r.info||{};const B=V.pbox(it.r),th=it.th||0,c=Math.cos(th),s=Math.sin(th),cx=(B.x0+B.x1)/2,cz=(B.z0+B.z1)/2,hx=(B.x1-B.x0)/2,hz=(B.z1-B.z0)/2;
  const f={it,k:it.r.kind,x:it.x+cx*c+cz*s,z:it.z-cx*s+cz*c,ex:Math.abs(hx*c)+Math.abs(hz*s),ez:Math.abs(hx*s)+Math.abs(hz*c),y0:it.y+(B.y0||0),y1:it.y+B.y1,decor:DECOR.test(it.r.kind)||inf.wall||inf.hang||inf.ceiling||it.wint,small:!!inf.small};f.h=f.y1-f.y0;F.push(f)}
const HASH=new Map(),hk=(x,z)=>(Math.floor(x/3))+','+(Math.floor(z/3));for(const f of F){const k=hk(f.x,f.z);let a=HASH.get(k);if(!a)HASH.set(k,a=[]);a.push(f)}
const near=f=>{const o=[],a=Math.floor(f.x/3),b=Math.floor(f.z/3);for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const l=HASH.get((a+i)+','+(b+j));if(l)for(const g of l)if(g!==f)o.push(g)}return o};
/* 1, 2: floating and sunk */
for(const f of F){if(f.decor||f.h<.12)continue;R.standing++;let best=9,cg=9;for(const[ax,az]of[[0,0],[.6,.6],[-.6,.6],[.6,-.6],[-.6,-.6]]){const px=Math.round(f.x+ax*f.ex),pz=Math.round(f.z+az*f.ez);let top=null;for(let cy=Math.floor(f.y0+.6);cy>=Math.floor(f.y0)-3;cy--)if(solidV(px,cy,pz)){top=cy+.5;break}if(top==null)continue;const gap=f.y0-top;if(Math.abs(gap)<Math.abs(best))best=gap;if(!ax&&!az)cg=gap}
  if(Math.abs(best)<=.1)continue;
  let held=false;for(const g of near(f)){if(Math.abs(f.x-g.x)<g.ex+.15&&Math.abs(f.z-g.z)<g.ez+.15&&f.y0>=g.y0+.1&&f.y0-g.y1<.15&&f.y0-g.y1>-g.h){held=true;break}}if(held)continue;
  if(best>.1){/* something to hang from: a wall or a ceiling touching its box */let hung=false;for(let y=Math.floor(f.y0);y<=Math.ceil(f.y1)&&!hung;y++)for(let dx=-1;dx<=1&&!hung;dx++)for(let dz=-1;dz<=1;dz++){const px=Math.round(f.x+dx*(f.ex+.4)),pz=Math.round(f.z+dz*(f.ez+.4));if((dx||dz)&&solidV(px,y,pz)){hung=true;break}}
    if(!hung&&solidV(Math.round(f.x),Math.round(f.y1+.4),Math.round(f.z)))hung=true;if(hung&&(f.small||Math.min(f.ex,f.ez)<.22))continue;if(!hung||best>.3)R.float.push([f.k,r1(f.x),+f.y0.toFixed(2),r1(f.z),'gap '+best.toFixed(2),f.it.bid||0])}
  else if(cg<-.1&&cg>-2&&best<-.1&&!WATER.has(G(Math.round(f.x),Math.floor(f.y0+.6),Math.round(f.z)))&&!WATER.has(G(Math.round(f.x),Math.floor(f.y0+.6)-1,Math.round(f.z)))&&!/jetty|boat|punt|swan|lily/i.test(f.k))R.sunk.push([f.k,r1(f.x),+f.y0.toFixed(2),r1(f.z),'sunk '+(-best).toFixed(2),f.it.bid||0])}
/* 3: clashes */
{const seen=new Set();for(const f of F){if(f.decor||f.small||f.h<.5||f.ex*f.ez<.06)continue;for(const g of near(f)){if(g.decor||g.small||g.h<.5||g.ex*g.ez<.06)continue;const a=f.ex*f.ez<=g.ex*g.ez?f:g,b=a===f?g:f;if(a===b)continue;
    if(Math.abs(a.x-b.x)>b.ex-.12||Math.abs(a.z-b.z)>b.ez-.12)continue;if(Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0)<.3)continue;if(a.y0>=b.y1-.25||b.y0>=a.y1-.25)continue;
    if((SEAT.test(a.k)&&TABLE.test(b.k))||(SEAT.test(b.k)&&TABLE.test(a.k)))continue;const key=[a.k,r1(a.x),r1(a.z),b.k].join('|');if(seen.has(key))continue;seen.add(key);R.clash.push([a.k+' in '+b.k,r1(a.x),+a.y0.toFixed(1),r1(a.z),a.it.bid||0])}}}
/* 4, 5, 6: doors, holes, glass, room by room */
const GL=new Set();{const g=G(18,38,-9);if(g)GL.add(g)}   /* a pane of the Saloon's glass roof: the id of clear glass */const glassy=g=>g&&(V.isWin(g)||GL.has(g));
const inFlight=(x,y,z)=>{for(const f of V.FLIGHTS){const st=f.e0+f.dir*.5,en=st+f.dir*(f.L+1),p=f.axis==='z'?z:x,l=f.axis==='z'?x:z;if(l>=f.l0-1&&l<=f.l1+1&&p>=Math.min(st,en)-1&&p<=Math.max(st,en)+1&&y>=f.base&&y<=f.base+f.H+1)return true}return false};
V.BLD.forEach((B,b)=>{if(!B||!B.rooms)return;const glassHouse=/Greenhouse/.test(B.name||'');const inRoom=(x,z,y)=>B.rooms.some(r=>r.y===y&&x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1);
  for(const r of B.rooms){R.rooms++;const y=r.y,seenD=new Set();
    const wall=(x,z,ox,oz)=>{/* a door: the wall cell open two high from the floor */if(G(x,y+1,z)===0&&G(x,y+2,z)===0&&G(x,y,z)!==0){const k=x+','+z;if(!seenD.has(k)){seenD.add(k);R.doors++;const fx=x+ox,fz=z+oz;let floor=false;for(let d=0;d<=2;d++)if(G(fx,y-d,fz)!==0){floor=true;break}
          if(!floor)R.door.push([B.name||b,r.n,'no floor beyond',fx,y+1,fz]);else if(solidV(fx,y+1,fz)&&solidV(fx,y+2,fz))R.door.push([B.name||b,r.n,'a wall beyond',fx,y+1,fz])}}
      /* glass at eye level with a room on both sides */const g=G(x,y+2,z);if(!glassHouse&&glassy(g)&&!(V.isBlind&&V.isBlind(g))&&inRoom(x+ox,z+oz,y)&&inRoom(x-ox,z-oz,y)&&G(x+ox,y+2,z+oz)===0&&G(x-ox,y+2,z-oz)===0)R.glass.push([B.name||b,r.n,x,y+2,z])};
    for(let x=r.x0+1;x<r.x1;x++){wall(x,r.z0,0,-1);wall(x,r.z1,0,1)}for(let z=r.z0+1;z<r.z1;z++){wall(r.x0,z,-1,0);wall(r.x1,z,1,0)}
    /* holes in the floor, in clusters */const hs=new Map();for(let x=r.x0+1;x<r.x1;x++)for(let z=r.z0+1;z<r.z1;z++)if(G(x,y,z)===0&&G(x,y-1,z)===0)hs.set(x+','+z,[x,z]);
    while(hs.size){const[k0,c0]=hs.entries().next().value;hs.delete(k0);const q=[c0];let n=0,x0=c0[0],x1=c0[0],z0=c0[1],z1=c0[1],st=0;while(q.length){const c=q.pop();n++;x0=Math.min(x0,c[0]);x1=Math.max(x1,c[0]);z0=Math.min(z0,c[1]);z1=Math.max(z1,c[1]);if(inFlight(c[0],y,c[1]))st++;for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(c[0]+dx)+','+(c[1]+dz),v=hs.get(k);if(v){hs.delete(k);q.push(v)}}}
      const row=[B.name||b,r.n,n+' cells',x0+'..'+x1,y,z0+'..'+z1];if(st>n/3||n>=12)R.void.push(row.concat(st>n/3?'a stair well':'a void'));else R.hole.push(row)}}});
/* 6b: anything see-through at eye height inside a house: a clear pane or glass block with air on both sides, both sides within the building's own walls (an outer window has the park on one side; the Greenhouse is glass) */
R.clear=[];V.BLD.forEach((B,b)=>{if(!B||!B.rooms||!B.boxes||/Greenhouse/.test(B.name||''))return;const inside=(x,y,z)=>B.boxes.some(q=>x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1&&y<q.roofY&&y>=(q.yb||0));const ys=[...new Set(B.rooms.map(r=>r.y))];const seen=new Set();
  for(const q of B.boxes)for(const y0 of ys){if(y0>=q.roofY)continue;for(const y of[y0+2,y0+3])for(let x=q.x0+1;x<q.x1;x++)for(let z=q.z0+1;z<q.z1;z++){const g=G(x,y,z);if(!glassy(g)||(V.isBlind&&V.isBlind(g)))continue;const k=x+','+y+','+z;if(seen.has(k))continue;
      if((G(x-1,y,z)===0&&G(x+1,y,z)===0&&inside(x-1,y,z)&&inside(x+1,y,z))||(G(x,y,z-1)===0&&G(x,y,z+1)===0&&inside(x,y,z-1)&&inside(x,y,z+1))){seen.add(k);R.clear.push([B.name||b,x,y,z])}}}});
/* 7: clickable objects */
/* each clickable object: what a click does. run(a) in the page: nx and v23 open a room of GOLEM or the Datahub (links stood in for here; the real ones are on His Grace's device only),
   doc opens a link set from the private links when the page is wired, cat the Catalog, kchat Kairos, goal the goal slate, info a line of words, room a room card */
{const keep=Object.assign({},V.URLS||{});if(V.URLS){V.URLS.golem='https://golem.invalid/';V.URLS.datahub='https://datahub.invalid/';V.URLS.globe='https://globe.invalid/';V.URLS.pardes='https://pardes.invalid/'}R.front=[];R.kinds={};
  for(const o of V.OBJ||[]){R.objects++;const a=o.a;if(!a||!a.length){R.dead.push([o.n,'no action',o.x,o.y,o.z]);continue}const t=a[0],v=a[1];R.kinds[t]=(R.kinds[t]||0)+1;
    if(t==='nx'||t==='v23'){const u=V.viewUrl?V.viewUrl(v):'?';if(!u)R.dead.push([o.n,'key '+v+' gives no link',o.x,o.y,o.z]);else if(u==='https://golem.invalid/'&&String(v)!=='golem')R.front.push([o.n,String(v)])}
    else if(t==='doc'){/* empty on the public page by design: the link is private */}
    else if(!/^(cat|kchat|goal|info|room|kz|founders|you|kbutler)$/.test(t))R.dead.push([o.n,'unknown action '+t,o.x,o.y,o.z])}
  if(V.URLS){for(const k in V.URLS)delete V.URLS[k];Object.assign(V.URLS,keep)}}
/* 8 (v1.73): the household at four hours of its day: nobody stands in a piece of furniture, in a wall, or inside another */
R.figs=[];R.people=0;if(V.soul&&V.soul.S.list.length){const S=V.soul.S;for(const h of[10.5,12.2,13.2,19.6]){V.soul.setHour(h);const L=S.list.filter(e=>!e.gone&&e.soul.plan);R.people=Math.max(R.people,L.length);
    for(const e of L){if(e.seated)continue;const cx=Math.round(e.x),cz=Math.round(e.z);if(G(cx,e.y,cz)||G(cx,e.y+1,cz))R.figs.push([e.soul.name,'in a wall at '+h,cx,e.y,cz]);else if(V.stood(e.x,e.y,e.z))R.figs.push([e.soul.name,'in furniture at '+h,+e.x.toFixed(1),e.y,+e.z.toFixed(1)])}
    for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(Math.abs(a.y-b.y)>1)continue;const d=Math.hypot(a.x-b.x,a.z-b.z);if(d<.45)R.figs.push([a.soul.name,'inside '+b.soul.name+' at '+h,+a.x.toFixed(1),a.y,+a.z.toFixed(1)])}}V.soul.setHour(10.5)}
return R}"""
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base,w=480,h=300)
    pg.wait_for_timeout(1500)
    for _ in range(3): pg.screenshot(clip={'x':0,'y':0,'width':8,'height':8})   # a frame, so the household has taken its places
    R=pg.evaluate(JS)
    b.close()
print('CONNECTION CHECK  %s'%folder)
print('  %d pieces (%d standing), %d rooms, %d door cells, %d clickable objects, %d of the household at four hours'%(R['pieces'],R['standing'],R['rooms'],R['doors'],R['objects'],R.get('people',0)))
LAB=[('float','floating pieces'),('sunk','sunk pieces'),('clash','pieces run into one another'),('door','doors onto nothing'),('hole','holes in room floors'),('glass','glass at eye level between rooms'),('clear','see-through at eye height inside a house'),('dead','clickable objects that open nothing'),('figs','figures in furniture, walls or one another')]
for k,l in LAB:
    v=R[k]; print('  %-36s %d'%(l,len(v)))
    for row in v[:rows]: print('      '+' | '.join(str(x) for x in row))
    if len(v)>rows: print('      ... and %d more'%(len(v)-rows))
print('  wells and voids (not faults)         %d'%len(R['void']))
if R.get('front') is not None:
    print('  clicks by kind: %s'%', '.join('%s %d'%(k,n) for k,n in sorted(R.get('kinds',{}).items())))
    print('  objects that open GOLEM\'s front page only  %d'%len(R['front']))
    for row in R['front'][:rows]: print('      '+' | '.join(str(x) for x in row))
total=sum(len(R[k]) for k,_ in LAB)
print('CONNECTION CHECK: %d to look at'%total)
if out: json.dump(R,open(out,'w'),indent=1)
