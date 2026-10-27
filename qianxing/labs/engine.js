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
14:{name:"插画原画",desc:"制作同一棵树的绘本风格和科学插画风格，控制形象细节。",tag:"插画创作"}
};
const raw=Number(new URLSearchParams(location.search).get("id")||3);
let id=Number.isInteger(raw)&&raw>=3&&raw<=14?raw:3, state=null, media=null, timers=[], redrawLock=false;
const root=document.getElementById("lab-app");
const mods=window.QX_MODULES||{};
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
  const m=mods[id];if(!m){root.textContent="模块正在加载，请刷新重试。";return;}
  const desc=items[id];
  const options=Object.entries(items).map(([n,x])=>'<option value="'+n+'"'+(Number(n)===id?' selected':'')+'>第'+String(n).padStart(2,"0")+'项 · '+esc(x.name)+'</option>').join('');
  root.innerHTML='<header class="site-header"><a href="../explore/" class="brand"><span class="brand-mark">✦</span><span>潜星计划 · 实验室</span></a><nav class="header-links"><a href="../">首页</a><a href="../explore/">108项活动目录</a></nav></header>'+
  '<div class="wrap"><div class="page-top"><div><div class="eyebrow">EXPLORATION '+String(id).padStart(3,"0")+' / 108 · '+esc(desc.tag)+'</div><h1>第'+String(id).padStart(2,"0")+'项：'+esc(desc.name)+'</h1><p class="sub">'+esc(desc.desc)+'</p></div>'+
  '<div class="lab-picker"><a class="prevnext" href="?id='+Math.max(3,id-1)+'">← 上一项</a><select id="lab-select" aria-label="选择探索项目">'+options+'</select><a class="prevnext" href="?id='+Math.min(14,id+1)+'">下一项 →</a></div></div>'+
  '<div class="lab-menu">'+Object.entries(items).map(([n,x])=>'<a class="'+(Number(n)===id?'active':'')+'" href="?id='+n+'">'+String(n).padStart(2,'0')+' '+esc(x.name)+'</a>').join('')+'</div>'+
  '<div class="layout"><section class="panel"><div class="panel-head"><div class="eyebrow">可操作的探索任务</div><h2>'+esc(m.heading||desc.name)+'</h2><p>'+esc(m.goal||desc.desc)+'</p></div><div id="stage" class="stage">'+m.stage(state,H)+'</div></section>'+
  '<aside class="panel controls"><div class="eyebrow">操作与调整</div><h2>你的实验台</h2><p>'+esc(m.instruction||"先尝试一次，再调整参数或作品，比较前后的变化。")+'</p>'+m.controls(state,H)+
  '<div class="control-row">'+btn('保存项目数据','export','primary')+(m.hasArt?btn('导出画面','art',''):'')+'</div><div class="note">'+esc(m.boundary||"这只是探索性活动，不代表已经测得先天天赋。")+'</div>'+
  '<div class="status" id="lab-note" role="status" aria-live="polite">'+esc(m.status||"操作会即时更新左侧作品。")+'</div></aside></div></div>'+
  '<footer class="footer">潜星计划 · 互动实验室 V1.0 · 仅在本机运行和导出作品，不上传个人答案。单次尝试不能评定天赋。</footer>';
  m.afterStage?.(state,H);
}
function initialize(){const m=mods[id];state=m.init(H);render();}
root.addEventListener("change",e=>{
  const t=e.target;if(t.id==="lab-select"){const n=Number(t.value);if(n>=3&&n<=14)location.href="?id="+n;return;}
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