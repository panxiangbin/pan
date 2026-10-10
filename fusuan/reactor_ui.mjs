import {REACTOR_GROUPS,ALL_FIELDS,MODES,calculateReactorFull,formatModel,toCurveCSV} from './reactor_full.mjs';
import {Thermal} from './reactor_engine.mjs';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const card=(label,v,unit,note,kind='')=>'<div class="reactor-stat '+kind+'"><small>'+esc(label)+'</small><div class="reactor-stat-val"><b>'+formatModel(v)+'</b><span>'+esc(unit)+'</span></div><p>'+esc(note||'')+'</p></div>';
const units={time:'分钟',power:'kW'};
function modelInput(f,v){
  const val=v[f.key]??'';
  const annotation=f.key==='metalMass'?'参与升温的有效釜体质量，应据设备结构确定':f.key==='viscosity'?'同搅拌模块统一mPa·s；0.48 Pa·s = 480 mPa·s':f.key==='oilDensity'?'高温循环介质密度，与冷态密度不同':f.key==='oilFillDensity'?'冷态充装密度，不能照搬高温循环密度':'';
  return '<label class="reactor-field" data-key="'+esc(f.key)+'"><span class="reactor-field-name">'+esc(f.label)+'</span>'+(annotation?'<small class="reactor-field-note">'+esc(annotation)+'</small>':'')+
    '<span class="reactor-input-wrap"><input type="number" step="any" inputmode="decimal" name="'+esc(f.key)+'" data-input="'+esc(f.key)+'" aria-label="'+esc(f.label)+'" value="'+esc(val)+'">'+
    '<span>'+esc(f.unit)+'</span></span></label>';
}
function modeSelector(v){
 return '<div class="reactor-mode"><div class="reactor-mode-text"><strong>计算工况</strong><small>选择传热模型，所有数据均可修改</small></div>'+
 '<select name="mode" aria-label="计算工况" data-input="mode">'+MODES.map(([key,label])=>'<option value="'+esc(key)+'"'+(String(v.mode)===key?' selected':'')+'>'+esc(label)+'</option>').join('')+'</select></div>';
}
function groupCard(g,v,index){
 const isOpen=index===0?' open':'';
 const filled=g.fields.filter(f=>v[f.key]!==undefined&&v[f.key]!==null&&String(v[f.key]).trim()!=='').length;
 const sub=g.fields.length+'项 · '+filled+'项已填';
 return '<details class="reactor-group" data-advanced="'+esc(g.id)+'"'+isOpen+'><summary>'+
  '<span class="reactor-group-accent" style="--accent:'+g.accent+'"></span>'+
  '<span class="reactor-group-summary"><strong>'+esc(g.title)+'</strong><small>'+esc(g.description)+'</small></span>'+
  '<span class="reactor-group-count">'+sub+'</span><span class="reactor-group-chevron">⌄</span></summary>'+
  '<div class="reactor-group-body"><div class="reactor-form-grid">'+g.fields.map(f=>modelInput(f,v)).join('')+'</div></div></details>';
}
function sizingInput(key,label,unit,value){
 return '<label class="reactor-check-field"><span>'+esc(label)+'</span><span class="reactor-input-wrap"><input type="number" inputmode="decimal" step="any" name="'+key+'" data-input="'+key+'" value="'+esc(value??'')+'" placeholder="按结果自动取建议值">'+
  '<span>'+esc(unit)+'</span></span></label>';
}
const emptyOutput=(warning='输入不完整或工况不符合原版模型要求。')=>
 '<div class="reactor-splash-error"><strong>目前无法完成热工计算</strong><p>'+esc(warning)+'</p><span>请检查输入参数，或者载入旧版演示工况。</span></div>';

export function renderReactorModule(v){
 const groups=REACTOR_GROUPS.map((g,i)=>groupCard(g,v,i)).join('');
 const help='本页显示旧版全部31项热工及搅拌参考参数。部分物性和传热系数是旧版演示数，不是默认工业经验值。';
 return '<div class="page reactor-page" data-module="heat">'+
  '<div class="breadcrumb"><a href="#home">首页</a> › <span>反应釜完整热工</span></div>'+
  '<div class="reactor-intro"><div><div class="eyebrow">FU SUAN · REACTOR ENGINEERING</div><h1>反应釜热工计算</h1><p>电脑版完整计算模型 · 手机版重新排版 · 取消过程动画</p></div><span class="reactor-count">32 项参数 · 7 类分组</span></div>'+
  '<div class="reactor-warning-head"><strong>演示参数</strong>　K、物性、余量及搅拌常数需按实际设备核定，结果并非设备性能保证。</div>'+
  '<div id="reactor-summary" class="reactor-summary" aria-live="polite"></div>'+
  '<p class="reactor-essential-note">冷油与物料按<b>顺序预算</b>（未模拟并行）；K=250、h=15和油物性为<b>演示参数</b>，请核实后使用。</p>'+
  '<details id="reactor-legacy-reference" class="reactor-legacy-reference"><summary>查看旧版参考总时间（历史对照，不是第二个设计结果）</summary><p>旧版参考时间：<b id="reactor-legacy-time">—</b> 分钟。它是在设计总时间上又乘了一次相同余量，仅供历史版本核对，不能作为实际工期承诺。</p></details>'+
  '<div id="reactor-sticky-result" class="reactor-sticky-result" hidden><button type="button" data-action="reactor-show-results" aria-label="查看六项完整热工计算结果"><span class="reactor-sticky-grid">'+
   '<span class="mini-metric mini-blue"><small>设计时间</small><strong id="reactor-sticky-time">—</strong><em>分</em></span>'+
   '<span class="mini-metric mini-violet"><small>总热量</small><strong id="reactor-sticky-energy">—</strong><em>MJ</em></span>'+
   '<span class="mini-metric mini-teal"><small>物料段</small><strong id="reactor-sticky-material">—</strong><em>分</em></span>'+
   '<span class="mini-metric mini-orange"><small>冷油预算</small><strong id="reactor-sticky-oil">—</strong><em>分</em></span>'+
   '<span class="mini-metric mini-green"><small>有效功率</small><strong id="reactor-sticky-power">—</strong><em>kW</em></span>'+
   '<span class="mini-metric mini-rose"><small>平均功率</small><strong id="reactor-sticky-average">—</strong><em>kW</em></span>'+
  '</span></button></div>'+
  '<nav class="reactor-jump" aria-label="快速查看结果"><a href="#reactor-params">32项参数</a><a href="#reactor-chart-panel">温度曲线</a><a href="#reactor-energy-panel">热量账</a><a href="#reactor-sizing-panel">工程校核</a></nav>'+
  '<div class="reactor-workspace"><section class="reactor-param-panel" id="reactor-params"><div class="reactor-panel-head"><div><h2>第一步 · 填写工程参数</h2><p>逐组展开32项输入，数据修改后结果自动更新</p></div><div class="reactor-parameter-actions"><button data-action="reactor-expand" type="button">全部展开</button><button data-action="reactor-collapse" type="button">全部收起</button></div></div>'+
  modeSelector(v)+'<div class="reactor-groups">'+groups+'</div>'+
  '<div class="reactor-param-footer"><span>'+esc(help)+'</span><div class="reactor-params-buttons"><button type="button" class="btn btn-secondary" data-action="example">恢复旧版示例</button><button type="button" class="btn btn-ghost" data-action="clear">清空参数</button></div></div>'+
  '</section><div class="reactor-result-column" id="reactor-output"><h2 class="reactor-step-two">第二步 · 查看曲线、热量账与校核</h2><div id="reactor-details"></div></div></div>'+
  '<div class="reactor-bottom-actions reactor-desktop-actions no-print"><button class="btn btn-primary" data-action="save" type="button">保存工况</button><button class="btn btn-secondary" data-action="copy" type="button">复制结果</button><button class="btn btn-secondary" data-action="reactor-curve" type="button">导出曲线CSV</button><button class="btn btn-ghost" data-action="print" type="button">打印报告</button></div>'+
  '<div class="reactor-mobile-actions no-print"><button class="btn btn-primary" data-action="save" type="button">保存工况</button><button class="btn btn-secondary" data-action="copy" type="button">复制结果</button><details class="reactor-mobile-more"><summary>更多 ▾</summary><div><button type="button" data-action="reactor-curve">导出CSV</button><button type="button" data-action="print">打印报告</button></div></details></div></div>';
}
const row=(label,value,unit='',hint='')=>'<div class="reactor-data-row"><div><strong>'+esc(label)+'</strong>'+(hint?'<small>'+esc(hint)+'</small>':'')+'</div><b>'+formatModel(value)+' <span>'+esc(unit)+'</span></b></div>';
function linePath(samples,key,min,max,width=662){
 const x=(s)=>52+s.t/samples[samples.length-1].t*width;
 const y=v=>220-(v-min)/(max-min)*172;
 return samples.map((s,i)=>(i?'L':'M')+x(s).toFixed(2)+' '+y(s[key]).toFixed(2)).join(' ');
}
function chartHTML(r){
 const arr=r.samples.filter(s=>Number.isFinite(s.t)&&Number.isFinite(s.T)&&Number.isFinite(s.out)&&Number.isFinite(s.inlet));
 if(arr.length<2)return '<p>温度曲线缺少有效数据。</p>';
 const vs=arr.flatMap(s=>[s.T,s.out,s.inlet]),a=Math.min(...vs),b=Math.max(...vs),margin=Math.max(8,(b-a)*.12),lo=a-margin,hi=b+margin;
 const y=v=>220-(v-lo)/(hi-lo)*172;
 const x=t=>52+t/r.minutes*662;
 let grid='';
 for(let i=0;i<=4;i++){
  const q=lo+(hi-lo)*i/4,Y=y(q),t=r.minutes*i/4,X=x(t);
  grid+='<path d="M52 '+Y.toFixed(1)+' H714" stroke="#e3eaf0" stroke-dasharray="4 5"/>'+
  '<text x="45" y="'+(Y+4).toFixed(1)+'" text-anchor="end" font-size="11" fill="#668393">'+formatModel(q)+'</text>'+
  '<text x="'+X.toFixed(1)+'" y="250" text-anchor="middle" font-size="11" fill="#668393">'+formatModel(t)+'</text>';
 }
 const toPath=k=>linePath(arr,k,lo,hi);
 return '<svg class="reactor-curve" viewBox="0 0 760 272" role="img" aria-label="随时间变化的物料温度、热源进口和循环出口曲线">'+
   grid+'<path d="M52 '+y(r.p.target).toFixed(2)+'H714" stroke="#98bac5" stroke-width="1" stroke-dasharray="6 6"/>'+
   '<path d="'+toPath('T')+'" stroke="#098b84" stroke-width="3.6" fill="none"/>'+
   '<path d="'+toPath('out')+'" stroke="#e78b35" stroke-width="2.6" stroke-dasharray="8 5" fill="none"/>'+
   '<path d="'+toPath('inlet')+'" stroke="#4b82c2" stroke-width="2" fill="none" stroke-dasharray="3 5"/>'+
   '<text x="383" y="269" text-anchor="middle" font-size="11" fill="#5f7989">时间（分钟）</text></svg>';
}
function temperaturePanel(r){
 return '<section class="reactor-output-panel" id="reactor-chart-panel"><div class="reactor-output-heading"><h3>温度变化曲线</h3><span class="chip chip-blue">原版积分模型</span></div>'+
  '<div class="reactor-chart-legend"><span class="legend-teal">物料温度</span><span class="legend-orange">循环出口</span><span class="legend-blue">准稳态进口</span></div>'+
  '<div class="reactor-chart-scroll" tabindex="0" aria-label="温度曲线可左右滑动">'+chartHTML(r)+'</div>'+
  '<div class="reactor-curve-points"><span><small>起点</small><strong>'+formatModel(r.samples[0].T)+' °C</strong></span><span><small>中点</small><strong>'+formatModel(r.samples[Math.floor(r.samples.length/2)].T)+' °C</strong></span><span><small>终点</small><strong>'+formatModel(r.samples.at(-1).T)+' °C</strong></span></div>'+
  '<p class="reactor-panel-note">可在手机上左右滑动曲线。仅为物料段计算，冷油启动另行预算，未模拟并行升温。</p></section>';
}
const heatrow=(label,calc,value,isTotal,isHeatLoss=false)=>'<tr'+(isTotal?' class="highlight"':isHeatLoss?' class="reactor-heatloss-row"':'')+'><td>'+esc(label)+'</td><td class="calc">'+esc(calc)+'</td><td class="value">'+formatModel(value)+'</td></tr>';
function energyPanel(rc){
 const r=rc.r;
 return '<section class="reactor-output-panel" id="reactor-energy-panel"><div class="reactor-output-heading"><h3>热量账</h3><span class="chip">单位 MJ</span></div>'+
  '<div class="reactor-table-wrap"><table class="reactor-energy-table"><thead><tr><th>组成</th><th>计算式</th><th>热量 MJ</th></tr></thead><tbody>'+
  heatrow('物料显热','m × cp × ΔT',r.fluidMJ)+
  heatrow('釜体显热','m釜 × cp釜 × ΔT',r.metalMJ)+
  heatrow('夹套油预热','m油 × cp油 × ΔT油',r.oilMJ)+
  heatrow('环境散热','∫h × A外 × ΔT dt',r.lossMJ)+
  heatrow('基础总热量','物料＋釜体＋夹套油＋散热',r.totalMJ,true)+
  heatrow('热损耗量','基础热量 × 热损耗系数',rc.heatLossMJ,false,true)+
  heatrow('设计总热量','基础总热量＋热损耗量',rc.designHeatMJ,true)+
  '</tbody></table></div><div class="reactor-inline-calculation">物料段 '+formatModel(r.minutes)+' 分钟 + 冷油启动 '+formatModel(r.oilMinutes)+' 分钟，按设计余量 '+formatModel(r.p.margin*100)+'% 合成设计时间：<b>'+formatModel(r.referenceMinutes)+' 分钟</b>。</div>'+
  '<p class="reactor-panel-note">热量账平衡残差：'+formatModel(r.balanceErrorJ)+' J。热损耗系数仅为自定义附加热量预算；基础热量已含积分环境散热，请按实际工况核定，避免重复计入。</p></section>';
}
function checkPanel(rc,v){
 const {r,flowCheck,areaCheck,m}=rc;
 return '<section class="reactor-output-panel" id="reactor-sizing-panel"><div class="reactor-output-heading"><h3>工程校核</h3><span class="chip chip-amber">分项校核</span></div>'+
  '<div class="reactor-check-title"><strong>循环流量校核</strong><small>P = ṁ·cp·ΔT</small></div>'+
  '<div class="reactor-check-grid">'+sizingInput('sizePower','需要校核的热功率','kW',v.sizePower)+sizingInput('sizeDrop','允许进出口温降','°C',v.sizeDrop)+'</div>'+
  (flowCheck.error?'<div class="reactor-inline-error">'+esc(flowCheck.error)+'</div>':
    '<div class="reactor-check-results">'+row('建议的循环体积流量',flowCheck.m3h,'m³/h')+row('折合流量',flowCheck.m3h/0.06,'L/min')+row('循环介质质量流量',flowCheck.kgS,'kg/s')+'</div>')+
  '<div class="reactor-check-title top-gap"><strong>传热面积校核</strong><small>P = K·A·ΔTm</small></div>'+
  '<div class="reactor-check-grid">'+sizingInput('areaPower','需校核的热功率','kW',v.areaPower)+sizingInput('areaMean','有效平均温差','°C',v.areaMean)+'</div>'+
  (areaCheck.error?'<div class="reactor-inline-error">'+esc(areaCheck.error)+'</div>':
    '<div class="reactor-check-results">'+row('计算所需传热面积',areaCheck.area,'m²')+row('已填有效面积',r.p.area,'m²')+'</div>')+
  '<div class="reactor-check-title top-gap"><strong>搅拌参数参考演算</strong><small>旧版层流模型尚未经过桨型校验</small></div>'+
  '<div class="reactor-check-results">'+row('转速',r.p.rpm/60,'r/s')+row('雷诺数 Re',m.Re)+row('原版层流假设演算功率',m.laminarPowerW,'W')+row('演算扭矩',m.torque,'N·m')+'</div>'+
  '<div class="reactor-inline-alert">搅拌关联常数来自旧版用户输入，尚未按真实桨型和Re工况验证。此处不是电机功率选型，需进一步使用独立的“搅拌与黏度”模块核查。</div>'+
  '<p class="reactor-panel-note">流量和传热面积属于单独校核，允许你覆盖推荐值；修改校核输入不会更改上方热工计算工况。</p></section>';
}
function oilTable(){
 const ref=Thermal.oilReference;
 const headers=ref.columns.map(h=>'<th>'+esc(h)+'</th>').join('');
 const trs=ref.rows.map(row=>'<tr>'+row.map(val=>'<td>'+esc(val===null?'—':val)+'</td>').join('')+'</tr>').join('');
 return '<details class="details" style="margin-top:9px"><summary>导热油物性参考表（'+ref.rows.length+'个温度点）</summary><div class="details-body"><p class="reactor-panel-note">'+esc(ref.source)+'；暂无对应品牌及型号。本表是旧版用户资料，须按实际温度及牌号核定。</p><p class="reactor-swipe-hint">← 左右滑动查看完整物性表 →</p><div class="reactor-table-wrap reactor-oil-scroll" tabindex="0" role="region" aria-label="导热油物性表，左右滚动查看完整表格"><table class="reactor-energy-table reactor-oil-table"><thead><tr>'+headers+'</tr></thead><tbody>'+trs+'</tbody></table></div></div></details>';
}
function statusPanel(rc){
 const {r}=rc;
 const checks=[
  ['初始传热功率',r.initialKW,'kW'],
  ['结束传热功率',r.finalKW,'kW'],
  ['有效加热功率',r.effectiveKW,'kW'],
  ['平均供热功率',r.averageKW,'kW'],
  ['折合电能',r.kWh,'kWh'],
  ['当前循环流量',r.p.mode==='constant'?NaN:r.samples[0].flow/.06,'L/min'],
  ['理想恒温比较时间',r.ideal,'分钟'],
  ['总热容 C',r.capacity/1000,'kJ/K'],
  ['有效 UA',r.UA,'W/K']
 ];
 return '<section class="reactor-output-panel"><div class="reactor-output-heading"><h3>运行与模型校核</h3><span class="chip">9项指标</span></div>'+
   '<div class="reactor-operating-grid">'+checks.map(([title,v,unit])=>'<div><small>'+title+'</small><strong>'+formatModel(v)+' <span>'+unit+'</span></strong></div>').join('')+'</div>'+
   '<details class="details" style="margin-top:13px"><summary>查看模型警告与校核边界（'+r.warnings.length+'项）</summary><div class="details-body"><ul class="reactor-notes">'+r.warnings.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul></div></details>'+
   '<details class="details" style="margin-top:9px"><summary>查看公式与旧版物性来源说明</summary><div class="details-body"><p class="reactor-panel-note">计算引擎直接复制自旧版 engine.js 的 v0.2 算法；固定流量工况采用NTU近似，数值积分1600等分。冷油启动与物料过程顺序相加，不模拟并行升温。</p>'+
   '<div class="formula-line">C × dT/dt = P(T) − h×A外×(T−T环境)</div>'+
   '<div class="formula-line">Q物料 = m×cp×ΔT；Q釜体 = m釜×cp釜×ΔT</div>'+
   '<div class="formula-line">固定流量 B = G·[1−exp(−KA/G)]，G = 循环质量流量×cp</div>'+
   '<div class="formula-line">设计时间 = (物料段＋油预热预算)×(1+m)</div>'+
   '<div class="formula-line">参考时间 = 设计时间×(1+m)，为旧版对照标签</div>'+
   '<p class="reactor-panel-note">导热油物性来自用户提供的未注明牌号的表；玻璃cp和K等系数沿用旧版示例，未做现场校准。部分默认值仅适合数学演示，不能照搬到未知设备。</p></div></details>'+oilTable()+'</section>';
}
export function renderReactorResult(result,v){
 const top=document.getElementById('reactor-summary'),details=document.getElementById('reactor-details');
 if(!top||!details)return;
 const ready=result?.state==='ready';
 const actions=document.querySelectorAll('.reactor-page [data-action="save"],.reactor-page [data-action="copy"],.reactor-page [data-action="print"],.reactor-page [data-action="reactor-curve"]');
 actions.forEach(el=>{el.disabled=!ready;});
 if(!ready){
  top.innerHTML='<div class="reactor-top-error"><b>待计算</b> · '+esc(result?.message||'请先输入完整工况')+'</div>';
  const sticky=document.getElementById('reactor-sticky-result');if(sticky)sticky.hidden=true;
  document.body.classList.remove('reactor-scrolled');
  const legacy=document.getElementById('reactor-legacy-time');if(legacy)legacy.textContent='—';
  details.innerHTML=emptyOutput(result?.message);
  return;
 }
 const r=result.reactor.r;
 const editing=document.activeElement?.dataset?.input;
 const keepFocus=['sizePower','sizeDrop','areaPower','areaMean'].includes(editing)?editing:null;
 top.innerHTML=card('设计总时间',r.referenceMinutes,'分钟','顺序预算：物料＋冷油，再加一层设计余量','st-blue')+
  card('设计总热量',result.reactor.designHeatMJ,'MJ','基础总热量＋附加热损耗预算','st-sky')+
  card('物料升温段',r.minutes,'分钟','模型传热与散热积分','st-teal')+
  card('冷油启动预算',r.oilMinutes,'分钟','夹套油预热热量预算','st-coral')+
  card('有效加热功率',r.effectiveKW,'kW','额定×功率利用率','st-green')+
  card('平均供热功率',r.averageKW,'kW','基础热量÷基础时间','st-amber');
 details.innerHTML=temperaturePanel(r)+energyPanel(result.reactor)+checkPanel(result.reactor,v)+statusPanel(result.reactor);
  const legacy=document.getElementById('reactor-legacy-time');if(legacy)legacy.textContent=formatModel(result.reactor.refTotal);
  const compactMetrics=[
   ['reactor-sticky-time',r.referenceMinutes],
   ['reactor-sticky-energy',result.reactor.designHeatMJ],
   ['reactor-sticky-material',r.minutes],
   ['reactor-sticky-oil',r.oilMinutes],
   ['reactor-sticky-power',r.effectiveKW],
   ['reactor-sticky-average',r.averageKW]
  ];
  for(const [id,value] of compactMetrics){const el=document.getElementById(id);if(el)el.textContent=formatModel(value);}
  if(keepFocus){const el=details.querySelector('[data-input="'+keepFocus+'"]');el?.focus({preventScroll:true});}
}
export function setDefaultSizing(v,result){
 const r=result?.reactor?.r;
 if(!r)return;
 const fallback={
  sizePower:Math.max(Math.abs(r.initialKW),Math.abs(r.finalKW)),
  sizeDrop:20,
  areaPower:Math.abs(r.initialKW),
  areaMean:Math.abs(r.initialKW)*1000/r.UA
 };
 for(const [k,defaultValue] of Object.entries(fallback)){
  if(v[k]===undefined||v[k]===null||v[k]==='')v[k]=Number(defaultValue.toFixed(4));
 }
}
export function downloadCurveFile(result){
 const content=toCurveCSV(result);
 if(!content)return false;
 const data=new Blob([content],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(data);
 const a=document.createElement('a');a.href=url;a.download='釜算_升温曲线_'+Date.now()+'.csv';
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 return true;
}