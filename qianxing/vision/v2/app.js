"use strict";
(function(){
const app=document.getElementById("app");
const labels={
 practice:"操作练习",baseline:"首次调查",after:"新材料挑战",
 transfer:"新环境迁移",motion:"动态监控挑战"
};
const kinds={color:"货柜颜色",move:"货物位置",seal:"封条状态",height:"货物高度",missing:"货物数量",none:"没有变化"};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let trials=[],timer=null,timeout=null;
let state={screen:"intro",idx:0,selected:null,logs:[],hintLevel:0,
 observed:0,replays:0,answerStarted:0,observeStarted:0,videoPlays:0,sessionStarted:null};
const current=()=>trials[state.idx];
const pad=n=>String(n).padStart(2,"0");
const asset=name=>"./assets/"+encodeURIComponent(name);
function stopTimers(){if(timer!==null)clearInterval(timer);if(timeout!==null)clearTimeout(timeout);timer=null;timeout=null;}
function progress(){
 const idx=Math.min(state.idx,8),n=Math.max(1,idx);
 const label=idx===0?"操作练习":idx===8?"挑战 8 / 8":"挑战 "+n+" / 8";
 const value=idx===0?0:Math.round(100*idx/8);
 return '<div class="round-head"><span class="eyebrow">'+esc(labels[current().phase])+'</span><span class="step-count">'+label+'</span></div>'+
 '<div class="progress" aria-hidden="true"><span style="width:'+value+'%"></span></div>';
}
function spots(interactive=false,answer=-999){
 const t=current();
 return Object.entries(t.positions).map(([k,xy])=>{
  const i=Number(k),at=esc(xy[0])+"%",top=esc(xy[1])+"%";
  const cls=interactive?"spot"+(state.selected===i?" selected":""):"spot static"+(answer===i?" answer-indicator":"");
  const attr=interactive?' type="button" data-action="pick" data-id="'+i+'" aria-pressed="'+String(state.selected===i)+'" aria-label="选择第'+(i+1)+'区域"':' aria-hidden="true"';
  return (interactive?"<button":"<span")+' class="'+cls+'" style="--x:'+at+';--y:'+top+'"'+attr+'>'+(i+1)+(interactive?"</button>":"</span>");
 }).join("");
}
function photo(t,view,interactive=false,answer=-999){
 const f=view==="A"?t.imageA:t.imageB;
 return '<div class="scene-frame"><img src="'+asset(f)+'" alt="固定相机记录的九个货物区域，供你观察和比较" draggable="false" id="scene-image">'+
 '<span class="photo-label">'+(t.domain==="warehouse"?"仓库":"港口")+' · '+(view==="A"?"原始画面 A":"当前画面 B")+'</span>'+
 spots(interactive,answer)+'</div>';
}
function btn(text,action,kind="",extra=""){
 return '<button type="button" data-action="'+action+'" class="btn '+kind+'" '+extra+'>'+text+'</button>';
}
function renderIntro(){
 const t=trials[0];
 app.innerHTML='<section class="intro"><div class="eyebrow">第 02 项 · V2 深度探索</div>'+
 '<h1>潮汐码头<br>异常货运调查</h1>'+
 '<p class="lead">这一次，你是一名港口观察员。先熟悉监控，再完成第一次调查、学习观察方法，最后进入全新场景和动态监控。不是一道简单选择题。</p>'+
 '<div class="preview"><img src="'+asset(t.imageA)+'" alt="单镜头三维港口货场监控画面"><span class="stamp">PORT INVESTIGATION · 02</span></div>'+
 '<div class="intro-bar">'+btn("进入调查 →","start","primary large")+
 '<span class="small">1轮练习 + 8个挑战场景 · 可以重看 · 不需要账号</span></div>'+
 '<p class="small" style="margin-top:20px">本体验观察细节判断和策略尝试，不提供天赋鉴定。图片由可编辑的三维场景渲染，变化位置有明确记录。</p></section>';
}
function renderObserve(){
 const t=current();
 app.innerHTML=progress()+
 '<h1 class="task-heading">观察原始画面 A</h1>'+
 '<p class="task-instruction">留意货物的位置、形状、颜色和小标记。随后将出现画面 B，请指出真正发生变化的区域。</p>'+
 photo(t,"A")+
 '<div class="trial-footer"><div class="timer"><strong id="time-left">'+t.seconds+'秒</strong><div class="timer-track"><span id="time-bar" style="width:100%"></span></div></div>'+
 btn("看好了，查看画面 B →","advance","primary")+'</div>'+
 '<p class="status-line">货物共 9 个区域。请按实际观察作答，“没有变化”也可能是正确判断。</p>';
 let started=false;
 const go=()=>{
  if(started||state.screen!=="observe")return;
  started=true;state.observeStarted=performance.now();
  timer=setInterval(()=>{
   if(state.screen!=="observe"){stopTimers();return;}
   const remain=Math.max(0,t.seconds-(performance.now()-state.observeStarted)/1000);
   const label=document.getElementById("time-left");
   const bar=document.getElementById("time-bar");
   if(label)label.textContent=Math.ceil(remain)+"秒";
   if(bar)bar.style.width=(100*remain/t.seconds)+"%";
   if(remain<=0)advance();
  },100);
 };
 const img=document.getElementById("scene-image");
 if(img.complete&&img.naturalWidth)go();
 else{img.addEventListener("load",go,{once:true});img.addEventListener("error",()=>app.insertAdjacentHTML("beforeend",'<p class="alert">图片加载失败，请检查网络后刷新页面。</p>'),{once:true});}
}
function renderMask(){
 app.innerHTML=progress()+'<div class="center-page"><span class="eyebrow">画面切换</span><h1>准备查看画面 B</h1><p>观察同一个场景，判断真正变化的位置。并非每一轮都有变化。</p></div>';
 timeout=setTimeout(()=>{state.screen="answer";state.selected=null;state.answerStarted=0;render();},420);
}
function renderAnswer(){
 const t=current();
 app.innerHTML=progress()+
 '<h1 class="task-heading">画面 B：哪里不一样？</h1>'+
 '<p class="task-instruction">点击你认为发生变化的货物编号；如果没有变化，选择“没有变化”。不确定也可以如实记录。</p>'+
 photo(t,"B",true)+
 '<div class="selection">'+btn("没有变化","none",state.selected===-1?"active":"")+
 btn("不确定 / 跳过","unsure",state.selected===-2?"active":"")+
 '<span class="pick-readout" aria-live="polite">'+
 (state.selected===null?"请选择你的判断":state.selected===-1?"已选择：没有变化":state.selected===-2?"已选择：不确定":"已选择：第 "+(state.selected+1)+" 区域")+'</span></div>'+
 '<div class="trial-footer">'+btn("重新查看画面 A","replay","ghost")+
 btn("提交本轮判断 →","submit","primary",state.selected===null?"disabled":"")+'</div>'+
 '<p class="status-line">重看 '+state.replays+' 次。作答时间和重看次数会单独记录，不强制追求速度。</p>';
 const img=document.getElementById("scene-image");
 if(!state.answerStarted){const start=()=>{if(state.screen==="answer"&&!state.answerStarted)state.answerStarted=performance.now()};if(img.complete&&img.naturalWidth)start();else img.addEventListener("load",start,{once:true});}
}
function renderReplay(){
 const t=current();
 app.innerHTML=progress()+'<h1 class="task-heading">再次查看原始画面 A</h1>'+
 '<p class="task-instruction">重看属于正常的调查行为。即将自动回到画面 B。</p>'+
 photo(t,"A")+'<p class="status-line">这次重看将单独记录，不等同于第一次观察。</p>';
 timeout=setTimeout(()=>{state.screen="answer";render();},2500);
}
function renderFeedback(){
 const t=current(),log=state.logs[state.logs.length-1];
 const practice=t.phase==="practice";
 const title=practice?"熟悉操作完成":"已记录这轮判断";
 const detail=practice?'<div class="strategy-card"><h2>练习题的正确变化</h2>'+
 '<p>第 '+(t.target+1)+' 区货柜颜色改变。本轮只帮助你理解操作，不计入前后表现对比。</p></div>'+
 photo(t,"B",false,t.target):
 '<div class="band"><p>本轮不立即公布正确位置，避免答案影响下一轮观察。完整结果会在最后显示，包括正确定位、误报、漏报和不确定。</p></div>';
 app.innerHTML=progress()+'<div class="center-page" style="margin-top:30px"><span class="eyebrow">'+esc(labels[t.phase])+'</span>'+
 '<h1>'+title+'</h1>'+
 '<p>你选择了：'+esc(log.choice===-2?"不确定":log.choice===-1?"没有变化":"第 "+(log.choice+1)+" 区域")+'。</p>'+
 detail+'<div class="next-step">'+btn(state.idx===3?"进入观察方法学习 →":state.idx===7?"进入动态监控 →":state.idx===8?"查看我的完整记录 →":"下一轮 →","next","primary large")+'</div></div>';
}
function renderStrategy(){
 const tips=[
 "第一遍只看大轮廓：哪个区域物体数量、大小或位置发生变化？",
 "第二遍逐区扫描：依次检查上排、中排、下排，不要反复只盯着最显眼的区域。",
 "第三遍看细节和反证：检查封条与小标记，也主动考虑“实际上没有变化”的可能。"
 ];
 app.innerHTML='<div class="center-page" style="margin-top:24px"><span class="eyebrow">第一次调查已记录 · 可选学习阶段</span>'+
 '<h1>换一种观察方法，<br>再试一次。</h1>'+
 '<p>下面不是公布前三题答案，而是提供一种可操作的分区观察策略。你可以逐步查看，也可以跳过学习，直接挑战新场景。</p>'+
 '<div class="strategy-card"><h2>分区检查方法</h2>'+
 (state.hintLevel?'<ol>'+tips.slice(0,state.hintLevel).map(x=>'<li>'+x+'</li>').join("")+'</ol>':'<p class="muted">需要时再打开。查看提示的级别会记录在本次结果中。</p>')+
 (state.hintLevel<3?'<div class="actions">'+btn("查看第 "+(state.hintLevel+1)+" 步","hint","")+'</div>':'')+
 '</div><div class="actions">'+btn(state.hintLevel?"用新方法挑战 →":"不看提示，直接挑战 →","after","primary large")+'</div></div>';
}
function renderMotion(){
 app.innerHTML=progress()+'<h1 class="task-heading">最后一轮：动态监控回放</h1>'+
 '<p class="task-instruction">在固定机位中，一辆叉车从画面经过。它的移动本身不是异常，请观察货物是否有其他变化。</p>'+
 '<div class="video-wrap"><video id="motion-video" controls muted playsinline preload="metadata" poster="'+asset("motion_015.jpg")+'">'+
 '<source src="'+asset("motion.mp4")+'" type="video/mp4">当前浏览器不支持视频播放。</video></div>'+
 '<p class="video-tip">视频约3秒，可根据需要多次回看。请等待播放完成，或点击下方按钮进入标注。</p>'+
 '<div class="trial-footer"><span class="small">已播放 '+state.videoPlays+' 次 · 只检查货物变化，不把正常车辆移动算作异常</span>'+
 btn("标记变化位置 →","motion-pick","primary")+'</div>';
 const v=document.getElementById("motion-video");
 v.addEventListener("play",()=>{state.videoPlays++;const t=document.querySelector(".trial-footer .small");if(t)t.textContent="已播放 "+state.videoPlays+" 次 · 只检查货物变化，不把正常车辆移动算作异常";});
 v.addEventListener("ended",()=>{const b=document.querySelector('[data-action="motion-pick"]');if(b)b.textContent="看完了，标记变化位置 →";});
}
function renderMotionPick(){
 const t=current();
 app.innerHTML=progress()+'<h1 class="task-heading">根据回放定位变化</h1>'+
 '<p class="task-instruction">刚才播放的是固定镜头监控。请指出货物本身发生变化的区域，不要把叉车移动当成答案。</p>'+
 '<div class="scene-frame"><img src="'+asset("motion_015.jpg")+'" draggable="false" alt="动态监控回放的最终一帧">'+
 '<span class="photo-label">视频最后一帧 · 请选择货物编号</span>'+spots(true)+'</div>'+
 '<div class="selection">'+btn("没有变化","none",state.selected===-1?"active":"")+
 btn("不确定 / 跳过","unsure",state.selected===-2?"active":"")+
 '<span class="pick-readout">'+(state.selected===null?"请选择你的判断":state.selected<0?(state.selected===-1?"已选：没有变化":"已选：不确定"):"已选：第 "+(state.selected+1)+" 区域")+'</span></div>'+
 '<div class="trial-footer">'+btn("重新播放监控","motion-replay","ghost")+
 btn("完成调查 →","submit","primary",state.selected===null?"disabled":"")+'</div>';
 if(!state.answerStarted)state.answerStarted=performance.now();
}
function statusName(r){
 if(r.choice===-2)return "不确定";
 if(r.correct)return "定位正确";
 if(r.target===-1&&r.choice>=0)return "误报变化";
 if(r.target>=0&&r.choice===-1)return "漏报变化";
 if(r.target>=0&&r.choice>=0)return "区域不匹配";
 return "未能判断";
}
function renderReport(){
 const official=state.logs.filter(r=>r.phase!=="practice");
 const groups=["baseline","after","transfer","motion"];
 const by=phase=>official.filter(r=>r.phase===phase);
 const correct=phase=>by(phase).filter(r=>r.correct).length;
 const nochange=official.filter(r=>r.target===-1);
 const falseAlarm=nochange.filter(r=>r.choice>=0).length;
 const miss=official.filter(r=>r.target>=0&&r.choice===-1).length;
 const uncertain=official.filter(r=>r.choice===-2).length;
 const images=state.logs.filter(r=>r.replays>0).reduce((sum,r)=>sum+r.replays,0);
 const card=(title,big,small)=>'<div class="metric"><span>'+title+'</span><strong>'+big+'</strong><span>'+small+'</span></div>';
 const rows=official.map(r=>'<tr><td>'+esc(labels[r.phase])+'</td><td>'+esc(r.difficulty)+'</td>'+
 '<td>'+(r.target===-1?"确实无变化":"第 "+(r.target+1)+" 区")+'</td>'+
 '<td>'+esc(statusName(r))+'</td><td>'+r.replays+' 次</td></tr>').join("");
 const practice=state.logs.find(r=>r.phase==="practice");
 const first=correct("baseline"),second=correct("after");
 const contrast=second>first?"后段正确数量较多":second===first?"前后段正确数量相同":"前段正确数量较多";
 const msg="这里只描述本次试验。前后两组的内容及难度尚未通过等价性检验，因此不能把差异直接当作学习能力提高或下降。";
 app.innerHTML='<section class="report"><div class="eyebrow">调查结束 · 可自主保存</div>'+
 '<h1>你完成了一次完整的港口调查。</h1><p class="report-lead">这里记录你实际如何观察、是否使用提示、能否在新环境中完成任务。没有“视觉天赋分数”，也不进行人群排名。</p>'+
 '<div class="metric-grid">'+card("首次调查",first+" / 3","3个独立场景")+
 card("新材料挑战",second+" / 3","3个不同素材")+
 card("跨场景",correct("transfer")+" / 1","仓库新环境")+
 card("动态监控",correct("motion")+" / 1","实际视频回放")+'</div>'+
 '<div class="report-section"><h2>本次观察到了什么</h2><p>比较结果：'+contrast+'。'+msg+'</p>'+
 '<p>无变化题的误报：'+falseAlarm+' 次；有变化题的漏报：'+miss+' 次；不确定：'+uncertain+' 次。</p>'+
 '<p>分区观察策略查看：'+state.hintLevel+' / 3 级；静态画面额外重看：'+images+' 次；动态监控播放：'+state.videoPlays+' 次。</p></div>'+
 '<div class="report-section"><h2>本次不能判断什么</h2>'+
 '<p>这不是标准化视觉能力测验。表现还可能受屏幕尺寸、色彩显示、观察习惯、以前的经历、疲劳、时间限制及题目差异影响。</p>'+
 '<p>如果想了解自己是否持续擅长，应使用全新等价材料在不同日期复测，并结合现实任务，而不是凭这一次贴上“天赋”标签。</p></div>'+
 '<details class="details"><summary>查看每一轮的正确位置与表现</summary>'+
 '<div style="overflow:auto"><table class="result-table"><thead><tr><th>阶段</th><th>场景</th><th>实际情况</th><th>你的表现</th><th>重看</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
 '<p class="small">练习题：'+(practice?.correct?"定位正确":"已完成操作")+'。练习不计入前后比较。</p></details>'+
 '<div class="actions">'+btn("下载本次记录（JSON）","download","primary large")+
 btn("重新体验","restart","")+'<a class="btn ghost" href="../../explore/">返回108项</a></div>'+
 '<p class="small" style="margin-top:20px">数据只在当前浏览器内处理；只有点击下载才会保存到你的设备。再次开始会清空当前页面内的本次成绩。</p></section>';
}
function render(){
 stopTimers();
 switch(state.screen){
 case "intro":renderIntro();break;
 case "observe":renderObserve();break;
 case "mask":renderMask();break;
 case "answer":renderAnswer();break;
 case "replay":renderReplay();break;
 case "feedback":renderFeedback();break;
 case "strategy":renderStrategy();break;
 case "motion":renderMotion();break;
 case "motion-pick":renderMotionPick();break;
 case "report":renderReport();break;
 }
}
function beginRound(i){
 stopTimers();state.idx=i;state.screen=i===8?"motion":"observe";
 state.selected=null;state.replays=0;state.observed=0;state.answerStarted=0;state.observeStarted=0;
 if(i===8)state.videoPlays=0;
 try{localStorage.setItem("qianxing-last-id","2")}catch(e){}
 render();
 if(i<trials.length-1){
  const soon=trials[Math.min(i+1,7)];
  for(const pic of [soon?.imageA,soon?.imageB])if(pic){const im=new Image();im.src=asset(pic);}
 }
}
function advance(){
 if(state.screen!=="observe")return;
 const t=current();
 state.observed=state.observeStarted?Math.min(t.seconds,(performance.now()-state.observeStarted)/1000):0;
 state.screen="mask";render();
}
function submit(){
 if(!["answer","motion-pick"].includes(state.screen)||state.selected===null)return;
 const t=current();
 const log={id:t.id,phase:t.phase,difficulty:t.difficulty,
 target:t.target,change:t.type,choice:state.selected,
 correct:state.selected===t.target,
 observedSeconds:Math.round(state.observed*10)/10,
 answerSeconds:state.answerStarted?Math.round((performance.now()-state.answerStarted)/100)/10:null,
 replays:state.replays,
 videoPlays:t.phase==="motion"?state.videoPlays:null};
 state.logs.push(log);
 state.screen="feedback";render();
}
function next(){
 if(state.screen!=="feedback")return;
 if(state.idx===3){state.screen="strategy";render();return;}
 if(state.idx===8){state.screen="report";render();return;}
 beginRound(state.idx+1);
}
function exportReport(){
 const data={
 project:"潜星计划",prototype:"潮汐码头-V2-20261029",
 notDiagnosis:true,validity:"未建立常模、信度、效度或前后题组等价性",
 media:"3D Blender deterministic render",sessionStarted:state.sessionStarted,
 sessionExported:new Date().toISOString(),hintsViewed:state.hintLevel,
 results:state.logs.map(x=>({...x})),
 privacy:"仅在本次浏览器会话中处理；自主导出"
 };
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="潜星计划_潮汐码头_V2_探索记录.json";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
app.addEventListener("click",e=>{
 const b=e.target.closest("[data-action]");if(!b||b.disabled||!app.contains(b))return;
 const act=b.dataset.action;
 if(act==="start"||act==="restart"){
  state={screen:"intro",idx:0,selected:null,logs:[],hintLevel:0,observed:0,replays:0,answerStarted:0,observeStarted:0,videoPlays:0,sessionStarted:new Date().toISOString()};
  beginRound(0);
 }else if(act==="advance")advance();
 else if(act==="pick"&&["answer","motion-pick"].includes(state.screen)){
  state.selected=Number(b.dataset.id);render();
 }else if(act==="none"&&["answer","motion-pick"].includes(state.screen)){state.selected=-1;render();}
 else if(act==="unsure"&&["answer","motion-pick"].includes(state.screen)){state.selected=-2;render();}
 else if(act==="replay"&&state.screen==="answer"){state.replays++;state.screen="replay";render();}
 else if(act==="submit")submit();
 else if(act==="next")next();
 else if(act==="hint"&&state.screen==="strategy"){state.hintLevel=Math.min(3,state.hintLevel+1);render();}
 else if(act==="after"&&state.screen==="strategy")beginRound(4);
 else if(act==="motion-pick"&&state.screen==="motion"){state.selected=null;state.answerStarted=0;state.screen="motion-pick";render();}
 else if(act==="motion-replay"&&state.screen==="motion-pick"){state.screen="motion";render();}
 else if(act==="download"&&state.screen==="report")exportReport();
});
window.addEventListener("pagehide",stopTimers);
window.QX_V2_QA={
 snapshot:()=>({screen:state.screen,idx:state.idx,selected:state.selected,logs:state.logs.length,hints:state.hintLevel,videoPlays:state.videoPlays,trial:current()?.id}),
 trials:()=>trials.map(t=>({id:t.id,phase:t.phase,target:t.target})),
 getLogs:()=>state.logs.map(x=>({...x}))
};
fetch("./assets/manifest.json?v=20261029v2",{cache:"no-store"}).then(async r=>{
 if(!r.ok)throw Error("素材目录 HTTP "+r.status);
 return r.json();
}).then(data=>{
 if(!data.trials||data.trials.length!==9)throw Error("题本数量错误");
 trials=data.trials;
 try{localStorage.setItem("qianxing-last-id","2")}catch(e){}
 render();
}).catch(err=>{
 app.innerHTML='<div class="center-page"><h1>素材暂时无法载入</h1><p>'+esc(err.message)+'</p><button class="btn primary" type="button" onclick="location.reload()">重新加载</button></div>';
});
})();
