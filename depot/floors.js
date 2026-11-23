/* =========================================================
   Euphrates Hall Parts Depot: floors.js (batch 3, Nov 12, 2026)
   Floors and ceilings as tileable canvas textures, plus which room gets which.
   FLOORS.texture(name, opts) -> a 256 x 256 canvas that tiles; FLOORS.PATTERNS[name].tile is how many
   blocks one copy covers. FLOORS.assign(room) -> {floor:{name,c}, ceiling:{name,c}}.
   In three.js: tex=new THREE.CanvasTexture(canvas); tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
   tex.repeat.set(w/tile, d/tile); tex.colorSpace=THREE.SRGBColorSpace; tex.magFilter=THREE.NearestFilter.
   The 3D ceiling pieces (rose, coffer, beam, hammerbeam) are props in props3.js.
   ========================================================= */
const FLOORS=(()=>{
const N=256;
function rng(s){s=(s>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16&255,g=n>>8&255,b=n&255;r=Math.max(0,Math.min(255,r*f|0));g=Math.max(0,Math.min(255,g*f|0));b=Math.max(0,Math.min(255,b*f|0));return`rgb(${r},${g},${b})`}
const P={
 parquet:{label:'Oak parquet, chevron',tile:4,draw(x,o,R){const c=o.c||'#9a6a42',CW=32,h=16,sk=16;x.fillStyle=shade(c,.6);x.fillRect(0,0,N,N);
   for(let col=0;col<N/CW;col++){const up=col%2===0;for(let y=-2*h;y<N+2*h;y+=h){const x0=col*CW,y0=y,y1=up?y-sk:y+sk;x.fillStyle=shade(c,.82+R()*.32);x.beginPath();x.moveTo(x0,y0);x.lineTo(x0+CW,y1);x.lineTo(x0+CW,y1+h-1.5);x.lineTo(x0,y0+h-1.5);x.closePath();x.fill();
     x.fillStyle=shade(c,.7);x.fillRect(x0+4+R()*20,y0+3+(up?-6:6),8,1)}}}},
 boards:{label:'Wide oak boards',tile:4,draw(x,o,R){const c=o.c||'#a07a52',h=32;for(let y=0;y<N;y+=h){let s=0;while(s<N){const len=80+R()*140|0;x.fillStyle=shade(c,.85+R()*.3);x.fillRect(s,y,len,h-2);x.fillStyle=shade(c,.6);x.fillRect(s+len-2,y,2,h-2);s+=len}
   x.fillStyle=shade(c,.5);x.fillRect(0,y+h-2,N,2);for(let k=0;k<6;k++){x.fillStyle=shade(c,.75);x.fillRect(R()*N,y+4+R()*(h-10),18+R()*30,1)}}}},
 marbleChecker:{label:'Black and white marble',tile:4,draw(x,o,R){const a=o.c||'#ece8df',b=o.c2||'#22201e',s=N/4;for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?b:a;x.fillRect(i*s,j*s,s,s);
   x.strokeStyle=(i+j)%2?'rgba(255,255,255,.12)':'rgba(0,0,0,.12)';for(let v=0;v<3;v++){x.beginPath();let px=i*s+R()*s,py=j*s;x.moveTo(px,py);for(let t=0;t<6;t++){px+=(R()-.5)*20;py+=s/6;x.lineTo(px,py)}x.stroke()}}x.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<=4;i++){x.fillRect(i*s-1,0,2,N);x.fillRect(0,i*s-1,N,2)}}},
 marbleStar:{label:'White marble with black lozenges',tile:4,draw(x,o,R){x.fillStyle=o.c||'#ece8df';x.fillRect(0,0,N,N);const s=N/2;x.fillStyle=o.c2||'#22201e';for(const[cx,cy]of[[0,0],[s,0],[N,0],[0,s],[s,s],[N,s],[0,N],[s,N],[N,N]]){x.beginPath();x.moveTo(cx,cy-28);x.lineTo(cx+28,cy);x.lineTo(cx,cy+28);x.lineTo(cx-28,cy);x.closePath();x.fill()}
   x.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<=2;i++){x.beginPath();x.moveTo(i*s,0);x.lineTo(i*s,N);x.moveTo(0,i*s);x.lineTo(N,i*s);x.stroke()}x.strokeStyle='rgba(120,110,100,.15)';for(let v=0;v<10;v++){x.beginPath();let px=R()*N,py=R()*N;x.moveTo(px,py);for(let t=0;t<5;t++){px+=(R()-.5)*40;py+=(R()-.5)*40;x.lineTo(px,py)}x.stroke()}}},
 encaustic:{label:'Encaustic tiles (red, buff, black)',tile:2,draw(x,o,R){const s=N/4,cs=['#9c3b2a','#d8c49a','#2a2420','#4a6a5a'];for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.fillStyle=cs[1];x.fillRect(i*s,j*s,s,s);x.fillStyle=cs[(i+j)%2?0:3];x.beginPath();x.moveTo(i*s+s/2,j*s+6);x.lineTo(i*s+s-6,j*s+s/2);x.lineTo(i*s+s/2,j*s+s-6);x.lineTo(i*s+6,j*s+s/2);x.closePath();x.fill();
   x.fillStyle=cs[2];x.fillRect(i*s+s/2-5,j*s+s/2-5,10,10);x.fillStyle='rgba(0,0,0,.3)';x.fillRect(i*s,j*s,s,1);x.fillRect(i*s,j*s,1,s)}}},
 flagstone:{label:'York flagstones',tile:4,draw(x,o,R){x.fillStyle='#5a554c';x.fillRect(0,0,N,N);const rows=[0,70,150,210,N];for(let r=0;r<rows.length-1;r++){let s=0;while(s<N){const w=60+R()*80|0;x.fillStyle=shade(o.c||'#9a9284',.85+R()*.25);x.fillRect(s+2,rows[r]+2,Math.min(w,N-s)-4,rows[r+1]-rows[r]-4);s+=w}}
   for(let k=0;k<400;k++){x.fillStyle=`rgba(0,0,0,${R()*.08})`;x.fillRect(R()*N,R()*N,2,2)}}},
 cobbles:{label:'Cobbled yard',tile:2,draw(x,o,R){x.fillStyle='#4a4640';x.fillRect(0,0,N,N);for(let j=0;j<N;j+=20)for(let i=(j/20%2)*10;i<N+20;i+=22){x.fillStyle=shade(o.c||'#8a8478',.75+R()*.4);x.beginPath();x.ellipse(i,j+10,10,8,0,0,6.3);x.fill()}}},
 gravel:{label:'Raked gravel',tile:2,draw(x,o,R){x.fillStyle=o.c||'#c9b88a';x.fillRect(0,0,N,N);for(let k=0;k<3000;k++){x.fillStyle=shade(o.c||'#c9b88a',.7+R()*.5);x.fillRect(R()*N,R()*N,2,2)}}},
 lawn:{label:'Mown lawn in stripes',tile:8,draw(x,o,R){for(let i=0;i<4;i++){x.fillStyle=i%2?'#5a8a3a':'#4f7c33';x.fillRect(i*64,0,64,N)}for(let k=0;k<2500;k++){x.fillStyle=`rgba(${R()<.5?'20,40,10':'140,180,90'},.25)`;x.fillRect(R()*N,R()*N,1,3)}}},
 carpet:{label:'Fitted carpet with border',tile:4,draw(x,o,R){const c=o.c||'#7a1f2a';x.fillStyle=c;x.fillRect(0,0,N,N);x.fillStyle=shade(c,1.25);for(let i=0;i<N;i+=32)for(let j=0;j<N;j+=32){x.beginPath();x.arc(i+16,j+16,6,0,6.3);x.fill();x.fillRect(i+15,j+4,2,24);x.fillRect(i+4,j+15,24,2)}}},
 plaster:{label:'Plaster ceiling with moulded panels',tile:8,ceiling:true,draw(x,o,R){x.fillStyle=o.c||'#efe9dc';x.fillRect(0,0,N,N);x.strokeStyle='#c9a227';x.lineWidth=3;x.strokeRect(20,20,N-40,N-40);x.strokeStyle='rgba(0,0,0,.12)';x.lineWidth=6;x.strokeRect(30,30,N-60,N-60);
   x.fillStyle='#e2d8c2';for(const[a,b]of[[20,20],[N-20,20],[20,N-20],[N-20,N-20]]){x.beginPath();x.arc(a,b,12,0,6.3);x.fill()}}},
 painted:{label:'Painted sky ceiling',tile:16,ceiling:true,draw(x,o,R){const g=x.createLinearGradient(0,0,N,N);g.addColorStop(0,'#8fb3d4');g.addColorStop(1,'#c9dbe8');x.fillStyle=g;x.fillRect(0,0,N,N);for(let k=0;k<26;k++){const cx=R()*N,cy=R()*N;for(let p=0;p<6;p++){x.fillStyle=`rgba(255,250,240,${.25+R()*.4})`;x.beginPath();x.arc(cx+(R()-.5)*50,cy+(R()-.5)*24,10+R()*18,0,6.3);x.fill()}}
   x.strokeStyle='#c9a227';x.lineWidth=6;x.strokeRect(3,3,N-6,N-6)}},
 beamed:{label:'Beamed ceiling (oak on white)',tile:4,ceiling:true,draw(x,o,R){x.fillStyle='#e9e2d0';x.fillRect(0,0,N,N);for(let i=0;i<N;i+=64){x.fillStyle='#5a3a22';x.fillRect(i,0,18,N);x.fillStyle='#6b4226';x.fillRect(i+2,0,4,N)}}},
 timber:{label:'Timber ceiling (dark boards under dark beams)',tile:4,ceiling:true,draw(x,o,R){x.fillStyle='#4a3220';x.fillRect(0,0,N,N);for(let i=0;i<N;i+=16){x.fillStyle=(i/16)%2?'#543a25':'#46301e';x.fillRect(i,0,15,N)}for(let i=0;i<N;i+=64){x.fillStyle='#2b1d12';x.fillRect(i,0,18,N);x.fillStyle='#3a2819';x.fillRect(i+2,0,4,N)}}},   /* v1.57: the stable court's ceilings (the white slat grid over the Stalls) */
 vaulted:{label:'Brick vault with stone ribs',tile:4,ceiling:true,draw(x,o,R){for(let j=0;j<N;j+=12)for(let i=(j/12%2)*16;i<N+32;i+=32){x.fillStyle=shade('#8a4a32',.8+R()*.35);x.fillRect(i-16,j,30,10)}x.fillStyle='#bdb5a2';x.fillRect(0,N/2-6,N,12);x.fillRect(N/2-6,0,12,N);
   x.save();x.translate(N/2,N/2);x.rotate(Math.PI/4);x.fillRect(-N,-4,N*2,8);x.rotate(Math.PI/2);x.fillRect(-N,-4,N*2,8);x.restore()}},
 stucco:{label:'Gilt stucco, Rococo',tile:8,ceiling:true,draw(x,o,R){x.fillStyle=o.c||'#f2ece0';x.fillRect(0,0,N,N);x.strokeStyle='#c9a227';x.lineWidth=3;for(let k=0;k<4;k++){x.save();x.translate(N/2,N/2);x.rotate(k*Math.PI/2);x.beginPath();x.moveTo(30,30);x.bezierCurveTo(90,10,110,80,60,100);x.bezierCurveTo(30,110,40,70,70,72);x.stroke();
   x.beginPath();x.arc(110,110,10,0,6.3);x.stroke();x.restore()}x.beginPath();x.arc(N/2,N/2,22,0,6.3);x.stroke();x.strokeRect(6,6,N-12,N-12)}}
};
function texture(name,o={},size){const p=P[name];if(!p)throw new Error('No pattern '+name);const cv=(typeof document!=='undefined')?document.createElement('canvas'):null;if(!cv)return null;cv.width=cv.height=N;const x=cv.getContext('2d');p.draw(x,o,rng(o.seed||[...name].reduce((a,c)=>a*31+c.charCodeAt(0),7)));return cv}
const ROOM={'entrance':['marbleStar','plaster'],'saloon':['marbleChecker','painted'],'great-hall':['flagstone','beamed'],'dining':['parquet','stucco'],'library':['parquet','plaster'],'drawing':['parquet','stucco'],
 'music':['parquet','stucco'],'morning':['parquet','plaster'],'smoking':['boards','beamed'],'billiard':['boards','plaster'],'gun-room':['boards','beamed'],'estate-office':['boards','plaster'],'business':['boards','plaster'],
 'map-room':['parquet','plaster'],'muniment':['flagstone','vaulted'],'servery':['encaustic','plaster'],'long-gallery':['parquet','stucco'],'calendar':['boards','plaster'],'registry':['boards','plaster'],'schoolroom':['boards','plaster'],
 'bedchamber':['carpet','stucco'],'dressing':['carpet','plaster'],'bath':['marbleChecker','plaster'],'study':['carpet','plaster'],'wine':['flagstone','vaulted'],'beer':['flagstone','vaulted'],'ballroom':['parquet','painted'],
 'theatre':['boards','painted'],'card-room':['carpet','stucco'],'orangery':['marbleStar','painted'],'chapel':['encaustic','vaulted'],'stable-court':['cobbles',null],'kitchen-court':['cobbles',null],'glasshouse':['flagstone',null],
 'wireless':['boards','plaster'],'observatory':['boards','painted'],'belvedere':['carpet','painted'],'laundry':['flagstone','beamed'],'bakehouse':['flagstone','beamed'],'carpenter':['boards','beamed'],'gatehouse':['flagstone','beamed']};
function assign(room){const r=ROOM[room.id];const dec=room.decor&&room.decor.color;if(r)return{floor:{name:r[0],c:r[0]==='carpet'&&dec?dec:undefined},ceiling:r[1]?{name:r[1]}:null};
  if(room.id&&room.id.endsWith('-bed'))return{floor:{name:'carpet',c:dec},ceiling:{name:'plaster'}};
  if(room.level==='below')return{floor:{name:'flagstone'},ceiling:{name:'beamed'}};if(room.level==='attic')return{floor:{name:'boards',c:'#8a6a4a'},ceiling:{name:'beamed'}};
  if(room.kind==='stair')return{floor:{name:'boards'},ceiling:{name:'plaster'}};return{floor:{name:'boards'},ceiling:{name:'plaster'}}}
return{texture,assign,PATTERNS:P,ROOM}})();
if(typeof module!=='undefined')module.exports=FLOORS;
