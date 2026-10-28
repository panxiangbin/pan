"use strict";
(function(){
  const all=[
    {id:1,name:"乐器与乐感",prompt:"听音乐，辨认声音的变化"},
    {id:2,name:"视觉观察与变化察觉",prompt:"观察潮汐码头，找出变化"},
    ...(window.QX_ACTIVITIES||[])
  ];
  const app=document.getElementById("app");
  const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const two=x=>String(x).padStart(2,"0");
  const url=x=>x.id===1?"../music/?first=1":x.id===2?"../vision/":"../labs/?id="+x.id;
  const legacy=/^#item-(\d+)$/.exec(location.hash);
  if(legacy){
    const n=Number(legacy[1]);
    if(Number.isInteger(n)&&n>=1&&n<=108){location.replace(url({id:n}));return;}
  }
  app.innerHTML='<header class="top"><div class="container top-inner"><a class="brand" href="../">潜星计划</a><a class="top-link" href="../">首页</a></div></header>'+
    '<main class="container main"><h1>全部探索项目</h1><p class="intro">选一个感兴趣的，直接开始。</p>'+
    '<div class="search-row"><label class="sr-only" for="find">搜索项目或编号</label><input id="find" type="search" placeholder="搜索名称或编号" autocomplete="off" aria-controls="activity-list"><span class="count" id="count" aria-live="polite"></span></div>'+
    '<div class="list" id="activity-list"></div></main>'+
    '<footer class="container footer">自由探索，不做天赋鉴定。</footer>';
  const input=document.getElementById("find"),list=document.getElementById("activity-list"),count=document.getElementById("count");
  function render(){
    const q=input.value.trim().toLowerCase();
    const found=all.filter(x=>!q||x.name.toLowerCase().includes(q)||String(x.id).includes(q)||String(x.prompt||"").toLowerCase().includes(q));
    count.textContent=found.length+" 项";
    list.innerHTML=found.length?found.map(x=>'<a class="activity" data-id="'+x.id+'" href="'+url(x)+'" aria-label="第'+two(x.id)+'项：'+esc(x.name)+'"><span class="number">'+two(x.id)+'</span><span class="name">'+esc(x.name)+'</span><span class="arrow" aria-hidden="true">→</span></a>').join(""):'<p class="empty">没有找到相关项目。换个词试试。</p>';
  }
  input.addEventListener("input",render);
  list.addEventListener("click",e=>{
    const a=e.target.closest("a[data-id]");
    if(!a)return;
    try{localStorage.setItem("qianxing-last-id",a.dataset.id)}catch(e){}
  });
  render();
})();