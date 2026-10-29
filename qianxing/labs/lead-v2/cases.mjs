"use strict";
export const VERSION="leadership-v2-20261029", HORIZON=12;
export const TIMES=Array.from({length:HORIZON+1},(_,i)=>{
 const n=8*60+i*30;
 return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0");
});
const W=(id,name,skills,maxSlots=6,standby=false)=>({id,name,skills,maxSlots,standby});
const T=(id,name,skill,duration,due,machine=null,after=[],weight=2,release=0)=>({id,name,skill,duration,due,machine,after,weight,release});
const M=(id,name)=>({id,name});
export const CASES=[
{
 id:"practice",phase:"practice",title:"社区展位 · 布置排程",world:"社区展厅",
 story:"为社区活动安排展板设计、打印裁切、安装和物料整理，只有一台打印工作台。",
 workers:[W("an","安然",["design","prep","handoff"]),W("bo","博文",["install","pack","handoff"]),W("ci","思齐",["design","pack","install"])],
 standby:[],machines:[M("printer","打印工作台")],
 tasks:[T("drawing","展板设计","design",2,4),T("print","打印裁切","prep",2,8,"printer",["drawing"]),T("setup","安装展台","install",2,11,null,["print"]),T("pack","整理物料","pack",1,11,null,["print"])],
 event:{title:"打印设备临时检修",message:"打印机09:30—10:30停机，并追加一项展板内容确认。",blockMachines:{printer:[[3,5]]},newTasks:[T("check","展板内容确认","design",1,9,null,["drawing"],3)]},
 communications:[["transparent","告知设备停机风险，明确新的交付节点与负责人","clarify"],["silent","只说一切正常，隐瞒检修与排程变化","hide"],["pressure","要求所有人无条件延长工作时间弥补延迟","pressure"]],
 focus:"检查前置任务与共享设备的冲突。"
},
{
 id:"shipping",phase:"baseline",title:"紧急交货 · 两名同事请假",world:"实验设备交付中心",
 story:"四人负责装配、检测、打包与发运。初步排程提交后，两位员工请假，只能协调具有相应资格的替补。",
 workers:[W("li","黎工",["prep","qa"]),W("zhong","钟工",["pack","ship"]),W("wu","吴工",["prep","pack"]),W("liu","柳工",["qa","ship"])],
 standby:[W("zhao","赵工（跨组支援）",["pack","ship","qa"],5,true)],
 machines:[M("bench","装配台"),M("tester","检测台")],
 tasks:[T("prep","样机装配","prep",2,5,"bench"),T("qa","功能检测","qa",2,8,"tester",["prep"],3),T("pack","打包清点","pack",2,10,null,["qa"]),T("dispatch","发运交接","ship",1,12,null,["pack"],3)],
 event:{title:"双人请假与临时复核",message:"钟工与吴工整班请假，赵工可以跨组支援。临时增加一项样机复核。",blockWorkers:{zhong:[[0,12]],wu:[[0,12]]},newTasks:[T("urgent-qa","临时样机复核","qa",1,9,"tester",["prep"],3)]},
 communications:[["transparent","说明缺岗与支援需求，更新交付节点并确认复核人","clarify"],["silent","未核实人手就向客户保证绝不延期","hide"],["pressure","继续把请假员工写进计划，要求必须到场","pressure"]],
 focus:"人手缺口、后备资格及透明交付承诺。"
},
{
 id:"exhibition",phase:"baseline",title:"开幕布展 · 投影设备撞期",world:"公共展馆",
 story:"完成场地、视觉调试、现场复核、接待区域布置。只有一套投影调试台。",
 workers:[W("mei","梅",["prep","pack"]),W("feng","冯",["visual","review"]),W("xia","夏",["setup","pack"]),W("he","何",["review","setup"])],
 standby:[],machines:[M("projector","投影调试台")],
 tasks:[T("floor","清理场地","prep",2,4),T("visual","画面调试","visual",2,7,"projector",["floor"],3),T("review","开幕复核","review",1,10,null,["visual"]),T("welcome","接待区布置","setup",2,12,null,["review"])],
 event:{title:"设备暂停与加装入口标识",message:"投影设备09:30—11:30检修，同时新增入口方向标识任务。",blockMachines:{projector:[[3,7]]},newTasks:[T("sign","入口标识","setup",1,9,null,["floor"])]},
 communications:[["transparent","说明设备可用时段及可并行工作，协调新排程","clarify"],["silent","不披露投影设备停机，宣称现场已经准备完毕","hide"],["pressure","安排没有专业资格的人员操作投影设备","pressure"]],
 focus:"共享设备撞期、依赖顺序与风险升级。"
},
{
 id:"release",phase:"after",title:"软件发布 · 测试人员离岗",world:"软件交付小组",
 story:"修补、测试、复核与部署都需要明确的负责人与前置步骤，共享构建机不得并行占用。",
 workers:[W("kai","凯",["code","review"]),W("yan","燕",["test","deploy"]),W("ning","宁",["review","test"]),W("fan","凡",["code","deploy"])],
 standby:[W("fei","菲（跨组支援）",["test","deploy"],5,true)],machines:[M("ci","构建/测试机")],
 tasks:[T("patch","修复提交","code",2,5),T("test","集成测试","test",2,8,"ci",["patch"],3),T("review","版本复核","review",1,10,null,["test"]),T("deploy","上线部署","deploy",1,12,"ci",["review"],3)],
 event:{title:"测试人员暂离、追加回归测试",message:"燕不能参与08:00—12:00的工作，菲可以支援；产品组要求加做回归测试。",blockWorkers:{yan:[[0,8]]},newTasks:[T("regression","补充回归测试","test",1,9,"ci",["patch"],3)]},
 communications:[["transparent","核实测试/部署资格并调整上线节点，对风险作出说明","clarify"],["silent","提前宣布成功上线，之后再补写测试记录","hide"],["pressure","跳过全部复核步骤，要求立即部署","pressure"]],
 focus:"人员资格、共享构建机与上线前置条件。"
},
{
 id:"lab",phase:"after",title:"实验报告 · 分析台停机",world:"实验室样品组",
 story:"样品接收、分析、结果复核、报告发送都需要依次进行，分析台维护时不得使用。",
 workers:[W("qi","齐",["collect","analyze"]),W("mo","莫",["analyze","review"]),W("rui","芮",["collect","send"]),W("peng","彭",["review","send"])],
 standby:[W("lu","路（复核支援）",["review","send"],5,true)],machines:[M("lab","分析台")],
 tasks:[T("collect","样品接收","collect",2,4,"lab"),T("analyze","实验分析","analyze",2,8,"lab",["collect"],3),T("review","结果复核","review",1,10,null,["analyze"]),T("send","报告发送","send",1,12,null,["review"])],
 event:{title:"分析台维护与额外复核",message:"分析台09:00—10:30维护，需要另外完成一项独立复核。检验记录必须真实。",blockMachines:{lab:[[2,5]]},newTasks:[T("check","独立复核","review",1,11,null,["analyze"],3)]},
 communications:[["transparent","说明维护时段并更新送达预期，保留真实复核环节","clarify"],["silent","把未完成的样品标记为已经检测","hide"],["pressure","要求员工在维护停机时强行启动分析台","pressure"]],
 focus:"真实检验记录与设备停机边界。"
},
{
 id:"relief",phase:"transfer",title:"公益物资 · 驾驶员缺岗",world:"物资调拨站",
 story:"物资先清点，再核对和打包，最后使用唯一车辆运送。必须由具有相应资格的人员负责。",
 workers:[W("gao","高",["count","pack"]),W("han","韩",["transport","pack"]),W("wen","文",["count","verify"]),W("zhou","周",["transport","verify"])],
 standby:[W("yu","于（支援）",["pack","verify"],5,true)],machines:[M("van","配送车辆")],
 tasks:[T("inventory","物资清点","count",2,4),T("verify","数量复核","verify",1,6,null,["inventory"],3),T("pack","分类包装","pack",2,9,null,["verify"]),T("ship","运输交付","transport",2,12,"van",["pack"],3)],
 event:{title:"司机缺岗与追加包装任务",message:"韩整班无法出勤，临时加一张包装确认单，其他人员可按资质协调。",blockWorkers:{han:[[0,12]]},newTasks:[T("repack","追加包装确认","pack",1,9,null,["verify"])]},
 communications:[["transparent","明确配送人资格、交付范围与预计时间","clarify"],["silent","未经核实车辆与人员就承诺已配送","hide"],["pressure","安排没有驾驶资格的人直接开车","pressure"]],
 focus:"安全资格、任务优先级与人员协作。"
},
{
 id:"cnc",phase:"transfer",title:"CNC试制 · 机床停机与复测",world:"数控试制车间",
 story:"依次完成图纸核对、工装准备、试制加工、尺寸测量和交付。共用数控机床与测量台。",
 workers:[W("pan","潘工",["cad","setup"]),W("bao","鲍工",["machine","inspect"]),W("chen","陈工",["setup","machine"]),W("dong","董工",["inspect","ship"])],
 standby:[W("fan","范工（支援）",["machine","ship"],5,true)],machines:[M("cnc","CNC机床"),M("measure","测量台")],
 tasks:[T("drawing","图纸确认","cad",1,3),T("fixture","工装准备","setup",2,6,null,["drawing"]),T("cut","试制加工","machine",2,10,"cnc",["fixture"],3),T("inspect","首件测量","inspect",1,11,"measure",["cut"],3),T("deliver","交付记录","ship",1,12,null,["inspect"])],
 event:{title:"CNC停机、主机手缺岗与新增复检",message:"CNC在09:30—11:00停机，鲍工整班请假。范工可提供支援，另需首件复检。",blockMachines:{cnc:[[3,6]]},blockWorkers:{bao:[[0,12]]},newTasks:[T("remeasure","首件追加复检","inspect",1,11,"measure",["cut"],3)]},
 communications:[["transparent","核对机台/人员可用性，公开真实交付风险并保留首件复测","clarify"],["silent","跳过检测就宣布产品已经合格","hide"],["pressure","在维护停机时强行操作机床并编造记录","pressure"]],
 focus:"不能以排程效率代替真实CNC工艺安全或尺寸确认。"
}
];
export const PHASES={practice:"操作练习",baseline:"首次排程",after:"新场景挑战",transfer:"跨领域迁移"};
export function tasksFor(c,event=false){return event?[...c.tasks,...c.event.newTasks]:[...c.tasks];}
export function workersFor(c,event=false){return event?[...c.workers,...c.standby]:[...c.workers];}
export function isScheduled(a){return !!(a&&a.worker&&Number.isInteger(a.start)&&a.start>=0);}
export function emptyPlan(c,event=false){return Object.fromEntries(tasksFor(c,event).map(t=>[t.id,{worker:"",start:-1}]));}
export function fmtTime(slot){return TIMES[Math.max(0,Math.min(HORIZON,slot))]||"—";}
export function overlap(a,b){return a[0]<b[1]&&b[0]<a[1];}
export function validateCase(c){
 const ids=new Set(c.tasks.map(t=>t.id));
 return c.tasks.length>=3&&c.tasks.length<=6&&c.workers.length>=3&&c.machines.length>=1&&
 c.tasks.every(t=>t.duration>=1&&t.duration<=4&&t.due<=HORIZON&&t.after.every(id=>ids.has(id)))&&
 c.event.newTasks.every(t=>!ids.has(t.id)&&t.after.every(id=>ids.has(id)))&&
 c.communications.length===3&&new Set(c.communications.map(c=>c[0])).size===3;
}
