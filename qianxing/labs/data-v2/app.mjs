"use strict";
import {VERSION,CASES,PHASES,DAYS,EVIDENCE,makeRows,summarize,forDay,evidence,evaluate,validateAll} from "./data-core.mjs";
const app=document.getElementById("app");
const KEY="qianxing-data-v2-session";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=x=>JSON.parse(JSON.stringify(x));
const fmt=n=>Number.isFinite(n)?Math.round(n).toLocaleString("zh-CN"):"—";
const pct=n=>Number.isFinite(n)?n.toFixed(1)+"%":"—";
const metricName=(c,m)=>({total:c.columns[0],hits:c.columns[1],rate:c.columns[2],reference:c.columns[3]})[m];
const label=g=>g==="all"?"全部分组":g==="0"?"分组一":"分组二";
const btn=(s,a,style="",extra="")=>'<button type="button" class="btn '+style+'" data-act="'+a+'" '+extra+'>'+esc(s)+'</button>';
const newState=()=>({version:VERSION,startedAt:new Date().toISOString(),screen:"intro",index:0,
 hints:0,logs:[],trial:null});
const newTrial=()=>({startAt:new Date().toISOString(),metric:"rate",group:"all",focus:null,
 lastDay:null,views:["all-rate"],checks:[],hypothesis:null,plan:null,confidence:"不确定",note:""});
let s=newState(),hasSaved=false;
function validateResume(x){
 return !!(x&&x.version===VERSION&&["intro","analyze","evidence","decide","feedback","learning","report"].includes(x.screen)&&
 Number.isInteger(x.index)&&x.index>=0&&x.index<9&&
 Number.isInteger(x.hints)&&x.hints>=0&&x.hints<=3&&Array.isArray(x.logs)&&x.logs.length<=9&&
 x.trial&&typeof x.trial==="object"&&Array.isArray(x.trial.checks)&&x.trial.checks.length<=3&&
 ["all","0","1"].includes(x.trial.group)&&["rate","hits","total","reference"].includes(x.trial.metric)&&
 (x.trial.focus===null||x.trial.focus==="none"||DAYS.includes(x.trial.focus))&&
 (x.trial.lastDay===null||DAYS.includes(x.trial.lastDay))&&
 Array.isArray(x.trial.views)&&x.trial.views.length<=12&&
 typeof x.trial.note==="string"&&x.trial.note.length<=2000);
}
try{const raw=localStorage.getItem(KEY);if(raw){const x=JSON.parse(raw);if(validateResume(x)){hasSaved=true;s=x;}}}
catch(e){console.warn("本地调查草稿读取失败",String(e));}
function persist(){
 try{localStorage.setItem(KEY,JSON.stringify(s));hasSaved=true;return true;}
 catch(e){console.warn("本地保存失败",String(e));return false;}
}
function move(screen,preserveScroll=false){
 s.screen=screen;persist();
 const oldY=preserveScroll?window.scrollY:0;
 render();
 if(preserveScroll)window.scrollTo(0,oldY);
 else window.scrollTo({top:0,behavior:"instant"});
}
function start(index=0){
 s=newState();s.index=index;s.trial=newTrial();
 window.QX_PROGRESS?.start(77);
 try{localStorage.setItem("qianxing-last-id","77");}catch(e){}
 move("analyze");
}
const cur=()=>CASES[s.index];
const trial=()=>s.trial;
const rows=()=>makeRows(cur().id);
const phaseName=()=>PHASES[cur().phase];
function titleBlock(h1,sub){
 const i=s.index;
 return '<div class="topline"><span class="eyebrow">'+esc(phaseName())+' · '+(i===0?"练习":"挑战 "+i+" / 8")+'</span>'+
 '<span class="small">77 / 108 · 2026年9月合成日报</span></div>'+
 '<div class="progress" aria-label="多阶段调查进度"><span style="width:'+Math.round(i/8*100)+'%"></span></div>'+
 '<h1 class="step-title">'+esc(h1)+'</h1>'+
 '<p class="step-lead">'+esc(sub)+'</p>';
}
function hero(){
 const bars=[58,63,56,71,60,66,69,58,75,31,61,67,58,68];
 app.innerHTML='<section class="hero"><span class="eyebrow">潜星计划 · 第77项 · 深度探索 V2</span>'+
 '<h1>数据会说话，<br>但你必须查清来龙去脉。</h1>'+
 '<p>九份模拟业务报表，九种不同的陷阱。筛选群组、切换比例与总量、调查日志、验证异常，再决定怎么处理。</p>'+
 '<div class="hero-example" aria-hidden="true"><b>模拟监测总览 · 包含需要调查的变化和正常波动</b>'+
 '<div class="mini-bars">'+bars.map((x,i)=>'<span class="'+(i===9?"hot":"")+'" style="--bar:'+x+'%"></span>').join("")+'</div></div>'+
 '<div class="btn-row">'+btn("开始数据调查 →","start","primary large")+
 (hasSaved?btn("继续本机调查记录","resume"):"")+
 '<span class="small">一轮练习、三轮首试、三轮新数据、两轮跨行业挑战</span></div>'+
 '<p class="small" style="margin-top:19px">数据全部为程序生成的虚构数据，不连接真实店铺/客户。不提供先天天赋判断。</p></section>'+
 '<div class="intro-points"><div><b>看见现象</b>亲自筛选比例、数量与分组</div>'+
 '<div><b>核实证据</b>在有限的调查机会里选可信来源</div>'+
 '<div><b>做出决定</b>提出解释并选择可核查的行动</div></div>';
}
function chart(c,values,metric,selected){
 const max=Math.max(1,...values.map(x=>x.value)),ymax=max*1.18,lo=70,hi=880;
 const y=v=>282-224*v/ymax;
 const pts=values.map((x,i)=>[lo+i*(hi-lo)/13,y(x.value)]);
 const path=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1)).join(" ");
 const poly=path+" L"+hi+",282 L"+lo+",282 Z";
 const ticks=[0,.25,.5,.75,1].map((t,i)=>{
  const yy=282-224*t,unit=metric==="rate"?pct(ymax*t):fmt(ymax*t);
  return '<line class="gridline" x1="64" y1="'+yy+'" x2="906" y2="'+yy+'"/>'+
    '<text class="axis" x="58" y="'+(yy+4)+'" text-anchor="end">'+unit+'</text>';
 }).join("");
 const ds=values.map((v,i)=>i%2===0?
   '<text class="axis" x="'+pts[i][0]+'" y="314" text-anchor="middle">'+v.day.slice(3)+'</text>':"").join("");
 const dots=values.map((v,i)=>'<g><circle class="hit" role="button" tabindex="0" data-act="day" data-day="'+v.day+
 '" aria-label="选择9月'+v.day.slice(3)+'日，'+esc(metricName(c,metric))+'为'+(metric==="rate"?pct(v.value):fmt(v.value))+
 '" cx="'+pts[i][0]+'" cy="'+pts[i][1]+'" r="21"/>'+
 '<circle class="dot '+(selected===v.day?"selected":"")+'" cx="'+pts[i][0]+'" cy="'+pts[i][1]+'" r="6" pointer-events="none"/></g>').join("");
 return '<div class="chart"><svg viewBox="0 0 930 333" role="img" aria-label="十四日数据曲线，可使用图表点或下方表格选择日期">'+
 ticks+'<path class="area" d="'+poly+'"/><path class="line" d="'+path+'"/>'+
 (selected&&selected!=="none"?'<line class="hotline" x1="'+pts[DAYS.indexOf(selected)][0]+'" x2="'+pts[DAYS.indexOf(selected)][0]+'" y1="50" y2="284"/>':"")+
 dots+ds+'<text class="axis" x="475" y="330" text-anchor="middle">9月日期</text></svg></div>';
}
function table(c,values,selected){
 return '<div class="table-wrapper"><table class="data-table"><thead><tr><th>日期</th>'+
 [c.columns[0],c.columns[1],c.columns[2],c.columns[3]].map(x=>'<th>'+esc(x)+'</th>').join("")+
 '</tr></thead><tbody>'+values.map(v=>'<tr class="'+(selected===v.day?"selected":"")+'">'+
 '<td><button class="day-button" data-act="day" data-day="'+v.day+'" type="button">9月'+v.day.slice(3)+'</button></td>'+
 '<td>'+fmt(v.total)+'</td><td>'+fmt(v.hits)+'</td><td>'+pct(v.rate)+'</td><td>'+fmt(v.reference)+'</td></tr>').join("")+'</tbody></table></div>';
}
function analysis(){
 const c=cur(),t=trial(),data=rows(),values=summarize(data,t.group,t.metric);
 const sum=summarize(data,t.group,"rate").reduce((a,v)=>({total:a.total+v.total,hits:a.hits+v.hits,reference:a.reference+v.reference}),{total:0,hits:0,reference:0});
 const ratio=sum.total?sum.hits/sum.total*100:0,focus=t.focus;
 const selectedData=focus&&focus!=="none"?forDay(data,focus,t.group):null;
 app.innerHTML=titleBlock("第一步：在图表里找到值得核查的变化。","这份数据没有自动高亮“正确答案”。先切换分组或指标，再选择一个可疑日期；也可以判断尚未发现可确认的新异常。")+
 '<div class="story-note"><b>'+esc(c.title)+'：</b>'+esc(c.story)+'</div>'+
 '<div class="workbench"><section class="panel"><div class="panel-head"><strong>交互式数据检查台</strong><span>完全虚构 · 固定可复核题本</span></div>'+
 '<div class="dashboard"><div class="filters">'+
 '<label for="group">筛选对象<select id="group">'+
 [['all','全部分组'],['0',c.groups[0]],['1',c.groups[1]]].map(x=>'<option value="'+x[0]+'" '+(t.group===x[0]?"selected":"")+'>'+esc(x[1])+'</option>').join("")+
 '</select></label>'+
 '<label for="metric">要查看的指标<select id="metric">'+
 [['rate',c.columns[2]],['total',c.columns[0]],['hits',c.columns[1]],['reference',c.columns[3]]].map(x=>'<option value="'+x[0]+'" '+(t.metric===x[0]?"selected":"")+'>'+esc(x[1])+'</option>').join("")+
 '</select></label></div>'+
 '<div class="kpis"><div class="kpi"><span>14日 '+esc(c.columns[0])+'</span><strong>'+fmt(sum.total)+'</strong></div>'+
 '<div class="kpi"><span>14日 '+esc(c.columns[1])+'</span><strong>'+fmt(sum.hits)+'</strong></div>'+
 '<div class="kpi"><span>14日整体比例（比值）</span><strong>'+pct(ratio)+'</strong></div></div>'+
 chart(c,values,t.metric,t.lastDay||t.focus)+
 '<div class="legend"><span>当前：'+esc(t.group==="all"?"全部":c.groups[Number(t.group)])+' · '+esc(metricName(c,t.metric))+'</span>'+
 '<b>已查看 '+t.views.length+' 种指标/分组组合</b></div>'+
 table(c,summarize(data,t.group,"rate"),t.lastDay||t.focus)+
 '<div class="btn-row">'+btn("下载当前分组原始CSV","csv","","")+
 '<span class="small">比例=分子之和÷分母之和；导出的数据不含真实客户资料。</span></div></div></section>'+
 '<aside class="panel sidebar"><h2>你的初步调查判断</h2>'+
 '<p>'+esc(c.description)+'</p>'+
 '<div class="status-box"><strong>当前关注的日期</strong><span>'+(focus==="none"?"尚无足够证据确认异常":focus?"9月"+focus.slice(3):"尚未选择日期")+'</span>'+
 (selectedData?'<div class="detail-text">该日'+esc(c.columns[0])+' '+selectedData.total+'，'+esc(c.columns[1])+' '+selectedData.hits+'，对应比例 '+pct(selectedData.rate)+'。</div>':"")+'</div>'+
 '<div class="detail-text">点击折线点或下方日期可标记最值得核查的一天。调查阶段不要求你已证明根因。</div>'+
 btn("没有发现可确认的新异常","none",focus==="none"?"primary":"")+
 '<p class="small">即使曲线变化明显，也可能只是周期、样本量或统计口径造成的。你可以选择“不确认”。</p>'+
 '<div class="next-row">'+btn("暂时跳过这一轮","skip","quiet")+
 btn("去核查证据 →","next","primary",focus===null?"disabled":"")+'</div></aside></div>';
}
function evidencePage(){
 const c=cur(),t=trial(),data=rows();
 const list=EVIDENCE.map(([id,name])=>{
  const seen=t.checks.includes(id),disabled=t.checks.length>=3&&!seen;
  const found=seen?evidence(c,data,id,t.focus):null;
  return '<button type="button" data-act="clue" data-id="'+id+'" class="clue '+(seen?"revealed":"")+'" '+
   (disabled?"disabled":"")+' aria-pressed="'+String(seen)+'"><div class="head"><b>'+(seen?"✓ ":"＋ ")+esc(name)+'</b>'+
   '<span class="kind">'+(seen?esc(found.kind):"点击调查")+'</span></div>'+
   (seen?'<span class="reveal">'+esc(found.text)+'</span>':"")+'</button>';
 }).join("");
 app.innerHTML=titleBlock("第二步：在有限机会里选择证据。","你最多可以核查三条信息，已查询的线索不能撤销。至少查看两条，再尝试分析造成变化的原因。")+
 '<div class="story-note"><b>你的初始关注：</b>'+(t.focus==="none"?"暂时未发现可确认的异常日":t.focus?"9月"+t.focus.slice(3)+"日":"未确定")+
 '。已经浏览 '+t.views.length+' 种指标/分组组合。</div>'+
 '<div class="workbench"><div class="panel"><div class="panel-head"><strong>可用的核对来源</strong><span>已选 '+t.checks.length+' / 3</span></div>'+
 '<div class="dashboard"><div class="clue-list">'+list+'</div></div></div>'+
 '<aside class="panel sidebar"><h2>如何判断证据质量？</h2>'+
 '<p>分组比例、实际分母、独立系统记录和流程日志回答的是不同问题。未经核实的群聊推测不应当成事实。</p>'+
 '<div class="status-box"><strong>当前已核对 '+t.checks.length+' 条来源</strong><span>你仍可以保留不确定性，不必猜测谁“故意”造成事故。</span></div>'+
 '<div class="next-row">'+btn("暂时跳过这一轮","skip","quiet")+
 btn("进入假设与处置 →","next","primary",t.checks.length<2?"disabled":"")+'</div></aside></div>';
}
function decision(){
 const c=cur(),t=trial();
 const allCauses=[...c.causes,["unsure","证据仍不足，暂时无法判断根因"]];
 const opts=(items,key,value)=>items.map(([id,txt])=>'<button type="button" data-act="'+key+'" data-id="'+id+
 '" class="option '+(id===value?"selected":"")+'" aria-pressed="'+String(id===value)+'">'+esc(txt)+'</button>').join("");
 app.innerHTML=titleBlock("第三步：提出解释，并决定下一步。","不同证据可以支持不同假设。这里评价的是你是否依据模拟数据给出可核查解释，而不是个人能力或人格。")+
 '<div class="story-note"><b>已核对的证据：</b>'+t.checks.map(x=>esc(EVIDENCE.find(z=>z[0]===x)[1])).join("；")+'</div>'+
 '<div class="workbench"><section class="panel"><div class="dashboard"><span class="q-label">A. 你认为目前最符合数据的解释是什么？</span>'+
 '<div class="question-group">'+opts(allCauses,"hyp",t.hypothesis)+'</div>'+
 '<span class="q-label">B. 现在采取什么行动更有依据？</span>'+
 '<div class="question-group">'+opts([...c.actions,["defer","暂不决定，继续核查数据来源和影响范围"]],"plan",t.plan)+'</div></div></section>'+
 '<aside class="panel sidebar"><h2>给出调查结论</h2>'+
 '<p>如果没有充分证据，可以选择“无法判断”或“继续核查”。在真实工作中，处理不确定性也是重要能力。</p>'+
 '<label for="confidence" class="q-label">你的确定程度</label>'+
 '<div class="select-wrap"><select id="confidence">'+["不确定","一般","比较有把握"].map(x=>'<option '+(t.confidence===x?"selected":"")+'>'+x+'</option>').join("")+'</select></div>'+
 '<label for="note" class="q-label">用自己的话写下依据（选填）</label>'+
 '<textarea id="note" maxlength="1600" placeholder="我观察到了哪些数据？哪些还不能确定？">'+esc(t.note)+'</textarea>'+
 '<p class="small">这里不靠AI给文笔打分；也不会自动上传文字。</p>'+
 '<div class="next-row">'+btn("暂时跳过这一轮","skip","quiet")+
 btn("提交调查记录 →","submit","primary",(!t.hypothesis||!t.plan)?"disabled":"")+'</div></aside></div>';
}
function feedback(){
 const c=cur(),r=s.logs[s.logs.length-1],practice=c.phase==="practice";
 const correct=r.evaluation;
 const body=practice?
 '<div class="learning-card"><h2>练习反馈：这轮模拟数据是如何产生的</h2><p>'+
 esc(c.explanation)+'</p><p>练习中的正确焦点是'+(correct.expectedFocus==="none"?"不确认新异常":"9月"+correct.expectedFocus.slice(3)+"日")+
 '。通过模拟订单ID去重与后台对账核查，不要直接以原始行数安排工作。</p></div>':
 '<div class="learning-card"><h2>调查已经保存</h2><p>具体原因会在最后的逐轮记录里揭示，避免提前提示下一轮。'+
 '本轮可回顾你检查过哪些指标、调查过哪些证据，并考虑哪里还存在不确定性。</p></div>';
 app.innerHTML=titleBlock(practice?"操作练习已经完成":"这一轮调查已经保存","你记录的是一个完整过程：观察、调查、提出假设、选择行动，而不是回答一道孤立选择题。")+
 '<div class="center" style="margin-top:25px"><div class="feedback-metrics"><div class="metric"><span>浏览指标组合</span><strong>'+r.views.length+'</strong></div>'+
 '<div class="metric"><span>调查证据</span><strong>'+r.checks.length+'/3</strong></div>'+
 '<div class="metric"><span>选择不确定性</span><strong>'+esc(r.confidence)+'</strong></div></div>'+
 body+'<p>模拟数据中的数值变化有预先写入的生成规则。这里只判断与模拟题本是否一致；不把答题次数或速度等同于天赋。</p>'+
 '<div class="next-row">'+btn(s.index===3?"进入可选方法学习 →":s.index===8?"查看完整记录 →":"下一个独立情境 →","next","primary large")+'</div></div>';
}
function learn(){
 const hints=[
  "先分清分子和分母。百分比变化可能来自样本量、混合结构或测量口径，汇总比例应使用汇总分子÷汇总分母。",
  "同一个数据问题至少检查两个视角：总体与分组，当前日与邻近日，业务日志与独立来源。不同基线不能随意比较。",
  "识别缺失、延迟、重复、单位转换和正常周期后，再考虑真实业务事故。能合理说“目前无法确认”也是严谨的做法。"
 ];
 app.innerHTML='<section class="center"><span class="eyebrow">首次三项调查已记录 · 可选学习</span>'+
 '<h1>换一份新数据，<br>还会得出相同判断吗？</h1>'+
 '<p>你可以查看分母、分组和数据管道的三个分析策略，也可以直接进入新情境。后续题本未经过难度等价性校准，不直接计算“学习能力提高百分比”。</p>'+
 '<div class="learning-card"><h2>分子—分母—来源—验证</h2>'+
 (s.hints?'<ol>'+hints.slice(0,s.hints).map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>':'<p>目前没有阅读提示，是否学习由你决定。</p>')+
 (s.hints<3?'<div class="btn-row">'+btn("查看第 "+(s.hints+1)+" 条方法","hint")+'</div>':"")+
 '</div><div class="btn-row">'+btn("开始新数据挑战 →","continue","primary large")+
 btn("导出当前调查记录","json")+'</div></section>';
}
function report(){
 const records=s.logs.filter(x=>!x.skipped&&x.phase!=="practice");
 const all=s.logs.filter(x=>x.phase!=="practice");
 window.QX_PROGRESS?.finish(77,s.startedAt,{done:all.filter(x=>!x.skipped).length,total:8,skipped:all.filter(x=>x.skipped).length});
 const matches=key=>records.filter(x=>x.evaluation?.[key]).length;
 const questionable=all.filter(x=>x.focus==="none").length;
 const independent=all.filter(x=>x.checks.includes("independent")).length;
 const rumor=all.filter(x=>x.checks.includes("rumor")).length;
 const metrics=[["有完整结论的轮次",records.length+" / 8","完成焦点、证据、假设与行动"],
 ["定位与模拟题本一致",matches("focusMatches")+" / "+records.length,"仅相对预设的合成数据答案"],
 ["解释与模拟根因一致",matches("causeMatches")+" / "+records.length,"不等于真实因果证明"],
 ["行动与模拟方案一致",matches("actionMatches")+" / "+records.length,"不同方案可能同样合理"]];
 const table=all.map(x=>{
  const c=CASES.find(c=>c.id===x.id);
  const focus=x.skipped?"跳过":x.focus==="none"?"未确认异常":"9月"+x.focus.slice(3)+"日";
  const expected=c.signal===null?"无明确新异常":("9月"+DAYS[c.signal].slice(3)+"日");
  return '<tr><td>'+esc(c.title)+'</td><td>'+esc(focus)+'</td><td>'+expected+'</td>'+
  '<td>'+esc(x.skipped?"跳过":x.evaluation.explanation)+'</td><td>'+x.checks.length+'</td></tr>';
 }).join("");
 const btnExport=btn("下载完整调查记录（JSON）","json","primary large");
 app.innerHTML='<section class="report"><span class="eyebrow">潜星计划 · 第77项 · 结果与可验证过程</span>'+
 '<h1>九份数据调查，<br>留下的是过程和证据。</h1>'+
 '<p class="lead">所有数据都是程序生成的虚构材料。这里对照已知规则，展示你是否定位、调查、提出解释与采取行动；不输出“数据分析天赋分数”。</p>'+
 '<div class="report-metrics">'+metrics.map(m=>'<div class="metric"><span>'+m[0]+'</span><strong>'+m[1]+'</strong><span>'+m[2]+'</span></div>').join("")+'</div>'+
 '<h2>你尝试过的调查方式</h2><p>选择“尚无可确认异常” '+questionable+' 次；查看独立来源 '+independent+' 轮；查看未经核实的说法 '+rumor+' 轮；阅读可选方法 '+s.hints+' / 3 条。</p>'+
 '<p>练习之后包括3轮首次调查、3轮新数据调查和2轮跨行业迁移。它们的难度、影响因素和题本形式并未做等价性研究，因此不作前后能力增长推断。</p>'+
 '<h2>这份结果不能判断什么</h2><p>现阶段没有正式信效度、常模、真人样本及专业测评验证。统计操作受既有知识、设备、题目熟悉度和阅读方式影响。不能据此判断智力、职业或天赋。</p>'+
 '<details><summary>展开每一轮的预设数据真相与调查记录</summary><div class="scroll"><table><thead><tr><th>模拟情境</th><th>你的关注</th><th>预设重点</th><th>模拟解释</th><th>已查证据</th></tr></thead><tbody>'+table+'</tbody></table></div></details>'+
 '<div class="btn-row">'+btnExport+btn("重新做一套","restart")+
 '<a class="btn quiet" href="../../explore/">返回108项</a></div>'+
 '<p class="notice">当前调查记录自动保存在本机浏览器，不上传到服务器。只有主动下载才会生成个人JSON文件。</p></section>';
}
function render(){
 if(!validateAll().length){app.innerHTML="<p>数据初始化失败</p>";return;}
 if(s.screen==="intro"){hero();return;}
 if(s.screen==="analyze"){analysis();return;}
 if(s.screen==="evidence"){evidencePage();return;}
 if(s.screen==="decide"){decision();return;}
 if(s.screen==="feedback"){feedback();return;}
 if(s.screen==="learning"){learn();return;}
 if(s.screen==="report"){report();return;}
}
function log(skip=false){
 const c=cur(),t=trial();
 const evaluation=skip?null:evaluate(c,t.focus,t.hypothesis,t.plan);
 s.logs.push({id:c.id,title:c.title,phase:c.phase,skipped:skip,
  focus:t.focus,metric:t.metric,group:t.group,views:[...t.views],
  checks:[...t.checks],hypothesis:t.hypothesis,plan:t.plan,confidence:t.confidence,
  note:t.note,startedAt:t.startAt,submittedAt:new Date().toISOString(),evaluation});
}
function next(){
 if(s.index===8){move("report");return;}
 if(s.index===3){move("learning");return;}
 s.index++;s.trial=newTrial();move("analyze");
}
function skip(){log(true);next();}
function confirmStart(){
 if(hasSaved&&!confirm("开始新体验会替换当前浏览器中未下载的调查记录，是否继续？"))return;
 start();
}
function download(blob,filename){
 const a=document.createElement("a"),url=URL.createObjectURL(blob);
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1800);
}
function exportJSON(){
 const payload={project:"潜星计划",module:77,version:VERSION,startedAt:s.startedAt,
  exportedAt:new Date().toISOString(),hintsViewed:s.hints,
  purpose:"九套合成业务数据的过程式分析探索；不构成正式能力或职业评估",
  nonDiagnostic:true,notValidated:true,privacy:"本机浏览器存储，主动导出，未上传",
  rounds:clone(s.logs),current:{index:s.index,screen:s.screen,trial:clone(s.trial)}};
 download(new Blob([JSON.stringify(payload,null,2)],{type:"application/json;charset=utf-8"}),"潜星计划_第77项_数据调查V2_记录.json");
}
function exportCSV(){
 const c=cur(),t=trial(),data=rows().filter(x=>t.group==="all"||String(x.group)===t.group);
 const cells=[[ "日期","分组",c.columns[0],c.columns[1],c.columns[2],c.columns[3] ],
  ...data.map(r=>[r.day,r.groupName,r.total,r.hits,r.rate.toFixed(4),r.reference])];
 const csv="\ufeff"+cells.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(",")).join("\r\n");
 download(new Blob([csv],{type:"text/csv;charset=utf-8"}),"潜星计划_第77项_"+c.id+"_模拟明细.csv");
}
function chooseDate(date){
 if(!DAYS.includes(date)||s.screen!=="analyze")return;
 s.trial.focus=date;s.trial.lastDay=date;persist();render(); 
}
function switchView(key,value){
 const t=trial();t[key]=value;
 const id=t.group+"-"+t.metric;
 if(!t.views.includes(id))t.views.push(id);
 persist();const scroll=window.scrollY;render();window.scrollTo(0,scroll);
}
app.addEventListener("click",e=>{
 const b=e.target.closest("[data-act]");if(!b||b.disabled||!app.contains(b))return;
 const a=b.dataset.act;
 if(a==="start"||a==="restart")return confirmStart();
 if(a==="resume"){if(!hasSaved)return;render();return;}
 if(a==="day")return chooseDate(b.dataset.day);
 if(a==="none"&&s.screen==="analyze"){s.trial.focus="none";s.trial.lastDay=null;persist();render();return;}
 if(a==="csv")return exportCSV();
 if(a==="clue"&&s.screen==="evidence"){
  const id=b.dataset.id;
  if(EVIDENCE.some(x=>x[0]===id)&&!s.trial.checks.includes(id)&&s.trial.checks.length<3){
   s.trial.checks.push(id);persist();render();
  }return;
 }
 if(a==="hyp"&&s.screen==="decide"){s.trial.hypothesis=b.dataset.id;persist();render();return;}
 if(a==="plan"&&s.screen==="decide"){s.trial.plan=b.dataset.id;persist();render();return;}
 if(a==="json")return exportJSON();
 if(a==="skip"&&["analyze","evidence","decide"].includes(s.screen))return skip();
 if(a==="hint"&&s.screen==="learning"){s.hints=Math.min(3,s.hints+1);move("learning");return;}
 if(a==="continue"&&s.screen==="learning"){s.index=4;s.trial=newTrial();move("analyze");return;}
 if(a==="submit"&&s.screen==="decide"){
  if(!s.trial.hypothesis||!s.trial.plan||s.trial.checks.length<2)return;
  log(false);move("feedback");return;
 }
 if(a==="next"){
  if(s.screen==="analyze"&&s.trial.focus!==null)move("evidence");
  else if(s.screen==="evidence"&&s.trial.checks.length>=2)move("decide");
  else if(s.screen==="feedback")next();
 }
});
app.addEventListener("change",e=>{
 const x=e.target;
 if(s.screen==="analyze"&&x.id==="group"&&["all","0","1"].includes(x.value))switchView("group",x.value);
 else if(s.screen==="analyze"&&x.id==="metric"&&["rate","hits","total","reference"].includes(x.value))switchView("metric",x.value);
 else if(s.screen==="decide"&&x.id==="confidence"){s.trial.confidence=x.value;persist();}
});
app.addEventListener("input",e=>{
 if(s.screen==="decide"&&e.target.id==="note"){s.trial.note=e.target.value.slice(0,1600);persist();}
});
app.addEventListener("keydown",e=>{
 const b=e.target.closest('[data-day][role="button"]');
 if(!b||s.screen!=="analyze")return;
 if(e.key==="Enter"||e.key===" "){e.preventDefault();chooseDate(b.dataset.day);}
});
window.QX_DATA_V2_QA={
 snapshot:()=>({screen:s.screen,index:s.index,id:cur().id,trial:clone(s.trial),rounds:s.logs.length,hints:s.hints}),
 cases:()=>CASES.map(c=>({id:c.id,title:c.title,phase:c.phase,signal:c.signal===null?"none":DAYS[c.signal]})),
 rounds:()=>clone(s.logs),
 getValues:(id,group,metric)=>summarize(makeRows(id),group,metric)
};
if(s.screen==="intro"||!validateResume(s)){s=newState();render();}
else{hasSaved=true;const x=s;s={...x};render();}
