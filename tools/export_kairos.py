"""Kairos for your room. python3 tools/export_kairos.py [FOLDER=src]
Opens the page, takes its own Kairos (standing, napkin on), sets him 1.9 metres tall with his feet on the floor, and writes
FOLDER/kairos.glb (for Android's Scene Viewer and as a file to keep) and FOLDER/kairos.usdz (for AR Quick Look on an iPhone or iPad).
Run it again whenever Kairos's figure changes, then copy both files beside the built page (the root).
The figure's colours are per face; neither viewer is sure to show those, so they are carried as a strip of colour swatches (a texture) with every face pointing at its swatch."""
import sys, os, base64, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tests') if os.path.isdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tests')) else '/home/user/Eh/tools/tests')
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1] if len(sys.argv)>1 else 'src'
JS=r"""async()=>{const V=__vx,T=V.THREE;const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');const {USDZExporter}=await import('three/addons/exporters/USDZExporter.js');
 const g=V.kairosStatue();g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);
 const pos=[],nor=[],col=[],v=new T.Vector3(),n=new T.Vector3(),nm=new T.Matrix3();let meshes=0;
 g.traverse(m=>{if(!m.isMesh||!m.visible)return;let vis=true;for(let q=m;q;q=q.parent)if(!q.visible)vis=false;if(!vis)return;const mat=m.material;if(mat.transparent&&mat.opacity<.5)return;meshes++;
   const ge=m.geometry,P=ge.attributes.position,N=ge.attributes.normal,C=ge.attributes.color,idx=ge.index,start=ge.drawRange.start||0,cnt=isFinite(ge.drawRange.count)?ge.drawRange.count:(idx?idx.count:P.count);nm.getNormalMatrix(m.matrixWorld);
   const base=mat.color?[mat.color.r,mat.color.g,mat.color.b]:[1,1,1],ei=mat.emissive?.95:0,em=mat.emissive?[mat.emissive.r*ei,mat.emissive.g*ei,mat.emissive.b*ei]:[0,0,0];
   for(let i=0;i<cnt;i++){const k=idx?idx.getX(start+i):start+i;v.fromBufferAttribute(P,k).applyMatrix4(m.matrixWorld);pos.push(v.x,v.y,v.z);if(N)n.fromBufferAttribute(N,k).applyMatrix3(nm).normalize();else n.set(0,0,1);nor.push(n.x,n.y,n.z);
     let r=base[0],gg=base[1],b=base[2];if(C&&mat.vertexColors){r*=C.getX(k);gg*=C.getY(k);b*=C.getZ(k)}col.push(Math.min(1,r+em[0]),Math.min(1,gg+em[1]),Math.min(1,b+em[2]))}});
 /* 1.9 metres, feet on the floor, centred */
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<pos.length;i+=3){x0=Math.min(x0,pos[i]);x1=Math.max(x1,pos[i]);y0=Math.min(y0,pos[i+1]);y1=Math.max(y1,pos[i+1]);z0=Math.min(z0,pos[i+2]);z1=Math.max(z1,pos[i+2])}
 const s=1.9/(y1-y0),cx=(x0+x1)/2,cz=(z0+z1)/2;for(let i=0;i<pos.length;i+=3){pos[i]=(pos[i]-cx)*s;pos[i+1]=(pos[i+1]-y0)*s;pos[i+2]=(pos[i+2]-cz)*s}
 /* the swatches */
 const sr=c=>Math.round(255*(c<=.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-.055)),keys=new Map(),pal=[],ui=[];
 for(let i=0;i<col.length;i+=3){const k=(sr(col[i])<<16)|(sr(col[i+1])<<8)|sr(col[i+2]);let j=keys.get(k);if(j==null){j=pal.length;keys.set(k,j);pal.push(k)}ui.push(j)}
 const cw=Math.max(2,Math.min(8,Math.floor(1024/pal.length))),cv=document.createElement('canvas');cv.width=cw*pal.length;cv.height=8;const cx2=cv.getContext('2d');pal.forEach((k,j)=>{cx2.fillStyle='#'+('00000'+k.toString(16)).slice(-6);cx2.fillRect(j*cw,0,cw,8)});
 /* corners shared: a corner used by several faces of one colour and one facing is written once */
 const vk=new Map(),P2=[],N2=[],U2=[],ix=[];for(let i=0;i<ui.length;i++){const k=pos[i*3].toFixed(4)+','+pos[i*3+1].toFixed(4)+','+pos[i*3+2].toFixed(4)+'|'+Math.round(nor[i*3]*4)+','+Math.round(nor[i*3+1]*4)+','+Math.round(nor[i*3+2]*4)+'|'+ui[i];let j=vk.get(k);
   if(j==null){j=P2.length/3;vk.set(k,j);P2.push(+pos[i*3].toFixed(4),+pos[i*3+1].toFixed(4),+pos[i*3+2].toFixed(4));N2.push(nor[i*3],nor[i*3+1],nor[i*3+2]);U2.push((ui[i]+.5)/pal.length,.5)}ix.push(j)}
 const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(P2,3));ge.setAttribute('normal',new T.Float32BufferAttribute(N2,3));ge.setAttribute('uv',new T.Float32BufferAttribute(U2,2));ge.setIndex(ix);
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.magFilter=T.NearestFilter;tex.minFilter=T.NearestFilter;tex.generateMipmaps=false;
 const mesh=new T.Mesh(ge,new T.MeshStandardMaterial({map:tex,metalness:.3,roughness:.5}));mesh.name='Kairos';const sc=new T.Scene();sc.add(mesh);sc.updateMatrixWorld(true);
 const b64=u8=>{let o='';for(let i=0;i<u8.length;i+=0x8000)o+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(o)};
 const glb=new Uint8Array(await new GLTFExporter().parseAsync(sc,{binary:true})),usdz=await new USDZExporter().parse(sc,{quickLookCompatible:true});
 return {meshes,tris:pos.length/9,verts:P2.length/3,colours:pal.length,height:1.9,width:(x1-x0)*s,depth:(z1-z0)*s,glb:b64(glb),usdz:b64(usdz)}}"""
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base,w=480,h=300)
    R=pg.evaluate(JS);b.close()
for k in('glb','usdz'):
    data=base64.b64decode(R[k]);open(os.path.join(folder,'kairos.'+k),'wb').write(data);print('kairos.%s  %d bytes'%(k,len(data)))
print('meshes %d, triangles %d, corners %d, colours %d, %.2f m tall, %.2f wide, %.2f deep'%(R['meshes'],R['tris'],R['verts'],R['colours'],R['height'],R['width'],R['depth']));print('errors',err[:2])
