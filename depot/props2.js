/* =========================================================
   Euphrates Hall Parts Depot: props2.js (batch 2, Nov 12, 2026)
   The small things, house colours, the wings, the stables, the gardens and the villages.
   Load after props.js. Same format and units: furniture on the people's grid (unit .115),
   origin at floor centre, front faces +z. o.house picks a house palette where it applies.
   ========================================================= */
(function(P){const{def,kit,rng,blob,trunk,limb,TREE,colors:C,books:BOOKS}=P;
const HOUSE={gold:['#C9A227','#7a5c12'],silver:['#C0C7CF','#6b737c'],white:['#F4F1EA','#b8ad92'],copper:['#B87333','#6b3e18'],blue:['#2E5E9E','#183257'],
 yellow:['#E3B23C','#8a6a1c'],green:['#3FA34D','#1f5a28'],violet:['#7B4FA0','#43285c'],orange:['#E07A1F','#7a3e0c'],grey:['#7D8287','#43474b'],
 obsidian:['#1B1B1F','#4a4a52'],brown:['#7A5230','#43301c'],pink:['#E8A0B4','#9a5a6a'],red:['#A4161A','#5a0c0e']};
P.houses=HOUSE;const hc=(o,i=0,d)=>o.house&&HOUSE[o.house]?HOUSE[o.house][i]:(d||C.damask);
const FLOW=['#c0262b','#e8a0b4','#f4f1ea','#e3b23c','#7b4fa0','#d9531c'];

/* ---------------- the small things (table-top and shelf scale) ---------------- */
def('bookStack',{label:'Stack of books',room:'Library tables, desks, bedside',act:'read',small:true},o=>{const k=kit(),r=rng(o.seed||4);let y=0;
  for(let i=0;i<(o.n||4);i++){const w=2+Math.floor(r()*2),d=3+Math.floor(r()*1),c=BOOKS[Math.floor(r()*BOOKS.length)],dx=Math.floor(r()*2)-1;k.box(-w+dx,y,-d,w+dx,y+1,d,c);k.box(-w+dx+1,y,d,w+dx,y+1,d,C.paper);y+=2}
  return{V:k.V,size:[.6,y/8.7,.8]}});
def('teaSet',{label:'Tea service on a tray',room:'Morning Room, Drawing Room, Saloon',act:'take tea',small:true},o=>{const k=kit();
  k.box(-6,0,-4,6,0,4,C.brass);k.box(-6,1,-4,6,1,-4,C.brass);k.box(-6,1,4,6,1,4,C.brass);for(let y=1;y<=5;y++)k.ring(-2,y,0,y<5?2:1,C.white);k.box(-2,6,0,-2,6,0,C.gilt);k.box(0,3,0,1,3,0,C.white);
  for(const[x,z]of[[3,-2],[3,2],[-5,2]]){k.ring(x,1,z,1,C.white);k.put(x,1,z,'#8a4a1c');k.put(x+1,2,z,C.white)}k.box(4,1,0,5,3,0,C.white);return{V:k.V,size:[1.5,.8,1]}});
def('letterTray',{label:'Letter tray and inkstand',room:'Every desk',act:'touch: the tray of drafts',small:true},o=>{const k=kit();
  k.box(-5,0,-3,0,1,3,C.leather);k.box(-4,2,-2,-1,2,2,C.paper,'face');k.box(-4,3,-1,-1,3,1,C.cream,'face');k.put(-2,4,0,C.damask);
  k.box(2,0,-2,5,0,2,C.brass);k.box(2,1,-1,2,3,-1,C.ebony);k.box(4,1,-1,4,2,-1,C.ebony);for(let y=2;y<=6;y++)k.put(3,y,1,y>4?C.white:C.ebony);return{V:k.V,size:[1.2,.8,.7]}});
def('vaseFlowers',{label:'Vase of flowers',room:'Saloon, Morning Room, bedrooms',act:'none',small:true},o=>{const k=kit(),r=rng(o.seed||6),v=o.c||C.blue;
  for(let y=0;y<=6;y++)k.ring(0,y,0,y<1?1:y<5?2:1,v);k.put(0,0,0,v);for(let i=0;i<22;i++){const a=r()*6.28,rr=r()*3.2,x=Math.round(Math.cos(a)*rr),z=Math.round(Math.sin(a)*rr),h=8+Math.floor(r()*5);
    for(let y=6;y<h;y++)if(r()<.5)k.put(Math.round(x*(y-6)/(h-6)),y,Math.round(z*(y-6)/(h-6)),'#3f6b33','leaf');k.put(x,h,z,FLOW[Math.floor(r()*FLOW.length)],'leaf')}return{V:k.V,size:[.8,1.6,.8]}});
def('fruitBowl',{label:'Fruit bowl (apples, pears, grapes)',room:'Dining room sideboard, kitchen table',act:'none',small:true},o=>{const k=kit(),r=rng(o.seed||8);
  k.disc(0,0,0,1,C.white);k.ring(0,1,0,3,C.white);k.ring(0,2,0,4,C.white);const F=['#c0262b','#9fbf4a','#5a2a5a','#e3b23c'];for(let i=0;i<14;i++){const x=Math.round((r()-.5)*6),z=Math.round((r()-.5)*6);if(x*x+z*z>12)continue;k.put(x,2+Math.floor(r()*2),z,F[Math.floor(r()*4)])}
  return{V:k.V,size:[1,.5,1]}});
def('gramophone',{label:'Gramophone',room:'Music Room, Drawing Room',act:'play',small:true},o=>{const k=kit();
  k.box(-4,0,-4,4,5,4,C.mah);k.disc(0,6,0,3,C.black,'face');k.put(0,7,0,C.gilt);k.box(3,6,3,3,8,3,C.brass);for(let s=0;s<10;s++){const r=1+Math.floor(s/2.2);const y=9+s,z=3-s;k.ring(3,y,z,r,s>6?C.gilt:C.brass)}return{V:k.V,size:[1,2.3,1.5]}});
def('harp',{label:'Concert harp',room:'Music Room, Ballroom',act:'play'},o=>{const k=kit();
  k.box(-2,0,-2,2,2,2,C.gilt);for(let y=3;y<=34;y++)k.put(0,y,-2+Math.round((y-3)*.25),C.gilt);for(let s=0;s<=10;s++){const y=34-Math.round(s*1.2);k.put(0,y,6+s,C.gilt)}
  for(let z=-1;z<=6;z++)for(let y=3;y<=30;y++){const zz=Math.round((y-3)*.25)-2;if(z<=zz)continue;if(y+Math.round(z*0.3)>33)continue;if(z%2===0)k.put(0,y,z,'#efe6cf')}
  k.box(0,30,0,0,34,6,C.gilt);return{V:k.V,size:[.6,4,2]}});
def('suitArmor',{label:'Suit of armour on a plinth',room:'Great Hall, Entrance Hall, Long Gallery',act:'look'},o=>{const k=kit(),s='#b8bcc4',d='#7d8287';
  k.box(-4,0,-3,4,3,3,C.oak);k.box(-2,4,-1,-1,13,1,s);k.box(1,4,-1,2,13,1,s);k.box(-2,4,-1,-1,5,2,d);k.box(1,4,-1,2,5,2,d);k.box(-3,14,-2,3,22,2,s);k.box(-3,20,-2,3,21,2,d);
  k.box(-4,15,-1,-4,22,1,s);k.box(4,15,-1,4,22,1,s);k.box(-5,21,-1,-4,22,1,d);k.box(4,21,-1,5,22,1,d);k.box(-2,23,-2,2,27,2,s);k.box(-2,25,2,2,25,2,C.black);k.put(0,28,0,hc(o,0,C.damask));k.put(0,29,-1,hc(o,0,C.damask));
  k.box(5,4,1,5,30,1,C.wal);k.box(5,30,0,5,33,2,s);return{V:k.V,size:[1.2,3.9,.8]}});
def('banner',{label:'House banner',room:'Great Hall, Saloon gallery, each house\'s rooms',act:'look',wall:true},o=>{const k=kit(),c=hc(o,0,C.damask),d=hc(o,1,C.damaskD),W=6,H=26;
  k.box(-W-1,H+4,1,W+1,H+4,1,C.brass);k.put(-W-2,H+4,1,C.gold);k.put(W+2,H+4,1,C.gold);
  for(let x=-W;x<=W;x++)for(let y=0;y<=H;y++){const tip=y<6&&Math.abs(x)>y;if(tip)continue;const edge=Math.abs(x)===W||y===H;let col=edge?C.gilt:c;
    if(!edge&&y>=H-14&&y<=H-4&&Math.abs(x)<=4){const ring=Math.abs(Math.hypot(x,y-(H-9))-3.5)<.8;if(ring||(x===0&&Math.abs(y-(H-9))<2))col=C.gold}else if(!edge&&(y===8||y===9))col=d;k.put(x,y+6,0,col,'face')}
  return{V:k.V,size:[1.7,4,.2],anchor:'wall'}});
def('coatOfArms',{label:'Coat of arms over the fireplace',room:'Great Hall, Saloon',act:'look',wall:true},o=>{const k=kit(),c=hc(o,0,C.damask);
  for(let x=-7;x<=7;x++)for(let y=0;y<=16;y++){const w=y<6?Math.round(7*(y/6)):7;if(Math.abs(x)>w)continue;const edge=Math.abs(x)===w||y===16;k.put(x,y,0,edge?C.gilt:((x>0)===(y>8)?c:C.white),'face')}
  for(const s of[-1,1])for(let y=2;y<=18;y++){k.put(s*(9+Math.round(Math.sin(y/3))),y,1,C.gilt)}for(let x=-3;x<=3;x++)k.put(x,18,0,C.gold);k.box(-1,19,0,1,20,0,C.gold);return{V:k.V,size:[2.2,2.4,.2],anchor:'wall'}});
def('antlers',{label:'Stag antlers on a shield',room:'Great Hall, Gun Room, Billiard Room',act:'none',wall:true},o=>{const k=kit(),a='#d8c9a0';
  k.box(-2,0,0,2,4,0,C.oak);k.box(-1,5,0,1,6,1,'#5b3a22');for(const s of[-1,1]){for(let i=0;i<10;i++)k.put(s*(1+i),5+Math.round(i*.9),1+Math.floor(i/4),a);for(const t of[3,6,9])for(let j=1;j<=3;j++)k.put(s*(1+t),5+Math.round(t*.9)+j,1+Math.floor(t/4),a)}
  return{V:k.V,size:[2.4,1.9,.3],anchor:'wall'}});
def('tapestry',{label:'Tapestry (a hunt in the park)',room:'Great Hall, Long Gallery, stair walls',act:'look',wall:true},o=>{const k=kit(),r=rng(o.seed||12),W=o.w||14,H=o.h||22;
  for(let x=-W;x<=W;x++)for(let y=0;y<=H;y++){let c;const e=Math.min(W-Math.abs(x),y,H-y);if(e===0)c='#5a3a22';else if(e<=2)c=(x+y)%3?'#7a1f2a':C.gold;
    else{const sky=y>H*.62,hill=y<H*.3+Math.sin(x/4)*2;c=sky?(r()<.1?'#d8d0b8':'#9fb3bf'):hill?(r()<.3?'#4a5a2a':'#5a6b33'):(r()<.2?'#6b7a3a':'#7a8a4a');
      const tx=Math.round(Math.sin(x*1.7)*3);if(!sky&&Math.abs(x%7)===0&&y<H*.62&&y>H*.3+tx)c='#3a2a1e';if(Math.abs(x-3)<=2&&Math.abs(y-H*.42)<=1)c='#a8703f';if(x===5&&y>H*.42&&y<H*.42+3)c='#d8c9a0'}
    k.put(x,y+20,0,c,'face')}k.box(-W-1,H+21,1,W+1,H+21,1,C.wal);return{V:k.V,size:[(2*W+3)/8.7,(H+22)/8.7,.2],anchor:'wall'}});
def('bust',{label:'Marble bust on a column',room:'Library, Long Gallery, Entrance Hall',act:'look'},o=>{const k=kit(),m=C.marble,v=C.marbleV,d='#a9a294';
  /* v1.55: a head with hair, a brow, eyes, a nose and a mouth on draped shoulders, on a fluted column with a base and a cap (it was a banded post with a blank block: the "blank grey statues" of the halls) */
  k.box(-3,0,-3,3,1,3,m);k.box(-2,2,-2,2,2,2,v);for(let y=3;y<=17;y++)for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){if(Math.abs(x)===2&&Math.abs(z)===2)continue;if(Math.abs(x)<2&&Math.abs(z)<2)continue;k.put(x,y,z,(x+z)%2?v:m)}
  k.box(-2,18,-2,2,18,2,v);k.box(-3,19,-3,3,20,3,m);
  k.box(-3,21,-2,3,22,2,m);k.box(-4,22,-1,4,23,1,m);k.box(-3,23,-2,3,24,2,m);for(const x of[-3,-1,1,3])k.put(x,21,2,v);for(let i=0;i<4;i++){k.put(-3+i,24-i,3,v);k.put(3-i,24-i,3,v)}
  k.box(-1,25,-1,1,25,1,m);k.box(-2,26,-2,2,30,2,m);k.box(-2,31,-2,2,31,2,v);k.box(-2,27,-3,2,31,-3,v);k.box(-2,29,-2,-2,30,-1,v);k.box(2,29,-2,2,30,-1,v);
  k.box(-2,30,3,2,30,3,v);k.put(-1,29,3,d);k.put(1,29,3,d);k.box(0,27,3,0,28,3,m);k.put(0,28,4,m);k.box(-1,26,3,1,26,3,d);return{V:k.V,size:[.8,3.6,.8]}});
def('birdcage',{label:'Birdcage on a stand',room:'Morning Room, Orangery',act:'none'},o=>{const k=kit();
  k.disc(0,0,0,2,C.brass);k.box(0,1,0,0,16,0,C.brass);for(let y=17;y<=25;y++)for(let a=0;a<12;a++){const t=a/12*6.28,r=y>23?4-(y-23)*1.5:4;if(a%2||y===17||y===20)k.put(Math.round(Math.cos(t)*r),y,Math.round(Math.sin(t)*r),C.brass)}
  k.put(0,26,0,C.gold);k.put(0,20,0,'#e3b23c');k.put(0,21,0,'#e3b23c');k.put(1,21,0,'#d9531c');return{V:k.V,size:[1,3.1,1]}});
def('fern',{label:'Fern on a stand',room:'Saloon, Orangery, conservatory corners',act:'none'},o=>{const k=kit(),r=rng(o.seed||14);
  k.box(-1,0,-1,1,9,1,C.wal);k.disc(0,10,0,3,C.wal);for(let y=11;y<=14;y++)k.ring(0,y,0,3,'#b06a3a');for(let a=0;a<11;a++){const t=a/11*6.28+r();for(let s=1;s<=8;s++){const y=15+Math.round(3-((s-3)*(s-3))/4);k.put(Math.round(Math.cos(t)*s),y,Math.round(Math.sin(t)*s),s%2?'#4a8a3a':'#3f6b33','leaf')}}
  return{V:k.V,size:[2,2.2,2]}});
def('screen',{label:'Folding screen',room:'Bedrooms, Convalescent Ward, dressing room',act:'move'},o=>{const k=kit(),c=o.c||'#2f4a6e';
  for(let p=0;p<4;p++){const x0=-12+p*6,z=(p%2)*3;for(let x=x0;x<x0+6;x++){const zz=(p%2)?z-Math.round((x-x0)/2):Math.round((x-x0)/2);for(let y=0;y<=24;y++)k.put(x,y,zz,(x===x0||y===0||y===24)?C.mah:(y>3?c:C.mah))}}return{V:k.V,size:[2.8,2.9,.5]}});

/* ---------------- the wings, the nursery, the ward, the laboratory ---------------- */
def('wardBed',{label:'Ward bed with screen rail',room:'Convalescent Ward',act:'lie down'},o=>{const k=kit(),W=5,L=14;
  for(const[x,z]of[[-W,-L],[W,-L],[-W,L],[W,L]])k.box(x,0,z,x,10,z,C.white);k.box(-W,5,-L,W,5,L,C.white);k.box(-W+1,6,-L+1,W-1,7,L-1,C.white,'seat');k.box(-W+1,8,-L+1,W-1,8,L-4,'#bcc8d4','seat');k.box(-W+1,8,L-3,W-1,9,L-1,C.white);
  k.box(-W,10,L,W,10,L,C.white);k.box(-W,10,-L,W,10,-L,C.white);k.box(-W,8,L+1,-W+2,13,L+1,C.slate,'face');return{V:k.V,size:[1.3,1.6,3.3]}});
def('labBench',{label:'Laboratory bench with glassware',room:'The Laboratory',act:'touch: the evidence'},o=>{const k=kit(),L=o.len||16;
  k.box(-5,0,-L,5,9,L,C.oak);for(let z=-L+2;z<=L-2;z+=5)k.box(-5,2,z,-5,7,z+3,C.oakL,'door');k.box(-6,10,-L,6,10,L,C.slate);
  for(let z=-L+3;z<=L-3;z+=6){k.ring(0,11,z,1,C.glass);k.box(0,12,z,0,14,z,C.glass);k.put(0,11,z,'#3fa34d')}k.box(-4,11,-3,-3,15,-3,C.brass);k.box(-4,15,-3,-4,15,-1,C.brass);k.box(-4,11,-1,-4,13,-1,C.ebony);
  k.box(3,11,4,4,11,5,C.brass);k.box(3,12,4,3,16,4,C.brass);k.put(3,17,5,C.flame,'flame');return{V:k.V,size:[1.4,2.1,(2*L+1)/8.7]}});
def('microscope',{label:'Brass microscope',room:'The Laboratory',act:'look',small:true},o=>{const k=kit();k.box(-2,0,-2,2,0,2,C.black);k.box(0,1,-1,0,6,-1,C.brass);k.box(-1,4,0,1,4,1,C.black);for(let y=6;y<=12;y++)k.put(0,y,Math.round((y-6)*.3),C.brass);k.put(0,13,2,C.black);return{V:k.V,size:[.5,1.6,.5]}});
def('rockingHorse',{label:'Rocking horse',room:'Day Nursery',act:'ride'},o=>{const k=kit();
  for(let z=-8;z<=8;z++){const y=Math.round((z*z)/16);k.put(-3,y,z,C.mah);k.put(3,y,z,C.mah)}for(const z of[-5,5]){k.box(-3,3,z,-3,8,z,'#f1ede4');k.box(3,3,z,3,8,z,'#f1ede4')}
  k.box(-2,9,-6,2,13,6,'#f1ede4');for(const[x,z]of[[0,-2],[1,3],[-1,1],[0,5]])k.put(x,13,z,'#3a3230');k.box(-1,12,6,1,18,8,'#f1ede4');k.box(-1,16,9,1,18,11,'#f1ede4');for(let y=12;y<=18;y++)k.put(0,y+1,6,'#3a3230');
  k.box(-2,14,-1,2,14,2,C.damask,'seat');k.put(-1,17,10,C.black);k.put(1,17,10,C.black);return{V:k.V,size:[.9,2.2,2.2]}});
def('toyFort',{label:'Toy fort with soldiers',room:'Day Nursery',act:'play',small:true},o=>{const k=kit();
  k.box(-8,0,-8,8,1,8,'#5a6b33');for(const[x,z]of[[-8,-8],[8,-8],[-8,8],[8,8]])k.box(x-1,0,z-1,x+1,8,z+1,C.stone);for(let x=-7;x<=7;x++){k.box(x,2,-8,x,5,-8,C.stone);k.box(x,2,8,x,5,8,C.stone);if(x%2)k.put(x,6,-8,C.stone)}
  for(let z=-7;z<=7;z++){k.box(-8,2,z,-8,5,z,C.stone);k.box(8,2,z,8,5,z,C.stone)}k.del(-1,2,8,1,4,8);for(let i=-3;i<=3;i+=2){k.box(i,2,10,i,4,10,'#c0262b');k.put(i,5,10,C.black)}k.box(0,6,0,0,12,0,C.wal);k.box(1,10,0,3,12,0,'#2e5e9e');
  return{V:k.V,size:[2,1.5,2.3]}});
def('sewingMachine',{label:'Sewing machine on a treadle table',room:'Sewing Room',act:'use'},o=>{const k=kit();
  k.box(-6,0,-3,-6,8,3,C.iron);k.box(6,0,-3,6,8,3,C.iron);k.box(-5,1,-2,5,1,2,C.iron);k.box(-7,9,-4,7,9,4,C.oak);k.box(-4,10,-1,3,11,1,C.black);k.box(2,12,-1,3,15,1,C.black);k.box(-4,16,-1,3,17,1,C.black);k.box(-4,12,-1,-4,13,0,C.black);
  k.put(-1,16,2,C.gold);k.put(1,16,2,C.gold);k.ring(4,13,0,2,C.ironL);return{V:k.V,size:[1.7,2.1,1]}});
def('mangle',{label:'Laundry mangle',room:'The Laundry',act:'use'},o=>{const k=kit();
  k.box(-6,0,-3,-5,18,3,C.iron);k.box(5,0,-3,6,18,3,C.iron);for(const y of[10,14])for(let x=-4;x<=4;x++)k.ring(x,y,0,0,'#d8c49a'),k.box(x,y-1,-1,x,y+1,1,'#d8c49a');k.ring(7,15,0,4,C.iron);k.box(7,15,0,7,15,0,C.iron);
  k.box(-5,6,-5,5,6,-3,C.oakL);return{V:k.V,size:[2,2.4,1.2]}});
def('ironingTable',{label:'Ironing table with sad irons',room:'The Laundry',act:'use'},o=>{const k=kit(),L=14;
  k.box(-4,0,-L+2,-4,8,-L+2,C.oak);k.box(4,0,-L+2,4,8,-L+2,C.oak);k.box(-4,0,L-2,-4,8,L-2,C.oak);k.box(4,0,L-2,4,8,L-2,C.oak);k.box(-5,9,-L,5,9,L,C.white);
  for(const z of[-4,4]){k.box(-1,10,z-1,1,11,z+2,C.iron);k.box(0,12,z,0,12,z+1,C.iron)}k.box(-4,10,6,4,10,12,'#bcc8d4');return{V:k.V,size:[1.3,1.4,3.3]}});
def('welshDresser',{label:'Kitchen dresser with plates and coppers',room:'The Kitchen, Servants\' Hall',act:'touch'},o=>{const k=kit(),W=12;
  k.box(-W,0,-3,W,9,3,C.oakL);for(const x of[-8,0,8])k.box(x-3,2,4,x+3,7,4,C.oak,'door');k.box(-W,10,-3,W,10,4,'#d8c49a');k.box(-W,11,-3,W,32,-3,C.oakL);k.box(-W,11,-3,-W,32,0,C.oakL);k.box(W,11,-3,W,32,0,C.oakL);
  for(const y of[17,24,31])k.box(-W,y,-2,W,y,0,C.oakL);for(let x=-W+2;x<=W-2;x+=3){for(const y of[18,25]){k.box(x,y,-2,x+1,y+4,-2,(x/3)%2?'#2e5e9e':C.white,'face');k.put(x,y+2,-1,C.white)}}
  for(let x=-W+2;x<=W-2;x+=4){k.ring(x,12,0,1,C.copper);k.box(x,13,0,x,14,0,C.copper)}k.box(-W-1,33,-4,W+1,34,1,C.oakL);return{V:k.V,size:[2.9,4,.9]}});
def('copperRack',{label:'Rack of copper pans',room:'The Kitchen',act:'none',wall:true,hang:true},o=>{const k=kit(),W=12;
  k.box(-W,24,0,W,24,1,C.iron);for(let x=-W+2;x<=W-2;x+=4){const r=1+(x%3===0?1:0)+(x>0?1:0);k.box(x,20,1,x,23,1,C.copper);
    for(let dx=-r;dx<=r;dx++)for(let y=19-r*2;y<=19;y++)k.put(x+dx,y,1+(Math.abs(dx)<r?0:0),'#c98a4a')}return{V:k.V,size:[2.9,2.8,.3],anchor:'wall'}});

/* ---------------- the theatre and the ballroom ---------------- */
def('stageCurtain',{label:'Stage proscenium and curtains',room:'The Private Theatre',act:'open the curtains',wall:true},o=>{const k=kit(),W=30,H=48;
  for(let x=-W-4;x<=W+4;x++)for(let y=0;y<=H+8;y++){const frame=Math.abs(x)>W||y>H;if(!frame)continue;k.put(x,y,0,(y>H+5||Math.abs(x)>W+2)?C.gilt:'#7a1f2a')}
  for(const s of[-1,1])for(let x=0;x<W-4;x++)for(let y=0;y<=H;y++){const xx=s*(W-x);if(x>W*.5-((H-y)*.12))continue;k.put(xx,y,1,(xx+y)%5?'#9c1f2a':'#7a1820','door')}
  for(let x=-W;x<=W;x++)for(let y=H-6;y<=H;y++)k.put(x,y,1,(y===H-6&&x%3===0)?C.gold:'#9c1f2a');return{V:k.V,size:[7.8,6.6,.3],anchor:'wall'}});
def('seatRow',{label:'Row of theatre seats',room:'The Private Theatre',act:'sit'},o=>{const k=kit(),n=o.n||6;
  for(let i=0;i<n;i++){const x=-(n*5)/2+i*5+2;k.box(x-2,0,-2,x+2,4,2,C.mah);k.box(x-1,5,-1,x+1,5,2,'#9c1f2a','seat');k.box(x-2,6,-2,x+2,12,-2,'#9c1f2a');k.box(x-2,5,-2,x-2,8,2,C.mah)}return{V:k.V,size:[(n*5)/8.7,1.5,.6]}});
def('musicStand',{label:'Music stand',room:'Music Room, Ballroom gallery',act:'none',small:true},o=>{const k=kit();for(const a of[0,2.1,4.2])for(let s=0;s<4;s++)k.put(Math.round(Math.cos(a)*s),0,Math.round(Math.sin(a)*s),C.brass);k.box(0,1,0,0,13,0,C.brass);k.box(-4,14,0,4,18,0,C.brass);k.box(-3,15,1,3,18,1,C.paper,'face');return{V:k.V,size:[1,2.2,.9]}});
def('cardTable',{label:'Card table, cards dealt',room:'Card Room',act:'play'},o=>{const k=kit();k.box(-1,0,-1,1,7,1,C.mah);k.box(-4,0,-4,4,0,4,C.mah);k.box(-6,8,-6,6,8,6,C.mah);k.box(-5,9,-5,5,9,5,C.baize);
  for(const[x,z]of[[0,-4],[0,4],[-4,0],[4,0]]){k.put(x,10,z,C.white,'face');k.put(x+(z?1:0),10,z+(x?1:0),C.white,'face')}k.box(-1,10,-1,0,11,0,'#7a1f2a');return{V:k.V,size:[1.5,1.2,1.5]}});

/* ---------------- the chapel and the crypt ---------------- */
def('lectern',{label:'Eagle lectern',room:'Chapel',act:'read'},o=>{const k=kit();k.disc(0,0,0,4,C.brass);k.disc(0,1,0,3,C.brass);for(const[x,z]of[[4,0],[-2,3],[-2,-3]])k.put(x,0,z,C.gold);for(let y=2;y<=16;y++)k.ring(0,y,0,1,C.brass);k.disc(0,8,0,2,C.gold);k.disc(0,15,0,2,C.gold);
  /* v1.55: an eagle with a head, a beak and spread wings on a knopped stem with three feet (it was a stick with a slab) */
  k.box(-3,17,-2,3,18,3,C.brass);k.box(-1,19,3,1,20,5,C.brass);k.box(-1,21,4,0,22,5,C.brass);k.put(0,21,6,C.gold);k.put(-1,21,6,C.gold);k.put(-1,22,5,C.ebony);for(const s of[-1,1]){k.box(s*4,18,-1,s*5,19,2,C.brass);k.box(s*6,19,-1,s*6,20,1,C.brass);k.put(s*7,20,0,C.gold)}
  k.box(-3,19,-2,3,19,2,C.damask);k.box(-3,20,-2,3,20,2,C.paper,'face');return{V:k.V,size:[1.2,2.4,1]}});
def('candleStand',{label:'Candle stand',room:'Chapel, crypt',act:'light'},o=>{const k=kit();k.disc(0,0,0,3,C.brass);k.box(0,1,0,0,12,0,C.brass);k.disc(0,13,0,4,C.brass);const r=rng(3);for(let i=0;i<9;i++){const a=i/9*6.28;const x=Math.round(Math.cos(a)*3),z=Math.round(Math.sin(a)*3);const h=1+Math.floor(r()*3);k.box(x,14,z,x,13+h,z,C.white);k.put(x,14+h,z,C.flame,'flame')}
  return{V:k.V,size:[1,2,1]}});
def('studyTable',{label:'Crypt study table',room:'Chapel crypt (the Pardes)',act:'touch: the Pardes journal'},o=>{const k=kit();
  k.box(-9,0,-5,-8,8,-4,C.ebony);k.box(8,0,-5,9,8,-4,C.ebony);k.box(-9,0,4,-8,8,5,C.ebony);k.box(8,0,4,9,8,5,C.ebony);k.box(-10,9,-6,10,9,6,C.ebony);
  k.box(-6,10,-3,0,10,3,C.paper,'face');k.box(-6,10,0,0,11,0,C.leather);k.box(2,10,-3,6,13,-2,C.leather);k.box(5,10,2,5,13,2,C.white);k.put(5,14,2,C.flame,'flame');return{V:k.V,size:[2.4,1.7,1.5]}});

/* ---------------- stables, forge and yard ---------------- */
def('stableStall',{label:'Horse stall with a hay rack and a bucket',room:'Stable Court',act:'lead a horse'},o=>{const k=kit(),W=14,L=22,H=12,hay='#c9b88a',hay2='#d8c070';
  /* v1.57 (His Grace's photo of the Stalls): a low boarded partition each side, one and a half blocks high, with a capping rail and a post at each end; a boarded back with a hay rack; a bucket by the front post; straw. The iron bars every third voxel (a jagged black comb) and the name board that hung in the air over the open front are gone */
  for(const x of[-W,W]){const xi=x<0?x+1:x-1;for(let z=-L;z<=L;z++)for(let y=0;y<=H;y++)k.put(x,y,z,(z+L)%4===3?C.oak:C.oakL);k.box(x,H+1,-L,x,H+1,L,C.oak);
    for(const z of[-L,L-1]){k.box(Math.min(x,xi),0,z,Math.max(x,xi),H+4,z+1,C.oak);k.box(Math.min(x,xi),H+5,z,Math.max(x,xi),H+5,z+1,C.iron)}}
  for(let x=-W+1;x<W;x++)for(let y=0;y<=H;y++)k.put(x,y,-L,(x+W)%4===3?C.oak:C.oakL);k.box(-W+1,H+1,-L,W-1,H+1,-L,C.oak);
  k.box(-7,6,-L+1,7,6,-L+3,C.iron);for(let x=-7;x<=7;x+=2){k.box(x,7,-L+3,x,9,-L+3,C.iron);k.box(x,10,-L+4,x,12,-L+4,C.iron)}k.box(-7,13,-L+4,7,13,-L+4,C.iron);
  for(let x=-6;x<=6;x++)for(let y=7;y<=13;y++){if((x*5+y*3)%7===0)continue;k.put(x,y,-L+1,hay);if(y>8)k.put(x,y,-L+2,(x+y)%3?hay2:hay);if(y>10&&(x+y)%2)k.put(x,y,-L+3,hay2)}
  for(let x=W-6;x<=W-3;x++)for(let z=L-8;z<=L-5;z++){const edge=(x===W-6||x===W-3)&&(z===L-8||z===L-5);if(edge)continue;for(let y=0;y<=4;y++){const rim=x===W-6||x===W-3||z===L-8||z===L-5;if(y===4&&!rim){k.put(x,3,z,'#6b8aa0');continue}if(rim||y===0)k.put(x,y,z,y===1||y===4?C.iron:'#8a6a3a')}}
  for(let x=-W+1;x<W;x++)for(let z=-L+1;z<L;z++)if((x*7+z*3)%5===0&&!k.V.has(x+',0,'+z))k.put(x,0,z,hay);return{V:k.V,size:[3.3,2,5.2]}});
def('saddleRack',{label:'Saddle rack and bridles',room:'Tack Room',act:'none',wall:true},o=>{const k=kit();
  for(const y of[8,20]){k.box(-1,y,0,1,y,6,C.oak);k.box(-3,y+1,1,3,y+3,5,C.leather);k.box(-3,y,1,-3,y-4,4,C.leather);k.box(3,y,1,3,y-4,4,C.leather);k.put(0,y+4,1,C.leatherL)}
  for(const x of[-8,8]){k.put(x,28,1,C.brass);for(let y=18;y<=27;y++)k.put(x+(y%3===0?1:0),y,1,C.leather)}return{V:k.V,size:[2,3.4,.8],anchor:'wall'}});
def('anvil',{label:'Anvil on its block, with tools',room:'The Forge',act:'strike'},o=>{const k=kit();
  k.box(-3,0,-3,3,6,3,C.oak);k.box(-2,7,-2,2,8,2,C.iron);k.box(-3,9,-4,3,11,4,C.iron);for(let z=5;z<=7;z++)k.box(-1,10,z,1,11-Math.floor((z-5)/2),z,C.iron);k.box(4,0,0,4,8,0,C.oak);k.box(4,9,-1,5,10,1,C.iron);return{V:k.V,size:[.9,1.3,1.4]}});
def('forgeHearth',{label:'Forge hearth with bellows',room:'The Forge',act:'light'},o=>{const k=kit();
  k.box(-8,0,-6,8,9,6,C.stoneD);k.box(-6,10,-4,6,10,4,C.black);k.box(-3,10,-2,3,11,2,'#d9531c','flame');k.box(-1,12,-1,1,12,1,C.flame,'flame');k.box(-4,10,-6,4,30,-4,C.stoneD);k.box(-6,22,-6,6,24,4,C.stone);
  k.box(9,4,-3,15,8,3,C.leather);k.box(9,9,-2,15,9,2,C.oak);k.box(16,8,0,20,8,0,C.oak);return{V:k.V,size:[3.3,3.5,1.5]}});
def('waterTrough',{label:'Stone water trough',room:'Stable Court, village square',act:'none'},o=>{const k=kit();k.box(-10,0,-4,10,6,4,C.stone);k.box(-9,3,-3,9,6,3,'#6b8aa0');k.del(-9,6,-3,9,6,3);return{V:k.V,size:[2.4,.8,1]}});
def('carriage',{label:'Town carriage',room:'Coach House, the drive',act:'board'},o=>{const k=kit(),c=hc(o,0,'#1e2a3a'),d=hc(o,1,'#14202e');
  for(const z of[-12,12]){const R=z>0?6:8;for(const x of[-9,9])for(let a=0;a<24;a++){const t=a/24*6.28;k.put(x,R+Math.round(Math.sin(t)*R),z+Math.round(Math.cos(t)*R),'#3a2a1e')}for(const x of[-9,9])k.put(x,R,z,C.brass)}
  k.box(-7,9,-14,7,11,10,d);k.box(-7,12,-10,7,26,6,c);k.box(-6,17,-9,-7,23,-2,C.glass);k.box(6,17,-9,7,23,-2,C.glass);k.box(-8,27,-11,8,27,7,C.black);k.box(-8,13,-2,-8,22,2,C.gilt,'door');
  k.box(-6,12,7,6,18,12,d);k.box(-5,19,9,5,19,12,C.leather,'seat');k.box(-1,10,13,1,10,22,C.oak);for(const s of[-1,1]){k.box(s*7,24,7,s*7,27,7,C.brass);k.put(s*7,28,7,C.flame,'flame')}
  return{V:k.V,size:[2.1,3.3,4]}});
def('cart',{label:'Farm cart',room:'Home Farm, village',act:'none'},o=>{const k=kit();
  for(const x of[-8,8])for(let a=0;a<20;a++){const t=a/20*6.28;k.put(x,7+Math.round(Math.sin(t)*7),Math.round(Math.cos(t)*7),C.oak)}k.box(-7,8,-10,7,9,10,C.oakL);for(const x of[-7,7])k.box(x,10,-10,x,13,10,C.oakL);k.box(-7,10,-10,7,13,-10,C.oakL);
  const r=rng(2);for(let x=-6;x<=6;x++)for(let z=-9;z<=9;z++)for(let y=10;y<=10+Math.floor(r()*4);y++)k.put(x,y,z,'#c9b88a');k.box(-4,6,11,-4,8,24,C.oak);k.box(4,6,11,4,8,24,C.oak);return{V:k.V,size:[2,1.9,3.9]}});
def('haystack',{label:'Haystack',room:'Home Farm',act:'none'},o=>{const k=kit(),r=rng(5);for(let y=0;y<=22;y++){const R=Math.round(12*Math.sqrt(Math.max(0,1-(y/23)**2.2)));for(let x=-R;x<=R;x++)for(let z=-R;z<=R;z++){const q=x*x+z*z;if(q>R*R||q<(R-2)*(R-2))continue;k.put(x,y,z,r()<.3?'#b89a5a':'#d8c07a')}}return{V:k.V,size:[2.8,2.6,2.8]}});
def('beehive',{label:'Straw bee skep on a stand',room:'Kitchen garden, orchard',act:'none'},o=>{const k=kit();k.box(-4,0,-4,-4,7,-4,C.oak);k.box(4,0,-4,4,7,-4,C.oak);k.box(-4,0,4,-4,7,4,C.oak);k.box(4,0,4,4,7,4,C.oak);k.box(-5,8,-5,5,8,5,C.oakL);
  for(let y=9;y<=18;y++){const R=Math.round(4*Math.sqrt(1-((y-9)/10)**2));k.ring(0,y,0,Math.max(0,R),y%2?'#c9a36a':'#b08a52')}k.put(0,9,4,C.black);return{V:k.V,size:[1.2,2.2,1.2]}});
def('wheelbarrow',{label:'Wheelbarrow',room:'Gardens',act:'none'},o=>{const k=kit();for(let a=0;a<14;a++){const t=a/14*6.28;k.put(0,3+Math.round(Math.sin(t)*3),9+Math.round(Math.cos(t)*3),C.iron)}k.box(-4,4,-4,4,8,6,C.oak);k.del(-3,6,-3,3,8,5);k.box(-3,4,-8,-3,5,-4,C.oak);k.box(3,4,-8,3,5,-4,C.oak);
  k.box(-3,0,-3,-3,3,-3,C.oak);k.box(3,0,-3,3,3,-3,C.oak);k.box(-2,6,-2,2,6,4,'#5a3a22');return{V:k.V,size:[1,1,2]}});
def('coldFrame',{label:'Cold frame with seedlings',room:'Kitchen garden',act:'none'},o=>{const k=kit();k.box(-10,0,-5,10,4,-5,C.oak);k.box(-10,0,5,10,2,5,C.oak);k.box(-10,0,-5,-10,4,5,C.oak);k.box(10,0,-5,10,4,5,C.oak);
  for(let x=-9;x<=9;x++)for(let z=-4;z<=4;z++){k.put(x,4-Math.round((z+4)/4),z,x%5===0?C.oakL:C.glass);if((x+z)%3===0)k.put(x,1,z,'#4a8a3a','leaf')}return{V:k.V,size:[2.4,.6,1.2]}});
def('well',{label:'Village well',room:'Village squares',act:'draw water'},o=>{const k=kit();for(let y=0;y<=7;y++)k.ring(0,y,0,6,y%2?C.stone:C.stoneD);k.disc(0,6,0,5,'#2a3a4a');k.box(-6,8,0,-6,20,0,C.oak);k.box(6,8,0,6,20,0,C.oak);k.box(-6,16,0,6,16,0,C.oak);
  for(let x=-8;x<=8;x++){const y=20+Math.round(4-Math.abs(x)/2);k.box(x,20,-3,x,y,3,x%2?'#7a3a22':'#6b3020')}k.box(0,10,0,0,15,0,'#c9a36a');k.box(-1,9,-1,1,10,1,C.oak);return{V:k.V,size:[1.6,2.9,1.6]}});
def('marketStall',{label:'Market stall with striped awning',room:'Village squares',act:'browse'},o=>{const k=kit(),c=o.c||'#a4161a',r=rng(o.seed||3);
  for(const[x,z]of[[-12,-5],[12,-5],[-12,5],[12,5]])k.box(x,0,z,x,22,z,C.oak);k.box(-12,9,-5,12,10,5,C.oakL);for(let x=-12;x<=12;x++)for(let z=-7;z<=6;z++){const y=24-Math.round((z+7)/3);k.put(x,y,z,(x+12)%4<2?c:C.white)}
  const G=['#c0262b','#9fbf4a','#e3b23c','#d9531c','#5a2a5a','#f4f1ea'];for(let x=-11;x<=11;x+=3)for(let z=-4;z<=4;z+=3){k.box(x,11,z,x+1,11,z+1,C.oak);k.put(x,12,z,G[Math.floor(r()*G.length)]);k.put(x+1,12,z+1,G[Math.floor(r()*G.length)])}
  return{V:k.V,size:[2.9,2.9,1.6]}});
def('innSign',{label:'Hanging inn sign',room:'Village inn',act:'none',wall:true},o=>{const k=kit();k.box(0,24,0,0,24,10,C.iron);k.box(0,25,1,0,25,9,C.iron);k.box(0,23,3,0,23,3,C.iron);k.box(0,23,8,0,23,8,C.iron);
  for(let y=10;y<=22;y++)for(let z=2;z<=9;z++){const e=y===10||y===22||z===2||z===9;k.put(0,y,z,e?C.gilt:'#2e5e9e','face')}for(let y=14;y<=18;y++)k.put(0,y,5,C.gold,'face');k.put(0,16,4,C.gold,'face');k.put(0,16,6,C.gold,'face');return{V:k.V,size:[.2,3,1.3],anchor:'wall'}});

/* ---------------- the gardens and the park ---------------- */
def('fountain',{label:'Fountain with three basins',room:'Parterre, forecourt',act:'none'},o=>{const k=kit(),R=o.r||22;
  for(let y=0;y<=4;y++)k.ring(0,y,0,R,y===4?C.stone:C.stoneD);k.disc(0,1,0,R-1,'#3a6a8a');k.disc(0,3,0,R-2,'#5a8aa8');for(let y=4;y<=16;y++)k.ring(0,y,0,2,C.stone);
  for(const[r,y]of[[9,16],[5,26]]){k.disc(0,y,0,r,C.stone);k.ring(0,y+1,0,r,C.stone);k.disc(0,y+1,0,r-1,'#5a8aa8');for(let yy=y+1;yy<=y+9&&r>6;yy++)k.ring(0,yy,0,1,C.stone)}
  for(let y=28;y<=34;y++)k.put(0,y,0,'#bfd8e8');for(let a=0;a<8;a++){const t=a/8*6.28;for(let s=1;s<=5;s++)k.put(Math.round(Math.cos(t)*(5+s)),26-Math.round(s*s/3),Math.round(Math.sin(t)*(5+s)),'#bfd8e8')}
  for(let a=0;a<12;a++){const t=a/12*6.28;for(let s=2;s<=6;s++)k.put(Math.round(Math.cos(t)*(9+s)),16-Math.round(s*s/3),Math.round(Math.sin(t)*(9+s)),'#bfd8e8')}return{V:k.V,size:[(2*R+1)/8.7,4,(2*R+1)/8.7]}});
def('statue',{label:'Statue on a pedestal',room:'Parterre, the avenue, Long Walk',act:'look'},o=>{const k=kit(),m=C.marble,v=C.marbleV;
  /* v1.55: a draped figure with a head, hair, shoulders and arms on a panelled pedestal (it was a blank block on a block) */
  k.box(-5,0,-5,5,1,5,C.stone);k.box(-4,2,-4,4,13,4,C.stone);k.box(-5,14,-5,5,15,5,C.stone);for(const s of[-4,4]){k.box(-2,4,s,2,11,s,v);k.box(s,4,-2,s,11,2,v)}
  k.box(-2,16,-1,2,16,2,m);for(let y=17;y<=30;y++){const r=y<21?3:y<27?2.6:2.2,rz=y<21?2:1.6;for(let x=-3;x<=3;x++)for(let z=-2;z<=2;z++)if(Math.abs(x)<=r&&Math.abs(z)<=rz)k.put(x,y,z,(z===Math.floor(rz)&&(x+y)%3===0)||(x===Math.floor(r)&&y%4===0)?v:m)}
  for(let i=0;i<8;i++)k.put(-3+i,30-i,2,v);k.box(-3,31,-1,3,37,1,m);k.box(-4,36,-1,4,38,1,m);for(let x=-3;x<=3;x+=2)k.box(x,31,1,x,35,1,v);
  k.box(-4,29,-1,-4,35,0,m);k.put(-4,28,0,v);k.box(4,33,-1,4,35,0,m);k.box(4,32,0,4,33,3,m);k.box(3,33,3,5,35,4,v);k.put(4,36,4,v);
  k.box(-1,39,-1,0,39,0,m);k.box(-2,40,-2,1,44,1,m);k.box(-2,44,-2,1,45,1,v);k.box(-2,40,-2,1,43,-2,v);k.box(-1,45,-3,0,45,-2,v);k.put(-2,42,2,v);k.put(1,42,2,v);k.put(-1,41,2,m);k.put(0,41,2,m);k.put(-1,40,2,v);k.put(0,40,2,v);return{V:k.V,size:[1.2,5.3,1.2]}});
def('sundial',{label:'Sundial',room:'Parterre, kitchen garden',act:'tell the time'},o=>{const k=kit();k.box(-3,0,-3,3,1,3,C.stone);for(let y=2;y<=8;y++)k.ring(0,y,0,y===5?2:1,C.stone);k.disc(0,9,0,4,C.brass,'face');for(let a=0;a<12;a++){const t=a/12*6.28;k.put(Math.round(Math.cos(t)*4),10,Math.round(Math.sin(t)*4),C.black)}
  for(let z=-3;z<=1;z++)for(let y=10;y<=10+Math.round((z+3)*.8);y++)k.put(0,y,z,C.brass);return{V:k.V,size:[1,1.4,1]}});
def('lampPost',{label:'Gas lamp post',room:'The drive, the village, the terrace',act:'light at dusk'},o=>{const k=kit();k.box(-2,0,-2,2,3,2,C.iron);for(let y=4;y<=30;y++){if(y<11||y===20||y===21)k.ring(0,y,0,1,C.iron);k.put(0,y,0,C.iron)}k.box(-3,30,0,3,30,0,C.iron);
  k.box(-2,31,-2,2,31,2,C.iron);for(let y=32;y<=37;y++){const r=y<36?2:1;for(let x=-r;x<=r;x++)for(let z=-r;z<=r;z++){if(Math.abs(x)!==r&&Math.abs(z)!==r)continue;k.put(x,y,z,(Math.abs(x)===r&&Math.abs(z)===r)?C.iron:C.glass)}}
  k.box(0,32,0,0,34,0,C.flame,'flame');k.box(-1,38,-1,1,38,1,C.iron);k.put(0,39,0,C.iron);return{V:k.V,size:[.6,4.6,.6]}});
def('gatePier',{label:'Gate pier with urn finial',room:'Lodge gates, forecourt',act:'none'},o=>{const k=kit();k.box(-6,0,-6,6,3,6,C.stone);k.box(-5,4,-5,5,38,5,C.stone);for(let y=8;y<=36;y+=7)k.box(-6,y,-6,6,y,6,C.stoneD);k.box(-7,39,-7,7,41,7,C.stone);
  k.box(-2,42,-2,2,43,2,C.stone);for(let y=44;y<=50;y++)k.ring(0,y,0,y<48?3:2,C.stone);k.put(0,51,0,C.stone);k.box(-4,20,6,4,28,6,hc(o,0,C.gilt),'face');return{V:k.V,size:[1.6,5.9,1.6]}});
def('ironGate',{label:'Wrought-iron gate, one leaf',room:'Lodge gates, kitchen garden, churchyard',act:'open and close',wall:true},o=>{const k=kit(),W=o.w||20,H=30;
  for(let x=0;x<=W;x++)for(let y=0;y<=H+Math.round(4*Math.sin(x/W*Math.PI));y++){const top=H+Math.round(4*Math.sin(x/W*Math.PI));const bar=x%3===0||y===0||y===10||y===top||y===top-1;if(bar)k.put(x,y,0,C.iron,'door');if(x%3===0&&y===top)k.put(x,y+1,0,C.gilt,'door')}
  for(let a=0;a<16;a++){const t=a/16*6.28;k.put(Math.round(W/2+Math.cos(t)*4),Math.round(20+Math.sin(t)*4),0,C.gilt,'door')}return{V:k.V,size:[(W+1)/8.7,4,.1],anchor:'hinge'}});
def('bench',{label:'Garden bench',room:'Gardens, terrace, lakeside',act:'sit'},o=>{const k=kit(),W=12,c=o.c||'#2f4a3a';for(const x of[-W,W]){k.box(x,0,-3,x,6,-3,C.iron);k.box(x,0,3,x,6,3,C.iron);k.box(x,7,-3,x,16,-4,C.iron);k.box(x,7,-3,x,9,3,C.iron)}
  for(let z=-3;z<=3;z+=2)k.box(-W,6,z,W,6,z,c,'seat');for(let y=9;y<=16;y+=2)k.box(-W,y,-4,W,y,-4,c);return{V:k.V,size:[2.9,1.9,.9]}});
def('rowboat',{label:'Rowing boat',room:'The lake, the jetty',act:'row'},o=>{const k=kit(),c=o.c||'#f1ede4';for(let z=-16;z<=16;z++){const w=Math.round(6*Math.sqrt(Math.max(0,1-(z/17)**2)));const y0=Math.abs(z)>12?2:0;
  for(let x=-w;x<=w;x++){if(Math.abs(x)===w)for(let y=y0;y<=5;y++)k.put(x,y,z,y===5?C.oak:c);else k.put(x,y0,z,C.oakL)}}for(const z of[-6,3])k.box(-5,3,z,5,3,z,C.oak,'seat');for(const s of[-1,1])for(let i=0;i<14;i++)k.put(s*(7+Math.floor(i/3)),5,i-4,C.oak);
  k.box(-1,1,-15,1,5,-15,hc(o,0,'#2e5e9e'));return{V:k.V,size:[1.5,.7,3.8]}});
def('jetty',{label:'Timber jetty, one bay',room:'The lake',act:'walk out',tile:[0,16]},o=>{const k=kit();for(let x=-12;x<=12;x++)for(let z=-8;z<=7;z++)k.put(x,10,z,(z%3===0)?'#6b5032':'#8a6a42');for(const x of[-12,12])for(const z of[-8,6]){k.box(x,-12,z,x+1,14,z+1,'#4a3a28')}
  for(const x of[-12,12])k.box(x,14,-8,x,14,7,'#6b5032');return{V:k.V,size:[2.9,3.1,1.84]}});
def('boxParterre',{label:'Parterre bed, one box knot',room:'The parterre',act:'none',tile:[24,24]},o=>{const k=kit(),r=rng(o.seed||21),f=o.c||FLOW[Math.floor(r()*FLOW.length)];
  for(let x=-12;x<=11;x++)for(let z=-12;z<=11;z++){const e=Math.min(12-Math.abs(x+.5),12-Math.abs(z+.5));const diag=Math.abs(Math.abs(x+.5)-Math.abs(z+.5))<1.2;const circ=Math.abs(Math.hypot(x+.5,z+.5)-6)<1;
    if(e<1.5||diag||circ){k.put(x,0,z,'#2f5a2a','leaf');k.put(x,1,z,'#355f2e','leaf');if(e<1.5)k.put(x,2,z,'#2f5a2a','leaf')}else k.put(x,0,z,r()<.55?f:'#4a6a2a','leaf')}return{V:k.V,size:[2.8,.4,2.8]}});
def('rosePergola',{label:'Rose pergola, one arch',room:'Rose garden, the Long Walk',act:'none',tile:[0,16]},o=>{const k=kit(),r=rng(o.seed||31);for(const x of[-10,10])for(const z of[-6,6])k.box(x,0,z,x,26,z,C.white);
  for(let x=-11;x<=11;x++)for(const z of[-6,6])k.put(x,27,z,C.white);for(let z=-7;z<=7;z+=2)k.box(-11,28,z,11,28,z,C.white);
  for(let i=0;i<140;i++){const x=Math.round((r()-.5)*24),z=Math.round((r()-.5)*16),y=r()<.5?27+Math.floor(r()*3):Math.floor(r()*27);if(y<27&&Math.abs(Math.abs(x)-10)>1)continue;k.put(x,y,z,r()<.25?(r()<.5?'#c0262b':'#e8a0b4'):'#3f6b33','leaf')}
  return{V:k.V,size:[2.6,3.4,1.84]}});
def('lavender',{label:'Lavender border, one block run',room:'Terrace, kitchen garden',act:'none',tile:[8,0]},o=>{const k=kit(),r=rng(o.seed||41);for(let x=-4;x<=3;x++)for(let z=-2;z<=1;z++){const h=2+Math.floor(r()*3);for(let y=0;y<h;y++)k.put(x,y,z,'#7a8a6a','leaf');if(r()<.8)k.put(x,h,z,r()<.5?'#8a6ab0':'#7b4fa0','leaf')}return{V:k.V,size:[.9,.6,.5]}});
def('vegetableBed',{label:'Kitchen garden bed (cabbages, leeks, beans)',room:'Kitchen garden',act:'none',tile:[24,10]},o=>{const k=kit(),r=rng(o.seed||51);k.box(-12,0,-5,11,0,4,'#4a3424');for(let x=-11;x<=10;x+=3)for(let z=-4;z<=3;z+=3){const kind=(x+12)%9;
  if(kind<3){k.box(x,1,z,x+1,2,z+1,'#6b9a4a','leaf');k.put(x,3,z,'#8ab05a','leaf')}else if(kind<6){for(let y=1;y<=5;y++)k.put(x,y,z,y<3?'#e8e4dc':'#4a7a33','leaf')}else{for(let y=1;y<=8;y++)k.put(x,y,z,'#8a6a42');for(let y=2;y<=8;y+=2)k.put(x+1,y,z,'#5a8a3a','leaf')}}
  return{V:k.V,size:[2.8,1,1.2]}});
def('glasshouseBench',{label:'Glasshouse staging with pots',room:'The Glasshouse, the Orangery',act:'none'},o=>{const k=kit(),r=rng(o.seed||61),L=14;for(const x of[-4,4])for(const z of[-L,0,L])k.box(x,0,z,x,8,z,C.oakL);
  for(const y of[8,3])k.box(-5,y,-L,5,y,L,y===8?C.oakL:'#8a6a42');for(let z=-L+2;z<=L-2;z+=4)for(const x of[-2,2]){k.ring(x,9,z,1,'#b06a3a');k.put(x,9,z,'#b06a3a');const h=2+Math.floor(r()*4);for(let y=10;y<10+h;y++)k.put(x,y,z,'#4a8a3a','leaf');if(r()<.5)k.put(x,10+h,z,FLOW[Math.floor(r()*FLOW.length)],'leaf')}
  return{V:k.V,size:[1.3,1.6,3.3]}});
def('orangeTree',{label:'Orange tree in a Versailles tub',room:'The Orangery, the terrace',act:'pick an orange'},o=>{const k=kit(),r=rng(o.seed||71);k.box(-5,0,-5,5,9,5,'#2f4a3a');for(const[x,z]of[[-5,-5],[5,-5],[-5,5],[5,5]]){k.box(x,0,z,x,10,z,'#1f2f26');k.put(x,11,z,C.gilt)}
  k.box(0,10,0,0,20,0,'#5a4632');for(let x=-7;x<=7;x++)for(let y=-6;y<=6;y++)for(let z=-7;z<=7;z++){const q=x*x/49+y*y/36+z*z/49;if(q>1||(q<.6&&(x+y+z)%2))continue;k.put(x,27+y,z,r()<.07?'#e07a1f':(r()<.5?'#2f6b2a':'#3f7a33'),'leaf')}
  return{V:k.V,size:[1.7,3.9,1.7]}});

/* ---------------- house colours for the bedrooms: any prop that takes o.c ---------------- */
P.dress=function(kind,house,extra){const h=HOUSE[house];return P.build(kind,Object.assign({house,c:h?h[0]:undefined,c2:h?h[1]:undefined},extra||{}))};
})(typeof PROPS!=='undefined'?PROPS:require('./props.js'));
