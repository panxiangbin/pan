import {GROUPS,calculate} from './core.mjs';
import {calcMixQuick,configureMixQuick,mixQuickInitial} from './mix_quick.mjs?v=062';
import {renderMixMotorResult,mixCalculationText} from './mix_motor.mjs?v=062';
const VERSION='0.6.2';
import {calcDistillExpanded,calcMixExpanded,calcVacuumExpanded,calcPipe,calcDuty} from './advanced_core.mjs';
import {configureAdvancedModules} from './advanced_specs.mjs';
import {drawMcCabeXY} from './advanced_ui.mjs';
import {REACTOR_EXAMPLE,ALL_FIELDS,calculateReactorFull} from './reactor_full.mjs';
import {renderReactorModule,renderReactorResult,setDefaultSizing,downloadCurveFile} from './reactor_ui.mjs';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const F=(key,label,opts={})=>({key,label,kind:'number',placeholder:'请输入',...opts});
const S=(key,label,options,opts={})=>F(key,label,{kind:'select',options,...opts});
const iconPaths={
  heat:'<path d="M8 3v9.2a5 5 0 1 0 8 0V3a4 4 0 1 0-8 0Z"/><path d="M12 8v10"/>',
  mix:'<path d="M4 7h16M12 3v15M8 21h8M7 16l5-5 5 5"/><path d="M6 12c0 5 12 5 12 0"/>',
  distill:'<path d="M9 3h6M10 3v5l-4 5a6 6 0 0 0 5 8h2a6 6 0 0 0 5-8l-4-5V3"/><path d="M8 15h8"/>',
  vacuum:'<circle cx="12" cy="12" r="9"/><path d="M12 12l5-5M5 15l2 2M10 3v3"/><circle cx="12" cy="12" r="1"/>',
  load:'<path d="M5 4c0-2 14-2 14 0v16c0 2-14 2-14 0V4Z"/><ellipse cx="12" cy="4" rx="7" ry="2"/><path d="M5 12c2 2 12 2 14 0M8 16h8"/>',
  convert:'<path d="M3 7h16l-4-4M19 17H5l4 4M19 7l-4 4M5 17l4-4"/>',
  pipe:'<path d="M3 6h10v6h8M9 20v-8m4 8v-8"/><circle cx="13" cy="6" r="2"/><path d="M19 9v6m-3-3h6"/>',
  empty:'<path d="M12 2v5m0 10v5M2 12h5m10 0h5M5 5l3 3m8 8 3 3M19 5l-3 3m-8 8-3 3"/>'
};
const icon=n=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+(iconPaths[n]||iconPaths.empty)+'</svg>';
const list=[
  {id:'heat',name:'反应釜热工',short:'31项参数 · 时间、热量、校核',icon:'heat',color:'teal',status:'完整版',desc:'移入旧版完整热工计算引擎'},
  {id:'mix',name:'搅拌与黏度',short:'雷诺数、轴功率',icon:'mix',color:'blue',status:'条件计算',desc:'部分桨型需要实验功率关联'},
  {id:'distill',name:'精馏初步计算',short:'理论级数、回流比',icon:'distill',color:'violet',status:'教学初算',desc:'二元恒定相对挥发度模型'},
  {id:'vacuum',name:'真空抽气',short:'抽气时间模型',icon:'vacuum',color:'coral',status:'参考模型',desc:'恒定有效抽速的理想化计算'},
  {id:'load',name:'装料率与液位',short:'比例、理想液高',icon:'load',color:'cyan',status:'基础计算',desc:'标称容积与实际装料比例'},
  {id:'convert',name:'单位换算',short:'压力、黏度、功率',icon:'convert',color:'amber',status:'基础计算',desc:'化工工程常见单位快捷转换'}
];
list.find(x=>x.id==='heat').status='31项热工';
list.find(x=>x.id==='mix').name='搅拌与传动';
list.find(x=>x.id==='mix').short='三参数配机参考 / 详细校核';
list.find(x=>x.id==='mix').status='简算＋校核';
list.find(x=>x.id==='distill').name='精馏塔与蒸馏';
list.find(x=>x.id==='distill').short='板式、填料、简单间歇';
list.find(x=>x.id==='distill').status='5种计算';
list.find(x=>x.id==='vacuum').name='真空与抽速';
list.find(x=>x.id==='vacuum').short='恒定或曲线抽气';
list.find(x=>x.id==='vacuum').status='两种模型';
list.push({id:'pipe',name:'循环泵与管路',short:'流速、压降、扬程',icon:'pipe',color:'cyan',status:'单相初算',desc:'Darcy–Weisbach管道液体流动校核'});
list.push({id:'duty',name:'冷却与蒸发',short:'冷却负荷、汽化热量',icon:'heat',color:'coral',status:'能量衡算',desc:'冷量与旋蒸热负荷的条件初算'});
const title=id=>list.find(o=>o.id===id)?.name||'';
const specs={
 heat:{
  subtitle:'物料显热和理论容量参考；不承诺实际升温时间。',
  guidance:'目前仅核算物料显热；新网站不会搬用旧版未经审查的传热系数、热损耗或重复时间余量。',
  groups:[
   {title:'物料与目标',desc:'填入已知工况，不提供没有来源的默认物性。',fields:[
     F('mass','物料质量',{unit:'kg',placeholder:'例如 10'}),
     F('cp','温度范围平均比热',{unit:'kJ/(kg·K)',placeholder:'例如 2'}),
     F('t0','起始温度',{unit:'°C',placeholder:'例如 20'}),
     F('t1','目标温度',{unit:'°C',placeholder:'例如 40'})
   ]},
   {title:'可选：纯能量参考时间',advanced:true,desc:'用户输入功率与利用率，仅作能量/功率换算；非实际热工升温预测。',fields:[
    F('power','设备输入功率',{unit:'kW',placeholder:'可不填'}),
    F('efficiency','用户提供的利用率',{unit:'%',placeholder:'可不填'})
   ]}
  ]
 },
 mix:{
  subtitle:'先计算Re；有可靠功率数或符合限定几何时才计算轴功率。',
  guidance:'本模块绝不直接推荐电机铭牌千瓦或减速机型号。非牛顿流体需要流变曲线，不按单一黏度强算。',
  groups:[
   {title:'釜体及物料',fields:[
    F('vesselD','釜内径',{unit:'mm',placeholder:'例如 128'}),
    F('rho','物料密度',{unit:'kg/m³',placeholder:'例如 1000'}),
    F('mu','工作温度动力黏度',{unit:'见右侧',placeholder:'例如 10000'}),
    S('muUnit','黏度单位',[['mPa·s','mPa·s'],['Pa·s','Pa·s']]),
    S('rheology','流体类型',[['','请选择'],['newtonian','牛顿流体'],['nonnewtonian','非牛顿流体']])
   ]},
   {title:'桨叶与速度',fields:[
    S('impeller','桨型',[['','请选择'],['anchor','锚式'],['ribbon','螺带式'],['rushton','六直叶圆盘涡轮'],['propeller','推进式'],['other','其他/未知']]),
    F('impellerD','搅拌桨外径',{unit:'mm',placeholder:'例如 121.6'}),
    F('rpm','搅拌转速',{unit:'rpm',placeholder:'例如 30'})
   ]},
   {title:'可选：用户提供的功率数',advanced:true,desc:'只有您具备适用几何下的功率数Np及可查出处时才填写。',fields:[
    F('userNp','对应功率数 Np',{placeholder:'留空则只计算Re'}),
    F('npSource','Np出处或厂家样本编号',{kind:'text',placeholder:'必需注明来源',full:true})
   ]},
   {title:'专业桨叶几何 · 文献受限模型',advanced:true,only:v=>v.impeller==='anchor'||v.impeller==='ribbon',desc:'Takahashi 1982，原实验槽约128mm、平底、无挡板、液深≈釜径；几何不满足时拒绝计算功率。',fields:[
    S('bottom','釜底',[['','请选择'],['flat','平底'],['round','圆底/椭圆底']]),
    S('baffles','挡板',[['','请选择'],['none','无挡板'],['yes','有挡板']]),
    S('internals','其他内构件',[['','请选择'],['no','无'],['yes','有盘管/温度计等']]),
    F('depth','液体深度',{unit:'mm',placeholder:'例如 128'}),
    F('bladeWidth','桨叶宽度',{unit:'mm',placeholder:'例如 13'}),
    F('bladeLength','桨叶长度 L',{unit:'mm',placeholder:'例如 115'}),
    F('nBlades','桨叶数',{unit:'片',placeholder:'例如 2'}),
    F('nArms','每片桨叶支臂数',{unit:'个',placeholder:'例如 2'}),
    F('armDia','支臂直径',{unit:'mm',placeholder:'例如 3'}),
    F('pitch','螺带螺距 s',{unit:'mm',placeholder:'例如 126',only:v=>v.impeller==='ribbon'})
   ]}
  ]
 },
 distill:{
  subtitle:'先选择计算任务，理论级数与实际塔板数量是不同概念。',
  guidance:'现阶段只提供二元恒定α下的教学/初步估算；连续填料、间歇精馏、严格VLE与塔板水力学校核后续扩展。',
  groups:[
   {title:'选择计算方式',fields:[
    S('task','计算任务',[['fenske','Fenske · 全回流最小级数'],['mccabe','McCabe–Thiele · 给定回流比逐级计算']],{full:true})
   ]},
   {title:'二元分离工况',fields:[
    F('alpha','恒定相对挥发度 α',{placeholder:'需要有来源，例如 2.5'}),
    F('xD','塔顶轻组分摩尔分数',{placeholder:'例如 0.95'}),
    F('xB','塔底轻组分摩尔分数',{placeholder:'例如 0.05'})
   ]},
   {title:'逐级计算必需参数',only:v=>v.task==='mccabe',fields:[
    F('zF','进料轻组分摩尔分数',{placeholder:'例如 0.5'}),
    F('q','进料热状态 q',{placeholder:'饱和液体取 1'}),
    F('R','操作回流比 R',{placeholder:'例如 1.65'})
   ]}
  ]
 },
 vacuum:{
  subtitle:'仅计算恒定有效抽速、无外部气体负荷时的理想模型时间。',
  guidance:'请使用绝对压力，不是负压表读数；若只知道铭牌抽速或釜内正在蒸发，请勿把结果当作设备性能保证。',
  groups:[
   {title:'空腔与绝对压力',fields:[
    F('volume','空腔容积',{unit:'L',placeholder:'例如 50'}),
    F('p0','起始绝对压力',{unit:'mbar',placeholder:'例如 1013'}),
    F('p1','目标绝对压力',{unit:'mbar',placeholder:'例如 10'}),
    F('pu','系统极限绝对压力',{unit:'mbar',placeholder:'例如 0.01'})
   ]},
   {title:'泵在容器处的抽速',fields:[
    F('speed','恒定有效抽速',{unit:'m³/h',placeholder:'例如 4'})
   ]}
  ]
 },
 load:{
  subtitle:'计算装料占比；不能代替设备规定的最大允许装料率。',
  guidance:'圆底玻璃釜不能直接套用平底直圆筒液位公式。若不确定内部几何，请不要输入内径。',
  groups:[
   {title:'实际装料',fields:[
    F('nominal','标称容积',{unit:'L',placeholder:'例如 100'}),
    F('actual','装料体积',{unit:'L',placeholder:'例如 60'})
   ]},
   {title:'可选：纯圆筒液位换算',advanced:true,fields:[
    F('innerDiameter','平底直筒内径',{unit:'mm',placeholder:'圆底/封头不适用'})
   ]}
  ]
 },
 convert:{
  subtitle:'所有结果以SI单位作为内部换算基准。',
  guidance:'压力换算仅换单位，不会自动把表压转换为绝对压力。',
  groups:[
   {title:'单位换算',fields:[
    S('group','类型',Object.entries(GROUPS).map(([k,g])=>[k,g.title]),{full:true}),
    F('value','原始数值',{placeholder:'输入数值',full:true}),
    S('from','原单位',v=>Object.keys(GROUPS[v.group||'pressure']?.units||{}).map(x=>[x,x])),
    S('to','目标单位',v=>Object.keys(GROUPS[v.group||'pressure']?.units||{}).map(x=>[x,x]))
   ]}
  ]
 }
};
const demos={
 heat:{mass:'10',cp:'2',t0:'20',t1:'40'},
 load:{nominal:'100',actual:'60'},
 mix:{vesselD:'128',rho:'1000',mu:'10000',muUnit:'mPa·s',rheology:'newtonian',impeller:'anchor',impellerD:'121.6',rpm:'30',bottom:'flat',baffles:'none',internals:'no',depth:'128',bladeWidth:'13',bladeLength:'115',nBlades:'2',nArms:'2',armDia:'3'},
 distill:{task:'mccabe',alpha:'2.5',xD:'0.95',xB:'0.05',zF:'0.5',q:'1',R:'1.65'},
 vacuum:{volume:'50',p0:'1013',p1:'10',pu:'0.01',speed:'4'},
 convert:{group:'pressure',value:'1000',from:'mbar',to:'kPa'}
};
configureAdvancedModules(specs,F,S,demos);
configureMixQuick(specs,F,S,demos);
const initial=id=>id==='heat'?{...REACTOR_EXAMPLE}:id==='convert'?{group:'pressure',from:'Pa',to:'kPa'}:id==='distill'?{task:'fenske'}:id==='mix'?{...mixQuickInitial(),muUnit:'mPa·s',rheology:'',impeller:'',viscMode:'manual',motorCheck:'no'}:id==='vacuum'?{speedMode:'constant'}:id==='duty'?{dutyMode:'cooling'}:{};
const drafts={}; let active='home',currentResult=null,refreshTimer=null,toastTimer=null;
const getDraft=id=>drafts[id]||(drafts[id]=initial(id));
function parseHash(){const hash=location.hash.slice(1).split('?')[0];return list.some(x=>x.id===hash)||hash==='saved'?hash:'home';}
function navigate(id){if(location.hash!=='#'+id)location.hash='#'+id;else render();window.scrollTo({top:0,behavior:'instant'});}
function fieldTemplate(f,v){
  if(f.only&&!f.only(v))return '';
  const x=v[f.key]??'';
  const id='f_'+f.key;
  const adorn=f.unit?'<em>'+esc(f.unit)+'</em>':'';
  const options=typeof f.options==='function'?f.options(v):f.options;
  const el=f.kind==='textarea'?'<textarea id="'+id+'" name="'+esc(f.key)+'" data-input="'+esc(f.key)+'" rows="'+(f.rows||4)+'" placeholder="'+esc(f.placeholder||'请输入')+'">'+esc(x)+'</textarea>':f.kind==='select'?'<select id="'+id+'" name="'+esc(f.key)+'" data-input="'+esc(f.key)+'">'+
    (options||[]).map(([key,label])=>'<option value="'+esc(key)+'"'+(String(x)===String(key)?' selected':'')+'>'+esc(label)+'</option>').join('')+'</select>':
    '<input id="'+id+'" name="'+esc(f.key)+'" data-input="'+esc(f.key)+'" type="'+(f.kind==='text'?'text':'number')+'" '+(f.kind==='number'?'step="any" inputmode="decimal"':'autocomplete="off"')+' value="'+esc(x)+'" placeholder="'+esc(f.placeholder||'请输入')+'">';
  return '<div class="field '+(f.full?'field-full':'')+'"><label for="'+id+'"><span>'+esc(f.label)+'</span>'+adorn+'</label>'+el+'</div>';
}
function groupTemplate(g,v){
 if(g.only&&!g.only(v))return '';
 const inner='<div class="form-grid">'+g.fields.map(f=>fieldTemplate(f,v)).join('')+'</div>';
 if(g.advanced)return '<details class="details" data-advanced="'+esc(g.title)+'"><summary>'+esc(g.title)+'</summary><div class="details-body">'+(g.desc?'<p>'+esc(g.desc)+'</p>':'')+inner+'</div></details>';
 return '<section class="form-section"><div class="pane-title"><strong>'+esc(g.title)+'</strong></div>'+(g.desc?'<p class="pill-notice">'+esc(g.desc)+'</p>':'')+inner+'</section>';
}
function renderHome(){
 const cards=list.map(it=>'<a class="tool-card c-'+it.color+'" href="#'+it.id+'" data-tool="'+it.id+'"><span class="tool-icon">'+icon(it.icon)+'</span><span class="arrow">↗</span><strong>'+esc(it.name)+'</strong><small>'+esc(it.short)+'</small><div style="margin-top:auto;padding-top:12px"><span class="chip">'+esc(it.status)+'</span></div></a>').join('');
 return '<div class="page"><section class="hero"><div class="hero-copy"><div class="eyebrow">FU SUAN · MOBILE WORKSPACE</div><h1>把工程计算<br>装进口袋</h1><p>反应釜、搅拌、精馏与真空计算。输入参数，查看结果、模型条件及来源。手机打开即可使用。</p><div class="hero-actions"><a class="btn btn-primary" href="#heat">开始计算　→</a><a class="btn btn-secondary" href="#mix">搅拌功率校核</a></div></div></section>'+
  '<div id="tools" class="sec-title"><h2>选择计算模块</h2><span>'+list.length+' 个计算入口 · 持续验证</span></div><section class="card-grid">'+cards+'</section>'+
  '<div class="footnote"><span style="font-size:19px">ⓘ</span><div><strong>工程使用边界</strong><br>本站当前是开发测试版，部分结果仅为数学公式换算或明确假设下的条件估算，不代表设备选型、施工设计或安全审核。缺少关键数据时不会补造系数。</div></div></div>';
}
function renderModule(id){
 if(id==='heat')return renderReactorModule(getDraft(id));
 const meta=list.find(x=>x.id===id),sp=specs[id],v=getDraft(id);
 const groups=sp.groups.map(g=>groupTemplate(g,v)).filter(Boolean).join('<hr class="rule">');
 return '<div class="page module-page" data-module="'+id+'"><div class="breadcrumb"><a href="#home">首页</a><span>›</span><span>'+esc(meta.name)+'</span></div>'+
  '<div class="section-head"><div><div class="eyebrow">ENGINEERING TOOL · '+esc(VERSION)+'</div><h1>'+esc(meta.name)+'</h1><p>'+esc(sp.subtitle)+'</p></div><span class="chip chip-'+(id==='mix'||id==='distill'||id==='vacuum'?'amber':'mint')+'">'+esc(meta.status)+'</span></div>'+
  '<nav class="calc-jumps"><a href="#calc-form">填写参数</a><a href="#output-pane">查看结果</a></nav><div class="workspace"><section class="pane inputs"><div class="pane-title"><strong>输入工程参数</strong><small>修改后自动更新</small></div><form id="calc-form" autocomplete="off">'+groups+
  '<div class="form-actions"><button type="button" class="btn btn-secondary" data-action="example">载入演示工况</button><button type="button" class="btn btn-ghost" data-action="clear">清空参数</button></div></form></section>'+
  '<section class="pane output" id="output-pane"><div class="result-header"><h2>计算结果</h2><span class="tier" id="result-tier">等待输入</span></div><div id="result-container"></div><div class="result-actions no-print"><button class="btn btn-primary" type="button" data-action="save" disabled>保存计算</button><button class="btn btn-secondary" type="button" data-action="copy" disabled>复制结果</button><button class="btn btn-secondary" type="button" data-action="print" disabled>打印报告</button></div><p class="pill-notice">'+esc(sp.guidance)+'</p></section></div></div>';
}
function valueFmt(n){
 if(!Number.isFinite(n))return '—';
 if(Object.is(n,-0))return '0';
 const ab=Math.abs(n);
 if(ab>0&&(ab>=1e9||ab<1e-5))return n.toExponential(3);
 const out=new Intl.NumberFormat('zh-CN',{maximumFractionDigits:ab<1?6:ab<10?4:3}).format(n);
 return /^-0(?:[.,]0+)?$/.test(out)?out.slice(1):out;
}
function renderResult(result){
 const tier=$('#result-tier'),box=$('#result-container');
 if(!box)return;
 currentResult=result;
 const ready=result.state==='ready';
 tier.textContent=ready?(result.level||'条件估算'):'未完成';
 tier.className='tier '+(ready?(result.level?.includes('教学')?'tier-blue':result.level?.includes('条件')||result.level?.includes('受限')||result.level?.includes('用户')||result.level?.includes('未标定')?'tier-amber':''):'tier-amber');
 document.querySelectorAll('[data-action="save"],[data-action="copy"],[data-action="print"]').forEach(b=>b.disabled=!ready);
 if(!ready){
   box.innerHTML='<div class="result-empty '+(result.state==='blocked'?'result-error':'')+'"><div class="empty-orbit">'+icon(result.state==='blocked'?'vacuum':'empty')+'</div><strong>'+esc(result.title)+'</strong><p>'+esc(result.message)+'</p></div>';
   return;
 }
 if(active==='mix'&&result.motorSizing){
  const opened=[...box.querySelectorAll('details[data-motor-details][open]')].map(x=>x.dataset.motorDetails);
  box.innerHTML=renderMixMotorResult(result);
  box.querySelectorAll('details[data-motor-details]').forEach(x=>{if(opened.includes(x.dataset.motorDetails))x.open=true;});
  return;
 }
 const cards=result.metrics.map((m,i)=>'<div class="metric"><small>'+esc(m.label)+'</small><div><strong>'+valueFmt(m.value)+'</strong><span>'+esc(m.unit)+'</span></div>'+(m.description?'<p>'+esc(m.description)+'</p>':'')+'</div>').join('');
 const notes=(result.notes||[]).map(x=>'<li>'+esc(x)+'</li>').join('');
 const formulas=(result.formulas||[]).map(x=>'<div class="formula-line">'+esc(x)+'</div>').join('');
 const refs=(result.refs||[]).filter(Boolean).map(r=>r.url?'<a href="'+esc(r.url)+'" target="_blank" rel="noreferrer noopener">↗ '+esc(r.label)+'</a>':'<span style="font-size:11px;color:#738b95">'+esc(r.label)+'</span>').join('');
 const rows=(result.steps||[]).slice(0,25).map(s=>'<tr><td>'+s.i+'</td><td>'+s.x+'</td><td>'+(s.section==='rectifying'?'精馏段':s.section==='stripping'?'提馏段':'—')+'</td></tr>').join('');
 box.innerHTML='<div class="result-metrics">'+cards+'</div>'+(active==='distill'?drawMcCabeXY(getDraft(active),result):'')+'<ul class="hint-list">'+notes+'</ul>'+
  ((formulas||refs)?'<details class="details"><summary>公式、假设与来源</summary><div class="formulas">'+formulas+(refs?'<div class="sources">'+refs+'</div>':'')+'</div></details>':'')+
  (rows?'<details class="details"><summary>逐级计算过程（前25级）</summary><div class="details-body" style="overflow:auto"><table style="width:100%;font-size:11px;border-collapse:collapse"><thead><tr><th>级</th><th>x</th><th>塔段</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>':'');
}
function recalc(){
 if(!list.some(x=>x.id===active))return;
 if(active==='heat'){
  const draft=getDraft(active);
  const r=calculateReactorFull(draft);
  if(r.state==='ready')setDefaultSizing(draft,r);
  currentResult=r;
  const panel=document.querySelector('.reactor-page');if(panel)panel.dataset.mode=draft.mode||'flow';
  renderReactorResult(r,draft);syncReactorSticky();return;
 }
 const calc=active==='mix'?(v=>v.mixMode==='detailed'?calcMixExpanded(v):calcMixQuick(v)):active==='distill'?calcDistillExpanded:active==='vacuum'?calcVacuumExpanded:active==='pipe'?calcPipe:active==='duty'?calcDuty:v=>calculate(active,v);
 renderResult(calc(getDraft(active)));
}
function setInput(e){
 const el=e.target;if(!el?.hasAttribute('data-input'))return;
 const k=el.dataset.input,v=getDraft(active);
 v[k]=el.value;
 if(active==='heat'&&(k==='oilVolume'||k==='oilFillDensity')){
  const vol=Number(v.oilVolume),rho=Number(v.oilFillDensity);
  if(v.oilVolume!==''&&v.oilFillDensity!==''&&Number.isFinite(vol)&&Number.isFinite(rho)){
   v.oilMass=Number((vol*rho/1000).toFixed(6));
   const massEl=document.querySelector('input[name="oilMass"]');if(massEl)massEl.value=v.oilMass;
  }
 }
 if(k==='group'){
   const first=Object.keys(GROUPS[v.group].units);
   v.from=first[0];v.to=first[1]||first[0];
   renderModuleCurrent();return;
 }
 if(['task','impeller','viscMode','speedMode','motorCheck','dutyMode','mixMode'].includes(k)){
   renderModuleCurrent();return;
 }
 if(refreshTimer)clearTimeout(refreshTimer);
 refreshTimer=setTimeout(recalc,180);
}
function renderModuleCurrent(){
 const opened=[...document.querySelectorAll('details[data-advanced][open]')].map(x=>x.dataset.advanced);
 $('#app').innerHTML=renderModule(active);
 for(const name of opened)document.querySelectorAll('details[data-advanced]').forEach(x=>{if(x.dataset.advanced===name)x.open=true;});
 recalc();
}
function getSaved(){try{const arr=JSON.parse(localStorage.getItem('fusuan_history_v01')||'[]');return Array.isArray(arr)?arr.slice(0,25):[];}catch{return [];}}
function setSaved(items){try{localStorage.setItem('fusuan_history_v01',JSON.stringify(items));return true;}catch{notify('浏览器未允许本地保存，请检查隐私设置。');return false;}}
function renderSaved(){
 const items=getSaved();
 const body=items.length?'<div class="save-items">'+items.map((s,i)=>'<article class="save-item"><div><strong>'+esc(title(s.module))+'</strong><small>'+esc(s.when)+' · '+esc(s.level||'本地记录')+'</small></div><div class="save-actions"><button class="mini-btn" type="button" data-action="restore" data-index="'+i+'">打开</button><button class="mini-btn danger" type="button" data-action="delete" data-index="'+i+'">删除</button></div></article>').join('')+'</div>':'<div class="save-empty"><strong>还没有计算记录</strong><span>打开计算器，填写参数并点击“保存计算”。</span></div>';
 return '<div class="page"><div class="breadcrumb"><a href="#home">首页</a> › 计算记录</div><div class="section-head"><div><div class="eyebrow">LOCAL HISTORY</div><h1>我的计算记录</h1><p>只保存在当前浏览器，不上传到服务器。</p></div><span class="chip">'+items.length+' 条</span></div><section class="pane">'+body+'</section><div class="footnote"><span>ⓘ</span><div>本地记录可能因清除浏览器数据而丢失。不要把敏感配方、客户姓名或商业机密填入自由文本字段；公用设备请及时删除记录。</div></div></div>';
}
function notify(message){const el=$('#toast');if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,3200);}
function copyText(s){
 if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(s).then(()=>true).catch(()=>fallback(s));
 return Promise.resolve(fallback(s));
}
function fallback(s){const x=document.createElement('textarea');x.value=s;x.style.position='fixed';x.style.opacity='0';document.body.append(x);x.select();let ok=false;try{ok=document.execCommand('copy');}catch{}x.remove();return ok;}
function summaryText(){
 const r=currentResult;if(!r||r.state!=='ready')return '';
 const v=getDraft(active),meta=list.find(x=>x.id===active);
 return ['釜算手机版 '+VERSION,meta.name,r.title+' / '+r.level,'','输入条件:',...Object.entries(v).filter(([k,x])=>String(x).trim()!=='').map(([k,x])=>k+' = '+x),'','计算结果:',...r.metrics.map(m=>m.label+'：'+valueFmt(m.value)+' '+m.unit),'',...mixCalculationText(r),'','模型边界:',...(r.notes||[]),'','公式:',...(r.formulas||[]),'','本结果非工程设计签章，不代替厂家确认。'].join('\n');
}
function executeAction(btn){
 const a=btn.dataset.action;
 if(a==='reactor-show-results'){document.getElementById('reactor-chart-panel')?.scrollIntoView({behavior:'smooth',block:'start'});return;}
 if(a==='reactor-expand'){document.querySelectorAll('.reactor-page .reactor-group').forEach(el=>el.open=true);return;}
 if(a==='reactor-collapse'){document.querySelectorAll('.reactor-page .reactor-group').forEach(el=>el.open=false);return;}
 if(a==='reactor-curve'){if(currentResult?.state!=='ready'||!downloadCurveFile(currentResult))notify('请先得到有效计算结果。');return;}
 if(a==='example'){drafts[active]=active==='heat'?{...REACTOR_EXAMPLE}:{...initial(active),...(active==='mix'&&getDraft(active).mixMode==='detailed'?demos.mixDetailed:demos[active])};renderModuleCurrent();notify('已载入演示工况，请勿当作真实设备参数。');return;}
 if(a==='clear'){const preservedMode=active==='mix'?getDraft(active).mixMode:null;drafts[active]=active==='heat'?{...Object.fromEntries(ALL_FIELDS.map(k=>[k,''])),mode:'flow'}:initial(active);if(active==='mix')drafts.mix.mixMode=preservedMode||'quick';renderModuleCurrent();notify(active==='mix'?'已清空当前模块参数；简算默认条件恢复初始假设。':'已清空当前模块参数。');return;}
 if(a==='save'){
  if(currentResult?.state!=='ready')return;
  const hist=getSaved();hist.unshift({module:active,version:VERSION,when:new Date().toLocaleString('zh-CN'),level:currentResult.level,values:{...getDraft(active)}});
  if(setSaved(hist.slice(0,20)))notify('计算记录已保存在本机浏览器。');return;
 }
 if(a==='copy'){if(currentResult?.state!=='ready')return;copyText(summaryText()).then(ok=>notify(ok?'已复制计算结果。':'复制失败，可使用打印报告。'));return;}
 if(a==='print'){if(currentResult?.state!=='ready')return;document.querySelectorAll('.output details,.reactor-page details').forEach(el=>el.open=true);window.print();return;}
 if(a==='delete'){const items=getSaved(),i=Number(btn.dataset.index);if(Number.isInteger(i)&&i>=0&&i<items.length){items.splice(i,1);setSaved(items);render();notify('已删除本地记录。');}return;}
 if(a==='restore'){const items=getSaved(),s=items[Number(btn.dataset.index)];if(s&&list.some(x=>x.id===s.module)){
  if(s.module==='heat'&&!Object.prototype.hasOwnProperty.call(s.values||{},'vesselVolume')){notify('旧版显热记录缺少完整热工参数，不能自动转为31项反应釜模型。');return;}
  const restored={...initial(s.module),...s.values};
  // Older mix records belong to the original detailed model, never silently reinterpret.
  if(s.module==='mix'&&!Object.prototype.hasOwnProperty.call(s.values||{},'mixMode'))restored.mixMode='detailed';
  // V061 missing margin was zero; never silently migrate an old trial to 30%.
  if(s.module==='mix'&&s.version==='0.6.1'&&restored.mixMode==='quick'&&!Object.prototype.hasOwnProperty.call(s.values||{},'qMargin'))restored.qMargin='0';
  if(s.module==='heat' && !s.version && restored.viscosity!==undefined && restored.viscosity!==''){
   // V0.3热工保存的是Pa·s，V0.4统一使用mPa·s；只迁移旧记录，不重写历史记录。
   restored.viscosity=String(Number(restored.viscosity)*1000);
  }
  drafts[s.module]=restored;navigate(s.module);notify('已载入已保存的计算参数。');}return;}
}
function syncReactorSticky(){
  const strip=document.getElementById('reactor-sticky-result');
  if(!strip){document.body.classList.remove('reactor-scrolled');return;}
  const summary=document.getElementById('reactor-summary');
  const show=window.innerWidth<=600 && !!summary && summary.getBoundingClientRect().bottom<84 && currentResult?.state==='ready';
  strip.hidden=!show;
  document.body.classList.toggle('reactor-scrolled',show);
 }
function render(){
 active=parseHash();
 document.body.classList.remove('reactor-scrolled');
 $('#app').innerHTML=active==='home'?renderHome():active==='saved'?renderSaved():renderModule(active);
 document.querySelectorAll('[data-nav]').forEach(a=>{
   const target=a.dataset.nav;
   const isOn=(active==='home'&&target==='home'&&location.hash!=='#tools')||(active==='home'&&target==='tools'&&location.hash==='#tools')||(active==='saved'&&target==='saved')||(list.some(x=>x.id===active)&&target==='tools');
   a.classList.toggle('active',isOn);a.setAttribute('aria-current',isOn?'page':'false');
 });
 if(list.some(x=>x.id===active))recalc();else currentResult=null;
 syncReactorSticky();
}
document.addEventListener('input',setInput);
document.addEventListener('change',setInput);
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b){e.preventDefault();executeAction(b);}});
document.addEventListener('submit',e=>{if(e.target.id==='calc-form')e.preventDefault();});
// Page-local hash links must not activate the global module router.
document.addEventListener('click',e=>{
 const anchor=e.target.closest('.reactor-jump a,.calc-jumps a');
 if(!anchor)return;
 const targetId=anchor.getAttribute('href')?.slice(1);
 const target=targetId?document.getElementById(targetId):null;
 if(!target)return;
 e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});
});
document.addEventListener('click',e=>{
  if(window.innerWidth>600)return;
  const summary=e.target.closest('.reactor-group>summary');
  if(!summary)return;
  const container=summary.closest('.reactor-group');
  if(container && !container.open)document.querySelectorAll('.reactor-group[open]').forEach(g=>{if(g!==container)g.open=false;});
});
window.addEventListener('scroll',syncReactorSticky,{passive:true});
window.addEventListener('resize',syncReactorSticky);
window.addEventListener('hashchange',()=>{clearTimeout(refreshTimer);render();if(location.hash==='#tools')document.querySelector('#tools')?.scrollIntoView({block:'start'});else window.scrollTo(0,0);});
render();
if(location.hash==='#tools')document.querySelector('#tools')?.scrollIntoView({block:'start'});