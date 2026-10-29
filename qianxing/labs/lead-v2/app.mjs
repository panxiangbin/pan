"use strict";
import {VERSION,HORIZON,TIMES,CASES,PHASES,tasksFor,workersFor,emptyPlan,isScheduled,fmtTime} from "./cases.mjs";
import {checkSchedule,comparePlans,initSession,safeSession} from "./schedule-core.mjs";
const app=document.getElementById("app"),STORE="qianxing-lead-v2-progress";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=x=>JSON.parse(JSON.stringify(x));
const btn=(label,action,kind="",extra="")=>'<button type="button" class="btn '+kind+'" data-action="'+action+'" '+extra+'>'+esc(label)+'</button>';
const fresh=()=>({version:VERSION,screen:"intro",idx:0,hints:0,started:new Date().toISOString(),rounds:[],current:null});
let s=fresh(),hasSaved=false;
try{const raw=localStorage.getItem(STORE);if(raw){const data=JSON.parse(raw);if(safeSession(data,CASES,VERSION)){s=data;hasSaved=true;}}}
catch(e){console.warn("无法读取本机保存的排程",String(e))}
const c=()=>CASES[s.idx],session=()=>s.current,post=()=>s.screen==="replan";
const active=()=>post()?session().post.plan:session().pre.plan;
function persist(){
 try{localStorage.setItem(STORE,JSON.stringify(s));hasSaved=true;return true;}
 catch(e){console.warn("当前浏览器不能保存数据，请主动导出",String(e));return false;}
}
function nextScreen(screen,scroll=true){
 s.screen=screen;persist();render();if(scroll)window.scrollTo({top:0,behavior:"instant"});
}
function start(){
 s=fresh();s.current=initSession(c());try{localStorage.setItem("qianxing-last-id","52");}catch(e){}
 nextScreen("plan");
}
function nextRound(){
 if(s.idx===2){nextScreen("learn");return;}
 if(s.idx===6){nextScreen("report");return;}
 s.idx++;s.current=initSession(c());nextScreen("plan");
}
function hero(){
 const rows=[
 ["g","","g","g","g","","b","b","","o","o",""],
 ["","b","b","","g","g","g","","o","o","",""],
 ["g","g","","b","b","","g","g","","","o",""]
 ];
 app.innerHTML='<section class="hero"><span class="eyebrow">潜星计划 · 第52项《组织领导》 · 深度探索V2</span>'+
 '<h1>当人手、设备与时间<br>不能同时满足，怎么办？</h1>'+
 '<p>亲自为团队分配任务、人员和开始时间。提交初版计划后，会出现请假、设备停机或紧急插单。你需要重新协调，并决定怎样向团队说明。</p>'+
 '<div class="hero-timeline" aria-hidden="true"><b>模拟工作日 · 人员与设备的时间线</b><div class="tracks">'+
 rows.map(row=>'<div class="track">'+row.map(x=>'<i class="'+x+'"></i>').join("")+'</div>').join("")+'</div></div>'+
 '<div class="actions">'+btn("开始第一轮调度 →","start","primary large")+
 (hasSaved?btn("继续本机的上次调度","resume"):"")+
 '<span class="small">1轮练习 + 6个专业情境；每轮都有计划、突发变化和二次调整</span></div>'+
 '<p class="small" style="margin-top:20px">全部为虚构工作场景，没有真实派工或对外消息。只记录可观察的排程行为，不判定天赋、人格或领导能力等级。</p></section>'+
 '<div class="intro-notes"><div><b>制定初版计划</b>分配任务、时段、人员和设备</div>'+
 '<div><b>遇到变化再排程</b>允许如实报告无法按时完成</div>'+
 '<div><b>反思如何协作</b>考虑资格、休息、真实交付和透明沟通</div></div>';
}
function heading(name,desc){
 return '<div class="topline"><span class="eyebrow">'+PHASES[c().phase]+' · '+(s.idx?"第 "+s.idx+" / 6 个正式情境":"不计分练习")+'</span>'+
 '<span class="small">52 / 108 · 08:00—14:00</span></div>'+
 '<div class="progress" aria-hidden="true"><span style="width:'+Math.round(s.idx/6*100)+'%"></span></div>'+
 '<h1 class="step-title">'+name+'</h1><p class="step-lead">'+desc+'</p>';
}
function staff(cas,disrupted=false){
 const all=workersFor(cas,disrupted);
 return '<div class="staff">'+all.map(w=>{
  const absent=disrupted&&cas.event.blockWorkers?.[w.id],support=w.standby;
  return '<span class="staff-pill '+(absent?"absent":"")+' '+(support?"support":"")+
  '"><b>'+esc(w.name)+(absent?" · 请假":support?" · 支援":"")+'</b>'+
  '<small>岗位：'+esc(w.skills.join("/"))+' · 上限'+(w.maxSlots/2)+'小时</small></span>';
 }).join("")+'</div>';
}
function timeOptions(task,a){
 return '<option value="-1" '+(a.start===-1?"selected":"")+'>待安排时间</option>'+
 Array.from({length:HORIZON-task.duration+1},(_,i)=>'<option value="'+i+'" '+(a.start===i?"selected":"")+'>'+
  fmtTime(i)+"—"+fmtTime(i+task.duration)+'</option>').join("");
}
function jobForms(cas,plan,disrupted){
 const jobs=tasksFor(cas,disrupted),workers=workersFor(cas,disrupted);
 return '<div class="job-list">'+jobs.map(t=>{
  const a=plan[t.id]||{worker:"",start:-1};
  const machine=t.machine?cas.machines.find(m=>m.id===t.machine)?.name:"无需专属设备";
  return '<div class="job-row" data-job="'+t.id+'"><div class="job-name"><b>'+esc(t.name)+'</b>'+
   '<small>耗时'+(t.duration/2)+'小时 · 希望'+fmtTime(t.due)+'前完成 · '+esc(machine)+'</small>'+
   '<small>'+(t.after.length?'需在「'+esc(t.after.map(id=>jobs.find(x=>x.id===id)?.name||id).join("、"))+'」之后':'可直接开始')+
   (t.weight===3?' · <strong>优先核对</strong>':'')+'</small></div>'+
   '<label for="worker-'+t.id+'">负责人<select id="worker-'+t.id+'" data-task="'+t.id+'" data-field="worker">'+
    '<option value="">未分配 / 待协调</option>'+
    workers.map(w=>'<option value="'+w.id+'" '+(a.worker===w.id?"selected":"")+'>'+
       esc(w.name)+(disrupted&&cas.event.blockWorkers?.[w.id]?"（请假）":w.standby?"（支援）":"")+'</option>').join("")+
   '</select></label>'+
   '<label for="start-'+t.id+'">开始时间<select id="start-'+t.id+'" data-task="'+t.id+'" data-field="start">'+
    timeOptions(t,a)+'</select></label></div>';
 }).join("")+'</div>';
}
function timeline(cas,plan,disrupted,metrics){
 const jobs=tasksFor(cas,disrupted),byId=new Set(metrics.problems.flatMap(p=>p.ids));
 const times='<div class="times"><b>任务时段</b>'+[0,2,4,6,8,10].map(i=>'<b>'+fmtTime(i)+'</b>').join("")+'</div>';
 return '<div class="chart-scroll"><div class="timeline">'+times+
 jobs.map(t=>{
  const a=plan[t.id]||{worker:"",start:-1};
  const worker=workersFor(cas,disrupted).find(w=>w.id===a.worker);
  let cell="";
  if(isScheduled(a)&&a.start+t.duration<=HORIZON){
   const late=a.start+t.duration>t.due;
   const invalid=byId.has(t.id);
   const cls=invalid?"invalid":late?"late":worker?.standby?"support":"";
   cell='<span title="'+esc(t.name)+"："+fmtTime(a.start)+"—"+fmtTime(a.start+t.duration)+'，'+esc(worker?.name||"未指定")+
       '" class="slot '+cls+'" style="grid-column:'+(a.start+1)+' / span '+t.duration+'"></span>';
  }
  return '<div class="timeline-row"><span class="title">'+esc(t.name)+'</span>'+
   '<div class="timeline-slots">'+cell+'</div></div>';
 }).join("")+
 '<div class="timeline-legend"><span>正常时段</span><span>可能延期</span><span>资源冲突或缺失</span></div>'+
 '</div></div>';
}
function metricsHTML(m){
 const vals=[["任务有安排",m.assigned+" / "+m.total],["硬约束问题",m.hardConflicts],["未分配",m.unscheduled],["超过目标的半小时格",m.lateSlots]];
 return '<div class="metric-grid">'+vals.map(([t,v])=>'<div class="metric"><b>'+v+'</b><span>'+t+'</span></div>').join("")+'</div>';
}
function problemList(m){
 const p=m.problems.slice(0,10);
 return '<ul class="warning-list" aria-live="polite">'+(p.length?p.map(x=>'<li>'+esc(x.message)+'</li>').join(""):'<li class="none">当前没有人员、设备或先后顺序的硬约束冲突。请继续留意交付时限。</li>')+
 (m.problems.length>10?'<li>还有'+(m.problems.length-10)+'项问题，请继续调整。</li>':"")+'</ul>';
}
function planPage(){
 const cas=c(),disrupted=post(),plan=active(),m=checkSchedule(cas,plan,disrupted),sess=session();
 const v=disrupted?sess.postVerified:sess.preVerified,checkCount=disrupted?sess.postChecks:sess.preChecks;
 const verified=v===JSON.stringify(plan),assigned=m.assigned>=2;
 app.innerHTML=heading(disrupted?"第二次：根据突发情况重新协调":"第一次：先制定工作安排。",
 disrupted?"你已收到新的限制。可以调整刚才的任务，也可以将无法完成的任务明确标记为待协调。请勿假设请假员工或停机设备可以继续使用。":"选择每一项工作的负责人和开始时间。试着解决设备占用、任务先后和人员资格，再提交你的初始安排。")+
 '<div class="story"><b>'+esc(cas.title)+'</b> · '+esc(cas.story)+'</div>'+
 (disrupted?'<div class="alert-brief"><b>最新事件：'+esc(cas.event.title)+'</b><div>'+esc(cas.event.message)+'</div></div>':"")+
 '<div class="grid-layout"><section class="panel"><div class="panel-title"><b>实际资源与排程</b><span>半小时一格 · 所有人工作时长设上限</span></div>'+
 '<div class="panel-body">'+staff(cas,disrupted)+
 '<p class="machine-line"><b>共享设备：</b>'+esc(cas.machines.map(m=>m.name).join(" / "))+'</p>'+
 jobForms(cas,plan,disrupted)+
 '<div class="panel-title" style="padding-left:0"><b>时间线预览</b><span>拖动不必要，直接修改上方时间和人员</span></div>'+
 timeline(cas,plan,disrupted,m)+'</div></section>'+
 '<aside class="panel sidebar"><h2>排程风险检查</h2>'+
 '<p>系统根据你实际分配的工作判断是否冲突。时间与截止期是模拟条件，不能代替真实管理决策。</p>'+
 metricsHTML(m)+
 '<div class="side-actions">'+btn("检查当前排程","check","")+
 (disrupted?btn("从初版重新协调","restore","quiet"):"")+'</div>'+
 '<p class="subnote">'+(verified?"已核对当前版本，共检查"+checkCount+"次。":"请修改后再点一次“检查当前排程”。")+'</p>'+
 problemList(m)+
 (disrupted?'<section class="comms"><h3>面对变化，你会如何向团队说明？</h3>'+
 cas.communications.map(([id,txt])=>'<button data-action="comm" data-id="'+id+
 '" type="button" class="option '+(sess.choice===id?"selected":"")+'">'+(sess.choice===id?"✓ ":"")+esc(txt)+'</button>').join("")+
 '<label for="reason" class="small" style="display:block;margin-top:14px">补充你的协调说明（可选）</label>'+
 '<textarea id="reason" maxlength="1500" placeholder="哪些安排已经确认？还需要谁复核？">'+esc(sess.reason||"")+'</textarea></section>':
 '<div class="alert-brief"><b>提示：</b>初始计划提交后，会公布实际发生的变化。提交前至少安排两项任务并检查一次。</div>')+
 '<div class="side-actions">'+(disrupted?btn("发送更新后的模拟排程 →","submit-post","primary large",
  verified&&assigned&&!!sess.choice?"":"disabled"):btn("提交初始排程，接收新情况 →","submit-pre","primary large",
  verified&&assigned?"":"disabled"))+'</div>'+
 '<p class="small">这里不会给任何真实员工发送消息，选择只记录在本地。</p></aside></div>';
}
function eventPage(){
 const cas=c(),old=checkSchedule(cas,session().pre.plan,false);
 const impact=checkSchedule(cas,session().pre.plan,true);
 app.innerHTML=heading("突发变化：计划必须重新协调。","这条通知发生在工作开始之前。已有计划并没有实际执行，你可以重新调整全部时段、责任人和资源。")+
 '<section class="center"><div class="big-event"><span class="eyebrow">新的团队通知</span><b>'+esc(cas.event.title)+'</b><p>'+esc(cas.event.message)+'</p></div>'+
 '<div class="two-cols"><div class="mini"><span>你原本提交的版本</span><strong>'+old.hardConflicts+'个硬约束问题</strong><span>未安排 '+old.unscheduled+' 项工作</span></div>'+
 '<div class="mini"><span>如果不改变计划，在新限制下</span><strong>'+impact.hardConflicts+'个硬约束问题</strong><span>另外有 '+impact.unscheduled+' 项任务未安排</span></div></div>'+
 '<p>这些数字只是当前安排与预设约束的比对。设备暂停、资格和班次上限不能通过强迫员工加班来解决；如果无法按时交付，应如实沟通。</p>'+
 '<div class="actions">'+btn("进入重新排程与沟通 →","start-replan","primary large")+'</div></section>';
}
function saveRecord(){
 const cas=c(),sess=session(),before=checkSchedule(cas,sess.pre.plan,false),
 ignored=checkSchedule(cas,sess.pre.plan,true),after=checkSchedule(cas,sess.post.plan,true);
 return {id:cas.id,phase:cas.phase,title:cas.title,beforePlan:clone(sess.pre.plan),afterPlan:clone(sess.post.plan),
 before:{hardConflicts:before.hardConflicts,unscheduled:before.unscheduled,lateSlots:before.lateSlots},
 ignoredEvent:{hardConflicts:ignored.hardConflicts,unscheduled:ignored.unscheduled,lateSlots:ignored.lateSlots},
 after:{hardConflicts:after.hardConflicts,unscheduled:after.unscheduled,lateSlots:after.lateSlots,
  onTime:after.onTime,total:after.total,weightedLate:after.weightedLate,
  issues:clone(after.problems),load:clone(after.loads)},
 changed:comparePlans(sess.pre.plan,sess.post.plan),
 communication:sess.choice,reason:sess.reason||"",
 preChecks:sess.preChecks,postChecks:sess.postChecks,
 editsPre:sess.editsPre,editsPost:sess.editsPost,openedAt:sess.openedAt,finishedAt:new Date().toISOString()};
}
function feedbackPage(){
 const r=s.rounds[s.rounds.length-1],cas=c();
 const response=cas.communications.find(x=>x[0]===r.communication);
 const description=response?.[2]==="clarify"?
 "你选择了披露已知风险与下一步核对安排。这是一项可观察的沟通决策，但不能说明你在真实团队里必然有相同表现。":
 response?.[2]==="pressure"?"这项模拟沟通要求违反了资格、请假或安全边界。实际管理应尊重劳动保护与授权资格。":
 "这个选择没有充分披露真实风险。现实中需要补充不确定性、负责人与交付确认。";
 const m=r.after;
 app.innerHTML=heading("本轮结束：发生变化以后，你如何调整？","以下只描述你刚才在模拟页面里实际做过的分工、风险检查和沟通选择。")+
 '<section class="center"><div class="summary-grid">'+
 [["原计划受新事件影响",r.ignoredEvent.hardConflicts+"项","新限制下原有资源冲突"],
  ["调整后硬约束问题",m.hardConflicts+"项","包含资质、缺岗、设备、依赖、超工时"],
  ["仍未安排",m.unscheduled+"项","可明确提出延后和外部协调"],
  ["实际调整的任务",r.changed+"项","与原计划比对"]].map(x=>'<div><strong>'+x[1]+'</strong><span>'+x[0]+'</span><span class="small" style="display:block">'+x[2]+'</span></div>').join("")+'</div>'+
 '<div class="big-event"><b>本轮沟通选择</b><p>'+esc(response?.[1]||"未作选择")+'</p><p>'+description+'</p></div>'+
 '<p>本版分离“硬约束是否满足”和“交付是否延期”：你安排的任务中，希望期限以后的工作时长合计为'+(m.lateSlots*.5)+'小时。若资源不足，明确延期通常比编造已完成记录更可靠。</p>'+
 (m.issues.length?'<details><summary>查看仍未解决的问题（'+m.issues.length+'）</summary><ul>'+m.issues.map(x=>'<li>'+esc(x.message)+'</li>').join("")+'</ul></details>':
 '<p>本次调整没有未安排或硬资源冲突，但仍不能保证现实任务完成，还需现场执行与复核。</p>')+
 '<div class="actions">'+btn(s.idx===2?"进入可选学习 →":s.idx===6?"查看完整探索报告 →":"进入新的调度情境 →","next","primary large")+
 btn("下载当前探索记录","json","quiet")+'</div></section>';
}
function learningPage(){
 const tips=[
 "先区分不可违反的约束：资质、设备停机、员工缺勤、已确认的前置步骤和合理工作时长。",
 "把时序和资源当作不同问题：两项任务同时开始可能争抢同一人员或设备，先确认真正的关键路径和可以并行的步骤。",
 "新事件发生后，应说明已知事实、无法保证的部分、可采取的替代方案和谁来复核，不要求他人隐瞒记录或无条件加班。"
 ];
 app.innerHTML='<section class="center"><span class="eyebrow">两段首次排程已完成 · 可选方法学习</span>'+
 '<h1>领导协作不仅是把空格排满。</h1>'+
 '<p>真实工作中，团队的资格、休息、资源与承诺都有限。你可以查看三条新的规划方法，再到软件、实验室和跨行业情境里试试。</p>'+
 '<div class="learning-card"><h2>约束—优先级—协商</h2>'+
 (s.hints?'<ol>'+tips.slice(0,s.hints).map(x=>'<li>'+x+'</li>').join("")+'</ol>':'<p>目前尚未展开提示，是否学习由你决定。</p>')+
 (s.hints<3?'<div class="actions">'+btn("查看第 "+(s.hints+1)+" 条方法","hint")+'</div>':"")+
 '</div><div class="actions">'+btn("进入新情境挑战 →","continue","primary large")+
 btn("下载当前记录","json")+'</div></section>';
}
function reportPage(){
 const official=s.rounds.filter(x=>x.phase!=="practice");
 const old=official.reduce((n,x)=>n+x.ignoredEvent.hardConflicts,0);
 const after=official.reduce((n,x)=>n+x.after.hardConflicts,0);
 const unassigned=official.reduce((n,x)=>n+x.after.unscheduled,0);
 const honest=official.filter(x=>x.communication==="transparent").length;
 const revisions=official.reduce((n,x)=>n+x.changed,0);
 const table=official.map(r=>'<tr><td>'+esc(r.title)+'</td><td>'+r.ignoredEvent.hardConflicts+
 '</td><td>'+r.after.hardConflicts+'</td><td>'+r.after.unscheduled+'</td><td>'+r.changed+'</td>'+
 '<td>'+esc(CASES.find(c=>c.id===r.id)?.communications.find(x=>x[0]===r.communication)?.[1]||"")+'</td></tr>').join("");
 app.innerHTML='<section class="report"><span class="eyebrow">第52项 · 组织领导与动态调度 · 本次记录</span>'+
 '<h1>面对变化，你做出了怎样的协调？</h1>'+
 '<p class="lead">七轮模拟任务已结束（含一轮练习）。这里只显示对人员、时间和设备的实际分配与调整，不输出单一“领导天赋分数”。</p>'+
 '<div class="summary-grid">'+[
 ["原计划受事件影响的冲突",old+"项"],["改排后剩余硬约束",after+"项"],["更新后未分配任务",unassigned+"项"],["选择透明沟通",honest+" / 6"]].map(x=>'<div><strong>'+x[1]+'</strong><span>'+x[0]+'</span></div>').join("")+'</div>'+
 '<h2>本次能观察到什么</h2><p>你实际更改过'+revisions+'项任务安排（含新插入任务），并作出多次资源与沟通选择。硬约束风险属于模拟规则的核验，不代表真实管理能力、道德或人格。</p>'+
 '<h2>本次不能判断什么</h2><p>当前没有经过标准化信效度、工作模拟效标验证、真人研究或不同题本难度等价性检验。个人经历、电脑操作习惯、任务规则、阅读条件都能影响表现。</p>'+
 '<p>如果某个情境在资源变更后无法全部准时完成，风险披露、尊重资格和有效升级协调同样重要。不能把强迫加班或伪造完成记录视为更高能力。</p>'+
 '<details><summary>展开全部六个情境的过程与沟通记录</summary><div class="table-scroll"><table><thead><tr><th>场景</th><th>未改排风险</th><th>改排后冲突</th><th>未分配</th><th>更改任务</th><th>模拟沟通</th></tr></thead><tbody>'+
 table+'</tbody></table></div></details>'+
 '<div class="actions">'+btn("下载完整模拟记录（JSON）","json","primary large")+
 btn("重新体验","restart")+'<a href="../../explore/" class="btn quiet">返回108项</a></div>'+
 '<p class="small" style="margin-top:20px">所有记录仅保存在当前浏览器；只有点击下载才形成个人文件，不会向真实团队发出任何指令。</p></section>';
}
function render(){
 if(s.screen==="intro")return hero();
 if(s.screen==="plan"||s.screen==="replan")return planPage();
 if(s.screen==="event")return eventPage();
 if(s.screen==="feedback")return feedbackPage();
 if(s.screen==="learn")return learningPage();
 if(s.screen==="report")return reportPage();
}
function exportJSON(){
 const payload={project:"潜星计划",module:52,version:VERSION,startedAt:s.started,
 exportedAt:new Date().toISOString(),notDiagnosis:true,study:"虚构资源约束和组织领导情境；未经信效度验证",
 hintsViewed:s.hints,rounds:clone(s.rounds),current:clone(s.current),
 note:"半小时单位，硬资质/休息/依赖/人员和设备冲突与交付软期限分别判断"};
 const file=new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(file),link=document.createElement("a");
 link.href=url;link.download="潜星计划_第52项_组织领导调度V2_完整记录.json";
 document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function prepareEvent(){
 const q=session(),p=clone(q.pre.plan);
 for(const t of c().event.newTasks)p[t.id]={worker:"",start:-1};
 q.post={plan:p};q.postChecks=0;q.postVerified=null;
 nextScreen("event");
}
function startReplan(){nextScreen("replan");}
function commitRound(){
 const r=saveRecord();s.rounds.push(r);session().finishedAt=r.finishedAt;
 nextScreen("feedback");
}
app.addEventListener("change",e=>{
 const field=e.target.closest("[data-task][data-field]");
 if(!field||!["plan","replan"].includes(s.screen))return;
 const id=field.dataset.task,k=field.dataset.field,plan=active();
 if(!plan[id])return;
 plan[id][k]=k==="start"?Number(field.value):field.value;
 if(post()){session().postVerified=null;session().editsPost++;}
 else{session().preVerified=null;session().editsPre++;}
 const y=window.scrollY,focusId=field.id;persist();render();
 const next=document.getElementById(focusId);next?.focus({preventScroll:true});
 window.scrollTo(0,y);
});
app.addEventListener("input",e=>{
 if(e.target.id==="reason"&&s.screen==="replan"){
  session().reason=e.target.value.slice(0,1500);persist();
 }
});
app.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b||b.disabled||!app.contains(b))return;
 const a=b.dataset.action;
 if(a==="start"||a==="restart"){
  if(hasSaved&&s.screen!=="intro"&&!confirm("重新开始会替换当前浏览器内的模拟记录，建议先下载JSON。继续吗？"))return;
  start();return;
 }
 if(a==="resume"){if(!hasSaved)return;render();return;}
 if(a==="json"){exportJSON();return;}
 if(a==="check"&&["plan","replan"].includes(s.screen)){
  if(post()){session().postChecks++;session().postVerified=JSON.stringify(active());}
  else{session().preChecks++;session().preVerified=JSON.stringify(active());}
  persist();const y=window.scrollY;render();window.scrollTo(0,y);return;
 }
 if(a==="restore"&&s.screen==="replan"){
  if(!confirm("要将本轮调整恢复为事件发生前的初版排程吗？新增工作仍将保持未分配。"))return;
  const p=clone(session().pre.plan);for(const t of c().event.newTasks)p[t.id]={worker:"",start:-1};
  session().post.plan=p;session().postVerified=null;session().editsPost++;persist();render();return;
 }
 if(a==="submit-pre"&&s.screen==="plan"){
  const p=active(),checked=session().preVerified===JSON.stringify(p),m=checkSchedule(c(),p);
  if(!checked||m.assigned<2)return;
  prepareEvent();return;
 }
 if(a==="start-replan"&&s.screen==="event"){startReplan();return;}
 if(a==="comm"&&s.screen==="replan"){
  const id=b.dataset.id;if(!c().communications.some(x=>x[0]===id))return;
  session().choice=id;persist();const y=window.scrollY;render();window.scrollTo(0,y);return;
 }
 if(a==="submit-post"&&s.screen==="replan"){
  const p=active(),checked=session().postVerified===JSON.stringify(p),m=checkSchedule(c(),p,true);
  if(!checked||m.assigned<2||!session().choice)return;
  commitRound();return;
 }
 if(a==="next"&&s.screen==="feedback"){nextRound();return;}
 if(a==="hint"&&s.screen==="learn"){s.hints=Math.min(3,s.hints+1);nextScreen("learn",false);return;}
 if(a==="continue"&&s.screen==="learn"){s.idx=3;s.current=initSession(c());nextScreen("plan");return;}
});
window.QX_LEAD_V2_QA={
 snapshot:()=>({screen:s.screen,idx:s.idx,id:c().id,rounds:s.rounds.length,hints:s.hints,
  selectedCommunication:s.current?.choice,
  preChecks:s.current?.preChecks||0,postChecks:s.current?.postChecks||0,
  activePlan:s.current?.[s.screen==="replan"?"post":"pre"]?.plan?clone(active()):null,
  currentCheck:s.current?.[s.screen==="replan"?"postVerified":"preVerified"]===JSON.stringify(s.current?.[s.screen==="replan"?"post":"pre"]?.plan),
  metrics: s.current&&["plan","replan"].includes(s.screen)?checkSchedule(c(),active(),s.screen==="replan"):null}),
 cases:()=>CASES.map(c=>({id:c.id,title:c.title,phase:c.phase,steps:c.tasks.length,event:c.event.title})),
 records:()=>clone(s.rounds)
};
if(s.screen==="intro"||!safeSession(s,CASES,VERSION)){s=fresh();render();}
else{hasSaved=true;render();}
