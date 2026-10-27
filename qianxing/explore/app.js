"use strict";
(function(){
const items=window.QX_ACTIVITIES||[];
const all=[{id:1,name:"乐器与乐感",url:"../music/?first=1",mode:"media"},{id:2,name:"视觉观察与变化察觉",url:"../vision/",mode:"media"},...items];
const el=document.getElementById("app");
const modes={create:"创作与表达",offline:"线下实践",research:"证据与研究",dialogue:"换位与沟通",strategy:"规划与取舍",experiment:"观察与验证",media:"独立互动体验"};
const enhanced=new Set([3,4,5,6,7,8,9,10,11,12,13,14]);
let current=null,phase="catalog",record=[],editing="",filter="all",keyword="",draft="";
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const no=(n)=>String(n).padStart(3,"0");
const choiceLabel=(x)=>modes[x]||"跨领域活动";
function nav(hash){location.hash=hash;route();}
function header(){return '<header class="top"><div class="site-wrap top-inner"><a class="brand" href="../">✦ 潜星计划 <span>跨领域探索</span></a><nav><a href="../">项目首页</a><a href="../music/?first=1">第01项</a><a href="../vision/">第02项</a><a href="#catalog">108项活动目录</a></nav></div></header>';}
function card(x){const isEnhanced=enhanced.has(x.id);const url=x.url||(isEnhanced?'../labs/?id='+x.id:'#item-'+x.id);const label=x.url?'进入独立体验':isEnhanced?'打开可操作的互动实验':'进入活动并制作作品';return '<article class="item"><div class="item-top"><span>EXPLORE '+no(x.id)+'</span><span class="chip">'+esc(isEnhanced?'互动实验室':choiceLabel(x.mode))+'</span></div><h3>'+esc(x.name)+'</h3><p>'+esc(x.prompt||"已独立制作的体验项目，保留原页面。")+'</p><a class="open" href="'+url+'">'+label+' →</a></article>';}
function catalog(){const results=all.filter(x=>(filter==="all"||x.mode===filter)&&(!keyword||String(x.id).includes(keyword)||x.name.includes(keyword)||String(x.prompt||"").includes(keyword)));
return '<section class="hero site-wrap"><div class="eyebrow">QIANXING / 108 EXPLORATION OPPORTUNITIES</div><h1>108项探索机会，<br><em>不急着给人贴标签。</em></h1><p>每项都有独立主题和操作入口：前两项为已有互动；第03—108项为第一版具体活动工作台。第01—02项保留原有完整体验，第03—14项已经升级成可操作的互动实验室；第15—108项目前为首版活动与作品记录台，后续逐项深化。</p><div class="counts"><strong>108</strong><span>个主题入口</span><strong>14</strong><span>项独立互动体验</span><strong>94</strong><span>项基础活动工作台</span></div></section>'+
'<section class="site-wrap"><div class="panel"><h2>活动目录</h2><p class="hint">不是108种已经被验证的天赋；也不是108张相同的选择题。真实体能和嗅味觉必须在现实生活中尝试。</p><div class="tools"><input id="find" type="search" placeholder="搜索编号、领域或关键词…" value="'+esc(keyword)+'" aria-label="搜索活动"><select id="mode" aria-label="按活动形式筛选"><option value="all">全部活动形式</option>'+Object.keys(modes).map(k=>'<option value="'+k+'"'+(filter===k?' selected':'')+'>'+choiceLabel(k)+'</option>').join('')+'</select></div><p class="hint" id="count">当前显示 '+results.length+' 项</p><div class="cards" id="list">'+results.map(card).join('')+'</div></div></section>';}
function activity(x){
const first=['create','research','dialogue','strategy','experiment','offline'].includes(x.mode);
return '<section class="site-wrap detail"><div class="mini-nav"><a href="#catalog">← 返回108项目录</a><span>第 '+no(x.id)+' 项 / 108</span></div><div class="panel work"><div class="eyebrow">'+esc(choiceLabel(x.mode)).toUpperCase()+' · EXPLORATION '+no(x.id)+'</div><h1>'+esc(x.name)+'</h1>'+
'<div class="prompt"><span>这一次做什么</span><h2>'+esc(x.prompt)+'</h2></div>'+
'<div class="requirements"><b>边界和注意</b><p>'+esc(x.guard)+'</p></div>'+
'<div class="steps"><div><b>① 独立尝试</b><p>先写出你的方案、观察或真实尝试的记录。</p></div><div><b>② 根据限制修订</b><p>检查依据、适用范围以及没考虑到的问题。</p></div><div><b>③ 导出与再试</b><p>保存自己的作品，换素材或现实场景再尝试。</p></div></div>'+
'<label class="field" for="answer">'+(x.mode==="offline"?"线下实践计划 / 真实结果（请分开注明）": "你的第一次尝试 / 作品")+'</label><textarea id="answer" rows="8" placeholder="在这里写下你的方案、作品或观察记录。无需账号，不自动上传。">'+esc(draft)+'</textarea>'+
'<div class="control"><button type="button" id="review">进入复盘与修改</button><button type="button" class="secondary" id="save">导出我的作品（JSON）</button><button type="button" class="secondary" id="reset">清空当前回答</button></div>'+
'<div id="feedback">'+(phase==="review"?reviewBlock(x):'')+'</div><p class="disclaimer">本活动仅是体验原型，尚无信效度验证；本页面不替你判断表现好坏，也不会自动测定天赋。</p></div>'+
'<div class="bottom-nav"><a href="#item-'+Math.max(3,x.id-1)+'">← 上一项</a><a href="#catalog">目录</a><a href="#item-'+Math.min(108,x.id+1)+'">下一项 →</a></div></section>';
}
function reviewBlock(x){return '<section class="review"><h2>复盘与修改</h2><p>你可以检查以下三个问题，再编辑上面的作品；不强迫给出正确答案。</p><ol><li>这次真正做了什么？哪些只是计划或猜测？</li><li>有没有忽略的限制、替代解释或失败情况？</li><li>如果换一个材料或实际环境，你会怎样验证？</li></ol><label class="field" for="reflection">写下你的修改理由和下一次尝试</label><textarea id="reflection" rows="5" placeholder="补充修订意见……">'+esc(editing)+'</textarea><div class="control"><button id="save-again">导出作品与复盘</button><button class="secondary" id="retry">返回修改</button></div></section>';}
function download(){
const data={project:"潜星计划",status:"用户自主探索作品，非天赋测评",activity:{id:current.id,name:current.name,mode:current.mode},prompt:current.prompt,work:document.getElementById("answer")?.value||draft,reflection:document.getElementById("reflection")?.value||editing,savedAt:new Date().toISOString()};
const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="潜星计划_"+no(current.id)+"_个人探索记录.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),300);
}
function route(){
const hash=decodeURIComponent(location.hash.slice(1));
const match=/^item-(\d+)$/.exec(hash);
const id=match?Number(match[1]):null;
if(id!==null&&enhanced.has(id)){location.replace("../labs/?id="+id);return;}
if(id!==null && id>=3&&id<=108){const x=items.find(x=>x.id===id);if(x){if(!current||current.id!==id){draft="";editing="";phase="work"}current=x;el.innerHTML=activity(x);window.scrollTo(0,0);return;}}
current=null;el.innerHTML=catalog();window.scrollTo(0,0);
}
function attach(){
el.addEventListener("input",e=>{if(e.target.id==="answer")draft=e.target.value;if(e.target.id==="reflection")editing=e.target.value;if(e.target.id==="find"){keyword=e.target.value; const list=all.filter(x=>(filter==="all"||x.mode===filter)&&(!keyword||String(x.id).includes(keyword)||x.name.includes(keyword)||String(x.prompt||"").includes(keyword)));const grid=document.getElementById("list");if(grid)grid.innerHTML=list.map(card).join('');const count=document.getElementById("count");if(count)count.textContent="当前显示 "+list.length+" 项";}});
el.addEventListener("change",e=>{if(e.target.id==="mode"){filter=e.target.value; const list=all.filter(x=>(filter==="all"||x.mode===filter)&&(!keyword||String(x.id).includes(keyword)||x.name.includes(keyword)||String(x.prompt||"").includes(keyword)));document.getElementById("list").innerHTML=list.map(card).join('');document.getElementById("count").textContent="当前显示 "+list.length+" 项";}});
el.addEventListener("click",e=>{const id=e.target.id;if(!current)return;if(id==="review"){draft=document.getElementById("answer")?.value||"";phase="review";document.getElementById("feedback").innerHTML=reviewBlock(current);document.getElementById("feedback").scrollIntoView({behavior:"smooth",block:"nearest"});}
if(id==="save"||id==="save-again")download();if(id==="reset"){draft="";editing="";document.getElementById("answer").value="";}if(id==="retry"){editing=document.getElementById("reflection")?.value||"";phase="work";document.getElementById("feedback").innerHTML="";}});
}
document.body.insertAdjacentHTML("afterbegin",header());
attach();window.addEventListener("hashchange",route);route();
window.QX_EXPLORE_QA={count:all.length,added:items.length,getState:()=>({item:current?.id||null,phase,keyword,filter})};
})();