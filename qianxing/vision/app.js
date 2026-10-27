"use strict";
(function () {
  const app = document.getElementById('app');
  const palette = {teal:'#1ba79f',orange:'#f9a72e',coral:'#ef7671',blue:'#4d99da',violet:'#8972ce',green:'#65a568',sky:'#9ac9ef'};
  const names = {crate:'货柜',barrel:'圆桶',buoy:'浮标',beacon:'信号灯',ship:'船只',ring:'救生圈',truck:'搬运车',stack:'叠箱',sensor:'探测器'};
  const make = a => a.map(x => ({kind:x[0],tone:x[1],mark:x[2] || ''}));
  const trials = [
    {name:'热身 · 先熟悉玩法', zone:'潮汐码头 · 初到港口', cols:3, seconds:10, items:make([
      ['crate','teal'],['buoy','orange'],['barrel','blue'],
      ['ship','violet'],['crate','coral'],['beacon','orange'],
      ['stack','green'],['ring','coral'],['truck','teal']
    ]),change:{at:4,to:{kind:'ring'}},explain:'第 5 号区域：原先是货柜，后来变成了救生圈。',kind:'practice'},
    {name:'正式体验 · 细节观察',zone:'潮汐码头 · 集装区',cols:3,seconds:9,items:make([
      ['crate','orange','circle'],['ring','coral'],['ship','teal'],
      ['barrel','blue'],['sensor','violet'],['buoy','orange'],
      ['truck','green'],['crate','teal','triangle'],['beacon','blue']
    ]),change:{at:7,to:{mark:'diamond'}},explain:'第 8 号区域：货柜角上的三角标记，变成了菱形标记。',kind:'formal'},
    {name:'正式体验 · 更多区域',zone:'潮汐码头 · 中央货场',cols:4,seconds:9,items:make([
      ['stack','orange'],['ring','coral'],['buoy','blue'],['crate','teal','circle'],
      ['sensor','violet'],['ship','blue'],['barrel','orange'],['truck','teal'],
      ['beacon','coral'],['stack','green'],['crate','blue','diamond'],['buoy','violet']
    ]),change:{at:2,to:{kind:'beacon'}},explain:'第 3 号区域：原来的浮标被换成了信号灯。',kind:'formal'},
    {name:'正式体验 · 判断没有变化',zone:'潮汐码头 · 交接检查',cols:4,seconds:9,items:make([
      ['ship','blue'],['crate','orange','circle'],['stack','green'],['sensor','violet'],
      ['ring','coral'],['buoy','teal'],['truck','orange'],['barrel','blue'],
      ['beacon','violet'],['crate','coral','triangle'],['stack','teal'],['ring','orange']
    ]),change:null,explain:'这两幅画面的 12 个区域完全相同，本题没有变化。',kind:'formal'},
    {name:'正式体验 · 新场景迁移',zone:'温室备品区 · 陌生物品',cols:4,seconds:10,items:make([
      ['sensor','green'],['barrel','coral'],['stack','blue'],['beacon','orange'],
      ['crate','violet','diamond'],['ring','green'],['truck','teal'],['buoy','coral'],
      ['ship','orange'],['stack','green'],['sensor','blue'],['crate','teal','circle']
    ]),change:{at:9,to:{kind:'barrel'}},explain:'第 10 号区域：之前是叠箱，之后变成了圆桶。',kind:'formal'}
  ];
  let stage='intro',index=0,selected=null,remaining=0,startAt=0,timerBudget=0,ticker=null,maskTimer=null,answers=[],reviews=[0,0,0,0,0],paused=false;
  const trial=() => trials[index];
  const correctAt=t => t.change ? t.change.at : -1;
  const countFormal=()=>answers.filter(x=>x.index>0&&x.choice!==null).length;
  const totalCorrect=()=>answers.filter(x=>x.index>0&&x.correct).length;
  const screen=(s,reset) => {stage=s;render();if(reset)window.scrollTo(0,0);};
  function clearClocks(){if(ticker!==null)clearInterval(ticker);if(maskTimer!==null)clearTimeout(maskTimer);ticker=null;maskTimer=null;}
  function iconSvg(item) {
    const color=palette[item.tone] || palette.teal;
    const dark='#24465b', white='#fffdfa';
    let g='';
    switch(item.kind){
      case 'crate':
        g='<rect x="21" y="26" width="86" height="54" rx="7" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<path d="M32 29 V77 M46 29 V77 M82 29 V77 M96 29 V77" stroke="'+dark+'" opacity=".36" stroke-width="3"/>'+
          '<rect x="26" y="30" width="77" height="7" rx="3" fill="'+white+'" opacity=".34"/>';
        break;
      case 'barrel':
        g='<rect x="40" y="27" width="48" height="56" rx="11" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<ellipse cx="64" cy="29" rx="24" ry="8" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<path d="M40 49 H88 M40 67 H88" stroke="'+dark+'" stroke-width="4"/>'+
          '<ellipse cx="64" cy="29" rx="15" ry="3" fill="'+white+'" opacity=".65"/>';
        break;
      case 'buoy':
        g='<path d="M64 15 V34" stroke="'+dark+'" stroke-width="4"/><circle cx="64" cy="12" r="5" fill="'+color+'" stroke="'+dark+'" stroke-width="2"/>'+
          '<path d="M64 28 C44 28 35 51 42 70 L86 70 C93 51 84 28 64 28Z" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<path d="M42 59 H86" stroke="'+white+'" stroke-width="11"/><path d="M42 59 H86" stroke="'+dark+'" stroke-width="1.7"/>'+
          '<path d="M42 72 H86" stroke="'+dark+'" stroke-width="4"/>';
        break;
      case 'beacon':
        g='<path d="M48 78 L56 33 H72 L80 78Z" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<rect x="47" y="19" width="34" height="21" rx="5" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<ellipse cx="64" cy="22" rx="16" ry="5" fill="'+white+'" opacity=".8"/>'+
          '<path d="M64 9 V3 M42 11 L34 5 M86 11 L94 5 M45 41 H83" stroke="'+color+'" stroke-width="3"/>'+
          '<rect x="37" y="75" width="54" height="7" rx="3" fill="'+dark+'"/>';
        break;
      case 'ship':
        g='<path d="M20 61 H108 L91 80 H42Z" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<rect x="38" y="44" width="36" height="17" rx="3" fill="'+white+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<path d="M62 15 V44 L94 44Z" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<path d="M20 84 Q32 77 45 84 T70 84 T95 84 T112 84" fill="none" stroke="#7cbddb" stroke-width="4"/>';
        break;
      case 'ring':
        g='<circle cx="64" cy="52" r="29" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<circle cx="64" cy="52" r="14" fill="#f7fcff" stroke="'+dark+'" stroke-width="2"/>'+
          '<path d="M64 23 V38 M64 66 V81 M35 52 H50 M78 52 H93" stroke="'+white+'" stroke-width="12"/>'+
          '<circle cx="64" cy="52" r="29" fill="none" stroke="'+dark+'" stroke-width="2"/>';
        break;
      case 'truck':
        g='<rect x="17" y="44" width="68" height="30" rx="5" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<path d="M85 51 H101 L111 61 V74 H85Z" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<rect x="89" y="55" width="11" height="11" rx="2" fill="#e6f6ff"/>'+
          '<circle cx="37" cy="76" r="9" fill="'+dark+'"/><circle cx="95" cy="76" r="9" fill="'+dark+'"/>'+
          '<circle cx="37" cy="76" r="4" fill="'+white+'"/><circle cx="95" cy="76" r="4" fill="'+white+'"/>';
        break;
      case 'stack':
        g='<rect x="19" y="50" width="42" height="30" rx="4" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<rect x="67" y="50" width="42" height="30" rx="4" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<rect x="43" y="16" width="42" height="30" rx="4" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<path d="M28 57 V74 M52 57 V74 M76 57 V74 M99 57 V74 M52 23 V40 M76 23 V40" stroke="'+white+'" stroke-width="4" opacity=".72"/>';
        break;
      case 'sensor':
        g='<rect x="35" y="41" width="58" height="35" rx="8" fill="'+color+'" stroke="'+dark+'" stroke-width="3"/>'+
          '<circle cx="64" cy="58" r="12" fill="#f1fcff" stroke="'+dark+'" stroke-width="3"/>'+
          '<circle cx="64" cy="58" r="4" fill="'+color+'"/>'+
          '<path d="M64 40 V21 M50 26 Q64 10 78 26 M43 20 Q64 -2 85 20" fill="none" stroke="'+dark+'" stroke-width="3"/>'+
          '<path d="M24 76 H104" stroke="'+dark+'" stroke-width="4"/>';
        break;
    }
    if(item.mark){
      let mark='';
      if(item.mark==='circle')mark='<circle cx="95" cy="22" r="6" fill="'+color+'" stroke="'+dark+'" stroke-width="2"/>';
      if(item.mark==='triangle')mark='<path d="M95 14 L102 28 H88Z" fill="'+color+'" stroke="'+dark+'" stroke-width="2"/>';
      if(item.mark==='diamond')mark='<path d="M95 13 L103 22 L95 31 L87 22Z" fill="'+color+'" stroke="'+dark+'" stroke-width="2"/>';
      g+='<circle cx="95" cy="22" r="15" fill="#ffffff" stroke="'+dark+'" stroke-width="2"/>'+mark;
    }
    return '<svg class="object-svg" viewBox="0 0 128 100" aria-hidden="true" focusable="false">'+
      '<ellipse cx="64" cy="88" rx="46" ry="5" fill="#678da2" opacity=".16"/>'+g+'</svg>';
  }
  function itemsFor(t,variant){
    const list=t.items.map(x=>Object.assign({},x));
    if(variant==='B' && t.change)Object.assign(list[t.change.at],t.change.to);
    return list;
  }
  function sceneHeader(t,variant){
    const eco=t.zone.indexOf('温室')!==-1;
    return '<div class="scene-heading"><div><span class="scene-kicker">'+(eco?'GREENHOUSE / NEW CONTEXT':'PORT / VISUAL INSPECTION')+'</span>'+
      '<strong>'+t.zone+'</strong></div><span class="scene-phase">'+(variant==='A'?'画面 A · 记住':'画面 B · 找变化')+'</span></div>'+
      '<div class="horizon" aria-hidden="true">'+
      '<svg viewBox="0 0 800 80" preserveAspectRatio="none">'+
      '<circle cx="715" cy="21" r="15" fill="#ffce79" opacity=".8"/>'+
      '<path d="M0 62 H800" stroke="#8ed0d6" stroke-width="4"/>'+
      '<path d="M45 64 V13 H60 V65 M60 14 H196 M163 14 L177 64 M58 32 H180" stroke="#71a7b1" stroke-width="3" fill="none"/>'+
      '<path d="M545 64 V8 H558 V64 M558 10 H687 M650 10 L663 64" stroke="#71a7b1" stroke-width="3" fill="none"/>'+
      '<path d="M280 56 H388 L366 70 H306Z" fill="#6dcac7" stroke="#377c91" stroke-width="2"/>'+
      '<rect x="294" y="45" width="58" height="11" fill="#ffbd6a"/><path d="M0 74 Q35 69 70 74 T140 74 T210 74 T280 74 T350 74 T420 74 T490 74 T560 74 T630 74 T700 74 T770 74" stroke="#b0e5eb" stroke-width="2" fill="none"/>'+
      '</svg></div>';
  }
  function board(t,variant,interactive,showAnswer){
    const list=itemsFor(t,variant);
    const s=list.map((item,i)=>{
      const correct=showAnswer && t.change && t.change.at===i;
      const wrong=showAnswer && selected===i && selected!==correctAt(t);
      const cls='slot'+(selected===i && !showAnswer?' picked':'')+(correct?' correct':'')+(wrong?' incorrect':'');
      const tag=interactive?'button':'div';
      const props=interactive?' type="button" data-action="pick" data-index="'+i+'" aria-pressed="'+String(selected===i)+'"':'';
      return '<'+tag+' class="'+cls+'"'+props+'><span class="slot-id">'+String(i+1).padStart(2,'0')+'</span>'+iconSvg(item)+
          (correct?'<span class="corner-icon">✓</span>':'')+'</'+tag+'>';
    }).join('');
    return '<div class="board" aria-label="'+(variant==='A'?'画面A，共':'画面B，共')+list.length+'个观察区域">'+
      sceneHeader(t,variant)+'<div class="tiles cols-'+t.cols+'">'+s+'</div>'+
      '<p class="board-foot">位置编号固定，仅比较物品外观或标记；不需要记住名称。</p></div>';
  }
  function progress(){
    return '<div class="trackers">'+[1,2,3,4].map(n=>'<span class="tracker'+(index===n?' current':'')+(index>n?' done':'')+'"></span>').join('')+
      '</div><span class="progress-text">'+(index===0?'练习不计成绩':('正式体验 '+index+' / 4'))+'</span>';
  }
  function intro(){
    return '<section class="hero"><div class="hero-text">'+
      '<div class="eyebrow">能力探索 002 / VISUAL OBSERVATION</div>'+
      '<h1>你能发现<br><span>画面里悄悄发生的变化吗？</span></h1>'+
      '<p class="lead">来到潮汐码头，先观察货场，再看切换后的画面。你的任务是找到变化的位置，或判断两幅画面完全相同。</p>'+
      '<div class="how"><div><b>① 观察 A</b><small>记住物品和细节</small></div><div><b>② 观看 B</b><small>画面短暂切换</small></div><div><b>③ 做出判断</b><small>点位置，也可选“没变”</small></div></div>'+
      '<div class="start-row"><button type="button" class="btn primary big" data-action="start">开始热身体验 <span aria-hidden="true">→</span></button>'+
      '<span class="tiny">1道热身 + 4道体验题 · 不需要声音</span></div>'+
      '</div><div class="hero-art" aria-hidden="true">'+
      '<div class="preview-label">PORT / 02</div>'+
      '<div class="preview-grid">'+[0,1,2,3,4,5].map((_,i)=>'<div class="preview-cell">'+iconSvg(trials[0].items[i])+'</div>').join('')+'</div>'+
      '<p>视觉变化观察 · 现场体验</p></div></section>'+
      '<section class="info-rail"><div><strong>不设排行榜</strong><span>按你自己的节奏尝试</span></div>'+
      '<div><strong>可以重新观察</strong><span>重看次数会在最后提示</span></div>'+
      '<div><strong>不会上传数据</strong><span>本次记录仅保留在当前页面</span></div></section>'+
      '<p class="research">当前面向18岁及以上的成年人自愿体验。视觉注意、短时记忆、熟悉程度、屏幕显示都会影响结果；小游戏不能诊断或证明先天天赋。</p>';
  }
  function observe(t){
    const seconds=Math.max(0,Math.ceil(remaining/1000));
    return '<section class="task"><div class="task-top">'+progress()+'</div>'+
      '<div class="eyebrow">'+t.name+'</div><h1>观察画面 A</h1>'+
      '<p class="lead small">记住不同区域的物品外形、标记和位置。接下来将显示画面 B。</p>'+
      '<div class="timer-row"><span class="timer-bubble" id="timer-count">'+seconds+' 秒</span><div class="timer-track"><div id="timer-fill" style="width:'+Math.min(100,100*remaining/(t.seconds*1000))+'%"></div></div>'+
      '<span>自动切换</span></div>'+board(t,'A',false,false)+
      '<div class="action-line"><button type="button" class="btn primary" data-action="ready">记住了，显示画面 B</button>'+
      '<button type="button" class="btn outline" data-action="pause">暂停观察</button></div></section>';
  }
  function pausedView(){
    return '<section class="task center"><div class="eyebrow">观察已暂停</div><h1>需要的时候继续</h1><p>剩余观察时间不会在暂停期间减少。</p>'+
      '<button type="button" class="btn primary big" data-action="resume">继续观察 A</button></section>';
  }
  function maskView(){
    return '<section class="task center mask"><div class="mask-icon" aria-hidden="true">▦</div><div class="eyebrow">画面切换中</div><h1>现在准备比较</h1>'+
      '<p>先别回想答案，看清下一幅画面后再选择。</p></section>';
  }
  function compare(t){
    return '<section class="task"><div class="task-top">'+progress()+'</div>'+
      '<div class="eyebrow">'+t.name+'</div><h1>画面 B：哪里变了？</h1>'+
      '<p class="lead small">选择你认为变化的区域；如果所有物品都没变，请选择“两个画面相同”。</p>'+
      board(t,'B',true,false)+
      '<div class="decision"><button type="button" class="btn '+(selected===-1?'same-selected':'outline')+'" data-action="same" aria-pressed="'+String(selected===-1)+'">两个画面相同</button>'+
      '<button type="button" class="btn primary" data-action="submit"'+(selected===null?' disabled':'')+'>确认选择</button></div>'+
      '<div class="secondary-line"><button type="button" class="text-link" data-action="replay">重新看 A、B（已重看 '+reviews[index]+' 次）</button>'+
      '<button type="button" class="text-link" data-action="skip">不确定，跳过这一题</button></div></section>';
  }
  function feedback(t){
    const last=answers[answers.length-1];
    const status=last.choice===null?'本题已跳过':last.correct?'这次找对了！':'这次没有找准';
    const desc=last.choice===null?'跳过不算错误，保留为未作答。':last.correct?'你的判断与这次设定的变化一致。':'可以看看正确位置和变化的具体内容。';
    const tip=(index===2)?'<div class="learning"><b>观察小技巧</b><p>接下来换一个方法试试：先看四角，再按“从左到右、从上到下”的顺序扫描。最后一题还会换场景，看看方法能否用得上。</p></div>':'';
    return '<section class="task"><div class="task-top">'+progress()+'</div>'+
      '<div class="eyebrow">本次观察反馈</div><h1>'+status+'</h1><p class="lead small">'+desc+'</p>'+
      (t.change?board(t,'B',false,true):'<div class="no-change">✓ 正确情况：全部区域相同，没有任何一处变化。</div>')+
      '<div class="explanation"><b>变化依据</b><p>'+t.explain+'</p></div>'+
      tip+'<div class="action-line"><button class="btn primary big" type="button" data-action="next">'+
      (index===0?'进入正式体验':index<4?'继续第 '+(index+1)+' 题':'查看本次体验结果')+' →</button></div></section>';
  }
  function result(){
    const attempted=countFormal(),correct=totalCorrect();
    const actual=answers.filter(a=>a.index>0);
    return '<section class="task result"><div class="eyebrow">能力探索 002 / 本次体验完成</div><h1>你完成了视觉观察任务</h1>'+
      '<p class="lead small">这是本次任务的可复查表现，不是天赋等级或能力诊断。</p>'+
      '<div class="result-grid"><div><b>'+correct+'</b><span>答对的正式题数</span></div>'+
      '<div><b>'+attempted+' / 4</b><span>已作答题数</span></div>'+
      '<div><b>'+reviews.slice(1).reduce((a,b)=>a+b,0)+'</b><span>正式题重看次数</span></div></div>'+
      '<div class="summary"><h2>逐题回看</h2>'+
      actual.map(a=>'<div class="summary-row"><b>第 '+a.index+' 题 · '+trials[a.index].zone+'</b><span>'+
        (a.choice===null?'跳过':a.correct?'判断正确':'判断有误')+'</span></div>').join('')+'</div>'+
      '<div class="learning"><b>这次可以观察到什么？</b><p>任务涉及视觉细节、短时记忆和变化察觉。重复观察和新场景迁移能提供一些学习线索，但4道题不足以判断是否具有稳定优势，更不能证明天生具备某种天赋。</p></div>'+
      '<div class="action-line"><button class="btn primary" type="button" data-action="restart">再体验一遍</button>'+
      '<a class="btn outline" href="../">回到潜星计划</a><a class="btn outline" href="../music/?first=1">回顾第01项 · 音乐感知</a></div></section>';
  }
  function render(){
    if(stage==='intro')app.innerHTML=intro();
    else if(stage==='observe')app.innerHTML=observe(trial());
    else if(stage==='paused')app.innerHTML=pausedView();
    else if(stage==='mask')app.innerHTML=maskView();
    else if(stage==='compare')app.innerHTML=compare(trial());
    else if(stage==='feedback')app.innerHTML=feedback(trial());
    else if(stage==='result')app.innerHTML=result();
  }
  function runTimer(ms){
    remaining=ms;
    timerBudget=ms;
    startAt=Date.now();
    if(ticker!==null)clearInterval(ticker);
    ticker=setInterval(()=>{
      if(stage!=='observe')return;
      const r=Math.max(0,ms-(Date.now()-startAt));
      remaining=r;
      const counter=document.getElementById('timer-count');
      const fill=document.getElementById('timer-fill');
      if(counter)counter.textContent=Math.ceil(r/1000)+' 秒';
      if(fill)fill.style.width=Math.max(0,100*r/(trial().seconds*1000))+'%';
      if(r<=0)toMask();
    },120);
  }
  function startRound(){
    clearClocks();selected=null;remaining=trial().seconds*1000;screen('observe',true);runTimer(remaining);
  }
  function toMask(){
    if(stage!=='observe')return;
    clearClocks();screen('mask',true);maskTimer=setTimeout(()=>{maskTimer=null;screen('compare',true)},650);
  }
  function pause(){
    if(stage!=='observe')return;
    remaining=Math.max(0,timerBudget-(Date.now()-startAt));
    clearClocks();screen('paused',false);
  }
  function submit(choice){
    if(stage!=='compare')return;
    const correct=choice!==null&&choice===correctAt(trial());
    answers.push({index,choice,correct,replays:reviews[index]});
    selected=choice;
    screen('feedback',true);
  }
  function next(){
    if(stage!=='feedback')return;
    if(index===4){screen('result',true);return;}
    index++;startRound();
  }
  app.addEventListener('click',function(event){
    const b=event.target.closest('[data-action]');
    if(!b || !app.contains(b) || b.disabled)return;
    const action=b.getAttribute('data-action');
    if(action==='start'||action==='restart'){index=0;answers=[];reviews=[0,0,0,0,0];startRound();}
    else if(action==='ready')toMask();
    else if(action==='pause')pause();
    else if(action==='resume'&&stage==='paused'){screen('observe',false);runTimer(remaining);}
    else if(action==='pick'&&stage==='compare'){selected=Number(b.dataset.index);render();}
    else if(action==='same'&&stage==='compare'){selected=-1;render();}
    else if(action==='submit'&&selected!==null)submit(selected);
    else if(action==='skip')submit(null);
    else if(action==='replay'&&stage==='compare'){reviews[index]++;startRound();}
    else if(action==='next')next();
  });
  document.addEventListener('visibilitychange',function(){if(document.hidden && stage==='observe')pause();});
  render();
  window.QX_VISION_QA={getState:()=>({stage,index,selected,answers:answers.map(x=>Object.assign({},x)),reviews:reviews.slice(),visibleItems:trial()?trial().items.length:0}),trials:trials.map(x=>({name:x.name,kind:x.kind,changedIndex:correctAt(x)}))};
})();