/* =========================================================
   Euphrates Hall Parts Depot: props6.js (Depot v20, Nov 13, 2026): the parts the v20 room plans and the winter dress call for.
   Load after props5.js. Same grid (unit .115, 8.7 cubes a block), front faces +z, wall pieces flat at their back.

   For the room plans:   pegRail, pictureLandscape (o.scene 'park'|'sea'|'snow'|'moor', o.seed), pierGlass, wallMap
   Winter dress, indoors: stockingRow, mantelGarland (o.len in blocks), wreath, christmasTree (o.lit false to put the candles out),
                          presents, roastingSpit
   Winter dress, outdoors: lightsTree (returns anchors and strings; o.lit), lightString (o.len, o.sag, o.white), bushLights (o.w, o.d), eaveGarland (o.len)
   The park at night:     werewolf (o.step 0|1: the two halves of a prowling stride; o.coat 'grey'|'black'|'brown')
   ========================================================= */
(function(P){const{def,kit,colors:C}=P;
const D=(n,label,room,act,fn,ex)=>def(n,Object.assign({label,room,act},ex||{}),o=>{const k=kit();const r=fn(k,o||{})||{};return Object.assign({V:k.V},r)});
const h3=(x,y,z,s)=>{let n=(x*374761393+y*668265263+z*2147483647+(s||0)*1274126177)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296};
const FIR='#1f4a2c',FIR2='#2c5f38',FIR3='#173a22',RED='#a3201f',BERRY='#c8312b',CORD='#6b4a2a',IRON='#2b2b2e',FLAME='#ffd98a',GOLD=C.gold||'#d4af37',GILT=C.gilt||'#c9a227',WH='#f1ede0';
const ST='Servants and stores',CS='Corridors and state rooms',WN='Winter dress';

/* ---- for the room plans ---- */
D('pegRail','Peg rail with an apron and a cap',ST+': every servant\'s bedroom, sculleries, the Boot Room','hang up',(k,o)=>{
  k.box(-9,6,0,9,8,0,C.oakL||'#8a6a45');for(const x of[-7,-3,0,4,7]){k.put(x,7,1,C.oak||'#5a4028');k.put(x,7,2,C.oak||'#5a4028')}
  k.box(-9,3,1,-5,6,1,WH);k.box(-8,0,1,-6,2,1,WH);k.put(-7,7,1,WH);                      /* an apron on the first peg */
  k.box(3,4,1,5,6,1,'#22242a');k.box(2,4,2,6,4,2,'#22242a');                             /* a cap on the fourth */
  if(o.coat!==false){k.box(6,1,1,8,6,1,'#3a3a44');k.box(6,1,2,8,5,2,'#3a3a44')}          /* a coat on the last */
  return{anchor:'wall'}},{wall:true});
D('pictureLandscape','Gilt-framed landscape',CS+': bedrooms, passages, drawing rooms','look',(k,o)=>{const sc=o.scene||['park','sea','snow','moor'][((o.seed|0)%4+4)%4],s=(o.seed|0)+3;
  k.box(-11,0,0,11,16,0,GILT);k.box(-12,-1,0,12,-1,0,GOLD);k.box(-12,17,0,12,17,0,GOLD);for(const x of[-12,12])k.box(x,0,0,x,16,0,GOLD);
  const sky=sc==='snow'?'#c9d3dc':sc==='moor'?'#b9a98f':'#9fc3e0',far=sc==='sea'?'#3f6f8f':sc==='snow'?'#e6ebee':sc==='moor'?'#6b5a3f':'#5a8f3a',near=sc==='sea'?'#2f5a78':sc==='snow'?'#f4f6f7':sc==='moor'?'#54452f':'#7a9a4a';
  for(let x=-10;x<=10;x++){const hz=7+Math.round(2*Math.sin((x+s)*.45)+1.2*Math.sin((x+s*2)*.9));for(let y=1;y<=15;y++)k.put(x,y,1,y>hz?sky:y>3+(sc==='sea'?0:Math.round(Math.sin((x-s)*.3))) ?far:near)}
  if(sc==='sea'){k.box(3,6,1,3,10,1,'#3a2a1c');k.box(4,7,1,6,9,1,WH);k.box(1,5,1,6,5,1,'#3a2a1c')}else{const tx=-5+(s%4);k.box(tx,4,1,tx,8,1,'#3a2a1c');for(let y=8;y<=12;y++)k.box(tx-(y<11?2:1),y,1,tx+(y<11?2:1),y,1,sc==='snow'?'#dfe5e8':sc==='moor'?'#7a5a2a':'#2f5f33')}
  k.put(7,13,1,sc==='moor'?'#e8b05a':'#fff4c8');k.put(8,13,1,sc==='moor'?'#e8b05a':'#fff4c8');return{anchor:'wall'}},{wall:true});
D('pierGlass','Pier glass',CS+': between the windows of any state room, the head of a passage','look',k=>{
  k.box(-7,0,0,6,24,0,GILT);k.box(-5,2,1,4,22,1,C.glass||'#bcd3dc');for(const y of[8,15])k.box(-5,y,1,4,y,1,GILT);
  k.box(-5,25,0,4,25,0,GILT);k.box(-3,26,0,2,26,0,GOLD);k.box(-1,27,0,0,27,0,GOLD);k.put(-7,25,0,GOLD);k.put(6,25,0,GOLD);return{anchor:'wall'}},{wall:true});
D('wallMap','Estate map on rollers',ST+': offices, the Map Room, the Schoolroom, the Agent\'s Room','read',k=>{
  k.box(-12,16,0,12,17,1,C.oak||'#5a4028');k.box(-12,0,0,12,1,1,C.oak||'#5a4028');k.box(-11,2,0,11,15,0,'#e9dfc3');
  for(let x=-10;x<=10;x++){const y=8+Math.round(2.4*Math.sin(x*.5));k.put(x,y,1,'#4f7fa8')}                 /* the river */
  k.box(-2,10,1,1,12,1,'#8a4a3a');k.box(-7,4,1,-4,6,1,'#5a8f3a');k.box(4,11,1,8,13,1,'#5a8f3a');for(const[x,y]of[[6,5],[7,5],[8,6],[-8,12],[-9,12]])k.put(x,y,1,'#6b5a3f');
  k.box(8,3,1,10,3,1,'#3a3a3a');k.put(9,4,1,RED);k.put(0,18,0,'#3a3a3a');return{anchor:'wall'}},{wall:true});

/* ---- winter dress, indoors ---- */
D('stockingRow','Stockings on the mantel',WN+': hang at the mantel shelf of any fireplace','look',k=>{
  k.box(-11,7,0,11,7,0,CORD);const cs=[RED,'#f1ede0','#2f5f33',RED,'#c9a227'];for(let i=0;i<5;i++){const x=-9+i*4+(i>2?1:0),c=cs[i];k.box(x,2,1,x+1,6,1,c);k.box(x,0,1,x+2,1,1,c);k.box(x,6,1,x+1,6,1,i===1?RED:WH);k.put(x,7,1,CORD)}
  return{anchor:'wall'}},{wall:true});
D('mantelGarland','Fir garland with berries and bows',WN+': along a mantel shelf, over a door, down a stair rail','look',(k,o)=>{const n=Math.max(12,Math.round((o.len||3)/.115)),x0=-Math.floor(n/2);
  for(let i=0;i<n;i++){const x=x0+i,u=i/(n-1),sag=Math.round(2.4*Math.sin(u*Math.PI*Math.max(1,Math.round(n/26)))**2);for(let dy=0;dy<2;dy++)for(let z=0;z<2;z++){if(h3(x,dy,z,7)<.12)continue;k.put(x,4-sag+dy,z,h3(x,dy,z,3)<.3?FIR2:h3(x,dy,z,5)<.25?FIR3:FIR)}
    if(i%5===2)k.put(x,4-sag,2,BERRY);if(i%13===6){k.box(x-1,5-sag,2,x+1,5-sag,2,RED);k.put(x,4-sag,2,RED);k.put(x-1,3-sag,2,RED);k.put(x+1,3-sag,2,RED)}}
  return{anchor:'wall'}},{wall:true,tile:[26,0]});
D('wreath','Holly wreath with a red bow',WN+': over a mantel, on a door, in a window','look',k=>{
  for(let x=-5;x<=5;x++)for(let y=-5;y<=5;y++){const d=Math.hypot(x,y);if(d<3||d>5.3)continue;for(let z=0;z<(d>3.6&&d<4.8?2:1);z++)k.put(x,y+6,z,h3(x,y,z,2)<.3?FIR2:FIR);if(h3(x,y,1,9)<.14)k.put(x,y+6,2,BERRY)}
  k.box(-2,1,2,2,1,2,RED);k.put(0,2,2,RED);k.box(-2,-1,2,-1,0,2,RED);k.box(1,-1,2,2,0,2,RED);return{anchor:'wall'}},{wall:true});
D('christmasTree','Christmas tree with candles',WN+': the Saloon, the Great Hall, the Entrance Hall, the Servants\' Hall, the Day Nursery','look',(k,o)=>{const lit=o.lit!==false,BAU=[RED,GOLD,'#2E5E9E','#c0c7cf'];
  /* vx3-M: carved at PU2 (the third level) in the old box (44 by 98 by 44 fine cells). Eight tiers of boughs: each a lobed skirt in the dark green (seven boughs that droop at their tips),
     a body that steps in twice, its top in the lighter green; candles on the ledges, baubles under the skirts, a gilt star; a crimson tub with gilt corners.
     Broad faces of one colour, so it meshes to fewer triangles than the old tree's 8,176 */
  k.box(-6,0,-6,5,1,5,'#5a1620');k.box(-6,2,-6,5,9,5,'#7a1f2b');k.box(-7,10,-7,6,11,6,GILT);for(const a of[-6,5])for(const b of[-6,5])k.box(a,2,b,a,9,b,GILT);k.box(-2,12,-2,1,17,1,'#3a2a1c');
  const rad=(t,a)=>{const R=21.6-t*2.35,lobe=Math.pow(Math.abs(Math.cos(a*3.5+t*.8)),.6);return R-2.2+2.2*lobe};
  for(let t=0;t<8;t++){const y0=16+t*10,Rr=21.6-t*2.35;
    for(let y=y0-1;y<=y0+9;y++){const j=y-y0;for(let x=-22;x<=21;x++)for(let z=-22;z<=21;z++){const dx=x+.5,dz=z+.5,d=Math.hypot(dx,dz),a=Math.atan2(dz,dx),rs=rad(t,a);
        if(j<0){if(d<=rs&&d>rs-1.6&&rs>Rr-.9)k.put(x,y,z,FIR3);continue}   /* the bough tips droop one cell */
        const r=j<=1?rs:j<=5?Rr-2.6:Rr-4.6;if(d>r)continue;k.put(x,y,z,j<=1?FIR3:(j===5||j===9)?FIR2:FIR)}}
    const nb=Math.max(3,Math.round(Rr*.55)),nc=Math.max(3,Math.round(Rr*.4));
    for(let i=0;i<nb;i++){const a=(i+.5)/nb*Math.PI*2+t*.37,rr=Rr-3.2,x=Math.round(Math.cos(a)*rr-.5),z=Math.round(Math.sin(a)*rr-.5);k.box(x,y0-3,z,x+1,y0-2,z+1,BAU[(i+t)%4])}
    if(t<7)for(let i=0;i<nc;i++){const a=(i+.25)/nc*Math.PI*2+t*.9,rr=Rr-3.4,x=Math.round(Math.cos(a)*rr-.5),z=Math.round(Math.sin(a)*rr-.5);k.box(x,y0+6,z,x,y0+8,z,WH);k.box(x,y0+9,z,x,y0+10,z,lit?FLAME:WH,lit?'flame':undefined)}}
  for(const[a,b]of[[-3,2],[-2,1]])k.box(a,94,-1,b,95,0,GOLD);k.box(-1,91,-1,0,97,0,GOLD,lit?'flame':undefined);k.box(-1,93,-2,0,96,1,GOLD);
  return{unit:P.PU2,glow:lit}},{light:true});
D('presents','Presents under the tree',WN+': at the foot of the tree','open',k=>{
  k.box(-4,0,-3,0,3,1,RED);k.box(-2,0,-3,-2,4,1,GOLD);k.box(-4,2,-1,0,2,-1,GOLD);k.box(1,0,-2,4,2,2,'#2E5E9E');k.box(1,1,0,4,1,0,WH);k.box(2,0,-2,2,3,2,WH);
  k.box(-3,0,2,-1,1,4,'#2f5f33');k.put(-2,2,3,RED);k.box(-3,4,-2,-1,5,0,'#c9a227');k.put(-2,6,-1,RED)},{});
D('roastingSpit','Roasting spit with a joint and a dripping pan',WN+': before the kitchen range or the Great Hall fire','turn the spit',k=>{
  for(const x of[-8,8]){k.box(x,0,-2,x,0,2,IRON);k.box(x,1,0,x,9,0,IRON);k.put(x,10,0,IRON)}k.box(-9,9,0,9,9,0,'#5a5a60');k.box(9,8,0,10,10,0,IRON);k.put(11,9,0,'#5a4028');
  for(let x=-4;x<=4;x++){const r=Math.abs(x)>3?1:2;for(let y=-r;y<=r;y++)for(let z=-r;z<=r;z++)if(Math.hypot(y,z)<=r+.4)k.put(x,9+y,z,h3(x,y,z,2)<.3?'#8a4a22':'#a85f2c')}
  k.box(-6,1,-3,6,1,3,'#3a3a3e');k.box(-5,2,-2,5,2,2,'#c98a3a');for(const x of[-6,6])k.box(x,2,-3,x,2,3,'#3a3a3e');for(const z of[-3,3])k.box(-6,2,z,6,2,z,'#3a3a3e')},{});

/* ---- winter dress, out of doors ---- */
/* The evergreen built for lights (for x -50, z 125). Coarse cubes (unit .23) so a tree nine blocks tall stays light.
   It returns anchors: a spiral of points just outside the boughs, in blocks from the foot of the trunk, top first, for the Estate to hang strings on;
   and strings: the same points cut into six runs from the tip to the skirt. o.lit true hangs a bulb at every anchor and lights the star. */
D('lightsTree','Evergreen built for lights',WN+': the great tree on the south lawn (x -50, z 125)','look',(k,o)=>{const U=.23,H=40,anchors=[],lit=!!o.lit;
  k.box(-1,0,-1,0,5,0,'#3a2a1c');const rad=y=>{const u=(y-4)/(H-4),tier=(y-4)%6;return Math.max(.7,(1-u)*8.4-tier*.5+1.6)};
  for(let y=4;y<=H;y++){const r=rad(y),tier=(y-4)%6;for(let x=-10;x<=10;x++)for(let z=-10;z<=10;z++){const d=Math.hypot(x+.5,z+.5);if(d>r||(d<r-2.2&&tier<5))continue;if(h3(x,y,z,1)<.08)continue;k.put(x,y,z,h3(x,y,z,4)<.28?FIR2:h3(x,y,z,6)<.2?FIR3:FIR)}}
  const turns=7,N=84;for(let i=0;i<N;i++){const u=i/(N-1),y=H-1-u*(H-6),r=rad(Math.round(y))+.7,a=u*turns*Math.PI*2;anchors.push([+(Math.cos(a)*r*U).toFixed(2),+((y+.5)*U).toFixed(2),+(Math.sin(a)*r*U).toFixed(2)])}
  if(lit)anchors.forEach((p,i)=>k.put(Math.round(p[0]/U-.5),Math.round(p[1]/U-.5),Math.round(p[2]/U-.5),['#ffd98a','#ff8a5a','#9fd0ff','#ffe9b0'][i%4],'flame'));
  k.box(-1,H+1,-1,0,H+2,0,GOLD,lit?'flame':undefined);k.box(-2,H+2,-1,1,H+2,0,GOLD);k.box(-1,H+3,-1,0,H+3,0,GOLD,lit?'flame':undefined);
  const strings=[];for(let s=0;s<6;s++)strings.push(anchors.slice(s*14,s*14+15));return{unit:U,anchors,strings,top:[0,+((H+3)*U).toFixed(2),0],glow:lit}},{light:true,outdoor:true});
D('lightString','String of lights',WN+': along eaves and cornices, over bushes and hedges, between lamp posts','look',(k,o)=>{const n=Math.max(8,Math.round((o.len||3)/.115)),x0=-Math.floor(n/2),sag=o.sag==null?2:o.sag,cs=o.white?['#ffe9b0']:['#ffd98a','#ff8a5a','#9fd0ff','#b8ffb0'];
  for(let i=0;i<n;i++){const x=x0+i,u=i/(n-1),y=3-Math.round(sag*Math.sin(u*Math.PI));k.put(x,y,0,'#2a2a2a');if(i%4===2)k.put(x,y-1,0,cs[(i>>2)%cs.length],'flame')}return{anchor:'wall',glow:true}},{wall:true,light:true,outdoor:true,tile:[26,0]});
D('bushLights','Net of lights for a bush or a hedge',WN+': thrown over any bush, topiary or hedge top','look',(k,o)=>{const w=Math.max(4,Math.round((o.w||1.4)/.115/2)),d=Math.max(4,Math.round((o.d||1.4)/.115/2)),cs=['#ffd98a','#ffe9b0','#ff8a5a'];
  for(let x=-w;x<=w;x++)for(let z=-d;z<=d;z++){if((x+z)%3!==0&&(x-z)%3!==0)continue;const y=Math.round(3*(1-(x*x)/(w*w+1))*(1-(z*z)/(d*d+1)));if((x*7+z*13)%5===0)k.put(x,y,z,cs[Math.abs(x+z)%3],'flame');else if(h3(x,y,z,3)<.35)k.put(x,y,z,'#2a2a2a')}return{glow:true}},{light:true,outdoor:true});
D('eaveGarland','Fir garland with lights for an eave or a porch',WN+': under the eaves of the lodges and the village houses, round the portico','look',(k,o)=>{const n=Math.max(12,Math.round((o.len||4)/.115)),x0=-Math.floor(n/2);
  for(let i=0;i<n;i++){const x=x0+i,u=i/(n-1),sag=Math.round(3*Math.sin(u*Math.PI*Math.max(1,Math.round(n/30)))**2);for(let dy=0;dy<2;dy++){if(h3(x,dy,0,7)<.1)continue;k.put(x,5-sag+dy,0,h3(x,dy,0,3)<.3?FIR2:FIR);if(dy===0&&h3(x,1,1,2)<.5)k.put(x,5-sag,1,FIR3)}if(i%6===3)k.put(x,4-sag,1,'#ffd98a','flame');if(i%15===7){k.put(x,5-sag,1,RED);k.put(x-1,4-sag,1,RED);k.put(x+1,4-sag,1,RED)}}
  return{anchor:'wall',glow:true}},{wall:true,light:true,outdoor:true,tile:[30,0]});

/* ---- the park at night ---- */
D('werewolf','Werewolf, prowling','The park and the woods after dark; never indoors','none',(k,o)=>{const coat=o.coat||'grey',base=coat==='black'?['#1d1d22','#2a2a31','#121216']:coat==='brown'?['#4a3626','#5e4631','#35261a']:['#565a60','#6c7077','#3d4046'],st=o.step?1:0;
  const fur=(x,y,z)=>{const h=h3(x,y,z,5);return h<.3?base[1]:h<.52?base[2]:base[0]},ell=(cx,cy,cz,rx,ry,rz)=>{for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++)for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let z=Math.floor(cz-rz);z<=Math.ceil(cz+rz);z++)if(((x-cx)/rx)**2+((y-cy)/ry)**2+((z-cz)/rz)**2<=1)k.put(x,y,z,fur(x,y,z))};
  const leg=(x,z,top,len,fwd)=>{for(let i=0;i<len;i++){const y=top-i,zz=z+Math.round(fwd*(i/len)*3-(i>len*.55?fwd*1.2:0));k.put(x,y,zz,fur(x,y,zz));k.put(x+(x<0?1:-1),y,zz,fur(x+1,y,zz));if(i<len*.5)k.put(x,y,zz-1,fur(x,y,zz-1))}const pz=z+Math.round(fwd*3-fwd*1.2);k.box(x-(x<0?0:1),0,pz,x+(x<0?1:0),0,pz+2,base[2]);for(const dx of[0,1])k.put(x-(x<0?0:1)+dx,0,pz+3,'#e8e2d0')};
  /* haunches high, shoulders hunched, the back sloping down to a low head: the walk of something hunting */
  ell(0,12,-6,3.6,3.6,4.6);ell(0,12.5,0,3.2,3.2,5);ell(0,13.5,6,4.2,4.4,4.4);ell(0,15.5,7,3,2.4,3);                     /* rump, barrel, shoulders, the hump */
  ell(0,11,11,2.4,2.4,2.6);ell(0,9.5,14.5,2.6,2.6,2.8);                                                                  /* neck slung low, the skull */
  for(let z=17;z<=21;z++){const r=z<19?1:0;k.box(-1-r,8,z,r,9+(z<20?1:0),z,fur(0,8,z))}k.box(-1,7,17,0,7,20,base[2]);   /* the muzzle and jaw */
  k.box(-1,9,21,0,9,21,'#16161a');for(const x of[-2,1]){k.put(x,11,16,'#f2c230','flame');k.put(x,13,13,base[2]);k.put(x,14,13,base[2]);k.put(x,15,12,base[2])}
  for(const z of[18,20])for(const x of[-1,0])k.put(x,7-(z===18?1:0),z,'#f1ede0');                                         /* teeth */
  for(let z=5;z<=10;z++)k.put(z%2?-1:0,17+(z<8?1:0),z,base[2]);                                                           /* hackles */
  leg(-3,7,11,11,st?1:-1);leg(3,7,11,11,st?-1:1);leg(-3,-7,10,10,st?-1:1);leg(3,-7,10,10,st?1:-1);
  for(let i=0;i<10;i++){const y=11-Math.round(i*.75),z=-11-i;for(const x of[-1,0])for(let dy=0;dy<(i<7?2:1);dy++)k.put(x,y+dy,z,fur(x,y+dy,z))}  /* the tail carried low */
  return{glow:true}},{figure:true,light:true});
})(typeof PROPS!=='undefined'?PROPS:require('./props.js'));
