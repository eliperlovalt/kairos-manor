"""The souls (v1.73). python3 tools/tests/soul_test.py FOLDER
The household keeps a day:
  1. every person has a name and a title; below stairs each has a timetable
  2. at the servants' dinner (12.2) they sit at table in the Servants' Hall; mid-morning (10.5) each is at the place the hour gives them;
     at night (23.6) below stairs has gone up to bed and the watch is kept
  3. nobody stands in a piece of furniture, in a wall, or in another person (counts printed)
  4. the ways between the places of each servant's day are found on foot, through doors and by the stairs
  5. a servant sent on walks there: he moves, and every step is on free floor
  6. His Grace is known: a bow as he comes near; the card tells who it is, what they are about and what comes next; a visitor's card has no word of the owner
Exit 1 on any failure."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from harness import serve, open_estate
from playwright.sync_api import sync_playwright
folder=sys.argv[1]; fails=[]
def check(name, ok, detail=''):
    print('  %-78s %s %s'%(name,'ok' if ok else 'FAIL',detail if not ok else ''))
    if not ok: fails.append(name)
SNAP="""()=>{const V=__vx,S=V.soul.S,o={n:0,named:0,plans:0,below:0,belowPlan:0,seated:0,hall:0,gone:0,inFurn:[],inWall:[],close:[],byRoom:{},roles:{}};const L=S.list;
 const roomOf=e=>{for(const B of V.BLD.slice(1))if(B&&B.rooms)for(const r of B.rooms)if(e.x>=r.x0&&e.x<=r.x1&&e.z>=r.z0&&e.z<=r.z1&&Math.abs(r.y+1-e.y)<=1)return r.n;return null};
 for(const e of L){const s=e.soul;o.n++;if(s.name&&s.title)o.named++;if(s.plan)o.plans++;const bl=e.indoor&&/^(footman|cellarman|hallboy|housekeeper|housemaid|cook|kitchenmaid|scullery)$/.test(s.role||'');if(bl){o.below++;if(s.plan)o.belowPlan++}
   if(e.gone){o.gone++;continue}const rn=roomOf(e);if(s.plan){o.byRoom[rn]=(o.byRoom[rn]||0)+1;if(bl)(o.roles[s.role]=o.roles[s.role]||[]).push(rn+':'+s.st+':'+s.task)}
   if(e.seated){o.seated++;if(rn==="The Servants' Hall")o.hall++}
   else if(s.plan){const cx=Math.round(e.x),cz=Math.round(e.z);if(V.G(cx,e.y,cz)||V.G(cx,e.y+1,cz))o.inWall.push([s.name,rn,cx,e.y,cz]);else if(V.stood(e.x,e.y,e.z))o.inFurn.push([s.name,rn,+e.x.toFixed(1),e.y,+e.z.toFixed(1)])}}
 for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(a.gone||b.gone||Math.abs(a.y-b.y)>1)continue;const d=Math.hypot(a.x-b.x,a.z-b.z);if(d<.45)o.close.push([a.soul.name,b.soul.name,+d.toFixed(2)])}
 return o}"""
ROUTES="""()=>{const V=__vx,S=V.soul.S,out={tried:0,found:0,fails:[],cells:0,long:0};const seen=new Set();
 for(const e of S.list){const s=e.soul;if(!s.plan||!/^(footman|cellarman|hallboy|housekeeper|housemaid|cook|kitchenmaid|scullery)$/.test(s.role||''))continue;const rooms=[];
   for(const ent of s.plan){if(ent[2]==='bed')continue;const rn=ent[1]==='home'?s.home:ent[1],P=V.soul.pool(rn,ent[2]);if(P.length)rooms.push([rn,P[(s.idx*7)%P.length]])}
   for(let i=0;i<rooms.length;i++){const a=rooms[i],b=rooms[(i+1)%rooms.length];if(a[0]===b[0])continue;const k=a[1].id+'>'+b[1].id;if(seen.has(k)||seen.has(b[1].id+'>'+a[1].id))continue;seen.add(k);out.tried++;
     const p=V.soul.path([a[1].x,a[1].y,a[1].z],[b[1].x,b[1].y,b[1].z],60000);if(p){out.found++;out.cells+=p.length;out.long=Math.max(out.long,p.length)}else out.fails.push(a[0]+' > '+b[0])}}
 return out}"""
with serve(folder) as base, sync_playwright() as p:
    b,pg,err=open_estate(p,base,w=844,h=390)
    def tick(n=4):
        for _ in range(n): pg.screenshot(clip={'x':0,'y':0,'width':8,'height':8})
    pg.evaluate("()=>{__vx.GOV.off=true;__vx.govSet(0);__vx.setMode('walk');__vx.setFP(true);__vx.setFly(1,1)}");tick(6)
    A=pg.evaluate(SNAP)
    check('every person has a name and a title (%d)'%A['n'], A['n']>150 and A['named']==A['n'])
    check('below stairs each keeps a timetable (%d of %d); %d in all keep one'%(A['belowPlan'],A['below'],A['plans']), A['below']>=10 and A['belowPlan']==A['below'] and A['plans']>=60)
    # mid-morning
    pg.evaluate("()=>__vx.soul.setHour(10.5)");tick(3);M=pg.evaluate(SNAP)
    r=M['roles']
    check('10.30: footmen are on duty in the Entrance Hall', all(x.startswith('The Entrance Hall') for x in r.get('footman',['x'])), str(r.get('footman')))
    check('10.30: the cook is in the Kitchen, the housekeeper in the house', all(x.startswith('The Kitchen') for x in r.get('cook',['x'])) and len(r.get('housekeeper',[]))>=1, str(r.get('cook'))+str(r.get('housekeeper')))
    check('10.30: nobody in a wall (%d), in furniture (%d) or in another (%d)'%(len(M['inWall']),len(M['inFurn']),len(M['close'])), not M['inWall'] and not M['inFurn'] and not M['close'], str((M['inWall']+M['inFurn']+M['close'])[:5]))
    # the servants' dinner
    pg.evaluate("()=>__vx.soul.setHour(12.2)");tick(3);D=pg.evaluate(SNAP)
    check("12.12: the servants sit at dinner in the Servants' Hall (%d seated there, %d of the household in the room)"%(D['hall'],D['byRoom'].get("The Servants' Hall",0)), D['hall']>=8 and D['byRoom'].get("The Servants' Hall",0)>=A['below']-1, str(D['byRoom']))
    check('12.12: nobody in a wall (%d), in furniture (%d) or in another (%d)'%(len(D['inWall']),len(D['inFurn']),len(D['close'])), not D['inWall'] and not D['inFurn'] and not D['close'], str((D['inWall']+D['inFurn']+D['close'])[:5]))
    # luncheon upstairs
    pg.evaluate("()=>__vx.soul.setHour(13.2)");tick(3);U=pg.evaluate(SNAP)
    check('13.12: luncheon in the State Dining Room (%d there, footmen waiting)'%U['byRoom'].get('The State Dining Room',0), U['byRoom'].get('The State Dining Room',0)>=8 and all(x.startswith('The State Dining Room') for x in U['roles'].get('footman',['x'])), str(U['byRoom'])[:200])
    # night
    pg.evaluate("()=>__vx.soul.setHour(23.6)");tick(3);N=pg.evaluate(SNAP)
    check('23.36: below stairs has gone up to bed (%d of the household away); the watch is kept (%d about)'%(N['gone'],N['plans']-N['gone']), N['gone']>=A['below'] and N['plans']-N['gone']>=3)
    # the ways
    pg.evaluate("()=>__vx.soul.setHour(10.5)");tick(2)
    R=pg.evaluate(ROUTES)
    check('the ways of the day are found: %d of %d (longest %d turns)'%(R['found'],R['tried'],R['long']), R['tried']>=20 and R['found']>=R['tried']*0.95, str(R['fails'][:6]))
    if R['fails']: print('      not found: '+'; '.join(R['fails'][:8]))
    # a servant sent on: the clock moves to dinner and he walks
    W=pg.evaluate("()=>{const V=__vx,S=V.soul.S;const e=S.list.find(e=>e.soul.role==='footman'&&!e.gone);window.__f=e;const P=V.PL;P.x=e.x+3;P.z=e.z+12;P.y=e.y-.5;P.yaw=0;P.vy=0;return {x:e.x,y:e.y,z:e.z,st:e.soul.st}}")
    pg.evaluate("()=>__vx.soul.clock(12.2)")
    tr=[];bad=0
    for k in range(36):
        tick(3);q=pg.evaluate("()=>{const e=window.__f,V=__vx,cx=Math.round(e.x),cz=Math.round(e.z);return {x:e.x,y:e.y,z:e.z,st:e.soul.st,free:!V.G(cx,e.y,cz)&&!V.G(cx,e.y+1,cz)&&V.G(cx,e.y-1,cz)!==0,furn:V.stood(e.x,e.y,e.z)&&!e.seated}}");tr.append(q)
        if(not q['free'] or q['furn']): bad+=1
    import math
    moved=max(math.hypot(q['x']-W['x'],q['z']-W['z'])+abs(q['y']-W['y']) for q in tr)
    states=sorted(set(q['st'] for q in tr))
    check('a footman sent to dinner sets out and walks (%.1f blocks; states %s)'%(moved,','.join(states)), moved>1.5 and ('walk' in states or 'sit' in states), str(tr[-1]))
    check('every step of his is on free floor', bad==0, str(bad))
    st=pg.evaluate("()=>__vx.soul.S.stats")
    # a bow, and the card
    pg.evaluate("()=>__vx.soul.setHour(10.5)");tick(2)
    B0=pg.evaluate("()=>{const V=__vx,S=V.soul.S,e=S.list.find(e=>e.soul.role==='housemaid'&&!e.gone&&!e.seated);window.__m=e;V.setFly(0,1);const P=V.PL;P.x=e.x+Math.sin(e.fig.rotation.y)*2;P.z=e.z+Math.cos(e.fig.rotation.y)*2;P.y=e.y-.5;P.vy=0;P.fly=0;return S.stats.bows}")
    tick(8);B1=pg.evaluate("()=>({bows:__vx.soul.S.stats.bows,bow:window.__m.soul.bow,body:window.__m.fig.userData.body.rotation.x})")
    check('a housemaid curtseys as His Grace comes near', B1['bows']>B0, str(B1))
    pg.evaluate("()=>__vx.run(['soul',window.__m])");card=pg.inner_text('#card')
    nm=pg.evaluate("()=>({n:window.__m.soul.name,t:window.__m.soul.title,now:__vx.soul.now(window.__m),next:__vx.soul.next(window.__m)})")
    check('the card names her, her place, her task and what comes next', nm['n'].lower() in card.lower() and nm['t'].lower() in card.lower() and nm['now'].lower() in card.lower() and len(nm['next'])>8 and nm['next'].lower() in card.lower(), card[:200])
    act=pg.evaluate("()=>{const a=document.querySelector('#act');return a&&!a.hidden?a.textContent:''}")
    check('the action button offers to speak to her', act.startswith('Speak to '), act)
    check('no page errors', not err, str(err[:2])); b.close()
    # a visitor's card
    b,pg,err=open_estate(p,base,w=844,h=390,owner=False)
    pg.wait_for_timeout(500);pg.evaluate("()=>{try{__vx.setMode('walk')}catch(e){}}")
    for _ in range(4): pg.screenshot(clip={'x':0,'y':0,'width':8,'height':8})
    txt=pg.evaluate("()=>{const V=__vx,S=V.soul.S,out=[];for(const e of S.list.slice(0,60)){out.push(e.soul.name+' | '+e.soul.title+' | '+V.soul.say(e)+' | '+V.soul.now(e)+' | '+V.soul.next(e))}return out.join('\\n')}")
    check('a visitor\'s cards carry no word of the owner (60 read)', 'Grace' not in txt and len(txt)>800, txt[:160])
    check('visitor: no page errors', not err, str(err[:2])); b.close()
print('  ways: found %s, not found %s, put in place unseen %s, cells searched %s, bows %s'%(st['found'],st['fails'],st['tele'],st['nodes'],st['bows']))
print('soul_test: %s'%('FAILED '+str(len(fails)) if fails else 'passed'))
sys.exit(1 if fails else 0)
