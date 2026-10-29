"use strict";
/* 统一探索记录：只保留六个模块的轻量汇总与用户主动输入的反馈。
 * 不读取、保存或上传原始答题、绘画/音视频、设备或身份信息。 */
(function(){
 const KEY="qianxing-shared-progress-v2-20261029",SCHEMA=1,IDS=[2,6,45,52,72,77];
 const allowed=new Set(IDS.map(String)),difficulties=new Set(["","偏简单","合适","偏难"]),clarities=new Set(["","容易理解","有些不清楚"]);
 const num=(x,min,max)=>Number.isFinite(Number(x))?Math.min(max,Math.max(min,Math.floor(Number(x)))):min;
 const now=()=>new Date().toISOString(),stamp=x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}T/.test(x)&&x.length<=42?x:null;
 const str=(x,n)=>typeof x==="string"?x.slice(0,n):"";
 const sum=x=>{const total=num(x?.total,0,120);return {done:num(x?.done,0,total),total,skipped:num(x?.skipped,0,total)};};
 const feedback=x=>({difficulty:difficulties.has(x?.difficulty)?x.difficulty:"",clarity:clarities.has(x?.clarity)?x.clarity:"",note:str(x?.note,240),updatedAt:stamp(x?.updatedAt)});
 const empty=()=>({schema:SCHEMA,updatedAt:null,modules:{}});
 function cleanRecord(id,r){
  if(!r||typeof r!=="object")return null;
  return {id:Number(id),active:!!r.active,startedAt:stamp(r.startedAt),finishedAt:stamp(r.finishedAt),
   completions:num(r.completions,0,100000),lastSession:str(r.lastSession,120),
   summary:sum(r.summary),feedback:feedback(r.feedback)};
 }
 function sanitize(raw){
  if(!raw||typeof raw!=="object"||raw.schema!==SCHEMA||!raw.modules||typeof raw.modules!=="object")
   throw Error("不是兼容的探索记录文件");
  const result=empty();
  for(const id of IDS){const r=cleanRecord(id,raw.modules[id]);if(r)result.modules[id]=r;}
  result.updatedAt=stamp(raw.updatedAt);
  return result;
 }
 function load(){
  try{const raw=localStorage.getItem(KEY);return raw?sanitize(JSON.parse(raw)):empty();}
  catch(e){return empty();}
 }
 function write(data){
  const clean=sanitize(data);clean.updatedAt=now();
  try{localStorage.setItem(KEY,JSON.stringify(clean));return true;}catch(e){return false;}
 }
 const validId=id=>allowed.has(String(id));
 const get=id=>validId(id)?load().modules[String(id)]||null:null;
 const list=()=>load().modules;
 function start(id){
  if(!validId(id))return false;
  const data=load(),key=String(id),r=data.modules[key]||cleanRecord(id,{});
  r.active=true;r.startedAt=now();data.modules[key]=r;
  return write(data);
 }
 function finish(id,token,counts){
  if(!validId(id))return false;
  const data=load(),key=String(id),r=data.modules[key]||cleanRecord(id,{});
  const session=str(String(token||""),120);
  if(r.lastSession!==session||!r.finishedAt){
   r.completions=num(r.completions+1,0,100000);r.lastSession=session;
  }
  r.active=false;r.finishedAt=now();r.summary=sum(counts);
  if(!r.startedAt)r.startedAt=now();
  data.modules[key]=r;return write(data);
 }
 function saveFeedback(id,payload){
  if(!validId(id)||!payload)return false;
  const data=load(),key=String(id),r=data.modules[key]||cleanRecord(id,{});
  r.feedback=feedback({...payload,updatedAt:now()});data.modules[key]=r;return write(data);
 }
 function importData(raw){
  const clean=sanitize(raw);
  if(JSON.stringify(clean).length>28000)throw Error("文件超出限制");
  if(!write(clean))throw Error("浏览器无法保存记录");
  return true;
 }
 function clear(){try{localStorage.removeItem(KEY);return true;}catch(e){return false;}}
 function available(){try{const key=KEY+"-probe";localStorage.setItem(key,"1");localStorage.removeItem(key);return true;}catch(e){return false;}}
 window.QX_PROGRESS=Object.freeze({key:KEY,version:SCHEMA,ids:IDS.slice(),get,list,start,finish,
  saveFeedback,exportData:load,importData,clear,available});
})();
