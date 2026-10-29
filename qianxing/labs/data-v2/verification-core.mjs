"use strict";
// 数值复核严格来自本次可见的分子/分母，不将计算速度或笔记长度等同于天赋。
import {DAYS,forDay} from "./data-core.mjs?v=20261029data21";
export const AUDIT_VERSION="v2.1";
const row=(rows,day,g="all")=>forDay(rows,day,g);
const numeric=(v,unit,tolerance=0.12)=>({expected:Number(v),unit,tolerance});
export function createVerification(c,rows,focus){
 if(!c||!Array.isArray(rows)||rows.length!==28)throw Error("invalid verification inputs");
 const day=DAYS.includes(focus)?focus:(c.id==="weekends"?"09-06":"09-07");
 const a=row(rows,day,"0"),b=row(rows,day,"1"),total=row(rows,day);
 if(!a||!b||!total)throw Error("missing verification date");
 let task={kind:"numeric",day,caseId:c.id};
 switch(c.id){
  case "duplicate":
   task={...task,question:"9月"+day.slice(3)+"日，"+c.groups[0]+"的原始导入行数比独立后台订单数多多少行？",
    explanation:"核对同一天、同分组、相同口径的两个来源：原始行数减去参考订单数。",
    ...numeric(a.total-a.reference,"行",0)};break;
  case "carrier":
   task={...task,question:"9月"+day.slice(3)+"日，"+c.groups[1]+"的晚到率是多少？晚到件数÷送达件数×100，保留1位小数。",
    explanation:"须使用同一分组同一天的分子与分母，保留一位小数。",
    ...numeric(b.total?b.hits/b.total*100:0,"%",0.06)};break;
  case "small":
   task={...task,question:"9月"+day.slice(3)+"日，"+c.groups[1]+"实际访客是多少人？请填写分母而不是成交率。",
    explanation:"小样本高比例不能直接代表稳定表现，先确认人数分母。",
    ...numeric(b.total,"人",0)};break;
  case "mix":
   task={...task,question:"9月"+day.slice(3)+"日，两个渠道合并后的签约率为多少？总签约数÷总咨询数×100，保留1位小数。",
    explanation:"总体比例需按分子总和÷分母总和计算，不能直接平均分组百分比。",
    ...numeric(total.total?total.hits/total.total*100:0,"%",0.06)};break;
  case "units":
   task={...task,question:"9月"+day.slice(3)+"日，"+c.groups[1]+"发出的高温告警率为多少？保留1位小数。",
    explanation:"先计算高温告警数÷测温次数×100；高比例不等于真实超温。",
    ...numeric(b.total?b.hits/b.total*100:0,"%",0.06)};break;
  case "weekends":{
   const x=row(rows,"09-06"),y=row(rows,"09-13");
   task={...task,question:"对照9月6日与9月13日两个周末，两天总访问次数的绝对差值是多少？",
    explanation:"应以相同星期的流量比较，区分季节性与真正的新异常。",
    ...numeric(Math.abs(x.total-y.total),"次",0)};break;
  }
  case "lag":
   task={...task,question:"9月"+day.slice(3)+"日，日报入库行数比上游业务系统任务数少多少行？",
    explanation:"以同一天上游参考数减去报表写入数；还要核查数据到达时间。",
    ...numeric(total.reference-total.total,"行",0)};break;
  case "returns":
   task={...task,question:"9月"+day.slice(3)+"日，"+c.groups[1]+"的退货率是多少？保留1位小数。",
    explanation:"退货件数÷发货件数×100。通过批次对比核实异常范围。",
    ...numeric(b.total?b.hits/b.total*100:0,"%",0.06)};break;
  case "alarms":
   task={...task,question:"9月"+day.slice(3)+"日，"+c.groups[0]+"的告警率是多少？保留1位小数。",
    explanation:"告警次数÷有效采样数×100；仍需独立核对阈值变化。",
    ...numeric(a.total?a.hits/a.total*100:0,"%",0.06)};break;
  default:throw Error("unsupported case "+c.id);
 }
 task.expected=Number(task.expected.toFixed(task.unit==="%"?1:0));
 return Object.freeze(task);
}
export function evaluateVerification(task,input,skipped=false){
 if(skipped||input===null||input===undefined||String(input).trim()===""){
  return {skipped:true,input:"",correct:false,difference:null,expected:task.expected,unit:task.unit};
 }
 const value=Number(String(input).trim().replace("%","").replace(",",""));
 const valid=Number.isFinite(value)&&Math.abs(value)<=1e9,difference=valid?Math.abs(value-task.expected):null;
 return {skipped:false,input:String(input).slice(0,50),correct:valid&&difference<=task.tolerance,
  difference,expected:task.expected,unit:task.unit};
}
