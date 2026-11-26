"""Top-down ground map. python3 map.py FOLDER OUT.png [x0,z0,x1,z1]"""
import sys,json,base64
sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
import numpy as np
from PIL import Image
box=[int(v) for v in sys.argv[3].split(',')] if len(sys.argv)>3 else [-300,-300,300,400]
JS="""([x0,z0,x1,z1])=>{const V=__vx,G=V.G,pal=V.palette,W=x1-x0+1,H=z1-z0+1,o=new Uint8Array(W*H*3);const info=typeof pal+' '+(Array.isArray(pal)?pal.length:Object.keys(pal).slice(0,5));
 const col=g=>{let c=pal[g];if(c&&c.length&&c[0]<=1&&c[1]<=1&&c[2]<=1)c=[Math.pow(c[0],1/2.2)*255,Math.pow(c[1],1/2.2)*255,Math.pow(c[2],1/2.2)*255];if(c==null)return[255,0,255];if(typeof c==='string'){const n=parseInt(c.slice(1),16);return[n>>16&255,n>>8&255,n&255]}if(typeof c==='number')return[c>>16&255,c>>8&255,c&255];if(c.r!=null)return[c.r*255,c.g*255,c.b*255];return[c[0],c[1],c[2]]};
 for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){let c=[20,20,30];for(let y=9;y>=-3;y--){const g=G(x,y,z);if(g&&!V.isInv(g)){c=col(g);const k=.8+.05*Math.min(4,Math.max(-2,y));c=[c[0]*k,c[1]*k,c[2]*k];break}}const i=((z-z0)*W+(x-x0))*3;o[i]=c[0];o[i+1]=c[1];o[i+2]=c[2]}
 let s='';for(let i=0;i<o.length;i+=3000)s+=String.fromCharCode.apply(null,o.subarray(i,i+3000));return [info,btoa(s),W,H,JSON.stringify(V.settle.groups||0).length, V.flowers?(V.flowers.length||0):-1]}"""
with serve(sys.argv[1]) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base); r=pg.evaluate(JS,box); print(r[0],r[2],r[3],'flowers',r[5],err)
    a=np.frombuffer(base64.b64decode(r[1]),dtype=np.uint8).reshape(r[3],r[2],3); Image.fromarray(a).resize((r[2]*3,r[3]*3),Image.NEAREST).save(sys.argv[2]); b.close()
