"use strict";
import {TASKS,calculate,validTask,MODULE_MM} from "./gear-core.mjs";
let GearViewer=null,viewerErr="";
try{({GearViewer}=await import("./viewer.mjs"))}catch(e){viewerErr=String(e)}
const app=document.getElementById("app");
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=x=>JSON.parse(JSON.stringify(x));
const dir=x=>x===1?"顺时针":"逆时针",num=x=>Number(x).toFixed(1).replace(/\.0$/,"");
const phases={practice:"操作练习",baseline:"首次排故",after:"新故障挑战",transfer:"跨情境综合"};
let s={screen:"intro",idx:0,config:null,runs:[],last:null,logs:[],hints:0,adjusts:0,started:null,t0:0,playing:false},view=null;
const t=()=>TASKS[s.idx];
const btn=(text,act,kind="",extra="")=>'<button type="button" data-action="'+act+'" class="btn '+kind+'" '+(extra||"")+'>'+text+'</button>';
function dispose(){view?.dispose();view=null}
function stageHead(){return '<div class="stage-top"><span class="badge">'+phases[t().phase]+'</span><span class="small">'+(s.idx?"第 "+s.idx+" / 8 个正式挑战":"操作练习")+'</span></div><div class="progress"><span style="width:'+Math.round(s.idx/8*100)+'%"></span></div>'}
function intro(){
 app.innerHTML='<section class="hero"><div class="hero-grid"><div><span class="badge">第72项 · 机械结构 · V2深度探索</span><h1>进入机械传动<br>故障实验室。</h1><p class="lead">这次不是填答案，而是亲自更换齿轮、配置惰轮、试运行机器、分析故障。后面将进入两级复合减速装置和新的包装线。</p><div class="action-group">'+btn("开始故障调查 →","start","primary large")+'<span class="small">一轮操作练习 + 八轮不同工况的排故挑战</span></div><p class="note" style="margin-top:18px">三维可自由旋转。不需要账号；测试结果只在当前页面保留，可主动导出。</p></div><div class="hero-photo"><video controls playsinline muted preload="metadata" poster="./assets/gear_hero.jpg" aria-label="Blender制作的单镜头齿轮机构动画"><source src="./assets/gear_motion.mp4" type="video/mp4">当前浏览器不支持MP4播放。</video></div></div><div class="intro-cards"><div><strong>自主观察</strong>先自己试出设备运行情况</div><div><strong>学习和修改</strong>根据异常读数重新调整机构</div><div><strong>新的场景</strong>在没见过的传动机构上再试一次</div></div></section>';
}
function sel(k,label,vals,v){return '<div class="control"><label for="f-'+k+'">'+label+'</label><select id="f-'+k+'" data-field="'+k+'">'+vals.map(x=>'<option value="'+String(x)+'"'+(x===v?' selected':'')+'>'+(typeof x==="boolean"?(x?"安装":"不安装"):x+" 齿")+'</option>').join("")+'</select></div>'}
function form(){const a=t(),c=s.config;if(a.kind==="compound")return sel("zB","一级从动齿轮 B",a.options.zB,c.zB)+sel("zC","二级主动齿轮 C（与 B 同轴）",a.options.zC,c.zC)+sel("zOut","输出齿轮 D",a.options.zOut,c.zOut);return sel("zOut","输出齿轮",a.options.zOut,c.zOut)+sel("idler","中间惰轮",a.options.idler,c.idler)+(c.idler?sel("zMid","惰轮齿数",a.options.zMid,c.zMid):"")}
const emptyMeter=()=>'<div class="readout"><p class="readout-title">模拟检测台</p><div class="small">更换齿轮后点击「试运行并测量」，检查输出转速、转向和轴心跨度。</div></div>';
function meter(){const box=document.getElementById("readout");if(!box)return;if(!s.last){box.innerHTML=emptyMeter();return}const m=s.last.metrics;const metric=(name,val,ok)=>'<div class="metric '+(ok?"ok":"no")+'">'+name+'<b>'+val+" "+(ok?"✓":"×")+'</b></div>';box.innerHTML='<div class="readout"><p class="readout-title">第 '+s.runs.length+' 次试运行的仪表读数</p><div class="metrics">'+metric("输出转速",num(m.outputRpm)+" rpm",m.checks.speed)+metric("输出转向",dir(m.outputDir),m.checks.direction)+metric("首尾轴心跨度",num(m.span)+" mm",m.checks.span)+'<div class="metric">理想总减速比<b>'+num(m.ratio)+':1</b></div></div><p class="result-flag '+(m.pass?"":"warning")+'">'+(m.pass?"当前方案满足全部三项约束。":"还有工作约束未满足，请根据仪表继续调整。")+'</p><p class="machine-note">无损理想模型；不含真实齿轮强度、轴承、加工误差。动画按相同比例慢放。</p></div>'}
function taskPage(){
 const x=t(),c=s.config;app.innerHTML=stageHead()+'<h1 class="task-title">'+esc(x.title)+'</h1><p class="task-info">'+esc(x.description)+'</p>'+
 '<div class="workbench"><section class="three-card"><div class="three-top"><strong>'+esc(x.machine)+'</strong><span>拖动三维视角 / 滚轮缩放</span></div><div id="viewport" class="viewport" role="img" aria-label="可自由旋转的机械传动三维模型"></div>'+
 '<div class="camera-help"><span>输入A：'+x.inputZ+' 齿 · 模数 '+MODULE_MM+' mm</span><span>慢放动画</span></div><div class="tech-spec"><div>电机输入<strong>'+x.motorRpm+' rpm</strong></div><div>输入旋向<strong>'+dir(x.motorDir)+'</strong></div><div>轴位置<strong>直线滑轨可调</strong></div></div></section>'+
 '<section class="console-card"><h2 class="panel-title">工况目标</h2><div class="goal-grid"><div class="goal"><span>输出速度</span><strong>'+x.targetRpm+' rpm</strong></div><div class="goal"><span>输出方向</span><strong>'+dir(x.targetDir)+'</strong></div><div class="goal"><span>轴心跨度≤</span><strong>'+x.maxSpan+' mm</strong></div></div>'+
 '<h2 class="panel-title">选择配件 · 维修机构</h2><div class="control-list" id="fields">'+form()+'</div>'+
 '<div class="controls-foot">'+btn("试运行并测量","test","primary")+btn("复位","reset","subtle")+btn(s.playing?"暂停动画":"继续动画","play","subtle",s.last?"":"disabled")+'</div>'+
 '<div id="readout">'+emptyMeter()+'</div></section></div>'+
 '<div class="navigation"><div class="small">允许多次试运行，也允许多个合格方案；不强制追求速度。</div>'+
 '<div class="right">'+btn("本轮跳过","skip","subtle")+btn("提交维修方案 →","submit","",s.last?"":"disabled")+'</div></div>';
 if(GearViewer){
   view=new GearViewer(document.getElementById("viewport"),{onError:e=>console.warn(e)});
   view.setConfig(x,c);if(s.playing&&s.last)view.setRunning(true,s.last.metrics);
 }else document.getElementById("viewport").innerHTML='<div class="webgl-fallback">三维模块不可用，右侧的物理试运行计算仍可完成。'+esc(viewerErr.slice(0,100))+'</div>';
 if(s.last)meter();
}
function feedback(){
 const m=s.last?.metrics,ok=!!m?.pass;
 app.innerHTML=stageHead()+'<section class="feedback"><span class="badge">'+phases[t().phase]+' · 维修方案记录</span><h1>'+(ok?"这套方案满足要求。":"这套方案仍有待解决的问题。")+'</h1>'+
 '<p>本轮试运行 '+s.runs.length+' 次，调整配件 '+s.adjusts+' 次。</p><div class="status-card '+(ok?"success":"warning")+'"><h2>'+esc(t().machine)+'</h2>'+
 (m?'<p>输出速度：'+(m.checks.speed?"符合":"不符合")+'</p><p>输出方向：'+(m.checks.direction?"符合":"不符合")+'</p><p>轴心跨度：'+(m.checks.span?"符合":"不符合")+'</p>':"<p>未完成测量</p>")+'</div>'+
 '<div class="action-group">'+(!ok?btn("返回重新排故","repair"):"")+btn(s.idx===0?"开始正式排故 →":s.idx===3?"查看可选学习 →":s.idx===8?"查看完整报告 →":"下一轮 →","accept","primary large")+'</div>'+
 '<p class="small" style="margin-top:25px">这里只记录本轮是否满足已知工程约束，不根据单次表现推断天赋。</p></section>';
}
const rule=[
 ['外啮合齿轮的相邻齿轮旋向相反','A→B是反向；A→惰轮→B经过两次啮合恢复同向。'],
 ['惰轮不会改变单链条的最终速比','n输出=n输入×Z输入/Z输出；改变惰轮齿数会改变轴距，但最终速比不变。'],
 ['复合传动要逐级计算','B与C同轴转动；nD=nA×ZA/ZB×ZC/ZD。标准节圆中心距 a=m(Z1+Z2)/2。']
];
function learning(){
 app.innerHTML='<section class="learning"><span class="badge">首次3轮已经记录 · 选择性学习</span><h1>换一套机构，<br>还能完成吗？</h1><p>新的任务将采用新齿数组合，并进入双层齿轮传动。可以逐条学习，也可以不看提示直接进入挑战。</p>'+
 '<div class="status-card"><h2>可选择查看的传动规律</h2>'+(s.hints?'<ol class="learning-list">'+rule.slice(0,s.hints).map(([a,b],i)=>'<li><b>'+(i+1)+". "+a+"</b><div>"+b+"</div></li>").join("")+'</ol>':"<p>当前没有查看提示，学习阶段可以自由跳过。</p>")+
 (s.hints<3?btn("查看第 "+(s.hints+1)+" 条提示","hint"):"")+'</div><div class="action-group">'+btn("进入新故障挑战 →","after","primary large")+'</div><p class="small" style="margin-top:25px">物理关系参考齿轮技术资料；本模型不提供真实机床零件加工或强度验算。</p></section>';
}
function log(skipped=false){
 const a=t(),m=s.last?.metrics;
 s.logs.push({id:a.id,phase:a.phase,title:a.title,kind:a.kind,initial:clone(a.initial),final:clone(s.config),
  constraints:{outputRpm:a.targetRpm,outputDirection:a.targetDir,maxSpanMm:a.maxSpan},
  succeeded:!skipped&&!!m?.pass,skipped,
  checks:m?clone(m.checks):null,measured:m?{rpm:m.outputRpm,dir:m.outputDir,spanMm:m.span}:null,
  attempts:s.runs.length,adjustments:s.adjusts,
  elapsedSeconds:Math.round((performance.now()-s.t0)/1000),
  trialData:s.runs.map(r=>({config:clone(r.config),outputRpm:r.metrics.outputRpm,dir:r.metrics.outputDir,spanMm:r.metrics.span,pass:r.metrics.pass}))});
}
function begin(n){
 dispose();s.idx=n;s.config=clone(t().initial);s.screen="task";s.runs=[];s.last=null;s.adjusts=0;s.t0=performance.now();s.playing=false;
 try{localStorage.setItem("qianxing-last-id","72")}catch(e){}
 taskPage();
}
function next(){
 dispose();if(s.idx===8){s.screen="report";report();return}
 if(s.idx===3){s.screen="learning";learning();return}
 begin(s.idx+1);
}
function report(){
 const a=s.logs.filter(x=>x.phase!=="practice"),c=p=>a.filter(x=>x.phase===p&&x.succeeded).length;
 const b=c("baseline"),f=c("after"),total=a.reduce((sum,x)=>sum+x.attempts,0),skips=a.filter(x=>x.skipped).length;
 app.innerHTML='<section class="report"><span class="badge">第72项 · 机械故障实验室 · 完成记录</span><h1>你完成了一轮机械结构探索。</h1><p class="lead">从初次排故到复合机械、陌生设备，系统记录你如何测试和修复。不是一个神秘天赋分数。</p>'+
 '<div class="report-grid"><div class="report-item"><span>首次排故</span><strong>'+b+' / 3</strong></div><div class="report-item"><span>新故障</span><strong>'+f+' / 3</strong></div><div class="report-item"><span>综合迁移</span><strong>'+c("transfer")+' / 2</strong></div><div class="report-item"><span>试运行次数</span><strong>'+total+'</strong></div></div>'+
 '<div class="report-section"><h2>本次能观察到什么</h2><p>查看可选提示 '+s.hints+' / 3 条，跳过 '+skips+' 轮。每个维修方案分别按目标转速、方向和轴心跨度判断。</p><p>'+(f>b?"新任务完成数量较多。":f===b?"前后完成数量相同。":"首次阶段完成数量较多。")+'两组任务难度尚未经等价性检验，不能简单归因为学习能力变化。</p></div>'+
 '<div class="report-section"><h2>本次不能判断什么</h2><p>没有测量真实齿轮制造、装配、强度和工业安全水平；机器只模拟理想无损传动。设备、熟悉度和试错习惯可能影响结果。</p><p>目前没有科学常模、信度与效度研究，不应根据本次结果判定先天天赋。</p></div>'+
 '<details><summary>展开每一轮的记录</summary><div class="table-scroll"><table><thead><tr><th>任务</th><th>结果</th><th>试运行</th><th>调整</th></tr></thead><tbody>'+
 a.map(x=>'<tr><td>'+esc(x.title)+'</td><td>'+(x.skipped?"跳过":x.succeeded?"达到约束":"未全部达到")+'</td><td>'+x.attempts+'</td><td>'+x.adjustments+'</td></tr>').join("")+'</tbody></table></div></details>'+
 '<div class="action-group">'+btn("下载本次记录（JSON）","download","primary large")+btn("重新体验","restart")+'<a class="btn subtle" href="../../explore/">返回108项</a></div>'+
 '<p class="small" style="margin-top:23px">数据只在此页面处理，不上传；只有点击下载才会保存本次操作记录。关闭或刷新不会保留本次成绩。</p></section>';
}
function exportJSON(){
 const body={project:"潜星计划",id:72,version:"gear-v2-20261029",purpose:"探索性机械故障处理练习，不构成天赋诊断",notDiagnosis:true,model:"模数2、20°渐开线外观；无损平行轴直齿轮，忽略载荷强度和加工公差",startedAt:s.started,exportedAt:new Date().toISOString(),hintsViewed:s.hints,results:clone(s.logs)};
 const blob=new Blob([JSON.stringify(body,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="潜星计划_第72项_机械传动V2_操作记录.json";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1300);
}
app.addEventListener("change",e=>{
 const field=e.target.closest("[data-field]");if(!field||s.screen!=="task")return;
 const k=field.dataset.field,v=k==="idler"?field.value==="true":Number(field.value);
 if(!t().options[k]?.includes(v)||v===s.config[k])return;
 s.config[k]=v;s.adjusts++;s.last=null;s.playing=false;
 if(k==="idler")document.getElementById("fields").innerHTML=form();
 meter();document.querySelector('[data-action="submit"]').disabled=true;
 const a=document.querySelector('[data-action="play"]');a.disabled=true;a.textContent="继续动画";
 view?.setConfig(t(),s.config);view?.setRunning(false);
});
app.addEventListener("click",e=>{
 const control=e.target.closest("[data-action]");if(!control||control.disabled||!app.contains(control))return;
 const a=control.dataset.action;
 if(a==="start"||a==="restart"){
  dispose();s={screen:"intro",idx:0,config:null,runs:[],last:null,logs:[],hints:0,adjusts:0,started:new Date().toISOString(),t0:0,playing:false};begin(0);
 }else if(a==="test"&&s.screen==="task"){
  const result=calculate(t(),s.config);s.last={metrics:result,config:clone(s.config)};
  s.runs.push(s.last);s.playing=true;meter();view?.setRunning(true,result);
  document.querySelector('[data-action="submit"]').disabled=false;
  const button=document.querySelector('[data-action="play"]');button.disabled=false;button.textContent="暂停动画";
 }else if(a==="reset"&&s.screen==="task"){
  s.adjusts++;s.config=clone(t().initial);s.last=null;s.playing=false;dispose();taskPage();
 }else if(a==="play"&&s.screen==="task"&&s.last){
  s.playing=!s.playing;view?.setRunning(s.playing,s.last.metrics);control.textContent=s.playing?"暂停动画":"继续动画";
 }else if(a==="submit"&&s.screen==="task"&&s.last){s.screen="feedback";dispose();feedback();}
 else if(a==="repair"&&s.screen==="feedback"){s.screen="task";s.playing=false;taskPage();}
 else if(a==="skip"&&s.screen==="task"){log(true);next();}
 else if(a==="accept"&&s.screen==="feedback"){log(false);next();}
 else if(a==="hint"&&s.screen==="learning"){s.hints=Math.min(3,s.hints+1);learning();}
 else if(a==="after"&&s.screen==="learning")begin(4);
 else if(a==="download"&&s.screen==="report")exportJSON();
});
window.addEventListener("pagehide",dispose);
window.QX_GEAR_V2_QA={
 snapshot:()=>({screen:s.screen,idx:s.idx,task:t().id,config:clone(s.config),last:s.last?{metrics:clone(s.last.metrics)}:null,attempts:s.runs.length,logs:s.logs.length,hints:s.hints,viewer:!!view?.ready}),
 cases:()=>TASKS.map(x=>({id:x.id,phase:x.phase,valid:validTask(x),goal:{rpm:x.targetRpm,dir:x.targetDir,span:x.maxSpan}})),
 logs:()=>clone(s.logs)
};
if(TASKS.every(validTask))intro();else app.innerHTML='<p>题本初始化异常，请联系维护人员。</p>';
