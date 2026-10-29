"use strict";
import {VERSION,WORK_KEYS,PHASES,COLORS,WIDTH,HEIGHT,newProject,ensureWork,
 safeProject,undo,redo,delta,workStats,projectSummary} from "./paint-core.mjs";
import {Painter,workPNG} from "./painter.mjs";
const app=document.getElementById("app");
const importInput=document.getElementById("import-project");
const KEY="qianxing-paint-v2-local-project";
const img=name=>"./assets/"+encodeURIComponent(name);
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeFilename=x=>String(x).replace(/[\\/:*?"<>|]/g,"_");
let project=newProject(),phase="intro",saved=null,painter=null,lastMessage="";
try{
 const raw=localStorage.getItem(KEY);
 if(raw)saved=safeProject(JSON.parse(raw));
}catch(e){console.warn("无法恢复本地草稿",String(e))}
const stage=k=>PHASES.find(x=>x.id===k);
const active=()=>WORK_KEYS.includes(phase)?ensureWork(project,phase):null;
const label=x=>x==="practice"?"练习":x==="baseline"?"第一次画作":x==="reviseApple"?"苹果暖光修改":x==="transfer"?"新静物画作":"梨与蓝杯暖光修改";
const btn=(s,action,type="",extra="")=>'<button class="btn '+type+'" type="button" data-action="'+action+'" '+extra+'>'+esc(s)+'</button>';
const thin=()=>'<div class="small">每张独立画作都可单独导出PNG，也能导出包含笔画坐标的JSON项目，稍后继续编辑。</div>';
function persist(){
 project.step=phase;project.updatedAt=new Date().toISOString();
 try{localStorage.setItem(KEY,JSON.stringify(project));saved=safeProject(project);return true;}
 catch(e){message("本机保存空间不足。请先主动下载项目JSON，避免关闭页面后遗失。");return false;}
}
function message(s){
 lastMessage=s;
 const el=document.querySelector("#status");
 if(el)el.textContent=s;
}
function destroy(){painter?.dispose();painter=null}
function move(to){
 destroy();phase=to;
 if(to==="practice")window.QX_PROGRESS?.start(6);
 if(WORK_KEYS.includes(to))ensureWork(project,to);
 persist();render();window.scrollTo({top:0,behavior:"instant"});
}
function home(){
 const has=!!saved;
 app.innerHTML='<div class="home"><section><span class="eyebrow">潜星计划 · 第 06 项 · 真实绘画探索 V2</span>'+
 '<h1>画一幅，<br>再亲手改好它。</h1>'+
 '<p>不是回答审美选择题。用自己的画笔完成静物，随后观察光照变化，在原画上修改；最后换一个新的对象再创作。</p>'+
 '<div class="button-row">'+btn("开始新的绘画探索 →","start","primary large")+
 (has?btn("继续本机草稿","resume"):"")+btn("导入之前的项目","import","quiet")+'</div>'+
 '<p class="small" style="margin-top:23px">一轮练笔 + 四个创作阶段，可暂停、撤回、改稿。结果只描述操作与作品，不判定艺术天赋。</p></section>'+
 '<div class="home-photo"><img src="'+img("A_苹果_冷调左光.jpg")+'" alt="Blender渲染的单镜头苹果与花瓶静物"/></div></div>'+
 '<div class="home-info"><div><strong>第一张</strong>亲手观察造型和色彩</div><div><strong>在原画上修改</strong>光源从冷调变成暖调</div><div><strong>换一幅新静物</strong>用新的对象检验创作方法</div></div>';
}
function workRequirement(w,key){
 if(!w||w.skipped)return false;
 if(!w.strokes.length)return false;
 const config=stage(key);
 if(!config?.base)return true;
 return delta(project.works[config.base],w).changed;
}
function progress(){
 const n=stage(phase)?.number||0;
 return '<div class="progress-head"><span class="eyebrow">'+esc(stage(phase)?.label||"")+" · "+(phase==="practice"?"自由练笔":"第 "+n+" / 4 阶段")+'</span>'+
 '<span class="small">'+esc(stage(phase)?.kind==="revision"?"在原画上直接修改":stage(phase)?.kind==="practice"?"练习可跳过":"独立创作")+'</span></div>'+
 '<div class="progress"><span style="width:'+Math.round(n/4*100)+'%"></span></div>';
}
function toolsUI(w){
 const list=[["brush","画笔"],["pencil","铅笔"],["marker","马克笔"],["eraser","橡皮"]];
 return '<div class="toolbar"><div class="tools-title">画笔工具</div><div class="tool-row" id="toolrow">'+list.map(([id,t])=>
 '<button class="tool-button '+(w.tool===id?"active":"")+'" type="button" data-tool="'+id+'" aria-pressed="'+String(w.tool===id)+'">'+t+'</button>').join("")+'</div>'+
 '<div class="tools-title">颜色</div><div class="colors" id="colors">'+COLORS.map(x=>
 '<button type="button" class="color '+(x===w.color?"selected":"")+(x==="#ffffff"?" white":"")+'" style="--color:'+x+'" data-color="'+x+'" aria-label="使用'+x+'颜色" aria-pressed="'+String(x===w.color)+'"></button>').join("")+
 '<label class="color-picker" for="customcolor">更多颜色 <input id="customcolor" type="color" value="'+esc(w.color)+'" aria-label="自定义笔画颜色"></label></div>'+
 '<div class="slider-row"><label for="brushsize"><span>笔画粗细<output id="size-value">'+w.size+' px</output></span><input id="brushsize" type="range" min="1" max="65" step="1" value="'+w.size+'"></label>'+
 '<label for="opacity"><span>透明度<output id="opacity-value">'+Math.round(w.opacity*100)+'%</output></span><input id="opacity" type="range" min="10" max="100" step="5" value="'+Math.round(w.opacity*100)+'"></label></div>'+
 '<div class="editor-actions">'+btn("撤回","undo","",w.strokes.length?"":"disabled")+
 btn("重做","redo","",w.redo.length?"":"disabled")+
 btn("辅助网格","grid",w.guide?"primary":"")+
 btn("清空这张","clear","danger")+
 btn("导出当前PNG","png")+
 '</div></div>';
}
function editor(){
 const d=stage(phase),w=active(),reference=d.img;
 const revision=d.kind==="revision";
 let revisionText="";
 if(revision){
  const changes=delta(project.works[d.base],w);
  revisionText='你正在编辑上一版的笔画。当前新添 '+changes.added+' 笔、撤销原笔画 '+changes.removed+' 笔；'+
  (changes.changed?"已产生可记录的修改。":"请实际修改至少一笔后再完成本阶段。");
 }
 app.innerHTML=progress()+'<h1 class="stage-title">'+esc(d.subject)+'</h1>'+
 '<p class="stage-sub">'+esc(d.short)+'</p>'+
 '<div class="workspace"><section class="work-card"><div class="card-head"><strong>独立静物参考</strong><span>真实3D模型渲染 · 非作品图层</span></div>'+
 '<img class="reference" src="'+img(reference)+'" alt="'+esc(d.subject)+'单场景静物参考照片">'+
 '<div class="reference-foot"><b>本阶段观察目标</b><p>'+esc(d.goal)+'</p>'+
 '<p>'+ (revision?'同一静物的光源和色彩已改变；你可以保留构图，但需要亲手修改作品。':'参考图只是观察素材，可自由选取色彩和布局，不限制画风。')+
 '</p></div></section>'+
 '<section class="work-card"><div class="card-head"><strong>你的独立作品画布</strong><span>960 × 600 px · 手绘记录</span></div>'+
 '<div class="paper '+(w.guide?"grid-on":"")+'" id="paper"><canvas id="draw" width="960" height="600" aria-label="可用鼠标、触屏或手写笔自由绘画的单一场景画布"></canvas></div>'+
 '<div class="canvas-foot"><span id="stroke-count">'+w.strokes.length+' 笔 · 保存于本机浏览器</span><span>参考图不会进入导出的PNG</span></div>'+
 toolsUI(w)+'</section></div>'+
 (revision?'<div class="message" id="delta-msg">'+esc(revisionText)+'</div>':"")+
 '<div class="note-area"><label for="worknote">本阶段的一句创作记录（可选）<textarea id="worknote" rows="3" maxlength="2500" placeholder="想表达什么？哪些光影或配色是你自己决定的？">'+esc(w.note)+'</textarea></label>'+
 '<div class="button-row">'+btn("保存项目JSON","json","quiet")+
 btn("跳过此阶段","skip","quiet")+
 btn(phase==="revisePear"?"完成并查看作品 →":"完成这一步 →","complete","primary",workRequirement(w,phase)?"":"disabled")+'</div></div>'+
 '<div class="status" id="status">'+esc(lastMessage||"触摸或按住鼠标在画布上绘制。撤回、重做只改变当前作品。")+'</div>';
 const canvas=document.getElementById("draw");
 painter=new Painter(canvas,project,()=>active(),{onCommit:()=>{
  persist();updateToolbar();message("新笔画已保存到当前浏览器。");
 },onError:message});
 updateToolbar();
}
function updateToolbar(){
 const w=active();if(!w)return;
 const count=document.getElementById("stroke-count");
 if(count)count.textContent=w.strokes.length+" 笔 · 保存于本机浏览器";
 const complete=document.querySelector('[data-action="complete"]');
 if(complete)complete.disabled=!workRequirement(w,phase);
 const undo=document.querySelector('[data-action="undo"]'),red=document.querySelector('[data-action="redo"]');
 if(undo)undo.disabled=w.strokes.length===0;
 if(red)red.disabled=w.redo.length===0;
 for(const a of document.querySelectorAll("[data-tool]")){
  const selected=a.dataset.tool===w.tool;a.classList.toggle("active",selected);a.setAttribute("aria-pressed",String(selected));
 }
 for(const a of document.querySelectorAll("[data-color]")){
  const selected=a.dataset.color.toLowerCase()===w.color.toLowerCase();a.classList.toggle("selected",selected);
  a.setAttribute("aria-pressed",String(selected));
 }
 const c=document.getElementById("customcolor");if(c)c.value=w.color;
 const grid=document.getElementById("paper");if(grid)grid.classList.toggle("grid-on",!!w.guide);
 const gb=document.querySelector('[data-action="grid"]');if(gb)gb.classList.toggle("primary",!!w.guide);
 const rev=stage(phase);
 if(rev?.base){
  const e=delta(project.works[rev.base],w);
  const el=document.getElementById("delta-msg");if(el)
   el.textContent="当前相对原画：新添 "+e.added+" 笔、移除 "+e.removed+" 笔。"+
      (e.changed?"你已作出修改，可完成本轮。":"请至少作出一次实际修改后，再继续。");
 }
}
function learn(){
 const hints=[
  "先观察明暗关系：确定主光源方向，再分成亮面、中间调和暗面。并不是所有区域都需要勾边。",
  "选择一组主要色彩：用少量冷色和暖色建立视觉重点，同时考虑物体本色与光照色的差异。",
  "改稿不要只重画：保留有用的构图，针对新任务逐项修订，比较改动前后哪些选择更能表达你的目的。"
 ];
 app.innerHTML='<section class="learn"><span class="eyebrow">已保存第一次画作和暖光修改 · 可选学习</span>'+
 '<h1>一幅画的变化，<br>来自你如何观察和修改。</h1>'+
 '<p>接下来会换成梨与蓝色杯子。你可以查看观察、配色和改稿的三个方法，也可以不看提示直接挑战新静物。</p>'+
 '<div class="tip-card"><h2>观察—配色—修改</h2>'+
 (project.hints?'<ol>'+hints.slice(0,project.hints).map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol>':
 '<p>目前没有展开任何提示。是否学习完全由你决定。</p>')+
 (project.hints<3?'<div class="button-row">'+btn("查看第 "+(project.hints+1)+" 条方法","hint")+'</div>':"")+
 '</div><div class="button-row">'+btn("进入新静物挑战 →","continue","primary large")+
 btn("下载当前项目JSON","json","quiet")+'</div>'+
 '<p class="small" style="margin-top:24px">表现变化可能受到练习、参考图难度、设备、画笔熟悉度的影响，不能凭一轮进步判断艺术天赋。</p></section>';
}
function report(){
 const m=projectSummary(project),works=project.works;
 window.QX_PROGRESS?.finish(6,project.startedAt,{done:m.completedWorks,total:4,skipped:4-m.completedWorks});
 const cards=[
 ["完成的独立作品",m.completedWorks+" / 4","各阶段独立保存，不拼图"],
 ["苹果作品修订",m.appleDelta.added+" 笔","新增笔画；可能也删除原有笔画"],
 ["新静物作品修订",m.pearDelta.added+" 笔","换对象后的改稿记录"],
 ["可选学习方法",m.hints+" / 3","自愿查看的提示条数"]
 ];
 const list=["baseline","reviseApple","transfer","revisePear"].map((key,i)=>{
  const w=works[key],n=workStats(w),available=w&&!w.skipped&&w.strokes.length>0;
  return '<div class="portfolio-item"><div class="description"><b>'+String(i+1).padStart(2,"0")+' · '+esc(label(key))+'</b>'+
   '<span>'+n.strokes+" 笔 · "+n.colorFamilies.length+" 个色彩类别 · "+(n.skipped?"未制作":"独立场景")+'</span></div>'+
   btn("下载这张PNG","png-work","",available?'data-key="'+key+'"':'disabled')+'</div>';
 }).join("");
 const rows=["baseline","reviseApple","transfer","revisePear"].map(key=>{
  const st=workStats(works[key]);
  return '<tr><td>'+esc(label(key))+'</td><td>'+st.strokes+'</td><td>'+st.points+'</td><td>'+st.colors.length+'</td>'+
  '<td>'+st.undo+'</td><td>'+st.timeSeconds+' 秒</td></tr>';
 }).join("");
 app.innerHTML='<section class="report"><div class="eyebrow">第06项 · 绘画素描色彩 · 本次作品记录</div>'+
 '<h1>画作和修改过程，<br>已经分别保留下来。</h1>'+
 '<p>这里记录的是你真正画了哪些笔、用了哪些颜色、是否根据新任务修改作品。系统不会自动评价画得好不好，也不判断你是否具有先天艺术天赋。</p>'+
 '<div class="metrics">'+cards.map(x=>'<div class="metric"><span>'+x[0]+'</span><strong>'+x[1]+'</strong><span>'+x[2]+'</span></div>').join("")+'</div>'+
 '<div class="report-section"><h2>逐张保存画作</h2><p>每张PNG只包含当前这一张画布，不会拼成九宫格、双画面或分栏组合。参考图也不会进入输出文件。</p>'+
 '<div class="portfolio">'+list+'</div>'+
 '<div class="button-row">'+btn("下载可继续编辑的项目JSON","json","primary")+
 btn("返回修改最后一张","edit-last")+
 btn("重新开始一套","reset")+'</div></div>'+
 '<div class="report-section"><h2>本次能观察什么</h2>'+
 '<p>苹果原画与改稿：新增 '+m.appleDelta.added+' 笔、移除 '+m.appleDelta.removed+' 笔；新静物原画与改稿：新增 '+
 m.pearDelta.added+' 笔、移除 '+m.pearDelta.removed+' 笔。</p>'+
 '<p>这些是客观操作记录，不代表艺术质量或创造力高低。也不能直接认为画笔数量越多、颜色越多，作品就越好。</p></div>'+
 '<div class="report-section"><h2>本次不能判断什么</h2>'+
 '<p>没有专业评分者、标准化题本、信度或效度研究。绘画设备、个人审美、以前是否学过、身体操作条件，以及作品需要的时间，都会影响表现。</p>'+
 '<p>如果以后要研究潜在优势，应加入不同日期、不同题材的平行任务和自愿人工作品评审，不能给出一个神秘的天赋百分比。</p></div>'+
 '<details class="details"><summary>展开每张作品的编辑过程统计</summary><div class="table-scroll"><table><thead><tr><th>作品</th><th>笔画</th><th>记录点</th><th>颜色</th><th>撤回</th><th>记录时长</th></tr></thead><tbody>'+
 rows+'</tbody></table></div></details>'+
 '<p id="status" class="status">'+esc(lastMessage||"建议同时下载四张独立PNG和项目JSON，以便将来恢复编辑。")+'</p></section>';
}
function render(){
 destroy();
 if(phase==="intro")home();
 else if(phase==="learning")learn();
 else if(phase==="report")report();
 else if(WORK_KEYS.includes(phase))editor();
 else {phase="intro";home()}
}
function advance(skipped=false){
 const w=active();
 if(!w)return;
 if(!skipped&&!workRequirement(w,phase)){message("请在当前画布上实际绘画或修改至少一笔；也可以选择跳过。");return;}
 w.skipped=skipped;w.finishedAt=new Date().toISOString();
 if(phase==="practice")move("baseline");
 else if(phase==="baseline")move("reviseApple");
 else if(phase==="reviseApple")move("learning");
 else if(phase==="transfer")move("revisePear");
 else if(phase==="revisePear"){project.completed=true;move("report");}
}
function exportJSON(){
 const m=projectSummary(project);
 const body={...project,version:VERSION,exportedAt:new Date().toISOString(),
  description:"原始可继续编辑的作品与笔画坐标记录，非艺术能力测评",notDiagnosis:true,
  dataPrivacy:"本人主动导出；默认仅保存于浏览器本地，不自动上传",
  metrics:m};
 download(new Blob([JSON.stringify(body,null,2)],{type:"application/json;charset=utf-8"}),
  "潜星计划_第06项_绘画创作V2_可编辑工程.json");
 message("已触发项目JSON下载。请检查浏览器下载记录。");
}
function download(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1800);
}
async function exportPNG(key){
 const w=project.works[key];
 if(!w||!w.strokes.length||w.skipped){message("这一阶段还没有可导出的完整画作。");return;}
 try{
  const blob=await workPNG(w);
  download(blob,"潜星计划_第06项_"+safeFilename(label(key))+"_独立作品.png");
  message("已导出「"+label(key)+"」独立PNG，不包含参考图。");
 }catch(e){message("PNG导出失败："+e.message)}
}
function onImport(file){
 if(!file)return;
 if(file.size>5_000_000){message("项目文件过大，超过本版本5MB的导入限制。");return;}
 file.text().then(x=>{
  let imported;
  try{imported=safeProject(JSON.parse(x));}
  catch(e){message("导入失败："+e.message);return;}
  if(Object.keys(project.works).length&&!confirm("导入将替换本页正在编辑的作品。要继续吗？"))return;
  project=imported;lastMessage="成功导入可编辑笔画项目。";
  move(project.step==="intro"?"baseline":project.step);
 }).catch(e=>message("无法读取项目文件："+e.message));
}
app.addEventListener("click",e=>{
 const button=e.target.closest("button");if(!button||button.disabled||!app.contains(button))return;
 const action=button.dataset.action,key=button.dataset.key;
 const w=active();
 if(button.dataset.tool&&w){
  if(w.tool!==button.dataset.tool){w.tool=button.dataset.tool;w.actions.tools++;persist();updateToolbar()}
  return;
 }
 if(button.dataset.color&&w){
  if(w.color!==button.dataset.color){w.color=button.dataset.color;w.actions.colors++;persist();updateToolbar()}
  return;
 }
 if(action==="start"){
  if(saved&&!confirm("开始新作品会替换本机保存的上一套草稿。建议先下载项目JSON。确认开始吗？"))return;
  project=newProject();lastMessage="";move("practice");
 }else if(action==="resume"&&saved){project=safeProject(saved);move(project.step==="intro"?"practice":project.step);}
 else if(action==="import"){importInput.click();}
 else if(action==="undo"&&w){undo(w);painter?.draw();persist();updateToolbar();}
 else if(action==="redo"&&w){redo(w);painter?.draw();persist();updateToolbar();}
 else if(action==="clear"&&w){
  if(!confirm("清空当前这张画布的笔画？可以撤销单笔，但清空操作不可恢复。"))return;
  w.strokes=[];w.redo=[];w.actions.clear++;painter?.draw();persist();updateToolbar();
 }else if(action==="grid"&&w){w.guide=!w.guide;persist();updateToolbar();}
 else if(action==="png"&&w){exportPNG(phase);}
 else if(action==="png-work"&&key){exportPNG(key);}
 else if(action==="json"){exportJSON();}
 else if(action==="complete"){advance(false);}
 else if(action==="skip"){advance(true);}
 else if(action==="hint"&&phase==="learning"){project.hints=Math.min(3,project.hints+1);persist();render();}
 else if(action==="continue"&&phase==="learning"){move("transfer");}
 else if(action==="edit-last"&&phase==="report"){move("revisePear");}
 else if(action==="reset"&&phase==="report"){
  if(!confirm("重新开始会替换当前浏览器内的这一套作品，建议先下载项目JSON。确认吗？"))return;
  project=newProject();lastMessage="";move("practice");
 }
});
app.addEventListener("input",e=>{
 const w=active();if(!w)return;
 if(e.target.id==="brushsize"){
  w.size=Number(e.target.value);const o=document.querySelector("#size-value");if(o)o.textContent=w.size+" px";
 }else if(e.target.id==="opacity"){
  w.opacity=Number(e.target.value)/100;const o=document.querySelector("#opacity-value");if(o)o.textContent=e.target.value+"%";
 }else if(e.target.id==="customcolor"){
  w.color=e.target.value;updateToolbar();
 }else if(e.target.id==="worknote"){
  w.note=e.target.value;
 }
 persist();
});
importInput.addEventListener("change",e=>{
 onImport(e.target.files?.[0]);e.target.value="";
});
window.QX_PAINT_V2_QA={
 snapshot:()=>({phase,step:project.step,works:Object.fromEntries(Object.entries(project.works).map(([k,v])=>[k,{strokes:v.strokes.length,redo:v.redo.length,skipped:v.skipped}])),
  current:WORK_KEYS.includes(phase)?{strokes:active().strokes.length,color:active().color,tool:active().tool,
   redo:active().redo.length,delta:stage(phase)?.base?delta(project.works[stage(phase).base],active()):null}:null,
  hints:project.hints,summary:projectSummary(project)}),
 getProject:()=>JSON.parse(JSON.stringify(project))
};
render();
