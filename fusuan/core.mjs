/* 釜算 手机版 · 纯计算引擎 v0.1.0
 * 无网络请求，无默认工程常数，无设备型号推荐。
 * 统一采用SI中间量；所有受限相关式均附来源/工况提示。
 */
export const VERSION = '0.6.0';
export const REFERENCES = {
  takahashi: {label:'Takahashi, Arai & Saito, J. Chem. Eng. Japan 15(1), 77–79 (1982), Eq.(4), Table 1',url:'https://doi.org/10.1252/jcej.15.77'},
  wankat: {label:'Wankat, Separation Process Engineering, 第7章（Fenske）',url:'https://www.informit.com/articles/article.aspx?p=3167983&seqNum=2'},
  vacuum: {label:'Leybold, How to choose a pump size（有效抽速及模型条件）',url:'https://www.leybold.com/en/knowledge/vacuum-fundamentals/vacuum-generation/how-to-choose-a-pump-size'},
  pfeiffer:{label:'Pfeiffer Vacuum, Knowledge Book §2.2（抽气时间与分段计算）',url:'https://www.pfeiffer-vacuum.com/global/en/knowledge/vacuum-technology/knowledge-book/2-basic-calculations/2_2_calculations/'},
  energy:{label:'显热能量平衡：Q = m·cp·ΔT（常物性、无相变/反应热）',url:''}
};

export const GROUPS = {
  pressure:{title:'压力', units:{Pa:1,kPa:1000,MPa:1000000,bar:100000,mbar:100,mmHg:133.322387415}},
  volume:{title:'体积',units:{mL:0.000001,L:0.001,'m³':1}},
  viscosity:{title:'动力黏度',units:{'mPa·s':0.001,'Pa·s':1,P:0.1,cP:0.001}},
  power:{title:'功率',units:{W:1,kW:1000,'马力(hp)':745.6998715822702}},
  heat:{title:'能量',units:{J:1,kJ:1000,MJ:1000000,kWh:3600000,kcal:4184}},
  flow:{title:'流量',units:{'L/min':1/60000,'L/h':1/3600000,'m³/h':1/3600,'m³/s':1}},
  temperature:{title:'温度',units:{'°C':1,K:1}}
};
const round=(x,n=4)=>Number(x.toPrecision(n));
const metric=(label,value,unit='',description='')=>({label,value:round(value,6),unit,description});
function err(message,kind='blocked',missing=[]){return {state:kind,title:kind==='incomplete'?'填写参数后即可计算':'需要修正输入',message,missing,metrics:[],notes:[],refs:[]};}
function needed(v,k,label,min=-Infinity,max=Infinity){
  const x=v[k];
  if(x===undefined||x===null||String(x).trim()==='')throw {kind:'incomplete',key:k,message:'还需要填写：'+label};
  const n=Number(x);
  if(!Number.isFinite(n)||n<min||n>max)throw {kind:'blocked',key:k,message:label+'必须是有效数值'+(Number.isFinite(min)&&min!==-Infinity?'，且不小于'+min:'')+(Number.isFinite(max)&&max!==Infinity?'，且不超过'+max:'')+'。'};
  return n;
}
function optional(v,k){const x=v[k];return x===null||x===undefined||String(x).trim()===''?null:Number(x);}
function safe(fn){try{return fn();}catch(e){if(e&&e.kind)return err(e.message,e.kind,e.key?[e.key]:[]);return err('计算遇到无法处理的条件，请检查参数。');}}
function success(title,level,metrics,notes,formulas=[],refs=[],extra={}){return {state:'ready',title,level,metrics,notes,formulas,refs,...extra};}
export function calcHeat(v){return safe(()=>{
  const mass=needed(v,'mass','物料质量（kg）',0.000001);
  const cp=needed(v,'cp','平均比热（kJ/kg·K）',0.000001);
  const t0=needed(v,'t0','起始温度（°C）',-273.15);
  const t1=needed(v,'t1','目标温度（°C）',-273.15);
  const signed=mass*cp*(t1-t0),q=Math.abs(signed),direction=signed>0?'升温':signed<0?'降温':'无温差';
  const metrics=[metric('物料显热',q,'kJ'),metric('折合电能',q/3600,'kWh'),metric('温度变化',t1-t0,'K')];
  const notes=['仅考虑物料显热；未计釜体、夹套、循环介质、热损失、相变及反应热。','输入比热应是实际物料在计算温度范围内的适用平均值。'];
  const power=optional(v,'power'),eff=optional(v,'efficiency');
  if(power!==null||eff!==null){
    const kw=needed(v,'power','有效热源设备功率（kW）',0.000001);
    const eta=needed(v,'efficiency','用户给定能量利用率（%）',0.000001,100);
    metrics.push(metric('仅物料显热的参考时间',q/(kw*(eta/100))/60,'分钟','非实际升温/冷却时间'));
    notes.unshift('参考时间仅为 Q/(功率×用户给定利用率) 的算术换算，不能用于保证设备升温时间；实际还取决于UA、设备热容和热损失。');
  }
  return success(direction+'显热计算','基础公式',metrics,notes,
    ['Q = m × cp × (T目标 − T起始)','1 kWh = 3600 kJ','参考时间(分钟) = |Q|/[设备功率(kW)×效率×60]'],[REFERENCES.energy]);
});}
export function calcLoad(v){return safe(()=>{
  const nominal=needed(v,'nominal','釜体标称容积（L）',0.000001);
  const actual=needed(v,'actual','实际装料容积（L）',0);
  const rate=actual/nominal*100;
  const metrics=[metric('装料率',rate,'%'),metric('未装料容积',nominal-actual,'L'),metric('装料体积',actual,'L')];
  const notes=['使用提供的标称容积和实际装料容积做比例计算；不自动把标称容积当作允许工作容积。','实际可用液位、装料上限及气相空间要求，应遵循相应设备图纸和工艺规范。'];
  if(actual>nominal)notes.unshift('实际装料量超过标称容积，请核对数据及设备容积定义。');
  const diam=optional(v,'innerDiameter');
  if(diam!==null){
    const d=needed(v,'innerDiameter','平底直筒的内径（mm）',0.000001)/1000;
    const h=(actual/1000)/(Math.PI*d*d/4);
    metrics.push(metric('理想平底圆筒对应液位',h*1000,'mm','仅平底直筒数学换算'));
    notes.push('液位仅按等截面平底圆筒计算；玻璃釜圆底、椭圆封头及内部件不适用。');
  }
  return success('装料率与有效容积','纯几何/比例',metrics,notes,['装料率 = 装料容积 ÷ 标称容积 × 100%','圆筒液高 = 4 × 装料体积 ÷ (π × 直径²)'],[]);
});}
export function calcVacuum(v){return safe(()=>{
  const volume=needed(v,'volume','空腔容积（L）',0.000001)/1000;
  const p0=needed(v,'p0','起始绝对压力（mbar）',0.000001);
  const p1=needed(v,'p1','目标绝对压力（mbar）',0.000001);
  const pu=needed(v,'pu','系统可达极限绝对压力（mbar）',0);
  const speed=needed(v,'speed','容器处恒定有效抽速（m³/h）',0.000001)/3600;
  if(!(p0>p1&&p1>pu))return err('必须满足：起始绝对压力 > 目标绝对压力 > 系统可达极限压力。');
  const sec=(volume/speed)*Math.log((p0-pu)/(p1-pu));
  if(!Number.isFinite(sec)||sec<0)return err('当前条件不支持恒定抽速公式。');
  const notes=['仅为恒定有效抽速、无额外漏气/放气/蒸汽负荷的模型参考时间，不是保证时间，也不构成严格上下界。','S必须是容器处的有效抽速，不是未经流导修正的泵铭牌抽速。使用绝对压力，负压表读数须先转换。','真实系统抽速随压力变化，临近极限压力或存在溶剂蒸汽时必须使用经核实的S–p曲线及气体负荷模型。'];
  if((p1-pu)/p1<0.2)notes.unshift('目标压力接近极限压力：恒定抽速假设可能失效，本值只用作数学模型演示。');
  return success('理想化抽气模型','条件估算',[
    metric('模型预测时间',sec/60,'分钟'),metric('换算',sec,'秒'),metric('时间常数 V/S',volume/speed,'秒')
  ],notes,['t = V/S_eff × ln[(p0−p_ult)/(p1−p_ult)]','仅适用于声明的恒定有效抽速、无外部气体负荷模型'],[REFERENCES.vacuum,REFERENCES.pfeiffer]);
});}
export function fenske(alpha,xD,xB){
  if(!(alpha>1&&xD>0&&xD<1&&xB>0&&xB<1&&xD>xB))throw {kind:'blocked',message:'需满足 α>1 且 0<xB<xD<1，并确认轻组分定义。'};
  return Math.log(xD/(1-xD)*(1-xB)/xB)/Math.log(alpha);
}
const eq=(alpha,x)=>alpha*x/(1+(alpha-1)*x);
const invEq=(alpha,y)=>y/(alpha-(alpha-1)*y);
function qIntersection(alpha,zF,q){
 if(Math.abs(q-1)<1e-10)return {x:zF,y:eq(alpha,zF)};
 const qline=x=>(q*x-zF)/(q-1);
 let lo=0,hi=1;
 let flo=eq(alpha,lo)-qline(lo);
 for(let i=0;i<100;i++){
   const mid=(lo+hi)/2, fmid=eq(alpha,mid)-qline(mid);
   if(Math.abs(fmid)<1e-13)return {x:mid,y:eq(alpha,mid)};
   if(Math.sign(fmid)===Math.sign(flo)){lo=mid;flo=fmid;}else{hi=mid;}
 }
 const x=(lo+hi)/2;return {x,y:eq(alpha,x)};
}
export function mccabe(alpha,xD,xB,zF,q,R,maxStages=200){
 const pin=qIntersection(alpha,zF,q);
 const rmin=(xD-pin.y)/(pin.y-pin.x);
 if(!Number.isFinite(rmin)||rmin<0)throw {kind:'blocked',message:'计算到的最小回流比异常，请核对组成、进料热状态及模型假设。'};
 if(R<=rmin+1e-9)throw {kind:'blocked',message:'操作回流比没有高于最小回流比（约 '+round(rmin,5)+'），不能完成此简化逐级计算。'};
 const mr=R/(R+1),br=xD/(R+1);
 let xSwitch,ySwitch;
 if(Math.abs(q-1)<1e-10){xSwitch=zF;ySwitch=mr*zF+br;}
 else {
   const qm=q/(q-1),qb=-zF/(q-1);
   if(Math.abs(mr-qm)<1e-12)throw {kind:'blocked',message:'操作线与进料线几乎平行，无法确定交点。'};
   xSwitch=(qb-br)/(mr-qm);
   ySwitch=mr*xSwitch+br;
 }
 if(!(xSwitch>xB&&xSwitch<xD&&ySwitch>xB&&ySwitch<xD))throw {kind:'blocked',message:'操作线与进料线交点不在有效分离范围，请检查q、R、组成和恒摩尔溢流假设。'};
 const ms=(ySwitch-xB)/(xSwitch-xB),bs=xB*(1-ms);
 if(!Number.isFinite(ms)||ms<=0)throw {kind:'blocked',message:'提馏段操作线不合理，无法继续逐级计算。'};
 let y=xD,prevX=xD,feedStage=null,stages=[];
 for(let i=1;i<=maxStages;i++){
   const x=invEq(alpha,y);
   if(!(x<prevX-1e-12))throw {kind:'blocked',message:'级数计算没有向目标组成推进，可能靠近夹点或遇到数值问题。'};
   if(feedStage===null&&x<=xSwitch)feedStage=i;
   stages.push({i,x:round(x,8),y:round(y,8),section:x>xSwitch?'rectifying':'stripping'});
   if(x<=xB){
     const partial=(prevX-xB)/(prevX-x);
     return {rmin,feedStage:feedStage||i,stages:stages.length,fractional:(i-1)+Math.max(0,Math.min(1,partial)),xSwitch,steps:stages};
   }
   prevX=x;
   y=x>xSwitch?mr*x+br:ms*x+bs;
   if(!Number.isFinite(y)||y<=0||y>=1)throw {kind:'blocked',message:'操作线超出有效组成范围，无法继续逐级计算。'};
 }
 throw {kind:'blocked',message:'达到'+maxStages+'级计算上限，未能得到可靠结果。可能是接近夹点、要求过高或数值方法问题；不能据此直接判定夹点。'};
}
export function calcDistill(v){return safe(()=>{
  const task=v.task||'fenske';
  const xd=needed(v,'xD','塔顶轻组分摩尔分数',0.00000001,0.99999999);
  const xb=needed(v,'xB','塔底轻组分摩尔分数',0.00000001,0.99999999);
  const alpha=needed(v,'alpha','恒定相对挥发度 α',1.000000001);
  const nmin=fenske(alpha,xd,xb);
  const notes=['仅用于二元、恒定相对挥发度α的理想化教学/初步估算；α需由用户从适用物系数据确定。','全凝器不计为平衡级，部分再沸器按一个平衡级计；不是实际塔板数，也不能直接用于施工或设备选型。','不处理共沸、非理想VLE、严格物性计算、实际板效率或塔板水力学。'];
  if(task==='fenske'){
    return success('Fenske 全回流最小级数','教学初算',[metric('最小平衡级数',nmin,'级')],notes,['Nmin = ln[(xD/(1−xD)) × ((1−xB)/xB)] / ln(α)'],[REFERENCES.wankat]);
  }
  if(task!=='mccabe')return err('请选择当前支持的二元计算方式。');
  const zf=needed(v,'zF','进料轻组分摩尔分数',0.00000001,0.99999999);
  const q=needed(v,'q','进料热状态系数 q');
  const R=needed(v,'R','回流比 R',0.00000001);
  if(!(xb<zf&&zf<xd))return err('应满足 xB < zF < xD，且各组成均为轻组分摩尔分数。');
  const m=mccabe(alpha,xd,xb,zf,q,R);
  return success('二元逐级图解初算','教学初算',[
    metric('约需平衡级',m.fractional,'级','最后一级为线性分数级近似'),
    metric('整级计数（向上）',m.stages,'级'),
    metric('进料级（塔顶往下）',m.feedStage,'级'),
    metric('最小回流比 Rmin',m.rmin,''),
    metric('全回流最小级数',nmin,'级')
  ],[...notes,'图解采用恒摩尔溢流、恒定α，并将最终跨越xB的一步作线性分数级近似。整级计数包含部分再沸器。','进料级是按操作线切换位置推得的参考值，并非经工业塔优化。'],
  ['y*(x) = αx / [1+(α−1)x]','精馏段：y = R/(R+1)·x + xD/(R+1)','进料线：y = q/(q−1)·x − zF/(q−1)；q=1 时 x=zF','提馏段操作线经过(xB,xB)与进料交点','由塔顶沿平衡线与操作线逐级递推，不代表严格物性模拟'],[REFERENCES.wankat],{steps:m.steps});
});}
export function calcMix(v){return safe(()=>{
  const rho=needed(v,'rho','工作温度密度（kg/m³）',0.000001);
  const muVal=needed(v,'mu','工作温度动力黏度',0.0000000001);
  const unit=v.muUnit||'mPa·s',mu=muVal*(unit==='Pa·s'?1:unit==='mPa·s'?0.001:NaN);
  if(!Number.isFinite(mu))return err('请选择正确的黏度单位（Pa·s 或 mPa·s）。');
  const vessel=needed(v,'vesselD','釜内径（mm）',0.000001)/1000;
  const d=needed(v,'impellerD','桨径（mm）',0.000001)/1000;
  const rpm=needed(v,'rpm','搅拌转速（rpm）',0.00000001);
  const impeller=v.impeller;
  if(!impeller)return err('请先选择桨型。','incomplete',['impeller']);
  if(v.rheology!=='newtonian')return err('当前仅支持牛顿流体。非牛顿流体需提供剪切速率—黏度关系和适用功率模型。');
  if(d>=vessel)return err('桨径必须小于釜内径。');
  const n=rpm/60,Re=rho*n*d*d/mu;
  const base=[metric('搅拌雷诺数 Re',Re,''),metric('桨径/釜径',d/vessel,'')];
  const notes=['Re仅作流动状态分析的基础指标；不同桨型的层流、过渡流及湍流边界不能使用同一通用阈值。','不根据轴功率直接输出电机型号、额定功率或减速机服务系数。'];
  const enteredNp=optional(v,'userNp'),source=String(v.npSource||'').trim();
  if(enteredNp!==null){
    const np=needed(v,'userNp','用户提供的功率数 Np',0.000000001);
    if(!source)return success('搅拌基础参数','仅雷诺数',base,['已填Np但未填写可核查的来源；为防误用，暂停轴功率换算。',...notes],['Re = ρ·n·d²/μ；n=rpm/60'],[]);
    const P=np*rho*n**3*d**5;
    return success('用户功率数换算','用户参数算术换算',
      [...base,metric('轴功率（由自填Np换算）',P,'W'),metric('轴扭矩',P/(2*Math.PI*n),'N·m'),metric('用户Np',np,'')],
      ['功率数来自用户填写：'+source+'。平台尚未证明它与当前桨型及几何匹配，不作为电机选型结论。',...notes],
      ['P = Np·ρ·n³·d⁵','T = P/(2πn)；n为每秒转数'],[]);
  }
  if(impeller!=='anchor'&&impeller!=='ribbon'){
    return success('搅拌基础参数','仅雷诺数',base,
      ['本桨型尚无已冻结并匹配当前几何的Np–Re关联数据，因此不输出轴功率；可以另填有出处的Np进行算术换算。',...notes],
      ['Re = ρ·n·d²/μ；n=rpm/60'],[]);
  }
  const required=['depth','bladeWidth','bladeLength','nBlades','nArms','armDia'];
  if(impeller==='ribbon')required.push('pitch');
  if(required.some(k=>v[k]===undefined||String(v[k]).trim()==='')){
    return success('搅拌基础参数','仅雷诺数',base,
      ['如需受限的锚式/螺带轴功率估算，请展开“专业桨叶几何”，填写液深、叶宽、叶长、叶片数和支臂几何。',...notes],
      ['Re = ρ·n·d²/μ'],[REFERENCES.takahashi]);
  }
  const depth=needed(v,'depth','液深（mm）',0.000001)/1000,
    w=needed(v,'bladeWidth','叶宽（mm）',0.000001)/1000,
    L=needed(v,'bladeLength','叶长（mm）',0.000001)/1000,
    np=needed(v,'nBlades','叶片数',1,4),
    na=needed(v,'nArms','每叶支臂数',1,10),
    da=needed(v,'armDia','支臂直径（mm）',0.000001)/1000;
  const pitch=impeller==='ribbon'?needed(v,'pitch','螺带螺距（mm）',0.000001)/1000:null;
  if(!Number.isInteger(np)||!Number.isInteger(na))return err('叶片数和每叶支臂数须为整数。');
  if(v.bottom!=='flat'||v.baffles!=='none'||v.internals!=='no')return success('搅拌基础参数','仅雷诺数',base,
    ['Takahashi论文的限定关联式来自平底、无挡板、无额外内构件的实验槽；当前结构不匹配，停止轴功率估算。',...notes],
    ['Re = ρ·n·d²/μ'],[REFERENCES.takahashi]);
  const c=(vessel-d)/2, cD=c/vessel,wD=w/vessel, sD=pitch===null?Infinity:pitch/vessel;
  const within=cD>=.019&&cD<=.13&&wD>=.076&&wD<=.20&&sD>=.49&&Re>=.1&&Re<=10&&Math.abs(depth/vessel-1)<=.02;
  if(!within||w>=d/2||da>=d)return success('搅拌基础参数','仅雷诺数',base,
    ['关联式适用条件未满足：需0.019≤壁隙/釜径≤0.13、0.076≤叶宽/釜径≤0.20、螺距/釜径≥0.49、0.1≤Re≤10且液深接近釜径；几何超限不外推。',...notes],
    ['Re = ρ·n·d²/μ'],[REFERENCES.takahashi]);
  const sinTheta=pitch===null?1:pitch/Math.sqrt((Math.PI*d)**2+pitch**2);
  const f=1+.00539*(cD)**(-.876);
  const blade=16*Math.PI**3/(2*Math.log(4+8*c/w)-1)*(L/d)*f*sinTheta**.555*(np/2);
  const rbi=d/2-w;
  const arm=2.08*Math.PI**3*na*np*(da/d)**.15*(rbi/d)**3.15;
  const C=blade+arm;
  const P=C*mu*n*n*d**3;
  const modelNotes=['依据Takahashi等1982年Eq.(4)在有限几何范围推算；论文实验槽内径约128mm、平底、液深近等于槽径。大尺寸实际设备的外推误差没有独立验证，不可据此选定电机。',...notes];
  if(Math.abs(vessel-.128)>.003)modelNotes.unshift('当前釜径与论文约128mm实验槽不一致，本结果属于超实验尺寸的假设换算，未经工程放大验证。');
  return success('锚式/螺带受限功率估算','文献受限模型',
    [...base,metric('关联常数 Np·Re',C,''),metric('叶轮轴功率',P,'W'),metric('轴扭矩',P/(2*Math.PI*n),'N·m')],
    modelNotes,['Np·Re = Takahashi 1982 Eq.(4)（叶片项＋支臂项）','P = (Np·Re)·μ·n²·d³','T = P/(2πn)'],[REFERENCES.takahashi]);
});}
export function calcConvert(v){return safe(()=>{
 const group=v.group||'pressure',g=GROUPS[group];
 if(!g)return err('请选择单位类型。');
 const val=needed(v,'value','待换算数值');
 const from=v.from,to=v.to;
 if(!Object.prototype.hasOwnProperty.call(g.units,from)||!Object.prototype.hasOwnProperty.call(g.units,to))return err('请先选择有效的原单位和目标单位。');
 let result;
 if(group==='temperature'){
   const kelvin=from==='K'?val:val+273.15;
   if(kelvin<0)return err('温度不能低于绝对零度（0 K）。');
   result=to==='K'?kelvin:kelvin-273.15;
 }else result=val*g.units[from]/g.units[to];
 return success('单位换算','基础换算',[metric('换算结果',result,to)],
   ['仅进行单位数值换算；压力单位默认为绝对压力数值，不进行表压与绝压之间的自动转换。'],[]);
});}
export function calculate(moduleId,v){
 switch(moduleId){
   case 'heat':return calcHeat(v);
   case 'load':return calcLoad(v);
   case 'mix':return calcMix(v);
   case 'distill':return calcDistill(v);
   case 'vacuum':return calcVacuum(v);
   case 'convert':return calcConvert(v);
   default:return err('未知计算模块。');
 }
}