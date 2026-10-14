/* 釜算 V0.6.1: three-input, explicitly hypothetical mixing configuration.
 * Reference: Furukawa et al. (2012), doi:10.1155/2012/106496, Table 1 / Fig.4.
 * Fixed geometry: single 2-blade flat paddle; d/T=.585, b/T=.146, H/T=1,
 * C/H=.5; flat-bottom cylindrical, unbaffled, no other internals, ungassed.
 * These are reference geometry, NOT verified YUHUA dimensions. Density,
 * motor speed and drive efficiency below are editable assumptions, not data.
 * Keep the existing detailed calculation separate and unchanged.
 */
import {completeMixMotorReference} from './mix_motor.mjs?v=062';
export const MIX_REFERENCE = Object.freeze({diameterRatio:.585, widthRatio:.146, blades:2, heightRatio:1, clearanceRatio:.5});
export function mixQuickInitial(){return {mixMode:'quick',qVolume:'',qMu:'',qRatio:'',qRho:'1000',qMotorRpm:'1440',qEfficiency:'85',qMargin:'30',qRheology:'newtonian'};}
export function parseReductionRatio(raw){
 const text=String(raw??'').trim();
 if(!text)throw {state:'incomplete',message:'请填写减速速比，例如20或20:1。'};
 const pair=text.match(/^(\d+(?:\.\d+)?)\s*[:：/]\s*1(?:\.0*)?$/);
 const number=pair?Number(pair[1]):/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(text)?Number(text):NaN;
 if(!Number.isFinite(number)||number<1||number>10000)throw {message:'减速速比请输入1–10000之间的数值，或20:1这样的减速格式；不能填输出转速。'};
 return number;
}
// Full unbaffled correlation with sin(theta)=1 for this fixed flat paddle.
// Do not replace its transitional region with an invented viscosity multiplier.
export function referencePowerNumber(Re){
 if(!Number.isFinite(Re)||Re<=0)throw new RangeError('Re must be positive and finite.');
 const r=MIX_REFERENCE.diameterRatio,b=MIX_REFERENCE.widthRatio,z=MIX_REFERENCE.blades,L=Math.log(1/r);
 const eta=.711*(.157+Math.pow(z*L,.611))/(Math.pow(z,.52)*(1-r*r));
 const beta=2*L/(1/r-r),gamma=Math.cbrt(eta*L/Math.pow(beta/r,5));
 const X=gamma*Math.pow(z,.7)*b;
 const CL=.215*eta*z*r*(1-r*r)+1.83*b*Math.cbrt(z/2);
 const Ct=Math.pow(Math.pow(1.96*Math.pow(X,1.19),-7.8)+Math.pow(.25,-7.8),-1/7.8);
 const m=Math.pow(Math.pow(.71*Math.pow(X,.373),-7.8)+Math.pow(.333,-7.8),-1/7.8);
 const Ctr=23.8*Math.pow(r,-3.24)*Math.pow(b,-1.18)*Math.pow(X,-.74);
 const fInf=.0151*r*Math.pow(Ct,.308),ReG=Math.PI*eta*L/(4*r/beta)*Re;
 const f=CL/ReG+Ct*Math.pow(1/(Ctr/ReG+ReG)+Math.pow(fInf/Ct,1/m),m);
 return 1.2*Math.pow(Math.PI,4)*beta*beta/(8*Math.pow(r,3))*f;
}
const fail=(message,state='blocked')=>({state,title:state==='incomplete'?'填写三个参数开始简算':'当前条件不适合这套简算',message,metrics:[],notes:[],refs:[]});
function number(v,key,label,lo,hi){
 const raw=v[key];
 if(raw===undefined||raw===null||String(raw).trim()==='')throw {state:'incomplete',message:'请填写'+label+'。默认条件被清空后也需要重新填写，不会悄悄补回。'};
 const n=Number(raw);
 if(!Number.isFinite(n)||n<lo||n>hi)throw {message:label+'须在'+lo+'至'+hi+'之间。'};
 return n;
}
const metric=(label,value,unit='',description='')=>({label,value:Number(value.toPrecision(3)),unit,description});
export function calcMixQuick(v){
 try{
  const volume=number(v,'qVolume','实际装料容量（L）',.001,100000)/1000;
  const mu=number(v,'qMu','工作温度动力黏度（mPa·s）',1,13000)/1000;
  const ratio=parseReductionRatio(v.qRatio);
  const rho=number(v,'qRho','假设密度（kg/m³）',1,30000);
  const motorRpm=number(v,'qMotorRpm','电机运行转速（rpm）',1,30000);
  const efficiency=number(v,'qEfficiency','假设传动总效率（%）',1,100)/100;
  const margin=number(v,'qMargin','自定功率余量（%）',0,100)/100;
  if(v.qRheology!=='newtonian')return fail('这套简算只按牛顿流体处理。非牛顿或不确定流体，请切换详细校核并补充流变资料，不能套用单一黏度。');
  const rpm=motorRpm/ratio,n=rpm/60;
  if(rpm<1||rpm>540)return fail('按速比得到的搅拌转速为'+rpm.toPrecision(3)+' rpm。此简算软件只开放1–540 rpm，不支持高速分散或近停转工况。');
  const tankD=Math.cbrt(4*volume/Math.PI),impellerD=MIX_REFERENCE.diameterRatio*tankD;
  const Re=rho*n*impellerD*impellerD/mu;
  if(Re<.1||Re>100000)return fail('参考配置的Re为'+Re.toPrecision(3)+'，超出本简算开放的0.1–100000区间；请切换详细校核。');
  const Np=referencePowerNumber(Re),shaftKW=Np*rho*Math.pow(n,3)*Math.pow(impellerD,5)/1000;
  const motorKW=shaftKW/efficiency,allowanceKW=motorKW*(1+margin),torque=shaftKW*1000/(2*Math.PI*n);
  if(![shaftKW,motorKW,allowanceKW,torque,Np].every(x=>Number.isFinite(x)&&x>0))return fail('数值溢出或非正功率，请检查输入；不输出失效结果。');
  const notes=[
   '这是参考配置下的稳态负载粗估，不是已匹配实际设备的计算，也不是电机铭牌或采购推荐；不能证明搅拌效果合格。',
   '固定参考：单层双叶平桨、无挡板平底圆筒、无盘管等内件、不通气；液高/釜径=1，桨径/釜径=0.585，叶宽/釜径=0.146，离底高度/液高=0.5。锚式、螺带式、圆底釜或不同装料液位不能直接照用。',
   '本次假设：牛顿流体；密度'+rho+' kg/m³，电机运行转速'+motorRpm+' rpm，传动总效率'+(efficiency*100).toFixed(1)+'%。这些是可修改的试算条件，不是文献提供的电机参数。',
   '容量按实际液体体积处理，并由假设液高/釜径=1反推几何。因此改变容量相当于改变参考釜尺寸，不能用于同一台釜改变装料量的比较。',
   '未计密封等独立附加损耗、启动峰值、非牛顿流变、固体悬浮、气液负载、轴强度、减速机额定扭矩及防爆设计。自定余量不等于厂家服务系数。'
  ];
  if(tankD<.185||tankD>.2)notes.splice(1,0,'尺寸外推提示：文献实验釜内径185–200 mm；本次反推约'+(tankD*1000).toFixed(0)+' mm，属于相似几何放大/缩小试算，尚未经设备实测标定。');
  if(rpm<60)notes.splice(1,0,'转速外推提示：文献试验转速60–540 rpm；当前低于60 rpm，仅作模型试算，不作为已验证工作点。');
  const metrics=[metric('电机轴功率需求（粗估）',motorKW,'kW','不是铭牌选型；未计独立附加损耗'),metric('搅拌轴转速',rpm,'rpm','电机运行转速 ÷ 减速速比'),metric('搅拌轴功率',shaftKW,'kW'),metric('稳态搅拌轴扭矩',torque,'N·m'),metric('参考桨叶直径',impellerD*1000,'mm','假设配置反推，非实测'),metric('参考雷诺数 Re',Re)];
  if(margin>0)metrics.splice(1,0,metric('含自定余量的功率比较值',allowanceKW,'kW','自定增加'+(margin*100).toFixed(1)+'%；不是服务系数'));
  return completeMixMotorReference({state:'ready',title:'假设参考配置 · 电机功率简算',level:'条件粗估（未标定）',metrics,notes,
   formulas:['i = 电机运行转速 / 搅拌轴转速；n = 电机rpm / i / 60（s⁻¹）','V = 实际装料升数 / 1000；参考釜径 T = (4V/π)^(1/3)；参考桨径 d = 0.585T','μ(Pa·s) = μ(mPa·s)/1000；Re = ρnd²/μ','Np采用Furukawa等2012文献表1无挡板关联式，固定几何取图4双叶平桨配置；不是通用常数','P轴(kW) = Np·ρ·n³·d⁵/1000；P电机轴需求 = P轴/传动总效率','扭矩 = P轴(W)/(2πn)；自定余量比较值 = P电机轴需求×(1+余量百分数/100)'],
   refs:[{label:'Furukawa et al., 2012, Table 1 / Fig.4 · 参考功率关联与实验条件',url:'https://doi.org/10.1155/2012/106496'},{label:'重要：密度1000、电机1440rpm、效率85%是本工具可编辑的初始假设，不是厂家确认值',url:''}],
   audit:{volume,mu,ratio,rho,motorRpm,efficiency,margin,rpm,tankD,impellerD,Re,Np,shaftKW,motorKW,allowanceKW,torque}});
 }catch(e){return fail(e?.message||'简算失败，请检查参数。',e?.state||'blocked');}
}
export function configureMixQuick(specs,F,S,demos){
 const previous=specs.mix.groups;
 specs.mix.subtitle='填写容量、黏度、速比，自动计算搅拌负载、功率余量、传动损耗及电机功率档位参考。';
 specs.mix.guidance='档位参考是按假设计算值向上取档，不代表型号、启动或安全选型通过。参考配置与实物不同时不能照用。';
 specs.mix.groups=[
  {title:'选择计算方式',fields:[S('mixMode','计算模式',[['quick','简单算法 · 容量＋黏度＋速比'],['detailed','详细校核 · 实物几何与厂家参数']],{full:true})]},
  {title:'简单算法 · 主要填写这三项',only:v=>v.mixMode!=='detailed',desc:'按参考双叶平桨配置试算，非予华实物匹配。容量填写实际液体体积，不是公称釜容；黏度对应工作温度。',fields:[F('qVolume','实际装料容量',{unit:'L',placeholder:'例如 1000'}),F('qMu','动力黏度',{unit:'mPa·s（cP）',placeholder:'例如 1000'}),F('qRatio','减速速比',{kind:'text',unit:'输入转速 / 输出转速',placeholder:'例如 20 或 20:1',full:true})]},
  {title:'默认条件 · 可展开修改',advanced:true,only:v=>v.mixMode!=='detailed',desc:'初始预设：密度1000 kg/m³、电机1440 rpm、效率85%、功率余量30%（乘1.3，可修改；不是厂家服务系数）。都是试算假设，不是你设备的确认值。固定参考为无挡板平底圆筒和单层双叶平桨，H/T=1、d/T=0.585、b/T=0.146、C/H=0.5。',fields:[F('qMotorRpm','电机运行转速',{unit:'rpm'}),F('qRho','物料密度',{unit:'kg/m³'}),F('qEfficiency','传动总效率',{unit:'%'}),F('qMargin','功率余量（可修改）',{unit:'%'}),S('qRheology','流体假设',[['newtonian','按牛顿流体试算'],['unknown','不确定 / 非牛顿流体']],{full:true})]},
  ...previous.map(g=>({...g,only:v=>v.mixMode==='detailed'&&(!g.only||g.only(v))}))
 ];
 demos.mixDetailed={...demos.mix,mixMode:'detailed'};
 demos.mix={...mixQuickInitial(),qVolume:'1000',qMu:'10000',qRatio:'20'};
}
