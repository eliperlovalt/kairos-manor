"""The four extras (v1.75). python3 tools/tests/extras_test.py FOLDER
  1. the link preview: Open Graph and Twitter tags in the page, pointing at https://kairosmanor.com/og.jpg; og.jpg is in the repository root, 1200 by 630
  2. Kairos's portrait hangs on the east wall of the Great Hall with its brass plate
  3. Call Kairos: he rises, comes by a real way to where His Grace stands, stops before him, says he was rung for; when His Grace has gone, he goes back and sits
  4. the Ask Kairos sheet carries "Call Kairos to me" and "Bring Kairos into your room"; off a phone the model is offered as a file
Exit 1 on any failure."""
import sys, os, json, math, re, struct
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1]; fails=[]
def check(name, ok, detail=''):
    print('  %-78s %s %s'%(name,'ok' if ok else 'FAIL',detail if not ok else ''))
    if not ok: fails.append(name)
page=open(os.path.join(folder,'index.html'),encoding='utf-8',errors='ignore').read()
tags={m.group(1):m.group(2) for m in re.finditer(r'<meta (?:property|name)="((?:og|twitter):[a-z:_]+)" content="([^"]*)"',page)}
check('the page carries the preview tags (%d)'%len(tags), all(k in tags for k in['og:title','og:description','og:image','og:url','twitter:card','twitter:image']) and tags.get('og:title')=='Kairos Manor', str(sorted(tags)))
check('the picture and the address are on kairosmanor.com', tags.get('og:image')=='https://kairosmanor.com/og.jpg' and tags.get('og:url')=='https://kairosmanor.com/' and tags.get('twitter:card')=='summary_large_image', str(tags.get('og:image')))
check('the words are free of the owner and of dashes', 'Grace' not in tags.get('og:description','') and '—' not in tags.get('og:description','') and len(tags.get('og:description',''))>30, tags.get('og:description',''))
root=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')); og=os.path.join(root,'og.jpg')
def jpeg_size(fp):
    d=open(fp,'rb').read(); i=2
    while i<len(d):
        if d[i]!=0xFF: i+=1; continue
        mk=d[i+1]
        if mk in(0xC0,0xC1,0xC2): h,w=struct.unpack('>HH',d[i+5:i+9]); return w,h
        i+=2+struct.unpack('>H',d[i+2:i+4])[0]
    return 0,0
check('og.jpg is in the repository root, 1200 by 630', os.path.isfile(og) and jpeg_size(og)==(1200,630) and os.path.getsize(og)>40000, og)
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base,w=844,h=390)
    def tick(n=4):
        for _ in range(n): pg.screenshot(clip={'x':0,'y':0,'width':8,'height':8})
    pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0);__vx.setMode('walk');__vx.setFP(true)}");tick(6)
    P=pg.evaluate("()=>{const V=__vx,R=(()=>{for(const B of V.BLD.slice(1))for(const r of B.rooms)if(r.n==='The Great Hall')return r})();let port=null,plate=null;V.scene.traverse(m=>{if(m.userData&&m.userData.k==='kairosPortrait')port=m;if(m.userData&&m.userData.k==='kairosPlate')plate=m});const K=V.kseat();return port?{x:port.position.x,y:port.position.y,z:port.position.z,x1:R.x1,ry:R.y,z0:R.z0,z1:R.z1,plate:!!plate,py:plate?plate.position.y:0,tex:!!(port.material.map&&port.material.map.image&&port.material.map.image.width>=300),kz:K?K.z:0}:null}")
    check('the portrait hangs on the east wall of the Great Hall, by the thrones', bool(P) and abs(P['x']-(P['x1']-.84))<.3 and P['z0']+3<P['z']<P['z1']-3 and abs(P['z']-P['kz'])<12 and P['tex'], str(P))
    check('its brass plate is beneath it', bool(P) and P['plate'] and P['py']<P['y'], str(P))
    # Call Kairos
    pg.evaluate("()=>{const V=__vx,R=(()=>{for(const B of V.BLD.slice(1))for(const r of B.rooms)if(r.n==='The Great Hall')return r})(),P=V.PL;V.soul.S.rate=8;V.setFly(0,1);P.x=R.x0+10;P.z=(R.z0+R.z1)/2+3;P.y=R.y+.5;P.yaw=-1.5708;P.vy=0;P.fly=0}");tick(3)
    K0=pg.evaluate("()=>{const V=__vx,E=V.life.find(e=>e.kh);window.__k=E;const ok=V.kcall.call();return {ok,st:V.kcall.K.st,x:E.x,z:E.z,seated:E.seated,d:Math.hypot(E.x-V.PL.x,E.z-V.PL.z)}}")
    check('called, he answers and looks for the way (%.0f blocks off)'%K0['d'], K0['ok'] and K0['st']=='seek' and K0['seated'], str(K0))
    seen=[];last=None;bad=0
    for k in range(200):
        tick(2);q=pg.evaluate("()=>{const V=__vx,E=window.__k,K=V.kcall.K,cx=Math.round(E.x),cz=Math.round(E.z);return {st:K.st,x:E.x,y:E.y,z:E.z,d:Math.hypot(E.x-V.PL.x,E.z-V.PL.z),seated:E.seated,free:K.st!=='go'||(!V.G(cx,E.y,cz)&&!V.G(cx,E.y+1,cz)),log:V.cmd.C.log.slice(-4)}}");last=q
        if q['st'] not in seen: seen.append(q['st'])
        if not q['free']: bad+=1
        if q['st']=='there' and any('You rang' in l for l in q['log']): break
    check('he rises, walks and stands before His Grace (%s; %.1f blocks off)'%(' > '.join(seen),last['d']), 'go' in seen and last['st']=='there' and last['d']<5 and not last['seated'], str(last))
    check('he says he was rung for', any('You rang' in l for l in last['log']), str(last['log']))
    check('every step of his on free floor', bad==0, str(bad))
    pg.evaluate("()=>{const V=__vx,P=V.PL;V.setFly(1,1);P.x=0;P.z=120;P.y=3}");tick(3)
    seen2=[];q=None
    for k in range(260):
        tick(2);q=pg.evaluate("()=>{const V=__vx,E=window.__k,K=V.kcall.K,S=V.kseat();return {st:K.st,seated:E.seated,static:E.static,ds:Math.hypot(E.x-S.x,E.z-S.z)}}")
        if q['st'] not in seen2: seen2.append(q['st'])
        if q['st']=='seat': break
    check('His Grace gone, he goes back and sits in his chair (%s)'%' > '.join(seen2), q['st']=='seat' and q['seated'] and q['static'] and q['ds']<.05, str(q))
    # the sheet
    pg.evaluate("()=>{__vx.setMode('walk')}");tick(2);pg.click('#bAsk');pg.wait_for_selector('[data-c="call"]');txt=pg.inner_text('#goalP')
    check('the sheet carries Call Kairos and Bring Kairos into your room', 'call kairos to me' in txt.lower() and 'bring kairos into your room' in txt.lower(), txt[:120])
    with pg.expect_download(timeout=20000) as dl: pg.click('[data-c="ar"]')
    check('off a phone the model is offered as a file (kairos.glb)', dl.value.suggested_filename=='kairos.glb', dl.value.suggested_filename)
    check('no page errors', not err, str(err[:2])); b.close()
print('extras_test: %s'%('FAILED '+str(len(fails)) if fails else 'passed'))
sys.exit(1 if fails else 0)
