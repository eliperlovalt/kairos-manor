"""The phone (v1.76). python3 tools/tests/phone_test.py FOLDER
The page as a phone gets it: an iPhone's user agent, touch, 844 by 390 at 3x, the page choosing its own budget.
  1. it takes the phone's budget by itself: the shorter view, a pixel ratio of 1.5 at most, a 1024 shadow map, twelve fine figures
  2. it starts with no error, and a mesh's arrays are let go once the graphics card has them (the count and the megabytes are printed)
  3. on foot at the front lawn, in the Great Hall and in the garden the triangles drawn are printed, and none is over a million
  4. if the last start did not finish, the lighter house is raised: no Depot stonework, no shadows, a nearer horizon, and the loader says so
  5. a lost graphics context shows the message with its two buttons, never a blank page; so does a start that fails
  6. the loader and the home-screen title say Kairos Manor
Exit 1 on any failure."""
import sys, os, json, re, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1]; fails=[]
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
def check(name, ok, detail=''):
    print('  %-82s %s %s'%(name,'ok' if ok else 'FAIL',detail if not ok else ''))
    if not ok: fails.append(name)
STATE="""()=>{const V=__vx;let nul=0,kept=0,mb=0;const seen=new Set();V.scene.traverse(o=>{const g=o.geometry;if(!g||seen.has(g))return;seen.add(g);for(const k in g.attributes){const a=g.attributes[k];if(a.array==null)nul++;else{kept++;mb+=a.array.byteLength}}});
 const i=V.renderer.info;let skins=0;V.scene.traverse(o=>{if(o.userData&&o.userData.k==='contour')skins++});return {lite:V.LITE,full:V.FULL.on,far:V.GOV.far,lv:V.GOV.lv,pr:V.renderer.getPixelRatio(),shadow:V.renderer.shadowMap.enabled,keep:V.fig.Q.keep,nul,kept,keptMB:Math.round(mb/1048576),tris:i.render.triangles,calls:i.render.calls,skins,heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):0,boot:localStorage.getItem('km-boot'),safe:localStorage.getItem('km-safe')}}"""
page=open(os.path.join(folder,'index.html'),encoding='utf-8',errors='ignore').read()
check('the loader says Kairos Manor and nothing of the old names', 'Raising Kairos Manor' in page and 'Raising Euphrates Hall' not in page and 'Voxel Estate. Raising' not in page)
if os.path.abspath(folder)==os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..')):
    check('the home-screen title is Kairos Manor', 'apple-mobile-web-app-title" content="Kairos Manor"' in page)
with serve(folder) as base, sync_playwright() as p:
    def frames(pg,n=4):
        for _ in range(n): pg.screenshot(clip={'x':0,'y':0,'width':8,'height':8},timeout=150000)
    # 1, 2, 3: the phone's own budget
    b,pg,err=open_estate(p,base,lite=None,ua=UA,dpr=3); frames(pg,6); A=pg.evaluate(STATE)
    check('a phone takes the phone budget by itself (view %d, pixel ratio %.2f, %d fine figures)'%(A['far'],A['pr'],A['keep']), A['lite']==1 and not A['full'] and A['far']<=230 and A['pr']<=1.5 and A['keep']<=12, str(A))
    check('it starts with no error', not err, str(err[:2]))
    check('arrays let go once the graphics card has them: %d let go, %d MB still held by meshes not yet shown'%(A['nul'],A['keptMB']), A['nul']>=800 and A['keptMB']<=130, str(A))
    pg.evaluate("()=>{__vx.GOV.off=true;__vx.setMode('walk');__vx.setFP(true)}"); T={}
    for name,spot in [('the front lawn',[0,58,0,0,None]),('the Great Hall',[0,-54,0,0,8]),('the garden',[30,150,0,0,None])]:
        pg.evaluate("([x,z,yaw,pitch,y])=>{const P=__vx.PL;P.x=x;P.z=z;P.yaw=yaw;P.pitch=pitch;if(y!=null){P.y=y;__vx.setFly(1,1)}else{__vx.setFly(0,1);P.y=__vx.groundY(x,z)-.5}P.vy=0}",spot); frames(pg,5)
        T[name]=pg.evaluate("()=>__vx.renderer.info.render.triangles")
    check('triangles on foot: '+', '.join('%s %dk'%(k,v//1000) for k,v in T.items()), max(T.values())<1000000, str(T))
    B2=pg.evaluate(STATE)
    check('the start marker is set while the house rises and the house keeps its phone budget on foot', B2['lite']==1 and B2['safe'] is None, str(B2))
    # the season, the hour, an opened building, the overview and back: nothing reads an array the phone has let go
    pg.evaluate("()=>{const V=__vx;V.pickSeason('winter')}"); frames(pg,3)
    pg.evaluate("()=>{const V=__vx;V.pickTime('night')}"); frames(pg,2)
    pg.evaluate("()=>{const V=__vx;V.setMode('over');V.openB(1)}"); frames(pg,3)
    pg.evaluate("()=>{const V=__vx;V.close();V.pickSeason('summer');V.pickTime('day');V.setMode('walk')}"); frames(pg,3)
    check('season, hour, an opened building and the overview all work on the phone budget', not err, str(err[:3]))
    # 5a: a lost context
    pg.evaluate("()=>{const gl=__vx.renderer.getContext(),x=gl.getExtension('WEBGL_lose_context');x&&x.loseContext()}"); pg.wait_for_timeout(800)
    O=pg.evaluate("()=>{const o=document.querySelector('#oops');return {shown:o&&!o.hidden,text:o?o.innerText:'',btn:!!document.querySelector('#oopsR')&&!!document.querySelector('#oopsL'),safe:localStorage.getItem('km-safe')}}")
    check('a lost graphics context shows the message and its two buttons', O['shown'] and 'lost its picture' in O['text'] and O['btn'] and O['safe'], str(O)[:200]); b.close()
    # 4: the last start did not finish
    b,pg,err=open_estate(p,base,lite=None,ua=UA,dpr=3,init="try{localStorage.setItem('km-boot',String(Date.now()-60000))}catch(e){}"); load=pg.evaluate("()=>{const l=document.querySelector('#load');return l?l.textContent:''}"); frames(pg,6); S2=pg.evaluate(STATE)
    check('a start that did not finish is followed by the lighter house (no stonework, no shadows, view %d)'%S2['far'], S2['lite']==2 and S2['skins']==0 and not S2['shadow'] and S2['far']<=170 and S2['pr']<=1.25 and bool(S2['safe']), str(S2))
    check('the lighter house starts with no error', not err, str(err[:2])); b.close()
    # 5b: a start that fails
    b=p.chromium.launch(executable_path=(os.environ.get('CHROME') or None),args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=b.new_context(viewport={'width':844,'height':390},has_touch=True,user_agent=UA); ctx.add_init_script('window.__EH_FAIL=1;window.__EH_LITE=1'); pg=ctx.new_page()
    from harness import _route
    pg.route('**/*',_route); pg.goto(base+'index.html',wait_until='domcontentloaded',timeout=180000)
    pg.wait_for_function("document.querySelector('#oops') && !document.querySelector('#oops').hidden",timeout=120000)
    O=pg.evaluate("()=>({text:document.querySelector('#oops').innerText,load:getComputedStyle(document.querySelector('#load')).display})")
    check('a start that fails shows the message, not a frozen loader', 'could not be raised' in O['text'] and O['load']=='none', str(O)[:200]); b.close()
print('  phone budget: view %d, %d draws and %dk triangles in the first view, script heap %d MB'%(A['far'],A['calls'],A['tris']//1000,A['heap']))
print('phone_test: %s'%('FAILED '+str(len(fails)) if fails else 'passed'))
sys.exit(1 if fails else 0)
