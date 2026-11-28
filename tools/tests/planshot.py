"""Plan views: a room seen from straight above, just under its ceiling, north at the top. His Grace's rule for every furniture hand-in (28 Nov): a top-down still of each room touched.
python planshot.py FOLDER OUTDIR 'name:x0,z0,x1,z1,floorY,eyeY[,tod];...'
The walker is stood in the room first, so its storey is drawn; every furniture pool is drawn in full (no view test). eyeY is the camera height: below the ceiling, above the tallest piece."""
import sys, os, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright

SHOT = r"""([x0,z0,x1,z1,fy,ey])=>{const V=__vx,T=V.THREE,R=V.renderer,cv=R.domElement,asp=cv.width/cv.height,w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
 let hw=w/2+.6,hd=d/2+.6;if(hw/hd>asp)hd=hw/asp;else hw=hd*asp;
 const cam=new T.OrthographicCamera(-hw,hw,hd,-hd,.05,ey-fy+1);cam.position.set(cx,ey,cz);cam.up.set(0,0,-1);cam.lookAt(cx,fy,cz);cam.updateMatrixWorld();cam.updateProjectionMatrix();
 if(V.pinst)V.pinst.full(true);R.render(V.scene,cam);const url=cv.toDataURL('image/png');if(V.pinst)V.pinst.full(false);return url}"""
GO = "([x,y,z])=>{const P=__vx.PL;P.x=x;P.y=y+.5;P.z=z;P.yaw=0;P.pitch=.1;P.vy=0;P.sit=null}"

def main():
    folder, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
    shots = []
    for s in sys.argv[3].split(';'):
        if not s.strip(): continue
        nm, v = s.split(':'); a = v.split(','); shots.append((nm, [float(t) for t in a[:6]], a[6] if len(a) > 6 else 'day'))
    with serve(folder) as base, sync_playwright() as p:
        b, pg, err = open_estate(p, base, 'index.html')
        pg.wait_for_function('window.__vx && window.__vx.TM && window.__vx.TM.wall', timeout=300000); pg.wait_for_timeout(3000)
        pg.evaluate("()=>{if(__vx.GOV){__vx.GOV.off=true;__vx.govSet(0)}__vx.setMode('walk');__vx.setFP(true)}")
        for nm, (x0, z0, x1, z1, fy, ey), tod in shots:
            pg.evaluate("(t)=>__vx.pickTime(t)", tod)
            pg.evaluate(GO, [(x0 + x1) / 2, fy, (z0 + z1) / 2]); pg.wait_for_timeout(2500); pg.screenshot(path=os.path.join(out, '_tick.png')); pg.wait_for_timeout(400)
            url = pg.evaluate(SHOT, [x0, z0, x1, z1, fy, ey])
            open(os.path.join(out, nm + '.png'), 'wb').write(base64.b64decode(url.split(',')[1])); print('plan', nm)
        try: os.remove(os.path.join(out, '_tick.png'))
        except OSError: pass
        print('errors', err[:3]); b.close()

if __name__ == '__main__':
    main()
