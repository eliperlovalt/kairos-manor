/* =========================================================
   Euphrates Hall Parts Depot: props.js v2 (Nov 12, 2026); extend with props2.js
   Fine-detail furniture, fittings, trim and trees for the mansion.
   Format matches animalVox() in voxel.html: a Map of "x,y,z" -> [x,y,z,color,part].
   Origin: floor centre of the prop, y up, front faces +z.
   Furniture and fittings use the people's micro grid (unit PS = .115, about 8.7 per block).
   Trees use a coarser grid (unit .25, 4 per block); read r.unit.
   Parts: 'b' body, 'flame' (lights: glow when lit), 'lid' and 'door' (open and close),
   'seat' (sit target), 'face' (clock face, page), 'leaf' (trees, sway).
   Usage in the engine:  const r=PROPS.build('bed4',{c:'#7a1f2a'});  then emit r.V with
   the same face-buffer path as people, scaled by r.unit. r.size is [w,h,d] in blocks.
   ========================================================= */
const PROPS=(()=>{
const PU=.115, PU2=PU/2, TU=.25;   /* vx3: PU2, the third level (the figures' FU): a part may return unit:PU2 */
const C={oak:'#6b4226',oakL:'#8a5a32',mah:'#5a2418',mahL:'#74331f',wal:'#4a3020',ebony:'#1e1612',gilt:'#c9a227',giltD:'#9c7a1c',brass:'#b8913a',
  iron:'#2e2e33',ironL:'#55555c',marble:'#e8e4dc',marbleV:'#cfc8bb',marbleG:'#3f5a4a',linen:'#efe6cf',white:'#f4f1ea',damask:'#7a1f2a',damaskD:'#5c1520',
  green:'#2f5a3a',baize:'#2f6b3a',blue:'#2f4a6e',gold:'#d4af37',cream:'#e9dfc4',leather:'#5b2a1a',leatherL:'#7a3a22',paper:'#efe6cf',flame:'#ffd36b',
  glass:'#bfd8e8',slate:'#3a3f44',copper:'#b06a3a',stone:'#bdb5a2',stoneD:'#8f887a',black:'#1a1410'};
const BOOKS=['#7a1f2a','#2f4a6e','#2f5a3a','#5b2a1a','#3a3230','#8a6b2a','#4a2a4a','#6b4226','#1e3a3a','#9c3b2a'];
function rng(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function kit(){const V=new Map();
  const put=(x,y,z,c,p='b')=>V.set(x+','+y+','+z,[x,y,z,c,p]);
  const box=(x0,y0,z0,x1,y1,z1,c,p)=>{const a=Math.min(x0,x1),b=Math.max(x0,x1),d=Math.min(y0,y1),e=Math.max(y0,y1),f=Math.min(z0,z1),g=Math.max(z0,z1);
    for(let x=a;x<=b;x++)for(let y=d;y<=e;y++)for(let z=f;z<=g;z++)put(x,y,z,c,p)};
  const del=(x0,y0,z0,x1,y1,z1)=>{for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)for(let z=Math.min(z0,z1);z<=Math.max(z0,z1);z++)V.delete(x+','+y+','+z)};
  const disc=(cx,y,cz,r,c,p)=>{for(let x=-r;x<=r;x++)for(let z=-r;z<=r;z++)if(x*x+z*z<=r*r+r*.6)put(cx+x,y,cz+z,c,p)};
  const ring=(cx,y,cz,r,c,p)=>{for(let x=-r;x<=r;x++)for(let z=-r;z<=r;z++){const q=x*x+z*z;if(q<=r*r+r*.6&&q>=(r-1)*(r-1)+(r-1)*.6)put(cx+x,y,cz+z,c,p)}};
  const leg=(x,z,h,c,w=0)=>box(x,0,z,x+w,h,z+w,c);
  return{V,put,box,del,disc,ring,leg}}
const B={},INFO={};
function def(name,info,fn){B[name]=fn;INFO[name]=info}

/* ---------------- beds ---------------- */
def('bed4',{label:'Four-poster bed',room:'State bedrooms, His Grace\'s Bedchamber',act:'lie down'},o=>{const k=kit(),w=o.c||C.damask,wd=o.wood||C.mah,W=10,L=17;
  k.box(-W,0,-L,W,4,L,wd);k.box(-W+1,5,-L+1,W-1,7,L-1,C.linen,'seat');k.box(-W+1,8,-L+1,W-1,8,L-6,w,'seat');k.box(-W+1,8,-L+2,W-1,9,-L+5,w);
  k.box(-W+2,8,L-5,W-2,10,L-2,C.white);for(let x=-W+1;x<=W-1;x+=2)k.put(x,8,-L+6,C.gold);
  for(const[x,z]of[[-W,-L],[W,-L],[-W,L],[W,L]]){k.box(x,0,z,x,30,z,wd);k.put(x,31,z,C.gilt)}
  k.box(-W,13,L,W,20,L,wd);k.box(-W+2,15,L,W-2,18,L,C.giltD);k.box(-W,4,-L,W,9,-L,wd);
  k.box(-W,30,-L,W,30,L,wd);for(let x=-W;x<=W;x++){k.put(x,29,-L,w);k.put(x,28,-L,x%2?w:C.gold);k.put(x,29,L,w);k.put(x,28,L,x%2?w:C.gold)}
  for(let z=-L;z<=L;z++){k.put(-W,29,z,w);k.put(W,29,z,w);k.put(-W,28,z,z%2?w:C.gold);k.put(W,28,z,z%2?w:C.gold)}
  for(let y=10;y<=27;y++){k.put(-W,y,L-1,w);k.put(W,y,L-1,w);k.put(-W,y,L-2,w);k.put(W,y,L-2,w)}
  for(let x=-W;x<=W;x++)k.put(x,31,0,C.gilt);return{V:k.V,size:[2.4,3.6,4]}});
def('bedIron',{label:'Servant\'s iron bed',room:'Attic bedrooms',act:'lie down'},o=>{const k=kit(),W=5,L=15;
  for(const[x,z,h]of[[-W,-L,9],[W,-L,9],[-W,L,13],[W,L,13]])k.box(x,0,z,x,h,z,C.iron);
  k.box(-W,4,-L,W,4,L,C.iron);k.box(-W+1,5,-L+1,W-1,6,L-1,C.white,'seat');k.box(-W+1,7,-L+1,W-1,7,L-5,o.c||'#8a7a5a','seat');k.box(-W+1,7,L-4,W-1,8,L-2,C.white);
  for(let x=-W;x<=W;x+=2){k.box(x,5,L,x,12,L,C.iron);k.box(x,5,-L,x,8,-L,C.iron)}k.box(-W,13,L,W,13,L,C.brass);k.box(-W,9,-L,W,9,-L,C.brass);return{V:k.V,size:[1.3,1.6,3.5]}});

/* ---------------- seating ---------------- */
def('chairDining',{label:'Dining chair',room:'State Dining Room',act:'sit'},o=>{const k=kit(),wd=o.wood||C.mah,s=o.c||C.damask;
  k.leg(-3,-3,6,wd);k.leg(3,-3,6,wd);k.leg(-3,3,6,wd);k.leg(3,3,6,wd);k.box(-3,7,-3,3,7,3,wd);k.box(-2,8,-2,2,8,3,s,'seat');
  k.box(-3,8,-3,-3,19,-3,wd);k.box(3,8,-3,3,19,-3,wd);k.box(-2,19,-3,2,19,-3,wd);k.box(-2,11,-3,2,17,-3,s);k.put(0,20,-3,C.gilt);return{V:k.V,size:[.8,2.3,.8]}});
def('armchair',{label:'Wing armchair',room:'Drawing, Morning and Smoking Rooms',act:'sit'},o=>{const k=kit(),s=o.c||C.leather,d=o.c2||C.leatherL;
  k.leg(-5,-5,2,C.wal);k.leg(5,-5,2,C.wal);k.leg(-5,4,2,C.wal);k.leg(5,4,2,C.wal);k.box(-5,3,-5,5,6,5,s);k.box(-4,7,-3,4,8,5,d,'seat');
  k.box(-5,7,-5,5,20,-4,s);k.box(-5,7,-3,-5,11,5,s);k.box(5,7,-3,5,11,5,s);k.box(-5,12,-3,-5,20,-1,s);k.box(5,12,-3,5,20,-1,s);
  for(let x=-4;x<=4;x+=2)for(let y=9;y<=19;y+=3)k.put(x,y,-3,C.brass);return{V:k.V,size:[1.3,2.4,1.3]}});
def('sofa',{label:'Chesterfield sofa',room:'Drawing Room, Library, Smoking Room',act:'sit'},o=>{const k=kit(),s=o.c||C.leather,d=o.c2||C.leatherL,W=o.w||14;
  k.box(-W,0,-5,W,1,5,C.wal);k.box(-W,2,-5,W,6,5,s);k.box(-W+2,7,-3,W-2,8,5,d,'seat');k.box(-W,7,-5,W,15,-4,s);k.box(-W,7,-3,-W+1,12,5,s);k.box(W-1,7,-3,W,12,5,s);
  for(let x=-W+1;x<=W-1;x+=2)for(let y=8;y<=14;y+=2)k.put(x,y,-3,(x+y)%4?d:C.brass);for(let z=-4;z<=5;z+=2){k.put(-W,13,z,d);k.put(W,13,z,d)}return{V:k.V,size:[(2*W+1)/8.7,1.8,1.3]}});
def('bisellium',{label:'The Bisellium',room:'Great Hall dais',act:'sit, talk to Kairos'},o=>{const k=kit();
  k.box(-12,0,-9,12,2,9,C.marble);k.box(-11,3,-8,11,3,8,C.damask);k.box(-9,4,-6,9,9,6,C.gilt);k.box(-8,10,-5,8,11,6,C.damask,'seat');
  for(const x of[-9,9]){k.box(x,10,-6,x,15,6,C.gilt);k.put(x,16,6,C.gold);k.put(x,16,-6,C.gold)}
  k.box(-9,10,-7,9,30,-7,C.giltD);k.box(-7,12,-6,7,28,-6,C.damask);for(let x=-6;x<=6;x++)k.put(x,31,-7,x%2?C.gilt:C.gold);k.box(-2,32,-7,2,34,-7,C.gold);k.put(0,35,-7,C.white);
  for(const x of[-11,11])for(let y=4;y<=8;y++){k.put(x,y,-8,C.gilt);k.put(x,y,8,C.gilt)}return{V:k.V,size:[2.9,4.1,2.2]}});
def('pew',{label:'Chapel pew',room:'Chapel',act:'sit'},o=>{const k=kit(),W=o.w||16;
  /* v1.55: shaped ends with a poppy-head and a sunk panel, a framed back with a book ledge behind, a lipped seat, a kneeler on its board (it was two slabs and a plank) */
  for(const x of[-W,W]){k.box(x,0,-3,x,15,-1,C.oak);k.box(x,0,0,x,11,2,C.oak);k.box(x,0,3,x,9,4,C.oak);k.box(x,16,-3,x,17,-2,C.oakL);k.put(x,18,-3,C.oakL);k.box(x,5,0,x,8,1,C.ebony);k.box(x,12,-3,x,13,-2,C.ebony)}
  k.box(-W,5,-2,W,5,3,C.oakL,'seat');k.box(-W+1,4,3,W-1,4,3,C.oak);k.box(-W,6,-3,W,13,-3,C.oak);k.box(-W,14,-4,W,14,-3,C.oakL);k.box(-W,6,-3,W,6,-3,C.oakL);
  for(let x=-W+5;x<W;x+=5)k.box(x,7,-3,x,13,-3,C.oakL);k.box(-W+1,10,-4,W-1,10,-4,C.oakL);k.box(-W+1,0,4,W-1,0,5,C.oak);k.box(-W+1,1,4,W-1,2,4,C.damask);return{V:k.V,size:[(2*W+1)/8.7,1.7,1]}});

/* ---------------- tables and desks ---------------- */
def('tableDining',{label:'State dining table, laid',room:'State Dining Room, Servants\' Hall (plain)',act:'touch: today'},o=>{const k=kit(),L=o.len||40,wd=o.wood||C.mah,laid=o.laid!==false;
  k.box(-7,9,-L,7,9,L,wd);k.box(-6,8,-L+1,6,8,L-1,wd);for(let z=-L+4;z<=L-4;z+=Math.max(8,Math.floor(L/3))){k.box(-1,0,z-1,1,7,z+1,wd);k.box(-4,0,z-3,4,1,z+3,wd)}
  if(laid){k.box(-5,10,-L+1,5,10,L-1,C.white);for(let z=-L+4;z<=L-4;z+=6)for(const x of[-4,4]){k.put(x,11,z,C.white);k.put(x,11,z+1,C.marbleV);k.put(x,11,z-1,C.brass);k.put(x*.75|0,11,z,C.brass)}
    for(let z=-L+8;z<=L-8;z+=12){k.box(0,11,z,0,15,z,C.brass);k.box(-2,15,z,2,15,z,C.brass);for(const x of[-2,0,2]){k.put(x,16,z,C.white);k.put(x,17,z,C.flame,'flame')}}}
  return{V:k.V,size:[1.7,1.2,(2*L+1)/8.7]}});
def('deskWriting',{label:'Partners\' writing desk',room:'Estate Office, Business Room, Study',act:'touch: opens the room\'s record'},o=>{const k=kit(),wd=o.wood||C.mah;
  k.box(-10,0,-5,-5,8,5,wd);k.box(5,0,-5,10,8,5,wd);k.box(-10,9,-5,10,9,5,wd);k.box(-9,10,-4,9,10,4,C.leather);
  for(const x of[-8,-6,6,8])for(const y of[2,5,7]){k.put(x,y,5,C.brass)}k.box(-4,7,5,4,8,5,wd);k.put(0,7,6,C.brass);
  k.box(-7,11,-3,-4,11,0,C.paper,'face');k.box(5,11,-2,6,14,-2,C.brass);k.put(5,15,-2,C.flame,'flame');k.box(4,15,-3,7,16,-1,C.green);k.box(1,11,1,2,13,1,C.ebony);k.put(1,14,1,C.white);
  return{V:k.V,size:[2.4,1.9,1.3]}});
def('mapTable',{label:'Map table',room:'Map Room',act:'touch: Nepsis'},o=>{const k=kit();
  k.box(-12,0,-8,-11,9,-7,C.oak);k.box(11,0,-8,12,9,-7,C.oak);k.box(-12,0,7,-11,9,8,C.oak);k.box(11,0,7,12,9,8,C.oak);k.box(-12,10,-8,12,10,8,C.oak);
  const r=rng(7);for(let x=-11;x<=11;x++)for(let z=-7;z<=7;z++){const land=Math.sin(x*.4)+Math.cos(z*.5+x*.15)+r()*.6>.5;k.put(x,11,z,land?'#c9b88a':'#7a9aaa','face')}
  for(const[x,z]of[[-5,2],[3,-3],[7,4],[-2,-5]]){k.put(x,12,z,C.damask);k.put(x,13,z,C.damask)}k.box(-11,11,8,11,11,8,C.giltD);return{V:k.V,size:[2.9,1.5,2]}});
def('billiard',{label:'Billiard table',room:'Billiard Room',act:'play'},o=>{const k=kit();
  for(const[x,z]of[[-9,-18],[9,-18],[-9,0],[9,0],[-9,18],[9,18]])k.box(x-1,0,z-1,x+1,7,z+1,C.mah);k.box(-11,8,-20,11,9,20,C.mah);k.box(-9,10,-18,9,10,18,C.baize);
  k.box(-11,10,-20,11,11,-19,C.mah);k.box(-11,10,19,11,11,20,C.mah);k.box(-11,10,-18,-10,11,18,C.mah);k.box(10,10,-18,11,11,18,C.mah);
  for(const[x,z]of[[-9,-18],[9,-18],[-9,0],[9,0],[-9,18],[9,18]])k.put(x,10,z,C.black);
  for(const[x,z,c]of[[0,10,C.white],[0,-8,'#c0262b'],[-1,-10,'#c0262b'],[1,-10,'#c0262b'],[0,-12,C.black]])k.put(x,11,z,c);k.box(-12,12,-6,-12,12,14,C.ebony);
  return{V:k.V,size:[2.6,1.4,4.7]}});
def('libraryTable',{label:'Library table with lamp',room:'Double Library',act:'read'},o=>{const k=kit();
  k.box(-1,0,-1,1,7,1,C.wal);k.box(-5,0,-5,5,1,5,C.wal);k.disc(0,8,0,8,C.wal);k.disc(0,9,0,7,C.leather);
  k.box(-3,10,-2,0,10,2,C.paper,'face');k.box(-4,10,-3,-4,11,3,C.damask);k.box(3,10,1,3,15,1,C.brass);k.disc(3,16,1,2,C.green);k.put(3,15,1,C.flame,'flame');return{V:k.V,size:[1.9,2,1.9]}});

/* ---------------- storage and records ---------------- */
def('bookcase',{label:'Library bookcase',room:'Double Library, Business Room',act:'touch: toolkits and docs'},o=>{const k=kit(),W=o.w||12,H=o.h||40,r=rng(o.seed||11);
  k.box(-W,0,-3,W,H,-3,o.wood||C.wal);k.box(-W,0,-3,-W,H,2,o.wood||C.wal);k.box(W,0,-3,W,H,2,o.wood||C.wal);k.box(-W-1,H+1,-3,W+1,H+2,3,o.wood||C.wal);k.box(-W,0,-2,W,2,2,o.wood||C.wal);
  for(let s=3;s<H-1;s+=9){k.box(-W+1,s,-2,W-1,s,2,o.wood||C.wal);for(let x=-W+1;x<=W-1;x++){if(r()<.08)continue;const h=5+Math.floor(r()*3),c=BOOKS[Math.floor(r()*BOOKS.length)];k.box(x,s+1,-2,x,s+h,1,c);if(h>6)k.put(x,s+h-1,1,C.gilt)}}
  for(let x=-W;x<=W;x+=2)k.put(x,H+2,3,C.gilt);return{V:k.V,size:[(2*W+1)/8.7,(H+3)/8.7,.7]}});
def('cardCatalog',{label:'Card catalog',room:'Double Library',act:'touch: all 141 toolkits'},o=>{const k=kit();
  k.box(-6,0,-3,6,3,3,C.oak);k.box(-7,4,-4,7,17,3,C.oak);for(let x=-6;x<=5;x+=3)for(let y=5;y<=16;y+=3){k.box(x,y,4,x+1,y+1,4,C.oakL,'door');k.put(x,y,5,C.brass)}k.box(-7,18,-4,7,18,4,C.oakL);return{V:k.V,size:[1.7,2.1,.9]}});
def('deedChest',{label:'Deed chest',room:'Muniment Room',act:'open: the Rules'},o=>{const k=kit();
  k.box(-6,0,-4,6,7,4,C.oak);for(const x of[-6,-2,2,6])k.box(x,0,-4,x,7,4,C.iron);k.box(-6,8,-4,6,10,4,C.oakL,'lid');k.box(-6,9,-4,6,9,4,C.iron,'lid');k.box(-1,5,5,1,7,5,C.brass);k.put(0,6,6,C.black);return{V:k.V,size:[1.5,1.2,1]}});
def('strongbox',{label:'Strongbox and ledger',room:'Estate Office',act:'open: the treasury'},o=>{const k=kit();
  k.box(-5,0,-4,5,9,4,C.slate);k.box(-4,1,5,4,8,5,C.ironL,'door');k.disc(0,5,6,1,C.brass);k.put(0,5,7,C.brass);k.box(-5,10,-4,5,10,4,C.iron);
  k.box(-4,11,-3,4,12,3,C.leather);k.box(-3,13,-2,3,13,2,C.paper,'face');k.put(0,13,0,C.damask);return{V:k.V,size:[1.2,1.6,1]}});
def('wardrobe',{label:'Wardrobe',room:'Bedrooms, dressing room',act:'open'},o=>{const k=kit(),wd=o.wood||C.mah;
  k.box(-9,0,-5,9,34,5,wd);k.box(-8,2,6,-1,31,6,C.mahL,'door');k.box(1,2,6,8,31,6,C.mahL,'door');k.put(-2,17,7,C.brass);k.put(2,17,7,C.brass);
  k.box(-10,35,-6,10,36,6,wd);for(let x=-9;x<=9;x+=3)k.put(x,37,6,C.gilt);k.box(-6,25,7,-3,28,7,C.giltD);k.box(3,25,7,6,28,7,C.giltD);return{V:k.V,size:[2.3,4.3,1.3]}});
def('washstand',{label:'Washstand',room:'Bedrooms, attic rooms',act:'use'},o=>{const k=kit();
  k.leg(-5,-3,10,C.oak);k.leg(5,-3,10,C.oak);k.leg(-5,3,10,C.oak);k.leg(5,3,10,C.oak);k.box(-5,11,-3,5,11,3,C.marble);k.box(-5,12,-3,5,15,-3,C.marble);
  k.ring(0,12,0,2,C.white);k.disc(0,12,0,1,C.white);k.box(-1,13,0,1,16,0,C.white);k.put(0,17,0,C.white);return{V:k.V,size:[1.3,2,.8]}});
def('wineRack',{label:'Wine bins',room:'Wine Cellar',act:'touch'},o=>{const k=kit(),W=o.w||12;
  k.box(-W,0,-3,W,24,-3,C.stoneD);for(let y=0;y<=24;y+=6)k.box(-W,y,-2,W,y,2,C.stone);for(let x=-W;x<=W;x+=6)k.box(x,0,-2,x,24,2,C.stone);
  const r=rng(5);for(let x=-W+1;x<W;x++)for(let y=1;y<24;y+=2)if(x%6&&y%6&&r()<.8){k.put(x,y,2,r()<.5?'#2a3a1e':'#3a1018');k.put(x,y,1,r()<.5?'#2a3a1e':'#3a1018')}return{V:k.V,size:[(2*W+1)/8.7,2.8,.7]}});
def('bellBoard',{label:'The bell board',room:'Servants\' Hall',act:'touch: call any agent'},o=>{const k=kit();
  k.box(-14,14,-1,14,30,-1,C.mah);k.box(-15,13,-1,15,13,0,C.mahL);k.box(-15,31,-1,15,31,0,C.mahL);
  for(let i=0;i<14;i++){const x=-13+i*2;k.put(x,27,0,C.brass);k.put(x,26,0,C.brass);k.put(x,25,0,C.giltD);k.put(x,22,0,C.white,'face');k.put(x,18,0,i%2?C.cream:C.white,'face')}
  return{V:k.V,size:[3.5,3.6,.3]}});
def('kitchenRange',{label:'Kitchen range',room:'The Kitchen',act:'light'},o=>{const k=kit(),W=o.w||16;
  k.box(-W,0,-4,W,10,4,C.iron);k.box(-W,11,-4,W,11,4,C.ironL);for(let x=-W+2;x<=W-2;x+=8){k.box(x-2,3,5,x+2,8,5,C.ebony,'door');k.put(x+2,6,6,C.brass)}
  k.box(-3,2,5,3,7,5,'#d9531c','flame');k.box(-W,12,-4,W,30,-4,C.stoneD);k.box(-2,12,-3,2,34,-3,C.stoneD);
  for(const x of[-10,-6,6,10]){k.ring(x,12,0,2,C.copper);k.disc(x,12,0,1,C.copper);k.box(x-2,13,0,x+2,15,0,C.copper)}
  for(let x=-W;x<=W;x+=3){k.put(x,26,-3,C.copper);k.put(x,25,-3,C.copper)}return{V:k.V,size:[(2*W+1)/8.7,4,1]}});
def('kitchenTable',{label:'Scrubbed kitchen table',room:'The Kitchen, Still Room',act:'touch: the meal plan'},o=>{const k=kit(),L=o.len||20;
  for(const x of[-6,6])for(const z of[-L+2,L-2])k.box(x,0,z,x+1,8,z+1,C.oakL);k.box(-7,9,-L,8,10,L,'#d8c49a');
  k.box(-3,11,-4,0,11,-1,C.copper);k.box(2,11,3,4,13,5,C.white);k.box(-5,11,8,-2,12,10,'#c9a36a');k.box(-1,11,-12,4,11,-9,C.oakL);return{V:k.V,size:[1.8,1.3,(2*L+1)/8.7]}});
def('menuSlate',{label:'Menu slate',room:'The Kitchen',act:'touch: meal plan, grocery list'},o=>{const k=kit();
  k.box(-6,12,0,6,22,0,C.slate,'face');k.box(-7,11,0,7,11,1,C.oak);k.box(-7,23,0,7,23,1,C.oak);k.box(-7,11,0,-7,23,1,C.oak);k.box(7,11,0,7,23,1,C.oak);
  for(let y=14;y<=20;y+=2)for(let x=-5;x<=5;x++)if((x*7+y)%5)k.put(x,y,1,C.white,'face');return{V:k.V,size:[1.7,2.7,.2]}});

/* ---------------- lights ---------------- */
def('chandelier',{label:'Crystal chandelier',room:'Saloon, State Dining Room, Ballroom',act:'light',hang:true},o=>{const k=kit(),R=o.r||9;
  k.box(0,22,0,0,30,0,C.gilt);k.ring(0,21,0,2,C.gilt);k.disc(0,20,0,2,C.gilt);k.box(0,8,0,0,19,0,C.gilt);k.disc(0,7,0,2,C.gilt);k.put(0,6,0,C.glass);k.put(0,5,0,C.glass);
  for(const[r,y]of[[R,10],[Math.round(R*.6),15]]){k.ring(0,y,0,r,C.gilt);for(let a=0;a<(r>6?12:8);a++){const t=a/(r>6?12:8)*Math.PI*2,x=Math.round(Math.cos(t)*r),z=Math.round(Math.sin(t)*r);
    k.put(x,y+1,z,C.white);k.put(x,y+2,z,C.flame,'flame');for(let d=1;d<=3;d++)k.put(x,y-d,z,C.glass)}}
  for(let a=0;a<6;a++){const t=a/6*Math.PI*2;for(let s=1;s<R;s++)k.put(Math.round(Math.cos(t)*s),10+Math.round(s/R*2),Math.round(Math.sin(t)*s),C.gilt)}
  return{V:k.V,size:[2.2,3.6,2.2],anchor:'top'}});
def('candelabra',{label:'Candelabra',room:'Mantels, dining table, piano',act:'light'},o=>{const k=kit();
  k.disc(0,0,0,2,C.brass);k.box(0,1,0,0,8,0,C.brass);k.box(-4,8,0,4,8,0,C.brass);for(const x of[-4,0,4]){k.box(x,9,0,x,9,0,C.brass);k.box(x,10,0,x,12,0,'#efe0b8');k.put(x,13,0,C.flame,'flame')}k.box(0,13,0,0,14,0,'#efe0b8');k.put(0,15,0,C.flame,'flame');return{V:k.V,size:[1,1.8,.6]}});
def('lantern',{label:'Saloon glass lantern (one bay)',room:'The Saloon roof',act:'look up',hang:true},o=>{const k=kit(),W=o.w||16;
  for(let x=-W;x<=W;x++)for(let z=-W;z<=W;z++){const edge=Math.abs(x)===W||Math.abs(z)===W||x%8===0||z%8===0;k.put(x,0,z,edge?C.iron:C.glass)}
  for(let h=1;h<=8;h++){const w=W-h*2;if(w<1)break;for(let x=-w;x<=w;x++)for(let z=-w;z<=w;z++){if(Math.abs(x)!==w&&Math.abs(z)!==w)continue;k.put(x,h,z,(x+z)%4===0||Math.abs(x)===Math.abs(z)?C.iron:C.glass)}}
  k.box(0,9,0,0,11,0,C.gilt);k.put(0,12,0,C.gold);return{V:k.V,size:[(2*W+1)/8.7,1.4,(2*W+1)/8.7]}});
def('fireplace',{label:'Marble fireplace with overmantel',room:'Every state room',act:'light'},o=>{const k=kit(),m=o.c||C.marble,W=12;
  k.box(-W,0,-2,W,22,1,m);k.del(-7,1,-1,7,14,1);k.box(-7,0,-2,7,0,1,C.black);k.box(-W-1,23,-2,W+1,24,3,m);for(let x=-W;x<=W;x+=2)k.put(x,22,2,C.marbleV);
  for(const x of[-W,W]){k.box(x-1,0,-2,x+1,22,2,m);k.box(x-1,20,-2,x+1,22,3,C.marbleV)}k.box(-5,1,-1,5,2,0,C.iron);k.box(-4,3,-1,4,5,0,'#d9531c','flame');k.box(-2,6,-1,2,7,0,C.flame,'flame');
  k.box(-9,25,-2,9,44,-2,C.gilt);k.box(-8,26,-1,8,43,-1,'#9fb3bf','face');k.box(-10,45,-2,10,46,-1,C.gilt);k.put(0,47,-1,C.gold);
  for(const x of[-9,9]){k.box(x,25,-1,x,25,1,C.brass);k.box(x,26,1,x,28,1,C.white);k.put(x,29,1,C.flame,'flame')}k.box(-2,25,0,2,28,1,C.gilt);k.disc(0,27,2,1,C.white);
  return{V:k.V,size:[3,5.5,.6]}});

/* ---------------- clocks, music, objects that open records ---------------- */
def('clockLong',{label:'Longcase clock',room:'Entrance Hall, Saloon, Clock Room',act:'touch: the calendar'},o=>{const k=kit();
  k.box(-4,0,-3,4,4,3,C.mah);k.box(-3,5,-2,3,24,2,C.mah);k.box(-2,10,3,2,22,3,C.glass,'door');k.box(0,12,2,0,20,2,C.brass);k.disc(0,11,2,1,C.brass);
  k.box(-4,25,-3,4,34,3,C.mah);k.box(-3,26,4,3,33,4,C.cream,'face');k.put(0,30,5,C.black);k.put(0,31,5,C.black);k.put(1,29,5,C.black);for(const[x,y]of[[0,32],[0,27],[-2,29],[2,29]])k.put(x,y,5,C.black,'face');
  k.box(-5,35,-3,5,36,3,C.mah);k.put(-4,37,3,C.gilt);k.put(4,37,3,C.gilt);k.put(0,37,3,C.gold);return{V:k.V,size:[1.2,4.3,.8]}});
def('grandPiano',{label:'Grand piano',room:'Music Room, Ballroom',act:'play'},o=>{const k=kit(),c=o.c||C.ebony;
  for(let z=-14;z<=12;z++){const w=z<0?8:Math.round(8-(z/12)*4);for(let x=-8;x<=w;x++)k.box(x,9,z,x,11,z,c)}k.box(-8,6,12,8,8,15,c);for(let x=-7;x<=7;x++){k.put(x,9,14,x%3?C.white:C.black);k.put(x,9,15,C.white)}
  for(const[x,z]of[[-7,13],[7,13],[0,-12]])k.box(x,0,z,x+1,8,z+1,c);k.box(-1,0,9,1,4,9,C.brass);k.box(-8,12,-14,-8,24,-14,c,'lid');for(let z=-14;z<=6;z++){k.put(-8,12+Math.round((6-z)/2),z,c,'lid')}
  k.box(-5,0,20,5,6,24,c,'seat');return{V:k.V,size:[1.9,2.8,4.4]}});
def('globe',{label:'Globe on a stand',room:'Schoolroom, Map Room, Library',act:'touch: the globe'},o=>{const k=kit(),sd=(o.seed||0)*1.7,cy=16,G='#c9a227',sea='#3f78a8',sea2='#4a86b6';
  /* v1.57 (His Grace's photo of the Observatory): a round ball of blue sea with green and tan land and white at the poles, inside an upright gold meridian ring (it was a lumpy shell over a flat gold tray), on a turned stand with three feet. o.seed turns the world, so no two globes are the same */
  for(const a of[1.5708,3.6652,5.7596])for(let t=1;t<=4;t++)k.put(Math.round(Math.cos(a)*t),t>=3?0:1,Math.round(Math.sin(a)*t),C.wal);
  for(let y=1;y<=8;y++)k.put(0,y,0,C.wal);for(const y of[3,6])for(const[x,z]of[[1,0],[-1,0],[0,1],[0,-1]])k.put(x,y,z,C.wal);k.box(-1,9,0,1,9,0,G);
  for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++)for(let z=-5;z<=5;z++){const q=x*x+y*y+z*z;if(q>30||q<14)continue;const n=Math.sin(x*.9+sd+y*.5)+Math.cos(z*.8-y*.6+sd*.6)+Math.sin((x+z)*.45+sd*1.3);
    k.put(x,cy+y,z,Math.abs(y)>=5?'#eef2f4':n>1.55?'#c9b88a':n>.75?((x+y+z)&1?'#5f8a4a':'#6b9654'):((x*3+y+z*5)%4?sea:sea2),'face')}
  for(let x=-7;x<=7;x++)for(let y=-7;y<=7;y++){const q=x*x+y*y;if(q>=37&&q<=50)k.put(x,cy+y,0,G)}k.put(0,cy+6,0,G);k.put(0,cy-6,0,G);k.put(0,cy+8,0,G);return{V:k.V,size:[1.5,2.8,1.3]}});
def('wireless',{label:'The wireless set',room:'Wireless Room',act:'touch: the Edition and alerts'},o=>{const k=kit();
  k.box(-8,0,-4,8,10,4,C.wal);k.box(-7,11,-4,7,20,3,C.wal);k.box(-6,12,4,6,19,4,'#c9b28a','face');for(let x=-5;x<=5;x+=2)for(let y=13;y<=18;y+=2)k.put(x,y,5,C.wal);
  for(const x of[-5,0,5]){k.disc(x,7,5,1,C.brass);k.put(x,7,6,C.black)}k.box(-3,3,5,3,4,5,C.flame,'flame');k.box(0,21,0,0,30,0,C.brass);k.box(-6,30,0,6,30,0,C.brass);return{V:k.V,size:[2,3.6,1]}});
def('telescope',{label:'Telescope',room:'Observatory',act:'look'},o=>{const k=kit();
  for(const a of[0,2.1,4.2]){for(let s=0;s<12;s++)k.put(Math.round(Math.cos(a)*s/2.5),12-s,Math.round(Math.sin(a)*s/2.5),C.wal)}
  for(let s=-8;s<=18;s++){const y=13+Math.round(s*.55),z=Math.round(s*.8);k.put(0,y,z,C.brass);k.put(1,y,z,C.brass);if(s>14){k.put(-1,y,z,C.brass);k.put(2,y,z,C.brass)}}k.put(0,8,-7,C.black);return{V:k.V,size:[1,3,2.5]}});
def('portrait',{label:'Gilt-framed portrait',room:'Long Gallery, every state room',act:'touch: opens its essay or Call',wall:true},o=>{const k=kit(),W=o.w||6,H=o.h||9,r=rng(o.seed||2),pk=a=>a[Math.floor(r()*a.length)];
  for(let x=-W-1;x<=W+1;x++)for(let y=-1;y<=2*H+1;y++){const edge=x<-W||x>W||y<0||y>2*H;k.put(x,y+14,0,edge?((x+y)%3?C.gilt:C.giltD):null)}
  /* v1.57: a sitter with eyes and a mouth, and no two alike: a lady or a gentleman by the seed, with their own skin, hair, dress and ground (plain, a curtain, or a park and sky). They were all one faceless figure in a red block (His Grace's photo of the Music Room) */
  const bgK=Math.floor(r()*3),bg=pk(['#2b2a24','#3a2a1e','#1e2a2a','#2a2433']),lady=r()<.5,skin=pk(['#d9b48a','#e8c6a0','#c99a6e','#a8744a']),hair=pk(['#3a2a1e','#5a3a22','#1e1612','#8a6a3a','#b9b2a6','#7a3a1c']),
    dress=lady?pk(['#7a1f2a','#1f4a7a','#2a6a4a','#6a3a7a','#c9a227','#e9dfc4','#b8526a']):pk(['#1e2a3a','#26262a','#3a1e1e','#24402e','#4a3420','#7a1f2a']),drape=pk(['#6a1a22','#1f3a2a','#2a2a4a','#5a4a1e']),stache=!lady&&r()<.4,sash=!lady&&r()<.3;
  for(let x=-W;x<=W;x++)for(let y=0;y<=2*H;y++){let c=bg;const dx=Math.abs(x);
    if(bgK===1&&(x>W-4||y>2*H-2))c=(x+((y/3)|0))%2?drape:bg;if(bgK===2)c=y>H+3?(y>2*H-4?'#5f7f96':'#8aa2ae'):(y>H?'#5a7a48':'#3a5230');
    if(y<H){const bw=y>=H-1?1:y>=H-2?W-3:W-2;if(dx<=bw){c=y>=H-1?skin:dress;if(lady){if(y===H-2&&dx<=2)c=skin;if(y===H-3&&x===0)c='#d4af37'}else{if(dx<=1&&y>=H-4&&y<H-1)c='#f4f1ea';if(x===0&&y<H-4&&y%2===0)c='#c9a227';if(sash&&x===Math.round((y-H+6)*.8))c='#a02a2a'}}}
    if(y>=H&&y<=H+4&&dx<=2)c=skin;if((y===H+5&&dx<=2)||(y===H+6&&dx<=1)||(y===H+4&&dx===2))c=hair;if(lady&&dx===3&&y>=H-1&&y<=H+5)c=hair;
    if(y===H+3&&dx===1)c='#3a281c';if(y===H+1&&dx<=(lady?0:1))c=stache?hair:'#9a4a3c';
    k.put(x,y+14,0,c,'face')}
  for(const[key,v]of k.V)if(v[3]===null)k.V.delete(key);return{V:k.V,size:[(2*W+3)/8.7,(2*H+3)/8.7,.1],anchor:'wall'}});
def('bellPull',{label:'Bell pull',room:'Every room',act:'ring: a servant comes',wall:true},o=>{const k=kit(),c=o.c||C.damask;
  k.box(0,30,0,0,30,1,C.brass);for(let y=8;y<=29;y++){k.put(0,y,1,c,'face');if(y%4===0)k.put(0,y,1,C.gold,'face')}k.box(0,5,1,0,7,1,C.brass,'face');k.put(0,4,1,C.gold,'face');return{V:k.V,size:[.2,3.5,.2],anchor:'wall'}});
def('gong',{label:'Dinner gong',room:'Entrance Hall',act:'ring at seven'},o=>{const k=kit();
  k.box(-7,0,0,-7,20,0,C.mah);k.box(7,0,0,7,20,0,C.mah);k.box(-7,21,0,7,21,0,C.mah);k.put(-7,22,0,C.gilt);k.put(7,22,0,C.gilt);
  for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++)if(x*x+y*y<=26)k.put(x,13+y,0,x*x+y*y<4?C.gold:C.brass,'face');k.box(0,19,0,0,20,0,C.brass);return{V:k.V,size:[1.7,2.6,.2]}});
def('rug',{label:'Turkey rug',room:'State rooms',act:'none'},o=>{const k=kit(),W=o.w||16,L=o.l||22,r=rng(o.seed||9),f=o.c||C.damask,b=o.c2||C.blue;
  for(let x=-W;x<=W;x++)for(let z=-L;z<=L;z++){const ex=W-Math.abs(x),ez=L-Math.abs(z),e=Math.min(ex,ez);let c=f;
    if(e===0)c=C.cream;else if(e<=2)c=b;else if(e===3)c=C.gold;else{const m=(Math.abs(x)*3+Math.abs(z)*2)%11;c=m<2?b:m<3?C.gold:m<4?C.cream:f;if(Math.abs(x)<4&&Math.abs(z)<6)c=(x+z)%2?C.gold:b}
    k.put(x,0,z,c)}if(o.fringe!==false)for(let x=-W;x<=W;x+=2){k.put(x,0,-L-1,C.cream);k.put(x,0,L+1,C.cream)}return{V:k.V,size:[(2*W+1)/8.7,.1,(2*L+3)/8.7]}});

/* ---------------- architecture and trim (tileable, place along walls) ---------------- */
def('panelling',{label:'Oak wall panelling, one bay',room:'Library, Business Room, Smoking Room, Great Hall',tile:[16,0],wall:true},o=>{const k=kit(),H=o.h||26,wd=o.wood||C.oak;
  for(let x=-8;x<=7;x++)for(let y=0;y<=H;y++){let c=wd;const lx=x+8;if(y<=2)c=C.wal;else if(y===H||y===H-1)c=C.oakL;else if(lx===0||lx===15)c=C.oakL;else if((y===12||y===13))c=C.oakL;
    else if((lx>=3&&lx<=12)&&((y>=5&&y<=10)||(y>=16&&y<=H-4)))c=(lx===3||lx===12||y===5||y===10||y===16||y===H-4)?C.oakL:'#5e3a22';k.put(x,y,0,c)}
  for(let x=-8;x<=7;x++){k.put(x,H+1,1,C.oakL);k.put(x,13,1,C.oakL)}return{V:k.V,size:[1.84,(H+2)/8.7,.2],anchor:'wall'}});
def('dado',{label:'Dado rail and skirting with damask above',room:'State rooms (damask walls)',tile:[16,0],wall:true},o=>{const k=kit(),f=o.c||C.damask,H=o.h||70;
  for(let x=-8;x<=7;x++){k.box(x,0,0,x,4,1,C.white);k.put(x,5,1,C.gilt);for(let y=5;y<=16;y++)k.put(x,y,0,(x+8)%8===0?C.cream:C.white);k.box(x,17,0,x,18,1,C.white);k.put(x,18,2,C.gilt);
    for(let y=19;y<=H;y++){const p=((x+8)%8)*0+((y+((x+8)>>3)*4)%8);k.put(x,y,0,(p===0||(p===4&&(x+8)%4===2))?C.damaskD:f)}}return{V:k.V,size:[1.84,(H+1)/8.7,.3],anchor:'wall'}});
def('cornice',{label:'Gilt cornice with egg and dart',room:'Every state room ceiling line',tile:[16,0],wall:true,hang:true},o=>{const k=kit();
  for(let x=-8;x<=7;x++){k.put(x,0,0,C.white);k.put(x,0,1,C.white);k.put(x,1,0,C.white);k.put(x,1,1,(x%3===0)?C.gilt:C.white);k.put(x,1,2,C.white);k.put(x,2,0,C.white);k.put(x,2,2,C.white);k.put(x,2,3,(x%2)?C.gilt:C.cream);
    k.put(x,3,0,C.white);k.put(x,3,3,C.white);k.put(x,3,4,C.white);k.put(x,4,0,C.white);k.put(x,4,4,C.gilt);k.put(x,4,5,C.white);for(let z=0;z<=5;z++)k.put(x,5,z,C.white)}
  return{V:k.V,size:[1.84,.7,.7],anchor:'ceiling'}});
def('column',{label:'Corinthian column',room:'Saloon gallery, Library screen, Entrance Hall',act:'none'},o=>{const k=kit(),H=o.h||60,m=o.c||C.marble;
  k.box(-5,0,-5,5,2,5,m);k.disc(0,3,0,4,m);for(let y=4;y<H-8;y++){for(let a=0;a<16;a++){const t=a/16*Math.PI*2,r=3.4+(a%2?0:-.4)-(y/H)*.5;k.put(Math.round(Math.cos(t)*r),y,Math.round(Math.sin(t)*r),a%2?m:C.marbleV)}}
  k.disc(0,H-8,0,4,C.gilt);for(let y=H-7;y<=H-2;y++)for(let a=0;a<20;a++){const t=a/20*Math.PI*2,r=3.5+(y-H+7)*.35;k.put(Math.round(Math.cos(t)*r),y,Math.round(Math.sin(t)*r),(a+y)%3?C.gilt:C.giltD)}
  k.box(-6,H-1,-6,6,H,6,m);return{V:k.V,size:[1.5,(H+1)/8.7,1.5]}});
def('balustrade',{label:'Gallery balustrade',room:'Saloon gallery, Grand Stair, terrace',tile:[16,0]},o=>{const k=kit(),c=o.c||C.oak;
  k.box(-8,0,-1,7,1,1,c);k.box(-8,10,-1,7,11,1,c);k.box(-8,12,0,7,12,0,C.oakL);for(let x=-7;x<=7;x+=3){k.put(x,2,0,c);k.disc(x,3,0,1,c);k.put(x,4,0,c);k.put(x,5,0,c);k.disc(x,6,0,1,c);k.put(x,7,0,c);k.put(x,8,0,c);k.put(x,9,0,c)}
  return{V:k.V,size:[1.84,1.5,.3]}});
def('doorDouble',{label:'Double door, 3 by 6 blocks',room:'State rooms',act:'open and close',wall:true},o=>{const k=kit(),wd=o.wood||C.mah,W=13,H=52;
  for(let x=-W-2;x<=W+2;x++)for(let y=0;y<=H+6;y++){const fr=x<-W||x>W||y>H;if(fr){k.put(x,y,0,y>H+4?C.gilt:C.white);continue}
    const lx=Math.abs(x),pan=(lx>=2&&lx<=W-2)&&((y>=4&&y<=22)||(y>=27&&y<=H-4));k.put(x,y,0,pan?(lx===2||lx===W-2||y===4||y===22||y===27||y===H-4?C.giltD:C.mahL):wd,'door')}
  k.put(-2,26,1,C.brass,'door');k.put(2,26,1,C.brass,'door');k.box(-6,H+7,0,6,H+9,1,C.white);k.put(0,H+10,1,C.gold);return{V:k.V,size:[3.4,7.1,.2],anchor:'wall'}});
def('sash',{label:'Sash window with shutters and curtains',room:'State rooms',act:'open curtains',wall:true},o=>{const k=kit(),W=8,H=42,cu=o.c||C.damask;
  for(let x=-W;x<=W;x++)for(let y=0;y<=H;y++){const fr=Math.abs(x)===W||y===0||y===H||y===21||x===0||y===10||y===31;k.put(x,y+8,0,fr?C.white:C.glass)}k.box(-W-1,6,0,W+1,7,2,C.white);
  for(const s of[-1,1])for(let y=0;y<=H+4;y++)for(let d=0;d<4;d++){const x=s*(W+1+d);k.put(x,y+6,1,(y+d)%5?cu:C.damaskD,'door')}k.box(-W-5,H+11,1,W+5,H+13,2,C.gilt);return{V:k.V,size:[2.8,7,.3],anchor:'wall'}});
def('urn',{label:'Garden urn with box ball',room:'Terrace, Orangery, gardens',act:'none'},o=>{const k=kit();
  k.box(-4,0,-4,4,5,4,C.stone);k.disc(0,6,0,2,C.stone);k.disc(0,7,0,1,C.stone);for(let y=8;y<=14;y++)k.ring(0,y,0,Math.round(2+Math.sin((y-8)/6*Math.PI)*3),C.stone);k.ring(0,15,0,5,C.stoneD);
  for(let x=-4;x<=4;x++)for(let y=-4;y<=4;y++)for(let z=-4;z<=4;z++)if(x*x+y*y+z*z<=18)k.put(x,19+y,z,(x+y*3+z)%4?'#2f5a2a':'#3f6b33','leaf');return{V:k.V,size:[1.1,2.7,1.1]}});
def('palm',{label:'Potted palm',room:'Saloon, Orangery, Morning Room',act:'none'},o=>{const k=kit();
  for(let y=0;y<=6;y++)k.ring(0,y,0,3+(y>4?1:0),'#b06a3a');k.disc(0,6,0,3,'#3a2a1e');k.box(0,7,0,0,16,0,'#6b5a3a');
  for(let a=0;a<7;a++){const t=a/7*Math.PI*2;for(let s=1;s<=9;s++){const x=Math.round(Math.cos(t)*s),z=Math.round(Math.sin(t)*s),y=17+Math.round(3-((s-4)*(s-4))/6);k.put(x,y,z,s%2?'#3f7a33':'#2f5a2a','leaf')}}return{V:k.V,size:[2.1,2.5,2.1]}});

/* ---------------- trees (unit .25, 4 per block) ---------------- */
function blob(k,cx,cy,cz,rx,ry,rz,cols,r,part='leaf'){for(let x=-rx;x<=rx;x++)for(let y=-ry;y<=ry;y++)for(let z=-rz;z<=rz;z++){const q=(x*x)/(rx*rx)+(y*y)/(ry*ry)+(z*z)/(rz*rz);if(q>1)continue;if(q<.55&&(x+y+z)%3)continue;if(r()<.12&&q>.8)continue;k.put(cx+x,cy+y,cz+z,cols[Math.floor(r()*cols.length)],part)}}
function trunk(k,x0,z0,h,r0,c,cd){for(let y=0;y<=h;y++){const r=Math.max(1,Math.round(r0*(1-y/h*.55)));for(let x=-r;x<=r;x++)for(let z=-r;z<=r;z++)if(x*x+z*z<=r*r+.5)k.put(x0+x,y,z0+z,(x*3+z+y)%7?c:cd)}}
function limb(k,x0,y0,z0,dx,dy,dz,n,c){for(let s=0;s<=n;s++)k.put(Math.round(x0+dx*s),Math.round(y0+dy*s),Math.round(z0+dz*s),c)}
const TREE=(fn)=>o=>{const k=kit(),r=rng(o.seed||1);fn(k,r,o);return{V:k.V,unit:TU,size:o._size||null}};
def('treeOak',{label:'English oak',room:'Park, avenue',act:'none',tree:true},TREE((k,r,o)=>{const bark='#4a3b2a',bd='#3a2e22',G=['#3f6b2a','#4a7a33','#355a24','#5a8a3a'];
  trunk(k,0,0,22,4,bark,bd);for(let i=0;i<7;i++){const t=i/7*Math.PI*2+r(),l=10+r()*6;limb(k,0,14+i*1.5,0,Math.cos(t),.55,Math.sin(t),l,bark);blob(k,Math.round(Math.cos(t)*l),Math.round(14+i*1.5+l*.55)+2,Math.round(Math.sin(t)*l),8+Math.floor(r()*4),6,8,G,r)}
  blob(k,0,34,0,14,9,14,G,r);o._size=[12,11,12]}));
def('treeCedar',{label:'Cedar of Lebanon (as on the Highclere lawns)',room:'Lawns',act:'none',tree:true},TREE((k,r,o)=>{const bark='#5a4632',bd='#43342a',G=['#2a4a33','#335a3f','#24402c','#3a5f45'];
  trunk(k,0,0,34,4,bark,bd);for(let t=0;t<5;t++){const y=10+t*6,R=22-t*3.5,dx=(r()-.5)*6,dz=(r()-.5)*6;for(let a=0;a<4;a++){const th=a/4*Math.PI*2+t;limb(k,0,y,0,Math.cos(th),.1,Math.sin(th),R*.7,bark)}
    for(let x=-R;x<=R;x++)for(let z=-R;z<=R;z++){const q=(x*x+z*z)/(R*R);if(q>1||r()<.18)continue;const yy=y+2+Math.round((1-q)*2);k.put(Math.round(x+dx*q),yy,Math.round(z+dz*q),G[Math.floor(r()*4)],'leaf');if(q<.6&&r()<.5)k.put(Math.round(x+dx*q),yy+1,Math.round(z+dz*q),G[Math.floor(r()*4)],'leaf')}}
  o._size=[11,11,11]}));
def('treeBeech',{label:'Copper beech',room:'Park',act:'none',tree:true},TREE((k,r,o)=>{const bark='#7a7a72',bd='#5f5f58',G=['#6b2a2a','#7a3333','#5a2424','#8a4a3a'];
  trunk(k,0,0,20,3,bark,bd);for(let i=0;i<5;i++){const t=i/5*Math.PI*2+r();limb(k,0,12,0,Math.cos(t),.8,Math.sin(t),9,bark)}blob(k,0,28,0,13,11,13,G,r);blob(k,4,22,-3,8,6,8,G,r);o._size=[7,10,7]}));
def('treeYew',{label:'Clipped yew',room:'Formal garden, chapel yard',act:'none',tree:true},TREE((k,r,o)=>{const G=['#1f3a24','#24432a','#1a3320'];
  for(let y=0;y<=26;y++){const R=Math.max(0,Math.round(9*(1-y/27)));for(let x=-R;x<=R;x++)for(let z=-R;z<=R;z++){const q=x*x+z*z;if(q>R*R+.5)continue;if(q<(R-1)*(R-1)&&y%3)continue;k.put(x,y,z,G[Math.floor(r()*3)],'leaf')}}k.put(0,27,0,G[0],'leaf');o._size=[4.7,7,4.7]}));
def('treePoplar',{label:'Lombardy poplar',room:'Avenue edges, village',act:'none',tree:true},TREE((k,r,o)=>{const G=['#4a7a33','#5a8a3a','#3f6b2a'];trunk(k,0,0,10,2,'#6b5a44','#55483a');
  for(let y=6;y<=52;y++){const R=Math.round(4.5*Math.sin(Math.min(1,(y-6)/46)*Math.PI)+1);for(let x=-R;x<=R;x++)for(let z=-R;z<=R;z++){if(x*x+z*z>R*R+.5||r()<.15)continue;k.put(x,y,z,G[Math.floor(r()*3)],'leaf')}}o._size=[3,13,3]}));
def('treeBirch',{label:'Silver birch',room:'Woodland edge, lake',act:'none',tree:true},TREE((k,r,o)=>{const G=['#7aa04a','#8ab05a','#6a9040'];for(let y=0;y<=28;y++){k.put(0,y,0,(y%5===2||(y%7===4))?'#2b2422':'#ecebe4');if(y<10){k.put(1,y,0,y%6===1?'#2b2422':'#ecebe4')}}
  for(let i=0;i<6;i++){const t=i/6*Math.PI*2+r();limb(k,0,14+i*2,0,Math.cos(t),.6,Math.sin(t),6,'#d8d6cc');blob(k,Math.round(Math.cos(t)*6),18+i*2,Math.round(Math.sin(t)*6),4,5,4,G,r)}blob(k,0,32,0,5,6,5,G,r);o._size=[4,10,4]}));
def('treeApple',{label:'Apple tree, fruiting',room:'Kitchen garden, Home Farm orchard',act:'pick an apple',tree:true},TREE((k,r,o)=>{const G=['#4a7a33','#5a8a3a','#3f6b2a'];trunk(k,0,0,8,2,'#5a4632','#43342a');
  for(let i=0;i<4;i++){const t=i/4*Math.PI*2+r();limb(k,0,6,0,Math.cos(t),.7,Math.sin(t),6,'#5a4632')}blob(k,0,14,0,9,6,9,G,r);for(const[key,v]of k.V)if(v[4]==='leaf'&&r()<.05)v[3]='#c0262b';o._size=[4.5,5,4.5]}));
def('hedge',{label:'Box hedge, one block run',room:'Parterre, terrace',tile:[4,0],tree:true},TREE((k,r,o)=>{const G=['#2f5a2a','#355f2e','#2a4f26'];for(let x=-2;x<=1;x++)for(let y=0;y<=5;y++)for(let z=-2;z<=1;z++)k.put(x,y,z,G[Math.floor(r()*3)],'leaf');o._size=[1,1.5,1]}));
def('topiary',{label:'Topiary ball on a stem',room:'Terrace, Orangery',act:'none',tree:true},TREE((k,r,o)=>{const G=['#2f5a2a','#3f6b33'];for(let y=0;y<=3;y++)k.ring(0,y,0,2,C.stone);k.box(0,4,0,0,8,0,'#5a4632');blob(k,0,12,0,4,4,4,G,r);o._size=[2,4,2]}));

/* ---------------- public API ---------------- */
function build(kind,o={}){const f=B[kind];if(!f)throw new Error('No prop '+kind);const r=f(Object.assign({},o));if(!r.unit)r.unit=PU;r.kind=kind;r.info=INFO[kind];r.count=r.V.size;
  if(!r.size){let mx=0,my=0,mz=0;for(const v of r.V.values()){mx=Math.max(mx,Math.abs(v[0]));my=Math.max(my,v[1]);mz=Math.max(mz,Math.abs(v[2]))}r.size=[(2*mx+1)*r.unit,(my+1)*r.unit,(2*mz+1)*r.unit]}
  return r}
/* face-culled geometry arrays for any renderer: {pos,col,nor} Float32Arrays, scaled by unit */
function faces(r,scale){const s=(scale||1)*r.unit,V=r.V,P=[],Cc=[],N=[];const has=(x,y,z)=>V.has(x+','+y+','+z);
  const F=[[1,0,0,[[1,0,0],[1,1,0],[1,1,1],[1,0,1]]],[-1,0,0,[[0,0,1],[0,1,1],[0,1,0],[0,0,0]]],[0,1,0,[[0,1,0],[0,1,1],[1,1,1],[1,1,0]]],[0,-1,0,[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]],[0,0,1,[[1,0,1],[1,1,1],[0,1,1],[0,0,1]]],[0,0,-1,[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]]];
  const hex=h=>{const n=parseInt(h.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};const cache={};
  for(const[x,y,z,c,p]of V.values()){const rgb=cache[c]||(cache[c]=hex(c));const sh=p==='flame'?1.25:1;for(const[dx,dy,dz,q]of F){if(has(x+dx,y+dy,z+dz))continue;const L=dy>0?1:dy<0?.55:dx!==0?.78:.88;
    const v=[0,1,2,0,2,3].map(i=>q[i]);for(const[a,b,cz]of v){P.push((x-.5+a)*s,(y+b)*s,(z-.5+cz)*s);Cc.push(Math.min(1,rgb[0]*L*sh),Math.min(1,rgb[1]*L*sh),Math.min(1,rgb[2]*L*sh));N.push(dx,dy,dz)}}}
  return{pos:new Float32Array(P),col:new Float32Array(Cc),nor:new Float32Array(N)}}
const api={build,faces,get kinds(){return Object.keys(B)},info:INFO,colors:C,books:BOOKS,PU,PU2,TU,def,kit,rng,blob,trunk,limb,TREE};return api})();
if(typeof module!=='undefined')module.exports=PROPS;
