/* contours.js : Euphrates Hall, Parts Depot v15 (Kairos XI.1, Nov 12 2026). The contours of every building.
   Plain script, no imports, no network. Load order: trees.js, ornament.js, contours.js.

   One call per building lays the ornament pieces out into a finished skin: plinth, a string course per floor, bays and
   pilasters, a surround on every window, door cases, cornice, parapet, tower tops, the skyline. It takes the Estate's own
   building spec as it stands (boxes, levels, doors), so a moved wall or a removed window costs nothing.

   CONTOURS.dress(spec,o) -> {name,style,pieces,tris,quads,faces,solids,cross,blind}
      spec  the Estate's building() spec: {name,levels:[{y,wr}],boxes:[{x0,z0,x1,z1,roofY,roof,yb,ov,winEvery,winW,winRows,only,glassWalls}],doors:[[x0,y0,z0,x1,y1,z1]]}
      o.style       a name from CONTOURS.STYLES (hall, state, service, chapel, glass, stable, gate, lodge, farm, cottage, bakery, shop, smithy, school, inn, church)
      o.openings    the real list (windows.json rows: {box,side,a0,a1,y0,y1,door} or {x,y,z,facing,w,h,door}); left out, the Estate's wall rule is replayed
      o.neighbours  other building specs that touch this one; o.existing  boxes already standing against it (terraces): {x0,z0,x1,z1,y1} in world blocks
      o.ground      height of the ground surface (default 0.5: the top of the y=0 cell)
      pieces  [{id,centre,min,max,near,far}] each no more than 64 blocks across; near and far are {pos,col,nor,index,quads}, world space, ready for a BufferGeometry
      faces   [{box,side,o,f,n,L,depth}] depth is a Float32Array, one value per wall cell (u + v*ceil(L)): how far the skin stands out there, 0 where bare. Use it for collision and for vines
      solids  ground pieces to be made solid: [{what,x0,y0,z0,x1,y1,z1}]
   CONTOURS.object(THREE,dressed,o) -> a Group; group.update(cameraPosition) swaps near and far per piece (o.far, default 115 blocks)
   CONTOURS.village(kind)  -> a spec for one village house kind in its own local blocks (door wall on +z); dress it once and place it with CONTOURS.houseMatrix
   CONTOURS.openings(spec) -> the wall rule replayed, as rows {box,side,a0,a1,y0,y1,door}
   Meshes carry userData.k='contour' and userData.o={building,piece,lod}. Same numbers in, same skin out: there is no randomness. */
const CONTOURS=(()=>{const O=ORNAMENT,{PAL,Skin,Face,P,W}=O;
const median=a=>{const s=a.slice().sort((x,y)=>x-y);return s.length?s[s.length>>1]:0};
const VW=['#f1ede4','#d8ccae','#e8dcc0','#bdb5a2'];
const STYLES={
 hall:{label:'Pinnacles',rows:['rust','state','hood','key','attic'],sub:['hood','hood'],vert:'stack',zoneOff:.5,plinth:.75,balcony:1,centre:16.5,cornice:{w:1},parapet:{base:1.75,crest:.75,ob:'piers'},subcap:{die:4.25,b:1.5,h:3.5},corner:'pil',niche:true,portico:true,cresting:true,stacks:{every:16,inset:3.5,w:3,d:2,h:8,pots:3}},
 state:{label:'The grand order of the wing',rows:['rust','state','hood'],vert:'giant',plinth:.75,cornice:{w:1},parapet:{base:1.75,crest:.75,ob:{every:8,phase:.5,die:2.25}},corner:'pil',niche:true,stacks:{every:16,inset:3.5,w:3,d:2,h:7,pots:3}},
 service:{label:'Plain dress',rows:['plainkey','lintel'],vert:'none',plinth:.5,cornice:{w:.5,slim:true},parapet:{base:1.5,crest:0,ob:'corners'},corner:'quoin',stacks:{every:16,inset:3.5,w:2,d:2,h:6,pots:2}},
 chapel:{label:'Gothic',rows:['lancet','lancet'],vert:'buttress',plinth:.75,eave:'corbel',gable:{coping:true,finial:'cross'},corner:'buttress',pal:{trim:'#ddd6c6',deep:'#bdb5a2'}},
 glass:{label:'Iron and stone',special:'glass',pal:{trim:'#d8ccae',deep:'#c3af86'}},
 stable:{label:'Stone on brick',rows:['lintelkey','lintel'],vert:'none',plinth:.5,eave:'plain',gable:{coping:true,finial:'ball'},corner:'board',arch:true,turret:true},
 gate:{label:'The gate',rows:['lintelkey','lintel'],vert:'none',plinth:.75,cornice:{w:.75},parapet:{base:1.75,crest:.75,ob:'corners'},corner:'board',gateArch:true},
 lodge:{label:'The lodge',rows:['plainkey'],vert:'none',plinth:.5,eave:'plain',corner:'quoin',apex:'ball'},
 farm:{label:'Plain and honest',rows:['lintel'],vert:'none',plinth:.5,eave:'board',gable:{finial:'ball'},corner:'board',pal:{trim:'#f1ede4',deep:'#d9d3c4'}}};
for(const k of['cottage','bakery','shop','smithy','school','inn','church'])STYLES[k]={label:'Village '+k,rows:['band','band'],vert:k==='church'?'buttress':'none',plinth:.5,eave:'board',gable:{finial:k==='church'?'cross':'ball',kneeler:true},corner:'board',sign:k,village:true};
const ROW={state:{sill:true,alt:true,rich:true},hood:{head:'hood',key:true},key:{sill:true,key:true},attic:{arch:.25,sill:true},plain:{arch:.25,sill:true},plainkey:{arch:.25,sill:true,key:true},lancet:{arch:.25,sill:true,label:true},frame:{arch:.25,sill:true},lintel:{arch:0,sill:true},lintelkey:{arch:0,sill:true,key:true}};

/* ---------- the Estate's wall rule, replayed (used until the real list is handed in) ---------- */
function levelsOf(spec,b){const L=spec.levels,out=[];for(let i=0;i<L.length;i++){if(L[i].y>=b.roofY)break;if(b.yb!=null&&L[i].y<b.yb)continue;if(b.only&&!b.only.includes(i))continue;out.push(L[i])}return out}
function openings(spec){const out=[];spec.boxes.forEach((b,bi)=>{if(b.glassWalls||b.win===false)return;const lv=levelsOf(spec,b),we=b.winEvery||3,ww=b.winW||1;
  lv.forEach((l,i)=>{const y1=(i+1<lv.length?Math.min(lv[i+1].y,b.roofY):b.roofY)-1,wr=b.winRows||l.wr||[2,3],r0=wr[0],r1=Math.min(wr[1],y1-l.y-1);if(r1<r0)return;
    for(const side of['N','S','E','W']){const ax=side==='N'||side==='S',len=ax?b.x1-b.x0:b.z1-b.z0,base=ax?b.x0:b.z0;let run=null;
      for(let a=1;a<=len;a++){const m=a%we,isW=a<len&&m>=1&&m<=ww&&a<len-1;if(isW){if(!run)run=[a,a];else run[1]=a}if((!isW||a===len)&&run){out.push({box:bi,side,a0:base+run[0]-.5,a1:base+run[1]+.5,y0:l.y+r0-.5,y1:l.y+r1+.5});run=null}}}})});
  for(const d of spec.doors||[]){let best=null;spec.boxes.forEach((b,bi)=>{for(const side of['N','S','E','W']){const ax=side==='N'||side==='S',line=side==='N'?b.z0:side==='S'?b.z1:side==='W'?b.x0:b.x1,d0=ax?d[2]:d[0],d1=ax?d[5]:d[3];if(line<d0||line>d1)continue;
      const a0=ax?d[0]:d[2],a1=ax?d[3]:d[5],lo=ax?b.x0:b.z0,hi=ax?b.x1:b.z1;if(a1<lo||a0>hi)continue;if(d[1]>=b.roofY||(b.yb!=null&&d[1]<b.yb))continue;const sc=(b.yb!=null?1:0);if(!best||sc>best.sc)best={sc,o:{box:bi,side,a0:Math.max(a0,lo)-.5,a1:Math.min(a1,hi)+.5,y0:d[1]-.5,y1:d[4]+.5,door:true}}}});
    if(best){const o=best.o;for(let i=out.length-1;i>=0;i--){const w=out[i];if(w.box===o.box&&w.side===o.side&&!w.door&&w.a0<o.a1&&w.a1>o.a0&&w.y0<o.y1&&w.y1>o.y0){if(w.a0<o.a0-.9)w.a1=o.a0;else if(w.a1>o.a1+.9)w.a0=o.a1;else out.splice(i,1)}}out.push(o)}}
  return out}
/* the real list, in either shape, to rows */
function rowsFrom(list,spec){return list.map(o=>{if(o.side&&o.a0!=null)return o;const f=(o.facing||o.face||'S')[0].toUpperCase(),ax=f==='N'||f==='S',c=ax?o.x:o.z,w=o.w||o.width||1,h=o.h||o.height||1;let box=o.box;
    if(box==null){let bd=1e9;spec.boxes.forEach((b,bi)=>{const line=f==='N'?b.z0:f==='S'?b.z1:f==='W'?b.x0:b.x1,p=ax?o.z:o.x,d=Math.abs(p-line)+(o.y<(b.yb==null?-99:b.yb)||o.y>=b.roofY?50:0);if(d<bd){bd=d;box=bi}})}
    return{box,side:f,a0:c-w/2,a1:c+w/2,y0:o.y-.5,y1:o.y-.5+h,door:!!o.door}})}
function groups(list){const s=list.slice().sort((a,b)=>a.u0-b.u0),g=[];for(const o of s){const l=g[g.length-1];if(l&&o.u0<=l.u1+.01){l.u1=Math.max(l.u1,o.u1);l.v0=Math.min(l.v0,o.v0);l.v1=Math.max(l.v1,o.v1);l.m.push(o);if(o.door)l.door=true}else g.push({u0:o.u0,u1:o.u1,v0:o.v0,v1:o.v1,m:[o],door:!!o.door})}return g}

/* ---------- one face ---------- */
function dressFace(F,c){const st=c.st,pal=c.pal,B=c.bands,top=c.top,L=F.L,g=c.ground,rows=c.rows,far=F.far,nb=B.length;if(!nb)return{piers:[]};
  const band=o=>{for(let i=0;i<nb;i++)if(o.v0>=B[i][0]-.01&&o.v0<B[i][1])return i;return -1},R=B.map(()=>[]);for(const o of F.open){const b=band(o);if(b>=0)R[b].push(o)}
  const G=R.map(groups);let main=0,mh=0;G.forEach((gs,i)=>{const h=gs.reduce((a,x)=>a+(x.door?0:x.v1-x.v0),0);if(h>mh){mh=h;main=i}});
  const piers=[];{const m=G[main];for(let i=0;i<m.length-1;i++){const a=m[i].u1,b=m[i+1].u0;if(b-a>=2&&F.at((a+b)/2,(B[main][0]+B[main][1])/2)!==2)piers.push((a+b)/2)}}
  const inZone=u=>F.zones.some(z=>u>z.u0&&u<z.u1&&!z.all),T=pal.trim,D=pal.deep;
  /* blank bays: where the rhythm of the front expects a window and the list has none */
  let blind=0;const slots=B.map(()=>[]);if(!far&&!st.village){const cs=[];for(const gs of G)for(const x of gs)if(!x.door)cs.push((x.u0+x.u1)/2);cs.sort((a,b)=>a-b);const bays=[];for(const x of cs)if(!bays.length||x-bays[bays.length-1]>.9)bays.push(x);
    const df=[];for(let i=1;i<bays.length;i++)df.push(bays[i]-bays[i-1]);const pitch=median(df)||0;if(pitch>=2){const all=bays.slice();for(let i=1;i<bays.length;i++){const gap=bays[i]-bays[i-1],n=Math.round(gap/pitch);if(n>=2&&Math.abs(gap-n*pitch)<1.1)for(let k=1;k<n;k++)all.push(bays[i-1]+k*gap/n)}
      G.forEach((gs,bi)=>{const ws=gs.filter(x=>!x.door);if(ws.length<1||rows[bi]==='band')return;const w=median(ws.map(x=>x.u1-x.u0)),v0=median(ws.map(x=>x.v0)),v1=median(ws.map(x=>x.v1));
        for(const b of all){const a0=b-w/2,a1=b+w/2;if(a0<.75||a1>L-.75)continue;if(gs.some(x=>x.u0<a1+.9&&x.u1>a0-.9))continue;let ok=true;for(let u=a0-.5;u<=a1+.5&&ok;u+=.5)for(let v=v0;v<=v1;v+=.5)if(F.at(u,v)!==0){ok=false;break}if(!ok)continue;slots[bi].push({u0:Math.round(a0*4)/4,u1:Math.round(a1*4)/4,v0,v1});blind++}})}}
  /* zone slabs: the towers and the centre stand half a block forward */
  /* the base */
  if(st.plinth&&!c.sub&&!(far&&st.village))F.course(g,g+st.plinth,.5,D,null,null,'plinth');
  if(rows[0]==='rust'&&!c.sub){if(!far)for(let v=g+st.plinth;v+.75<=B[0][1]-.75;v+=1){let u=0;const cut=G[0].filter(x=>x.v0-.5<v+.75&&x.v1+.75>v).map(x=>[x.u0-.5,x.u1+.5]);cut.push([L,L]);for(const[a,b]of cut){if(a-u>.3)F.on(u,v,a,v+.75,.25,pal.rust,'rust');u=Math.max(u,b)}}
    if(!far)for(const x of G[0]){if(x.door){P.doorcase(F,x,{c:T,deep:D,hood:false});continue}const uc=(x.u0+x.u1)/2;F.on(x.u0-.5,x.v1,x.u1+.5,x.v1+.75,.25,T,'lintel');F.on(uc-.25,x.v1,uc+.25,x.v1+1,.5,D,'key');F.on(x.u0-.5,x.v0-.5,x.u1+.5,x.v0,.25,D,'sill')}}
  /* string courses, and the balcony on the show front */
  const bal=c.front&&st.balcony!=null&&st.balcony<nb-1?st.balcony:-1,bw=1.5;
  for(let i=0;i<nb-1;i++){const bt=B[i][1];if(rows[i]==='band'||st.village)continue;
    if(i===bal){F.course(bt-.5,bt,bw,D,null,null,'balc');if(!far){F.course(bt-.75,bt-.5,bw-.5,T,null,null,'balc');for(const u of piers)if(st.vert!=='stack')P.console(F,u,bt-.75,1,{h:1})}
      const segs=[];let u=0;for(const z of F.zones.filter(z=>!z.all).sort((a,b)=>a.u0-b.u0)){if(z.u0>u)segs.push([u,z.u0,0]);segs.push([z.u0,z.u1,z.off]);u=z.u1}if(u<L)segs.push([u,L,0]);
      for(const[a,b,o]of segs){const a2=a<=0&&F.free0?-(bw+o)+.5:a,b2=b>=L&&F.free1?L+bw+o-.5:b;P.rail(F,a2,b2,bt,o+bw-.5,o+bw,{kind:'open',c:T,deep:D});if(!far)for(const p of piers)if(p>a&&p<b)P.die(F,p,bt,o+bw-.75,o+bw,{h:1,c:T})}}
    else{F.course(bt-.5,bt,.5,D,null,null,'string');if(!far&&!st.cornice?.slim)F.course(bt-.75,bt-.5,.25,T,null,null,'string')}}
  /* rows of windows */
  const pitch2=5,rank=u=>Math.round(Math.abs(u-L/2)/pitch2);
  G.forEach((gs,bi)=>{const kind=rows[bi];if(kind==='rust'&&!c.sub)return;
    if(kind==='band'){if(far||!gs.length)return;const ws=gs.filter(x=>!x.door);if(ws.length){const v0=median(ws.map(x=>x.v0)),v1=median(ws.map(x=>x.v1));F.course(v0-.25,v0,.25,D,null,null,'sillband')}
      for(const x of gs)if(x.door)P.doorcase(F,x,{c:T,deep:D,hood:st.sign!=='shop'});return}
    const k=Object.assign({c:T,deep:D},ROW[kind]||ROW.plain);
    for(const x of gs){if(x.door&&(x.balcony||i_isBal(bi))){x.balcony=true;P.balconyDoor(F,x,{c:T,deep:D});continue}if(x.door){P.doorcase(F,x,{c:T,deep:D,grand:kind==='state'&&x.u1-x.u0>=3,arch:st.arch&&x.u1-x.u0>=3,jamb:st.arch&&x.u1-x.u0>=3?.75:.5});continue}
      const o=Object.assign({},k);if(k.alt)o.head=rank((x.u0+x.u1)/2)%2?'tri':'seg';if(i_isBal(bi))o.sill=false;P.surround(F,x,o)}
    for(const x of slots[bi]){const o=Object.assign({},k,{niche:st.niche&&kind==='state'});if(k.alt)o.head=rank((x.u0+x.u1)/2)%2?'tri':'seg';if(i_isBal(bi))o.sill=false;P.blind(F,x,o)}});
  function i_isBal(bi){return bal>=0&&bi===bal+1}
  /* the verticals */
  const first=rows[0]==='rust'&&!c.sub?1:0;
  for(const u of piers){
    if(far){if(st.vert==='stack'||st.vert==='giant')P.strip(F,u,B[first][0],top-1,{w:1,c:T,keep:true});else if(st.vert==='buttress')P.buttress(F,u,g,top-1,{c:T,deep:D});continue}
    if(st.vert==='stack'){if(c.sub){P.strip(F,u,B[0][0],top-1.25,{w:.75,c:T,keep:true})}else for(let i=first;i<nb;i++){const v0=B[i][0],v1=i<nb-1?B[i][1]-.75:top-1.25;if(nb>4&&i===nb-1)P.strip(F,u,v0,v1,{w:.75,c:T});else P.pilaster(F,u,v0,v1,{w:i>=3?.75:1,panel:true,c:T,deep:D})}}
    else if(st.vert==='giant'){if(nb>first+1){P.pilaster(F,u,B[first][0],B[first][1]-.75,{flute:true,c:T,deep:D});P.strip(F,u,B[first+1][0],top-1.25,{w:1,c:T})}else P.pilaster(F,u,B[first][0],top-1.25,{flute:true,c:T,deep:D})}
    else if(st.vert==='buttress')P.buttress(F,u,g,top-(c.kind==='flat'?1.25:1),{c:T,deep:D})}
  /* corners of the front and of each zone */
  const ends=[];if(F.free0)ends.push([0,false,top]);if(F.free1)ends.push([L,true,top]);for(const z of F.zones)if(!z.all){if(z.u0>0)ends.push([z.u0,false,Math.min(z.top,top)]);if(z.u1<L)ends.push([z.u1,true,Math.min(z.top,top)])}
  for(const[e,right,zt]of ends){const a=right?e-1:e,b=right?e:e+1,v0=c.sub?B[0][0]:g+(st.plinth||0),v1=zt-(c.kind==='flat'?1.25:.75);if(v1-v0<1.5)continue;
    if(st.corner==='quoin')P.quoins(F,a,b,v0,v1,{right,c:T});else if(st.corner==='board')P.strip(F,(a+b)/2,v0,v1,{w:.5,c:T,keep:true});
    else if(st.corner==='buttress')P.buttress(F,(a+b)/2,g,v1,{c:T,deep:D});
    else if(st.corner==='pil'){if(piers.some(p=>Math.abs(p-(a+b)/2)<1.6))continue;if(c.sub||far)P.strip(F,(a+b)/2,v0,v1,{w:.5,proud:.5,c:T,keep:true});else for(let i=first;i<nb;i++)P.pilaster(F,(a+b)/2,B[i][0],i<nb-1?B[i][1]-.75:top-1.25,{w:.5,c:T,deep:D})}}
  /* the top of the wall */
  if(c.kind==='flat'){const cw=(st.cornice&&st.cornice.w)||1;
    if(far)F.course(top-1,top,Math.max(.5,cw),D,null,null,'corn');
    else if(st.cornice&&st.cornice.slim){F.course(top-.75,top-.25,.25,T,null,null,'corn');F.course(top-.25,top,.5,D,null,null,'corn')}
    else{F.course(top-1.25,top-.75,.5,T,null,null,'corn');F.course(top-.75,top-.5,cw-.25,T,null,null,'corn');F.course(top-.5,top,cw,D,null,null,'corn')}}
  else if(c.kind==='eave'){if(st.eave==='board'){if(!far)F.course(top-.5,top,.25,T,null,null,'eave')}else{F.course(top-.5,top,.5,D,null,null,'eave');if(!far){if(st.eave==='corbel'){for(let u=.5;u+.5<=L;u+=1.5)F.on(u,top-1,u+.5,top-.5,.5,T,'corbel')}else F.course(top-.75,top-.5,.25,T,null,null,'eave')}}}
  else if(c.kind==='gable'&&c.ov>0&&!st.village)F.course(top-.5,top,Math.min(.75,c.ov),D,null,null,'eave');
  return{piers,G,blind,main}}

/* the parapet of a flat roof, on one face */
function parapet(F,S,c,piers){const st=c.st,pal=c.pal,pp=c.sub&&st.subcap?Object.assign({},st.parapet,{ob:'corners',die:st.subcap.die,b:st.subcap.b,h:st.subcap.h,mid:true}):st.parapet;if(!pp)return;const top=c.top,L=F.L,far=F.far,T=pal.trim,D=pal.deep;
  const runs=[];{let u=0;for(const r of(c.rise||[]).slice().sort((a,b)=>a[0]-b[0])){if(r[0]>u)runs.push([u,r[0]]);u=Math.max(u,r[1])}if(u<L)runs.push([u,L])}
  for(const[a,b]of runs){F.band(top,top+pp.base,-1.25,.25,T,'para',a,b);if(!far)F.band(top+pp.base,top+pp.base+.25,-1.25,.5,D,'para',a,b);
    if(pp.crest){const y=top+pp.base+.25,segs=[];let u=a;for(const z of F.zones.filter(z=>!z.all&&z.u1>a&&z.u0<b).sort((p,q)=>p.u0-q.u0)){if(z.u0>u)segs.push([u,z.u0,0]);segs.push([Math.max(a,z.u0),Math.min(b,z.u1),z.off]);u=z.u1}if(u<b)segs.push([u,b,0]);
      for(const[p,q,o]of segs)P.rail(F,p,q,y,o-.5,o,{kind:'open',h:pp.crest,step:1.5,c:T,deep:D})}
    const yb=top+pp.base+.25+(pp.crest||0),put=(u,die,b2,h,ball)=>{if(F.at(u,top-1)===2)return;const o=F.off(Math.min(L-.1,Math.max(.1,u)));if(die){F.box(u-.75,top,-1.25,u+.75,top+die,o+.25,T,'die',true)}else F.box(u-.5,top,-1,u+.5,yb,o+.25,T,'die',true);const[x,z]=F.xz(u,o-.5);W.obelisk(S,x,die?top+die:yb,z,{b:b2||1,h:h||2.5,ball,c:T})};
    if(pp.ob==='piers'){for(const p of piers)if(p>a+.5&&p<b-.5)put(p,0,1,2.5)}
    else if(pp.ob==='corners'){if(a<=0&&F.free0)put(.5,pp.die||0,pp.b,pp.h,true);if(b>=L&&F.free1)put(L-.5,pp.die||0,pp.b,pp.h,true);if(pp.mid&&b-a>12)put(Math.round((a+b)/2*2)/2,0,1,2.5)}
    else if(pp.ob&&pp.ob.every){for(let u=pp.ob.phase;u<L;u+=pp.ob.every)if(u>a&&u<b)put(u,pp.ob.die,1,2.5,true)}}}

/* ---------- roofs with a ridge ---------- */
function ridged(S,b,st,pal,endFree){const t=b.roof||'hip',ov=b.ov||[1,1,1,1],far=S.unit>=.5,T=pal.trim,D=pal.deep;if(t!=='gableX'&&t!=='gableZ'&&t!=='hip')return;
  if(t==='hip'){if(!st.apex)return;const dx=b.x1-b.x0+ov[0]+ov[1],dz=b.z1-b.z0+ov[2]+ov[3],k=Math.floor(Math.min(dx,dz)/2),y=b.roofY+k+.5,cx=(b.x0-ov[0]+b.x1+ov[1])/2,cz=(b.z0-ov[2]+b.z1+ov[3])/2,h=(Math.max(dx,dz)-Math.min(dx,dz))/2;
    for(const s of h>1?[-1,1]:[0]){const x=dx>dz?cx+s*h:cx,z=dx>dz?cz:cz+s*h;W.ball(S,x,y,z,{c:T})}return}
  const X=t==='gableX',a0=X?b.x0:b.z0,a1=X?b.x1:b.z1,t0=(X?b.z0:b.x0),t1=(X?b.z1:b.x1),oa=X?[ov[0],ov[1]]:[ov[2],ov[3]],ot=X?[ov[2],ov[3]]:[ov[0],ov[1]],c=t0-ot[0],d=t1+ot[1],n=Math.floor((d-c)/2),ry=b.roofY+n+.5,mid=(c+d)/2;
  const box=(al0,y0,tr0,al1,y1,tr1,col,p)=>X?S.wbox(al0,y0,tr0,al1,y1,tr1,col,p):S.wbox(tr0,y0,al0,tr1,y1,al1,col,p);
  [0,1].forEach(e=>{if(!endFree[e])return;const flush=b.gableFlush,face=e?a1+(flush?0:oa[1])+.5:a0-(flush?0:oa[0])-.5,s=e?1:-1,in0=Math.min(face,face-s*1),in1=Math.max(face,face-s*1),o0=Math.min(face,face+s*.25),o1=Math.max(face,face+s*.25);
    if(st.gable&&st.gable.coping&&!flush)for(let k=0;k<=n;k++){for(const tz of k*2===d-c?[c+k]:[c+k,d-k]){box(Math.min(in0,o0),b.roofY+k-.5,tz-.5,Math.max(in1,o1),b.roofY+k+.75,tz+.5,T,'coping')}}
    if(st.gable&&st.gable.coping&&!far)for(const tz of[c,d])box(o0-(s<0?.25:0),b.roofY-1.25,tz-.5,o1+(s>0?.25:0),b.roofY-.5,tz+.5,D,'kneeler');
    const fx=face-s*.5,py=ry+(st.gable&&st.gable.coping&&!flush?.25:0);if(st.gable&&st.gable.finial==='cross'){X?W.cross(S,fx,py,mid,'z',{c:T}):W.cross(S,mid,py,fx,'x',{c:T})}else if(st.gable&&st.gable.finial){const kk={c:T,plain:!!st.village};X?W.ball(S,fx,py,mid,kk):W.ball(S,mid,py,fx,kk)}});
  if(st.sign==='school'||st.sign==='church'){/* a bell-cote on the ridge */const al=a0+2.5,y=ry-.5,bx=(u0,y0,t0,u1,y1,t1,col)=>box(u0,y0,t0,u1,y1,t1,col,'bellcote');if(far)bx(al-1,y,mid-.5,al+1,y+3,mid+.5,T);else{bx(al-1.25,y,mid-.5,al+1.25,y+.5,mid+.5,D);bx(al-1,y+.5,mid-.25,al-.5,y+2.5,mid+.25,T);bx(al+.5,y+.5,mid-.25,al+1,y+2.5,mid+.25,T);bx(al-1.25,y+2.5,mid-.5,al+1.25,y+3,mid+.5,D);bx(al-.5,y+3,mid-.25,al+.5,y+3.5,mid+.25,T);bx(al-.25,y+1.25,mid-.25,al+.25,y+2,mid+.25,PAL.gold)}}
  return{ridgeY:ry,mid,X,a0,a1}}

/* ---------- special parts ---------- */
function portico(F,S,R,g,band,st,pal,solids,piers){const uc=(g.u0+g.u1)/2,v0=g.v0,vb=band[1]-1.5,o=F.off(uc),zf=9.5,hw=10.5,T=pal.trim,D=pal.deep,far=F.far;
  const near=d=>{const c=piers.filter(p=>Math.abs(Math.abs(p-uc)-d)<1.6);return c.length>=2?Math.min(hw-.75,Math.abs(c[0]-uc)):d},cols=[near(9.75),near(5)],us=[uc-cols[0],uc-cols[1],uc+cols[1],uc+cols[0]];
  F.del(uc-hw,band[1],0,uc+hw,band[1]+1.5,o+3);
  F.box(uc-hw,vb+1,o,uc+hw,vb+1.5,zf,D,'proof');if(!far)F.box(uc-hw-.5,vb+1.25,o,uc+hw+.5,vb+1.5,zf+.5,D,'proof');
  F.box(uc-hw,vb,zf-1.5,uc+hw,vb+1,zf,T,'pbeam');F.box(uc-hw,vb,o,uc-hw+1.5,vb+1,zf,T,'pbeam');F.box(uc+hw-1.5,vb,o,uc+hw,vb+1,zf,T,'pbeam');
  const col=(u,w,k)=>{const[x,z]=F.xz(u,w);W.column(S,x,v0,vb,z,Object.assign({c:T},k));solids.push({what:'portico pier',x0:x-.75,y0:v0,z0:z-.75,x1:x+.75,y1:vb,z1:z+.75})};
  for(const u of us)col(u,zf-.75,{sq:true,panel:true});for(const u of[us[0],us[3]]){col(u,Math.round((o+zf)/2*4)/4,{sq:true});F.box(u-.75,v0,o,u+.75,vb,o+.5,T,'presp')}
  if(!far)for(const u of us)for(const s of[-1,1])for(let i=0;i<3;i++){const a=u+s*.75,b=u+s*(1.5-i*.25);if(Math.abs((a+b)/2-uc)>hw)continue;F.box(Math.min(a,b),vb-.5-i*.5,zf-1.25,Math.max(a,b),vb-i*.5,zf-.25,D,'pbrack')}
  P.rail(F,uc-hw,uc+hw,vb+1.5,zf-.5,zf,{kind:'open',c:T,deep:D});for(const s of[-1,1]){const u=uc+s*(hw-.25);if(far)F.box(u-.25,vb+1.5,o+2.5,u+.25,vb+2.5,zf,T,'rail');else{F.box(u-.25,vb+2.25,o+2.5,u+.25,vb+2.5,zf,D,'rail');for(let w=o+2.75;w+.25<=zf;w+=1)F.box(u-.125,vb+1.5,w,u+.125,vb+2.25,w+.25,T,'bal')}}
  const prof=dx=>dx<1?3:dx<1.75?2.5:dx<2.75?1.75:dx<3.25?2.25:dx<4?1.25:0;{const[x0,z0]=F.xz(uc,zf-.5),[x1,z1]=F.xz(uc,zf),ax=F.axis;W.shaped(S,ax,ax==='x'?x0:z0,4,vb+1.5,Math.min(ax==='x'?z0:x0,ax==='x'?z1:x1),Math.max(ax==='x'?z0:x0,ax==='x'?z1:x1),prof,T,'crest')}
  if(!far)F.box(uc-.5,vb+2.5,zf,uc+.5,vb+3.5,zf+.25,PAL.gold,'crest');
  for(const s of[-1,1]){const u=uc+s*(hw-.5);F.box(u-.5,vb+1.5,zf-1,u+.5,vb+2.5,zf,T,'fin');const[x,z]=F.xz(u,zf-.5);W.obelisk(S,x,vb+2.5,z,{b:1,h:2.25,ball:true,c:T})}}

function cresting(F,S,c,pal){/* a strapwork cresting over the door, on the show front */const st=c.st,pp=st.parapet,y=c.top+pp.base+.25,uc=F.L/2,o=F.off(uc),T=pal.trim,ax=F.axis;
  const prof=dx=>dx<1.5?4:dx<2.25?3.25:dx<3.75?2:dx<4.5?2.75:dx<6?1.5:dx<7?1:0;const[xa,za]=F.xz(uc,o-.5),[xb,zb]=F.xz(uc,o+.25);W.shaped(S,ax,ax==='x'?xa:za,7,y,Math.min(ax==='x'?za:xa,ax==='x'?zb:xb),Math.max(ax==='x'?za:xa,ax==='x'?zb:xb),prof,T,'crest');
  if(!F.far){F.box(uc-1,y+1,o+.25,uc+1,y+3,o+.5,pal.deep,'crest',true);F.box(uc-.5,y+1.5,o+.5,uc+.5,y+2.5,o+.75,PAL.gold,'crest',true)}
  for(const s of[-1,1]){const u=uc+s*7.75;F.box(u-.75,c.top,-1.25,u+.75,y+1,o+.25,T,'die',true);const[x,z]=F.xz(u,o-.5);W.obelisk(S,x,y+1,z,{b:1.5,h:4,ball:true,c:T})}
  const[x,z]=F.xz(uc,o-.125);W.obelisk(S,x,y+4,z,{b:1,h:2,ball:true,c:T})}

/* ---------- chimney stacks (v21: made by the Estate chat, 26 Nov 2026). A flat roof behind its parapet carries stone stacks with clay pots: set back from each front,
   spaced out from the middle of each side, never beside a higher part of the same building (a tower, the dome). A narrow roof has one row down its middle.
   Far off a stack is its shaft and its cap. st.stacks = {every, inset, w, d, h, pots}; sizes on the half block so near and far agree ---------- */
function stacks(S,spec,b,bi,st,pal){const k=st.stacks,y=b.roofY+.5,T=pal.trim,D=pal.deep,far=S.unit>=.5,e=k.every,ins=k.inset,cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,hw=k.w/2,hd=k.d/2,H=k.h,L=b.x1-b.x0+1,Dz=b.z1-b.z0+1;let n=0;
  const clear=(x,z)=>!spec.boxes.some((o,i)=>i!==bi&&o.roofY>b.roofY&&x>o.x0-3&&x<o.x1+3&&z>o.z0-3&&z<o.z1+3);
  const one=(x,z,ax)=>{if(!clear(x,z))return;const a=ax?hw:hd,c=ax?hd:hw;n++;
    if(far){S.wbox(x-a,y,z-c,x+a,y+H-.5,z+c,T,'stack');S.wbox(x-a-.5,y+H-.5,z-c-.5,x+a+.5,y+H,z+c+.5,D,'stack');return}
    S.wbox(x-a-.25,y,z-c-.25,x+a+.25,y+.5,z+c+.25,D,'stack');S.wbox(x-a,y+.5,z-c,x+a,y+H-1,z+c,T,'stack');S.wbox(x-a-.25,y+H-1.75,z-c-.25,x+a+.25,y+H-1.5,z+c+.25,D,'stack');
    S.wbox(x-a-.25,y+H-1,z-c-.25,x+a+.25,y+H-.5,z+c+.25,T,'stack');S.wbox(x-a-.5,y+H-.5,z-c-.5,x+a+.5,y+H-.25,z+c+.5,D,'stack');S.wbox(x-a,y+H-.25,z-c,x+a,y+H,z+c,T,'stack');
    for(let i=0;i<k.pots;i++){const t=k.pots>1?(i/(k.pots-1)*2-1)*((ax?a:c)-.5):0,px=x+(ax?t:0),pz=z+(ax?0:t);S.wbox(px-.25,y+H,pz-.25,px+.25,y+H+1,pz+.25,'#b5653a','pot')}};
  if(Dz>=2*ins+12&&L>=2*ins+12){for(let u=e;u<L/2-ins-1;u+=e)for(const s of[-1,1]){one(cx+s*u,b.z0-.5+ins,true);one(cx+s*u,b.z1+.5-ins,true)}
    for(let u=e*.75;u<Dz/2-ins-1;u+=e)for(const s of[-1,1]){one(b.x0-.5+ins,cz+s*u,false);one(b.x1+.5-ins,cz+s*u,false)}}
  else if(L>=Dz)for(let u=e/2;u<L/2-ins;u+=e)for(const s of[-1,1])one(Math.round((cx+s*u)*2)/2,Math.round(cz*2)/2,true);
  else for(let u=e/2;u<Dz/2-ins;u+=e)for(const s of[-1,1])one(Math.round(cx*2)/2,Math.round((cz+s*u)*2)/2,false);
  return n}

function dome(S,R,b,st,pal){const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,rx=(b.x1-b.x0)/2+.5,H=rx*.9,yc=b.roofY,T=pal.trim,D=pal.deep,u=R.unit,far=S.unit>=.5;
  /* four corner turrets where the round dome leaves the square open */
  for(const sx of[-1,1])for(const sz of[-1,1]){const x=cx+sx*(rx-1.5),z=cz+sz*(rx-1.5);S.wbox(x-1.5,yc+.5,z-1.5,x+1.5,yc+3,z+1.5,T,'turret');if(!far)S.wbox(x-1.75,yc+3,z-1.75,x+1.75,yc+3.25,z+1.75,D,'turret');W.obelisk(S,x,yc+3.25,z,{b:1.5,h:3.5,ball:true,c:T})}
  /* a ring at the foot of the dome, and eight ribs over it */
  const n=Math.ceil((rx+2)/u);for(let i=-n;i<n;i++)for(let k=-n;k<n;k++){const x=(i+.5)*u,z=(k+.5)*u,r=Math.hypot(x,z);if(r>=rx-.25&&r<rx+.75){R.wbox(cx+i*u,yc+.5,cz+k*u,cx+(i+1)*u,yc+1.5,cz+(k+1)*u,D,'ring');if(!far&&r<rx+.25)R.wbox(cx+i*u,yc+1.5,cz+k*u,cx+(i+1)*u,yc+2,cz+(k+1)*u,T,'ring')}}
  const dirs=[];for(let a=0;a<8;a+=far?2:1)dirs.push([Math.cos(a*Math.PI/4),Math.sin(a*Math.PI/4)]);const ny=Math.ceil((H+3)/u);
  for(let i=-n;i<n;i++)for(let k=-n;k<n;k++)for(let j=0;j<ny;j++){const x=(i+.5)*u,z=(k+.5)*u,y=(j+.5)*u,e1=(x*x+z*z)/((rx+.9)*(rx+.9))+y*y/((H+1.1)*(H+1.1)),e2=(x*x+z*z)/((rx+1.6)*(rx+1.6))+y*y/((H+1.85)*(H+1.85));if(e1<1||e2>1)continue;
    let on=false;for(const[dxx,dzz]of dirs){const al=x*dxx+z*dzz,pe=Math.abs(-x*dzz+z*dxx);if(al>=0&&pe<=.55){on=true;break}}if(on)R.wbox(cx+i*u,yc+j*u,cz+k*u,cx+(i+1)*u,yc+(j+1)*u,cz+(k+1)*u,T,'rib')}
  /* the crown: a small lantern with an ogee cap */
  const yt=yc+Math.round((H+1.5)*2)/2;R.wbox(cx-2,yt,cz-2,cx+2,yt+.5,cz+2,D,'crown');S.wbox(cx-1.25,yt+.5,cz-1.25,cx+1.25,yt+3,cz+1.25,T,'crown');if(!far){for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]])S.wbox(cx+dx*1.25-(dx?.25*(dx>0?0:1):.5),yt+1,cz+dz*1.25-(dz?.25*(dz>0?0:1):.5),cx+dx*1.25+(dx?.25*(dx>0?1:0):.5),yt+2.5,cz+dz*1.25+(dz?.25*(dz>0?1:0):.5),PAL.leadD,'crown')}
  R.wbox(cx-1.75,yt+3,cz-1.75,cx+1.75,yt+3.5,cz+1.75,D,'crown');W.ogee(R,cx,yt+3.5,cz,1.5,3,{});S.wbox(cx-.25,yt+6.5,cz-.25,cx+.25,yt+7.5,cz+.25,PAL.leadD,'fin');S.wbox(cx-.5,yt+7.5,cz-.5,cx+.5,yt+8,cz+.5,PAL.gold,'fin')}

function turret(S,R,rg,b,pal){/* a clock turret astride the ridge */const X=rg.X,cm=(rg.a0+rg.a1)/2,mid=rg.mid,y0=rg.ridgeY-3,y1=rg.ridgeY+3.5,T=pal.trim,D=pal.deep,far=S.unit>=.5,x=X?cm:mid,z=X?mid:cm;
  S.wbox(x-2,y0,z-2,x+2,y1,z+2,T,'turret');S.wbox(x-2.5,y1,z-2.5,x+2.5,y1+.5,z+2.5,D,'turret');if(!far){S.wbox(x-2.25,y1-.5,z-2.25,x+2.25,y1,z+2.25,D,'turret');
   for(const s of[-1,1]){if(X){S.wbox(x-1,y1-3,z+s*2-(s<0?.25:0),x+1,y1-1,z+s*2+(s>0?.25:0),PAL.white,'clock');S.wbox(x-.25,y1-2.25,z+s*2.25-(s<0?.25:0),x+.25,y1-1.5,z+s*2.25+(s>0?.25:0),PAL.gold,'clock')}else{S.wbox(x+s*2-(s<0?.25:0),y1-3,z-1,x+s*2+(s>0?.25:0),y1-1,z+1,PAL.white,'clock');S.wbox(x+s*2.25-(s<0?.25:0),y1-2.25,z-.25,x+s*2.25+(s>0?.25:0),y1-1.5,z+.25,PAL.gold,'clock')}}}
  W.ogee(R,x,y1+.5,z,2.5,4,{});S.wbox(x-.25,y1+4.5,z-.25,x+.25,y1+6,z+.25,PAL.leadD,'fin');S.wbox(x-.75,y1+5.25,z-.25,x+.75,y1+5.5,z+.25,PAL.gold,'fin')}

function gateArch(S,spec,pal,g){const A=spec.boxes[0],B=spec.boxes[1];if(!A||!B)return;const l=A.x0<B.x0?A:B,r=A.x0<B.x0?B:A,xa=l.x1+.5,xb=r.x0-.5,span=xb-xa;if(span<4||span>16)return;const z1=Math.max(l.z1,r.z1)+.5,z0=z1-1.5,T=pal.trim,D=pal.deep,far=S.unit>=.5,sp=g+7.5,rise=2.5,top=sp+rise+1.5,cx=(xa+xb)/2,q=S.q;
  for(let i=Math.round(xa*q);i<Math.round(xb*q);i++){const dx=Math.abs((i+.5)/q-cx)/(span/2),h=Math.round((sp+rise*Math.sqrt(Math.max(0,1-dx*dx)))*q)/q;S.wbox(i/q,h,z0,(i+1)/q,top,z1,T,'garch')}
  S.wbox(xa,top,z0-.25,xb,top+.5,z1+.25,D,'garch');if(!far){S.wbox(cx-.5,sp+rise-.75,z1,cx+.5,top,z1+.25,D,'key');S.wbox(xa,g,z0,xa+.5,sp,z1,T,'gresp');S.wbox(xb-.5,g,z0,xb,sp,z1,T,'gresp')}
  W.rail(S,'x',xa,xb,top+.5,z1-.5,{kind:'open',h:.75,c:T});W.obelisk(S,cx,top+.5,z1-.75,{b:1,h:2.5,ball:true,c:T})}

function glasshouse(S,spec,pal,env,lodfar){const b=spec.boxes[0],g=env.ground,T=pal.trim,D=pal.deep,iron=PAL.iron,sides=sidesOf(b),ops=openings(spec);
  for(const sd of sides){const F=new Face(S,{axis:sd.axis,o:sd.o,f:sd.f,n:sd.n,L:sd.L,H:24});for(const o of ops)if(o.side===sd.side)F.opening({u0:o.a0-sd.o,u1:o.a1-sd.o,v0:o.y0,v1:o.y1,door:true});
    F.course(g,g+.75,.25,T,null,null,'plinth');if(!lodfar)F.course(g+.75,g+1,.5,D,null,null,'plinth');for(const u of[.5,sd.L-.5]){F.box(u-.5,g,0,u+.5,b.roofY+.5,.25,T,'post');const[x,z]=F.xz(u,-.25);W.ball(S,x,b.roofY+.5,z,{c:T})}
    for(const o of F.open)P.doorcase(F,{u0:o.u0,u1:o.u1,v0:o.v0,v1:o.v1},{c:T,deep:D})}
  const cz=(b.z0+b.z1)/2,rz=(b.z1-b.z0)/2+.5,ry=b.roofY+Math.round(rz*.6)+.5;W.rail(S,'x',b.x0-.5,b.x1+.5,ry,cz,{kind:'open',h:.75,c:iron});for(let x=b.x0;x<=b.x1+.01;x+=(b.x1-b.x0)/4)W.obelisk(S,x,ry,cz,{b:1,h:1.75,c:iron})}

/* a village house kind, as a spec in its own blocks */
const VT={cottage:{W:14,D:10,h:5,up:1,split:8,door:[3,2]},bakery:{W:14,D:10,h:5,up:1,split:8,door:[3,2]},shop:{W:16,D:12,h:5,up:1,split:10,door:[4,2]},smithy:{W:16,D:12,h:6,up:0,split:10,door:[4,3]},school:{W:18,D:10,h:6,up:0,split:13,door:[5,2]},inn:{W:22,D:14,h:6,up:1,split:15,door:[6,3],cross:5,cuts:[7,15]},church:{W:26,D:13,h:9,up:0,door:[12,2],dh:4,win:[3,6],every:4}};
function village(kind){const S0=VT[kind];if(!S0)throw new Error('CONTOURS.village: unknown kind '+kind);const{W:Wd,D,h,up}=S0,top=up?2*h:h,dr=S0.door,dh=S0.dh||3,w0=S0.win||[2,3],ev=S0.every||3,ops=[];
  const isDoor=(lx,lz)=>lz===D&&lx>=dr[0]&&lx<dr[0]+dr[1],isWin=(lx,lz,y)=>{if(up&&y===h)return false;const per=lx===0||lx===Wd||lz===0||lz===D,corner=(lx===0||lx===Wd)&&(lz===0||lz===D);if(!per||corner)return false;const fy=up&&y>h?y-h:y;if(isDoor(lx,lz)&&y<=dh)return false;
    const along=(lz===0||lz===D)?lx:lz,nearDoor=y<=dh+1&&(isDoor(lx-1,lz)||isDoor(lx+1,lz)||isDoor(lx,lz)),atSplit=(lz===0||lz===D)&&(lx===S0.split||(up&&y>h&&S0.cuts&&S0.cuts.includes(lx)))||((lx===0||lx===Wd)&&up&&y>h&&lz===S0.cross);return fy>=w0[0]&&fy<=Math.min(w0[1],h-2)&&along%ev===1&&!nearDoor&&!atSplit};
  for(const fl of up?[0,h]:[0]){const ya=fl+w0[0],yb=fl+Math.min(w0[1],h-2);for(let lx=1;lx<Wd;lx++)for(const[lz,side]of[[0,'N'],[D,'S']])if(isWin(lx,lz,ya))ops.push({box:0,side,a0:lx-.5,a1:lx+.5,y0:ya-.5,y1:yb+.5});for(let lz=1;lz<D;lz++)for(const[lx,side]of[[0,'W'],[Wd,'E']])if(isWin(lx,lz,ya))ops.push({box:0,side,a0:lz-.5,a1:lz+.5,y0:ya-.5,y1:yb+.5})}
  ops.push({box:0,side:'S',a0:dr[0]-.5,a1:dr[0]+dr[1]-.5,y0:.5,y1:dh+.5,door:true});
  return{name:'Village '+kind,kind,W:Wd,D,levels:up?[{y:0},{y:h}]:[{y:0}],boxes:[{x0:0,z0:0,x1:Wd,z1:D,roofY:top+1,roof:'gableX',gableFlush:true}],doors:[],openings:ops}}
/* where a village house stands: local block (X,Z) to the world, by the Estate's quarter turn q */
function houseMatrix(THREE,x0,z0,Wd,D,q){const m=q===0?[1,0,0,1,x0,z0]:q===2?[-1,0,0,-1,x0+Wd,z0+D]:q===1?[0,-1,1,0,x0+D,z0]:[0,1,-1,0,x0,z0+Wd];const M=new THREE.Matrix4();M.set(m[0],0,m[1],m[4],0,1,0,0,m[2],0,m[3],m[5],0,0,0,1);return M}
function sign(F,S,st,pal,door,ridge,spec){const k=st.sign,T=pal.trim,D=pal.deep,far=F.far,dc=(door.u0+door.u1)/2;if(far)return;
  const bracket=(u,v)=>{F.box(u-.125,v,0,u+.125,v+.25,1.5,PAL.wood,'sign');F.box(u-.125,v-1.25,.5,u+.125,v-.25,1.5,PAL.wood,'sign');F.box(u-.25,v-1,.75,u+.25,v-.5,1.25,PAL.gold,'sign')};
  if(k==='bakery'||k==='inn'||k==='smithy')bracket(Math.min(F.L-1.5,door.u1+1.5),door.v1+1.75);
  if(k==='shop'){F.on(door.u0-2.5,door.v1+.5,door.u1+2.5,door.v1+1.25,.25,D,'fascia');F.on(door.u0-2.75,door.v1+1.25,door.u1+2.75,door.v1+1.5,.75,T,'fascia')}
  if(k==='inn'){F.box(door.u0-.75,door.v1+.75,0,door.u1+.75,door.v1+1,1.5,D,'porch');for(const u of[door.u0-.5,door.u1+.5])F.box(u-.125,door.v0,1.125,u+.125,door.v1+.75,1.375,PAL.wood,'porch')}
  if(k==='smithy')F.on(door.u0-.75,door.v1+.5,door.u1+.75,door.v1+1.25,.5,D,'lintel')}

/* ---------- geometry of a box ---------- */
function sidesOf(b){return[{side:'S',axis:'x',o:b.x0-.5,f:b.z1+.5,n:1,L:b.x1-b.x0+1},{side:'N',axis:'x',o:b.x0-.5,f:b.z0-.5,n:-1,L:b.x1-b.x0+1},{side:'E',axis:'z',o:b.z0-.5,f:b.x1+.5,n:1,L:b.z1-b.z0+1},{side:'W',axis:'z',o:b.z0-.5,f:b.x0-.5,n:-1,L:b.z1-b.z0+1}]}
const ext=(b,g)=>({x0:b.x0-.5,x1:b.x1+.5,z0:b.z0-.5,z1:b.z1+.5,y0:b.yb!=null?b.yb+.5:-99,y1:b.roofY+.5});
function layout(spec,st,env,lod,o){const far=lod==='far',S=new Skin(far?.5:.25),R=far?S:new Skin(.5),g=env.ground,pal=Object.assign({},PAL,st.pal||{}),solids=[],facesOut=[];let blind=0;
  if(st.special==='glass'){glasshouse(S,spec,pal,env,far);return{S,R,solids,faces:facesOut,blind,cross:0,pruned:0}}
  let rows=(o.openings?rowsFrom(o.openings,spec):spec.openings||openings(spec));const cands=[];
  /* v20, wall moves 11 and 12: balcony doors. Given as [x0,x1,floorY] in cells on the show front; the window there becomes a door to the floor. Rows the Estate already marks door at the balcony storey need no entry here. */
  if(spec.balconyDoors&&!o.openings){rows=rows.map(r=>Object.assign({},r));for(const[xa,xb,fy]of spec.balconyDoors){let best=null;for(const r of rows){if(r.door||r.side!=='S'||r.y1<fy+2||r.y0>fy+5)continue;const dd=Math.abs((r.a0+r.a1)/2-(xa+xb)/2);if(dd<=3.5&&(!best||dd<best.dd))best={r,dd}}if(best)Object.assign(best.r,{a0:xa-.5,a1:xb+.5,y0:fy+.5,door:true,balcony:true})}}spec.boxes.forEach((b,bi)=>cands.push(Object.assign(ext(b),{own:bi})));
  for(const nsp of env.neighbours||[])for(const b of nsp.boxes)cands.push(ext(b));for(const e of env.existing||[])cands.push({x0:e.x0,x1:e.x1,z0:e.z0,z1:e.z1,y0:e.y0==null?-99:e.y0,y1:e.y1});
  const frontSide=(rows.find(r=>r.door&&spec.boxes[r.box].yb==null)||{}).side,allF=[];let cross=0;
  spec.boxes.forEach((b,bi)=>{const t=b.roof||'hip',lv=levelsOf(spec,b),flat=t==='flat'||t==='dome',ov=b.ov||[1,1,1,1],endFree={N:true,S:true,E:true,W:true},perFace=[];
    for(const sd of sidesOf(b)){const ax=sd.axis==='x',kind=flat?'flat':(t==='gableX'?(ax?'eave':'gable'):t==='gableZ'?(ax?'gable':'eave'):'eave'),top=flat?b.roofY+.5:b.roofY-.5,sub=b.yb!=null;
      const bands=[];for(let i=0;i<lv.length;i++){const v0=Math.max(sub?b.yb+.5:g,lv[i].y+.5),v1=i+1<lv.length?Math.min(lv[i+1].y+.5,top):top;if(v1-v0>=1.5)bands.push([v0,v1])}if(!bands.length)bands.push([sub?b.yb+.5:g,top]);
      const zones=[],rise=[],hides=[],foreign=[];let hidAll=false;
      const inside=(c,al,nr)=>ax?(al>c.x0&&al<c.x1&&nr>c.z0&&nr<c.z1):(al>c.z0&&al<c.z1&&nr>c.x0&&nr<c.x1);
      for(const c of cands){if(c.own===bi)continue;const lo=ax?c.x0:c.z0,hi=ax?c.x1:c.z1,n0=ax?c.z0:c.x0,n1=ax?c.z1:c.x1,u0=Math.max(lo,sd.o)-sd.o,u1=Math.min(hi,sd.o+sd.L)-sd.o;if(u1-u0<.01)continue;const p=sd.f+sd.n*.3;
        const p2=sd.f+sd.n*1.3;if((p>n0&&p<n1)||(p2>n0&&p2<n1))hides.push([u0,c.y0,u1,c.y1]);
        else if(c.own!=null&&Math.abs((sd.n>0?n1:n0)-sd.f)<.01){const cb=spec.boxes[c.own];if(cb.yb!=null&&!sub){rise.push([u0,u1,c.y1]);foreign.push(c.own);if(st.zoneOff&&!far)zones.push({u0,u1,off:st.zoneOff,top:c.y1})}}}
      const free=(e)=>{const al=e?sd.o+sd.L+.3:sd.o-.3,nr=sd.f-sd.n*.3;return!cands.some(c=>c.own!==bi&&inside(c,al,nr)&&c.y1>=top-.1&&c.y0<bands[0][0]+.1)};
      const F=new Face(S,{axis:sd.axis,o:sd.o,f:sd.f,n:sd.n,L:sd.L,H:top+12,zones,free0:free(0),free1:free(1)});
      if(st.centre&&!sub&&sd.side===frontSide||st.centre&&!sub&&sd.L>100){const ws=rows.filter(r=>r.box===bi&&r.side===sd.side&&!r.door).map(r=>[r.a0-sd.o,r.a1-sd.o]),mid=sd.L/2;let a=null,b2=null;for(const w of ws){if(w[1]<=mid-st.centre+1.6&&(a==null||w[1]>a))a=w[1];if(w[0]>=mid+st.centre-1.6&&(b2==null||w[0]<b2))b2=w[0]}if(a!=null&&b2!=null&&st.zoneOff&&!far)zones.push({u0:a,u1:b2,off:st.zoneOff,top})}
      for(const r of rows)if(r.box===bi&&r.side===sd.side)F.opening({u0:r.a0-sd.o,u1:r.a1-sd.o,v0:r.y0,v1:r.y1,door:r.door,balcony:r.balcony});
      for(const r of rows)if(foreign.includes(r.box)&&r.side===sd.side)F.mark(r.a0-sd.o,r.y0,r.a1-sd.o,r.y1,1);
      if(sub)F.hide(-1,-9,sd.L+1,b.yb+.5);for(const h of hides)F.hide(h[0],h[1],h[2],h[3]);
      {let n=0,t2=0;for(let u=.5;u<sd.L;u+=1)for(let v=bands[0][0]+.5;v<top;v+=1){t2++;if(F.at(u,v)===2)n++}hidAll=t2>0&&n/t2>.97}
      endFree[sd.side]=!hidAll;const c={st,pal,bands,top,kind,ground:g,sub,rows:(sub?st.sub||st.rows:st.rows).slice(0,Math.max(1,bands.length)),front:sd.side===frontSide&&!sub,rise,ov:ax?(sd.side==='N'?ov[2]:ov[3]):(sd.side==='W'?ov[0]:ov[1])};
      while(c.rows.length<bands.length)c.rows.push(c.rows[c.rows.length-1]);
      perFace.push({F,c,sd,hidAll});allF.push(F)}
    for(const pf of perFace){if(pf.hidAll)continue;const{F,c,sd}=pf,res=dressFace(F,c);blind+=res.blind||0;
      if(c.kind==='flat'&&(b.roof||'hip')==='flat')parapet(F,S,c,res.piers);
      if(c.front&&st.portico&&o.portico!==false){const dg=(res.G[res.main]||[]).find(x=>x.door);if(dg)portico(F,S,R,dg,c.bands[res.main],st,pal,solids,res.piers)}
      if(c.front&&st.cresting&&st.parapet)cresting(F,S,c,pal);
      if(st.sign&&sd.side==='S'){const d=F.open.find(x=>x.door);if(d)sign(F,S,st,pal,d)}
      if(st.vert==='buttress'||st.corner==='buttress'){const us=st.vert==='buttress'?res.piers.slice():[];if(st.corner==='buttress'){if(F.free0)us.push(.5);if(F.free1)us.push(F.L-.5)}for(const p of us){const[x,z]=F.xz(p,.5);solids.push({what:'buttress',x0:x-.5,y0:g,z0:z-.5,x1:x+.5,y1:g+3,z1:z+.5})}}
      facesOut.push({box:bi,side:sd.side,axis:sd.axis,o:sd.o,f:sd.f,n:sd.n,L:sd.L,depth:F.D,piers:res.piers})}
    if(t==='dome'&&!far||t==='dome')dome(S,R,b,st,pal);
    if(st.stacks&&t==='flat'&&bi===0)stacks(S,spec,b,bi,st,pal);
    const rg=ridged(S,b,st,pal,t==='gableX'?[endFree.W,endFree.E]:[endFree.N,endFree.S]);
    if(st.turret&&bi===0&&rg)turret(S,R,rg,b,pal)});
  if(st.gateArch)gateArch(S,spec,pal,g);
  /* the pane rule, enforced: any cell in front of an opening (within 2 blocks) is taken out, whichever piece put it there. Then proved: a second sweep must find none. */
  let glazed=0;if(o.glaze!==false&&st.glaze!==false)for(const F of allF)for(const op of F.open){if(op.door&&!op.balcony)continue;if(F.glaze(op,{door:!!op.door,left:(op.u0+op.u1)/2<F.L/2}))glazed++}
  let pruned=0;const sweep=del=>{let n=0;for(const F of allF)for(const sk of R===S?[S]:[S,R]){const sc=sk.q,O0=Math.round(F.o*sc),F0=Math.round(F.f*sc);for(const o of F.open)for(let i=Math.round(o.u0*sc);i<Math.round(o.u1*sc);i++)for(let j=Math.round(o.v0*sc);j<Math.round(o.v1*sc);j++)for(let k=0;k<2*sc;k++){const A=O0+i,N=F.n>0?F0+k:F0-1-k,key=F.axis==='x'?O.KEY(A,j,N):O.KEY(N,j,A),v=sk.V.get(key);if(v&&v[4]!=='stub'&&v[4]!=='glaze'){n++;if(del)sk.V.delete(key)}}}return n};
  pruned=sweep(true);cross=sweep(false);
  return{S,R,solids,faces:facesOut,blind,cross,pruned,glazed}}

function dress(spec,o){o=o||{};const name=o.style||spec.style||'service',st=typeof name==='string'?STYLES[name]:name;if(!st)throw new Error('CONTOURS.dress: unknown style '+name);const env={neighbours:o.neighbours||[],existing:o.existing||[],ground:o.ground==null?.5:o.ground};
  const N=layout(spec,st,env,'near',o),Fa=o.far===false?null:layout(spec,st,env,'far',o),parts=new Map(),add=(m,lod)=>{for(const[k,v]of m){let p=parts.get(k);if(!p)parts.set(k,p={id:k});p[lod]=O.concat(p[lod],v)}};
  /* pieces are cut on a 64-block grid that starts at the building's own corner (snapped to 32), so a small house is one piece */
  let mx=1e9,mz=1e9;for(const b of spec.boxes){mx=Math.min(mx,b.x0);mz=Math.min(mz,b.z0)}const ox=Math.floor((mx-3)/32)*32,oz=Math.floor((mz-3)/32)*32;
  add(O.mesh(N.S,64,ox,oz),'near');if(N.R!==N.S)add(O.mesh(N.R,64,ox,oz),'near');if(Fa)add(O.mesh(Fa.S,64,ox,oz),'far');
  const pieces=[],q={near:0,far:0};for(const p of parts.values()){let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];const m=p.near||p.far;for(let i=0;i<m.pos.length;i+=3)for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],m.pos[i+k]);mx[k]=Math.max(mx[k],m.pos[i+k])}
    p.min=mn;p.max=mx;p.centre=[(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2];pieces.push(p)}
  /* v20: the glazing bars are flat quads; each joins the near form of the piece it stands in */
  const glz=(N.S.glz||[]).concat(N.R!==N.S?N.R.glz||[]:[]),nearP=pieces.filter(p=>p.near);if(glz.length&&nearP.length){const by=new Map();for(const g of glz){const c=[(g.P[0][0]+g.P[2][0])/2,(g.P[0][1]+g.P[2][1])/2,(g.P[0][2]+g.P[2][2])/2];let best=null,bd=1e9;for(const p of nearP){let d=0;for(let k=0;k<3;k++)d+=Math.max(0,p.min[k]-c[k],c[k]-p.max[k]);if(d<bd){bd=d;best=p}}if(!by.has(best))by.set(best,[]);by.get(best).push(g)}for(const[p,l]of by)p.near=O.concat(p.near,O.glazeMesh(l))}
  for(const p of pieces){q.near+=p.near?p.near.quads:0;q.far+=p.far?p.far.quads:0}
  return{name:spec.name,style:typeof name==='string'?name:'custom',pieces,quads:q,tris:{near:q.near*2,far:q.far*2},faces:N.faces,solids:N.solids,cross:N.cross+(Fa?Fa.cross:0),pruned:N.pruned,blind:N.blind,glazed:N.glazed||0}}

const GEO=new WeakMap();
function object(THREE,d,o){o=o||{};const geo=m=>{let g=GEO.get(m);if(!g){g=O.geometry(THREE,m);GEO.set(m,g)}return g};const mat=o.material||new THREE.MeshLambertMaterial({vertexColors:true}),grp=new THREE.Group(),farAt=o.far||115;grp.userData={k:'contours',o:{building:d.name,style:d.style}};const items=[];
  for(const p of d.pieces){const it={c:new THREE.Vector3(...p.centre)};for(const lod of['near','far']){if(!p[lod])continue;const m=new THREE.Mesh(geo(p[lod]),mat);m.userData={k:'contour',o:{building:d.name,piece:p.id,lod}};m.matrixAutoUpdate=false;m.castShadow=lod==='near';m.receiveShadow=true;it[lod]=m;grp.add(m)}if(it.far)it.far.visible=false;items.push(it)}
  grp.update=cam=>{for(const it of items){const fa=cam&&it.c.distanceTo(cam)>farAt;if(it.near)it.near.visible=!fa||!it.far;if(it.far)it.far.visible=fa}};grp.setLod=l=>{for(const it of items){if(it.near)it.near.visible=l!=='far'||!it.far;if(it.far)it.far.visible=l==='far'}};
  /* geometry is shared by every object made from the same dressed building; dispose when the last one goes */
  grp.dispose=()=>{for(const p of d.pieces)for(const lod of['near','far'])if(p[lod]&&GEO.has(p[lod])){GEO.get(p[lod]).dispose();GEO.delete(p[lod])}};return grp}
return{STYLES,VT,openings,rowsFrom,dress,object,village,houseMatrix,sidesOf,_layout:layout,version:'20'}})();
if(typeof module!=='undefined')module.exports=CONTOURS;
