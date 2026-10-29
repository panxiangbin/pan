"use strict";
(function(){
 const host=document.getElementById("app"),fileInput=document.getElementById("import-file"),api=window.QX_PROGRESS;
 const ITEMS=[
  {id:2,name:"视觉观察",url:"../vision/v2/"},
  {id:6,name:"绘画素描色彩",url:"../labs/paint-v2/"},
  {id:45,name:"沟通理解",url:"../labs/dialogue-v2/"},
  {id:52,name:"组织领导",url:"../labs/lead-v2/"},
  {id:72,name:"机械结构",url:"../labs/gear-v2/"},
  {id:77,name:"数据挖掘分析",url:"../labs/data-v2/"}
 ];
 const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const fmtDate=x=>{if(!x)return "";const date=new Date(x);return Number.isFinite(date.getTime())?date.toLocaleDateString("zh-CN")+" "+date.toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"}):"";};
 const select=(field,options,value,id)=>
 '<select data-field="'+field+'" id="'+field+"-"+id+'">'+options.map(x=>'<option value="'+esc(x)+'" '+(x===value?"selected":"")+'>'+esc(x||"暂不评价")+'</option>').join("")+'</select>';
 let msg="";
 function infoFor(r){
  if(!r)return {label:"尚无记录",css:"",description:"本浏览器暂未记录这项体验"};
  const count=r.summary?.total>0?r.summary.done+"/"+r.summary.total+"项":"尚未完成整套";
  if(r.active)return {label:"进行中",css:"inprogress",description:"上次开始："+fmtDate(r.startedAt)+(r.completions?" · 曾完成"+r.completions+"次":"")};
  if(r.completions>0)return {label:"已体验",css:"completed",description:"最近完整体验："+fmtDate(r.finishedAt)+" · 实做"+count+(r.summary.skipped?" · 跳过"+r.summary.skipped+"项":"")};
  return {label:"未记录",css:"",description:"可以在下方主动填写体验反馈"};
 }
 function itemMarkup(x){
  const r=api.get(x.id),st=infoFor(r),feed=r?.feedback||{};
  const entered=r?.active||r?.completions>0;
  const opts=select("difficulty",["","偏简单","合适","偏难"],feed.difficulty||"",x.id);
  const clarity=select("clarity",["","容易理解","有些不清楚"],feed.clarity||"",x.id);
  return '<article class="item" data-mid="'+x.id+'"><div class="item-main"><div class="number">'+String(x.id).padStart(2,"0")+'</div>'+
  '<div><div class="name">'+esc(x.name)+'</div>'+
  '<div class="item-detail"><span class="status '+st.css+'">'+st.label+'</span><span>'+esc(st.description)+'</span></div></div>'+
  '<a class="btn" href="'+x.url+'">'+(entered?"进入项目":"开始体验")+'</a></div>'+
  '<details class="feedback"><summary>填写体验反馈（自愿）'+(feed.updatedAt?" · 已保存":"")+'</summary>'+
  '<div class="feedback-body"><div class="fields"><label for="difficulty-'+x.id+'">任务难度'+opts+'</label>'+
  '<label for="clarity-'+x.id+'">操作是否清楚'+clarity+'</label></div>'+
  '<label style="margin-top:14px" for="note-'+x.id+'">最需要优化的地方（最多240字）'+
  '<textarea id="note-'+x.id+'" data-field="note" maxlength="240" placeholder="例如：第三阶段太简单；手机上表格不好操作。">'+esc(feed.note||"")+'</textarea></label>'+
  '<div class="button-row"><button class="btn primary" type="button" data-act="feedback" data-id="'+x.id+'">保存这项反馈</button>'+
  '<span class="small">仅保存在本浏览器，主动导出才会生成文件</span></div></div></details></article>';
 }
 function render(){
  if(!api){host.innerHTML='<p>浏览器未能加载探索记录模块。请刷新。</p>';return;}
  const all=ITEMS.map(x=>api.get(x.id));
  const completed=all.filter(x=>x?.completions>0).length;
  const active=all.filter(x=>x?.active).length;
  const reviewed=all.filter(x=>x?.feedback?.updatedAt).length;
  const tooEasy=all.filter(x=>x?.feedback?.difficulty==="偏简单").length;
  const tooHard=all.filter(x=>x?.feedback?.difficulty==="偏难").length;
  const unclear=all.filter(x=>x?.feedback?.clarity==="有些不清楚").length;
  const revisit=ITEMS.filter(x=>{const f=api.get(x.id)?.feedback;return f?.difficulty==="偏简单"||f?.clarity==="有些不清楚";}).map(x=>x.name);
  host.innerHTML='<div class="eyebrow">6项已上线的V2深度探索 · 本地记录</div>'+
   '<h1>我的探索记录</h1>'+
   '<p class="lead">集中查看体验进度，留下哪些题目太简单或太难的反馈。这里不会把不同领域合成一个“天赋总分”。</p>'+
   '<div class="kpis"><div class="kpi"><strong>'+completed+' / 6</strong><span>已有完整体验记录的项目</span></div>'+
   '<div class="kpi"><strong>'+active+'</strong><span>当前仍在进行的项目</span></div>'+
   '<div class="kpi"><strong>'+reviewed+'</strong><span>已主动填写反馈的项目</span></div></div>'+
   (reviewed?'<p class="small" id="feedback-overview">反馈概览：偏简单 '+tooEasy+' 项、偏难 '+tooHard+' 项、操作不清楚 '+unclear+' 项。'+(revisit.length?'建议优先复查：'+esc(revisit.join("、"))+'。':"")+'</p>':"")+
   '<div class="list">'+ITEMS.map(itemMarkup).join("")+'</div>'+
   '<section class="action-footer"><h2 class="section-title">备份与管理</h2>'+
   '<p class="notice">记录只包含6项的开始/完成状态、完成项数，以及你自愿填写的反馈。原始答题、画作、笔画、视频和详细任务文件仍留在各自模块，不会被这个页面复制到一起。</p>'+
   '<div class="button-row"><button type="button" class="btn primary" data-act="export">下载本机汇总JSON</button>'+
   '<button type="button" class="btn" data-act="import">导入汇总记录</button>'+
   '<button type="button" class="btn" data-act="clear">清空本页汇总</button></div>'+
   '<p class="notice">不同设备、浏览器或隐私模式之间不会自动同步。导入只替换这6项的汇总信息，不会覆盖原项目中的画作与作答。功能从本次更新后开始记录，之前做过的项目不会被自动补记。</p>'+
   (api.available()?'':'<p class="warning">当前浏览器阻止了本地存储。可以打开页面，但无法保留记录，请检查隐私设置。</p>')+
   '<p id="status-msg" role="status" aria-live="polite">'+esc(msg)+'</p></section>';
 }
 function download(filename,data){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob),anchor=document.createElement("a");
  anchor.href=url;anchor.download=filename;document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
 host.addEventListener("click",e=>{
  const button=e.target.closest("[data-act]");if(!button||button.disabled)return;
  const action=button.dataset.act,id=Number(button.dataset.id);
  if(action==="feedback"){
   const box=button.closest("article");
   const feedback={difficulty:box.querySelector('[data-field="difficulty"]').value,
      clarity:box.querySelector('[data-field="clarity"]').value,
      note:box.querySelector('[data-field="note"]').value};
   msg=api.saveFeedback(id,feedback)?"反馈保存在本浏览器。":"浏览器未能保存，请检查存储权限。";
   render();
  }else if(action==="export"){
   download("潜星计划_V2_六项统一探索记录.json",{...api.exportData(),
    exportedAt:new Date().toISOString(),
    description:"只有汇总进度和自愿反馈；不含原始画作或答题数据"});
   msg="已触发JSON下载，请查看浏览器的下载记录。";
   const status=document.getElementById("status-msg");if(status)status.textContent=msg;
  }else if(action==="import")fileInput.click();
  else if(action==="clear"){
   if(!confirm("确定清空本浏览器的六项汇总吗？原有绘画、实验与各自的详细记录不会清除。"))return;
   msg=api.clear()?"统一汇总已清空。其他项目的原始记录未改动。":"浏览器拒绝清空，请检查隐私设置。";
   render();
  }
 });
 fileInput.addEventListener("change",e=>{
  const file=e.target.files?.[0];e.target.value="";
  if(!file)return;
  if(file.size>30000){msg="文件过大，不是标准汇总。";render();return;}
  file.text().then(txt=>{
   let data;
   try{data=JSON.parse(txt);}
   catch(e){msg="无法解析JSON文件。";render();return;}
   if(!confirm("导入会替换当前浏览器里的六项汇总与体验反馈。不会覆盖绘画、答题等原始数据，确定继续吗？"))return;
   try{api.importData(data);msg="六项汇总记录已导入，可继续从对应项目进行探索。";}
   catch(e){msg="导入失败："+e.message;}
   render();
  }).catch(()=>{msg="无法读取文件。";render();});
 });
 render();
 window.QX_PROGRESS_PAGE_QA={snapshot:()=>({items:ITEMS.length,completed:ITEMS.filter(x=>api.get(x.id)?.completions>0).length,active:ITEMS.filter(x=>api.get(x.id)?.active).length,reviewed:ITEMS.filter(x=>api.get(x.id)?.feedback?.updatedAt).length})};
})();
