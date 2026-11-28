/* =========================================================
   Euphrates Hall Parts Depot: props7.js (VOXEL III, MOVEABLES, Nov 27, 2026): the third level begins.
   Load after props6.js. Same grid and facing as the others (front faces +z, standing parts from y 0).
   A part that returns unit:P.PU2 (.0575, the figures' fineness) is placed as its middle copy, halved from the carving, and drawn as the carving near the walker.
   ========================================================= */
(function(P){const{def,kit,colors:C}=P;
/* the Chapel's pulpit: a panelled oak drum on a stem, a book desk with a crimson fall, steps behind (front +z faces the congregation) */
def('pulpit',{label:'Oak pulpit',room:'Chapel',act:'look'},o=>{const k=kit(),oak=C.oak,oakL=C.oakL,cr=o.c||'#7a1f2a';
  k.disc(0,0,0,4,oak);k.disc(0,1,0,3,oakL);k.box(-1,2,-1,1,11,1,oak);for(const y of[4,9])k.box(-2,y,-2,2,y,2,oakL);
  for(let y=12;y<=24;y++){if(y===12||y===24)k.disc(0,y,0,6,oakL);else k.ring(0,y,0,6,(y>=15&&y<=21)?C.wal:oak)}
  for(let y=15;y<=21;y++)for(const[x,z]of[[6,0],[-6,0],[0,6],[0,-6],[4,4],[-4,4],[4,-4],[-4,-4]])k.put(x,y,z,oak);   /* the muntins between the panels */
  k.box(-3,25,3,3,25,5,oakL);k.box(-3,26,4,3,26,5,oakL);k.box(-2,19,7,2,25,7,cr);k.box(-2,18,7,2,18,7,C.gold);   /* the desk and its fall */
  for(let s=0;s<4;s++)k.box(-2,s*3,-7-s,2,s*3+2,-7-s,oak);k.box(-3,0,-11,-3,13,-7,oak);k.box(-3,14,-11,-3,14,-6,oakL);
  return{V:k.V,size:[1.5,3.1,2]}});
/* the altar rail: turned balusters under a broad oak rail, a crimson kneeler before it (front +z faces the people kneeling); o.len its length in voxels */
def('altarRail',{label:'Altar rail with a kneeler',room:'Chapel',act:'look'},o=>{const k=kit(),L=Math.max(9,o.len||30),h=(L-1)>>1,oak=C.oak,oakL=C.oakL;
  k.box(-h,0,-1,h,1,1,oak);for(let x=-h;x<=h;x+=3){k.box(x,2,0,x,11,0,oakL);k.put(x,5,0,oak);k.put(x,9,0,oak)}for(const x of[-h,h])k.box(x,0,-1,x,13,1,oak);
  k.box(-h,12,-1,h,12,1,oak);k.box(-h,13,-2,h,13,2,oakL);k.box(-h+1,0,3,h-1,1,5,'#7a1f2a');
  return{V:k.V,size:[(L)/8.7,1.6,.9]}});
})(typeof PROPS!=='undefined'?PROPS:require('./props.js'));
