/* =========================================================
   Euphrates Hall Parts Depot: props4.js (Depot 7, repairs and trim, Nov 12, 2026)
   Load after props3.js. It repairs four props His Grace flagged in first person and gives every
   wall trim a cut-to-length option and its corner and end pieces.

   Repairs (same kind names, so nothing in a plan changes):
     column          solid round shaft with fluting in colour (no hollow ring), a true Attic base and a
                     Corinthian capital; o.h total height in prop voxels, clean from 40 to 150
     lampPost        stem 3 voxels thick for its whole height, banded
     standardLamp    stem 2 by 2 voxels
     lanternPendant  chain 2 by 2 voxels; still hangs from its top voxel
   Trim (cornice, dado, panelling, balustrade, beam):
     o.len           run length in blocks (default 1.84; beam 1), so a bay can be cut to fit
     o.piece         'in' inside corner, 'out' outside corner, 'endL' / 'endR' returned ends
     kinds           corniceIn, corniceOut, corniceEndL, corniceEndR, and the same for dado and panelling;
                     balustradePost (newel post for balustrade corners and ends)
   Corner and end convention: the piece's origin is the corner point of the two wall lines. It fills the
   quadrant x >= 0, z >= 0 (endL fills x <= 0). Wall A is the plane z = 0 (its trim projects +z), wall B the
   plane x = 0 (its trim projects +x). Runs stop at the corner; the corner piece covers the last D voxels of both.
   Note: ring(x,y,z,0) in the kit emits nothing; disc(x,y,z,0) emits one voxel. That was the lamp post's missing stem.
   ========================================================= */
(function(PROPS){const{def,kit,colors:C}=PROPS;const U=.115;const nOf=(len,dflt)=>Math.max(2,Math.round((len||dflt)/U));

/* ---------- repairs ---------- */
def('column',{label:'Corinthian column (solid shaft, Attic base, any height 40 to 150)',room:'Saloon gallery, Library screen, Entrance Hall',act:'none'},o=>{const k=kit(),H=Math.max(40,Math.min(150,o.h||60)),m=o.c||C.marble,v=C.marbleV,g=C.gilt,gd=C.giltD;
  k.box(-6,0,-6,6,2,6,m);k.disc(0,3,0,5,m);k.disc(0,4,0,5,v);k.disc(0,5,0,4,m);k.disc(0,6,0,5,m);k.disc(0,7,0,4,v);
  const top=H-11;for(let y=8;y<top;y++)for(let x=-4;x<=4;x++)for(let z=-4;z<=4;z++){const q=x*x+z*z;if(q>4*4+2.4)continue;const edge=q>3*3+1.8;const a=Math.atan2(z,x);const flute=edge&&Math.floor((a+Math.PI)/(Math.PI/4))%2===0;k.put(x,y,z,flute?v:m)}
  k.disc(0,top,0,5,g);k.disc(0,top+1,0,4,m);
  for(let i=0;i<8;i++){const y=top+2+i,r=4+Math.round(i*.3);for(let x=-r-1;x<=r+1;x++)for(let z=-r-1;z<=r+1;z++){const q=x*x+z*z;if(q>r*r+r*.6)continue;const a=Math.atan2(z,x);const leaf=Math.floor((a+Math.PI)/(Math.PI/4))%2===0;const edge=q>(r-1)*(r-1)+(r-1)*.6;k.put(x,y,z,edge?(leaf?(i>5?gd:g):m):m)}
    if(i>=4)for(const[sx,sz]of[[1,1],[1,-1],[-1,1],[-1,-1]]){k.put(sx*(r+1),y,sz*(r+1),g)}}
  k.box(-7,H-1,-7,7,H,7,m);k.box(-7,H,-7,7,H,7,m);for(let x=-6;x<=6;x++){k.put(x,H-1,7,v);k.put(x,H-1,-7,v)}
  return{V:k.V,size:[1.73,(H+1)/8.7,1.73]}});

def('lampPost',{label:'Gas lamp post (thick stem)',room:'The drive, the village, the terrace',act:'light at dusk'},o=>{const k=kit(),I=C.iron;
  k.box(-2,0,-2,2,3,2,I);for(let y=4;y<=30;y++){for(const[x,z]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])k.put(x,y,z,I);if(y===8||y===20||y===29)k.box(-1,y,-1,1,y,1,I)}
  k.box(-3,30,0,3,30,0,I);k.box(-2,31,-2,2,31,2,I);for(let y=32;y<=37;y++){const r=y<36?2:1;for(let x=-r;x<=r;x++)for(let z=-r;z<=r;z++){if(Math.abs(x)!==r&&Math.abs(z)!==r)continue;k.put(x,y,z,(Math.abs(x)===r&&Math.abs(z)===r)?I:C.glass)}}
  k.box(0,32,0,0,34,0,C.flame,'flame');k.box(-1,38,-1,1,38,1,I);k.put(0,39,0,I);return{V:k.V,size:[.6,4.6,.6]}});

def('standardLamp',{label:'Standard lamp with silk shade (2 by 2 stem)',room:'Drawing Room, Library, bedrooms',act:'light'},o=>{const k=kit(),s=o.c||'#e8d8b0';k.disc(0,0,0,3,C.brass);k.disc(0,1,0,2,C.brass);
  for(let y=2;y<=26;y++)k.box(0,y,0,1,y,1,y%6===0?C.gilt:C.brass);for(let y=24;y<=31;y++){const r=5-Math.round((y-24)/3);k.ring(0,y,0,r,s)}k.box(0,26,0,1,27,1,C.flame,'flame');
  for(let a=0;a<16;a+=2){const t=a/16*6.28;k.put(Math.round(Math.cos(t)*5),23,Math.round(Math.sin(t)*5),C.gold)}return{V:k.V,size:[1.3,3.7,1.3]}});

def('lanternPendant',{label:'Hall lantern (2 by 2 chain)',room:'Entrance Hall, corridors, stairs',act:'light',hang:true,ceiling:true},o=>{const k=kit();for(let y=20;y<=30;y++)k.box(0,y,0,1,y,1,y%2?C.brass:C.giltD);
  for(let y=6;y<=18;y++){const r=y<8||y>16?2:3;for(let x=-r;x<=r;x++)for(let z=-r;z<=r;z++){if(Math.abs(x)!==r&&Math.abs(z)!==r)continue;k.put(x,y,z,(Math.abs(x)===r&&Math.abs(z)===r)||y===6||y===18?C.brass:C.glass)}}
  k.box(0,8,0,0,13,0,C.white);k.box(0,14,0,0,15,0,C.flame,'flame');k.box(-1,19,-1,1,19,1,C.brass);k.put(0,5,0,C.brass);return{V:k.V,size:[.8,3.6,.8],anchor:'top'}});

/* ---------- trim: a profile per kind, then runs, corners and ends from the same profile ----------
   profile(y,d,x) -> colour or null: the moulding at height y, depth d from the wall (0 = against it), x along the run */
const PRO={
  cornice:{H:5,D:6,anchor:'ceiling',hang:true,wall:true,prof:(y,d)=>{const depth=[1,2,3,4,5,5][y];if(d>depth)return null;if(d<depth)return C.white;return y===1||y===4?C.gilt:y===2?C.cream:C.white}},
  dado:{D:3,anchor:'wall',wall:true,H:o=>o.h||70,prof:(y,d,x,o)=>{const f=o.c||C.damask;if(y<=4)return d<=1?C.white:null;if(y===5)return d<=1?(d===1?C.gilt:C.white):null;if(y<=16)return d===0?(((x%8)+8)%8===0?C.cream:C.white):null;
    if(y<=18)return d<=1?C.white:(y===18&&d===2?C.gilt:null);return d===0?f:null}},
  panelling:{D:2,anchor:'wall',wall:true,H:o=>(o.h||26)+1,prof:(y,d,x,o)=>{const H=o.h||26,wd=o.wood||C.oak;if(d===1)return y===13||y===H+1?C.oakL:null;if(d>1)return null;const lx=((x%16)+16)%16;
    if(y<=2)return C.wal;if(y===H||y===H-1||y===H+1)return C.oakL;if(lx===0||lx===15||y===12||y===13)return C.oakL;if(lx>=3&&lx<=12&&((y>=5&&y<=10)||(y>=16&&y<=H-4)))return(lx===3||lx===12||y===5||y===10||y===16||y===H-4)?C.oakL:'#5e3a22';return wd}}};
const hOf=(p,o)=>typeof p.H==='function'?p.H(o):p.H;
function run(name,o){const p=PRO[name],k=kit(),n=nOf(o.len,1.84),H=hOf(p,o),x0=-Math.floor(n/2);for(let i=0;i<n;i++){const x=x0+i;for(let y=0;y<=H;y++)for(let d=0;d<=p.D;d++){const c=p.prof(y,d,x,o);if(c)k.put(x,y,d,c)}}return{V:k.V,size:[n*U,(H+1)/8.7,(p.D+1)*U],anchor:p.anchor}}
function corner(name,o,piece){const p=PRO[name],k=kit(),H=hOf(p,o),D=p.D+1;for(let a=0;a<D;a++)for(let b=0;b<D;b++)for(let y=0;y<=H;y++){const d=piece==='in'?Math.min(a,b):Math.max(a,b);const c=p.prof(y,d,0,o);if(!c)continue;const x=piece==='endL'?-a:a;k.put(x,y,b,c)}
  return{V:k.V,size:[D*U,(H+1)/8.7,D*U],anchor:p.anchor,corner:piece}}
const LAB={cornice:'Gilt cornice',dado:'Dado rail and skirting with damask above',panelling:'Oak wall panelling'};const ROOMS={cornice:'Every state room ceiling line',dado:'State rooms (damask walls)',panelling:'Library, Business Room, Smoking Room, Great Hall'};
for(const name of Object.keys(PRO)){const p=PRO[name];
  def(name,{label:LAB[name]+', one bay (o.len cuts it; o.piece for corners and ends)',room:ROOMS[name],tile:[16,0],wall:p.wall,hang:p.hang},o=>o.piece?corner(name,o,o.piece):run(name,o));
  for(const[suf,piece,lab]of[['In','in','inside corner'],['Out','out','outside corner'],['EndL','endL','left end, returned to the wall'],['EndR','endR','right end, returned to the wall']])
    def(name+suf,{label:LAB[name]+', '+lab,room:ROOMS[name],wall:p.wall,hang:p.hang,trim:name,piece},o=>corner(name,o,piece))}

def('balustrade',{label:'Gallery balustrade, one bay (o.len cuts it)',room:'Saloon gallery, Grand Stair, terrace',tile:[16,0]},o=>{const k=kit(),c=o.c||C.oak,n=nOf(o.len,1.84),x0=-Math.floor(n/2),x1=x0+n-1;
  k.box(x0,0,-1,x1,1,1,c);k.box(x0,10,-1,x1,11,1,c);k.box(x0,12,0,x1,12,0,C.oakL);for(let x=x0+1;x<=x1;x+=3){k.put(x,2,0,c);k.disc(x,3,0,1,c);k.put(x,4,0,c);k.put(x,5,0,c);k.disc(x,6,0,1,c);k.put(x,7,0,c);k.put(x,8,0,c);k.put(x,9,0,c)}
  return{V:k.V,size:[n*U,1.5,.35]}});
def('balustradePost',{label:'Balustrade newel post (corners and ends of a balustrade run)',room:'Saloon gallery, Grand Stair, terrace'},o=>{const k=kit(),c=o.c||C.oak;k.box(-2,0,-2,2,13,2,c);k.box(-3,14,-3,3,14,3,C.oakL);k.box(-2,15,-2,2,15,2,c);k.put(0,16,0,C.oakL);
  for(const y of[3,10])k.box(-3,y,-3,3,y,3,C.oakL);return{V:k.V,size:[.8,1.95,.8]}});
def('beam',{label:'Oak ceiling beam (o.len for one long timber)',room:'Below stairs, cottages, the inn',tile:[9,0],hang:true,ceiling:true},o=>{const k=kit(),n=nOf(o.len,1),x0=-Math.floor(n/2),x1=x0+n-1;k.box(x0,-5,-2,x1,0,2,C.oak);for(let x=x0;x<=x1;x+=3)k.put(x,-5,2,C.wal);return{V:k.V,size:[n*U,.7,.5],anchor:'ceiling'}});

/* ---------- quad budget: the same looks with far fewer faces (pattern goes to texture where the surface is flat) ---------- */
const BOOKS=PROPS.books,rng=PROPS.rng;
def('sash',{label:'Sash window with shutters and curtains (budget mesh)',room:'State rooms',act:'open curtains',wall:true},o=>{const k=kit(),W=8,H=o.ph?Math.round(o.ph*8.7)-2:42,sh=H!==42,m1=sh?Math.round(H/2):21,cu=o.c||C.damask;   /* v1.57: ph, the panes' height in blocks, for a window shorter than five (the attic rooms): the sash is made to the opening, with a plain low pelmet, and no longer runs up into the ceiling */
  for(let x=-W;x<=W;x++)for(let y=0;y<=H;y++){const fr=Math.abs(x)===W||y===0||y===H||y===m1||x===0;k.put(x,y+8,0,fr?C.white:C.glass)}k.box(-W-1,6,0,W+1,7,2,C.white);
  for(const s of[-1,1])for(let d=0;d<4;d++){const x=s*(W+1+d),z=1+(d%2);for(let y=0;y<=H+(sh?2:4);y++)k.put(x,y+6,z,cu,'door')}if(sh)k.box(-W-5,H+9,1,W+5,H+10,2,C.white);else k.box(-W-5,H+11,1,W+5,H+13,2,C.gilt);return{V:k.V,size:[2.8,sh?(H+11)/8.7:7,.3],anchor:'wall'}});
def('rug',{label:'Turkey rug (budget mesh; field takes the carpet texture)',room:'State rooms',act:'none'},o=>{const k=kit(),W=o.w||16,L=o.l||22,f=o.c||C.damask,b=o.c2||C.blue;
  for(let x=-W;x<=W;x++)for(let z=-L;z<=L;z++){const e=Math.min(W-Math.abs(x),L-Math.abs(z));const m=Math.min(Math.max(0,6-Math.abs(x)),Math.max(0,9-Math.abs(z)));
    let c=e===0?C.cream:e<=2?b:e===3?C.gold:f;if(e>3&&Math.abs(x)<=6&&Math.abs(z)<=9)c=m>=5?b:m>=3?C.gold:m>=1?b:f;k.put(x,0,z,c)}
  if(o.fringe!==false)for(let x=-W;x<=W;x++){k.put(x,0,-L-1,C.cream);k.put(x,0,L+1,C.cream)}return{V:k.V,size:[(2*W+1)/8.7,.1,(2*L+3)/8.7],tex:{face:'top',name:'carpet',c:f,c2:b}}});
def('wineRack',{label:'Wine bins (budget mesh)',room:'Wine Cellar',act:'touch'},o=>{const k=kit(),W=o.w||12;
  k.box(-W,0,-3,W,24,-3,C.stoneD);for(let y=0;y<=24;y+=6)k.box(-W,y,-2,W,y,2,C.stone);for(let x=-W;x<=W;x+=6)k.box(x,0,-2,x,24,2,C.stone);
  let i=0;for(let bx=-W;bx<W;bx+=6)for(let by=0;by<24;by+=6){i++;if(i%5===0)continue;k.box(bx+1,by+1,0,bx+5,by+5,1,i%2?'#2a3a1e':'#3a1018')}return{V:k.V,size:[(2*W+1)/8.7,2.8,.7]}});
def('bookcase',{label:'Library bookcase (budget mesh; spines take a texture)',room:'Double Library, Business Room',act:'touch: toolkits and docs'},o=>{const k=kit(),W=o.w||12,H=o.h||40,r=rng(o.seed||11),wd=o.wood||C.wal;
  k.box(-W,0,-3,W,H,-3,wd);k.box(-W,0,-3,-W,H,2,wd);k.box(W,0,-3,W,H,2,wd);k.box(-W-1,H+1,-3,W+1,H+2,3,wd);k.box(-W,0,-2,W,2,2,wd);
  for(let s=3;s<H-1;s+=9){k.box(-W+1,s,-2,W-1,s,2,wd);let x=-W+1;while(x<=W-1){const n=3+Math.floor(r()*4),h=5+Math.floor(r()*3),c=BOOKS[Math.floor(r()*BOOKS.length)];const x2=Math.min(W-1,x+n-1);k.box(x,s+1,-2,x2,s+h,1,c);x=x2+1+(r()<.15?1:0)}}
  k.box(-W,H+2,3,W,H+2,3,C.gilt);return{V:k.V,size:[(2*W+1)/8.7,(H+3)/8.7,.7],tex:{face:'front',name:'spines'}}});
def('tableDining',{label:'State dining table, laid (budget mesh)',room:'State Dining Room, Servants\' Hall (plain)',act:'touch: today'},o=>{const k=kit(),L=o.len||40,wd=o.wood||C.mah,laid=o.laid!==false;
  k.box(-7,9,-L,7,9,L,wd);k.box(-6,8,-L+1,6,8,L-1,wd);for(let z=-L+4;z<=L-4;z+=Math.max(8,Math.floor(L/3))){k.box(-1,0,z-1,1,7,z+1,wd);k.box(-4,0,z-3,4,1,z+3,wd)}
  if(laid){k.box(-5,10,-L+1,5,10,L-1,C.white);
    for(let z=-L+8;z<=L-8;z+=12){k.box(0,11,z,0,15,z,C.brass);k.box(-2,15,z,2,15,z,C.brass);for(const x of[-2,0,2]){k.put(x,16,z,C.white);k.put(x,17,z,C.flame,'flame')}}}
  return{V:k.V,size:[1.7,1.2,(2*L+1)/8.7]}});
})(typeof PROPS!=='undefined'?PROPS:require('./props.js'));
