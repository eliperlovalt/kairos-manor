/* =========================================================
   Euphrates Hall Parts Depot: flowers.js v2 (Depot v20, Nov 13, 2026; v1 was Depot v14)
   v20, a stronger spring: five bulbs and early flowers (snowdrop, crocus, daffodil, primrose, bluebell), three layouts
   (drift, carpet, spring), FLOWERS.inBloom(st) and FLOWERS.SPRING. Snowdrop and crocus flower through the snow.
   The flower kit. Small-voxel flowers with stems, leaves and petals, grown from a seed:
   rose, lily, lavender, tulip, hydrangea, iris, peony, poppy, and a wildflower mix.
   Plus layouts that fill a rectangle: bed, border, parterre, rows, meadow.

   Plain script. No imports, no network. three.js is passed in where needed.
   Load after trees.js (it uses TREES.mesh, the greedy mesher) and seasons.js (optional).
   Voxel format as props.js: a Map "x,y,z" -> [x,y,z,colour,part]. Parts: 'stem','leaf','petal','eye'.
   Near grid: unit .0625 (16 voxels per Estate block). Far grid: unit .25, a few cubes per plant.
   Origin is the foot of the plant, y up. One unit is one Estate block.

   FLOWERS.build(species,{seed,color,stage,lod})   -> {V,unit,size,kind,info,count}
        color: a name from FLOWERS.info[species].colors (default: picked by seed)
        stage: 'bloom' | 'green' | 'bare' | 'dry'  (default 'bloom'); FLOWERS.stage(species,st) picks it from SEASONS.state
        lod:   'near' | 'far'
   FLOWERS.geometry(THREE,species,{seed,color,stage,lod}) -> cached BufferGeometry
   FLOWERS.layout(kind,rect,opts)                  -> [{species,color,x,z,rot,seed}], see LAYOUTS
   FLOWERS.plant(THREE,list,{st,far,gone,variants}) -> an instanced planting, see the end of the file
   ========================================================= */
const FLOWERS=(()=>{
const U=.0625,FU=.25;
function rng(seed){let s=((seed*2654435761)>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function h3(x,y,z,s){let h=(x*374761393+y*668265263+z*2147483647+(s|0)*144665)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296}
function grid(){const V=new Map();const put=(x,y,z,c,p)=>{x=Math.round(x);y=Math.round(y);z=Math.round(z);if(y<0)return;V.set(x+','+y+','+z,[x,y,z,c,p||'stem'])};
  const box=(x0,y0,z0,x1,y1,z1,c,p)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)put(x,y,z,c,p)};
  const blob=(cx,cy,cz,rx,ry,rz,cf,p,seed)=>{for(let x=-Math.ceil(rx);x<=rx;x++)for(let y=-Math.ceil(ry);y<=ry;y++)for(let z=-Math.ceil(rz);z<=rz;z++){const q=x*x/(rx*rx)+y*y/(ry*ry)+z*z/(rz*rz);if(q>1)continue;
    const X=Math.round(cx+x),Y=Math.round(cy+y),Z=Math.round(cz+z);if(seed!=null&&q>.7&&h3(X>>1,Y>>1,Z>>1,seed)<.28)continue;put(X,Y,Z,typeof cf==='function'?cf(X,Y,Z):cf,p)}};
  /* a blob in 2-voxel cells: bush foliage stays cheap, blooms stay fine */
  const cblob=(cx,cy,cz,rx,ry,rz,cf,p)=>{rx/=2;ry/=2;rz/=2;for(let x=-Math.ceil(rx);x<=rx;x++)for(let y=-Math.ceil(ry);y<=ry;y++)for(let z=-Math.ceil(rz);z<=rz;z++){if(x*x/(rx*rx)+y*y/(ry*ry)+z*z/(rz*rz)>1)continue;
    const X=(Math.round(cx/2)+x)*2,Y=(Math.round(cy/2)+y)*2,Z=(Math.round(cz/2)+z)*2,c=typeof cf==='function'?cf(X,Y,Z):cf;for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let d=0;d<2;d++)put(X+a,Y+b,Z+d,c,p)}};
  return{V,put,box,blob,cblob}}
const G={stem:'#3f6b2a',stemD:'#2f5524',leaf:'#3f7a33',leafD:'#2f5a2a',leafL:'#5a8a3a',sage:'#7d8f72',sageD:'#66785e',cane:'#5a4632',dry:'#8a6a48',dryD:'#6e5238',gold:'#e8c02a',black:'#1e1612'};
const lum=(c,f)=>{const n=parseInt(c.slice(1),16),m=v=>Math.max(0,Math.min(255,Math.round(v*f)));return'#'+((1<<24)|(m(n>>16&255)<<16)|(m(n>>8&255)<<8)|m(n&255)).toString(16).slice(1)};
/* leaf shading in broad patches so faces still merge */
const leafy=(seed,a,b,c)=>(x,y,z)=>{const n=h3(x>>2,y>>2,z>>2,seed);return n<.3?b:n>.75?c:a};

const SP={};
SP.tulip={label:'Tulip',where:'Spring beds by the terrace, pots, the parterre',height:.45,spread:.3,bloom:[95,135],after:'bare',winter:'bare',
  colors:{red:'#c0262b',yellow:'#e8c02a',pink:'#e58aa8',white:'#f2efe6',purple:'#6b3a8a',orange:'#e07a2a'},
  grow(g,r,c,st,seed){if(st==='bare')return;const h=5+Math.floor(r()*3);g.box(0,0,0,0,h-1,0,G.stem);
    for(const[dx,dz]of[[1,0],[-1,0]]){const L=3+Math.floor(r()*2);for(let i=0;i<L;i++)g.put(dx*(i>1?2:1),i,dz,dx>0?G.leaf:G.leafD,'leaf')}
    if(st!=='bloom')return;g.box(-1,h,-1,1,h+1,1,c,'petal');g.box(0,h+2,-1,0,h+2,1,lum(c,1.15),'petal');g.box(-1,h+2,0,1,h+2,0,lum(c,1.15),'petal');g.put(0,h+2,0,lum(c,.7),'eye');g.put(0,h,0,lum(c,.8),'petal')}};
SP.rose={label:'Rose bush',where:'The rose garden, the pergola walk, under the south windows',height:1,spread:.8,bloom:[150,290],after:'green',winter:'bare',
  colors:{red:'#a81e2b',pink:'#e58aa8',white:'#f4efe6',yellow:'#e8c860',apricot:'#eba46a',crimson:'#7a1f2a'},
  grow(g,r,c,st,seed){const canes=3+Math.floor(r()*2);for(let i=0;i<canes;i++){const a=i/canes*6.283+r(),R=1.5+r()*2;for(let y=0;y<=(st==='bare'?9:6);y++)g.put(Math.cos(a)*R*y/7,y,Math.sin(a)*R*y/7,G.cane)}
    if(st==='bare'){for(let i=0;i<4;i++){const a=r()*6.283;g.put(Math.cos(a)*3,7+i%3,Math.sin(a)*3,G.cane)}return}
    g.cblob(0,9,0,5.5,4.5,5.5,leafy(seed,G.leafD,'#264a24',G.leaf),'leaf');if(st!=='bloom')return;
    const n=6+Math.floor(r()*4);for(let i=0;i<n;i++){const a=i/n*6.283+r()*.6,el=.15+r()*1.1,x=Math.round(Math.cos(a)*Math.cos(el)*6),y=Math.round(9+Math.sin(el)*5.4),z=Math.round(Math.sin(a)*Math.cos(el)*6);
      g.box(x-1,y,z-1,x+1,y+1,z+1,c,'petal');g.put(x,y+2,z,lum(c,1.18),'petal');g.put(x,y+1,z,lum(c,.72),'eye')}}};
SP.lily={label:'Lily',where:'Back of the borders, the chapel beds',height:.95,spread:.3,bloom:[170,230],after:'green',winter:'bare',
  colors:{white:'#f4f1ea',orange:'#e8862a',pink:'#eaa0b8',yellow:'#ecd060'},
  grow(g,r,c,st,seed){if(st==='bare')return;const h=11+Math.floor(r()*3);g.box(0,0,0,0,h,0,G.stem);for(let y=1;y<h-2;y+=3){const a=y*2.4,dx=Math.round(Math.cos(a)),dz=Math.round(Math.sin(a));g.put(dx,y,dz,G.leaf,'leaf');g.put(dx*2,y,dz*2,G.leaf,'leaf')}
    if(st!=='bloom'){g.put(0,h+1,0,G.leafL,'leaf');return}
    const n=2;for(let i=0;i<n;i++){const a=i/n*6.283+r(),dx=Math.round(Math.cos(a)*2),dz=Math.round(Math.sin(a)*2),y=h-i*3;g.put(Math.sign(dx),y,Math.sign(dz),G.stem);
      const x=dx,z=dz;g.put(x,y+1,z,G.gold,'eye');for(const[px,pz]of[[1,0],[-1,0],[0,1],[0,-1]]){g.put(x+px,y+1,z+pz,c,'petal');g.put(x+px*2,y+2,z+pz*2,lum(c,1.08),'petal')}}}};
SP.lavender={label:'Lavender',where:'Path edges, the kitchen garden, long rows on the south slope',height:.5,spread:.45,bloom:[165,235],after:'green',winter:'green',evergreen:true,
  colors:{purple:'#7a5aa8',violet:'#5a3a8a',pale:'#a892c8'},
  grow(g,r,c,st,seed){g.blob(0,2,0,3.6,3,3.6,(x,y,z)=>y>3?'#8e9f82':y<1?G.sageD:G.sage,'leaf');const n=st==='bloom'?8+Math.floor(r()*3):5;
    for(let i=0;i<n;i++){const a=i/n*6.283+r()*.5,R=r()*3.2,x=Math.round(Math.cos(a)*R),z=Math.round(Math.sin(a)*R),h=6+Math.floor(r()*2);g.box(x,4,z,x,h,z,G.sageD);if(st==='bloom'){g.box(x,h+1,z,x,h+2,z,c,'petal');g.put(x,h+3,z,lum(c,1.18),'petal')}}}};
SP.hydrangea={label:'Hydrangea',where:'Shaded north beds, beside the steps, the lake walk',height:1.1,spread:1,bloom:[175,270],after:'dry',winter:'bare',
  colors:{blue:'#6a8ad0',pink:'#e08ab0',white:'#f0eee4',purple:'#8a6ac0'},
  grow(g,r,c,st,seed){for(let i=0;i<4;i++){const a=i/4*6.283+r();for(let y=0;y<=(st==='bare'?10:5);y++)g.put(Math.cos(a)*(1+y*.35),y,Math.sin(a)*(1+y*.35),G.cane)}
    const heads=5+Math.floor(r()*3),col=st==='dry'||st==='bare'?G.dry:c,hd=[];for(let i=0;i<heads;i++){const a=i/heads*6.283+r()*.6,el=.25+r()*1,x=Math.round(Math.cos(a)*Math.cos(el)*6),y=Math.round(9+Math.sin(el)*5.5),z=Math.round(Math.sin(a)*Math.cos(el)*6);hd.push([x,y,z])}
    if(st==='bare'){for(const[x,y,z]of hd.slice(0,3))g.box(x*.6-1,10,z*.6-1,x*.6,11,z*.6,G.dryD,'petal');return}
    g.cblob(0,8,0,7,5.5,7,leafy(seed,G.leaf,G.leafD,G.leafL),'leaf');if(st==='green')return;
    for(const[x,y,z]of hd){const s2=h3(x,y,z,seed);g.cblob(x,y+1,z,3,2.2,3,(X,Y,Z)=>Y>y+1?lum(col,1.12):Y<y?lum(col,.86):col,'petal')}}};
SP.iris={label:'Bearded iris',where:'The lake margin, the front of the long border',height:.8,spread:.42,bloom:[125,170],after:'green',winter:'bare',
  colors:{purple:'#5a3a9a',blue:'#4a5ac0',yellow:'#e8c840',white:'#f0eef0'},
  grow(g,r,c,st,seed){if(st==='bare'){g.box(-1,0,0,1,1,0,G.dry,'leaf');return}const blades=4+Math.floor(r()*2);for(let i=0;i<blades;i++){const x=i-Math.floor(blades/2),h=6+Math.floor(r()*4)-Math.abs(x);for(let y=0;y<=h;y++)g.put(x+(y>h-2?Math.sign(x):0),y,0,i%2?G.leaf:G.leafL,'leaf')}
    if(st!=='bloom')return;const h=10+Math.floor(r()*2);g.box(0,0,1,0,h,1,G.stem);const y=h+1,z=1;g.box(0,y,z,0,y+2,z,c,'petal');g.put(-1,y+1,z,lum(c,1.15),'petal');g.put(1,y+1,z,lum(c,1.15),'petal');g.put(0,y+1,z-1,lum(c,1.15),'petal');g.put(0,y+1,z+1,lum(c,1.15),'petal');
    for(const[px,pz]of[[1,0],[-1,0],[0,1]]){g.put(px,y,z+pz,lum(c,.8),'petal');g.put(px*2,y-1,z+pz*2,lum(c,.8),'petal');g.put(px,y,z+pz,G.gold,'eye')}}};
SP.peony={label:'Peony',where:'The middle of the borders, by the garden gate',height:.75,spread:.7,bloom:[135,175],after:'green',winter:'bare',
  colors:{pink:'#eaa6c0',rose:'#c8487a',white:'#f6f0ea',coral:'#ec8a72'},
  grow(g,r,c,st,seed){if(st==='bare')return;g.box(0,0,0,0,3,0,G.stemD);g.cblob(0,6,0,4.6,3.6,4.6,leafy(seed,G.leafD,'#2a5028',G.leaf),'leaf');if(st!=='bloom')return;
    const n=3+Math.floor(r()*2);for(let i=0;i<n;i++){const a=i/n*6.283+r()*.7,R=i?3.4:0,x=Math.round(Math.cos(a)*R),z=Math.round(Math.sin(a)*R),y=i?8:9;
      g.box(x-2,y,z-1,x+2,y+1,z+1,c,'petal');g.box(x-1,y,z-2,x+1,y+1,z+2,c,'petal');g.box(x-1,y+2,z-1,x+1,y+2,z+1,lum(c,1.1),'petal');g.put(x,y+3,z,lum(c,.84),'eye')}
    const a=r()*6.283;g.box(Math.round(Math.cos(a)*4),9,Math.round(Math.sin(a)*4),Math.round(Math.cos(a)*4),10,Math.round(Math.sin(a)*4),lum(c,.8),'petal')}};
SP.poppy={label:'Field poppy',where:'The meadow, the orchard grass, loose among the borders',height:.6,spread:.32,bloom:[140,200],after:'bare',winter:'bare',
  colors:{red:'#d8322a',orange:'#e8742a',pink:'#e89aa8'},
  grow(g,r,c,st,seed){if(st==='bare')return;const h=6+Math.floor(r()*4),lean=r()<.5?1:-1;for(let y=0;y<=h;y++)g.put(y>h*.6?lean:0,y,0,G.stem);g.box(-1,0,-1,1,0,1,G.leafD,'leaf');g.put(2,1,0,G.leaf,'leaf');g.put(-2,1,0,G.leaf,'leaf');g.put(0,1,2,G.leaf,'leaf');
    if(st!=='bloom'){g.put(lean,h+1,0,G.sageD,'eye');return}const x=lean,y=h+1;g.box(x-1,y,-1,x+1,y,1,c,'petal');for(const[px,pz]of[[2,0],[-2,0],[0,2],[0,-2]]){g.put(x+px,y+1,pz,lum(c,1.1),'petal');g.put(x+(px>>1),y+1,pz>>1,c,'petal')}g.put(x,y,0,G.black,'eye');g.put(x,y+1,0,G.black,'eye')}};
SP.wild={label:'Wildflowers',where:'The meadow, the park edge, under the orchard trees',height:.45,spread:.35,bloom:[120,260],after:'green',winter:'bare',
  colors:{mixed:'#ffffff',daisy:'#f4f1ea',cornflower:'#4a6ad8',buttercup:'#f0d030',campion:'#d85a9a'},
  grow(g,r,c,st,seed,name){if(st==='bare'){g.put(0,0,0,G.dry,'leaf');return}const kinds=['daisy','cornflower','buttercup','campion'],n=3+Math.floor(r()*2);
    for(let i=0;i<2;i++){const a=r()*6.283,h=2+Math.floor(r()*3);for(let y=0;y<=h;y++)g.put(Math.cos(a)*(1+y*.5),y,Math.sin(a)*(1+y*.5),G.leaf,'leaf')}
    for(let i=0;i<n;i++){const k=name==='mixed'?kinds[Math.floor(r()*4)]:name,cc=SP.wild.colors[k],a=i/n*6.283+r(),R=1+r()*3,x=Math.round(Math.cos(a)*R),z=Math.round(Math.sin(a)*R),h=3+Math.floor(r()*4);g.box(x,0,z,x,h,z,G.stem);if(st!=='bloom')continue;
      if(k==='daisy'){g.box(x-1,h+1,z,x+1,h+1,z,cc,'petal');g.box(x,h+1,z-1,x,h+1,z+1,cc,'petal');g.put(x,h+1,z,G.gold,'eye')}
      else if(k==='cornflower'){g.box(x-1,h+1,z-1,x+1,h+1,z+1,cc,'petal');g.put(x,h+2,z,lum(cc,1.2),'petal')}
      else if(k==='buttercup'){g.put(x,h+1,z,cc,'petal');g.put(x+1,h+1,z,lum(cc,.9),'petal')}
      else{g.put(x,h+1,z,cc,'petal');g.put(x,h+2,z,lum(cc,1.15),'petal');g.put(x+1,h+1,z,cc,'petal');g.put(x,h+1,z+1,cc,'petal')}}}};
/* ---------- v20: the spring bulbs, so the garden flowers from February, not from April ---------- */
SP.snowdrop={label:'Snowdrop',where:'Under the bare trees, the churchyard, the north banks: the first flower of the year',height:.22,spread:.17,bloom:[40,84],after:'bare',winter:'bare',hardy:true,
  colors:{white:'#f7f7f1'},
  grow(g,r,c,st){if(st==='bare')return;const n=2+Math.floor(r()*3);for(let i=0;i<n;i++){const x=(i%3)-1,z=i>2?1:(i&1),h=2+Math.floor(r()*2);g.box(x,0,z,x,h-1,z,i&1?G.leaf:G.leafD,'leaf');if(st!=='bloom')continue;g.put(x,h,z,G.stem);const d=i&1?1:-1;g.put(x+d,h,z,c,'petal');g.put(x+d,h-1,z,lum(c,.93),'petal')}}};
SP.crocus={label:'Crocus',where:'In the lawn in drifts, round the feet of the trees, the edges of the walks',height:.2,spread:.16,bloom:[60,97],after:'bare',winter:'bare',hardy:true,
  colors:{purple:'#7a4aa8',yellow:'#f0b820',white:'#f4f1e8',lilac:'#b392d6'},
  grow(g,r,c,st){if(st==='bare')return;const n=1+Math.floor(r()*3);for(let i=0;i<n;i++){const x=(i%2)*2-1+(i>1?1:0),z=i>1?-1:(i&1);g.put(x,0,z,G.leaf,'leaf');g.put(x+1,0,z,G.leafD,'leaf');g.put(x,1,z,st==='bloom'?c:G.leafL,st==='bloom'?'petal':'leaf');if(st==='bloom'){g.put(x,2,z,lum(c,1.12),'petal');if(r()<.5)g.put(x,3,z,'#f08a1c','eye')}}}};
SP.daffodil={label:'Daffodil',where:'Drifts in the park grass, the banks of the drive, the orchard, the lake walk',height:.48,spread:.26,bloom:[80,124],after:'bare',winter:'bare',
  colors:{yellow:'#f2cc1e',white:'#f6f1dc',lemon:'#f4e27a'},
  grow(g,r,c,st){if(st==='bare')return;const n=1+Math.floor(r()*2);for(let i=0;i<n;i++){const x=i*2-(n>1?1:0),z=i,h=5+Math.floor(r()*3);g.box(x,0,z,x,h-1,z,G.stem);for(const d of[-1,1]){const L=3+Math.floor(r()*2);for(let k=0;k<L;k++)g.put(x+d,k,z,d>0?G.leaf:G.leafD,'leaf')}
      if(st!=='bloom')continue;const f=r()<.5?1:-1;g.box(x-1,h-1,z+f,x+1,h+1,z+f,c,'petal');g.put(x-1,h-1,z+f,lum(c,.9),'petal');g.put(x+1,h+1,z+f,lum(c,.9),'petal');g.put(x,h,z+2*f,c==='#f6f1dc'?'#f0a020':'#f09a14','eye');g.put(x,h,z,G.stem)}}};
SP.primrose={label:'Primrose',where:'Hedge banks, the wood edge, under the garden walls',height:.16,spread:.26,bloom:[84,136],after:'green',winter:'green',evergreen:true,
  colors:{pale:'#f4ec9a',cream:'#f6f0cc',pink:'#e9a0b8'},
  grow(g,r,c,st){for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){if(Math.abs(x)+Math.abs(z)>3||r()<.18)continue;g.put(x,0,z,(x+z)&1?G.leaf:G.leafD,'leaf')}if(st!=='bloom')return;const n=3+Math.floor(r()*3);for(let i=0;i<n;i++){const x=Math.round((r()-.5)*3),z=Math.round((r()-.5)*3);g.put(x,1,z,c,'petal');if(r()<.4)g.put(x,1,z+1,lum(c,.92),'petal')}g.put(0,1,0,'#e8b020','eye')}};
SP.bluebell={label:'Bluebell',where:'The floor of the wood in May, under the beeches, the shaded side of the lake',height:.4,spread:.2,bloom:[110,150],after:'bare',winter:'bare',
  colors:{blue:'#4f5fc0',violet:'#6a55b8',white:'#eef0f6'},
  grow(g,r,c,st){if(st==='bare')return;for(const[dx,dz]of[[1,0],[-1,0],[0,1]]){const L=2+Math.floor(r()*2);for(let k=0;k<L;k++)g.put(dx*(k>1?2:1),k,dz*(k>1?2:1),dx>0?G.leaf:G.leafD,'leaf')}if(st!=='bloom')return;const h=4+Math.floor(r()*3),d=r()<.5?1:-1;g.box(0,0,0,0,h-2,0,G.stem);g.put(d,h-1,0,G.stem);for(let k=0;k<3;k++){g.put(d*(k<2?1:2),h-2-k,0,k&1?lum(c,1.12):c,'petal')}g.put(0,h-1,0,c,'petal')}};
const SPECIES=Object.keys(SP);

/* ---------- season: which stage a species is in on a given day ---------- */
function stage(species,st){const S=SP[species];if(!st)return'bloom';const d=st.doy;if(S.hardy&&d>=S.bloom[0]&&d<=S.bloom[1])return'bloom';if(st.snow>.35||d<70||d>325)return S.winter;if(d>=S.bloom[0]&&d<=S.bloom[1])return'bloom';if(d>S.bloom[1])return S.after==='bare'&&d<S.bloom[1]+25?'green':S.after;return'green'}

/* ---------- far version: a few quarter-block cubes, petal colour kept on top ---------- */
function far(V){const F=FU/U,cells=new Map();for(const v of V.values()){const X=Math.floor((v[0]+F/2)/F),Y=Math.floor(v[1]/F),Z=Math.floor((v[2]+F/2)/F),k=X+','+Y+','+Z;let c=cells.get(k);if(!c)cells.set(k,c={x:X,y:Y,z:Z,n:0,pet:{},grn:{},np:0});c.n++;if(v[4]==='petal'){c.np++;c.pet[v[3]]=(c.pet[v[3]]||0)+1}else c.grn[v[3]]=(c.grn[v[3]]||0)+1}
  const out=new Map(),top=m=>{let b=null,n=-1;for(const k in m)if(m[k]>n){n=m[k];b=k}return b};let any=false;
  for(const[k,c]of cells){const pet=c.np>=2;if(!pet&&c.n<5)continue;out.set(k,[c.x,c.y,c.z,pet?top(c.pet):top(c.grn),pet?'petal':'leaf']);any=true}
  if(!any&&cells.size){let best=null;for(const c of cells.values())if(!best||c.n>best.n)best=c;out.set('0,0,0',[0,0,0,best.np?top(best.pet):top(best.grn),best.np?'petal':'leaf'])}
  /* one green shade and one petal shade far away, so faces merge */
  const gs={},ps={};for(const v of out.values())(v[4]==='petal'?ps:gs)[v[3]]=((v[4]==='petal'?ps:gs)[v[3]]||0)+1;const g1=top(gs),p1=top(ps);for(const v of out.values())v[3]=v[4]==='petal'?p1:g1;return out}

function colorOf(species,o){const S=SP[species],names=Object.keys(S.colors);let name=o.color;if(!name||!S.colors[name])name=names[(((o.seed|0)*7+3)%names.length+names.length)%names.length];return name}
function build(species,o={}){const S=SP[species];if(!S)throw new Error('No flower '+species);const seed=(o.seed==null?1:o.seed)|0,name=colorOf(species,o),st=o.stage||'bloom',g=grid();S.grow(g,rng(seed*13+species.length),S.colors[name],st,seed,name);
  let V=g.V,unit=U;if(o.lod==='far'){V=far(V);unit=FU}let mx=0,my=0,mz=0;for(const v of V.values()){mx=Math.max(mx,Math.abs(v[0]));my=Math.max(my,v[1]);mz=Math.max(mz,Math.abs(v[2]))}
  return{V,unit,size:[+((2*mx+1)*unit).toFixed(2),+((my+1)*unit).toFixed(2),+((2*mz+1)*unit).toFixed(2)],kind:'flower'+species[0].toUpperCase()+species.slice(1),species,color:name,stage:st,seed,lod:o.lod||'near',info:{label:S.label,room:S.where,act:'none',flower:true},count:V.size}}
const mesh=r=>{if(typeof TREES==='undefined')throw new Error('flowers.js needs trees.js loaded first (TREES.mesh)');return TREES.mesh(r)};

const cache=new Map();
function geometry(THREE,species,o={}){const name=colorOf(species,o),k=[species,name,o.seed|0,o.stage||'bloom',o.lod||'near'].join('/');let g=cache.get(k);if(g)return g;const r=build(species,Object.assign({},o,{color:name})),m=mesh(r);g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(m.pos,3));g.setAttribute('color',new THREE.BufferAttribute(m.col,3));g.setAttribute('normal',new THREE.BufferAttribute(m.nor,3));g.setIndex(new THREE.BufferAttribute(m.index,1));g.computeBoundingSphere();
  g.userData={species,color:name,seed:o.seed|0,stage:o.stage||'bloom',lod:o.lod||'near',quads:m.quads,voxels:r.count,size:r.size};cache.set(k,g);return g}
let MAT=null;const material=THREE=>MAT||(MAT=new THREE.MeshLambertMaterial({vertexColors:true}));
function clearCache(){for(const g of cache.values())g.dispose();cache.clear()}

/* ---------- layouts: fill a rectangle {x0,z0,x1,z1} (blocks) with plants ----------
   Every layout returns [{species,color,x,z,rot,seed}] and takes {seed, species:[...], colors:{species:[names]}, density (default 1)}.
   bed       drifts of several species, each drift one colour, tallest toward the middle
   border    graded by height: tall at the back, short at the front. opts.back: 'n'|'s'|'e'|'w' (default 'n', the low-z side)
   parterre  formal and symmetric: an edging, a diagonal cross and a centre piece. opts.edge, opts.fill, opts.centre
   rows      straight rows of one species (lavender by default). opts.gap is the row spacing, opts.along 'x'|'z'
   meadow    loose and sparse: wildflowers and poppies scattered                                                 */
const pick=(a,r)=>a[Math.floor(r()*a.length)],colFor=(sp,o,r)=>{const c=o.colors&&o.colors[sp];return c?(Array.isArray(c)?pick(c,r):c):pick(Object.keys(SP[sp].colors).filter(k=>k!=='mixed'||sp==='wild'),r)};
function scatter(rect,sp,o,r,out,fn){const gap=SP[sp].spread/(o.density||1);for(let z=rect.z0+gap/2,row=0;z<rect.z1;z+=gap*.87,row++)for(let x=rect.x0+gap/2+(row%2?gap/2:0);x<rect.x1;x+=gap){const jx=(r()-.5)*gap*.3,jz=(r()-.5)*gap*.3;if(fn&&!fn(x,z))continue;out.push({x:x+jx,z:z+jz})}}
/* v20: what is in flower on a given day, soonest first; and the spring species in their order */
const SPRING=['snowdrop','crocus','daffodil','primrose','tulip','bluebell'];
function inBloom(st){return SPECIES.filter(k=>stage(k,st)==='bloom').sort((a,b)=>SP[a].bloom[0]-SP[b].bloom[0])}
const LAYOUTS={
  /* v20. drift: bulbs naturalised in grass, in loose clumps that thin toward their edges, each clump one kind and one colour */
  drift(rect,o,r){const sps=o.species||['daffodil','crocus','snowdrop','daffodil','primrose','crocus'],w=rect.x1-rect.x0,d=rect.z1-rect.z0,n=Math.max(2,Math.round(w*d/(o.every||14))),out=[];
    for(let i=0;i<n;i++){const sp=sps[i%sps.length],col=colFor(sp,o,r),cx=rect.x0+r()*w,cz=rect.z0+r()*d,R=(1.4+r()*2.2)*(o.size||1),el=.5+r()*.8,rot=r()*3.14,m=Math.round(R*R*3.14/(SP[sp].spread*SP[sp].spread*6.5)*(o.density||1));
      for(let k=0;k<m;k++){const a=r()*6.283,q=Math.pow(r(),.7)*R,px=Math.cos(a)*q,pz=Math.sin(a)*q*el,x=cx+px*Math.cos(rot)-pz*Math.sin(rot),z=cz+px*Math.sin(rot)+pz*Math.cos(rot);if(x<rect.x0||x>rect.x1||z<rect.z0||z>rect.z1)continue;out.push({species:sp,color:col,x,z})}}return out},
  /* v20. carpet: the floor of a wood in May, thick, with paths of bare ground wandering through it */
  carpet(rect,o,r){const sps=o.species||['bluebell'],w=rect.x1-rect.x0,d=rect.z1-rect.z0,n=Math.round(w*d*7*(o.density||1)),out=[],sd=o.seed|0;
    for(let i=0;i<n;i++){const x=rect.x0+r()*w,z=rect.z0+r()*d,nz=h3(Math.round(x/2.5),0,Math.round(z/2.5),sd);if(nz<.22)continue;const sp=nz>.9?'primrose':pick(sps,r);out.push({species:sp,color:sp==='bluebell'?(h3(Math.round(x/5),1,Math.round(z/5),sd)<.12?'white':h3(Math.round(x/4),2,Math.round(z/4),sd)<.4?'violet':'blue'):colFor(sp,o,r),x,z})}return out},
  /* v20. spring: a formal bed for April. Tulips in blocks of one colour, daffodils behind, a crocus and primrose edge */
  spring(rect,o,r){const back=o.back||'n',alongX=back==='n'||back==='s',depth=alongX?rect.z1-rect.z0:rect.x1-rect.x0,len=alongX?rect.x1-rect.x0:rect.z1-rect.z0,flip=back==='s'||back==='e',out=[];
    const band=(f0,f1)=>{const a=flip?1-f1:f0,b=flip?1-f0:f1;return alongX?{x0:rect.x0,x1:rect.x1,z0:rect.z0+depth*a,z1:rect.z0+depth*b}:{z0:rect.z0,z1:rect.z1,x0:rect.x0+depth*a,x1:rect.x0+depth*b}};
    const fillB=(B,sps,seg)=>{for(let s0=0;s0*seg<len;s0++){const sp=sps[s0%sps.length],col=colFor(sp,o,r),part=alongX?{x0:B.x0+s0*seg,x1:Math.min(B.x1,B.x0+(s0+1)*seg),z0:B.z0,z1:B.z1}:{z0:B.z0+s0*seg,z1:Math.min(B.z1,B.z0+(s0+1)*seg),x0:B.x0,x1:B.x1},pts=[];scatter(part,sp,Object.assign({},o,{density:(o.density||1)*.62}),r,pts);for(const p of pts)out.push({species:sp,color:col,x:p.x,z:p.z})}};
    fillB(band(0,.3),['daffodil'],3+r()*2);fillB(band(.3,.8),['tulip'],2+r()*1.5);fillB(band(.8,1),['crocus','primrose','crocus','snowdrop'],1.5+r());return out},
  bed(rect,o,r){const sps=o.species||['rose','peony','lavender','tulip','iris','lily'],w=rect.x1-rect.x0,d=rect.z1-rect.z0,n=Math.max(2,Math.round(Math.sqrt(w*d)/1.3)),seeds=[];
    for(let i=0;i<n;i++){const sp=sps[i%sps.length];seeds.push({sp,col:colFor(sp,o,r),x:rect.x0+r()*w,z:rect.z0+r()*d})}const out=[];
    for(const sp of sps){const pts=[];scatter(rect,sp,o,r,pts);for(const p of pts){let b=null,bd=1e9;for(const s of seeds){const dd=(s.x-p.x)**2+(s.z-p.z)**2;if(dd<bd){bd=dd;b=s}}if(b.sp===sp)out.push({species:sp,color:b.col,x:p.x,z:p.z})}}return out},
  border(rect,o,r){const sps=(o.species||['lily','rose','hydrangea','peony','iris','lavender','tulip']).slice().sort((a,b)=>SP[b].height-SP[a].height),back=o.back||'n',alongX=back==='n'||back==='s',depth=alongX?rect.z1-rect.z0:rect.x1-rect.x0,len=alongX?rect.x1-rect.x0:rect.z1-rect.z0;
    const bands=Math.max(1,Math.min(sps.length,Math.round(depth/.7))),out=[],seg=Math.max(2,2.5+r());for(let b=0;b<bands;b++){const t0=b/bands,t1=(b+1)/bands,choices=sps.filter((s,i)=>Math.floor(i/sps.length*bands)===b);if(!choices.length)continue;const cols={};
      const flip=back==='s'||back==='e',f0=flip?1-t1:t0,f1=flip?1-t0:t1,band=alongX?{x0:rect.x0,x1:rect.x1,z0:rect.z0+depth*f0,z1:rect.z0+depth*f1}:{z0:rect.z0,z1:rect.z1,x0:rect.x0+depth*f0,x1:rect.x0+depth*f1};
      for(let s=0;s*seg<len;s++){const sp=choices[(s+b)%choices.length],col=colFor(sp,o,r),part=alongX?{x0:band.x0+s*seg,x1:Math.min(band.x1,band.x0+(s+1)*seg),z0:band.z0,z1:band.z1}:{z0:band.z0+s*seg,z1:Math.min(band.z1,band.z0+(s+1)*seg),x0:band.x0,x1:band.x1};const pts=[];scatter(part,sp,o,r,pts);for(const p of pts)out.push({species:sp,color:col,x:p.x,z:p.z})}}return out},
  parterre(rect,o,r){const edge=o.edge||'lavender',fill=o.fill||'tulip',centre=o.centre||'rose',w=rect.x1-rect.x0,d=rect.z1-rect.z0,cx=(rect.x0+rect.x1)/2,cz=(rect.z0+rect.z1)/2,out=[],ec=colFor(edge,o,r),c1=colFor(fill,o,r);let c2=colFor(fill,o,r);if(c2===c1){const ks=Object.keys(SP[fill].colors);c2=ks[(ks.indexOf(c1)+1)%ks.length]}const cc=colFor(centre,o,r);
    const ew=Math.max(.45,SP[edge].spread),u=(x,z)=>[Math.abs(x-cx)/(w/2),Math.abs(z-cz)/(d/2)];const pts=[];scatter(rect,edge,o,r,pts,(x,z)=>x<rect.x0+ew||x>rect.x1-ew||z<rect.z0+ew||z>rect.z1-ew);for(const p of pts)out.push({species:edge,color:ec,x:p.x,z:p.z});
    const inner={x0:rect.x0+ew,x1:rect.x1-ew,z0:rect.z0+ew,z1:rect.z1-ew},cr=Math.min(w,d)*.16,p2=[];scatter(inner,fill,o,r,p2,(x,z)=>Math.hypot(x-cx,z-cz)>cr+.2);for(const p of p2){const[a,b]=u(p.x,p.z);out.push({species:fill,color:Math.abs(a-b)<.16?c2:c1,x:p.x,z:p.z})}
    const p3=[];scatter({x0:cx-cr,x1:cx+cr,z0:cz-cr,z1:cz+cr},centre,o,r,p3,(x,z)=>Math.hypot(x-cx,z-cz)<=cr);if(!p3.length)p3.push({x:cx,z:cz});for(const p of p3)out.push({species:centre,color:cc,x:p.x,z:p.z});return out},
  rows(rect,o,r){const sp=(o.species||['lavender'])[0],col=colFor(sp,o,r),gap=o.gap||SP[sp].spread*2.2,step=SP[sp].spread*.9/(o.density||1),out=[],ax=o.along||'x';
    if(ax==='x')for(let z=rect.z0+gap/2;z<rect.z1;z+=gap)for(let x=rect.x0+step/2;x<rect.x1;x+=step)out.push({species:sp,color:col,x,z});else for(let x=rect.x0+gap/2;x<rect.x1;x+=gap)for(let z=rect.z0+step/2;z<rect.z1;z+=step)out.push({species:sp,color:col,x,z});return out},
  meadow(rect,o,r){const sps=o.species||['wild','wild','wild','poppy'],n=Math.round((rect.x1-rect.x0)*(rect.z1-rect.z0)*1.6*(o.density||1)),out=[];for(let i=0;i<n;i++){const sp=pick(sps,r),x=rect.x0+r()*(rect.x1-rect.x0),z=rect.z0+r()*(rect.z1-rect.z0);
      if(h3(Math.round(x/3),0,Math.round(z/3),o.seed|0)<.3)continue;out.push({species:sp,color:sp==='wild'?'mixed':colFor(sp,o,r),x,z})}return out}};
function layout(kind,rect,o={}){const f=LAYOUTS[kind];if(!f)throw new Error('No layout '+kind);const R={x0:Math.min(rect.x0,rect.x1),x1:Math.max(rect.x0,rect.x1),z0:Math.min(rect.z0,rect.z1),z1:Math.max(rect.z0,rect.z1)},r=rng((o.seed|0)*31+kind.length);
  return f(R,o,r).map((p,i)=>Object.assign(p,{rot:Math.floor(h3(i,1,2,o.seed|0)*4)*90,seed:Math.floor(h3(i,3,4,o.seed|0)*1e6)}))}

/* ---------- planting: instanced, shared geometry, near and far by distance, hidden beyond `gone` ----------
   list: what FLOWERS.layout returns (or your own [{species,color,x,z,y?,rot?,seed?}]).
   Seeds fold into o.variants shapes (default 3) per species and colour; each shape and level is one InstancedMesh.
   Near within o.far blocks of the eye (default 14), far out to o.gone (default 70), nothing beyond.
   Call bed.update(camera.position,dt) each frame and bed.season(st) when the day changes.             */
function plant(THREE,list,o={}){const VAR=o.variants||3,FAR=o.far||14,GONE=o.gone||70,mat=o.material||material(THREE),group=new THREE.Group();group.userData={k:'flowerbed',o:{count:list.length}};
  const buckets=new Map(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),LV=['near','far'];let st=o.st||null,acc=1e9,stamp='';
  list.forEach((t,i)=>{const v=(((t.seed==null?i:t.seed)%VAR)+VAR)%VAR,color=colorOf(t.species,{color:t.color,seed:t.seed==null?i:t.seed}),k=t.species+'/'+color+'/'+v;let b=buckets.get(k);if(!b)buckets.set(k,b={species:t.species,color,seed:v+1,items:[]});
    const sc=t.scale||1;b.items.push({x:t.x,z:t.z,m:new THREE.Matrix4().compose(new THREE.Vector3(t.x,t.y||0,t.z),Q.clone().setFromAxisAngle(Y,(t.rot||0)*Math.PI/180),new THREE.Vector3(sc,sc,sc))})});
  const geo=(b,l)=>geometry(THREE,b.species,{seed:b.seed,color:b.color,stage:o.stage||stage(b.species,st),lod:l});
  for(const b of buckets.values())for(const l of LV){const im=new THREE.InstancedMesh(geo(b,l),mat,b.items.length);im.frustumCulled=false;im.count=0;im.userData={k:'flower',o:{species:b.species,color:b.color,seed:b.seed,lod:l}};group.add(im);b[l]=im}
  const wp=new THREE.Vector3();
  function update(cam,dt){acc+=dt==null?1e9:dt;if(acc<(o.every||.4))return;acc=0;group.updateMatrixWorld();wp.copy(cam).applyMatrix4(new THREE.Matrix4().copy(group.matrixWorld).invert());const F2=Math.pow(o.far||FAR,2),G2=Math.pow(o.gone||GONE,2);
    for(const b of buckets.values()){let n=0,f=0;for(const it of b.items){const dx=it.x-wp.x,dz=it.z-wp.z,d=dx*dx+dz*dz;if(d<F2)b.near.setMatrixAt(n++,it.m);else if(d<G2)b.far.setMatrixAt(f++,it.m)}b.near.count=n;b.far.count=f;b.near.instanceMatrix.needsUpdate=true;b.far.instanceMatrix.needsUpdate=true}}
  function season(s){st=s;const k=SPECIES.map(sp=>stage(sp,st)).join();if(k===stamp)return;stamp=k;for(const b of buckets.values())for(const l of LV)b[l].geometry=geo(b,l)}
  function stats(){let q=0,dc=0,n=0,f=0;for(const b of buckets.values())for(const l of LV){const im=b[l];if(im.count&&im.geometry.userData.quads){dc++;q+=im.count*im.geometry.userData.quads;l==='near'?n+=im.count:f+=im.count}}return{plants:list.length,drawCalls:dc,quads:q,near:n,far:f}}
  return{group,update,season,stats,dispose(){group.removeFromParent()}}}

return{build,mesh,geometry,layout,plant,stage,inBloom,SPRING,clearCache,SPECIES,LAYOUTS:['bed','border','parterre','rows','meadow','drift','carpet','spring'],
  info:Object.fromEntries(SPECIES.map(k=>[k,{label:SP[k].label,where:SP[k].where,height:SP[k].height,spread:SP[k].spread,bloom:SP[k].bloom,evergreen:!!SP[k].evergreen,colors:Object.keys(SP[k].colors)}])),U,FU,rng,h3}})();
if(typeof module!=='undefined')module.exports=FLOWERS;
