"""Owner and visitor. python3 tools/tests/visitor_test.py FOLDER
Proves that nothing private of the owner's reaches a visitor, and that a visitor can make the house their own, on a phone-sized screen (844 by 390).
  1. No private link is in the page's files.
  2. As the owner (a device holding links; stand-ins here) every record keeps its title and opens its link.
  3. As a visitor: no record opens a link or a page of the owner's; none of the owner's record titles, room notes or forms of address shows anywhere;
     the welcome asks a name and goals and keeps them in this browser only; the tour runs; a goal shows on the map table, its step can be ticked;
     the house saves to a file, loads, and clears; a second visit is greeted by name; the Founders' wall stands in the Entrance Hall.
Exit 1 on any failure."""
import sys, os, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1]; fails=[]
def check(name, ok, detail=''):
    print('  %-66s %s %s'%(name,'ok' if ok else 'FAIL',detail if not ok else ''))
    if not ok: fails.append(name)
# 1. the files
root=os.path.abspath(folder)
for fn in ['index.html','golem-registry.json','kits.json','estate-plan.json','manifest.json']:
    fp=os.path.join(root,fn)
    if not os.path.exists(fp): continue
    t=open(fp,encoding='utf-8',errors='ignore').read()
    bad=re.findall(r'claude\.ai/(?:artifact|public|share)[^"\'\s<]*|docs\.google\.com/[^"\'\s<]+|notion\.so/[^"\'\s<]+',t)
    check('no private link in '+fn, not bad, str(bad[:2]))
SNAP="""()=>{const V=__vx,objs=V.OBJ.map(o=>({n:o.n,a:o.a,k:o.k,room:o.room?o.room.n:''}));const rooms=[];V.BLD.forEach(B=>{if(B&&B.rooms)for(const r of B.rooms)rooms.push({n:r.n,w:r.w||''})});
 return {objs,rooms,text:document.body.innerText,links:(()=>{try{return localStorage.getItem('eh-links')}catch(e){return null}})(),url:k=>0,wall:(()=>{let n=0;V.scene.traverse(m=>{if(m.userData&&m.userData.k==='foundersWall')n++});return n})(),title:document.title}}"""
with serve(folder) as base, sync_playwright() as p:
    # 2. the owner
    b,pg,err=open_estate(p,base,owner=True); pg.wait_for_timeout(1500)
    O=pg.evaluate(SNAP); keys=sorted({str(o['a'][1]) for o in O['objs'] if o['a'] and o['a'][0] in('nx','v23')})
    urls=pg.evaluate("(ks)=>ks.map(k=>__vx.viewUrl(k))",keys)
    tails=sorted({o['n'].split(':',1)[1].strip() for o in O['objs'] if o['k']!='kairos' and ':' in o['n'] and len(o['n'].split(':',1)[1].strip())>=5})
    notes=sorted({r['w'] for r in O['rooms'] if r['w'] and len(r['w'])>=5})
    check('owner: records keep their titles (%d titled)'%len(tails), len(tails)>=20)
    check('owner: every record key gives a link (%d keys)'%len(keys), all(u and u.startswith('https://') for u in urls), str([k for k,u in zip(keys,urls) if not u][:4]))
    check('owner: no welcome sheet', not pg.is_visible('#goal'))
    check('owner: no page errors', not err, str(err[:2])); b.close()
    # 3. the visitor, first visit
    b,pg,err=open_estate(p,base,owner=False)
    pg.wait_for_selector('#goal:not([hidden])',timeout=20000)
    Vs=pg.evaluate(SNAP)
    check('visitor: the page is named Kairos Manor', Vs['title']=='Kairos Manor', Vs['title'])
    check('visitor: no private links in this browser', Vs['links'] is None)
    kinds={o['a'][0] for o in Vs['objs'] if o['a']}
    check('visitor: no record opens a link or a page of the owner\'s', kinds<= {'you','kbutler','founders','info'}, str(kinds))
    check('visitor: no record key gives a link', not any(pg.evaluate("(ks)=>ks.map(k=>__vx.viewUrl(k))",keys)))
    blob='\n'.join([o['n'] for o in Vs['objs']]+[str(o['a']) for o in Vs['objs']]+[Vs['text']])
    shown=pg.evaluate("()=>{const V=__vx,o=[];V.BLD.forEach(B=>{if(B&&B.rooms)for(const r of B.rooms)o.push(V.roomName(r.n))});for(const x of V.OBJ)o.push(V.whereOf(x));return o}")
    leak=[t for t in tails if t.lower() in blob.lower()]
    check('visitor: none of the owner\'s %d record titles shows'%len(tails), not leak, str(leak[:4]))
    leak=pg.evaluate("()=>{const V=__vx,o=[];V.BLD.forEach(B=>{if(B&&B.rooms)for(const r of B.rooms)if(r.w&&V.whereOf({room:r})!==V.roomName(r.n))o.push(r.n)});return o}")
    check('visitor: none of the owner\'s %d room notes shows beside a room\'s name'%len(notes), not leak, str(leak[:4]))
    blob+='\n'.join(shown)
    m=re.findall(r"(?:His|Your) Grace[^\n]{0,30}",blob)
    check('visitor: no form of address of the owner\'s shows', not m, str(m[:3]))
    check('visitor: the welcome is up, and fits a phone', pg.is_visible('#yName') and pg.evaluate("()=>{const r=document.querySelector('#goalP').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0}"))
    pg.fill('#yName','Ada'); pg.fill('[data-yg="0"]','Ship the book'); pg.fill('[data-yg="1"]','Run ten miles')
    pg.locator('[data-y=begin]').scroll_into_view_if_needed(); pg.click('[data-y=begin]'); pg.wait_for_timeout(600)
    st=pg.evaluate("()=>JSON.parse(localStorage.getItem('kairos-manor-you')||'null')")
    check('visitor: name and goals kept in this browser', bool(st) and st['name']=='Ada' and [g['t'] for g in st['goals']]==['Ship the book','Run ten miles'], str(st))
    check('visitor: the tour starts with Kairos', pg.is_visible('#tourbar') and 'kairos, stop 1 of' in pg.inner_text('#tourtxt').lower(), pg.inner_text('#tourtxt') if pg.is_visible('#tourbar') else '')
    n=0
    while pg.is_visible('#tourbar') and n<8: pg.click('#tnext'); pg.wait_for_timeout(350); n+=1
    check('visitor: the tour runs to its end (%d stops)'%n, n>=4 and not pg.is_visible('#tourbar'))
    pg.evaluate("()=>{const o=__vx.OBJ.find(o=>/map table/.test(o.n));__vx.run(o.a)}"); pg.wait_for_timeout(300)
    check('visitor: the map table shows their goals', pg.is_visible('#goal') and 'Ship the book' in pg.inner_text('#goalP'))
    pg.fill('[data-ys="0"]','Write the first page'); pg.wait_for_timeout(150); pg.click('[data-y=tick][data-i="0"]'); pg.wait_for_timeout(200)
    st=pg.evaluate("()=>JSON.parse(localStorage.getItem('kairos-manor-you')||'null')")
    check('visitor: a step is ticked off and counted', st['goals'][0]['done']==1 and st['goals'][0]['step']=='', str(st['goals'][0]))
    pg.fill('[data-ys="0"]','Write page two'); pg.wait_for_timeout(150)
    with pg.expect_download(timeout=8000) as d: pg.click('[data-y=save]')
    saved=json.load(open(d.value.path()))
    check('visitor: the house saves to a file', saved.get('name')=='Ada' and len(saved.get('goals',[]))==2, str(saved)[:120])
    pg.click('[data-y=clear]'); pg.wait_for_timeout(150); pg.click('[data-y=clear]'); pg.wait_for_timeout(300)
    check('visitor: clear empties this browser and offers the welcome', pg.evaluate("()=>localStorage.getItem('kairos-manor-you')") is None and pg.is_visible('#yName'))
    pg.click('[data-y=close]'); pg.wait_for_timeout(100)
    pg.evaluate("()=>__vx.run(['you',-1])"); pg.wait_for_timeout(200)
    tmp=os.path.join(os.path.dirname(d.value.path()),'house.json'); json.dump(saved,open(tmp,'w'))
    if pg.is_visible('#yName'): pg.click('[data-y=skip]'); pg.evaluate("()=>__vx.run(['you',-1])"); pg.wait_for_timeout(200)
    pg.set_input_files('#yFile',tmp); pg.wait_for_timeout(500)
    st=pg.evaluate("()=>JSON.parse(localStorage.getItem('kairos-manor-you')||'null')")
    check('visitor: the file loads back', bool(st) and st['name']=='Ada' and st['goals'][0]['step']=='Write page two', str(st)[:140])
    fo=[o for o in Vs['objs'] if o['k']=='founders']
    check('the Founders\' wall stands in the Entrance Hall (2 boards)', len(fo)==2 and all(o['room']=='The Entrance Hall' for o in fo) and Vs['wall']==2, str(fo)+str(Vs['wall']))
    pg.evaluate("()=>__vx.run(['founders',0])"); pg.wait_for_timeout(200)
    check('the wall opens its list', 'One hundred frames' in pg.inner_text('#goalP'))
    check('visitor: no page errors', not err, str(err[:2]))
    # a second visit
    pg.reload(wait_until='domcontentloaded'); pg.wait_for_function('window.__vx && window.__vx.BLD',timeout=180000); pg.wait_for_timeout(2600)
    tt=pg.evaluate("()=>(document.querySelector('#toast')||{}).textContent||''")
    check('visitor: a second visit is greeted by name with the next step', 'Welcome back, Ada' in tt and 'Write page two' in tt, tt)
    check('visitor: no welcome sheet on a second visit', not pg.is_visible('#yName'))
    b.close()
print('VISITOR TEST %s'%('PASS' if not fails else 'FAIL (%d)'%len(fails)))
sys.exit(1 if fails else 0)
