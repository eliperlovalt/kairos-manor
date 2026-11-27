"""Kairos in your room (v1.75). python3 tools/tests/ar_test.py FOLDER
The two model files stand beside the page and are sound: kairos.glb is a binary glTF of one textured mesh 1.9 metres tall with its feet at 0;
kairos.usdz is an uncompressed zip that begins with the scene, in metres, with its swatch texture. The page points at both. No browser needed."""
import sys, os, json, struct, zipfile, re
folder=sys.argv[1]; fails=[]
def check(name, ok, detail=''):
    print('  %-70s %s %s'%(name,'ok' if ok else 'FAIL',detail if not ok else ''))
    if not ok: fails.append(name)
g=os.path.join(folder,'kairos.glb'); u=os.path.join(folder,'kairos.usdz')
check('kairos.glb is beside the page', os.path.isfile(g) and os.path.getsize(g)>20000, g)
check('kairos.usdz is beside the page', os.path.isfile(u) and os.path.getsize(u)>20000, u)
if os.path.isfile(g):
    d=open(g,'rb').read(); magic,ver,ln=struct.unpack('<4sII',d[:12]); clen,ctype=struct.unpack('<I4s',d[12:20]); J=json.loads(d[20:20+clen])
    check('glb: a binary glTF, version 2, whole', magic==b'glTF' and ver==2 and ln==len(d) and ctype==b'JSON')
    prim=J['meshes'][0]['primitives'][0]; acc=J['accessors'][prim['attributes']['POSITION']]; h=acc['max'][1]-acc['min'][1]
    check('glb: one mesh, %d corners, with a texture'%acc['count'], len(J['meshes'])==1 and 'TEXCOORD_0' in prim['attributes'] and len(J.get('images',[]))==1 and 3000<acc['count']<200000)
    check('glb: 1.9 metres tall (%.3f), feet on the floor (%.3f)'%(h,acc['min'][1]), abs(h-1.9)<.02 and abs(acc['min'][1])<.01)
    w=acc['max'][0]-acc['min'][0]; check('glb: a man\'s breadth (%.2f m wide)'%w, .5<w<1.3)
if os.path.isfile(u):
    z=zipfile.ZipFile(u); names=z.namelist(); infos=z.infolist()
    check('usdz: the scene comes first and nothing is compressed', names[0].endswith('.usda') and all(i.compress_type==0 for i in infos), str(names[:3]))
    t=''.join(z.read(n).decode('utf-8','ignore') for n in names if n.endswith('.usda') or n.endswith('.usd'))
    check('usdz: in metres, Y up, with a mesh and its texture', 'metersPerUnit = 1' in t and 'upAxis = "Y"' in t and 'def Mesh' in t and any(n.endswith('.png') for n in names), t[:120])
    m=re.search(r'point3f\[\] points = \[([^\]]*)\]',t)
    ys=[float(q.split(',')[1]) for q in re.findall(r'\(([^)]*)\)',m.group(1))] if m else []
    check('usdz: 1.9 metres tall (%.3f), feet on the floor (%.3f), %d corners'%((max(ys)-min(ys)) if ys else 0,min(ys) if ys else 9,len(ys)), bool(ys) and abs(max(ys)-min(ys)-1.9)<.02 and abs(min(ys))<.01)
page=open(os.path.join(folder,'index.html'),encoding='utf-8',errors='ignore').read()
check('the page opens the first in AR Quick Look and the second in Scene Viewer', "rel='ar'" in page.replace('"',"'") or 'a.rel=' in page and 'kairos.usdz' in page and 'scene-viewer' in page and 'kairos.glb' in page)
print('ar_test: %s'%('FAILED '+str(len(fails)) if fails else 'passed'))
sys.exit(1 if fails else 0)
