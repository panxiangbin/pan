/* 釜算 V0.3 · 模块扩展引擎
 * 只做条件明确的初算与已知参数核校。不推荐具体设备或替代安全/机械设计。
 */
import {calcMix,calcDistill,calcVacuum} from './core.mjs';

const m=(label,value,unit='',description='')=>({label,value:Number(Number(value).toPrecision(7)),unit,description});
const bad=(message,state='blocked')=>({state,title:state==='incomplete'?'需要补充参数':'当前条件无法完成计算',message,metrics:[],notes:[],refs:[]});
const good=(title,level,metrics,notes,formulas=[],refs=[],extra={})=>({state:'ready',title,level,metrics,notes,formulas,refs,...extra});
const round=n=>Number(n.toPrecision(5));
function need(v,key,title,min=-Infinity,max=Infinity){
 const raw=v[key];
 if(raw===null||raw===undefined||String(raw).trim()==='')throw {state:'incomplete',message:'需要填写'+title+'。'};
 const n=Number(raw);
 if(!Number.isFinite(n)||n<min||n>max)throw {state:'blocked',message:title+'不在有效范围内。'};
 return n;
}
const optional=(v,k)=>v[k]===null||v[k]===undefined||String(v[k]).trim()===''?null:Number(v[k]);
function guard(fn){try{return fn();}catch(e){return bad(e?.message||'计算失败，请检查输入参数。',e?.state||'blocked');}}
const Ref={
 fenske:{label:'Wankat Separation Process Engineering · Fenske/平衡级计数约定',url:'https://www.informit.com/articles/article.aspx?p=3167983&seqNum=2'},
 rayleigh:{label:'Seader, Henley & Roper, Separation Process Principles · Differential Distillation (Rayleigh)',url:''},
 packing:{label:'Sulzer Structured Packings · HETP随气液负荷和物系改变',url:'https://www.sulzer.com/en/-/media/files/products/separation-technology/brochures/english/structured_packings_e10686_en_web.pdf'},
 pipe:{label:'Darcy–Weisbach方程、Colebrook–White摩阻关联（限定单相不可压缩稳态）',url:''},
 motor:{label:'传动功率、效率和额定扭矩算术比较；服务系数必须由厂家给定',url:''},
 vacuum:{label:'Pfeiffer Vacuum Knowledge Book §2.2 · 压力依赖抽速分段计算',url:'https://www.pfeiffervacuum.com/global/en/knowledge/vacuum-technology/knowledge-book/2-basic-calculations/2_2_calculations/'}
};
export function calcDistillExpanded(v){
 const task=v.task||'fenske';
 if(['fenske','mccabe'].includes(task))return calcDistill(v);
 return guard(()=>{
  if(task==='tray'){
   const nth=need(v,'towerNth','塔内所需理论级（不含再沸器）',.000001,100000);
   const e=need(v,'towerEff','用户提供的全塔效率（%）',.000001,100)/100;
   const value=nth/e;
   return good('连续板式塔 · 塔板数量换算','有限条件估算',
    [m('按给定全塔效率换算',Math.ceil(value),'块','向上取整'),m('未取整的换算量',value,'块'),m('输入塔内理论级',nth,'级'),m('指定全塔效率',e*100,'%')],
    ['此处的N_th必须是操作回流比下的塔内理论级，已排除再沸器，不能输入Fenske全回流最小级数代替。','全塔效率由用户在同一物系、塔型、工况下确定；未验证时不得将结果用于塔板工程设计。','暂未校核液泛、雾沫夹带、漏液、塔径、压降与机械布置。'],
    ['N实际板(换算) = N塔内理论级 ÷ 用户给定全塔效率','结果向上取整，仅为数量换算，不代表设备水力学通过。'],[Ref.fenske]);
  }
  if(task==='packing'){
   const n=need(v,'packStages','填料段所需理论级数',.000001,100000);
   const hetp=need(v,'hetp','用户提供的HETP（m）',.0000001,1000);
   return good('连续填料塔 · 填料高度换算','有限条件估算',
    [m('所需有效填料高度',n*hetp,'m'),m('对应理论级数',n,'级'),m('提供的HETP',hetp,'m')],
    ['HETP必须对应填料型号、物系、操作压力以及气液负荷，不可使用通用经验高度。','这里只是高度换算，不包含上部/下部分布器、支撑、持液空间和设备总高；未验证填料压降、液泛和润湿条件。'],
    ['Z填料 = N填料段理论级 × HETP'],[Ref.packing]);
  }
  if(task==='rayleigh'){
   const alpha=need(v,'alpha','假设恒定相对挥发度α',1.0000001,1000);
   const x0=need(v,'batchX0','初始釜液轻组分摩尔分数',1e-8,1-1e-8);
   const xw=need(v,'batchXw','目标残液轻组分摩尔分数',1e-8,1-1e-8);
   const w0=need(v,'batchW0','初始釜内总摩尔数',.000001,1e15);
   if(xw>=x0)throw {message:'当前假设轻组分更易挥发，残液的轻组分目标应小于初始组成。'};
   // Rayleigh: ln(W0/W)=integral_{xw}^{x0} dx/[y*(x)-x]; composite Simpson.
   const integral=x=>{
    const y=alpha*x/(1+(alpha-1)*x);
    const diff=y-x;
    if(diff<=0)throw {message:'相平衡与液相组成差不足，无法进行Rayleigh积分。'};
    return 1/diff;
   };
   const N=2400,h=(x0-xw)/N;
   let sum=integral(xw)+integral(x0);
   for(let j=1;j<N;j++)sum+=(j%2?4:2)*integral(xw+j*h);
   const I=sum*h/3;
   if(!Number.isFinite(I)||I<0||I>500)throw {message:'分离目标使简化积分超出稳定计算范围，请重新检查目标组成。'};
   const ratio=Math.exp(-I);
   const W=w0*ratio,D=w0-W;
   const lightOut=w0*x0-W*xw;
   const xD=D>0?lightOut/D:NaN;
   if(!Number.isFinite(xD)||xD<0||xD>1)return bad('物料衡算不在可接受范围，暂不输出结果。');
   return good('二元简单间歇蒸馏 · Rayleigh物料衡算','教学/条件初算',
    [m('剩余釜液总量',W,'mol'),m('累计馏出量',D,'mol'),m('平均馏出轻组分摩尔分数',xD,''),m('累计馏出比例',D/w0*100,'%'),m('Rayleigh积分值',I,'')],
    ['适用无回流的简单间歇蒸馏、二元、恒定α、釜内完全混合及忽略持液量的近似情况。','不是带回流的间歇精馏塔，不计算馏出时间、冷凝负荷、精馏柱级数或产品纯度的时间轨迹。','输入的轻组分摩尔分数和α须由实际物系及对应压力数据提供。'],
    ['ln(W0/W) = ∫(xW→x0) dx/[y*(x)−x]','y*(x) = αx/[1+(α−1)x]','D = W0 − W；xD,avg = (W0·x0−W·xW)/D'],[Ref.rayleigh]);
  }
  return bad('尚未支持此类精馏计算，请先选择可用任务。');
 });
}
export function viscosityInterpolation(v){
 const mu1=need(v,'mu1','已测黏度μ1',1e-12),mu2=need(v,'mu2','已测黏度μ2',1e-12);
 const t1=need(v,'temp1','测量温度T1（°C）',-273.149),t2=need(v,'temp2','测量温度T2（°C）',-273.149);
 const tw=need(v,'tempWork','工作温度（°C）',-273.149);
 if(t1===t2)throw {message:'两个黏度测量温度必须不同。'};
 if(tw<Math.min(t1,t2)||tw>Math.max(t1,t2))throw {message:'当前只支持两个实测温度范围内的插值，不允许外推。'};
 const a=1/(t1+273.15),b=1/(t2+273.15),w=1/(tw+273.15);
 const logmu=Math.log(mu1)+(Math.log(mu2)-Math.log(mu1))*(w-a)/(b-a);
 const value=Math.exp(logmu);
 if(!Number.isFinite(value)||value<=0)throw {message:'黏度插值发生数值异常。'};
 return {value,temp:tw};
}
export function calcMixExpanded(v){
 return guard(()=>{
  let values={...v},viscosity=null;
  if(v.viscMode==='temperature'){
   if(v.rheology!=='newtonian')return bad('两点Arrhenius型黏度插值仅用于确认无相变、相同牛顿流体的有限温度区间。');
   viscosity=viscosityInterpolation(v);
   values.mu=viscosity.value;
  }
  const base=calcMix(values);
  if(base.state!=='ready')return base;
  if(viscosity){
   base.metrics.unshift(m('目标温度黏度（插值）',viscosity.value,v.muUnit||'mPa·s'));
   base.notes.unshift('由同一牛顿流体两组实测黏度按ln(μ)与1/T线性插值得到，非公认通用黏度模型；不包含相变和剪切变化，禁止超出温区外推。');
   base.formulas=[...(base.formulas||[]),'ln μ 对 1/T 线性插值；T使用绝对温度(K)。'];
  }
  if(v.motorCheck!=='yes')return base;
  const wattItem=base.metrics.find(o=>o.label==='叶轮轴功率'||o.label==='轴功率（由自填Np换算）');
  const torqueItem=base.metrics.find(o=>o.label==='轴扭矩');
  if(!wattItem||!torqueItem){
   base.notes.unshift('需先取得有适用来源的轴功率和扭矩，才能进行传动参数算术校核；仅有Re不能选电机。');
   return base;
  }
  const required=['driveEfficiency','serviceFactor','motorRatedKW','gearRatedNm'];
  if(required.some(k=>v[k]===null||v[k]===undefined||String(v[k]).trim()==='')){
   base.notes.unshift('要校核传动额定参数，请补充厂家效率、服务系数、电机铭牌功率和减速机额定输出扭矩（不能为空）。');
   return base;
  }
  const efficiency=need(v,'driveEfficiency','用户输入传动总效率%',.0000001,100)/100;
  const SF=need(v,'serviceFactor','厂家给定服务系数',1,100);
  const ratedKW=need(v,'motorRatedKW','已选电机铭牌功率（kW）',1e-8,1e8);
  const ratedNm=need(v,'gearRatedNm','减速机额定输出扭矩（N·m）',1e-8,1e12);
  const inReq=wattItem.value/efficiency/1000;
  const checkKW=inReq*SF,checkNm=torqueItem.value*SF;
  const worksPower=ratedKW>=checkKW,worksNm=ratedNm>=checkNm;
  base.metrics.push(m('轴功率折合传动输入',inReq,'kW','未计启动峰值'),m('按提供服务系数的功率比较值',checkKW,'kW'),
    m('按提供服务系数的扭矩比较值',checkNm,'N·m'));
  base.level='厂家参数条件校核';
  base.notes.unshift('已选电机功率与折算比较值：'+(worksPower?'数值满足':'数值不足')+'；已选减速机额定输出扭矩与比较值：'+(worksNm?'数值满足':'数值不足')+'。这仅为您提供的稳态参数算术比较，不证明启动力矩、轴、密封、防爆和机械系统合格。');
  base.notes.unshift('厂家条件：传动效率'+round(efficiency*100)+'%，服务系数'+SF+'，铭牌功率'+ratedKW+' kW，减速机额定扭矩'+ratedNm+' N·m。请逐项核实厂家资料与工况一致。');
  base.formulas=[...(base.formulas||[]),'P输入,比较 = P轴 / η；P功率核校值 = P输入 × 厂家服务系数','T扭矩核校值 = T轴 × 厂家服务系数（仅条件算术比较）'];
  base.refs=[...(base.refs||[]),Ref.motor];
  return base;
 });
}
function pumpFriction(Re,roughnessRatio){
 if(Re<2300)return 64/Re;
 if(Re<=4000)return null;
 // Colebrook–White fixed-point iteration, positive Darcy friction factor.
 let f=.02;
 for(let i=0;i<100;i++){
  const next=Math.pow(-2*Math.log10(roughnessRatio/3.7+2.51/(Re*Math.sqrt(f))),-2);
  if(!Number.isFinite(next)||next<=0)throw {message:'摩阻因子不收敛，请核对管径、流量和粗糙度。'};
  if(Math.abs(next-f)<1e-12)return next;
  f=next;
 }
 return f;
}
export function calcPipe(v){
 return guard(()=>{
  const Q=need(v,'pipeFlow','实际体积流量（L/min）',1e-8)/60000;
  const D=need(v,'pipeInnerD','管道内径（mm）',1e-8)/1000;
  const L=need(v,'pipeLength','等径直管长度（m）',0);
  const rho=need(v,'pipeRho','液体密度（kg/m³）',1e-8);
  const mu=need(v,'pipeMu','液体动力黏度（mPa·s）',1e-8)*.001;
  const e=need(v,'pipeRough','用户给定绝对粗糙度（mm）',0)/1000;
  const K=need(v,'pipeK','管件局部阻力系数总和ΣK',0);
  const lift=need(v,'pipeLift','管路静扬程（m）',0);
  const area=Math.PI*D*D/4;
  const velocity=Q/area;
  const Re=rho*velocity*D/mu;
  const base=[m('管内平均流速',velocity,'m/s'),m('管道雷诺数',Re,''),m('体积流量',Q*3600,'m³/h')];
  if(Re>=2300&&Re<=4000){
   return good('管道流动状态','过渡流 · 不计算压降',base,
    ['Re处于2300–4000过渡区，摩阻相关式结果不稳定；当前不输出泵扬程或功率。','需使用针对该系统的实验、厂家曲线或更严格流动模型。'],
    ['Re = ρvD/μ；v = Q/(πD²/4)'],[Ref.pipe]);
  }
  const f=pumpFriction(Re,e/D);
  const dynamic=.5*rho*velocity*velocity;
  const lineLoss=f*(L/D)*dynamic;
  const localLoss=K*dynamic;
  const deltaP=lineLoss+localLoss;
  const headF=deltaP/(rho*9.80665);
  const totalHead=headF+lift;
  const hydKW=rho*9.80665*Q*totalHead/1000;
  const metrics=[m('所需总扬程（初算）',totalHead,'m'),m('管路摩擦与局部压降',deltaP/1000,'kPa'),
   ...base,m('Darcy摩阻因子',f,''),m('直管压降',lineLoss/1000,'kPa'),m('局部压降',localLoss/1000,'kPa'),
   m('管路摩擦扬程',headF,'m'),m('最小水力功率',hydKW,'kW')];
  const notes=['稳态、单相、不可压缩、等管径计算；未计泵吸入汽蚀余量NPSH、气液两相、温度变化及管道附件未提供的压损。','循环闭合管路的静扬程通常抵消，若非开式提升不得随意加静扬程；需按照实际工况填写。','管道绝对粗糙度和ΣK必须由实际管材/管件资料确定；不得用未知数据代替。'];
  const eta=optional(v,'pipeEta');
  if(eta!==null){
   if(!Number.isFinite(eta)||eta<=0||eta>100)throw {message:'用户提供的泵效率必须在(0,100%]范围。'};
   metrics.push(m('按自填效率换算轴功率',hydKW/(eta/100),'kW','并非电机铭牌选型'));
   notes.unshift('泵效率'+eta+'%由用户自行提供；轴功率只完成效率换算，不代表真实泵性能曲线满足流量扬程。');
  }
  return good('循环液体管路压降及扬程','工况条件估算',metrics,notes,
   ['v=Q/A；Re=ρvD/μ','Δp=[f·(L/D)+ΣK]·ρv²/2','H=Δp/(ρg)+Δz；P水力=ρgQH','Re<2300:f=64/Re；Re>4000:Colebrook–White'],[Ref.pipe]);
 });
}
function speedsFromText(raw){
 const lines=String(raw||'').trim().split(/\r?\n/).filter(Boolean);
 if(lines.length<2||lines.length>40)throw {state:'incomplete',message:'请按每行“绝对压力mbar,有效抽速m³/h”输入2至40个数据点。'};
 const points=lines.map((line,i)=>{
  const z=line.trim().split(/[,，;\s]+/).filter(Boolean).map(Number);
  if(z.length!==2||z.some(x=>!Number.isFinite(x)||x<=0))throw {message:'第'+(i+1)+'行压力或有效抽速不合法；请使用英文逗号分隔的两个正数。'};
  return {p:z[0],s:z[1]};
 }).sort((a,b)=>a.p-b.p);
 for(let i=1;i<points.length;i++)if(points[i].p<=points[i-1].p)throw {message:'曲线压力点必须唯一，不允许重复。'};
 return points;
}
function linSpeed(p,pts){
 for(let i=1;i<pts.length;i++)if(p<=pts[i].p){
  const a=pts[i-1],b=pts[i];
  return a.s+(p-a.p)/(b.p-a.p)*(b.s-a.s);
 }
 return pts.at(-1).s;
}
export function calcVacuumExpanded(v){
 if(v.speedMode!=='curve')return calcVacuum(v);
 return guard(()=>{
  const V=need(v,'volume','空腔体积（L）',1e-9)/1000;
  const p0=need(v,'p0','起始绝对压力mbar',1e-10);
  const p1=need(v,'p1','目标绝对压力mbar',1e-10);
  const pu=need(v,'pu','系统极限绝对压力mbar',0);
  if(!(p0>p1&&p1>pu))throw {message:'必须满足起始绝对压力 > 目标绝对压力 > 可达极限压力。'};
  const pts=speedsFromText(v.speedCurve);
  if(pts[0].p>p1||pts.at(-1).p<p0)throw {message:'压力—抽速曲线必须完整覆盖起始压力和目标压力，禁止区间外推。'};
  const boundaries=[p1,...pts.filter(a=>a.p>p1&&a.p<p0).map(a=>a.p),p0];
  let t=0;
  for(let i=1;i<boundaries.length;i++){
   const a=boundaries[i-1],b=boundaries[i],steps=80,h=(b-a)/steps;
   const integrand=p=>{
    const s=linSpeed(p,pts)/3600;
    return V/(s*(p-pu));
   };
   let sum=integrand(a)+integrand(b);
   for(let j=1;j<steps;j++)sum+=(j%2?4:2)*integrand(a+j*h);
   t+=sum*h/3;
  }
  if(!Number.isFinite(t)||t<0)throw {message:'抽速曲线积分未得到有效结果。'};
  return good('压力相关有效抽速 · 分段抽气计算','条件估算',
   [m('分段预测抽气时间',t/60,'分钟'),m('折合',t,'秒'),m('抽速曲线数据点',pts.length,'点')],
   ['依据用户提供的容器端S(p)曲线在目标压力范围内做数值积分，曲线点之间按压力线性插值，禁止外推。','仍然不计泄漏、放气、溶剂蒸汽和材料释气；结果不是实际抽气时间保证。','所有压力都必须为绝对压力；不得把负压表读数未经转换直接输入。'],
   ['dt = V·dp/[S_eff(p)·(p−p_ult)]；对压力区间数值积分','抽速曲线相邻点之间线性插值（用户提供数据）'],[Ref.vacuum]);
 });
}

/** 工程辅助：批次冷却负荷和旋蒸/蒸发热量的纯能量衡算。
 * 没有UA、热源/冷源曲线时不能预测完成时间或设备性能。
 */
export function calcDuty(v){
 return guard(()=>{
  const mode=v.dutyMode||'cooling';
  if(mode==='cooling'){
   const mass=need(v,'coldMass','物料质量（kg）',1e-9);
   const cp=need(v,'coldCp','物料比热（kJ/kg·K）',1e-9);
   const ti=need(v,'coldInitial','初始温度（°C）',-273.15);
   const tf=need(v,'coldTarget','目标温度（°C）',-273.15);
   if(!(ti>tf))throw {message:'请选择真实降温工况：初始温度必须高于目标温度。'};
   const mm=optional(v,'coldVesselMass'),mc=optional(v,'coldVesselCp');
   if((mm===null)!==(mc===null))throw {state:'incomplete',message:'如考虑釜体热容，必须同时填写有效釜体质量和釜体比热；否则两项均留空。'};
   if(mm!==null&&(!Number.isFinite(mm)||mm<0||!Number.isFinite(mc)||mc<=0))throw {message:'有效釜体质量不能小于0，釜体比热必须大于0。'};
   const qMat=mass*cp*(ti-tf),qVessel=(mm||0)*(mc||0)*(ti-tf),total=qMat+qVessel;
   const metrics=[m('物料待移除显热',qMat,'kJ'),m('釜体待移除显热',qVessel,'kJ'),m('显热合计',total,'kJ'),m('折合',total/3600,'kWh')];
   const notes=['只计算物料与可选釜体的显热，没有冷却时间或可行性保证。未计放热反应、相变、外界热负荷及传热面积/K值。'];
   const time=optional(v,'coldDesiredMinutes');
   if(time!==null){
    if(!Number.isFinite(time)||time<=0)throw {message:'用户指定的目标降温时间必须大于0。'};
    const avgKW=total/(time*60);
    metrics.push(m('按目标时间所需平均冷量',avgKW,'kW','非实际制冷机额定功率'));
    notes.unshift('所需平均冷量是热量/指定时间的算术值，不能直接判定现有冷水机能否达到目标。');
    const cc=optional(v,'coolantCp'),ct=optional(v,'coolantDelta');
    if((cc===null)!==(ct===null))throw {state:'incomplete',message:'计算冷却介质所需质量流量时，必须同时填写冷媒比热及升温幅度。'};
    if(cc!==null){
     if(!Number.isFinite(cc)||cc<=0||!Number.isFinite(ct)||ct<=0)throw {message:'冷媒比热和冷媒允许温升必须大于0。'};
     metrics.push(m('所需冷媒质量流量（平均）',avgKW*3600/(cc*ct),'kg/h','基于所填冷媒温升和平均冷量'));
    }
   }
   return good('反应釜降温 · 显热与冷量衡算','基础热量/条件冷量',metrics,notes,
    ['Q=(m·cp + m釜·cp釜)×(T初−T末)','P平均(kW)=Q(kJ)/t(s)','冷媒质量流量(kg/h)=P平均×3600/(cp冷媒·ΔT)'],
    [{label:'显热守恒关系；模型未包含冷却器UA或制冷机容量曲线',url:''}]);
  }
  if(mode==='evap'){
   const mass=need(v,'evapMass','计划蒸发溶剂质量（kg）',1e-9);
   const latent=need(v,'evapLatent','工作条件下汽化潜热（kJ/kg）',1e-9);
   const Qlat=mass*latent;
   let Qsens=0;
   const cp=optional(v,'evapCp'),ti=optional(v,'evapInitial'),tb=optional(v,'evapBoiling');
   if([cp,ti,tb].some(x=>x!==null)&&![cp,ti,tb].every(x=>x!==null))throw {state:'incomplete',message:'如需加入溶剂升温显热，请同时填写比热、初始温度和蒸发温度；否则全部留空。'};
   if(cp!==null){
    if(!Number.isFinite(cp)||cp<=0||!Number.isFinite(ti)||!Number.isFinite(tb)||ti < -273.15||tb < ti)throw {message:'溶剂升温参数不合理，请核对工作温度及比热。'};
    Qsens=mass*cp*(tb-ti);
   }
   const total=Qlat+Qsens;
   const metrics=[m('汽化潜热总需求',Qlat,'kJ'),m('预热显热总需求',Qsens,'kJ'),m('合计理论热量',total,'kJ'),m('热量折合',total/3600,'kWh')];
   const notes=['仅用于已知蒸发质量及热力学潜热条件的能量衡算；没有计算实际蒸发速率或完成时间。','不考虑溶剂混合物活度、冷凝不完全、真空泵能力、薄膜面积和传热限制。'];
   const desired=optional(v,'evapDesiredMinutes');
   if(desired!==null){
    if(!Number.isFinite(desired)||desired<=0)throw {message:'指定的目标蒸发时长必须大于0。'};
    metrics.push(m('按指定时长所需平均供热',total/(desired*60),'kW','只是反向计算负荷，非实际完成时间预测'));
    metrics.push(m('潜热对应最小平均冷凝负荷',Qlat/(desired*60),'kW','理想潜热量级'));
    notes.unshift('目标时长由用户指定，并非由网站预测；负荷数值不能证明该旋蒸、冷凝器和真空泵能够实现。');
   }
   return good('旋蒸/蒸发 · 已知物性热量衡算','基础热量/条件负荷',metrics,notes,
    ['Q汽化=m×Δh汽化','Q预热=m×cp×(T蒸发−T初始)','目标时间平均热负荷=Q总/t用户指定'],[]);
  }
  return bad('请选择冷却或蒸发热量计算方式。');
 });
}