(function(){
"use strict";
const all=window.QX_ATLAS||[],modes=window.QX_MODE_LABELS||{},app=document.getElementById('app');
if(all.length!==108){app.textContent='活动内容尚未完整加载，请稍后刷新。';return;}
const COLORS=['#ffffff','#1ca49b','#f2af43','#669acb','#f17b74','#8477bd','#8ebd69'];
const PITCHES=[0,293.66,349.23,440.00,523.25,587.33];
const PITCH_NAMES=['休止','D4','F4','A4','C5','D5'];
const KEY='qx-atlas-explicit-progress-v1';
let filter='',category='all',s=null,timer=null,audioContext=null,audioNodes=[],lastFocus='',lastScroll=0;
let saved=new Set();
try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(x))saved=new Set(x.map(Number).filter(n=>n>=3&&n<=108))}catch(_){}
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const split=x=>String(x||'').split('|').filter(Boolean);
const n2=n=>String(n).padStart(2,'0');
const topic=id=>all[id-1];
const modeName=t=>modes[t.mode]||'探索';
const button=(label,action,clazz,attrs)=>'<button type="button" class="btn '+(clazz||'')+'" data-action="'+action+'" '+(attrs||'')+'>'+label+'</button>';
const href=id=>id<3?topic(id).url:('./?id='+id);
function clean(){
 if(timer!==null){clearTimeout(timer);timer=null;}
 audioNodes.forEach(x=>{try{x.stop()}catch(_){}});audioNodes=[];
}
function fresh(t){
 return {id:t.id,selected:null,selectedSet:new Set(),order:split(t.payload).map((_,i)=>i),draft:'',grid:Array(20).fill(0),color:1,
  notes:[0,0,0,0,0,0,0,0],checks:new Set(),budget:[30,30,40],modified:false,phase:'ready',timings:[],repeat:0,submitted:false,feedback:null,memStage:'intro',visibleUntil:0};
}
function launch(id,replace){
 const t=topic(id);
 if(!t)return;
 if(t.mode==='existing'){location.href=t.url;return;}
 clean();s=fresh(t);
 const path=location.pathname+'?id='+id;
 if(replace)history.replaceState({},'',path);else history.pushState({},'',path);
 draw();window.scrollTo(0,0);
}
function gotoCatalog(push){
 clean();s=null;
 if(push)history.pushState({},'',location.pathname);
 draw();window.scrollTo(0,0);
}
function resumeRoute(){
 const x=new URLSearchParams(location.search).get('id'),id=Number(x);
 if(x!==null&&Number.isInteger(id)&&id>=1&&id<=108){
  if(id<=2){location.replace(topic(id).url);return;}
  clean();s=fresh(topic(id));
 }else{clean();s=null}
 draw();
}
function catalogCard(t){
 const link=href(t.id);
 return '<a class="item" href="'+esc(link)+'" data-open="'+t.id+'"><div class="item-head"><span class="no">'+n2(t.id)+'</span>'+
 '<span class="tag">'+esc(modeName(t))+'</span></div><h3>'+esc(t.title)+'</h3><p>'+esc(t.scene)+'</p>'+
 '<div class="item-tail"><span>'+esc(t.family)+'</span><span>'+(saved.has(t.id)?'<span class="done-mark">已自行保存</span>':'进入体验 →')+'</span></div></a>';
}
function listCards(){
 const selected=all.filter(t=>(category==='all'||t.family===category)&&(!filter||((t.title+' '+t.scene+' '+t.family+' '+modeName(t)).toLowerCase().includes(filter.toLowerCase()))));
 return '<p class="result-line">当前显示 '+selected.length+' / 108 项 · 第01、02项保留独立完整页面，其余106项在这里体验。</p>'+
 (selected.length?'<div class="cards">'+selected.map(catalogCard).join('')+'</div>':'<div class="panel">没有找到匹配的活动。试试换一个词或清除筛选。</div>');
}
function catalog(){
 const fams=[...new Set(all.map(x=>x.family))];
 return '<section class="hero"><div><div class="eyebrow">QIANXING · EXPLORE 108</div><h1>试一试你还没做过的事<br><em>发现另一种可能</em></h1>'+
 '<p class="lead">从音乐感知、视觉变化，到空间推理、写作、设计、历史考据、科学观察、模拟决策与现实实践。每项都有可完成的动作与具体反馈，而不是108个相似的选择题。</p>'+
 '<div class="hero-actions">'+button('从第03项开始：空间想象 →','jump3','primary')+
 '<a class="btn ghost" href="../music/?first=1">第01项·音乐</a><a class="btn ghost" href="../vision/">第02项·视觉</a></div></div>'+
 '<div class="hero-art" aria-hidden="true"><span class="orbits"></span><span class="hero-num">108</span><small>ACTIVITIES / EXPLORATIONS</small></div></section>'+
 '<div class="metrics"><div class="metric"><strong>108</strong><span>不同主题的体验入口</span></div>'+
 '<div class="metric"><strong>106</strong><span>第03—108项新活动</span></div><div class="metric"><strong>'+saved.size+'</strong><span>自主保存至本机的进度</span></div></div>'+
 '<div class="section-title"><h2>探索目录</h2><span class="muted tiny">你可以任意选择，不必按顺序进行。</span></div>'+
 '<div class="filterbar"><input id="catalog-search" type="search" placeholder="搜索：空间、编程、创作、记忆……" aria-label="搜索活动" value="'+esc(filter)+'">'+
 '<select id="catalog-filter" aria-label="按领域筛选"><option value="all">全部探索领域</option>'+fams.map(f=>'<option value="'+esc(f)+'"'+(f===category?' selected':'')+'>'+esc(f)+'</option>').join('')+'</select></div>'+
 '<div id="catalog-results">'+listCards()+'</div>'+
 '<div class="notice"><strong>重要边界：</strong>这些是来源于108项跨领域选题素材的互动活动，不是科学确认的108种独立天赋。网页短任务容易受已有经验、设备、练习和偶然因素影响；力量、平衡、味觉、嗅觉、实际手艺等需要安全的真实场景，本站只提供规划或自愿观察，不作测量结论。当前默认不上传数据。</div>';
}
function navLine(t){
 const prev=t.id>1?'<a href="'+esc(href(t.id-1))+'" data-open="'+(t.id-1)+'">← 第'+n2(t.id-1)+'项</a>':'';
 return '<div class="trial-head"><div class="trail">108项探索 · 第 <b>'+n2(t.id)+'</b> / 108 项 · '+esc(t.family)+'</div>'+
 '<div class="trial-head">'+prev+'<a href="./" data-action="catalog">查看全部活动</a></div></div>';
}
function taskHeader(t){
 return '<div class="eyebrow">EXPLORATION '+n2(t.id)+'</div><h1 class="act-title">'+esc(t.title)+'</h1>'+
 '<div class="act-scene">'+esc(t.scene)+'</div><p class="act-task">'+esc(t.task)+'</p>'+
 '<span class="mode-label">'+esc(modeName(t))+'</span>';
}
function footerNext(t){
 const next=t.id<108?'<a class="btn primary" href="'+esc(href(t.id+1))+'" data-open="'+(t.id+1)+'">进入第'+n2(t.id+1)+'项 →</a>':'<a class="btn primary" href="./" data-action="catalog">全部108项已列出 · 返回目录</a>';
 return '<div class="footer-nav">'+next+'<a class="btn ghost" href="./" data-action="catalog">回目录</a>'+
 (s&&s.submitted?button('再试一次','retry','ghost'):'')+'</div>';
}
function tiles(t){
 const arr=split(t.payload);
 return '<div class="choice-list">'+arr.map((c,i)=>'<button type="button" class="choice-card'+(s.selected===i?' selected':'')+'" data-action="choice" data-value="'+i+'" aria-pressed="'+(s.selected===i)+'"><span class="letter">'+String.fromCharCode(65+i)+'</span><span>'+esc(c)+'</span></button>').join('')+'</div>';
}
function multiple(t){
 const arr=split(t.payload);
 return '<div class="choice-list">'+arr.map((c,i)=>'<button type="button" class="choice-card'+(s.selectedSet.has(i)?' selected':'')+'" data-action="evidence" data-value="'+i+'" aria-pressed="'+s.selectedSet.has(i)+'"><span class="letter">'+(s.selectedSet.has(i)?'✓':String.fromCharCode(65+i))+'</span><span>'+esc(c)+'</span></button>').join('')+'</div>';
}
function orderPuzzle(t){
 const a=split(t.payload);
 return '<div class="order-list">'+s.order.map((orig,i)=>'<div class="order-row"><b class="order-n">'+(i+1)+'</b>'+
 '<span class="order-copy">'+esc(a[orig])+'</span><span class="order-ctrl">'+button('↑','move','mini','data-value="'+i+'" data-dir="-1" aria-label="上移第'+(i+1)+'步"'+(i===0?' disabled':''))+
 button('↓','move','mini','data-value="'+i+'" data-dir="1" aria-label="下移第'+(i+1)+'步"'+(i===a.length-1?' disabled':''))+'</span></div>').join('')+'</div>';
}
function writing(t,field){
 const constraints=split(t.payload);
 return '<div class="guides">'+constraints.map(x=>'<span class="guide">✓ '+esc(x)+'</span>').join('')+'</div>'+
 '<label for="draft" class="muted tiny">'+(field?'观察或计划记录（自愿填写，不上传）':'你的第一稿（支持修改）')+'</label>'+
 '<textarea id="draft" class="text-area" maxlength="1800" placeholder="'+(field?'例如：我准备怎样做、哪一步需要注意安全……':'先写出一个版本，再检查上方的条件。')+'">'+esc(s.draft)+'</textarea>'+
 '<div class="text-cnt"><span>只存在于本次页面内，不自动保存</span><span id="char-count">'+s.draft.length+' 字</span></div>';
}
function paint(t){
 return '<div class="guides">'+split(t.payload).map(x=>'<span class="guide">'+esc(x)+'</span>').join('')+'</div>'+
 '<div class="drawing"><div class="paint-grid" role="group" aria-label="20格创作画布">'+s.grid.map((color,i)=>'<button type="button" class="paint-cell" style="background:'+COLORS[color]+'" data-action="paint" data-value="'+i+'" aria-label="画布第'+(i+1)+'格，当前颜色'+(color||'空白')+'"></button>').join('')+'</div>'+
 '<div><h3>选择颜色</h3><div class="paint-tools">'+COLORS.map((color,i)=>'<button class="swatch'+(s.color===i?' current':'')+'" type="button" style="background:'+color+'" data-action="color" data-value="'+i+'" aria-label="'+(i?'颜色'+i:'橡皮擦')+'" aria-pressed="'+(s.color===i)+'"></button>').join('')+'</div>'+
 '<p class="panel-note">点击色块选颜色，再点击画布中的格子。白色可擦除。完成后可以观察颜色、面积与视觉重心。</p>'+
 button('清空画布','clearPaint','mini ghost')+'</div></div>';
}
function pad(t){
 return '<div class="guides">'+split(t.payload).map(x=>'<span class="guide">'+esc(x)+'</span>').join('')+'</div>'+
 '<p class="panel-note">按一下方格切换音高：休止 → D4 → F4 → A4 → C5 → D5 → 休止。音量已限制，建议先用较低系统音量。</p>'+
 '<div class="music-steps">'+s.notes.map((n,i)=>'<button type="button" class="note-step'+(n===0?' rest':'')+'" data-action="tone" data-value="'+i+'" aria-label="第'+(i+1)+'拍 '+PITCH_NAMES[n]+'"><small>拍 '+(i+1)+'</small><b>'+PITCH_NAMES[n]+'</b></button>').join('')+'</div>'+
 '<div class="action-bar">'+button('试听你的8拍短句','playAudio','primary')+button('使用新旋律起点','refreshAudio','ghost')+'</div>';
}
const SHAPES=[
 [[0,0,0],[1,0,1],[1,1,2],[2,1,3]],
 [[0,1,0],[1,0,1],[1,1,2],[2,2,3]],
 [[0,2,0],[1,2,1],[1,1,2],[2,1,3]],
 [[0,0,0],[0,1,1],[1,1,2],[2,2,3]],
 [[0,1,0],[1,1,1],[2,1,2],[2,0,3]]
];
function rotate(r,c,k){
 for(let i=0;i<k;i++){const nextR=c,nextC=2-r;r=nextR;c=nextC}
 return [r,c];
}
function geometry(t,degrees,compact){
 const cells=SHAPES[t.originalId%SHAPES.length],map=new Map();
 cells.forEach(([r,c,color])=>{const [nr,nc]=rotate(r,c,degrees/90);map.set(nr*3+nc,color+1)});
 return '<div class="mini-grid'+(compact?' compact':'')+'" aria-label="三乘三色块示意">'+
 Array.from({length:9},(_,i)=>'<span class="mini-dot" style="background:'+(map.has(i)?COLORS[map.get(i)]:'#f4f8fa')+'"></span>').join('')+'</div>';
}
function spatial(t){
 const rotations=[0,90,180,270];const k=t.originalId%4;
 const order=rotations.map((_,i)=>rotations[(i+k)%4]);
 return '<div class="space-row"><div><h3>初始形状（面向正北）</h3><div class="space-sample">'+geometry(t,0,false)+'</div><p class="panel-note">按照本题要求进行整体旋转（'+(Number(t.answer)===270?'逆时针90°':'顺时针'+t.answer+'°')+'）。注意不要做镜像。</p></div>'+
 '<div><h3>选出旋转后的形状</h3><div class="space-options">'+order.map((degrees,i)=>'<button type="button" class="space-choice'+(s.selected===degrees?' selected':'')+'" data-action="spatial" data-value="'+degrees+'" aria-pressed="'+(s.selected===degrees)+'">'+geometry(t,degrees,true)+'<span>选项 '+String.fromCharCode(65+i)+'</span></button>').join('')+'</div></div></div>';
}
function memory(t){
 const w=split(t.payload),pos=Number(t.answer);
 if(s.memStage==='intro')return '<p class="muted">按开始后将显示6个词条，观察7秒自动隐藏。随后请找出其中指定位置的词条。</p>'+button('开始记忆','memoryStart','primary');
 if(s.memStage==='show')return '<div class="memory-progress">记住顺序，显示即将结束（约7秒）</div>'+
 '<div class="memory-shown">'+w.map((x,i)=>'<div class="memory-item"><small>位置 '+(i+1)+'</small><strong>'+esc(x)+'</strong></div>').join('')+'</div>'+
 '<div class="action-bar">'+button('已经记住，开始作答','memoryHide','ghost')+'</div>';
 const opts=[w[pos],w[(pos+2)%6],w[(pos+3)%6],w[(pos+5)%6]];
 const shift=t.originalId%4;const shifted=opts.map((_,i)=>opts[(i+shift)%4]);
 return '<p class="muted">刚才排列的第 <strong>'+(pos+1)+'</strong> 个词条是什么？</p>'+
 '<div class="choice-list">'+shifted.map((x,i)=>'<button type="button" class="choice-card'+(s.selected===x?' selected':'')+'" data-action="memoryChoice" data-value="'+esc(x)+'">'+
 '<span class="letter">'+String.fromCharCode(65+i)+'</span>'+esc(x)+'</button>').join('')+'</div>';
}
function timing(t){
 const estimate=t.answer==='estimate',values=s.timings;
 if(s.phase==='waiting')return '<div class="timer-box"><div class="time-circle wait">准备……</div><p class="muted">请不要提前点击；目标出现后再按下。</p>'+button('我提前点了，重新开始','early','ghost')+'</div>';
 if(s.phase==='go')return '<div class="timer-box"><button class="time-circle go" type="button" data-action="timeStop" aria-label="立即点击反应目标">现在点击!</button><p class="muted">刚刚出现的目标，请尽快点击。</p></div>';
 if(s.phase==='running')return '<div class="timer-box"><div class="time-circle">计时中</div>'+button('停止计时','timeStop','primary')+'<p class="muted">凭感觉在5秒时停止，不显示实时秒数。</p></div>';
 return '<div class="timer-box"><div class="time-circle">'+(estimate?'5.0s':'READY')+'</div>'+
 '<p class="muted">'+(estimate?'按下后估计5秒，再按停止。':'开始后会随机等待，信号变绿时点击。')+'</p>'+
 button(values.length?'继续下一轮 · '+(values.length+1)+'/3':'开始第一轮','timeStart','primary')+
 '<p class="panel-note">已记录 '+values.length+' / 3 次'+(values.length?'; 上次 '+values[values.length-1].toFixed(2)+(estimate?'秒':'毫秒'):'')+'。</p></div>';
}
function budget(t){
 const labels=split(t.payload),sum=s.budget.reduce((a,b)=>a+b,0);
 return '<p class="panel-note">设总量为100点，调整下列三个投入。每个投入有机会成本；这里只呈现比例，不生成虚假的盈利或健康预测。</p>'+
 '<div>'+labels.map((label,i)=>'<div class="budget-row"><label for="budget-'+i+'">'+esc(label)+'</label>'+
 '<input id="budget-'+i+'" data-index="'+i+'" type="range" min="0" max="100" step="5" value="'+s.budget[i]+'" aria-label="'+esc(label)+'">'+
 '<b id="budget-label-'+i+'">'+s.budget[i]+'</b></div>').join('')+'</div>'+
 '<div class="budget-visual" aria-label="三项投入占比">'+s.budget.map((v,i)=>'<div id="budget-bar-'+i+'" style="width:'+v+'%"></div>').join('')+'</div>'+
 '<p class="panel-note">已分配 <span id="budget-total" class="budget-sum'+(sum>100?' over':'')+'">'+sum+'</span> / 100 点。'+
 '未分配的部分表示留作机动。合计超过100点时不能提交。</p>';
}
function offline(t){
 return '<div class="notice" style="margin:0 0 18px"><strong>真实能力不能由屏幕直接测量。</strong>本题是安全准备、步骤记录或自愿现实观察；不要为了完成网站尝试不熟悉、危险或身体不适的动作。</div>'+
 '<p class="panel-note">可选地勾选你已经考虑的步骤；不需要证明现实中完成，也可以只做文字计划。</p>'+
 '<div class="checks">'+split(t.payload).map((x,i)=>'<label class="checkline"><input type="checkbox" data-check="'+i+'"'+(s.checks.has(i)?' checked':'')+'><span>'+esc(x)+'</span></label>').join('')+'</div>'+
 '<div style="margin-top:20px">'+writing(t,true)+'</div>';
}
function modePanel(t){
 if(t.mode==='c'||t.mode==='s')return tiles(t);
 if(t.mode==='e')return multiple(t);
 if(t.mode==='o')return orderPuzzle(t);
 if(t.mode==='w')return writing(t,false);
 if(t.mode==='d')return paint(t);
 if(t.mode==='a')return pad(t);
 if(t.mode==='p')return spatial(t);
 if(t.mode==='m')return memory(t);
 if(t.mode==='t')return timing(t);
 if(t.mode==='n')return budget(t);
 if(t.mode==='f')return offline(t);
 return '<p>此活动暂时无法加载。</p>';
}
function canSubmit(t){
 switch(t.mode){
 case 'c':case 's':case 'p':return s.selected!==null;
 case 'e':return s.selectedSet.size===2;
 case 'o':return true;
 case 'w':return s.draft.trim().length>=3;
 case 'd':return s.grid.some(x=>x!==0);
 case 'a':return s.notes.filter(x=>x!==0).length>=2;
 case 'm':return s.memStage==='quiz'&&s.selected!==null;
 case 't':return s.timings.length===3;
 case 'n':return s.modified&&s.budget.reduce((a,b)=>a+b,0)<=100;
 case 'f':return s.checks.size>0||s.draft.trim().length>0;
 }
 return false;
}
function trial(){
 const t=topic(s.id);
 return '<div class="trial">'+navLine(t)+'<article class="activity">'+taskHeader(t)+
 (s.submitted?feedbackPanel(t):'<div class="panel"><h3>你要完成的操作</h3>'+modePanel(t)+
 (t.mode==='t'?'':('<div class="action-bar">'+button(
 t.mode==='w'?'查看创作反馈':t.mode==='f'?'完成本次安全观察':t.mode==='d'?'完成这张构图':t.mode==='a'?'记录这段旋律':t.mode==='n'?'查看本次分配':t.mode==='s'?'查看选择的后果':'提交判断',
 'submit','primary',canSubmit(t)?'':'disabled')+'</div>'))+
 '</div><div class="notice"><strong>体验提示：</strong>如果第一次没做好，可以重新尝试；这只是一项任务的表现，不代表能力标签。</div>')+
 '</article>'+ (s.submitted?footerNext(t):'') +'</div>';
}
function feedbackPanel(t){
 const f=s.feedback;
 return '<section class="feedback"><div class="eyebrow">YOUR EXPLORATION / RESULT</div><h3>'+esc(f.heading)+'</h3>'+
 '<p>'+esc(f.summary)+'</p>'+
 (f.fact?'<div class="fact">'+esc(f.fact)+'</div>':'')+
 (f.notes&&f.notes.length?'<ul class="self-checks">'+f.notes.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+
 '<p><b>活动回看：</b>'+esc(t.detail)+'</p>'+
 '<p class="tiny muted">请注意：这一结果不等于独立天赋测试、智力分数、临床结论或职业适配判断。</p>'+
 '<div class="action-bar">'+button(saved.has(t.id)?'已保存至本机':'自主保存“已尝试”进度','save','ghost',saved.has(t.id)?'disabled':'')+
 '<span class="tiny muted">仅在你点击后保存活动编号，不保存回答、作品或敏感内容。</span></div></section>';
}
function draw(){
 app.innerHTML=s?trial():catalog();
}
function feedback(head,summary,fact,notes){
 s.feedback={heading:head,summary:summary,fact:fact||'',notes:notes||[]};
 s.submitted=true;clean();draw();window.scrollTo(0,0);
}
function submit(){
 if(!s)return;const t=topic(s.id),parts=split(t.payload);
 if(!canSubmit(t))return;
 if(t.mode==='c'){
  const target=Number(t.answer),correct=s.selected===target;
  feedback(correct?'判断与规则一致':'可以再看看推理过程',correct?'你选择的答案符合题目给出的条件。':'这是当前问题里的一次判断，不是能力结论。','参考选项：'+String.fromCharCode(65+target)+' · '+parts[target]);
 }else if(t.mode==='e'){
  const a=s.selectedSet,b=new Set(String(t.answer).split(',').map(Number));const correct=a.size===b.size&&[...a].every(x=>b.has(x));
  feedback(correct?'你找到了两条关键证据':'这些信息的支持力度不同',correct?'你的两项证据选择与本题设计一致。':'本题重点是证据能否直接对应问题，注意材料的出处和可追溯性。',
  '本题较有力的线索：'+[...b].map(i=>parts[i]).join('；'));
 }else if(t.mode==='o'){
  const seq=String(t.answer).split(',').map(Number),hits=seq.filter((n,i)=>n===s.order[i]).length;
  feedback(hits===seq.length?'步骤顺序清晰':'顺序还有调整空间','本次有 '+hits+' / '+seq.length+' 个位置与示例流程一致。艺术类步骤允许其他有解释的安排。',
   '本题参考顺序：'+seq.map((n,i)=>(i+1)+'．'+parts[n]).join('\n'));
 }else if(t.mode==='p'){
  const target=Number(t.answer);
  feedback(s.selected===target?'旋转方向正确':'再区分旋转和镜像','你选择的是顺时针 '+s.selected+'° 的布局。','目标是顺时针 '+target+'°。观察形状每个颜色格的相对位置。');
 }else if(t.mode==='m'){
  const target=parts[Number(t.answer)];
  feedback(s.selected===target?'这次记住了指定位置':'这次可以用新的记忆办法','你回答的是“'+s.selected+'”。','第 '+(Number(t.answer)+1)+' 个项目是“'+target+'”。');
 }else if(t.mode==='s'){
  const responses=split(t.answer);
  feedback('这是你选择的处理方式','情境里通常有多个需兼顾的目标，可以比较选项带来的后果。',
   '你选择：'+parts[s.selected]+'\n可能的后果：'+(responses[s.selected]||'需要更多事实才能判断。'),
   ['也可以重新体验，选择另一条路线，比较其潜在优点与代价。']);
 }else if(t.mode==='w'||t.mode==='f'){
  feedback('你留下了一次可修改的尝试',t.mode==='w'?'这是一份初稿，没有自动机器评分。你可以对照三条约束再改一次。':'以下是本次自愿记录。现实技能与身体表现未被网页测量。',
   s.draft.trim()?'你的记录：\n'+s.draft.trim():'本次只勾选了 '+s.checks.size+' 项准备要点。',
   parts.map(x=>'自己检查：'+x));
 }else if(t.mode==='d'){
  const filled=s.grid.filter(n=>n).length,distinct=new Set(s.grid.filter(Boolean)).size;
  feedback('完成了一张可继续修改的色块草图','你使用了 '+distinct+' 种颜色，填充 '+filled+' / 20 格。','回看颜色分布、留白和主体所在区域。',
  parts.map(x=>'回看：'+x));
 }else if(t.mode==='a'){
  const filled=s.notes.filter(Boolean).length,distinct=new Set(s.notes.filter(Boolean)).size,rests=8-filled;
  feedback('你编出了一段8拍短句','其中有 '+filled+' 个发声拍、'+rests+' 个休止拍、'+distinct+' 种不同音高。',
  '本次音型：'+s.notes.map(x=>PITCH_NAMES[x]).join(' · '),parts.map(x=>'听后调整：'+x));
 }else if(t.mode==='n'){
  const sum=s.budget.reduce((a,b)=>a+b,0),entries=parts.map((name,i)=>name+' '+s.budget[i]+'点');
  feedback('完成了一次资源取舍','你分配了 '+sum+' / 100点，剩余 '+(100-sum)+' 点机动空间。',
  entries.join(' · '),['哪一项成为主要瓶颈？','如果需求突然变化，你会从哪里调整？']);
 }else if(t.mode==='t'){
  completeTime(t);
 }
}
function completeTime(t){
 if(!s||s.timings.length<3)return;
 const vals=s.timings,estimate=t.answer==='estimate',avg=vals.reduce((a,b)=>a+b,0)/vals.length;
 feedback('完成了三次时间操作',estimate?'你对5秒的主观估计完成了三次。':'你记录了三次视觉信号的鼠标或触控反应。',
  (estimate?'每次估计：'+vals.map(x=>x.toFixed(2)+'秒').join('、')+'；平均绝对误差约'+(vals.reduce((a,b)=>a+Math.abs(b-5),0)/3).toFixed(2)+'秒':
   '三次响应：'+vals.map(x=>x.toFixed(0)+'毫秒').join('、')+'；平均'+avg.toFixed(0)+'毫秒')+'。');
}
function playMotif(){
 if(!s)return;
 const AC=window.AudioContext||window.webkitAudioContext;
 if(!AC){alert('当前浏览器不支持音频合成，仍可排列音符并记录你的作品。');return;}
 try{
  if(!audioContext)audioContext=new AC();
  if(audioContext.state==='suspended')void audioContext.resume();
  audioNodes.forEach(x=>{try{x.stop()}catch(_){}});audioNodes=[];
  s.notes.forEach((x,i)=>{
   if(!x)return;
   const osc=audioContext.createOscillator(),amp=audioContext.createGain();
   const start=audioContext.currentTime+.055+i*.28;
   osc.type='sine';osc.frequency.value=PITCHES[x];
   amp.gain.setValueAtTime(0.0001,start);
   amp.gain.exponentialRampToValueAtTime(.11,start+.015);
   amp.gain.exponentialRampToValueAtTime(.0001,start+.24);
   osc.connect(amp);amp.connect(audioContext.destination);
   osc.start(start);osc.stop(start+.25);audioNodes.push(osc);
  });
 }catch(err){alert('声音无法播放，仍可编辑并查看音型。')}
}
function startTime(){
 if(!s||s.submitted)return;
 clean();
 const isEstimate=topic(s.id).answer==='estimate';
 if(isEstimate){s.phase='running';s.started=performance.now();draw();}
 else{
  s.phase='waiting';draw();
  const expected=s.id;
  timer=setTimeout(()=>{timer=null;if(s&&s.id===expected&&s.phase==='waiting'){s.phase='go';s.started=performance.now();draw()}},800+Math.round(Math.random()*1500));
 }
}
function stopTime(){
 if(!s||!(s.phase==='running'||s.phase==='go'))return;
 const elapsed=performance.now()-s.started;
 const estimate=topic(s.id).answer==='estimate';
 s.timings.push(estimate?elapsed/1000:elapsed);
 s.phase='ready';
 if(s.timings.length>=3)completeTime(topic(s.id));else draw();
}
function startMemory(){
 if(!s||s.memStage!=='intro')return;
 s.memStage='show';draw();
 const id=s.id;
 timer=setTimeout(()=>{timer=null;if(s&&s.id===id&&s.memStage==='show'){s.memStage='quiz';draw()}},7000);
}
function markSaved(){
 if(!s||!s.submitted)return;
 const id=s.id;
 try{saved.add(id);localStorage.setItem(KEY,JSON.stringify([...saved].sort((a,b)=>a-b)));draw();}
 catch(_){alert('浏览器限制了本机存储，本次仍可体验。')}
}
function handlerClick(event){
 const a=event.target.closest('[data-action],[data-open]');if(!a||!app.contains(a))return;
 if(a.hasAttribute('data-open')){
  const id=Number(a.dataset.open);
  if(id>=3&&id<=108){event.preventDefault();launch(id);return;}
  return;
 }
 const action=a.dataset.action,val=a.dataset.value;
 if(action==='catalog'){event.preventDefault();gotoCatalog(true);return;}
 if(action==='jump3'){launch(3);return;}
 if(!s||s.submitted&&(action!=='retry'&&action!=='save'))return;
 const t=topic(s.id);
 if(action==='choice'){s.selected=Number(val);draw();}
 else if(action==='evidence'){const v=Number(val);if(s.selectedSet.has(v))s.selectedSet.delete(v);else if(s.selectedSet.size<2)s.selectedSet.add(v);draw();}
 else if(action==='spatial'){s.selected=Number(val);draw();}
 else if(action==='memoryChoice'){s.selected=val;draw();}
 else if(action==='move'){const i=Number(val),j=i+Number(a.dataset.dir);if(j>=0&&j<s.order.length){[s.order[i],s.order[j]]=[s.order[j],s.order[i]];draw();}}
 else if(action==='paint'){s.grid[Number(val)]=s.color;draw();}
 else if(action==='color'){s.color=Number(val);draw();}
 else if(action==='clearPaint'){s.grid.fill(0);draw();}
 else if(action==='tone'){s.notes[Number(val)]=(s.notes[Number(val)]+1)%PITCH_NAMES.length;draw();}
 else if(action==='refreshAudio'){s.notes=s.notes.map((_,i)=>(i+1+s.id)%PITCH_NAMES.length);draw();}
 else if(action==='playAudio'){playMotif();}
 else if(action==='memoryStart'){startMemory();}
 else if(action==='memoryHide'){if(timer!==null){clearTimeout(timer);timer=null;}s.memStage='quiz';draw();}
 else if(action==='timeStart'){startTime();}
 else if(action==='timeStop'){stopTime();}
 else if(action==='early'){clean();s.phase='ready';draw();}
 else if(action==='submit'){submit();}
 else if(action==='retry'){clean();s=fresh(t);draw();}
 else if(action==='save'){markSaved();}
}
app.addEventListener('click',handlerClick);
app.addEventListener('input',e=>{
 if(e.target.id==='catalog-search'){
  filter=e.target.value;
  const dst=document.getElementById('catalog-results');
  if(dst)dst.innerHTML=listCards();
 }else if(s&&e.target.id==='draft'){
  s.draft=e.target.value;
  const count=document.getElementById('char-count');if(count)count.textContent=s.draft.length+' 字';
  const submitButton=app.querySelector('[data-action="submit"]');if(submitButton)submitButton.disabled=!canSubmit(topic(s.id));
 }else if(s&&e.target.id&&e.target.id.startsWith('budget-')){
  const idx=Number(e.target.dataset.index);
  if(!Number.isInteger(idx)||idx<0||idx>2)return;
  s.budget[idx]=Number(e.target.value);s.modified=true;
  const total=s.budget.reduce((a,b)=>a+b,0);
  const l=document.getElementById('budget-label-'+idx),bar=document.getElementById('budget-bar-'+idx),count=document.getElementById('budget-total');
  if(l)l.textContent=s.budget[idx];
  if(bar)bar.style.width=s.budget[idx]+'%';
  if(count){count.textContent=total;count.className='budget-sum'+(total>100?' over':'');}
  const b=app.querySelector('[data-action="submit"]');if(b)b.disabled=!s.modified||total>100;
 }
});
app.addEventListener('change',e=>{
 if(e.target.id==='catalog-filter'){category=e.target.value;const dst=document.getElementById('catalog-results');if(dst)dst.innerHTML=listCards();}
 else if(s&&e.target.hasAttribute('data-check')){
  const idx=Number(e.target.dataset.check);
  if(e.target.checked)s.checks.add(idx);else s.checks.delete(idx);
  const b=app.querySelector('[data-action="submit"]');if(b)b.disabled=!canSubmit(topic(s.id));
 }
});
window.addEventListener('popstate',resumeRoute);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden && s && !s.submitted && (s.phase==='waiting'||s.phase==='go'||s.phase==='running')){
  clean();s.phase='ready';draw();
 }
 if(document.hidden && s && s.memStage==='show'){
  if(timer!==null){clearTimeout(timer);timer=null;}s.memStage='intro';draw();
 }
});
window.QX_ATLAS_APP_QA={
 getState:()=>({catalog:!s,activityId:s?s.id:null,mode:s?topic(s.id).mode:null,submitted:s?s.submitted:false,feedback:s?s.feedback:null,filter,category,timings:s?s.timings:[],savedCount:saved.size}),
 list:()=>all.map(x=>({id:x.id,title:x.title,mode:x.mode,originalId:x.originalId}))
};
resumeRoute();
})();