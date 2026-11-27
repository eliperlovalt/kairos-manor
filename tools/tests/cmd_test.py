"""The chain of command (v1.74). python3 tools/tests/cmd_test.py FOLDER
Kairos gives an order; a servant carries it out by a real way and reports; Kairos says it is done.
  1. fetch a book: the nearest fit servant is named in Kairos's words, carries a sign, goes to the Library, comes back to Kairos, bows, reports
  2. summon the housekeeper: she comes to where His Grace stands
  3. at night nobody is sent unless woken
  4. the "Ask Kairos" sheet gives an order from the phone-sized screen
  5. a reel runs from a list of steps and the camera follows the servant
  6. a visitor's orders carry no word of the owner
Exit 1 on any failure."""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1]; fails=[]
def check(name, ok, detail=''):
    print('  %-78s %s %s'%(name,'ok' if ok else 'FAIL',detail if not ok else ''))
    if not ok: fails.append(name)
ST="()=>{const o=window.__o;if(!o)return null;const e=o.e,V=__vx,R=n=>{for(const B of V.BLD.slice(1))for(const r of B.rooms)if(r.n===n)return r};const L=R('The Double Library'),K=V.life.find(q=>q.kh);return {state:o.state,ph:o.ph,x:e.x,y:e.y,z:e.z,st:e.soul.st,sign:!!e.sign,errand:!!e.soul.errand,carry:e.soul.carry,inLib:!!(L&&e.x>=L.x0&&e.x<=L.x1&&e.z>=L.z0&&e.z<=L.z1&&Math.abs(e.y-L.y-1)<=1),dk:K?Math.hypot(e.x-K.x,e.z-K.z):99,dp:Math.hypot(e.x-V.PL.x,e.z-V.PL.z),cap:(document.querySelector('#cmdcap')||{}).textContent||'',log:V.cmd.C.log.slice(-8),free:!V.G(Math.round(e.x),e.y,Math.round(e.z))}}"
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base,w=844,h=390)
    def tick(n=4):
        for _ in range(n): pg.screenshot(clip={'x':0,'y':0,'width':8,'height':8})
    pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0);__vx.setMode('walk');__vx.setFP(true);__vx.setFly(1,1)}");tick(6)
    pg.evaluate("()=>{__vx.soul.setHour(10.5);__vx.soul.S.rate=10}");tick(2)
    # 1. fetch
    O=pg.evaluate("()=>{const o=__vx.cmd.order('fetch','a book from the Library');window.__o=o;return o?{name:o.e.soul.short,role:o.e.soul.role,title:o.e.soul.title,x:o.e.x,z:o.e.z}:null}")
    check('fetch a book: a servant is chosen (%s)'%(O and O['title']), bool(O) and O['role'] in('footman','hallboy','cellarman'), str(O))
    tick(2);s0=pg.evaluate(ST)
    check('Kairos names him and the task on the screen', O and O['name'] in s0['cap'] and 'Library' in s0['cap'], s0['cap'])
    check('the servant carries a sign over the head', s0['sign'] and s0['errand'])
    seen=[];lib=False;bad=0;last=None
    for k in range(260):
        tick(2);q=pg.evaluate(ST);last=q
        if q['state'] not in seen: seen.append(q['state'])
        lib=lib or q['inLib']
        if not q['free']: bad+=1
        if q['state'] in('done','failed'): break
    check('he goes, does it, comes back and reports (%s)'%' > '.join(seen), seen[-1]=='done' and 'doing' in seen and 'returning' in seen and 'reporting' in seen, str(last)[:300])
    check('he went to the Library and came back to Kairos (%.1f blocks from him)'%last['dk'], lib and last['dk']<8, str(last)[:200])
    check('every step on free floor', bad==0, str(bad))
    lg=' | '.join(last['log'])
    check('he reports and Kairos says it is done', 'Mr Kairos' in lg and ('is here' in lg or 'It is done' in lg), lg)
    tick(3);q=pg.evaluate(ST)
    check('the errand over, the sign is gone and he is back to his day', not q['sign'] and not q['errand'])
    # 2. summon
    pg.evaluate("()=>{const V=__vx,R=(()=>{for(const B of V.BLD.slice(1))for(const r of B.rooms)if(r.n==='The Great Hall')return r})(),P=V.PL;V.setFly(0,1);P.x=(R.x0+R.x1)/2+4;P.z=(R.z0+R.z1)/2+2;P.y=R.y+.5;P.yaw=0;P.vy=0;P.fly=0}");tick(3)
    O2=pg.evaluate("()=>{const o=__vx.cmd.order('summon','the housekeeper');window.__o=o;return o?{role:o.e.soul.role,name:o.e.soul.short}:null}")
    last=None
    for k in range(260):
        tick(2);q=pg.evaluate(ST);last=q
        if q['state'] in('done','failed') or q['state']=='reporting': break
    check('summon the housekeeper: she comes to His Grace (%.1f blocks off)'%last['dp'], bool(O2) and O2['role']=='housekeeper' and last['state']=='reporting' and last['dp']<5.5, str(last)[:260])
    for k in range(20):
        tick(2);q=pg.evaluate(ST)
        if 'sent for me' in ' '.join(q['log']): break
    check('she says she was sent for', 'sent for me' in ' '.join(q['log']), str(q['log']))
    # 3. night
    N=pg.evaluate("()=>{__vx.soul.setHour(23.6);const a=__vx.cmd.order('tidy','the Library');const cap=__vx.cmd.C.log.slice(-1)[0];const b=__vx.cmd.order('tidy','the Library',{wake:true});return {a:!!a,cap,b:!!b}}")
    check('at night nobody is sent, and Kairos says so; woken, one goes', not N['a'] and 'abed' in N['cap'] and N['b'], str(N))
    # 4. the sheet
    pg.evaluate("()=>{__vx.soul.setHour(10.5);__vx.setMode('over')}");tick(2)
    box=pg.evaluate("()=>{const r=document.querySelector('#bAsk').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,vis:r.width>0&&r.right<=innerWidth&&r.bottom<=innerHeight}}")
    check('the Ask Kairos button is on the phone-sized screen', box['vis'], str(box))
    n0=pg.evaluate("()=>__vx.cmd.C.orders.length")
    pg.click('#bAsk');pg.wait_for_selector('[data-c="verb"]');txt=pg.inner_text('#goalP')
    check('the sheet offers five verbs', all(v.lower() in txt.lower() for v in ['Fetch','Prepare','Tidy','Light','Summon']), txt[:160])
    pg.click('[data-c="verb"][data-v="light"]');pg.click('[data-c="order"]');tick(2)
    n1=pg.evaluate("()=>({n:__vx.cmd.C.orders.length,verb:__vx.cmd.C.orders.slice(-1)[0].verb,hidden:document.querySelector('#goal').hidden})")
    check('a tap gives the order and the sheet closes', n1['n']==n0+1 and n1['verb']=='light' and n1['hidden'], str(n1))
    g0=pg.evaluate("()=>{const C=__vx.cmd.C;C.last=-99;const n=C.orders.length;__vx.cmd.goal('A goal newly set, for the test');const o=C.orders.slice(-1)[0];return {n0:n,n1:C.orders.length,verb:o.verb,role:o.e.soul.role,cap:C.log.slice(-1)[0]}}")
    check('a goal newly set is sent to be entered in the book', g0['n1']==g0['n0']+1 and g0['verb']=='record' and 'Map Room' not in g0['cap'] or g0['verb']=='record', str(g0))
    # 5. a reel
    pg.evaluate("()=>{window.__reel=null;__vx.soul.S.rate=10;__vx.reel([{hour:10.5},{at:'The Great Hall',side:'s',secs:.3},{order:['prepare','the Dining Room for dinner']},{follow:'servant',until:'doing',max:60},{follow:'servant',front:true,secs:1},{look:'kairos',secs:.6}]).then(r=>{window.__reel=r})}")
    near=False;rs=None
    for k in range(240):
        tick(2);rs=pg.evaluate("()=>{const R=__vx.reelState(),w=R.who,c=__vx.camera.position;return {on:R.on,i:R.i,d:w?Math.hypot(w.x-c.x,w.z-c.z):99,done:!!window.__reel}}")
        if rs['i'] in(3,4) and rs['d']<7.5: near=True
        if rs['done']: break
    check('a reel runs its steps to the end and the camera keeps by the servant', rs['done'] and near, str(rs))
    check('no page errors', not err, str(err[:2])); b.close()
    # 6. a visitor
    b,pg,err=open_estate(p,base,w=844,h=390,owner=False)
    pg.wait_for_timeout(500)
    for _ in range(5): pg.screenshot(clip={'x':0,'y':0,'width':8,'height':8})
    V=pg.evaluate("()=>{__vx.soul.setHour(10.5);const out=[];for(const [v,t] of [['fetch','a book from the Library'],['summon','the cook'],['tidy','the Great Hall'],['light','the fire in the Library'],['prepare','tea in the Drawing Room']]){const o=__vx.cmd.order(v,t);out.push(!!o)}return {ok:out,log:__vx.cmd.C.log.join(' | ')}}")
    check('a visitor gives orders too, and no line carries a word of the owner', all(V['ok']) and 'Grace' not in V['log'] and len(V['log'])>80, V['log'][:200])
    check('visitor: no page errors', not err, str(err[:2])); b.close()
print('cmd_test: %s'%('FAILED '+str(len(fails)) if fails else 'passed'))
sys.exit(1 if fails else 0)
