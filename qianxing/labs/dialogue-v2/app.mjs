"use strict";
import {CASES,validCase} from "./casebook.mjs";
const $=s=>document.querySelector(s), app=$("#app");
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=x=>JSON.parse(JSON.stringify(x));
const phases={practice:"操作练习",baseline:"初次调查",after:"新情境挑战",transfer:"迁移调查"};
const stages={investigate:0,classify:1,interpret:2,act:3,consequence:4,reflect:5,feedback:6};
let s={screen:"intro",idx:0,started:null,records:[],hints:0,session:null};
const scene=()=>CASES[s.idx],current=()=>s.session;
const btn=(label,action,cls="",extra="")=>'<button class="btn '+cls+'" type="button" data-action="'+action+'" '+extra+'>'+label+'</button>';
const image=c=>'<img src="./assets/'+c.scene+'.svg" alt="'+esc(c.world)+'的单一场景原创插画" loading="eager">';
function begin(i){
 s.idx=i;s.screen="investigate";
 s.session={id:scene().id,phase:scene().phase,sources:[],tags:[null,null],
   hypotheses:[],actionId:null,followId:null,draft:"",selfChecks:[],clueOrder:[],started:Date.now(),seconds:0};
 try{localStorage.setItem("qianxing-last-id","45")}catch(e){}
 render();
}
function head(title,sub){
 const step=stages[s.screen]??0;
 const total=CASES.length;
 return '<div class="topline"><span class="eyebrow">'+esc(phases[scene().phase])+' · '+String(s.idx).padStart(2,"0")+' / 06</span>'+
 '<span class="meta">'+(s.idx===0?"练习环节":"第 "+s.idx+" / 6 个情境")+'</span></div>'+
 '<div class="progress" aria-label="本情境进度"><span style="width:'+Math.round(100*(step+1)/7)+'%"></span></div>'+
 '<h1 class="step-title">'+title+'</h1><p class="step-lead">'+sub+'</p>';
}
function intro(){
 const c=CASES[0];
 app.innerHTML='<div class="hero"><div class="hero-copy"><div class="eyebrow">潜星计划 · 第45项 / 深度探索 V2</div>'+
 '<h1>读懂一件事，<br>不等于猜中一个人。</h1>'+
 '<p>走进七段独立的沟通情境。你将收集证据、分辨事实与推测、提出多种解释、选择回应方式，再根据角色的新反馈修订策略。</p>'+
 '<div class="actions">'+btn("开始情境调查 →","start","primary large")+
 '<span class="muted">1段练习 + 6个不同情境 · 无摄像头 · 不需登录</span></div>'+
 '<p class="privacy">这不是心理测验或人格评价。只记录页面里可观察的选择与作品；不会自动上传。</p></div>'+
 '<div class="hero-scene"><div class="scene-label">单一情境 · 工作室</div>'+image(c)+'</div></div>'+
 '<div class="intro-notes"><div><strong>调查</strong>看谁说了什么，哪些事实有出处</div>'+
 '<div><strong>回应</strong>给出可行动的方案，而非猜测动机</div>'+
 '<div><strong>修复</strong>遇到新反馈时允许改变主意</div></div>';
}
function figures(c){
 return '<div class="people">'+c.people.map((p,i)=>'<div class="person">'+
 '<span class="avatar avatar-'+i+'">'+esc(p[0].slice(0,1))+'</span>'+
 '<div><strong>'+esc(p[0])+'</strong><small>'+esc(p[1])+'</small></div></div>').join("")+'</div>';
}
function investigate(){
 const c=scene(),r=current(),chosen=r.sources.length;
 const cards=c.clues.map(cl=>{
  const opened=r.sources.includes(cl.id);
  return '<button type="button" class="clue '+(opened?"opened":"")+'" data-action="clue" data-id="'+cl.id+'" '+(chosen>=3&&!opened?'disabled':'')+
   ' aria-pressed="'+String(opened)+'"><span class="clue-indicator">'+(opened?"✓":"＋")+'</span>'+
   '<span class="clue-main"><b>'+esc(cl.label)+'</b><small>'+esc(cl.kind==="indirect"?"非直接信息":cl.kind==="record"?"记录/文件":cl.kind==="direct"?"当事人叙述":cl.kind==="constraint"?"可核查约束":"背景信息")+'</small>'+
   (opened?'<span class="reveal">'+esc(cl.text)+'</span>':'')+'</span></button>';
 }).join("");
 app.innerHTML=head("第一步：先调查，不急着下结论。","有限的调查时间：从五条线索里最多查看三条。哪些信息值得优先核实？")+
 '<div class="story-layout"><section class="scene-card">'+image(c)+'<div class="scene-caption"><b>'+esc(c.world)+'</b><span>'+esc(c.intro)+'</span></div>'+
 '<div class="context-note"><b>目前已知</b>'+esc(c.context)+'</div>'+
 figures(c)+'</section><section class="evidence-panel"><div class="panel-heading"><h2>可调查的信息</h2><span>'+chosen+' / 3 条</span></div>'+
 '<div class="clues">'+cards+'</div><p class="small">选择后将消耗一条调查机会，不能撤回。本轮最多查看3条；不同来源的信息可能相互补充或冲突。</p>'+
 '<div class="step-actions">'+btn("继续核对事实 →","next","primary",chosen<2?'disabled':'')+'</div></section></div>';
}
function classify(){
 const c=scene(),r=current();
 app.innerHTML=head("第二步：把事实和推测分开。","不必猜别人真正的心理状态。判断以下表述是否有足够的客观证据支持。")+
 '<div class="focus"><div class="focus-label">本轮背景</div><p>'+esc(c.context)+'</p></div>'+
 '<div class="question-grid">'+c.statements.map((q,i)=>'<section class="question"><span>陈述 '+(i+1)+'</span><h2>'+esc(q[0])+'</h2>'+
 '<div class="choice-row">'+btn("已有证据支持","tag-"+i+"-true",r.tags[i]===true?"selected":"")+
 btn("目前还是推测","tag-"+i+"-false",r.tags[i]===false?"selected":"")+'</div></section>').join("")+'</div>'+
 '<div class="step-actions">'+btn("继续提出解释 →","next","primary",r.tags.some(x=>x===null)?"disabled":"")+'</div>';
}
function interpret(){
 const c=scene(),r=current();
 app.innerHTML=head("第三步：同时保留两种可能。","选择两条暂时合理、值得进一步核查的解释。合理的解释不等于最终结论。")+
 '<div class="focus"><div class="focus-label">已查看的信息</div>'+
 (r.sources.map(id=>c.clues.find(x=>x.id===id)).map(x=>'<p><b>'+esc(x.voice)+'：</b>'+esc(x.text)+'</p>').join("")||'<p>本轮尚未收集线索。</p>')+'</div>'+
 '<div class="option-grid">'+c.hypotheses.map(h=>{
  const picked=r.hypotheses.includes(h.id);
  return '<button class="option '+(picked?"active":"")+'" type="button" data-action="hyp" data-id="'+h.id+'" aria-pressed="'+picked+'" '+(r.hypotheses.length>=2&&!picked?"disabled":"")+'><span class="mark">'+(picked?"✓":"○")+'</span>'+esc(h.text)+'</button>';
 }).join("")+'</div>'+
 '<div class="footer-hint">已保留 '+r.hypotheses.length+' / 2 种解释。也可以保留仍有待验证的假设，只需在行动前避免断言。</div>'+
 '<div class="step-actions">'+btn("进入沟通决策 →","next","primary",r.hypotheses.length!==2?"disabled":"")+'</div>';
}
function act(){
 const c=scene(),r=current();
 app.innerHTML=head("第四步：你会怎样回应？","现在需要做一项实际决定。你的选择将改变接下来故事里其他人的反馈。")+
 '<div class="brief"><div class="brief-scene">'+image(c)+'</div><div><strong>'+esc(c.title)+'</strong><p>'+esc(c.intro)+'</p></div></div>'+
 '<div class="option-grid">'+c.actions.map(x=>'<button type="button" class="option '+(r.actionId===x.id?"active":"")+'" data-action="action" data-id="'+x.id+'" aria-pressed="'+String(r.actionId===x.id)+'><span class="mark">'+(r.actionId===x.id?"✓":"○")+'</span>'+esc(x.text)+'</button>').join("")+'</div>'+
 '<div class="step-actions">'+btn("实施并查看后续 →","next","primary",r.actionId?"":"disabled")+'</div>';
}
function consequence(){
 const c=scene(),r=current(),a=c.actions.find(x=>x.id===r.actionId);
 const extra=r.sources.filter(x=>c.clues.find(q=>q.id===x)?.kind==="direct").length>0?
 "你已经查看过至少一位当事人的叙述，但仍需核实它与其他记录是否一致。":
 "本轮你没有直接听到当事人的叙述；后续最好留出自愿澄清的机会。";
 app.innerHTML=head("第五步：现实会继续变化。","做出选择之后，角色会根据当前情境作出不同反馈。你可以修复、补充或重新确认。")+
 '<div class="response-scene">'+image(c)+'<div class="response-text"><div class="eyebrow">行动后的新反馈</div>'+
 '<h2>'+esc(c.reactions[a.approach])+'</h2><p>'+esc(extra)+'</p></div></div>'+
 '<div class="focus"><div class="focus-label">新的问题</div><p>怎样在不替他人作心理判断的前提下，进一步推进这件事情？</p></div>'+
 '<div class="option-grid">'+c.follow.map(x=>'<button type="button" class="option '+(r.followId===x.id?"active":"")+'" data-action="follow" data-id="'+x.id+'"><span class="mark">'+(r.followId===x.id?"✓":"○")+'</span>'+esc(x.text)+'</button>').join("")+'</div>'+
 '<div class="step-actions">'+btn("整理自己的回应 →","next","primary",r.followId?"":"disabled")+'</div>';
}
function reflect(){
 const c=scene(),r=current();
 const suggestions=["区分已核实事实和仍待确认的部分","允许对方选择沟通方式和边界","提出一个可执行、可核对的下一步"];
 app.innerHTML=head("第六步：说出你自己的话。","你可以组织一段准备发出的信息。不会由AI自动给你的文字打人格分数，也不要求写出唯一标准答案。")+
 '<div class="focus"><div class="focus-label">情境</div><p>'+esc(c.intro)+'</p>'+
 '<div class="focus-label">本次选择的行动</div><p>'+esc(c.actions.find(a=>a.id===r.actionId).text)+'</p></div>'+
 '<label class="draft-label" for="draft">写一段实际可以发送的回应（可选）</label><textarea id="draft" rows="6" maxlength="1800" placeholder="例如：我已经确认了哪些信息……还不知道哪些部分……我们能否先……">'+esc(r.draft)+'</textarea>'+
 '<p class="small">文字仅在当前页面内处理；如果选择导出记录，会包含你填写的内容。避免填写真实姓名、联系方式或其他敏感资料。</p>'+
 '<div class="selfcheck"><h2>自愿复核清单</h2>'+suggestions.map((p,i)=>'<label><input type="checkbox" data-check="'+i+'" '+(r.selfChecks.includes(i)?"checked":"")+'>'+esc(p)+'</label>').join("")+'</div>'+
 '<div class="step-actions">'+btn("记录本轮，查看反馈 →","next","primary")+'</div>';
}
function metrics(c,r){
 const inspected=r.sources.map(id=>c.clues.find(x=>x.id===id));
 const types=[...new Set(inspected.map(x=>x.kind))];
 const direct=new Set(inspected.filter(x=>x.kind==="direct").map(x=>x.voice)).size;
 const tags=r.tags.filter((x,i)=>x===c.statements[i][1]).length;
 const supported=r.hypotheses.filter(id=>c.hypotheses.find(x=>x.id===id)?.grounded).length;
 const action=c.actions.find(x=>x.id===r.actionId),follow=c.follow.find(x=>x.id===r.followId);
 return {sources:r.sources.length,differentTypes:types.length,voices:direct,facts:tags,
  plausible:supported,investigated:{direct:direct,record:inspected.some(x=>x.kind==="record")},
  approach:action.approach,actionReasons:action.dimensions,repair:follow.repair==="repair",
  selfChecks:r.selfChecks.length,draftLength:r.draft.trim().length};
}
function feedback(){
 const c=scene(),r=current(),m=metrics(c,r),correct=c.statements.map((q,i)=>'<li>'+esc(q[0])+' —— '+(r.tags[i]===q[1]?"与你的判断一致。":"与你的判断不同。")+
 ' '+esc(q[2])+'</li>').join("");
 app.innerHTML=head("本轮结束：看过程，而不是贴标签。","这个反馈只针对虚构场景和你的操作选择，不评价你是怎样的人。")+
 '<div class="summary-stats"><div><strong>'+m.sources+'/3</strong><span>调查线索</span></div>'+
 '<div><strong>'+m.voices+'</strong><span>直接叙述来源</span></div>'+
 '<div><strong>'+m.facts+'/2</strong><span>事实/推测核对</span></div>'+
 '<div><strong>'+m.plausible+'/2</strong><span>保留可核查解释</span></div></div>'+
 '<div class="focus"><div class="focus-label">后续可做什么</div><p>'+esc(c.outcome)+'</p><p>你采用的行动：'+esc(c.actions.find(x=>x.id===r.actionId).text)+'</p>'+
 '<p>你对新反馈的处理：'+esc(c.follow.find(x=>x.id===r.followId).text)+'</p></div>'+
 '<details class="details"><summary>查看这轮事实核对的依据</summary><ul>'+correct+'</ul></details>'+
 '<p class="muted">同一个结果可能来自多条合理路径。行为记录并不意味着真实沟通中的因果预测，也不能判定共情能力的高低。</p>'+
 '<div class="step-actions">'+btn(s.idx===2?"进入观察方法学习 →":s.idx===6?"查看本次完整记录 →":"下一段情境 →","next","primary large")+'</div>';
}
function learn(){
 const tips=["先问可核查的事实：谁看到了什么？时间、材料和责任有没有不同版本？",
 "为至少两种解释留下空间：当事人经历、环境限制和任务目标可能不同，不要把‘可能’写成‘肯定’。",
 "回应既照顾人，也处理事：尊重沟通选择，同时约定清晰、可执行、可复核的下一步。"];
 app.innerHTML='<div class="center-stage"><div class="eyebrow">前两段调查已完成 · 可选微学习</div>'+
 '<h1>掌握一种新方法，<br>在陌生情境中再试一次。</h1>'+
 '<p>你可以查看一到三条调查策略，也可以跳过。新的情境与前面不同；表现差异并不直接代表学习速度。</p>'+
 '<div class="learning-card"><strong>事实—可能—行动</strong>'+
 (s.hints?'<ol>'+tips.slice(0,s.hints).map(x=>'<li>'+x+'</li>').join("")+'</ol>':'<p>当前没有展开策略。学习环节完全自愿。</p>')+
 (s.hints<3?btn("查看第 "+(s.hints+1)+" 条策略","hint"):"")+'</div>'+
 '<div class="step-actions">'+btn("进入新的情境 →","continue","primary large")+'</div></div>';
}
function commit(){
 const c=scene(),r=current();
 r.seconds=Math.round((Date.now()-r.started)/1000);
 const m=metrics(c,r);
 s.records.push({id:c.id,phase:c.phase,title:c.title,context:c.context,
   sourceIds:[...r.sources],sourceSequence:[...r.clueOrder],factTags:[...r.tags],
   hypotheses:[...r.hypotheses],actionId:r.actionId,followId:r.followId,
   draft:r.draft,selfChecks:[...r.selfChecks],seconds:r.seconds,observables:m});
}
function report(){
 const logs=s.records.filter(x=>x.phase!=="practice");
 const group=phase=>logs.filter(x=>x.phase===phase);
 const total=arr=>arr.reduce((a,b)=>a+b,0);
 const stats={
  direct:total(logs.map(x=>x.observables.voices)),
  types:total(logs.map(x=>x.observables.differentTypes)),
  facts:total(logs.map(x=>x.observables.facts)),
  hypotheses:total(logs.map(x=>x.observables.plausible)),
  repairs:total(logs.map(x=>x.observables.repair?1:0))
 };
 app.innerHTML='<section class="report"><div class="eyebrow">第45项 · 沟通理解 · 完成记录</div>'+
 '<h1>你完成了六段不同情境的调查。</h1><p class="step-lead">以下是本次网页中实际发生的操作记录，不是心理画像，也不是经过标准化验证的共情能力分数。</p>'+
 '<div class="summary-stats report-stats"><div><strong>'+stats.direct+'</strong><span>直接叙述来源</span></div>'+
 '<div><strong>'+stats.facts+' / 12</strong><span>事实/推测辨别</span></div>'+
 '<div><strong>'+stats.hypotheses+' / 12</strong><span>可核查解释</span></div>'+
 '<div><strong>'+stats.repairs+' / 6</strong><span>具有修复特征的后续处理</span></div></div>'+
 '<section class="report-section"><h2>不同情境的表现</h2><p>初次调查2段、学习后2段、迁移2段。后两组难度和内容尚未经过等价性验证，因此这里不计算“学习能力提高百分比”。</p>'+
 '<div class="phase-comparison">'+["baseline","after","transfer"].map(x=>'<div><b>'+({baseline:"首次",after:"新情境",transfer:"跨情境"})[x]+'</b><strong>'+group(x).length+' 段</strong><span>已完成调查与多轮选择</span></div>').join("")+'</div></section>'+
 '<section class="report-section"><h2>结果能说明什么、不能说明什么</h2>'+
 '<p>可以查看你是否主动核实事实、听取不同角色、保留多种解释、如何选择行动与修复；没有足够依据判断真实共情水平、性格、心理健康或未来职业表现。</p>'+
 '<p>这是虚构情境的设计者规则，尚未有专家复核、题本等价、群体常模、信度和效度研究。文字回应不会被自动评价为“好人/坏人”。</p></section>'+
 '<details class="details"><summary>展开六段情境的操作明细</summary><div class="table-wrap"><table><thead><tr><th>情境</th><th>线索</th><th>事实辨别</th><th>开放解释</th><th>响应方式</th></tr></thead><tbody>'+
 logs.map(x=>'<tr><td>'+esc(x.title)+'</td><td>'+x.observables.sources+'/3</td><td>'+x.observables.facts+'/2</td><td>'+x.observables.plausible+'/2</td><td>'+esc(({invite:"邀请澄清",plan:"务实核查",pressure:"施压",assume:"自行假设"})[x.observables.approach])+'</td></tr>').join("")+
 '</tbody></table></div></details>'+
 '<div class="step-actions">'+btn("下载本次探索记录（JSON）","download","primary large")+
 btn("重新体验","restart")+"<a class='btn quiet' href='../../explore/'>返回108项</a></div>"+
 '<p class="small">只有主动下载才会将本次作答和自愿书写的文字保存到你的设备；不登录、不上传。刷新页面将清空本次记录。</p></section>';
}
function render(){
 if(!CASES.every(validCase)){app.textContent="情境素材未通过完整性检查，请联系维护人员。";return}
 if(s.screen==="intro"){intro();return}
 if(s.screen==="learn"){learn();return}
 if(s.screen==="report"){report();return}
 const map={investigate,classify,interpret,act,consequence,reflect,feedback};
 (map[s.screen]||investigate)();
}
function next(){
 if(s.screen==="investigate"&&current().sources.length>=2)s.screen="classify";
 else if(s.screen==="classify"&&current().tags.every(x=>x!==null))s.screen="interpret";
 else if(s.screen==="interpret"&&current().hypotheses.length===2)s.screen="act";
 else if(s.screen==="act"&&current().actionId)s.screen="consequence";
 else if(s.screen==="consequence"&&current().followId)s.screen="reflect";
 else if(s.screen==="reflect")s.screen="feedback";
 else if(s.screen==="feedback"){
  commit();
  if(s.idx===2){s.screen="learn";}
  else if(s.idx===6){s.screen="report";}
  else {begin(s.idx+1);return}
 }
 render();window.scrollTo({top:0,behavior:"instant"});
}
app.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b||b.disabled||!app.contains(b))return;
 const a=b.dataset.action,id=b.dataset.id,r=current();
 if(a==="start"||a==="restart"){
  s={screen:"intro",idx:0,started:new Date().toISOString(),records:[],hints:0,session:null};
  begin(0);return;
 }
 if(a==="clue"&&s.screen==="investigate"){
  if(!r.sources.includes(id)&&r.sources.length<3){r.sources.push(id);r.clueOrder.push(id);}
 }else if(a.startsWith("tag-")&&s.screen==="classify"){
  const m=/^tag-(\d+)-(true|false)$/.exec(a);
  if(m&&Number(m[1])<2)r.tags[Number(m[1])]=m[2]==="true";
 }else if(a==="hyp"&&s.screen==="interpret"){
  if(r.hypotheses.includes(id))r.hypotheses=r.hypotheses.filter(x=>x!==id);
  else if(r.hypotheses.length<2)r.hypotheses.push(id);
 }else if(a==="action"&&s.screen==="act")r.actionId=id;
 else if(a==="follow"&&s.screen==="consequence")r.followId=id;
 else if(a==="next"){next();return;}
 else if(a==="hint"&&s.screen==="learn")s.hints=Math.min(3,s.hints+1);
 else if(a==="continue"&&s.screen==="learn"){begin(3);return;}
 else if(a==="download"&&s.screen==="report"){download();return;}
 render();
});
app.addEventListener("input",e=>{
 if(e.target.id==="draft"&&s.screen==="reflect")current().draft=e.target.value;
});
app.addEventListener("change",e=>{
 if(e.target.matches("[data-check]")&&s.screen==="reflect"){
  const n=Number(e.target.dataset.check);
  if(e.target.checked&&!current().selfChecks.includes(n))current().selfChecks.push(n);
  else if(!e.target.checked)current().selfChecks=current().selfChecks.filter(x=>x!==n);
 }
});
function download(){
 const data={project:"潜星计划",module:45,version:"dialogue-v2-20261029",startedAt:s.started,exportedAt:new Date().toISOString(),
  purpose:"行为与证据探索示例，非心理、人格、职业评估",notDiagnosis:true,
  noNorms:true,equivalenceNotEstablished:true,
  dataUse:"不自动上传，本人主动导出",hintsViewed:s.hints,results:clone(s.records)};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="潜星计划_第45项_沟通理解V2_探索记录.json";
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1600);
}
window.QX_DIALOGUE_V2_QA={
 snapshot:()=>({screen:s.screen,idx:s.idx,records:s.records.length,hints:s.hints,
  sources:current()?.sources??[],tags:current()?.tags??[],hypotheses:current()?.hypotheses??[],
  actionId:current()?.actionId,followId:current()?.followId}),
 cases:()=>CASES.map(x=>({id:x.id,title:x.title,phase:x.phase,valid:validCase(x),clues:x.clues.length})),
 records:()=>clone(s.records)
};
render();
