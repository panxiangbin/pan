/* Constant-property engineering reference model. Offline, version 0.2. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Thermal=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const defaults={vesselVolume:100,mass:60,cp:1674,metalMass:80,metalCp:830,t0:25,target:150,ambient:25,inlet:180,outlet:160,flow:2.52,oilCp:1886.5,oilDensity:842.0,K:250,area:1,lossH:15,lossArea:1.5,heater:15,utilization:.8,margin:.2,oilVolume:20,oilFillDensity:959.5,oilMass:19.19,oilHeatCp:1771,oilStart:25,oilTarget:180,mode:'flow',density:970,viscosity:.48,diameter:.35,rpm:75,laminarConstant:320};
const oilReference={"name":"用户提供的导热油物性表","grade":null,"source":"用户上传图片（2026-10-09），图片未注明品牌或牌号","columns":["温度(°F)","温度(℃)","蒸汽压(kPa)","比热(kJ/(kg·K))","导热系数(W/(m·K))","密度(kg/m³)","粘度(cSt)"],"rows":[[-76,-60,null,1.531,0.1515,1036,449],[-40,-40,null,1.556,0.1487,1018,225],[-4,-20,null,1.582,0.1459,1000,128],[32,0,null,1.607,0.1431,982,80],[68,20,null,1.632,0.1403,964,53],[104,40,null,1.665,0.1365,946,38],[212,100,null,1.766,0.1252,898,17.4],[320,160,1.18,1.869,0.114,850,10.1],[392,200,10.02,1.939,0.1065,818,7.6],[500,260,67.1,2.042,0.0951,770,5.42],[536,280,92.67,2.074,0.0917,752,4.92],[572,300,147.87,2.111,0.0877,734,4.5]],"derivation":{"circulationReferenceC":170,"coldReferenceC":25,"startupFromC":25,"startupToC":180,"exactMeanCpJ":1770.9637096774193,"enthalpyRiseKJPerKg":274.499375,"adoptedDefaults":{"oilCp":1886.5,"oilDensity":842.0,"oilFillDensity":959.5,"oilMass":19.19,"oilHeatCp":1771},"method":"比热、密度分段线性插值；平均比热由分段积分除以温差得到，输入平均比热取整至1 J/(kg·K)。","scope":"更新常物性模型的默认输入；修改温度时不会自动替换这些输入。导热系数、蒸汽压和运动粘度仅供参考，未用于当前K固定的时间模型。"}};
const labels={vesselVolume:'反应釜公称容积',mass:'物料质量',cp:'物料比热',metalMass:'有效釜体质量',metalCp:'釜体比热',t0:'初始温度',target:'目标温度',ambient:'环境温度',inlet:'热源进口设定',outlet:'固定出口温度',flow:'循环流量',oilCp:'循环油比热',oilDensity:'循环油密度',K:'总传热系数',area:'有效传热面积',lossH:'等效散热系数',lossArea:'散热面积',heater:'额定加热功率',utilization:'有效功率比例',margin:'冗余系数',oilVolume:'夹套油容积',oilFillDensity:'冷态油密度',oilMass:'夹套油质量',oilHeatCp:'油升温平均比热',oilStart:'油初始温度',oilTarget:'油预热目标',density:'物料密度',viscosity:'动力黏度',diameter:'桨径',rpm:'搅拌转速',laminarConstant:'层流关联常数'};
function validate(input){
 const p={...defaults,...input},errors=[];
 if(!['flow','constant','outlet'].includes(p.mode))errors.push('请选择有效的计算工况。');
 for(const key of Object.keys(defaults).filter(k=>k!=='mode'))if(typeof p[key]!=='number'||!Number.isFinite(p[key]))errors.push(labels[key]+'必须是有限数值。');
 for(const k of ['vesselVolume','mass','cp','metalCp','oilCp','oilDensity','K','area','density','viscosity','diameter','rpm','laminarConstant','oilFillDensity','oilHeatCp'])if(!(p[k]>0))errors.push(labels[k]+'必须大于0。');
 for(const k of ['metalMass','lossH','lossArea','heater','margin','oilVolume','oilMass'])if(p[k]<0)errors.push(labels[k]+'不能小于0。');
 if(!(p.utilization>0&&p.utilization<=1))errors.push('有效功率比例必须大于0且不超过100%。');
 if(p.mode==='flow'&&!(p.flow>0))errors.push('循环流量必须大于0。');
 for(const k of ['t0','target','ambient','inlet','outlet','oilStart','oilTarget'])if(p[k]<-273.15)errors.push(labels[k]+'不能低于绝对零度。');
 if(p.target===p.t0)errors.push('初始温度与目标温度相同，无需计算。');
 const d=Math.sign(p.target-p.t0);
 if(d*(p.inlet-p.target)<=0)errors.push('热源温度需越过目标温度，并保留传热温差。');
 if(p.mode==='outlet'){
  if(d*(p.inlet-p.outlet)<=0)errors.push('固定进口、出口顺序与升降温方向不一致。');
  if(d*(p.outlet-p.target)<=0)errors.push('固定出口温度必须越过目标温度，不能等于或跨越釜温。');
 }
 if(d>0&&p.oilMass>0&&p.oilTarget<p.oilStart)errors.push('油预热目标不能低于油初始温度。');
 if(d>0&&p.oilMass>0&&p.oilTarget>p.oilStart&&p.heater===0)errors.push('计入冷油预热负载时，请填写实际加热功率；理论比较可将夹套油质量设为0。');
 return {p,errors};
}
function model(p){
 const C=p.mass*p.cp+p.metalMass*p.metalCp,UA=p.K*p.area,H=p.lossH*p.lossArea,direction=Math.sign(p.target-p.t0),G=p.flow*p.oilDensity*p.oilCp/3600;
 const B=p.mode==='constant'?UA:p.mode==='flow'?G*(-Math.expm1(-UA/G)):null;
 const cap=p.heater*p.utilization*1000;
 function raw(T){if(B!==null)return B*(p.inlet-T);const a=p.inlet-T,b=p.outlet-T;return a*b<=0?NaN:UA*(a-b)/Math.log(a/b);}
 function power(T){const q=raw(T);return cap>0?Math.sign(q)*Math.min(Math.abs(q),cap):q;}
 function loss(T){return H*(T-p.ambient);}
 function net(T){return power(T)-loss(T);}
 // Finite power: inlet setpoint is reached only when available power can sustain it.
 function oilIn(T){return B!==null?T+power(T)/B:p.inlet;}
 function oilOut(T){if(p.mode==='constant')return oilIn(T);if(p.mode==='outlet')return p.outlet;return oilIn(T)-power(T)/G;}
 return {C,UA,H,G,B,direction,cap,raw,power,loss,net,oilIn,oilOut};
}
function calculate(input){
 const {p,errors}=validate(input);if(errors.length)return {ok:false,errors};
 const m=model(p),d=m.direction,span=Math.abs(p.target-p.t0);
 if(![m.C,m.UA,m.H,m.G,span].every(Number.isFinite))return {ok:false,errors:['参数组合超出可计算范围。']};
 if(p.mode==='outlet'&&m.cap>0&&Math.abs(m.raw(p.t0))>m.cap+1e-7)return {ok:false,errors:['固定进出口温度的初始传热需要 '+(Math.abs(m.raw(p.t0))/1000).toFixed(2)+' kW，有效功率仅 '+(m.cap/1000).toFixed(2)+' kW，无法同时维持。请选择固定流量，或调整加热功率。']};
 const equilibrium=m.B!==null&&p.heater===0?(m.B*p.inlet+m.H*p.ambient)/(m.B+m.H):null;
 if(!Number.isFinite(m.net(p.t0))||d*m.net(p.t0)<=0)return {ok:false,errors:['初始净传热方向不满足要求，请检查热源与散热条件。'],equilibrium};
 if(!Number.isFinite(m.net(p.target))||d*m.net(p.target)<=0)return {ok:false,errors:['目标处净传热不足，系统会在目标之前达到热平衡。请提高热源能力或改善传热/保温。'],equilibrium};
 const N=1600,step=span/N,samples=[];let seconds=0,lossJ=0,sourceJ=0;
 function state(u){const T=p.t0+d*u,dt=m.C/(d*m.net(T));return {T,dt,loss:m.loss(T)*dt,source:m.power(T)*dt};}
 function sample(T){return {t:seconds/60,T,power:m.power(T)/1000,loss:m.loss(T)/1000,inlet:m.oilIn(T),out:m.oilOut(T),flow:p.mode==='outlet'?Math.abs(m.power(T)/(p.oilCp*(p.inlet-p.outlet))*3600/p.oilDensity):p.flow};}
 let prev=state(0);samples.push(sample(p.t0));
 for(let i=1;i<=N;i++){
  const end=state(i===N?span:i*step),mid=state((i-.5)*step);
  seconds+=step/6*(prev.dt+4*mid.dt+end.dt);lossJ+=step/6*(prev.loss+4*mid.loss+end.loss);sourceJ+=step/6*(prev.source+4*mid.source+end.source);
  if(i%8===0||i===N)samples.push(sample(end.T));prev=end;
 }
 const fluidJ=p.mass*p.cp*(p.target-p.t0),metalJ=p.metalMass*p.metalCp*(p.target-p.t0);
 const oilJ=d>0?p.oilMass*p.oilHeatCp*(p.oilTarget-p.oilStart):0;
 const oilMinutes=oilJ>0?oilJ/m.cap/60:0,baseMinutes=seconds/60+oilMinutes,totalJ=sourceJ+oilJ;
 const referenceMinutes=baseMinutes*(1+p.margin),designJ=totalJ*(1+p.margin),warnings=[];
 if(p.mode==='flow'&&Math.abs(samples[0].inlet-samples[0].out)>20.1)warnings.push('初始进出口温差超过20℃，应按允许温降校核流量。');
 if(p.mode==='outlet')warnings.push('固定进出口温度需要变流量控制；总传热系数仍按常数处理。');
 if(m.cap>0&&Math.abs(m.raw(p.t0))>m.cap)warnings.push('加热功率不足以从起点维持进口设定值；曲线按功率受限的准稳态进口计算。');
 if(oilJ>0)warnings.push('冷油负载用“油升温热量÷有效功率”加作启动时间预算；与物料升温顺序相加，未模拟两者同步升温。');
 warnings.push('散热积分覆盖物料升温段；油预热散热、管路和储液罐负载尚未计入。余量为设计预算，不代表实际新增热量。');
 warnings.push('有效釜体质量、K与外壁≈物料均属待标定假设；物性按参考材料常数处理，默认值并非实测值。');
 if(p.mass/p.density*1000>p.vesselVolume)warnings.push('按输入密度估算，物料体积超过反应釜公称容积，请检查装料量。');
 if(d<0)warnings.push('降温仅为通用传热演算，未接入制冷机容量曲线与工程师制冷算法。');
 const ideal=m.C/m.UA*Math.log((p.inlet-p.t0)/(p.inlet-p.target))/60;
 return {ok:true,p,minutes:seconds/60,oilMinutes,baseMinutes,referenceMinutes,fluidMJ:fluidJ/1e6,metalMJ:metalJ/1e6,oilMJ:oilJ/1e6,lossMJ:lossJ/1e6,processSourceMJ:sourceJ/1e6,totalMJ:totalJ/1e6,designMJ:designJ/1e6,marginMJ:(designJ-totalJ)/1e6,kWh:Math.abs(totalJ)/3.6e6,initialKW:m.power(p.t0)/1000,finalKW:m.power(p.target)/1000,effectiveKW:m.cap/1000,averageKW:Math.abs(totalJ)/(baseMinutes*60*1000),capacity:m.C,UA:m.UA,equilibrium,ideal,samples,warnings,balanceErrorJ:sourceJ-lossJ-fluidJ-metalJ};
}
function flowSizing(powerKW,delta,cp,rho){if(![powerKW,delta,cp,rho].every(Number.isFinite)||powerKW<=0||delta<=0||cp<=0||rho<=0)throw Error('功率、温降、比热和密度必须大于0。');const kgS=powerKW*1000/(cp*delta);return {kgS,m3h:kgS/rho*3600};}
function transferSizing(powerKW,K,lm){if(![powerKW,K,lm].every(Number.isFinite)||powerKW<=0||K<=0||lm<=0)throw Error('功率、K和平均温差必须大于0。');return {area:powerKW*1000/(K*lm),powerKW:K*lm/1000};}
function mixing(p){const n=p.rpm/60,Re=p.density*n*p.diameter**2/p.viscosity,power=p.laminarConstant*p.viscosity*n*n*p.diameter**3;return {Re,laminarPowerW:power,torque:power/(2*Math.PI*n),warning:'层流关联仅供演算，桨型与适用Re尚未确认，不能据此选电机。'};}
return {defaults,oilReference,labels,validate,model,calculate,flowSizing,transferSizing,mixing,version:'0.2'};
});

export const Thermal=globalThis.Thermal;