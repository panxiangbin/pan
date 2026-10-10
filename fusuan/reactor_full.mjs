import {Thermal} from './reactor_engine.mjs';

export const REACTOR_MODEL_VERSION='legacy-constant-property-v0.2';
export const MODES=[
 ['flow','固定循环流量 · 出口随负荷变化'],
 ['outlet','固定进出口温度 · 变流量控制'],
 ['constant','恒温热源 · 理想比较']
];
const field=(key,label,unit)=>({key,label,unit});
export const REACTOR_GROUPS=[
 {id:'material',title:'物料与釜体',accent:'#188bc0',description:'公称容积、物料与釜体热容',fields:[
   field('vesselVolume','反应釜公称容积','L'),field('mass','物料质量','kg'),field('cp','物料比热','J/(kg·K)'),field('metalMass','有效釜体质量','kg'),field('metalCp','釜体比热','J/(kg·K)')]},
 {id:'temperature',title:'温度条件',accent:'#e97655',description:'进料、目标和热源设定温度',fields:[
   field('t0','初始温度','°C'),field('target','目标温度','°C'),field('ambient','环境温度','°C'),field('inlet','热源进口设定','°C')]},
 {id:'circulation',title:'热源循环',accent:'#0c9d8c',description:'流量、出口温度及循环介质物性',fields:[
   field('flow','循环体积流量','L/min'),field('outlet','固定出口温度','°C'),field('oilCp','循环介质比热','J/(kg·K)'),field('oilDensity','循环介质密度','kg/m³')]},
 {id:'power',title:'加热功率与余量',accent:'#b18528',description:'设备额定功率、利用率与预算系数',fields:[
   field('heater','额定加热功率','kW'),field('utilization','有效功率比例','%'),field('margin','设计预算余量','%')]},
 {id:'startup',title:'夹套冷油启动负载',accent:'#7995c3',description:'夹套油的体积、质量及预热能量',fields:[
   field('oilVolume','冷态夹套油容积','L'),field('oilFillDensity','冷态油密度','kg/m³'),field('oilMass','夹套油质量','kg'),field('oilHeatCp','油预热平均比热','J/(kg·K)'),field('oilStart','油初始温度','°C'),field('oilTarget','油预热目标','°C')]},
 {id:'transfer',title:'传热与环境散热',accent:'#39a4a6',description:'K、面积、外壁热损参数',fields:[
   field('K','总传热系数 K','W/(m²·K)'),field('area','有效传热面积','m²'),field('lossH','等效散热系数','W/(m²·K)'),field('lossArea','外壁散热面积','m²')]},
 {id:'mixing',title:'搅拌参数参考演算',accent:'#9871c4',description:'旧版附带演算；不构成电机选型',fields:[
   field('density','物料密度','kg/m³'),field('viscosity','动力黏度','mPa·s'),field('diameter','搅拌桨直径','m'),field('rpm','搅拌转速','rpm'),field('laminarConstant','层流关联常数','用户提供')]}
];
export const FIELD_MAP=Object.fromEntries(REACTOR_GROUPS.flatMap(g=>g.fields.map(f=>[f.key,f])));
export const ALL_FIELDS=Object.keys(FIELD_MAP);
export const REACTOR_EXAMPLE=Object.freeze((()=>{
 const p={...Thermal.defaults};
 p.flow=Number((p.flow/.06).toFixed(6));
 p.utilization=Number((p.utilization*100).toFixed(6));
 p.margin=Number((p.margin*100).toFixed(6));
 p.viscosity=Number((p.viscosity*1000).toFixed(6)); // 旧Pa·s演示转换为新界面的mPa·s
 p.mode='flow';
 return p;
})());
export const MODEL_SOURCE={
 label:'原电脑版反应釜工程计算器 · 常物性热工模型 v0.2（本项目独立复制，算法未改变）',
 note:'原始模型为设计参考，不是通用实测模型；K、有效釜体质量、散热、物性、设备额定功率均需按现场核定。'
};
const n=(x,prec=6)=>Number(Number(x).toPrecision(prec));
const metric=(label,value,unit,note='')=>({label,value:n(value),unit,description:note});
const deny=(message,missing=[],state='blocked')=>({state,title:state==='incomplete'?'填写必要参数':'请检查工况',message,missing,notes:[],metrics:[],refs:[]});

function readValues(v){
 const missing=ALL_FIELDS.filter(key=>v[key]===undefined||v[key]===null||String(v[key]).trim()==='');
 if(missing.length)return {bad:deny('尚有'+missing.length+'项参数未填写：'+missing.slice(0,4).map(x=>FIELD_MAP[x].label).join('、')+'。请填写已知实测数据，或点击“载入旧版演示参数”。',missing,'incomplete')};
 const p={mode:v.mode};
 if(!MODES.some(x=>x[0]===p.mode))return {bad:deny('请选择有效的计算模式。',['mode'])};
 for(const key of ALL_FIELDS){
   const value=Number(v[key]);
   if(!Number.isFinite(value))return {bad:deny(FIELD_MAP[key].label+'需要有效数值。',[key])};
   p[key]=value;
 }
 p.flow=p.flow*.06; // 页面 L/min -> 引擎 m³/h
 p.utilization=p.utilization/100;
 p.margin=p.margin/100;
 p.viscosity=p.viscosity/1000; // mobile mPa·s -> engine Pa·s
 return {p};
}
const checkValue=(v,k,def)=>{
 const text=v[k];
 if(text===undefined||text===null||String(text).trim()==='')return def;
 const numeric=Number(text);
 if(!Number.isFinite(numeric)||numeric<=0)return NaN;
 return numeric;
};
export function calculateReactorFull(v){
 const parsed=readValues(v);
 if(parsed.bad)return parsed.bad;
 let r;
 try {r=Thermal.calculate(parsed.p);}catch(ex){return deny('原版热工模型计算失败：'+String(ex.message||ex));}
 if(!r.ok)return deny((r.errors||['参数条件不成立']).join('；'));
 const p=r.p;
 const refTotal=r.referenceMinutes*(1+p.margin); // 与电脑版相同的二次预算显示
 const flags=[
 '沿用原电脑版31项参数及同一计算引擎；结果可与旧版对照，不代表这些参数已经完成实验校准。',
 '原版将同一预算余量用于设计时间和参考总时间两层显示；参考总时间不是独立物理计算。环境散热积分与预算系数应分开理解。',
 '冷油启动和物料升温采用顺序预算，不模拟并行升温。两者相加可能偏长，但不构成设备实际时间的上限保证。',
 '搅拌功率使用旧版未校核的层流常数，仅演算，不可用于确定电机与减速机。',
 '热工物性按输入常数处理；修改温区不会自动重选相应的物性参数。'
 ];
 const m=Thermal.mixing(p);
 const flowPower=checkValue(v,'sizePower',Math.max(Math.abs(r.initialKW),Math.abs(r.finalKW)));
 const flowDrop=checkValue(v,'sizeDrop',20);
 const areaPower=checkValue(v,'areaPower',Math.abs(r.initialKW));
 const areaMean=checkValue(v,'areaMean',Math.abs(r.initialKW)*1000/r.UA);
 let flowCheck,areaCheck;
 try {flowCheck={...Thermal.flowSizing(flowPower,flowDrop,p.oilCp,p.oilDensity),power:flowPower,drop:flowDrop};}
 catch(e){flowCheck={error:'流量校核：'+e.message};}
 try {areaCheck={...Thermal.transferSizing(areaPower,p.K,areaMean),power:areaPower,delta:areaMean};}
 catch(e){areaCheck={error:'传热校核：'+e.message};}
 return {
  state:'ready',title:'反应釜完整热工模型',level:'原版31项 · 待工程标定',
  metrics:[
    metric('设计总时间',r.referenceMinutes,'分钟','物料段＋冷油预算，再乘一次设计余量'),
    metric('设计总热量',r.designMJ,'MJ','显热、冷油、散热与预算余量合计'),
    metric('物料升温时间',r.minutes,'分钟'),
    metric('夹套油启动预算',r.oilMinutes,'分钟'),
    metric('有效加热功率',r.effectiveKW,'kW'),
    metric('平均供热功率',r.averageKW,'kW')
  ],
  notes:[...flags,...r.warnings],
  formulas:['沿用旧版常物性积分模型：C·dT/dt = P(T) − h·A外·(T−T环境)','设计总时间 = (物料段时间＋冷油预算时间) × (1+margin)','参考总时间 = 设计总时间 × (1+margin)（原版显示规则，不额外重复计入物理计算）'],
  refs:[],
  reactor:{r,p,refTotal,m,flowCheck,areaCheck,flags,source:MODEL_SOURCE}
 };
}
export const formatModel=n=>{
 if(!Number.isFinite(n))return '—';
 if(Object.is(n,-0))return '0';
 const output=n.toLocaleString('zh-CN',{maximumFractionDigits:Math.abs(n)<1?4:2});
 return /^-0(?:[.,]0+)?$/.test(output)?output.slice(1):output;
};
export function toCurveCSV(result){
 const rr=result.reactor?.r;if(!rr)return '';
 const head='时间(min),物料温度(℃),准稳态进口(℃),出口温度(℃),传热功率(kW),环境散热(kW),循环流量(L/min)';
 return '\uFEFF'+head+'\r\n'+rr.samples.map(s=>[s.t,s.T,s.inlet,s.out,s.power,s.loss,rr.p.mode==='constant'?'':s.flow/.06]
  .map(v=>typeof v==='number'?v.toFixed(6):v).join(',')).join('\r\n');
}