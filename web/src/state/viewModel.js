// Builds the view model: every label, colour, list and click handler the screens need,
// derived from the AppController state. Screens stay simple and only read from it.
import { CATS, PTYPES, PNAMES, HC_TYPES, HC_DAYS, dueLabel, UNITS, SUPPORTS, SEV, ST, ORDER, TONE, CIP_CHOICES, CIP_REASONS } from '../data/constants.js';
import { timeLabel, stampLabel, daysAgo, addDaysIso, durLabel } from '../utils/time.js';
import { draftOf } from './draft.js';
import { buildChatView, buildDiscussion } from './chatView.js';

// Alerts about something I did myself (sent by the app or the database) are not shown to me.
const OWN_HIDDEN=['message-circle','file-plus','user-plus','rotate-ccw','shield-check','circle-check'];

const PW_WORDS=['mango','lotus','river','tiger','mekong','jasmine','rice','palm','amber','cloud'];
const WORDS_PW=()=>PW_WORDS[Math.floor(Math.random()*PW_WORDS.length)]+'-'+String(Math.floor(1000+Math.random()*9000));

export function buildViewModel(app) {
    const s=app.state, T=app.T(), role=app.role(), flow=app.flow(), PEOPLE=app.people(), AV=app.avatarOf, HC_OWNERS=['QC team',...app.staffNames()], me={...app.me(), role, roleLabel:T.roles[role]};
    const is={home:s.screen==='home',list:s.screen==='list',tasks:s.screen==='tasks',alerts:s.screen==='alerts',detail:s.screen==='detail',details:s.screen==='details',done:s.screen==='done',team:s.screen==='team'&&role==='manager',chat:s.screen==='chat',capture:s.screen==='capture'};
    const all=s.reports.map(r=>app.deco(r));
    const active=all.filter(r=>r.status!=='closed');
    const startCap = ()=>{ app._sig=null; app.go('capture',{cap:{stage:'camera',cat:null,sev:null,photo:false,customText:''},signed:false}); };
    const nav={home:()=>app.go('home'),list:()=>app.go('list'),tasks:()=>app.go('tasks'),alerts:()=>app.go('alerts'),capture:startCap,
      detail:()=>app.go('detail'),details:()=>{ const r=s.reports.find(x=>x.id===s.selId); app.go('details',{draft:draftOf(r),recording:false}); }};

    const stats=[{n:active.length,label:T.open,fg:'var(--blue-600)',onClick:()=>app.go('list',{filter:'open'})},
      {n:active.filter(r=>r.sev===T.sev[3]).length,label:T.criticalN,fg:'var(--red-700)',onClick:()=>app.go('list',{filter:'open'})},
      {n:all.filter(r=>r.status==='closed'&&daysAgo(r.updatedAt)<7).length,label:T.closedWk,fg:'var(--green-600)',onClick:()=>app.go('list',{filter:'closed'})}];
    const pill=(on)=>({bg:on?'var(--navy-900)':'#fff',fg:on?'#fff':'var(--navy-900)',bd:on?'var(--navy-900)':'var(--blue-200)'});
    // Production lines: [text colour, dot, dot animation, progress bar, pill background]
    const LST={running:['var(--green-700)','var(--green-500)','lrPulse 1.6s infinite','var(--green-500)','var(--green-100)'],stopped:['var(--red-700)','var(--red-500)','none','var(--red-500)','var(--red-100)'],
      cleaning:['var(--blue-700)','var(--blue-500)','none','var(--blue-300)','var(--blue-100)'],changeover:['var(--amber-700)','var(--amber-500)','none','var(--amber-500)','var(--amber-100)'],
      maintenance:['var(--navy-900)','var(--navy-500)','none','var(--navy-300)','var(--gray-100)'],idle:['var(--gray-500)','var(--gray-300)','none','var(--gray-300)','var(--gray-100)']};
    const LSTATES=['running','stopped','cleaning','changeover','maintenance','idle'];
    const stLabelOf=k=>T.lnSt[k]||T.lnStX[k]||k;
    const issuesOn=name=>s.reports.filter(r=>r.loc===name&&r.status!=='closed').length;
    // What the line is doing now: the lot it runs (and for how long), or the CIP countdown after a lot.
    const now=s.clock||Date.now(), ms=v=>Date.parse(v)||0;
    const cipOf=l=>{ if(l.status!=='cleaning'||!l.cipUntil) return null; const until=ms(l.cipUntil), from=ms(l.statusSince)||until-4*3600000, left=until-now;
      const reason=l.cipReason&&l.cipReason!=='standard'?T.lot.reasons[l.cipReason]:'';
      return {done:left<=0,left,until,ends:stampLabel(l.cipUntil),leftLabel:durLabel(Math.abs(left)),planned:durLabel(until-from),pct:Math.min(100,Math.max(0,Math.round((now-from)/Math.max(1,until-from)*100)))+'%',reason}; };
    const lotOf=l=>(l.lot&&l.status==='running'?{lot:l.lot,started:l.lotStartedAt?stampLabel(l.lotStartedAt):'',dur:l.lotStartedAt?durLabel(now-ms(l.lotStartedAt)):''}:null);
    // One line of text under the output bar on the home card.
    const nowLine=l=>{ const lt=lotOf(l), c=cipOf(l);
      if(lt) return {icon:'play',fg:'var(--green-700)',bg:'var(--green-100)',text:T.lot.running+' '+lt.lot+(lt.dur?' · '+lt.dur:'')};
      if(c) return c.done?{icon:'circle-check',fg:'var(--green-700)',bg:'var(--green-100)',text:T.lot.cipDone}
        :{icon:'hourglass',fg:'var(--blue-700)',bg:'var(--blue-50)',text:T.lot.cip+(c.reason?' · '+c.reason:'')+' · '+c.leftLabel+' '+T.lot.cipLeft+' · '+T.lot.cipEnds+' '+c.ends,pct:c.pct};
      if(l.lot&&l.status!=='running') return {icon:'circle-pause',fg:'var(--gray-700)',bg:'var(--gray-100)',text:T.lot.number+' '+l.lot+' · '+stLabelOf(l.status)};
      return null; };
    const lines=(s.lines||[]).map(l=>{const n=issuesOn(l.name); const c=LST[l.status]||LST.idle;
      return {id:l.id,name:l.name,type:l.type,product:l.product||'—',note:l.note||'',qty:l.qty,target:l.target,pct:Math.min(100,Math.round(l.qty/Math.max(1,l.target)*100))+'%',stLabel:stLabelOf(l.status),stFg:c[0],dot:c[1],anim:c[2],bar:c[3],
        bd:n&&l.status==='stopped'?'var(--red-500)':'var(--blue-200)',issues:n?n+' '+(n===1?T.oneIssue:T.manyIssues):T.noIssues,isFg:n?'var(--red-700)':'var(--green-700)',isIcon:n?'triangle-alert':'circle-check',
        now:nowLine(l), open:()=>app.openLine(l.id)};});
    const linesHead={canAdd:true,add:()=>app.openLineForm(null),empty:!lines.length};
    // Line control sheet
    const selLine=(s.lines||[]).find(l=>l.id===s.lineId);
    const lineSheet=selLine?(()=>{const l=selLine, n=issuesOn(l.name), setQty=q=>app.updateLine(l.id,{qty:Math.max(0,Math.round(q)||0)});
      return {name:l.name,type:l.type,product:l.product||'—',qty:l.qty,target:l.target,pct:Math.min(100,Math.round(l.qty/Math.max(1,l.target)*100))+'%',bar:(LST[l.status]||LST.idle)[3],
        updated:(l.updatedBy?T.line.updated+' '+l.updatedBy+' · ':'')+stLabelOf(l.status)+' '+T.line.since+' '+stampLabel(l.statusSince),
        // Picking CIP while a lot is running opens "Finish lot", so the lot's end gets recorded.
        states:LSTATES.map(k=>{const on=l.status===k, c=LST[k]; return {label:stLabelOf(k),dot:c[1],on,bg:on?c[4]:'#fff',fg:on?c[0]:'var(--navy-900)',bd:on?c[1]:'var(--blue-200)',pick:()=>(k==='cleaning'&&l.lot&&l.status==='running'?app.openFinishLot():app.updateLine(l.id,{status:k}))};}),
        // Lot now, CIP now, the two forms, and this line's lot history
        lot:lotOf(l), cip:cipOf(l), idleLot:l.lot&&l.status!=='running'?l.lot:'', canFinish:!!l.lot, startLabel:cipOf(l)||(s.lots||[]).some(x=>x.lineId===l.id)?T.lot.startNext:T.lot.start,
        openStart:app.openStartLot, openFinish:app.openFinishLot, extend:h=>app.extendCip(h),
        startForm:s.lineLot?(()=>{const f=s.lineLot, setF=p=>app.setState(st=>({lineLot:{...st.lineLot,...p}}));
          return {lot:f.lot||'',product:f.product||'',onLot:e=>setF({lot:e.target.value.toUpperCase()}),onProduct:e=>setF({product:e.target.value}),
            products:(PNAMES[l.type==='UHT'?'UHT milk':l.type]||[]).map(nm=>({label:nm,...pill(f.product===nm),pick:()=>setF({product:nm})})),
            disabled:!(f.lot||'').trim(),save:app.startLot,cancel:()=>app.setState({lineLot:null})};})():null,
        endForm:s.lineEnd?(()=>{const f=s.lineEnd, setF=p=>app.setState(st=>({lineEnd:{...st.lineEnd,...p}})); const h=parseFloat(f.hours);
          return {lot:l.lot||'—',product:l.product||'—',started:l.lotStartedAt?stampLabel(l.lotStartedAt):T.lot.unknown,ran:l.lotStartedAt?durLabel(now-ms(l.lotStartedAt)):'',qty:f.qty,onQty:e=>setF({qty:e.target.value.replace(/[^0-9]/g,'')}),
            hours:CIP_CHOICES.map(n=>({label:n+' '+T.lot.hoursShort,...pill(h===n),pick:()=>setF({hours:String(n),reason:n===4&&f.reason==='other'?'standard':f.reason})})), hoursText:f.hours, onHours:e=>setF({hours:e.target.value.replace(/[^0-9.]/g,'')}),
            reasons:CIP_REASONS.map(k=>({label:T.lot.reasons[k],...pill(f.reason===k),pick:()=>setF({reason:k,hours:k==='standard'?'4':(h>4?f.hours:'6')})})),
            note:f.note||'',onNote:e=>setF({note:e.target.value}),disabled:!!s.busy||!(h>=0),save:app.finishLot,cancel:()=>app.setState({lineEnd:null})};})():null,
        history:(s.lots||[]).filter(x=>x.lineId===l.id||(!x.lineId&&x.lineName===l.name)).slice(0,8).map(x=>({id:x.id,lot:x.lot,product:x.product||'—',
          when:(x.startedAt?stampLabel(x.startedAt)+' '+T.lot.fromTo+' ':'')+stampLabel(x.endedAt), ran:x.startedAt?durLabel(ms(x.endedAt)-ms(x.startedAt)):'', qty:x.qty+' / '+(x.target||'—')+' '+T.lot.pal,
          cip:T.lot.cipShort+' '+x.cipHours+' '+T.lot.hoursShort+(x.cipReason&&x.cipReason!=='standard'?' · '+T.lot.reasons[x.cipReason]:''), by:x.endedByName, note:x.note})),
        steps:[-10,-1,1,10].map(d=>({label:(d>0?'+':'−')+Math.abs(d),pick:()=>setQty(l.qty+d)})), onQty:e=>setQty(parseInt(e.target.value.replace(/[^0-9]/g,''),10)||0), reset:()=>setQty(0),
        note:s.lineNote!=null?s.lineNote:(l.note||''), onNote:e=>app.setState({lineNote:e.target.value}), noteDirty:s.lineNote!=null&&s.lineNote!==(l.note||''),
        saveNote:()=>{app.updateLine(l.id,{note:(s.lineNote||'').trim()}); app.setState({lineNote:null});},
        issues:n, seeIssues:()=>app.setState({sheet:null},()=>app.go('list',{filter:'open',f:{date:'any',lines:[l.name],products:[],sevs:[]},q:''})),
        canManage:app.canManageLines(), canEdit:true, edit:()=>app.openLineForm(l), confirm:!!s.lineConfirm, askRemove:()=>app.setState({lineConfirm:true}), cancelRemove:()=>app.setState({lineConfirm:false}), remove:()=>app.removeLine(l.id)};})():null;
    // Add / edit line form
    const lf=s.lineForm||{}; const setLF=p=>app.setState(st=>({lineForm:{...st.lineForm,...p}}));
    const lineForm={isNew:!s.lineId,name:lf.name||'',product:lf.product||'',target:lf.target||'',onName:e=>setLF({name:e.target.value}),onProduct:e=>setLF({product:e.target.value}),onTarget:e=>setLF({target:e.target.value.replace(/[^0-9]/g,'')}),
      types:['UHT','SCM','Yogurt','Other'].map(k=>({label:k==='Other'?T.line.other:k,...pill(lf.type===k),pick:()=>setLF({type:k})})),
      products:(PNAMES[lf.type==='UHT'?'UHT milk':lf.type]||[]).map(n=>({label:n,...pill(lf.product===n),pick:()=>setLF({product:n})})),
      disabled:!!s.busy||!(lf.name||'').trim()||!(parseInt(lf.target,10)>0), save:app.saveLineForm};
    const TICON={decide:'gavel',check:'bell-ring',fix:'hand',assign:'user-plus',done:'wrench',verify:'shield-check',approve:'stamp'};
    const tasksOf=rl=>{const out=[]; s.reports.forEach(rr=>app.tasksFor(rr,rl).forEach(k=>out.push({r:rr,k}))); return out;};
    const hintOf=r=>{ if(r.capa&&r.capa.overdue&&r.status==='action') return {hint:T.hintOver+' '+r.capa.due,hintIcon:'clock',hintFg:'var(--red-700)'};
      if(r.needsApproval) return {hint:T.hintAppr,hintIcon:'stamp',hintFg:'var(--blue-700)'};
      if(r.holdCheck&&['due','decision','scheduled'].includes(r.holdCheck.status)) return {hint:T.hcTypes[r.holdCheck.type]+' · '+T.hcSt[r.holdCheck.status]+' · '+r.holdCheck.due,hintIcon:'circle-pause',hintFg:'var(--amber-700)'};
      const e=[...r.tl].reverse().find(x=>x[0]==='esc'); if(e) return {hint:T.hintEsc+' '+e[1]+' ·'+e[3],hintIcon:'arrow-up-right',hintFg:'var(--blue-700)'}; return null; };
    const row=r=>{const d=app.deco(r), hn=hintOf(r); return {...d,...(hn||{}),hasHint:!!hn,cardBd:d.mine?'var(--blue-500)':'var(--blue-200)'};};
    const sec=(title,list,tone)=>({title,items:list.slice(0,4).map(row),count:list.length,empty:!list.length,cBg:list.length?(tone==='red'?'var(--red-100)':'var(--blue-100)'):'var(--gray-100)',cFg:list.length?(tone==='red'?'var(--red-700)':'var(--blue-700)'):'var(--gray-500)'});
    const R=s.reports, openR=R.filter(r=>r.status!=='closed'), bySev=(a,b)=>b.sev-a.sev;
    const overdueR=openR.filter(r=>r.capa&&r.capa.overdue&&r.status==='action');
    const homeSections = role==='qc' ? [sec(T.myReports,R.filter(r=>r.by===me.name).sort((a,b)=>(a.status==='closed')-(b.status==='closed')))]
      : role==='qa' ? [sec(T.toReview,openR.filter(r=>r.level==='qa'&&r.status==='open').sort(bySev)),sec(T.decisions,openR.filter(r=>r.holdCheck&&r.holdCheck.status==='decision'&&app.decider(r)==='qa'),'red'),
          sec(T.verifyFix,openR.filter(r=>r.status==='verify'&&!r.needsApproval)),sec(T.holdList,R.filter(r=>r.hold))]
      : role==='supervisor' ? [sec(T.myLine,openR.filter(r=>r.level==='supervisor'||(r.capa&&r.capa.owner===me.name&&r.status==='action')).sort(bySev)),sec(T.overdueL,overdueR,'red')]
      : [sec(T.critEsc,openR.filter(r=>r.sev===3||r.level==='manager').sort(bySev),'red'),sec(T.approvals,openR.filter(r=>r.needsApproval))];
    const kpis = role==='manager' ? [{n:openR.length,label:T.kOpen,fg:'var(--blue-600)'},{n:openR.filter(r=>r.sev===3).length,label:T.kCrit,fg:'var(--red-700)'},{n:overdueR.length,label:T.kOver,fg:'var(--amber-700)'},{n:R.filter(r=>r.status==='closed'&&daysAgo(r.updatedAt)<7).length,label:T.kClosed,fg:'var(--green-600)'}]
      : [{n:openR.filter(r=>r.level==='qa'&&r.status==='open').length,label:T.kReview,fg:'var(--blue-600)'},{n:R.filter(r=>r.hold).length,label:T.kHold,fg:'var(--navy-900)'},{n:openR.filter(r=>r.holdCheck&&r.holdCheck.status==='decision').length,label:T.kDecide,fg:'var(--red-700)'},{n:openR.filter(r=>r.status==='verify'&&!r.needsApproval).length,label:T.kVerify,fg:'var(--green-600)'}];
    kpis.forEach(k=>k.onClick=()=>app.go('list',{filter:'open'}));
    const home={cta:role==='qc'||role==='supervisor',kpis:role==='qa'||role==='manager',checklist:role==='qc',team:role==='supervisor',trend:role==='manager'};
    const cks=s.checks||[]; const cdone=cks.filter(Boolean).length;
    const checklist={done:cdone,total:T.checks.length,pct:Math.round(cdone/T.checks.length*100)+'%',items:T.checks.map(([l,tm],i)=>({label:l,time:tm,on:!!cks[i],bd:i?'var(--gray-100)':'transparent',
      boxBg:cks[i]?'var(--green-600)':'#fff',boxBd:cks[i]?'var(--green-600)':'var(--gray-300)',fg:cks[i]?'var(--gray-500)':'var(--navy-900)',deco:cks[i]?'line-through':'none',
      toggle:()=>app.toggleTick(i)}))};
    const team=['qc','qa','manager'].map((k,i)=>{const tk=tasksOf(k); const f=tk[0]; return {...PEOPLE[k],roleLabel:T.roles[k],bd:i?'var(--gray-100)':'transparent',
      doing:f?app.taskLabel(f.r,f.k,T)+' · '+f.r.id:T.idle,fg:f?'var(--navy-900)':'var(--gray-500)',count:tk.length+' '+(tk.length===1?T.taskW:T.tasksW),
      cBg:tk.length?'var(--blue-100)':'var(--gray-100)',cFg:tk.length?'var(--blue-700)':'var(--gray-500)',open:()=>f&&app.go('detail',{selId:f.r.id})};});
    const tb=s.trendBy||'line'; const trData=app.trend(tb); if(!trData.length) trData.push(['—',0]); const trMax=Math.max(1,...trData.map(x=>x[1]));
    const trendRows=trData.map(([l,n],i)=>({label:l,n,pct:Math.round(n/trMax*100)+'%',bar:i===0?'var(--red-500)':'var(--blue-500)'}));
    const trendTabs=[['line',T.byLine],['product',T.byProduct]].map(([k,l])=>({label:l,bg:tb===k?'var(--navy-900)':'transparent',fg:tb===k?'#fff':'var(--navy-500)',pick:()=>app.setState({trendBy:k})}));
    const attention=[...active].sort((a,b)=>(b.mine-a.mine)||(s.reports.find(x=>x.id===b.id).sev-s.reports.find(x=>x.id===a.id).sev)).slice(0,3);

    
    const F=s.f||{date:'any',lines:[],products:[],sevs:[]}; const q=(s.q||'').trim().toLowerCase();
    const dayAgo=r=>daysAgo(r.createdAt);
    const pass=r=>(!q||[r.id,r.title,r.pname,r.lot,r.loc,r.ptype].join(' ').toLowerCase().includes(q))
      &&(F.date==='any'||(F.date==='today'?dayAgo(r)===0:dayAgo(r)<=7))
      &&(!F.lines.length||F.lines.includes(r.loc))&&(!F.products.length||F.products.includes(r.pname))&&(!F.sevs.length||F.sevs.includes(r.sev));
    const base=s.reports.filter(pass);
    const counts={all:base.length,open:base.filter(r=>r.status!=='closed').length,closed:base.filter(r=>r.status==='closed').length};
    const listItems=base.filter(r=>s.filter==='all'||(s.filter==='open'?r.status!=='closed':r.status==='closed')).map(r=>app.deco(r));
    const setF=p=>app.setState(st=>({f:{...(st.f||{date:'any',lines:[],products:[],sevs:[]}),...p}}));
    const tog=(arr,v)=>arr.includes(v)?arr.filter(x=>x!==v):[...arr,v];
    const fDates=['any','today','week'].map(k=>({label:T.dates[k],...pill(F.date===k),pick:()=>setF({date:k})}));
    const fLines=app.locs().map(l=>({label:l,...pill(F.lines.includes(l)),pick:()=>setF({lines:tog(F.lines,l)})}));
    const fProducts=[].concat(...Object.values(PNAMES)).map(p=>({label:p,...pill(F.products.includes(p)),pick:()=>setF({products:tog(F.products,p)})}));
    const fSevs=T.sev.map((l,i)=>({label:l,...pill(F.sevs.includes(i)),pick:()=>setF({sevs:tog(F.sevs,i)})}));
    const activeF=[].concat(F.date!=='any'?[{label:T.dates[F.date],remove:()=>setF({date:'any'})}]:[],
      F.lines.map(l=>({label:l,remove:()=>setF({lines:tog(F.lines,l)})})),F.products.map(p=>({label:p,remove:()=>setF({products:tog(F.products,p)})})),
      F.sevs.map(i=>({label:T.sev[i],remove:()=>setF({sevs:tog(F.sevs,i)})})));
    const nRes=listItems.length;
    const filters=[['all',T.all],['open',T.open],['closed',T.closedF]].map(([k,l])=>{const on=s.filter===k; return {label:l,n:counts[k],bg:on?'var(--navy-900)':'#fff',fg:on?'#fff':'var(--navy-900)',bd:on?'var(--navy-900)':'var(--blue-200)',onClick:()=>app.setState({filter:k})};});

    const taskItems=tasksOf(role).map(({r,k})=>({...app.deco(r),taskLabel:app.taskLabel(r,k,T),taskIcon:TICON[k]}));
    const dueChecks=s.reports.filter(r=>app.canCheck(r)).map(r=>({head:T.hcDueHead,sub:T.hcTypes[r.holdCheck.type]+' · '+r.pname+(r.lot?' · '+r.lot:'')+(r.qty?' · '+r.qty+' '+r.unit:''),open:()=>app.go('detail',{selId:r.id})}));
    const myId=app.myId();
    // alerts for my role or for me by name (not the comment alerts I sent myself)
    const myNotes=s.notes.filter(n=>(n.roles.includes(role)||(n.userIds||[]).includes(myId))&&!(n.by&&n.by===myId&&OWN_HIDDEN.includes(n.icon)));
    const unread=myNotes.filter(n=>!s.read[n.key]).length;
    const alertItems=myNotes.map((n,i)=>({text:n.text,t:timeLabel(n.t),icon:n.icon,icBg:TONE[n.tone][0],icFg:TONE[n.tone][1],unread:!s.read[n.key],bd:i?'var(--gray-100)':'transparent',bg:s.read[n.key]?'#fff':'var(--blue-50)',
      open:()=>{ app.markRead(n.key); if(n.id) app.go('detail',{selId:n.id}); }}));

    const chatUnread=app.chatUnread();
    const tabDef=[['home','house',T.home],['list','clipboard-list',T.reports],['chat','message-circle',T.chat.tab],['tasks','list-checks',T.tasks],['alerts','bell',T.alerts]];
    const tabs=tabDef.map(([k,ic,l])=>({key:k,icon:ic,label:l,fg:s.screen===k?'var(--blue-600)':'var(--navy-300)',go:()=>app.go(k),
      hasBadge:(k==='alerts'&&unread>0)||(k==='tasks'&&taskItems.length>0)||(k==='chat'&&chatUnread>0),badge:k==='alerts'?unread:k==='chat'?(chatUnread>99?'99+':chatUnread):taskItems.length}));

    // detail
    let sel={}, detailBar={show:false};
    const raw=s.reports.find(r=>r.id===s.selId);
    if(raw){ const d=app.deco(raw), si=ST[raw.status].i;
      const steps=T.st.map((l,i)=>({label:l,done:i<si||raw.status==='closed',dotBg:i<si||raw.status==='closed'?'var(--green-600)':i===si?'#fff':'#fff',dotBd:i<=si?(i<si||raw.status==='closed'?'var(--green-600)':'var(--blue-600)'):'var(--gray-200)',
        ring:i===si&&raw.status!=='closed'?'0 0 0 4px var(--blue-100)':'none',fg:i<=si?'var(--navy-900)':'var(--gray-500)',lineBg:i<=si?'var(--green-500)':'var(--gray-200)',lineOp:i===0?0:1}));
      const pti=PTYPES.indexOf(raw.ptype), sup=(raw.support||[]).map(x=>T.supports[SUPPORTS.indexOf(x)]).join(', '), ui=UNITS.indexOf(raw.unit);
      const rows=[[T.rowLoc,raw.loc],[T.rowType,pti>=0?T.ptypes[pti]:''],[T.rowName,raw.pname],[T.rowLot,raw.lot],[T.rowQty,raw.qty?raw.qty+' '+T.units[ui<0?0:ui]:''],[T.rowHold,raw.hold?T.yes:T.no],
        [T.troubleL,raw.desc],[T.rowDid,raw.action],[T.rowSug,raw.suggestion],[T.rowSup,sup]].concat(raw.voice?[[T.rowVoice,T.recorded]]:[]).concat([[T.reporter,raw.by+' · '+stampLabel(raw.signedAt||(raw.tl[0]&&raw.tl[0][2]))]]).map(([k,v],i)=>({k,v:v||T.missing,fg:v?'var(--navy-900)':'var(--gray-500)',bd:i?'var(--gray-100)':'transparent'}));
      const tl=raw.tl.map((e,i)=>({text:T.tl[e[0]]+(e[3]||''),who:e[1],t:stampLabel(e[2]),dot:e[0]==='alert'?'var(--red-500)':e[0]==='verified'||e[0]==='closedBy'||e[0]==='fixed'||e[0]==='approved'?'var(--green-600)':e[0]==='reopened'?'var(--amber-500)':'var(--blue-500)',lineOp:i===raw.tl.length-1?0:1}));
      sel={...d,steps,rows,tl,hasCapa:!!raw.capa,capa:raw.capa?{...raw.capa,avatar:AV[raw.capa.owner]}:{},hasHc:!!raw.holdCheck, hc:app.hcView(raw,T,me), needsDetails:!raw.desc&&raw.by===me.name&&raw.status!=='closed', urgent:!!raw.urgent, hold:!!raw.hold};
      const lvI=ORDER.indexOf(raw.level||'qa');
      sel.ladder=ORDER.map((k,i)=>({short:T.short[k],avatar:PEOPLE[k].avatar,arrow:i>0,bg:i===lvI&&raw.status!=='closed'?'var(--blue-50)':'#fff',bd:i===lvI&&raw.status!=='closed'?'var(--blue-600)':i<lvI?'var(--green-300)':'var(--gray-200)',
        fg:i<=lvI?'var(--navy-900)':'var(--gray-500)',op:i<=lvI?1:.4}));
      sel.discussion=buildDiscussion(app,T,raw.id);
      sel.levelNote=raw.status==='closed'?T.st[3]:T.nowWith+' '+PEOPLE[raw.level||'qa'].name;
      const act=app.canAct(raw), canE=app.canEsc(raw), nextL=ORDER[lvI+1];
      if(raw.status!=='closed'){
        const actions={fix:{icon:'hand',variant:'success',onClick:()=>app.update(raw.id,r=>({...r,status:'closed',tl:[...r.tl,['fixed',me.name,app.now()]]}))},
          approve:{icon:'stamp',variant:'success',onClick:()=>app.update(raw.id,r=>({...r,status:'closed',needsApproval:false,tl:[...r.tl,['approved',me.name,app.now()]]}))},
          assign:{icon:'user-plus',variant:'primary',onClick:()=>{app.setState({sheet:'assign',asg:{root:null,owner:null,due:0,text:''}});}},
          done:{icon:'circle-check',variant:'success',onClick:()=>app.update(raw.id,r=>({...r,status:'verify',tl:[...r.tl,['done',me.name,app.now()]]}))},
          verify:{icon:'shield-check',variant:'success',onClick:()=>app.setState({sheet:'verify'})}};
        const wait=raw.needsApproval?T.bar.waitApprove:raw.status==='action'?T.bar.waitAction+' · '+(raw.capa?raw.capa.owner:''):raw.status==='verify'?T.bar.waitVerify:T.nowWith+' '+T.short[raw.level||'qa']+' · '+PEOPLE[raw.level||'qa'].name;
        const escB={canEsc:canE,escLabel:canE?T.bar.escTo+' '+T.short[nextL]:'',escalate:()=>app.setState({sheet:'escalate',esc:{reason:null,note:''}})};
        const canC=app.canClose(raw);
        const closeB={canClose:canC,closeLabel:raw.sev===3?T.bar.closeCrit:T.bar.close,openClose:()=>app.setState({sheet:'close',closeNote:''})};
        detailBar= act ? {show:is.detail,canAct:true,waiting:false,label:T.bar[act],...actions[act],...escB,...closeB} : {show:is.detail,canAct:false,waiting:!canE&&!canC,label:wait,...escB,...closeB};
      }
    }

    // capture
    const c=s.cap;
    const pickCat=k=>()=>app.setState(st=>({cap:{...st.cap,cat:k,stage:flow==='B'&&k!=='custom'?'sev':st.cap.stage}}));
    const pickSev=i=>()=>app.setState(st=>({cap:{...st.cap,sev:i,stage:flow==='C'?st.cap.stage:'sign'}}));
    const cats=CATS.map(([k,ic],i)=>{const on=c.cat===k; return {label:T.cats[i],icon:ic,pick:pickCat(k),bg:on?'var(--blue-600)':'#fff',fg:on?'#fff':'var(--navy-900)',ic:on?'#fff':'var(--blue-600)',bd:on?'var(--blue-600)':'var(--blue-200)'};});
    const catsDark=CATS.map(([k,ic],i)=>{const on=c.cat===k; return {label:T.cats[i],icon:ic,pick:pickCat(k),bg:on?'#fff':'rgba(255,255,255,.12)',fg:on?'var(--navy-900)':'#fff'};});
    const sevs=T.sev.map((l,i)=>{const on=c.sev===i; return {label:l,pick:pickSev(i),bg:on?SEV[i].fg:SEV[i].bg,fg:on?'#fff':SEV[i].fg,bd:on?SEV[i].fg:'transparent'};});
    const sevsDark=T.sev.map((l,i)=>({label:l,pick:pickSev(i),bg:SEV[i].bg,fg:SEV[i].fg}));
    const sevCards=T.sev.map((l,i)=>({label:l,hint:T.sevHint[i],pick:pickSev(i),bar:SEV[i].bar,fg:SEV[i].fg}));
    const ci=CATS.findIndex(x=>x[0]===c.cat);
    const stepIdx=c.stage==='sev'?1:c.stage==='sign'?2:0;
    const capV={
      showCamera:c.stage==='camera',
      showOverlay:flow==='A'&&c.stage==='pick',
      showSteps:flow==='B'&&(c.stage==='pick'||c.stage==='sev'),
      showSheet:flow==='C'&&c.stage==='pick',
      showSign:flow!=='C'&&c.stage==='sign',
      subCat:c.stage==='pick', subSev:c.stage==='sev', stepTitle:c.stage==='sev'?T.step2:T.step1,
      bars:[0,1,2].map(i=>({bg:i<=stepIdx?'var(--blue-600)':'var(--blue-200)'})),
      sevOp:c.cat?1:.35, sevPe:c.cat?'auto':'none',
      catLabel:c.cat==='custom'?(c.customText||T.cats[8]):ci>=0?T.cats[ci]:'', sevLabel:c.sev!=null?T.sev[c.sev]:'', sevBg:c.sev!=null?SEV[c.sev].bg:'', sevFg:c.sev!=null?SEV[c.sev].fg:'', locLabel:app.locs()[0],
      critical:c.sev===3, isCustom:c.cat==='custom', customText:c.customText||'', customEmpty:!(c.customText||'').trim(),
      photoUrl:c.photoUrl||null, photoName:c.photoName||'IMG_0423.jpg',
      sendDisabled:!!s.busy||!(c.cat&&c.sev!=null&&s.signed&&(c.cat!=='custom'||(c.customText||'').trim()))
    };
    const shoot=()=>app.setState(st=>({cap:{...st.cap,photo:true,stage:'pick'}}));
    const onPhoto=(url,name)=>app.setState(st=>({cap:{...st.cap,photo:true,photoUrl:url,photoName:name||('IMG_'+String(st.nextId).padStart(4,'0')+'.jpg'),stage:'pick'}}));

    // details draft
    const dr=s.draft;
    const locs=app.locs().map(l=>{const on=dr.loc===l; return {label:l,pick:()=>app.setState(st=>({draft:{...st.draft,loc:l}})),bg:on?'var(--navy-900)':'#fff',fg:on?'#fff':'var(--navy-900)',bd:on?'var(--navy-900)':'var(--blue-200)'};});
    const setD=patch=>app.setState(st=>({draft:{...st.draft,...patch}}));
    const ptypes=PTYPES.map((p,i)=>({label:T.ptypes[i],...pill(dr.ptype===p),pick:()=>setD({ptype:p,pname:''})}));
    const pnames=(PNAMES[dr.ptype]||[]).concat(['__other']).map(n=>({label:n==='__other'?T.other:n,...pill(dr.pname===n),pick:()=>setD({pname:n})}));
    const units=UNITS.map((u,i)=>({label:T.units[i],...pill(dr.unit===u),pick:()=>setD({unit:u})}));
    const supports=SUPPORTS.map((x,i)=>{const on=(dr.support||[]).includes(x); return {label:T.supports[i],bg:on?'var(--blue-600)':'#fff',fg:on?'#fff':'var(--navy-900)',bd:on?'var(--blue-600)':'var(--blue-200)',
      pick:()=>setD({support:on?dr.support.filter(y=>y!==x):[...(dr.support||[]),x]})};});
    const tg=(on,tone)=>({bg:on?tone[0]:'#fff',bd:on?tone[1]:'var(--blue-200)',ic:on?tone[2]:'var(--navy-500)',track:on?tone[2]:'var(--gray-300)',knob:on?'21px':'3px'});
    const holdT={...tg(dr.hold,['var(--blue-50)','var(--navy-900)','var(--navy-900)']),toggle:()=>setD({hold:!dr.hold})};
    const urgentT={...tg(dr.urgent,['var(--red-100)','var(--red-500)','var(--red-700)']),toggle:()=>setD({urgent:!dr.urgent})};
    const hcTypes=HC_TYPES.map(k=>({label:T.hcTypes[k],...pill(dr.hcType===k),pick:()=>setD({hcType:k})}));
    const hcDaysL=HC_DAYS.map(d=>({label:d+' '+(d===1?T.day:T.days),...pill(dr.hcDays===d),pick:()=>setD({hcDays:d})}));
    const hcOwners=HC_OWNERS.map(o=>({label:o==='QC team'?T.qcTeam:o,...pill(dr.hcOwner===o),pick:()=>setD({hcOwner:o})}));
    const dc=s.dec||{}; const setDec=p=>app.setState(st=>({dec:{...st.dec,...p}}));
    const decTone={escalate:['arrow-up-right','var(--navy-900)','#fff'],keep:['clock','var(--blue-100)','var(--blue-700)'],lab:['flask-conical','var(--blue-100)','var(--blue-700)'],reject:['trash-2','var(--red-100)','var(--red-700)'],other:['pencil-line','var(--gray-100)','var(--gray-700)']};
    const decOpts=(role==='qa'?['keep','lab','reject','other','escalate']:['keep','lab','reject','other']).map(k=>{const on=dc.choice===k; return {label:T.dec[k][0],sub:T.dec[k][1],icon:decTone[k][0],icBg:decTone[k][1],icFg:decTone[k][2],
      bg:on?'var(--blue-50)':'#fff',bd:on?'var(--blue-600)':'var(--blue-200)',radio:on?'var(--blue-600)':'var(--gray-300)',dot:on?'var(--blue-600)':'transparent',pick:()=>setDec({choice:k})};});
    const decDays=HC_DAYS.map(d=>({label:d+' '+(d===1?T.day:T.days),...pill(dc.days===d),pick:()=>setDec({days:d})}));
    const decOwners=HC_OWNERS.map(o=>({label:o==='QC team'?T.qcTeam:o,...pill(dc.owner===o),pick:()=>setDec({owner:o})}));
    const selR=s.reports.find(x=>x.id===s.selId);
    const decSub=selR?(selR.pname||selR.title)+(selR.lot?' · '+selR.lot:'')+(selR.qty?' · '+selR.qty+' '+selR.unit:''):'';
    const confirmDecision=()=>{ const t=app.now(); const c=dc.choice;
      app.update(s.selId,x=>{ const hc=x.holdCheck;
        if(c==='keep') return {...x,hold:true,holdCheck:{...hc,status:'scheduled',days:dc.days,owner:dc.owner,dueAt:addDaysIso(dc.days),due:dueLabel(dc.days),note:''},tl:[...x.tl,['hcKeep',me.name,t],['hcSet',me.name,t]]};
        if(c==='lab') return {...x,hold:true,holdCheck:{...hc,type:'lab',status:'scheduled',days:dc.days,owner:dc.owner,dueAt:addDaysIso(dc.days),due:dueLabel(dc.days),note:''},tl:[...x.tl,['hcLab',me.name,t]]};
        if(c==='reject') return {...x,hold:false,holdCheck:{...hc,status:'failed'},tl:[...x.tl,['hcBad',me.name,t]]};
        if(c==='escalate') return {...x,level:'manager',holdCheck:{...hc,decider:'manager'},tl:[...x.tl,['esc',me.name,t,' Manager · hold decision']]};
        return {...x,holdCheck:{...hc,status:'decided',note:dc.text},tl:[...x.tl,['hcOther',me.name,t]]}; });
      app.setState({sheet:null}); if(c==='escalate') app.addNote({id:s.selId,icon:'gavel',tone:'red',text:'Hold decision escalated to you: '+decSub,roles:['manager']}); };
    const voice=s.recording?{bg:'var(--red-100)',bd:'var(--red-500)',btn:'var(--red-500)',icon:'square',fg:'var(--red-700)',label:T.recording,anim:'lrPulse 1s infinite'}
      : dr.voice?{bg:'var(--green-50)',bd:'var(--green-300)',btn:'var(--green-600)',icon:'play',fg:'var(--green-700)',label:T.recorded,anim:'none'}
      : {bg:'#fff',bd:'var(--blue-200)',btn:'var(--blue-600)',icon:'mic',fg:'var(--navy-900)',label:T.record,anim:'none'};

    // assign sheet
    const a=s.asg||{};
    const roots=T.roots.map((l,i)=>{const on=a.root===i; return {label:l,pick:()=>app.setState(st=>({asg:{...st.asg,root:i}})),bg:on?'var(--blue-600)':'#fff',fg:on?'#fff':'var(--navy-900)',bd:on?'var(--blue-600)':'var(--blue-200)'};});
    const owners=app.staffNames().map(n=>{const on=a.owner===n; return {name:n,avatar:AV[n],pick:()=>app.setState(st=>({asg:{...st.asg,owner:n}})),bg:on?'var(--blue-50)':'#fff',bd:on?'var(--blue-600)':'var(--blue-200)'};});
    const dues=T.dues.map((l,i)=>{const on=a.due===i; return {label:l,pick:()=>app.setState(st=>({asg:{...st.asg,due:i}})),bg:on?'var(--navy-900)':'#fff',fg:on?'#fff':'var(--navy-900)',bd:on?'var(--navy-900)':'var(--blue-200)'};});

    // Account sheet: your photo and name, sign out; managers get "Manage team".
    const myProfile=app.profile()||{};
    const myNameDraft=s.myName!=null?s.myName:(myProfile.name||'');
    const account={name:me.name,email:app.email(),avatar:me.avatar,roleLabel:T.roles[role],can:T.can[role],isManager:role==='manager',
      signOut:app.signOut,canLoadSample:role==='manager'&&!s.reports.length,loadSample:app.loadSample,busy:!!s.busy,
      onPhoto:e=>{const f=e.target.files&&e.target.files[0]; e.target.value=''; if(myProfile.id) app.changePhoto(myProfile.id,f);},
      nameDraft:myNameDraft,onName:e=>app.setState({myName:e.target.value}),nameDirty:s.myName!=null&&s.myName.trim()&&s.myName.trim()!==(myProfile.name||''),
      saveName:()=>{app.patchProfile(myProfile.id,{name:s.myName.trim()},T.people.saved); app.setState({myName:null});},
      manageTeam:()=>app.setState({sheet:null},()=>app.go('team'))};
    // Team screen (managers): everyone who can sign in.
    const roleChip={qc:['var(--blue-100)','var(--blue-700)'],qa:['var(--green-100)','var(--green-700)'],supervisor:['var(--amber-100)','var(--amber-700)'],manager:['var(--navy-900)','#fff']};
    const teamList=(s.profiles||[]).map(p=>({id:p.id,name:p.name||'—',email:p.email||'',avatar:app.avatarOf(p.name,p),isMe:p.id===me.id,active:p.active!==false,
      roleLabel:T.roles[p.role]||p.role,roleBg:(roleChip[p.role]||roleChip.qc)[0],roleFg:(roleChip[p.role]||roleChip.qc)[1],open:()=>app.openPerson(p.id),
      roles:ORDER.map(k=>({label:T.short[k],...pill(p.role===k),pick:()=>app.setRole(p.id,k)}))}));
    const teamHead={count:teamList.length+' '+T.people.count,add:app.openAddPerson};
    // Person sheet (manager edits one person)
    const pp=(s.profiles||[]).find(x=>x.id===s.personId);
    const person=pp?{id:pp.id,name:pp.name,email:pp.email,avatar:app.avatarOf(pp.name,pp),isMe:pp.id===me.id,active:pp.active!==false,
      nameDraft:s.personName!=null?s.personName:pp.name,onName:e=>app.setState({personName:e.target.value}),nameDirty:s.personName!=null&&s.personName.trim()&&s.personName.trim()!==pp.name,
      saveName:()=>{app.patchProfile(pp.id,{name:s.personName.trim()},T.people.saved); app.setState({personName:null});},
      onPhoto:e=>{const f=e.target.files&&e.target.files[0]; e.target.value=''; app.changePhoto(pp.id,f);},
      roles:ORDER.map(k=>({label:T.short[k],...pill(pp.role===k),pick:()=>app.setRole(pp.id,k)})),
      activeT:{bg:pp.active!==false?'var(--green-50)':'#fff',bd:pp.active!==false?'var(--green-300)':'var(--blue-200)',ic:pp.active!==false?'var(--green-700)':'var(--navy-500)',track:pp.active!==false?'var(--green-600)':'var(--gray-300)',knob:pp.active!==false?'21px':'3px',
        toggle:()=>app.patchProfile(pp.id,{active:pp.active===false},T.people.saved)},
      pw:s.personPw||'',onPw:e=>app.setState({personPw:e.target.value}),pwDisabled:!!s.busy||(s.personPw||'').length<6,setPw:()=>app.setPersonPassword(pp.id),
      confirm:!!s.personConfirm,askRemove:()=>app.setState({personConfirm:true}),cancelRemove:()=>app.setState({personConfirm:false}),remove:()=>app.removePerson(pp.id),busy:!!s.busy}:null;
    // Add person sheet
    const np=s.newPerson||{}; const setNP=p=>app.setState(st=>({newPerson:{...st.newPerson,...p}}));
    const addPerson={name:np.name||'',email:np.email||'',password:np.password||'',onName:e=>setNP({name:e.target.value}),onEmail:e=>setNP({email:e.target.value}),onPassword:e=>setNP({password:e.target.value}),
      generate:()=>setNP({password:WORDS_PW()}),roles:ORDER.map(k=>({label:T.short[k],...pill(np.role===k),pick:()=>setNP({role:k})})),
      disabled:!!s.busy||!(np.name||'').trim()||!/.+@.+\..+/.test(np.email||'')||(np.password||'').length<6,save:app.addPerson,busy:!!s.busy};

    // push notifications (this device)
    const ps=s.push, P=T.push, pOn=ps.on;
    const push={support:ps.support, on:pOn, busy:ps.busy,
      status:ps.support==='ios-install'?P.iosInstall:ps.permission==='denied'?P.blocked:pOn?P.onSub:P.offSub,
      toggle:{bg:pOn?'var(--green-50)':'#fff',bd:pOn?'var(--green-300)':'var(--blue-200)',ic:pOn?'var(--green-700)':'var(--navy-500)',track:pOn?'var(--green-600)':'var(--gray-300)',knob:pOn?'21px':'3px',
        toggle:()=>{ if(ps.busy) return; if(pOn) app.disablePush(); else app.enablePush(); }},
      test:()=>app.testPush(), enable:()=>app.enablePush(), later:()=>app.pushLater(),
      showCard:ps.support==='yes'&&ps.permission!=='denied'&&!pOn&&!ps.later};
    // "How to use" guide
    let tour=null;
    if(s.tour){ const steps=app.tourSteps(), i=s.tour.step, key=steps[i], G=T.guide;
      const txt=key==='tasks'?(G.tasks[role]||G.tasks.qc):G[key];
      const ICON={welcome:'hand',report:'camera',list:'clipboard-list',detail:'list-checks',tasks:'list-checks',chat:'message-circle',alerts:'bell',lines:'thermometer',me:'users',done:'circle-check'};
      tour={key, target:['welcome','detail','done'].includes(key)?null:key, icon:ICON[key]||'hand', title:txt[0].replace('{name}',me.name), body:txt[1],
        n:i+1, total:steps.length, first:i===0, last:i===steps.length-1, dots:steps.map((x,j)=>j===i),
        next:()=>app.tourGo(i+1), back:()=>app.tourGo(i-1), skip:()=>app.endTour(),
        labels:{skip:G.skip,next:i===steps.length-1?G.start:G.next,back:G.back,of:G.of}}; }
    const langs=[['en','EN'],['km','ខ្មែរ']].map(([k,l])=>{const on=app.lang()===k; return {label:l,bg:on?'var(--navy-900)':'transparent',fg:on?'#fff':'var(--navy-500)',pick:()=>app.setState({lang:k})};});

    return {
      t:T, me, is, nav, stats, attention, lines, linesHead, lineSheet, lineForm, home, kpis, homeSections, checklist, team, trendRows, trendTabs, filters, listItems, listEmpty:!listItems.length, taskItems, tasksEmpty:!taskItems.length, alertItems,
      tabsL:tabs.slice(0,2), tabsR:tabs.slice(2), showTabs:['home','list','tasks','alerts','team','chat'].includes(s.screen), chatHideTabs:is.chat&&!!s.chatRoom, chat:is.chat?buildChatView(app,T):null,
      sel, detailBar, back:()=>app.go(s.prev==='detail'||s.prev==='details'||s.prev==='done'||s.prev==='capture'?'list':s.prev),
      darkFrame:is.capture&&(c.stage==='camera'||(c.stage==='pick'&&flow!=='B')), font:app.lang()==='km'?"'Plus Jakarta Sans','Noto Sans Khmer',system-ui,sans-serif":"'Plus Jakarta Sans',system-ui,sans-serif",
      langs, push, tour, openGuide:()=>app.startTour(), openRoles:()=>app.setState({sheet:'roles',myName:null}), teamNav:role==='manager'?{label:T.people.title,on:s.screen==='team',go:()=>app.go('team')}:null, account, teamList, teamHead, person, addPerson, turnedOff:app.isTurnedOff(),
      cap:capV, cats, catsDark, sevs, sevsDark, sevCards, shoot, skipPhoto:()=>app.setState(st=>({cap:{...st.cap,photo:false,stage:'pick'}})),
      retake:()=>app.setState(st=>({cap:{...st.cap,stage:'camera'}})),
      stepBack:()=>{ app._sig=null; app.setState(st=>{const cp=st.cap; const stage=cp.stage==='sign'?(flow==='B'?'sev':'pick'):cp.stage==='sev'?'pick':'camera'; return {cap:{...cp,stage},signed:false};}); },
      sigRef:app.setupSig, clearSig:()=>{ if(app._sig){const x=app._sig.getContext('2d'); x.clearRect(0,0,app._sig.width,app._sig.height);} app.setState({signed:false}); },
      send:app.send, lastId:s.lastId, lastCritical:s.lastCritical,
      addDetailsNow:()=>{ const r=s.reports.find(x=>x.id===s.lastId); app.setState({selId:s.lastId}); app.go('details',{draft:draftOf(r),recording:false}); },
      draft:dr, locs, voice, q:s.q||'', hasQ:!!(s.q||''), onQ:e=>app.setState({q:e.target.value}), clearQ:()=>app.setState({q:''}),
      fDates, fLines, fProducts, fSevs, activeF, openFilters:()=>app.setState({sheet:'filters'}), resetF:()=>app.setState({f:{date:'any',lines:[],products:[],sevs:[]}}),
      fBtn:{has:activeF.length>0,n:activeF.length,bg:activeF.length?'var(--navy-900)':'#fff',bd:activeF.length?'var(--navy-900)':'var(--blue-200)',fg:activeF.length?'#fff':'var(--navy-900)'},
      resultText:nRes+' '+(nRes===1?T.resultW:T.resultsW), showResults:T.showN+' '+nRes+' '+(nRes===1?T.resultW:T.resultsW), decOpts, decDays, decOwners, decSub, confirmDecision,
      dec:{showSched:dc.choice==='keep'||dc.choice==='lab',showText:dc.choice==='other',text:dc.text||'',dueText:T.remindOn+' '+dueLabel(dc.days||3),disabled:dc.choice==='other'&&!(dc.text||'').trim()},
      onDecText:e=>setDec({text:e.target.value}), hcTypes, hcDaysL, hcOwners, hcDueText:T.remindOn+' '+dueLabel(dr.hcDays||3), dueChecks, ptypes, pnames, units, supports, holdT, urgentT, hasPtype:!!dr.ptype, pnameOther:dr.pname==='__other',
      onPnameText:e=>setD({pnameText:e.target.value}), onLot:e=>setD({lot:e.target.value}), onQty:e=>setD({qty:e.target.value.replace(/[^0-9.]/g,'')}), onSuggestion:e=>setD({suggestion:e.target.value}),
      onCustom:e=>{const v=e.target.value; app.setState(st=>({cap:{...st.cap,customText:v}}));}, customNext:()=>app.setState(st=>({cap:{...st.cap,stage:'sev'}})),
      nowLabel:'Today '+stampLabel(app.now()),
      onBatch:e=>{const v=e.target.value; app.setState(st=>({draft:{...st.draft,batch:v}}));},
      onDesc:e=>{const v=e.target.value; app.setState(st=>({draft:{...st.draft,desc:v}}));},
      onAction:e=>{const v=e.target.value; app.setState(st=>({draft:{...st.draft,action:v}}));},
      toggleVoice:()=>app.setState(st=>st.recording?{recording:false,draft:{...st.draft,voice:true}}:{recording:true}),
      saveDetails:()=>{ const d=s.draft; app.update(s.selId,r=>({...r,loc:d.loc,ptype:d.ptype,pname:d.pname==='__other'?d.pnameText:d.pname,lot:d.lot,qty:d.qty,unit:d.unit,hold:d.hold,desc:d.desc,action:d.action,suggestion:d.suggestion,urgent:d.urgent,support:d.support,voice:!!d.voice,
        holdCheck:d.hold?(r.holdCheck&&r.holdCheck.status!=='scheduled'&&r.holdCheck.type===d.hcType?r.holdCheck:{type:d.hcType,days:d.hcDays,owner:d.hcOwner,status:'scheduled',dueAt:addDaysIso(d.hcDays),due:dueLabel(d.hcDays)}):null,
        tl:[...r.tl,['details',me.name,app.now()]].concat(d.hold&&!(r.holdCheck)?[['hcSet',me.name,app.now()]]:[])})); app.setState({prev:'list',screen:'detail'}); },
      sheet:{show:!!s.sheet,person:s.sheet==='person'&&!!pp,addPerson:s.sheet==='addPerson',line:s.sheet==='line'&&!!selLine,lineForm:s.sheet==='lineForm',escalate:s.sheet==='escalate',close:s.sheet==='close',filters:s.sheet==='filters',decide:s.sheet==='decide',roles:s.sheet==='roles',assign:s.sheet==='assign',verify:s.sheet==='verify'}, closeSheet:()=>app.setState({sheet:null}),
      asg:a, roots, owners, dues, asgDisabled:!(a.root!=null&&a.owner&&(a.text||'').trim()),
      onAsgText:e=>{const v=e.target.value; app.setState(st=>({asg:{...st.asg,text:v}}));},
      doAssign:()=>{ const due=T.dues[a.due]; app.update(s.selId,r=>({...r,status:'action',capa:{root:T.roots[a.root],text:a.text,owner:a.owner,due},tl:[...r.tl,['assigned',me.name,app.now(),' '+a.owner]]})); app.setState({sheet:null}); },
      verifyYes:()=>{ const rr=s.reports.find(x=>x.id===s.selId); const needA=rr&&rr.sev===3&&role!=='manager';
        app.update(s.selId,r=>needA?({...r,needsApproval:true,level:'manager',tl:[...r.tl,['sentApproval',me.name,app.now()]]}):({...r,status:'closed',tl:[...r.tl,['verified',me.name,app.now()]]}));
        app.setState({sheet:null}); if(needA) app.addNote({id:s.selId,icon:'stamp',tone:'blue',text:'Approval needed to close '+s.selId+': '+rr.title,roles:['manager']}); },
      esc:(()=>{const rr=s.reports.find(x=>x.id===s.selId); const nx=rr?ORDER[ORDER.indexOf(rr.level||'qa')+1]:null; const e=s.esc||{};
        return {toLabel:nx?T.short[nx]:'',toName:nx?PEOPLE[nx].name:'',avatar:nx?PEOPLE[nx].avatar:'',note:e.note||'',disabled:e.reason==null};})(),
      escReasons:T.reasons.map((l,i)=>{const on=(s.esc||{}).reason===i; return {label:l,bg:on?'var(--navy-900)':'#fff',fg:on?'#fff':'var(--navy-900)',bd:on?'var(--navy-900)':'var(--blue-200)',pick:()=>app.setState(st=>({esc:{...st.esc,reason:i}}))};}),
      onEscNote:e=>{const v=e.target.value; app.setState(st=>({esc:{...st.esc,note:v}}));},
      doEscalate:()=>{ const rr=s.reports.find(x=>x.id===s.selId); const nx=ORDER[ORDER.indexOf(rr.level||'qa')+1]; const e=s.esc||{}; const t=app.now();
        const why=T.reasons[e.reason]+(e.note?' · '+e.note:'');
        app.update(s.selId,r=>({...r,level:nx,tl:[...r.tl,['esc',me.name,t,' '+T.short[nx]+' · '+why]]}));
        app.setState({sheet:null}); app.addNote({id:s.selId,icon:'arrow-up-right',tone:'blue',text:me.name+' escalated '+s.selId+' to you: '+rr.title,roles:[nx]}); },
      closeForm:(()=>{const rr=s.reports.find(x=>x.id===s.selId)||{}; const note=s.closeNote||''; return {crit:rr.sev===3,note,disabled:!note.trim()};})(),
      onCloseNote:e=>{const v=e.target.value; app.setState({closeNote:v});},
      doClose:()=>{ const rr=s.reports.find(x=>x.id===s.selId); const note=(s.closeNote||'').trim(); if(!rr||!note) return; const needA=rr.sev===3;
        app.update(s.selId,r=>needA?({...r,status:'verify',needsApproval:true,level:'manager',tl:[...r.tl,['closeAsk',me.name,app.now(),' · '+note]]}):({...r,status:'closed',needsApproval:false,tl:[...r.tl,['closedBy',me.name,app.now(),' · '+note]]}));
        app.setState({sheet:null,closeNote:''});
        app.addNote(needA?{id:s.selId,icon:'stamp',tone:'blue',text:me.name+' asks to close '+s.selId+': '+rr.title,roles:['manager']}:{id:s.selId,icon:'circle-check',tone:'green',text:me.name+' closed '+s.selId+': '+rr.title,roles:['qc','qa','supervisor','manager'].filter(x=>x!==role)}); },
      verifyNo:()=>{ app.update(s.selId,r=>({...r,status:'action',tl:[...r.tl,['reopened',me.name,app.now()]]})); app.setState({sheet:null}); },
      toast:app.toastView(), onPhoto, role, flow, lang:app.lang(), screen:s.screen, scrollRef:app.scrollRef
    };
}
