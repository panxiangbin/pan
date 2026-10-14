/* V0.6.2: arithmetic power-rating reference, not an equipment selection model.
 * The underlying fixed-reference mixing correlation is NOT changed.
 * Ratings are a documented subset of ABB 9AKK108196 EN 09-2024, p.6;
 * p.15/p.18 contain example 4-pole motors. No brand/model/Ex recommendation.
 */
export const MOTOR_RATING_KW=Object.freeze([.12,.18,.25,.37,.55,.75,1.1,1.5,2.2,3,4,5.5,7.5,11,15,18.5,22,30,37,45,55,75,90,110,132,160,200,250,315,355]);
export const MOTOR_TABLE_SOURCE={label:'功率档位参考：ABB 9AKK108196 EN 09-2024，第6页（取常见子集）；仅档位数值，不是型号选型',url:'https://library.e.abb.com/public/e66a5a81e80849fc8ac71fd0d4e31b7e/9AKK108196_General_performance_cast_iron_motors_09-2024_lowres.pdf?x-sign=%2BbkYRIbrdSQjTPV%2Ffr8seX28kCgra%2FRzis3mIEIWRZHajyGrzv22VIa4AVoxdiWn'};
export function calculateMotorSizing(shaftKW,efficiency,marginPercent){
 if(!Number.isFinite(shaftKW)||shaftKW<=0)throw new RangeError('搅拌轴功率必须为有限正数。');
 if(!Number.isFinite(efficiency)||efficiency<=0||efficiency>1)throw new RangeError('传动效率必须大于0且不超过1。');
 if(!Number.isFinite(marginPercent)||marginPercent<0||marginPercent>100)throw new RangeError('功率余量必须在0–100%之间。');
 const factor=1+marginPercent/100,withMarginShaftKW=shaftKW*factor;
 const requiredKW=withMarginShaftKW/efficiency,withoutMarginKW=shaftKW/efficiency;
 if(![withMarginShaftKW,requiredKW,withoutMarginKW].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('功率计算超出数值范围。');
 const range=requiredKW<MOTOR_RATING_KW[0]?'below':requiredKW>MOTOR_RATING_KW.at(-1)?'above':'within';
 // Select from the unrounded value. Never clamp above the catalog maximum.
 const ratingKW=range==='within'?MOTOR_RATING_KW.find(p=>p>=requiredKW):null;
 const previousKW=ratingKW===null?null:MOTOR_RATING_KW[MOTOR_RATING_KW.indexOf(ratingKW)-1]??null;
 return {shaftKW,efficiency,marginPercent,factor,withMarginShaftKW,requiredKW,withoutMarginKW,ratingKW,previousKW,range};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mixNumber(value){
 if(!Number.isFinite(value))return '—';
 if(value!==0&&(Math.abs(value)<.0001||Math.abs(value)>=1e8))return value.toExponential(3);
 return new Intl.NumberFormat('zh-CN',{maximumSignificantDigits:5,useGrouping:false}).format(value);
}
const row=(id,label,value,unit,formula)=>({id,label,value,unit,formula});
export function completeMixMotorReference(result){
 if(result.state!=='ready')return result;
 const a=result.audit,s=calculateMotorSizing(a.shaftKW,a.efficiency,a.margin*100),f=mixNumber;
 const selected=s.ratingKW!==null;
 result.motorSizing=s;
 result.title='三参数搅拌简算 · 电机功率档位参考';
 result.level='档位参考 · 未标定';
 result.calculationRows=[
  row('rpm','搅拌轴转速',a.rpm,'rpm',`${f(a.motorRpm)} ÷ ${f(a.ratio)}`),
  row('re','雷诺数 Re',a.Re,'','ρ × n × d² ÷ μ；按固定参考几何计算'),
  row('np','功率数 Np',a.Np,'','Furukawa 2012表1关联式；不是固定系数'),
  row('shaft','搅拌轴功率',s.shaftKW,'kW','Np × ρ × n³ × d⁵ ÷ 1000'),
  row('margin',`增加功率余量（${f(s.marginPercent)}%）`,s.withMarginShaftKW,'kW',`${f(s.shaftKW)} × ${f(s.factor)}`),
  row('motor',`计入传动损耗（效率${f(s.efficiency*100)}%）`,s.requiredKW,'kW',`${f(s.withMarginShaftKW)} ÷ ${f(s.efficiency)}`)
 ];
 if(selected)result.calculationRows.push(row('rating','电机功率档位参考',s.ratingKW,'kW',`不小于 ${f(s.requiredKW)} kW，按未取整值向上取档`));
 const ratingNote=selected?`功率档位参考 ${f(s.ratingKW)} kW：仅把含余量计算值 ${f(s.requiredKW)} kW 向上匹配到内置档位；这不是已匹配实物的电机选型。`:`含余量计算值 ${f(s.requiredKW)} kW ${s.range==='below'?'低于':'高于'}本档位表0.12–355 kW范围，不自动指定档位。`;
 result.notes[0]=ratingNote;
 result.notes.unshift(`本次功率余量 ${f(s.marginPercent)}%（乘${f(s.factor)}）为可调整试算条件，不是经过厂家确认的安全系数或服务系数。V0.6.2新计算初始值为30%，历史记录保留原值。`);
 result.notes.push('未确定是否需要防爆电机，也未确定防爆等级、安装方式、工作制或启动能力；这些不能由容量、黏度、速比和功率档位自动判定。');
 result.metrics=[...(selected?[{label:'电机功率档位参考（非已确认选型）',value:s.ratingKW,unit:'kW'}]:[]),{label:'含余量电机轴功率计算值',value:s.requiredKW,unit:'kW'},{label:'功率余量',value:s.marginPercent,unit:'%'},{label:'传动效率',value:s.efficiency*100,unit:'%'},...result.metrics.filter(m=>m.label!=='含自定余量的功率比较值')];
 result.formulas.push('含余量电机轴功率 = 搅拌轴功率 × (1 + 功率余量%/100) ÷ 传动效率；余量和效率各处理一次。','档位参考 = 内置表中不小于含余量计算值的最小档位；越出表格范围不取档。档位不是型号或适用性结论。');
 result.refs.push(MOTOR_TABLE_SOURCE);
 result.modelId='Furukawa2012-fixed-paddle-061+rating-062';
 return result;
}
export function mixCalculationText(result){
 if(!result.motorSizing)return [];
 return ['功率计算过程（显示值经四舍五入，取档使用未取整值）：',...result.calculationRows.map(r=>`${r.label}：${mixNumber(r.value)} ${r.unit}；${r.formula}`),...(result.motorSizing.ratingKW===null?['本次计算超出内置功率档位表范围，不自动取档。']:[])];
}
export function renderMixMotorResult(result){
 const s=result.motorSizing,a=result.audit,f=mixNumber,selected=s.ratingKW!==null;
 const main=selected?`<strong id="mix-motor-rating">${f(s.ratingKW)}</strong><span>kW</span>`:'<strong id="mix-motor-rating" class="motor-no-rating">暂不取档</strong>';
 const conclusion=selected?`含余量计算值 ${f(s.requiredKW)} kW → 向上匹配 ${f(s.ratingKW)} kW。`:`计算值 ${f(s.requiredKW)} kW ${s.range==='below'?'低于':'高于'}内置档位表0.12–355 kW，需另行核实。`;
 const table=result.calculationRows.map(r=>`<tr data-step="${r.id}"><th scope="row">${esc(r.label)}<small>${esc(r.formula)}</small></th><td><b>${f(r.value)}</b> <span>${esc(r.unit)}</span></td></tr>`).join('');
 const refs=result.refs.map(r=>r.url?`<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.label)}</a>`:`<span>${esc(r.label)}</span>`).join('');
 return `<div class="mix-motor-output">
  <section class="motor-reference" aria-label="电机功率档位参考">
   <div class="motor-reference-label">电机功率档位参考</div><div class="motor-reference-value">${main}</div>
   <p>${esc(conclusion)}</p><div class="motor-caution">按固定参考配置试算，未经实物标定；档位参考不是已确认选型。</div>
  </section>
  <div class="motor-assumptions" id="mix-assumption-summary">本次预设：电机 ${f(a.motorRpm)} rpm · 密度 ${f(a.rho)} kg/m³ · 传动效率 ${f(s.efficiency*100)}% · 功率余量 ${f(s.marginPercent)}%（可展开修改）</div>
  <section class="motor-ledger"><h3>功率计算过程</h3><table><thead><tr><th scope="col">项目 / 算法</th><th scope="col">结果</th></tr></thead><tbody>${table}</tbody></table><p class="motor-rounding">取档按未取整值比较；表内数值仅为显示精度。功率余量是试算预设，不代表启动或安全校核通过。</p></section>
  <div class="motor-secondary"><div><small>稳态搅拌轴扭矩</small><b>${f(a.torque)} <em>N·m</em></b></div><div><small>参考桨叶直径（非实测）</small><b>${f(a.impellerD*1000)} <em>mm</em></b></div></div>
  <p class="motor-safety">本页不判断是否需要防爆电机，不保证启动能力或搅拌效果。实际桨型、几何或工况不同，不能直接照用本结果。</p>
  <details class="details" data-motor-details="basis"><summary>参考配置、适用范围与来源</summary><div class="details-body"><ul class="hint-list">${result.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul><div class="formulas">${result.formulas.map(x=>`<div class="formula-line">${esc(x)}</div>`).join('')}</div><div class="sources">${refs}</div></div></details>
 </div>`;
}
