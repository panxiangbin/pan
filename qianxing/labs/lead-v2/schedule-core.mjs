"use strict";
import {HORIZON,tasksFor,workersFor,isScheduled,overlap} from "./cases.mjs";
// 验证所有时间/资源约束；没有给出一个不透明的“领导力总分”。
export function checkSchedule(c,plan,disrupted=false){
 const tasks=tasksFor(c,disrupted),workers=workersFor(c,disrupted);
 const byWorker=new Map(workers.map(w=>[w.id,w]));
 const problems=[],items=[],loads=Object.fromEntries(workers.map(w=>[w.id,0]));
 const add=(code,message,ids=[])=>problems.push({code,message,ids});
 let unassigned=0,onTime=0,lateSlots=0,weightedLate=0;
 for(const t of tasks){
  const a=plan[t.id];
  if(!isScheduled(a)){unassigned++;add("unassigned",t.name+"尚未安排",[t.id]);continue;}
  const w=byWorker.get(a.worker),end=a.start+t.duration;
  items.push({id:t.id,task:t,worker:a.worker,start:a.start,end});
  if(!w){add("unknown-worker",t.name+"指定的员工不在本轮团队中",[t.id]);continue;}
  if(!w.skills.includes(t.skill))add("unqualified",w.name+"不具备"+t.name+"所需资质",[t.id]);
  if(a.start<t.release)add("early",t.name+"早于允许开工的时段",[t.id]);
  if(end>HORIZON)add("after-shift",t.name+"超出了本次工作班次",[t.id]);
  const absent=(disrupted?c.event.blockWorkers?.[w.id]:null)||[];
  if(absent.some(b=>overlap([a.start,end],b)))add("absent",w.name+"在"+t.name+"的时段请假或不可用",[t.id]);
  const closed=(disrupted?c.event.blockMachines?.[t.machine]:null)||[];
  if(t.machine&&closed.some(b=>overlap([a.start,end],b)))add("closed",t.name+"安排在设备停机窗口",[t.id]);
  loads[w.id]+=t.duration;
  if(end>t.due){lateSlots+=end-t.due;weightedLate+=(end-t.due)*t.weight;}
  else onTime++;
 }
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
  const a=items[i],b=items[j];
  if(!overlap([a.start,a.end],[b.start,b.end]))continue;
  if(a.worker===b.worker)add("worker-overlap",a.task.name+"与"+b.task.name+"让同一员工同时工作",[a.id,b.id]);
  if(a.task.machine&&a.task.machine===b.task.machine)
   add("equipment-overlap",a.task.name+"与"+b.task.name+"同时占用同一设备",[a.id,b.id]);
 }
 for(const x of items){
  for(const id of x.task.after){
   const preceding=items.find(i=>i.id===id);
   if(!preceding)add("dependency",x.task.name+"的前置任务还没有安排",[x.id,id]);
   else if(preceding.end>x.start)add("dependency",x.task.name+"开始时前置任务尚未完成",[x.id,id]);
  }
 }
 for(const w of workers)if(loads[w.id]>w.maxSlots)
  add("overload",w.name+"安排了"+(loads[w.id]/2)+"小时，超过本班的"+(w.maxSlots/2)+"小时上限",[w.id]);
 const hard=problems.filter(p=>p.code!=="unassigned");
 const late=items.filter(x=>x.end>x.task.due).map(x=>({id:x.id,name:x.task.name,slots:x.end-x.task.due,weight:x.task.weight}));
 return {problems,problemCount:problems.length,hardConflicts:hard.length,unassigned,unscheduled:unassigned,
  onTime,late,lateSlots,weightedLate,
  loads,items,total:tasks.length,assigned:items.length,
  feasible:problems.length===0&&items.length===tasks.length};
}
export function comparePlans(before,after){
 const keys=new Set([...Object.keys(before||{}),...Object.keys(after||{})]);
 let changed=0;
 for(const key of keys){
  const a=before?.[key]||{worker:"",start:-1};
  const b=after?.[key]||{worker:"",start:-1};
  if(a.worker!==b.worker||a.start!==b.start)changed++;
 }
 return changed;
}
export function initSession(c){
 return {id:c.id,pre:{plan:Object.fromEntries(c.tasks.map(t=>[t.id,{worker:"",start:-1}]))},
  post:null,choice:null,reason:"",openedAt:new Date().toISOString(),firstAt:null,finishedAt:null,
  preChecks:0,postChecks:0,editsPre:0,editsPost:0};
}
export function validPlan(c,plan,post=false){
 if(!plan||typeof plan!=="object")return false;
 const tasks=tasksFor(c,post),ids=new Set(tasks.map(t=>t.id)),employees=new Set(workersFor(c,post).map(w=>w.id));
 if(Object.keys(plan).some(k=>!ids.has(k)))return false;
 return tasks.every(t=>{
  const a=plan[t.id];return a&&typeof a==="object"&&
   (a.worker===""||employees.has(a.worker))&&
   Number.isInteger(a.start)&&a.start>=-1&&a.start<=HORIZON;
 });
}
export function safeSession(s,CASES,version){
 if(!s||s.version!==version||!["intro","plan","event","replan","feedback","learn","report"].includes(s.screen)
  ||!Number.isInteger(s.idx)||s.idx<0||s.idx>=CASES.length||!Array.isArray(s.rounds)||s.rounds.length>CASES.length
  ||!Number.isInteger(s.hints)||s.hints<0||s.hints>3)return false;
 if(!s.current)return s.screen==="intro"||s.screen==="report";
 const c=CASES[s.idx];
 return s.current.id===c.id&&validPlan(c,s.current.pre?.plan,false)&&
   (!s.current.post||validPlan(c,s.current.post.plan,true));
}
