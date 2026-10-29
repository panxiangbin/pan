"use strict";
(function(){
const items={
3:{name:"编曲作曲",desc:"用24个节拍组成“平静—转折—收束”三段旋律，自己控制音高、低音和节拍。",tag:"音乐创作"},
4:{name:"音效混音感知",desc:"实际调节模拟旁白、雨声和音乐的相对音量，体验声音遮蔽与叙事重点。",tag:"声音制作"},
5:{name:"语言音韵朗诵",desc:"调整一段短文的节奏、重音与音高，用设备语音合成试听表达差异。",tag:"语言表达"},
6:{name:"绘画素描色彩",desc:"在真实画布上选择颜色和笔触绘画，尝试用冷暖色改变画面感受。",tag:"视觉创作"},
7:{name:"书法",desc:"用带辅助格线的手写画布控制笔画宽度和留白，可保存自己的练习。",tag:"书写艺术"},
8:{name:"雕塑立体造型",desc:"点击堆叠方块，旋转观察方向，在互动透视图中设计立体造型。",tag:"立体构造"},
9:{name:"摄影光影",desc:"改变光位、曝光和构图，观察一幅物体静物的模拟光影变化。",tag:"视觉摄影"},
10:{name:"影视分镜",desc:"把“雨夜拾信”故事整理成可编辑、可换序的六个镜头。",tag:"电影叙事"},
11:{name:"平面视觉设计",desc:"现场设计可调整文字、配色和信息层级的活动海报。",tag:"平面设计"},
12:{name:"建筑室内空间设计",desc:"在3×4米平面图中安排家具位置，尝试保证门口通行。",tag:"空间规划"},
13:{name:"服饰造型审美",desc:"为不同情境搭配服装颜色、廓形和配饰，观察整体视觉效果。",tag:"服装搭配"},
14:{name:"插画原画",desc:"制作同一棵树的绘本风格和科学插画风格，控制形象细节。",tag:"插画创作"},
15:{name:"舞蹈律动",desc:"编排八拍动作并观察节奏衔接；真实舞蹈需要线下实践。",tag:"身体表达"},
16:{name:"戏剧影视表演",desc:"以不同表情、手势和停顿设计同一段台词。",tag:"情境表演"},
17:{name:"杂技肢体控制",desc:"规划安全条件下的现实动作观察，网页不替代身体测试。",tag:"线下实践"},
18:{name:"武术身法",desc:"在网格上设计安全的前后左右步伐路线。",tag:"方向规划"},
19:{name:"默剧表达",desc:"用四个手势动作画面创作一段无声故事。",tag:"非语言表达"},
20:{name:"写作",desc:"围绕两名人物和一个车站场景，写出一篇有转折的小故事。",tag:"文学创作"},
21:{name:"诗歌创作",desc:"编辑六行短诗，对比意象、重复和语言节奏。",tag:"诗歌写作"},
22:{name:"剧本编剧",desc:"用三幕结构设计人物目标、主要障碍和剧情转折。",tag:"戏剧结构"},
23:{name:"文案创意",desc:"为不同受众写产品文案，并核查具体卖点和夸大表达。",tag:"商品表达"},
24:{name:"杂文评论",desc:"针对一个议题建立正反观点、证据和修改方案。",tag:"思辨写作"},
25:{name:"翻译",desc:"把一段请求转换成正式与日常两种语域的英文表达。",tag:"语言转换"},
26:{name:"演讲演说",desc:"规划两分钟表达并进行计时和自我复盘。",tag:"表达练习"},
27:{name:"脱口秀幽默表达",desc:"设计一段有铺垫、预期和反转的生活段子。",tag:"幽默创作"}
};
Object.assign(items,window.QX_LAB_CATALOG||{});
const raw=Number(new URLSearchParams(location.search).get("id")||3);
let id=Number.isInteger(raw)&&raw>=3?raw:3, state=null, media=null, timers=[], redrawLock=false;
if(id===72){location.replace("./gear-v2/");return;}
if(id===45){location.replace("./dialogue-v2/");return;}
if(id===6){location.replace("./paint-v2/");return;}
if(id===77){location.replace("./data-v2/");return;}
const root=document.getElementById("lab-app");
const mods=window.QX_MODULES||{};
const avail=Object.keys(mods).map(Number).filter(n=>Number.isInteger(n)&&items[n]).sort((a,b)=>a-b);
if(!mods[id])id=avail[0]||3;
const neighbors=()=>{const i=avail.indexOf(id);return [avail[Math.max(0,i-1)]||id,avail[Math.min(avail.length-1,i+1)]||id];};
const esc=x=>String(x===null||x===undefined?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const field=(label,key,value,kind,ext)=>{
  const idv="f-"+key;
  let inner="";
  if(kind==="range")inner='<input type="range" id="'+idv+'" data-key="'+esc(key)+'" min="'+esc(ext?.min??0)+'" max="'+esc(ext?.max??100)+'" step="'+esc(ext?.step??1)+'" value="'+esc(value)+'"><span class="value" id="value-'+key+'">'+esc(value)+' '+esc(ext?.unit||'')+'</span>';
  else if(kind==="select")inner='<select id="'+idv+'" data-key="'+esc(key)+'">'+ext.map(x=>'<option value="'+esc(x[0])+'"'+(String(x[0])===String(value)?' selected':'')+'>'+esc(x[1])+'</option>').join('')+'</select>';
  else if(kind==="textarea")inner='<textarea id="'+idv+'" data-key="'+esc(key)+'" rows="3">'+esc(value)+'</textarea>';
  else if(kind==="color")inner='<input type="color" id="'+idv+'" data-key="'+esc(key)+'" value="'+esc(value)+'">';
  else inner='<input id="'+idv+'" data-key="'+esc(key)+'" value="'+esc(value)+'">';
  return '<label class="field" for="'+idv+'">'+esc(label)+inner+'</label>';
};
const btn=(label,action,style,extra)=>'<button type="button" class="btn'+(style?' '+style:'')+'" data-act="'+esc(action)+'" '+(extra||"")+'>'+label+'</button>';
const download=(file,content,type)=>{
  const blob=new Blob([content],{type:type||"text/plain;charset=utf-8"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=file;document.body.appendChild(a);a.click();a.remove();
  timers.push(setTimeout(()=>URL.revokeObjectURL(url),1200));
};
const cleanTimers=()=>{for(const t of timers)clearTimeout(t);timers=[];};
function stopMedia(){
  if(media?.stop)try{media.stop();}catch(e){}
  media=null;
  if(typeof speechSynthesis!=="undefined")speechSynthesis.cancel();
}
function save(){download("潜星计划_第"+String(id).padStart(2,"0")+"项_"+items[id].name+"_作品.json",JSON.stringify({project:"潜星计划",type:"交互作品，不构成天赋测评",taskId:id,title:items[id].name,model:state,exportedAt:new Date().toISOString()},null,2),"application/json;charset=utf-8");}
function exportArt(){
  const c=document.querySelector(".draw");
  if(c&&typeof c.toBlob==="function"){c.toBlob(b=>{if(b){const u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="潜星计划_第"+id+"项_画布.png";a.click();setTimeout(()=>URL.revokeObjectURL(u),1100)}},'image/png');return;}
  const svg=document.querySelector(".stage svg.art-export");
  if(!svg)return;
  const copy=svg.cloneNode(true);copy.setAttribute("xmlns","http://www.w3.org/2000/svg");
  download("潜星计划_第"+id+"项_作品.svg",new XMLSerializer().serializeToString(copy),"image/svg+xml;charset=utf-8");
}
const H={esc,clamp,field,btn,download,save,exportArt,cleanTimers,stopMedia,
  setMedia(obj){stopMedia();media=obj;},
  addTimer(t){timers.push(t);},
  get model(){return state;},get id(){return id;},get root(){return root;},
  get audio(){return window.AudioContext||window.webkitAudioContext;},
  rerender(){render();},updateStage(){const x=document.getElementById("stage");if(x){x.innerHTML=mods[id].stage(state,H);mods[id].afterStage?.(state,H);}},
  note(s){const el=document.getElementById("lab-note");if(el)el.textContent=s;},
  midi(ctx,n,time,dur=0.3,gain=0.07,wave="sine"){const osc=ctx.createOscillator(),vol=ctx.createGain();osc.type=wave;osc.frequency.setValueAtTime(440*Math.pow(2,(n-69)/12),time);vol.gain.setValueAtTime(0.0001,time);vol.gain.exponentialRampToValueAtTime(Math.max(.0001,gain),time+.018);vol.gain.exponentialRampToValueAtTime(.0001,time+Math.max(.05,dur));osc.connect(vol).connect(ctx.destination);osc.start(time);osc.stop(time+Math.max(.05,dur)+.06);return osc}
};
function render(){
  const m=mods[id];
  if(!m){root.textContent="模块加载失败，请刷新重试。";return;}
  const desc=items[id];
  const index=avail.indexOf(id);
  const prev=index<=0?"../vision/":"?id="+avail[index-1];
  const next=index>=avail.length-1?"../explore/":"?id="+avail[index+1];
  const nextLabel=index>=avail.length-1?"全部项目":"下一项 →";
  root.innerHTML='<header class="site-header"><a href="../" class="brand">潜星计划</a><a class="catalog-link" href="../explore/">全部项目</a></header>'+
    '<main class="wrap"><div class="page-top"><div class="eyebrow">第 '+String(id).padStart(2,"0")+' / 108 项</div><h1>'+esc(desc.name)+'</h1><p class="sub">'+esc(m.goal||desc.desc)+'</p></div>'+
    '<div class="layout"><section class="panel workspace" aria-label="互动内容"><div id="stage" class="stage">'+m.stage(state,H)+'</div></section>'+
    '<section class="panel controls" aria-label="操作和调整"><p class="lab-instruction">'+esc(m.instruction||"试一试，调整后看看有什么变化。")+'</p>'+m.controls(state,H)+
    '<div class="control-row">'+btn("保存作品","export","primary")+(m.hasArt?btn("导出图片","art",""):"")+'</div>'+
    '<div class="status" id="lab-note" role="status" aria-live="polite">'+esc(m.status||"")+'</div>'+
    '<details class="safety"><summary>说明与注意</summary><p>'+esc(m.boundary||"本活动只是探索体验，不能凭一次结果判断天赋。")+'</p></details></section></div>'+
    '<nav class="bottom-nav" aria-label="项目切换"><a href="'+prev+'">← 上一项</a><a href="../explore/">目录</a><a href="'+next+'">'+nextLabel+'</a></nav></main>';
  m.afterStage?.(state,H);
}
function initialize(){const m=mods[id];try{localStorage.setItem("qianxing-last-id",String(id))}catch(e){}state=m.init(H);render();}
root.addEventListener("change",e=>{
  const t=e.target;if(t.id==="lab-select"){const n=Number(t.value);if(mods[n])location.href="?id="+n;return;}
  if(!t.dataset.key)return;
  const key=t.dataset.key,old=state[key];state[key]=typeof old==="number"?Number(t.value):t.value;
  const m=mods[id];m.change?.(key,state[key],state,H);
  H.updateStage();
  const v=document.getElementById("value-"+key);if(v)v.textContent=String(state[key])+(key==="tempo"?" BPM":"");
});
root.addEventListener("input",e=>{
  const t=e.target;if(!t.dataset.key)return;
  const key=t.dataset.key,old=state[key];
  state[key]=typeof old==="number"?Number(t.value):t.value;
  mods[id].input?.(key,state[key],state,H);
  if(t.closest("#stage")){const readout=t.closest(".mixer-track")?.querySelector(".readout");if(readout)readout.textContent=String(state[key])+"%";}
  else if(!redrawLock){redrawLock=true;requestAnimationFrame(()=>{redrawLock=false;H.updateStage();});}
  const v=document.getElementById("value-"+key);if(v)v.textContent=String(state[key])+(key==="tempo"?" BPM":"");
});
root.addEventListener("click",e=>{
  const t=e.target.closest("[data-act]");if(!t||!root.contains(t))return;
  const action=t.dataset.act;
  if(action==="export"){save();return;}
  if(action==="art"){exportArt();return;}
  mods[id].click?.(action,t.dataset,state,H);
  if(action!=="no-render")render();
});
window.addEventListener("pagehide",()=>{stopMedia();cleanTimers()});
window.QX_LABS_QA={getCurrent:()=>({id,model:JSON.parse(JSON.stringify(state)),module:!!mods[id]}),moduleIds:()=>Object.keys(mods)};
initialize();
})();