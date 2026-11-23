/* =========================================================
   Euphrates Hall Parts Depot: props3.js (batch 3, Nov 12, 2026)
   Richer variants so no two rooms repeat, ceiling and stair pieces, and the villages.
   Load after props.js and props2.js. Same format, units and facing (front faces +z).
   ========================================================= */
(function(P){const{def,kit,rng,colors:C,books:BOOKS}=P;const hc=(o,i,d)=>o.house&&P.houses[o.house]?P.houses[o.house][i]:(d);

/* ---------------- variants: seating ---------------- */
def('chairHall',{label:'Carved hall chair',room:'Great Hall, Entrance Hall, dining (variant)',act:'sit',variantOf:'chairDining'},o=>{const k=kit(),wd=o.wood||C.oak;
  for(const[x,z]of[[-3,-3],[3,-3],[-3,3],[3,3]])k.box(x,0,z,x,7,z,wd);k.box(-3,1,-3,3,1,-3,wd);k.box(-3,1,3,3,1,3,wd);k.box(-3,8,-3,3,8,3,wd,'seat');k.box(-2,9,-2,2,9,2,o.c||C.leather,'seat');
  k.box(-3,9,-3,-3,24,-3,wd);k.box(3,9,-3,3,24,-3,wd);k.box(-2,10,-3,2,22,-3,wd);for(let y=12;y<=21;y+=3)k.box(-1,y,-3,1,y+1,-3,C.oakL);k.box(-3,25,-3,3,26,-3,wd);k.put(-3,27,-3,C.oakL);k.put(3,27,-3,C.oakL);k.box(-1,27,-3,1,28,-3,C.oakL);
  return{V:k.V,size:[.8,3.3,.8]}});
def('fauteuil',{label:'Gilt fauteuil (French armchair)',room:'Drawing Room, Saloon, Music Room (variant)',act:'sit',variantOf:'armchair'},o=>{const k=kit(),g=C.gilt,s=o.c||'#9fb3bf';
  for(const[x,z]of[[-4,-4],[4,-4],[-4,4],[4,4]])k.box(x,0,z,x,6,z,g);k.box(-4,7,-4,4,7,4,g);k.box(-3,8,-3,3,9,4,s,'seat');for(const x of[-4,4]){k.box(x,8,-2,x,12,3,g);k.box(x,11,-1,x,11,3,s)}
  for(let y=8;y<=21;y++){const w=y<18?4:4-(y-17);k.box(-w,y,-4,w,y,-4,(y===8||y>=20||Math.abs(-w)===w&&false)?g:s)}k.box(-4,8,-4,-4,18,-4,g);k.box(4,8,-4,4,18,-4,g);k.put(0,22,-4,g);return{V:k.V,size:[1.1,2.6,1.1]}});
def('settee',{label:'Gilt settee',room:'Drawing Room, Saloon gallery (variant)',act:'sit',variantOf:'sofa'},o=>{const k=kit(),g=C.gilt,s=o.c||'#9fb3bf',W=11;
  for(const x of[-W,-4,4,W])for(const z of[-4,4])k.box(x,0,z,x,5,z,g);k.box(-W,6,-4,W,6,4,g);k.box(-W+1,7,-3,W-1,8,4,s,'seat');for(let x=-W;x<=W;x++){const h=16+Math.round(2*Math.cos(x/W*Math.PI/1.2));for(let y=7;y<=h;y++)k.put(x,y,-4,(y===h||Math.abs(x)===W)?g:s)}
  for(const x of[-W,W]){k.box(x,7,-3,x,11,4,g);k.box(x,10,-3,x,10,4,s)}return{V:k.V,size:[2.6,2.2,1]}});
def('chaise',{label:'Chaise longue',room:'Morning Room, bedrooms (variant)',act:'lie down',variantOf:'sofa'},o=>{const k=kit(),s=o.c||C.damask,wd=C.mah;
  for(const[x,z]of[[-4,-12],[4,-12],[-4,10],[4,10]])k.box(x,0,z,x,4,z,wd);k.box(-4,5,-12,4,6,11,wd);k.box(-3,7,-11,3,8,10,s,'seat');for(let z=6;z<=11;z++)k.box(-4,7,z,4,7+Math.round((z-5)*1.6),z,s);k.box(-4,7,-12,-4,13,6,wd);for(let z=-11;z<=6;z+=2)k.put(-4,14,z,C.gilt);
  k.box(-2,9,-9,2,10,-7,C.gold);return{V:k.V,size:[1,2,2.8]}});
def('windsor',{label:'Windsor chair',room:'Servants\' Hall, kitchen, cottages (variant)',act:'sit',variantOf:'chairDining'},o=>{const k=kit(),wd=C.oakL;
  for(const[x,z]of[[-3,-3],[3,-3],[-3,3],[3,3]])k.box(x,0,z,x,6,z,wd);k.box(-2,3,0,2,3,0,wd);k.disc(0,7,0,4,wd,'seat');for(let a=-3;a<=3;a++){const x=a;for(let y=8;y<=18;y++)if(a%2===0||y>16)k.put(x,y,-3-(y>14?1:0),wd)}
  for(let x=-4;x<=4;x++)k.put(x,19-Math.round(Math.abs(x)/3),-4,wd);return{V:k.V,size:[1,2.2,1]}});

/* ---------------- variants: tables and case furniture ---------------- */
def('pedestalTable',{label:'Round pedestal table',room:'Drawing Room, Morning Room, Library (variant)',act:'touch',variantOf:'libraryTable'},o=>{const k=kit(),wd=o.wood||C.mah;
  for(const a of[0,2.1,4.2])for(let s=0;s<5;s++)k.put(Math.round(Math.cos(a)*s),Math.max(0,1-Math.floor(s/3)),Math.round(Math.sin(a)*s),wd);for(let y=1;y<=7;y++)k.ring(0,y,0,y>2&&y<6?1:2,wd);k.disc(0,8,0,7,wd);k.ring(0,8,0,7,C.mahL);k.disc(0,9,0,2,C.white);
  return{V:k.V,size:[1.7,1.1,1.7]}});
def('consoleTable',{label:'Gilt console table with pier glass',room:'Saloon, Entrance Hall, Drawing Room',act:'look',wall:true},o=>{const k=kit(),g=C.gilt;
  for(const x of[-9,9]){for(let y=0;y<=9;y++)k.put(x+(y<5?(x>0?-1:1)*Math.round((5-y)/3):0),y,2-Math.round(y/4),g)}k.box(-10,10,-1,10,11,3,C.marble);k.box(-10,9,-1,10,9,3,g);for(let x=-8;x<=8;x+=2)k.put(x,8,3,g);
  k.box(-8,12,-1,8,40,-1,g);k.box(-7,13,0,7,39,0,'#9fb3bf','face');k.box(-3,41,-1,3,43,-1,g);k.put(0,44,-1,C.gold);k.box(-3,12,1,-1,15,2,C.white);k.box(2,12,1,3,17,1,C.brass);k.put(2,18,1,C.flame,'flame');
  return{V:k.V,size:[2.4,5.2,.6]}});
def('sideboard',{label:'Mahogany sideboard with silver',room:'State Dining Room, Servants\' Hall (plain)',act:'touch: the cabinet',wall:true},o=>{const k=kit(),wd=o.wood||C.mah,W=16;
  for(const x of[-W,-W+5,W-5,W])k.box(x,0,0,x,8,0,wd);k.box(-W,9,-3,W,11,3,wd);for(const x of[-11,0,11])k.box(x-4,6,4,x+4,10,4,C.mahL,'door');for(const x of[-11,0,11])k.put(x,8,5,C.brass);k.box(-W,12,-3,W,12,3,C.mahL);
  k.box(-W,13,-3,W,18,-3,wd);k.box(-12,13,-1,-9,16,1,C.brass);k.box(-11,17,0,-10,18,0,C.brass);k.box(-3,13,-1,3,13,1,'#c0c7cf');k.box(-2,14,0,2,15,0,'#c0c7cf');k.box(9,13,-1,12,14,1,'#c0c7cf');k.box(10,15,0,11,17,0,'#c0c7cf');
  return{V:k.V,size:[3.8,2.2,.8]}});
def('bureau',{label:'Bureau bookcase',room:'Study, Business Room, Estate Office',act:'open',wall:true},o=>{const k=kit(),wd=o.wood||C.wal,r=rng(o.seed||17);
  k.box(-7,0,-3,7,12,3,wd);for(const y of[2,6,10])k.box(-6,y-1,4,6,y+1,4,C.mahL,'door'),k.put(-3,y,5,C.brass),k.put(3,y,5,C.brass);k.box(-7,13,-3,7,13,3,wd);for(let y=14;y<=18;y++)k.box(-7,y,-3,7,y,3-(y-13),wd,'lid');
  k.box(-7,19,-3,7,40,-1,wd);for(let s=21;s<=37;s+=8){k.box(-6,s,-2,6,s,0,wd);for(let x=-6;x<=6;x++)if(r()>.1)k.box(x,s+1,-2,x,s+5+Math.floor(r()*2),-1,BOOKS[Math.floor(r()*BOOKS.length)])}
  k.box(-6,20,0,6,39,0,C.glass,'door');for(let y=20;y<=39;y+=5)k.box(-6,y,0,6,y,0,wd,'door');k.box(-8,41,-3,8,42,1,wd);for(let x=-7;x<=7;x+=2)k.put(x,43,1,C.gilt);return{V:k.V,size:[1.7,5,.8]}});
def('displayCabinet',{label:'Glazed display cabinet with porcelain',room:'Drawing Room, Morning Room, Long Gallery',act:'look',wall:true},o=>{const k=kit(),wd=o.wood||C.mah,r=rng(o.seed||27);
  k.box(-8,0,-3,8,4,3,wd);k.box(-8,5,-3,8,34,-3,wd);k.box(-8,5,-3,-8,34,2,wd);k.box(8,5,-3,8,34,2,wd);k.box(-9,35,-4,9,37,3,wd);for(let x=-8;x<=8;x+=2)k.put(x,38,3,C.gilt);
  for(const s of[5,13,21,29]){k.box(-7,s,-2,7,s,2,wd);for(let x=-6;x<=6;x+=3){const c=r()<.5?'#2e5e9e':C.white;k.box(x,s+1,-1,x+1,s+3,0,c);k.put(x,s+4,-1,c)}}k.box(-7,5,3,7,34,3,C.glass,'door');return{V:k.V,size:[2,4.4,.8]}});
def('commode',{label:'Serpentine commode',room:'Bedrooms, the Long Gallery',act:'open',wall:true},o=>{const k=kit(),wd=o.wood||C.wal;
  for(let x=-8;x<=8;x++){const f=3+Math.round(Math.cos(x/8*Math.PI*1.5));k.box(x,1,-3,x,10,f,wd);for(const y of[3,7])k.put(x,y,f,C.mahL,'door');k.box(x,11,-3,x,11,f+1,C.marble)}for(const x of[-8,8])k.box(x,0,0,x,0,0,C.gilt);for(const y of[3,7])for(const x of[-4,4])k.put(x,y,5,C.gilt);
  k.box(-2,12,0,2,13,0,C.gilt);k.box(-1,14,0,1,17,0,C.white,'face');return{V:k.V,size:[2,2,1]}});
def('fourPosterOak',{label:'Carved oak tester bed',room:'State bedrooms (variant)',act:'lie down',variantOf:'bed4'},o=>{const k=kit(),wd=C.oak,s=o.c||C.green,W=10,L=17;
  k.box(-W,0,-L,W,5,L,wd);k.box(-W+1,6,-L+1,W-1,7,L-1,C.linen,'seat');k.box(-W+1,8,-L+1,W-1,8,L-6,s,'seat');k.box(-W+2,8,L-5,W-2,10,L-2,C.white);
  for(const[x,z]of[[-W,-L],[W,-L]]){for(let y=0;y<=32;y++){const r=y>8&&y<14?1:0;k.box(x-r,y,z-r,x+r,y,z+r,wd)}}k.box(-W,6,L,W,32,L,wd);for(let x=-W+2;x<=W-2;x+=4)for(let y=10;y<=28;y+=6)k.box(x,y,L-1,x+2,y+3,L-1,C.oakL);
  k.box(-W,32,-L,W,33,L,wd);for(let x=-W;x<=W;x++){k.put(x,31,-L,s);k.put(x,30,-L,x%3?s:C.gold)}for(let z=-L;z<=L;z++){k.put(-W,31,z,s);k.put(W,31,z,s);k.put(-W,30,z,z%3?s:C.gold);k.put(W,30,z,z%3?s:C.gold)}
  for(let y=11;y<=29;y++){k.put(-W,y,-L+1,s);k.put(W,y,-L+1,s)}return{V:k.V,size:[2.4,3.9,4]}});

/* ---------------- variants: lights ---------------- */
def('chandelierGilt',{label:'Gilt candle chandelier',room:'Great Hall, Ballroom, Saloon (variant)',act:'light',hang:true,variantOf:'chandelier'},o=>{const k=kit();
  k.box(0,18,0,0,30,0,C.gilt);k.disc(0,17,0,1,C.gilt);for(let y=8;y<=16;y++)k.ring(0,y,0,y>11&&y<14?2:1,C.gilt);for(const[R,y,n]of[[11,8,16],[7,12,10],[4,15,6]]){k.ring(0,y,0,R,C.gilt);
    for(let a=0;a<n;a++){const t=a/n*6.28,x=Math.round(Math.cos(t)*R),z=Math.round(Math.sin(t)*R);for(let s=1;s<R;s+=2)k.put(Math.round(Math.cos(t)*s),y-1+Math.round(Math.sin(s/R*3.14)*2),Math.round(Math.sin(t)*s),C.gilt);k.put(x,y+1,z,C.gilt);k.box(x,y+2,z,x,y+3,z,C.white);k.put(x,y+4,z,C.flame,'flame')}}
  return{V:k.V,size:[2.6,3.6,2.6],anchor:'top'}});
def('lanternPendant',{label:'Hall lantern',room:'Entrance Hall, corridors, stairs',act:'light',hang:true,ceiling:true},o=>{const k=kit();k.box(0,20,0,0,30,0,C.brass);for(let y=6;y<=18;y++){const r=y<8||y>16?2:3;for(let x=-r;x<=r;x++)for(let z=-r;z<=r;z++){if(Math.abs(x)!==r&&Math.abs(z)!==r)continue;k.put(x,y,z,(Math.abs(x)===r&&Math.abs(z)===r)||y===6||y===18?C.brass:C.glass)}}
  k.box(0,8,0,0,13,0,C.white);k.box(0,14,0,0,15,0,C.flame,'flame');k.box(-1,19,-1,1,19,1,C.brass);k.put(0,5,0,C.brass);return{V:k.V,size:[.8,3.6,.8],anchor:'top'}});
def('sconce',{label:'Wall sconce, two candles',room:'Every state room, corridors',act:'light',wall:true},o=>{const k=kit();k.box(-1,22,0,1,28,0,C.gilt);k.put(0,29,0,C.gold);for(const s of[-1,1]){for(let i=0;i<4;i++)k.put(s*(1+i),24+Math.round(Math.sin(i/1.3)*2),1+Math.floor(i/2),C.gilt);k.box(s*4,26,2,s*4,28,2,'#efe0b8');k.put(s*4,29,2,C.flame,'flame');k.put(s*4,25,2,C.gilt)}
  return{V:k.V,size:[1,3.4,.3],anchor:'wall'}});
def('standardLamp',{label:'Standard lamp with silk shade',room:'Drawing Room, Library, bedrooms',act:'light'},o=>{const k=kit(),s=o.c||'#e8d8b0';k.disc(0,0,0,3,C.brass);k.disc(0,1,0,2,C.brass);for(let y=2;y<=26;y++)k.put(0,y,0,y%6===0?C.gilt:C.brass);
  for(let y=24;y<=31;y++){const r=5-Math.round((y-24)/3);k.ring(0,y,0,r,s)}k.box(0,26,0,0,27,0,C.flame,'flame');for(let a=0;a<16;a+=2){const t=a/16*6.28;k.put(Math.round(Math.cos(t)*5),23,Math.round(Math.sin(t)*5),C.gold)}return{V:k.V,size:[1.3,3.7,1.3]}});

/* ---------------- ceilings and stairs ---------------- */
def('ceilingRose',{label:'Plaster ceiling rose',room:'Above every chandelier',act:'none',hang:true,ceiling:true},o=>{const k=kit();for(let x=-9;x<=9;x++)for(let z=-9;z<=9;z++){const d=Math.hypot(x,z);if(d>9.3)continue;const ring=Math.abs(d-8)<.8||Math.abs(d-5)<.7;const petal=d>2&&d<7.5&&Math.abs(Math.sin(Math.atan2(z,x)*4))>.75;
  k.put(x,0,z,ring?C.gilt:C.white);if(petal||d<2)k.put(x,-1,z,petal&&d>4?C.gilt:C.white)}return{V:k.V,size:[2.2,.2,2.2],anchor:'ceiling'}});
def('coffer',{label:'Coffered ceiling panel, one bay',room:'Library, Saloon gallery, Drawing Room',tile:[24,24],hang:true,ceiling:true},o=>{const k=kit(),f=o.c||'#e9dfc4';
  for(let x=-12;x<=11;x++)for(let z=-12;z<=11;z++){const e=Math.min(12-Math.abs(x+.5),12-Math.abs(z+.5));let y=0,c=f;if(e<2){y=-3;c=C.white}else if(e<3){y=-2;c=e<2.5?C.gilt:C.white}else if(e<4)y=-1;
    for(let yy=y;yy<=0;yy++)k.put(x,yy,z,yy===y?c:C.white);if(e>=4&&Math.hypot(x+.5,z+.5)<2.2)k.put(x,-1,z,C.gilt)}return{V:k.V,size:[2.76,.4,2.76],anchor:'ceiling'}});
def('beam',{label:'Oak ceiling beam, one block run',room:'Below stairs, cottages, the inn',tile:[9,0],hang:true,ceiling:true},o=>{const k=kit();k.box(-4,-5,-2,4,0,2,C.oak);for(let x=-4;x<=4;x+=3)k.put(x,-5,2,C.wal);return{V:k.V,size:[1,.7,.5],anchor:'ceiling'}});
def('hammerbeam',{label:'Hammerbeam roof truss',room:'The Great Hall',act:'look up',hang:true,ceiling:true},o=>{const k=kit(),W=o.w||100,wd=C.oak;const half=W/2;
  for(let x=-half;x<=half;x++){const y=-Math.round(Math.max(0,half-Math.abs(x))*.45);k.box(x,y-2,-1,x,y,1,wd)}for(const s of[-1,1]){k.box(s*half,-30,-1,s*(half-2),0,1,wd);k.box(s*(half-14),-26,-1,s*half,-24,1,wd);
    for(let i=0;i<16;i++){k.box(s*(half-14-Math.round(i*.5)),-26+i,-1,s*(half-14-Math.round(i*.5)),-26+i,1,wd)}k.box(s*(half-15),-30,-2,s*(half-13),-26,2,C.gilt);k.put(s*(half-14),-31,0,C.gold)}
  k.box(-2,-24-Math.round(half*.45)+22,-1,2,-Math.round(half*.45),1,wd);return{V:k.V,size:[(W+1)/8.7,3.6,.4],anchor:'ceiling'}});
def('stairFlight',{label:'Oak stair flight with balusters (rises 10 blocks)',room:'Oak Stair, Grand Stair, Red Staircase',act:'climb'},o=>{const k=kit(),Wd=o.w||16,steps=o.steps||29,c=o.c||C.oak,run=Wd;
  for(let i=0;i<steps;i++){const z=-steps*1.5+i*3,y=i*3;k.box(-Wd/2,y,z,Wd/2,y+2,z+2,c);k.box(-Wd/2,y-1,z,Wd/2,y-1,z+2,C.oakL);for(const sx of[-Wd/2,Wd/2])k.box(sx,Math.max(0,y-4),z,sx,y,z+2,c);k.box(-Wd/2+2,y+2,z,Wd/2-2,y+2,z+2,o.carpet||C.damask)}
  for(const s of[-1,1]){const x=s*Wd/2;for(let i=0;i<steps;i++){const z=-steps*1.5+i*3,y=i*3+3;for(let yy=y;yy<y+9;yy++)if(i%1===0)k.put(x,yy,z+1,yy===y+8?C.mahL:C.oakL);k.box(x,y+9,z,x,y+9,z+2,C.mah)}
    k.box(x-1,0,-steps*1.5-2,x+1,13,-steps*1.5,C.mah);k.put(x,14,-steps*1.5-1,C.gilt)}return{V:k.V,size:[(Wd+1)/8.7,(steps*3+12)/8.7,(steps*3+3)/8.7]}});
def('newelPost',{label:'Carved newel post with lamp',room:'Foot of the Grand Stair',act:'light'},o=>{const k=kit();k.box(-2,0,-2,2,2,2,C.mah);for(let y=3;y<=16;y++)k.ring(0,y,0,y%5===0?2:1,C.mah);k.box(-2,17,-2,2,18,2,C.mah);k.box(0,19,0,0,24,0,C.brass);for(let y=25;y<=28;y++)k.ring(0,y,0,1,C.glass);k.put(0,26,0,C.flame,'flame');return{V:k.V,size:[.6,3.3,.6]}});

/* ---------------- the villages: cottages, the inn, the smithy, the church, the shop ---------------- */
def('boxBed',{label:'Cottage box bed with quilt',room:'Cottages',act:'lie down'},o=>{const k=kit(),r=rng(o.seed||7),W=7,L=14;k.box(-W,0,-L,W,4,L,C.oakL);k.box(-W,0,L,W,14,L,C.oakL);k.box(-W,0,-L,W,8,-L,C.oakL);
  for(let x=-W+1;x<=W-1;x++)for(let z=-L+1;z<=L-4;z++)k.put(x,5,z,['#a4161a','#2e5e9e','#e3b23c','#f4f1ea','#3fa34d'][(Math.floor((x+10)/3)+Math.floor((z+20)/3))%5],'seat');k.box(-W+1,5,L-3,W-1,6,L-1,C.white);return{V:k.V,size:[1.7,1.7,3.3]}});
def('settle',{label:'High-backed settle by the hearth',room:'Cottages, the inn',act:'sit'},o=>{const k=kit(),W=12;k.box(-W,0,-3,-W,22,3,C.oak);k.box(W,0,-3,W,22,3,C.oak);k.box(-W,5,-2,W,5,3,C.oakL,'seat');k.box(-W,6,-3,W,22,-3,C.oak);for(let x=-W+2;x<=W-2;x+=4)k.box(x,9,-2,x+1,19,-2,C.oakL);k.box(-W,23,-3,W,23,1,C.oakL);
  k.box(-W+2,6,-2,-W+7,8,2,'#a4161a');return{V:k.V,size:[2.9,2.8,.8]}});
def('inglenook',{label:'Inglenook hearth with kettle',room:'Cottages, the inn, the smithy',act:'light'},o=>{const k=kit(),W=14;k.box(-W,0,-4,W,26,-4,C.stoneD);k.box(-W,0,-4,-W+3,26,3,C.stone);k.box(W-3,0,-4,W,26,3,C.stone);k.box(-W,22,-4,W,26,3,C.oak);
  k.box(-6,0,-3,6,1,1,C.stoneD);k.box(-4,2,-2,4,3,0,'#d9531c','flame');k.box(-2,4,-1,2,5,-1,C.flame,'flame');k.box(0,14,-1,0,21,-1,C.iron);for(let y=9;y<=13;y++)k.ring(0,y,-1,y>11?1:2,C.black);k.box(2,12,-1,4,12,-1,C.black);
  for(let x=-W+4;x<=W-4;x+=3)k.box(x,18,0,x,19,0,'#c9a36a');return{V:k.V,size:[3.3,3.1,.9]}});
def('spinningWheel',{label:'Spinning wheel',room:'Cottages',act:'spin'},o=>{const k=kit();k.box(-2,0,-6,-2,6,6,C.oakL);k.box(2,0,-6,2,6,6,C.oakL);k.box(-2,6,-6,2,7,6,C.oak);for(let a=0;a<24;a++){const t=a/24*6.28;k.put(0,15+Math.round(Math.sin(t)*7),-1+Math.round(Math.cos(t)*7),C.oak)}
  for(let a=0;a<6;a++){const t=a/6*6.28;for(let s=1;s<7;s+=2)k.put(0,15+Math.round(Math.sin(t)*s),-1+Math.round(Math.cos(t)*s),C.oakL)}k.box(0,8,4,0,16,4,C.oakL);k.box(0,16,4,0,17,6,'#e9dfc4');return{V:k.V,size:[.6,2.6,1.6]}});
def('ragRug',{label:'Braided rag rug',room:'Cottages',act:'none'},o=>{const k=kit(),r=rng(o.seed||9);for(let x=-10;x<=10;x++)for(let z=-7;z<=7;z++){const d=Math.hypot(x/10,z/7);if(d>1)continue;k.put(x,0,z,['#a4161a','#7a5230','#2e5e9e','#e9dfc4','#3f6b33'][Math.floor(d*9+r()*.6)%5])}return{V:k.V,size:[2.4,.1,1.7]}});
def('trestleTable',{label:'Trestle table with benches',room:'The inn, the Servants\' Hall, cottages',act:'sit'},o=>{const k=kit(),L=o.len||18;for(const z of[-L+3,L-3]){k.box(-1,0,z,1,8,z,C.oak);k.box(-4,0,z,4,1,z,C.oak)}k.box(-1,4,-L+3,1,4,L-3,C.oak);k.box(-5,9,-L,5,10,L,C.oakL);
  for(const x of[-9,9]){for(const z of[-L+2,L-2])k.box(x-1,0,z,x+1,5,z,C.oak);k.box(x-2,6,-L+1,x+2,6,L-1,C.oakL,'seat')}k.box(-2,11,-3,-1,13,-2,C.white);k.box(1,11,4,2,13,5,'#7a5230');k.box(0,11,-10,1,11,-8,'#c9a36a');return{V:k.V,size:[2.4,1.3,(2*L+1)/8.7]}});
def('counter',{label:'Shop counter with scales and jars',room:'The village shop, the inn',act:'browse',wall:false},o=>{const k=kit(),W=16,r=rng(o.seed||19);k.box(-W,0,-3,W,10,3,C.oak);for(let x=-W+2;x<=W-2;x+=5)k.box(x,2,4,x+3,8,4,C.oakL);k.box(-W-1,11,-4,W+1,11,4,'#d8c49a');
  k.box(-10,12,-1,-6,12,1,C.brass);k.box(-8,13,0,-8,17,0,C.brass);k.box(-11,17,0,-5,17,0,C.brass);k.ring(-11,16,0,1,C.brass);k.ring(-5,16,0,1,C.brass);for(let x=0;x<=12;x+=3){const c=['#c0262b','#e3b23c','#3fa34d','#7b4fa0'][Math.floor(r()*4)];k.box(x,12,-1,x+1,15,0,C.glass);k.box(x,12,-1,x+1,13,0,c)}
  return{V:k.V,size:[3.9,1.4,1]}});
def('shopShelves',{label:'Shop shelves with tins and bolts of cloth',room:'The village shop',act:'browse',wall:true},o=>{const k=kit(),W=14,r=rng(o.seed||23);k.box(-W,0,-3,W,30,-3,C.oak);for(const x of[-W,W])k.box(x,0,-3,x,30,1,C.oak);
  for(let s=4;s<=28;s+=6){k.box(-W,s,-2,W,s,1,C.oak);for(let x=-W+1;x<=W-1;x+=2){const c=s<16?['#a4161a','#2e5e9e','#e3b23c','#f4f1ea','#3f6b33','#7b4fa0'][Math.floor(r()*6)]:['#b06a3a','#c0c7cf','#2e5e9e','#c9a227'][Math.floor(r()*4)];k.box(x,s+1,-2,x+(s<16?1:0),s+(s<16?3:4),0,c)}}return{V:k.V,size:[3.3,3.6,.6],anchor:'wall'}});
def('grindstone',{label:'Grindstone',room:'The smithy, the Home Farm',act:'sharpen'},o=>{const k=kit();k.box(-4,0,-6,-4,8,6,C.oak);k.box(4,0,-6,4,8,6,C.oak);k.box(-4,8,-6,4,8,6,C.oak);for(let a=0;a<20;a++){const t=a/20*6.28;for(let x=-1;x<=1;x++)k.put(x,14+Math.round(Math.sin(t)*6),Math.round(Math.cos(t)*6),C.stone)}
  k.box(-6,14,0,6,14,0,C.iron);k.box(6,14,0,6,17,0,C.iron);k.box(-3,1,-8,3,4,-6,'#6b8aa0');return{V:k.V,size:[1.5,2.4,1.9]}});
def('horseshoeRack',{label:'Rack of horseshoes and tongs',room:'The smithy',act:'none',wall:true},o=>{const k=kit();k.box(-10,20,0,10,20,1,C.oak);for(let x=-8;x<=8;x+=4){for(let a=0;a<8;a++){const t=a/8*3.4+3.1;k.put(x+Math.round(Math.cos(t)*1.5),15+Math.round(Math.sin(t)*2.5),1,C.iron)}k.put(x,19,1,C.iron)}
  for(const x of[-11,11]){k.box(x,6,1,x,19,1,C.iron);k.put(x-1,5,1,C.iron);k.put(x+1,5,1,C.iron)}return{V:k.V,size:[2.6,2.4,.3],anchor:'wall'}});
def('font',{label:'Stone font with oak cover',room:'The village church',act:'look'},o=>{const k=kit();k.box(-4,0,-4,4,2,4,C.stone);for(let y=3;y<=8;y++)k.ring(0,y,0,2,C.stone);for(let y=9;y<=14;y++){k.ring(0,y,0,5,C.stone);if(y<14)k.disc(0,y,0,4,y===13?'#6b8aa0':C.stone)}
  for(let y=15;y<=22;y++)k.ring(0,y,0,Math.max(0,5-Math.round((y-15)*.7)),C.oak);k.put(0,23,0,C.gilt);return{V:k.V,size:[1.3,2.7,1.3]}});
def('churchBell',{label:'Church bell in its frame',room:'The village church tower',act:'ring'},o=>{const k=kit();for(const x of[-8,8])k.box(x,0,-1,x,22,1,C.oak);k.box(-8,22,-1,8,23,1,C.oak);for(let y=8;y<=19;y++){const r=Math.round(2+((19-y)/11)**1.4*5);k.ring(0,y,0,r,C.brass)}k.ring(0,8,0,7,'#9c7a1c');k.box(0,4,0,0,9,0,C.iron);k.box(0,20,0,0,21,0,C.brass);
  k.box(-8,21,0,-12,21,0,C.oak);for(let y=0;y<=20;y++)k.put(-12,y,0,'#c9a36a');return{V:k.V,size:[2.8,2.8,.9]}});
def('daisDoor',{label:'State door case with a pediment, two leaves',room:'The Great Hall, behind the thrones',act:'look',wall:true},o=>{const k=kit(),wd=o.wood||C.oak,ml=o.mould||C.oakL,fd=o.field||'#4e3420',H=46;
  /* v1.57: two mirror-image leaves, three panels each on the same lines, a dark meeting stile, brass knobs; an architrave with a gilt bead, a frieze with rosettes, a cornice and a pediment with a gilt cartouche */
  for(const s of[-1,1])for(let lx=1;lx<=9;lx++)for(let y=0;y<=H;y++){const inP=lx>=3&&lx<=7&&((y>=4&&y<=14)||(y>=18&&y<=31)||(y>=35&&y<=43)),ed=inP&&(lx===3||lx===7||y===4||y===14||y===18||y===31||y===35||y===43);k.put(s*lx,y,0,inP?(ed?ml:fd):wd,'door')}
  for(let y=0;y<=H;y++)k.put(0,y,0,'#2e1d12','door');k.put(-2,24,1,C.brass,'door');k.put(2,24,1,C.brass,'door');
  k.box(-12,0,0,-10,H+4,1,C.white);k.box(10,0,0,12,H+4,1,C.white);k.box(-10,0,2,-10,H+1,2,C.gilt);k.box(10,0,2,10,H+1,2,C.gilt);k.box(-9,H+1,0,9,H+4,1,C.white);k.box(-10,H+1,2,10,H+1,2,C.gilt);
  k.box(-12,H+5,0,12,H+8,1,C.cream);for(const x of[-9,-5,5,9])k.put(x,H+6,2,C.gilt);k.box(-2,H+6,2,2,H+7,2,C.gilt);k.box(-13,H+9,0,13,H+10,2,C.white);k.box(-13,H+11,0,13,H+11,3,C.white);
  for(let h=0;h<=6;h++){const w=13-2*h;k.box(-w,H+12+h,0,w,H+12+h,2,C.white);if(w>3)k.box(-w+2,H+12+h,2,w-2,H+12+h,2,C.cream)}k.box(-1,H+13,3,1,H+15,3,C.gilt);k.put(0,H+16,3,C.gilt);
  return{V:k.V,size:[3.1,7.5,.46],anchor:'wall'}});
def('altarTable',{label:'Altar table with frontal and candles',room:'The village church, the Chapel',act:'look'},o=>{const k=kit(),f=o.c||'#7a1f2a';k.box(-12,0,-4,12,10,4,C.oak);k.box(-12,1,5,12,10,5,f,'face');for(let x=-11;x<=11;x+=2)k.put(x,10,5,C.gold,'face');k.box(-13,11,-5,13,11,5,C.white);
  /* v1.55: orphrey bands and a cross on the frontal, a standing cross between four candles, the book on its cushion (it was a box with two candles) */
  for(const x of[-7,7])k.box(x,1,5,x,9,5,C.gold,'face');k.box(0,3,5,0,8,5,C.gold,'face');k.box(-2,6,5,2,6,5,C.gold,'face');
  for(const x of[-10,-6,6,10]){const h=Math.abs(x)===6?19:17;k.box(x,12,0,x,13,0,C.brass);k.box(x,14,0,x,h,0,C.white);k.put(x,h+1,0,C.flame,'flame')}
  k.box(-1,12,-2,1,12,-1,C.brass);k.box(0,13,-2,0,21,-2,C.brass);k.box(-2,18,-2,2,18,-2,C.brass);k.box(-3,12,1,3,12,3,f);k.box(-2,13,1,2,13,2,C.leather);return{V:k.V,size:[3,2.3,1.3]}});

/* ---------------- variant map: layout.js picks one per room, so no two rooms repeat ---------------- */
P.variants={chairDining:['chairDining','chairHall','windsor'],armchair:['armchair','fauteuil'],sofa:['sofa','settee','chaise'],libraryTable:['libraryTable','pedestalTable'],chandelier:['chandelier','chandelierGilt'],bed4:['bed4','fourPosterOak']};
})(typeof PROPS!=='undefined'?PROPS:require('./props.js'));
