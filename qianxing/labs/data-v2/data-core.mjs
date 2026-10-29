"use strict";
/*
 第77项 数据挖掘分析 V2：9组完整合成数据。
 仅做教学调查；真实业务决策需要核实来源、时效、样本和因果。
 所有率均采用 SUM(事件数)/SUM(样本数)，不能平均分组百分比。
*/
export const VERSION="qx-data-v2-20261029";
const META=[
 ["duplicate","practice","仓库日报：订单突然翻倍","订单导入量 vs 唯一订单",
  "上午的订单导入量翻倍，主管准备增加打包人员。但仓库说真实工作量没有变。",
  ["东仓","西仓"],["导入行数","唯一订单","唯一订单比例","后台订单数"],9,"duplicate","dedup",
  "东仓异常日的同一批订单被重复导入，唯一订单与后台订单量未等比例变化。",
  [["duplicate","订单导入任务重跑，出现重复行"],["real","真实订单激增，打包工作量翻倍"],["routine","属于正常日内波动"],["carrier","物流延迟导致订单增多"]],
  [["dedup","按稳定订单ID去重，与业务后台对账后再安排人手"],["hire","直接按原始行数翻倍安排人员"],["erase","把异常日全部记录删除"]],
  ["导入重试日志显示任务重复执行","后台订单号去重后和日常数量相近","有人说‘今天感觉很忙’，未经数据核对"]],
 ["carrier","baseline","送达延误：哪条线路有变化？","送达件数 vs 晚到件数",
  "客服反馈晚到投诉上升，仓库认为只是送达总数增加。",
  ["甲承运商","乙承运商"],["送达件数","晚到件数","晚到率","签收记录数"],10,"carrier","carrier-check",
  "乙线路在重点日期晚到率突增，甲线路稳定；分拣日志记录乙线发生设备故障。",
  [["carrier","乙承运商出现局部延误"],["volume","只是总出货量增加，晚到率不变"],["duplicate","相同物流单重复计数"],["routine","所有线路都处于常规波动"]],
  [["carrier-check","单独核查乙线路及分拣记录，并进行范围明确的客户告知"],["global","暂停所有线路发货"],["ignore","不看分组，仅比较投诉总数"]],
  ["乙线路的分拣日志记录停机事件","甲线路独立签收记录稳定","有人猜客户故意投诉，没有依据"]],
 ["small","baseline","成交率80%：样本有多大？","访客数 vs 成交",
  "新渠道一天的成交率接近八成，营销团队打算立即大幅提高预算。",
  ["自然流量","新测试渠道"],["访客数","成交人数","成交率","真实访客数"],10,"small","collect",
  "新渠道当天只有5位访客，其中4位成交。比例高，但无法证明长期稳定提升。",
  [["small","极高比率来自很小分母，暂无法确定长期趋势"],["proven","已足以证明渠道持续优于其他渠道"],["broken","系统漏掉了大量成交用户"],["carrier","物流商提高了成交率"]],
  [["collect","保持小规模试验，补充样本并记录不确定性"],["scale","将全部预算立即转向新渠道"],["erase","直接删除很高的数据点"]],
  ["新渠道当天可核实的访客只有5位","访问与成交记录一致，但样本很小","同事说‘一定是爆款’，这不是证据"]],
 ["mix","baseline","整体签约率下滑：每组都变差了吗？","咨询数 vs 签约数",
  "总签约率明显下滑，负责人担心所有销售渠道表现变差，准备统一追责。",
  ["老客转介绍","公共广告"],["咨询人数","签约人数","签约率","登记咨询数"],9,"mix","segment",
  "两个来源内部签约率接近原基线，但低转化来源占比变大，拖低总体率。",
  [["mix","渠道构成变化，总体变差但组内比率基本稳定"],["worse","每个渠道的组内转化率都大幅下降"],["duplicate","订单被重复写入导致签约率偏高"],["small","所有渠道样本都不足5人"]],
  [["segment","按来源分别展示分子、分母及签约率，复核渠道结构变化"],["blame","把总体下降归因于全部员工"],["hide","仅发布总体数据不开放分组"]],
  ["广告渠道占总体咨询量的比例增加","两组分别计算签约率后与基线接近","有人说新员工一定不努力，没有证据"]],
 ["units","after","温度报警：数字真的是摄氏度吗？","测温次数 vs 高温告警",
  "设备告警突然暴涨。先核实数值单位和阈值，避免错误停机或盲目忽略风险。",
  ["探头一","探头二"],["测温次数","高温告警数","高温告警率","采样日志数"],10,"units","units-check",
  "探头二的接口改成华氏度输出，但阈值计算仍按摄氏度；独立参考探头没有显示相同升温。",
  [["units","采集单位改变而判定阈值未同步转换"],["true","两只探头确认真实超温"],["zero","当天一共没有测温"],["routine","仅为正常周周期"]],
  [["units-check","交叉核对实际温度、单位、阈值及独立参考记录，再评估安全处置"],["disable","永久关闭所有真实高温告警"],["ignore","不核对传感器来源"]],
  ["探头二采样接口标注°F，阈值仍使用°C","对照探头未记录同幅度温度上升","有人声称设备完全损坏，未经过检修"]],
 ["weekends","after","周末访问量低：真的有新故障吗？","访问次数 vs 有效咨询",
  "周末访问总量明显降低，自动监控建议把每个周末都升级为故障。",
  ["桌面端","移动端"],["访问次数","有效咨询数","有效咨询率","核实访问数"],null,"week","weekday",
  "两周周末出现类似的周期性低访问量，组内咨询率稳定，尚未发现需要上报的新事故。",
  [["week","两周重复的每周规律，暂不能认定有新故障"],["crash","只有第二周末发生全新系统崩溃"],["carrier","物流商导致所有访问降低"],["duplicate","数据导入导致流量异常翻倍"]],
  [["weekday","按相同星期和渠道比较，并重新设置监测阈值"],["emergency","把所有周末当作系统事故"],["erase","删除周末数据使曲线平滑"]],
  ["两个周末出现相似的流量低谷","分组有效咨询率基本稳定","群聊猜测系统遭破坏，没有证据"]],
 ["lag","after","日报骤降：业务真的停了吗？","日报数据 vs 上游业务量",
  "日报入库任务数骤降，但上游处理系统显示完成任务并未大幅减少。",
  ["工作队一","工作队二"],["日报写入行数","完成任务数","记录完成比","上游真实任务数"],10,"lag","backfill",
  "日报定时同步延迟，入库行数降低；上游完成量仍正常。需要确认数据到达和回填。",
  [["lag","同步延迟让日报缺少部分记录"],["operations","两队实际工作量同时停止"],["duplicate","日报重复入库，数值虚高"],["holiday","正常节假日所有活动下降"]],
  [["backfill","用上游数据与同步日志对账，补齐日报并标记刷新时效"],["fire","仅凭日报就停止两队工作"],["invent","填入编造数字平滑日报"]],
  ["同步任务在重点日期延迟运行","上游处理系统记录正常任务量","有人觉得当天很清闲，但无客观依据"]],
 ["returns","transfer","售后退货：是不是所有批次都差？","发货量 vs 退货件数",
  "售后退货突然增多，客服准备把全部商品都按质量事故处理。",
  ["批次甲","批次乙"],["发货件数","退货件数","退货率","质检记录件数"],10,"batch","batch-check",
  "乙批次退货率增高，甲批次正常；模拟抽检记录也在乙批次找到相同缺陷。",
  [["batch","异常集中于乙批次，应追踪该批次"],["all","所有批次都同幅度恶化"],["routine","完全属于常规波动"],["units","是温度单位错误导致的退货"]],
  [["batch-check","追踪乙批次、复核退货与质检证据，再决定隔离范围"],["all-stop","不分批次直接宣布全部产品不合格"],["ignore","忽略所有质检记录"]],
  ["乙批次抽检出现与售后对应的缺陷","甲批次的抽检没有类似异常","有人推测供应商故意作假，没有证据"]],
 ["alarms","transfer","自动化误报警：哪个环节改变了？","监测采样 vs 告警次数",
  "某台设备突然告警频繁，现场测量没有显示相应程度的工况异常。",
  ["机台一","机台二"],["采样次数","告警次数","告警率","参考采样次数"],10,"threshold","audit",
  "机台一的报警阈值从10调整为5，告警数增加，独立参考检测没有发现对应的异常。",
  [["threshold","机台一告警阈值变化影响了判定"],["both","两台机台都确认出现严重工况变化"],["mix","是客户渠道结构变化导致的"],["small","当天不足5个采样点"]],
  [["audit","核对阈值变更与参考采样，再决定是否修订配置"],["disable","直接永久关闭所有报警功能"],["erase","删除当天记录以避免报告异常"]],
  ["机台一重点日前发生报警阈值配置变更","参考检测未见同幅度的实际工况异常","同事猜测夜班员工恶意修改，无证据"]]
];
export const CASES=META.map((a,i)=>({
 id:a[0],phase:a[1],title:a[2],subtitle:a[3],story:a[4],groups:a[5],columns:a[6],
 signal:a[7],truth:a[8],bestAction:a[9],explanation:a[10],causes:a[11],actions:a[12],notes:a[13],index:i
}));
export const PHASES={practice:"操作练习",baseline:"首次调查",after:"新数据挑战",transfer:"跨领域迁移"};
export const DAYS=Array.from({length:14},(_,i)=>"09-"+String(i+1).padStart(2,"0"));

// 三份平行“数据材料”不对应经过标准化研究证明的等价难度；
// 用相同的业务逻辑但不同日期和规模的表格减少直接背答案的价值。
export const FORM_IDS=["A","B","C"];
const SIGNAL_DAYS={
 A:{},B:{duplicate:4,carrier:7,small:9,mix:6,units:5,lag:13,returns:8,alarms:3},
 C:{duplicate:13,carrier:4,small:6,mix:12,units:8,lag:7,returns:5,alarms:10}
};
export function caseForForm(c,form="A"){
 if(!FORM_IDS.includes(form))throw Error("unknown data form");
 if(!c||!CASES.some(x=>x.id===c.id))throw Error("invalid source case");
 const newDay=SIGNAL_DAYS[form]?.[c.id];
 const signal=c.signal===null?null:(newDay?newDay-1:c.signal);
 return {...c,signal,form};
}

export const EVIDENCE=[
 ["segments","查看各分组在相同日期的比例"],
 ["denominator","查看分子、分母与样本规模"],
 ["independent","对照另一套独立统计来源"],
 ["audit","核查运营与系统过程记录"],
 ["rumor","听取未经核实的聊天猜测"]
];
const ROUND=x=>Math.max(0,Math.round(x));
function base(c,g,day){
 const jitter=[0,7,-5,3,-2,5,-4][(day+g*2)%7];
 const a={duplicate:105,carrier:180,small:205,mix:165,units:170,weekends:170,lag:185,returns:160,alarms:190}[c.id];
 const b={duplicate:127,carrier:225,small:98,mix:45,units:195,weekends:200,lag:165,returns:195,alarms:210}[c.id];
 return (g?b:a)+jitter*(["carrier","weekends"].includes(c.id)?2:1);
}
function makeBaseRows(id){
 const c=CASES.find(x=>x.id===id);if(!c)throw Error("case not found");
 const result=[];
 for(let day=1;day<=14;day++)for(let g=0;g<2;g++){
  let total=base(c,g,day),hits=0,reference=total;
  const wave=day%4===0?1:day%5===0?-1:0;
  if(id==="duplicate"){hits=total-1-(day%5===0?1:0);if(day===10&&g===0)total*=2;}
  else if(id==="carrier")hits=ROUND(total*((day===11&&g===1)?.24:(g?.045:.035))+wave);
  else if(id==="small"){if(day===11&&g===1){total=5;reference=5;hits=4;}else hits=ROUND(total*(g?.085:.11)+wave);}
  else if(id==="mix"){if(day===10)total=g?180:20;reference=total;hits=ROUND(total*(g?.052:.28)+wave);}
  else if(id==="units")hits=ROUND(total*((day===11&&g===1)?.78:.045)+wave);
  else if(id==="weekends"){if([6,7,13,14].includes(day))total=ROUND(total*.43);reference=total;hits=ROUND(total*(g?.13:.105));}
  else if(id==="lag"){reference=total;if(day===11)total=ROUND(total*.24);hits=ROUND(reference*.88+wave);}
  else if(id==="returns")hits=ROUND(total*((day===11&&g===1)?.32:(g?.05:.045))+wave);
  else if(id==="alarms")hits=ROUND(total*((day===11&&g===0)?.37:.048)+wave);
  result.push({day:DAYS[day-1],dayNo:day,group:g,groupName:c.groups[g],
    total,hits,reference,rate:total?hits/total*100:0});
 }
 return result;
}

/**
 * 保留A版本的原始生成逻辑供旧版会话使用。
 * B/C按同一生成事件的分组/日期双向交换，并按一致系数缩放分子、分母和核对来源。
 * 不会发生“标签里说异常但数据记录没有相同事件”的问题。
 */
export function makeRows(id,form="A"){
 if(!FORM_IDS.includes(form))throw Error("invalid form");
 const source=makeBaseRows(id);
 if(form==="A")return source;
 const c=CASES.find(x=>x.id===id);
 const sourceDay=c.signal===null?null:c.signal+1;
 const targetDay=c.signal===null?null:caseForForm(c,form).signal+1;
 const flip=day=>sourceDay!==null&&sourceDay!==targetDay?
     (day===sourceDay?targetDay:day===targetDay?sourceDay:day):day;
 const out=source.map(r=>{
  const dest=flip(r.dayNo);
  // Scale whole groups consistently (except 5-person small sample), preserving the
  // evidence-producing phenomenon rather than fabricating unrelated causes.
  const tinySample=c.id==="small"&&r.group===1&&r.dayNo===11;
  const signalFactor=form==="B"?(.87+((dest*7+r.group*5+c.index*3)%11)*.025)
      :(.83+((dest*11+r.group*7+c.index*5)%13)*.026);
  const factor=tinySample?1:signalFactor;
  const total=Math.max(1,Math.round(r.total*factor));
  const hits=Math.max(0,Math.round(r.hits*factor));
  const reference=Math.max(1,Math.round(r.reference*factor));
  return {...r,day:DAYS[dest-1],dayNo:dest,total,hits,reference,
    rate:total>0?hits/total*100:0};
 });
 out.sort((a,b)=>a.dayNo-b.dayNo||a.group-b.group);
 return out;
}
export function validateParallelForms(){
 const result=[];
 for(const form of FORM_IDS)for(const c of CASES){
  const rows=makeRows(c.id,form),caseInfo=caseForForm(c,form);
  if(rows.length!==28||new Set(rows.map(r=>r.day)).size!==14||
     rows.some(r=>!Number.isFinite(r.rate)||r.total<1||r.reference<1||r.hits<0))
   throw Error("invalid parallel form "+form+"/"+c.id);
  result.push({form,id:c.id,signal:caseInfo.signal,rows:rows.length});
 }
 return result;
}

export function summarize(rows,group="all",metric="rate"){
 if(!["total","hits","rate","reference"].includes(metric))throw Error("invalid measure");
 const m=new Map();
 for(const r of rows){
  if(group!=="all"&&Number(group)!==r.group)continue;
  const v=m.get(r.day)||{day:r.day,total:0,hits:0,reference:0,records:0};
  v.total+=r.total;v.hits+=r.hits;v.reference+=r.reference;v.records++;
  m.set(r.day,v);
 }
 const arr=[...m.values()].sort((a,b)=>a.day.localeCompare(b.day));
 return arr.map(x=>({...x,rate:x.total?x.hits/x.total*100:0,value:metric==="rate"?(x.total?x.hits/x.total*100:0):x[metric]}));
}
export function forDay(rows,day,group="all"){
 return summarize(rows,group).find(x=>x.day===day)||null;
}
export function wilson(success,n,z=1.96){
 if(!Number.isInteger(success)||!Number.isInteger(n)||n<1||success<0||success>n)throw Error("invalid binomial data");
 const p=success/n,z2=z*z,denom=1+z2/n;
 const center=(p+z2/(2*n))/denom;
 const margin=z*Math.sqrt(p*(1-p)/n+z2/(4*n*n))/denom;
 return [Math.max(0,center-margin),Math.min(1,center+margin)];
}
export function evidence(c,rows,key,focus=null){
 if(!EVIDENCE.some(x=>x[0]===key))throw Error("invalid evidence");
 const day=DAYS.includes(focus)?focus:(c.signal===null?DAYS[6]:DAYS[c.signal]),a=forDay(rows,day,"0"),b=forDay(rows,day,"1"),all=forDay(rows,day);
 const ap=summarize(rows,"0").filter(x=>x.day!==day),bp=summarize(rows,"1").filter(x=>x.day!==day);
 const avg=x=>x.reduce((n,v)=>n+v.hits,0)/x.reduce((n,v)=>n+v.total,0)*100;
 const pct=n=>n.toFixed(1)+"%";
 let result="";
 if(key==="segments")result="核对日 "+day+"："+c.groups[0]+"为"+pct(a.rate)+"（其余日约"+pct(avg(ap))+"），"+c.groups[1]+"为"+pct(b.rate)+"（其余日约"+pct(avg(bp))+"）。";
 else if(key==="denominator"){
  result=day+"两组分母分别为"+a.total+"和"+b.total+"。总体分子"+all.hits+"、分母"+all.total+"。只有分子、分母同时明确才能比较比例。";
  if(c.id==="small"&&day===DAYS[c.signal]){
   const interval=wilson(b.hits,b.total);
   result+=" 新渠道4/5的示意性95% Wilson区间约"+Math.round(100*interval[0])+"%至"+Math.round(100*interval[1])+"%（需独立样本假设），区间很宽，不能直接认定长期改善。";
  }
 }
 else if(key==="independent")result=day+"：报表「"+c.columns[0]+"」合计"+all.total+"；独立核对的「"+c.columns[3]+"」合计"+all.reference+"。两者代表不同来源，注意统计口径。";
 else if(key==="audit")result="模拟操作记录："+c.notes[0]+"。"+c.notes[1]+"。记录有助于验证假设，但不能仅凭相关性确定现实因果。";
 else result="未经核实的说法："+c.notes[2]+"。这不是客观数据证据。";
 return {id:key,kind:key==="rumor"?"未经核实":key==="audit"?"系统/业务记录":key==="segments"?"分组对比":key==="denominator"?"样本规模":"独立来源",text:result};
}
export function validCase(c){
 return !!(c.id&&c.title&&c.columns.length===4&&c.groups.length===2&&
 c.causes.length===4&&c.actions.length===3&&c.causes.some(x=>x[0]===c.truth)&&
 c.actions.some(x=>x[0]===c.bestAction)&&
 (c.signal===null||(Number.isInteger(c.signal)&&c.signal>=0&&c.signal<14)));
}
export function evaluate(c,focus,cause,action){
 return {focusMatches:c.signal===null?focus==="none":focus===DAYS[c.signal],
 causeMatches:cause===c.truth,actionMatches:action===c.bestAction,
 expectedFocus:c.signal===null?"none":DAYS[c.signal],
 expectedCause:c.truth,expectedAction:c.bestAction,explanation:c.explanation};
}
export function validateAll(){
 const out=[];
 for(const c of CASES){
  if(!validCase(c))throw Error("invalid case "+c.id);
  const rows=makeRows(c.id),summary=summarize(rows);
  if(rows.length!==28||summary.length!==14||rows.some(r=>!Number.isFinite(r.rate)||r.total<=0||r.hits<0||r.reference<1))throw Error("invalid dataset "+c.id);
  out.push({id:c.id,rows:rows.length,days:summary.length,focus:c.signal===null?"none":DAYS[c.signal]});
 }
 return out;
}
