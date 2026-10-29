"use strict";
export const VERSION="qx-paint-v2-20261029";
export const WIDTH=960,HEIGHT=600;
export const WORK_KEYS=["practice","baseline","reviseApple","transfer","revisePear"];
export const PHASES=[
 {id:"practice",label:"画笔练习",number:0,subject:"自由练笔",img:"A_苹果_冷调左光.jpg",
  short:"先画几笔，熟悉颜色、笔刷、撤回与触屏操作。练习不计入作品变化比较。",
  goal:"尝试画线条、阴影和轮廓。练习可以直接跳过。",kind:"practice"},
 {id:"baseline",label:"第一幅作品",number:1,subject:"苹果与陶瓷瓶 · 冷调光源",img:"A_苹果_冷调左光.jpg",
  short:"根据左侧参考图，自由组织苹果和陶瓷瓶的造型、色彩与构图。",
  goal:"不必临摹得一模一样。先独立完成自己的第一幅静物画。",kind:"original"},
 {id:"reviseApple",label:"光照变化 · 修订",number:2,subject:"同一静物 · 暖调右侧光源",img:"B_苹果_暖调右光.jpg",
  short:"保留上一幅作品的笔画，在新光照条件下直接修改颜色、明暗或局部细节。",
  goal:"这是对原有画作的继续编辑，不是重新开一张空白画布。",kind:"revision",base:"baseline"},
 {id:"transfer",label:"新对象挑战",number:3,subject:"梨与蓝色杯子 · 冷调光源",img:"C_梨与蓝杯_冷调左光.jpg",
  short:"现在换成从未画过的梨与蓝色陶瓷杯，重新创作完整的新静物。",
  goal:"你可以沿用刚才有效的绘画方法，也可以尝试全新构图和色彩。",kind:"original"},
 {id:"revisePear",label:"新对象再修订",number:4,subject:"同一梨与蓝杯 · 暖调右侧光源",img:"D_梨与蓝杯_暖调右光.jpg",
  short:"再观察新的光照方向，对刚才的梨与蓝色杯子作画进行修改。",
  goal:"比较前后两版的颜色、明暗和笔画调整方式。",kind:"revision",base:"transfer"}
];
export const STEPS=["intro","practice","baseline","reviseApple","learning","transfer","revisePear","report"];
export const COLORS=[
 "#ba3b2d","#db8550","#e6b449","#476a48","#498b9b",
 "#41638b","#79649a","#6e4b3a","#252f36","#ffffff"
];
const clone=x=>JSON.parse(JSON.stringify(x));
const isHex=x=>typeof x==="string"&&/^#[0-9a-f]{6}$/i.test(x);
const names={practice:"操作练习",baseline:"原始作品",reviseApple:"暖光修订",transfer:"新静物",revisePear:"新对象修订"};
export function newWork(id,base=null){
 return {id,strokes:base?clone(base.strokes):[],redo:[],note:"",
  startedAt:new Date().toISOString(),finishedAt:null,skipped:false,
  originalStrokes:base?base.strokes.map(s=>s.id):[],
  checks:[],actions:{undo:0,redo:0,clear:0,colors:0,tools:0},
  color:"#ba3b2d",size:12,opacity:1,tool:"brush",guide:false};
}
export function newProject(){
 return {version:VERSION,startedAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
 step:"intro",hints:0,nextId:1,works:{},note:"",completed:false};
}
export function ensureWork(project,key){
 if(!WORK_KEYS.includes(key))throw Error("无效阶段");
 if(!project.works[key]) {
  const p=PHASES.find(x=>x.id===key);
  const base=p.base?project.works[p.base]:null;
  project.works[key]=newWork(key,base||null);
 }
 return project.works[key];
}
export function nextStrokeId(project){
 const n=project.nextId++;return n;
}
export function strokeValid(s){
 return Number.isInteger(s.id)&&s.id>0&&["brush","pencil","marker","eraser"].includes(s.tool)&&
 isHex(s.color)&&Number.isFinite(s.size)&&s.size>=1&&s.size<=80&&Number.isFinite(s.opacity)&&
 s.opacity>=.05&&s.opacity<=1&&Array.isArray(s.points)&&s.points.length>=1&&s.points.length<=2500&&
 s.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&
 p[0]>=0&&p[0]<=WIDTH&&p[1]>=0&&p[1]<=HEIGHT);
}
function workValid(k,w){
 if(!WORK_KEYS.includes(k)||!w||w.id!==k||!Array.isArray(w.strokes)||w.strokes.length>1200||
 !Array.isArray(w.redo)||w.redo.length>1200||!isHex(w.color)||!Number.isFinite(w.size)||
 !["brush","pencil","marker","eraser"].includes(w.tool)||!Array.isArray(w.checks)||
 !Array.isArray(w.originalStrokes)||!w.actions||typeof w.note!=="string"||w.note.length>2500)return false;
 if([...w.strokes,...w.redo].some(s=>!strokeValid(s)))return false;
 if(w.strokes.reduce((sum,s)=>sum+s.points.length,0)>100000)return false;
 if(w.checks.some(x=>!Number.isInteger(x)||x<0||x>3))return false;
 return true;
}
export function safeProject(p){
 if(!p||p.version!==VERSION||!STEPS.includes(p.step)||!Number.isInteger(p.nextId)||
 p.nextId<1||p.nextId>500000||typeof p.hints!=="number"||p.hints<0||p.hints>3||
 !p.works||typeof p.works!=="object")throw Error("不是兼容的潜星绘画项目文件");
 const keys=Object.keys(p.works);
 if(keys.length>5||keys.some(k=>!workValid(k,p.works[k])))throw Error("画笔数据无法通过格式和大小检查");
 if(JSON.stringify(p).length>5_000_000)throw Error("文件超过本版安全处理上限");
 return clone(p);
}
export function appendStroke(work,stroke){
 if(!strokeValid(stroke))throw Error("画笔轨迹无效");
 if(work.strokes.length>=1200)throw Error("当前阶段已达到笔画记录上限");
 work.strokes.push(stroke);work.redo=[];
}
export function undo(work){
 const s=work.strokes.pop();if(!s)return false;
 work.redo.push(s);work.actions.undo++;return true;
}
export function redo(work){
 const s=work.redo.pop();if(!s)return false;
 work.strokes.push(s);work.actions.redo++;return true;
}
export function delta(original,after){
 if(!original||!after)return {added:0,removed:0,changed:false};
 const a=new Set(original.strokes.map(s=>s.id)),b=new Set(after.strokes.map(s=>s.id));
 return {added:[...b].filter(id=>!a.has(id)).length,
  removed:[...a].filter(id=>!b.has(id)).length,
  changed:[...b].some(id=>!a.has(id))||[...a].some(id=>!b.has(id))};
}
function hueGroup(hex){
 const n=parseInt(hex.slice(1),16);const r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;
 const max=Math.max(r,g,b),min=Math.min(r,g,b),diff=max-min;
 if(diff<.11)return max<.22?"深色中性":max>.88?"浅色中性":"中灰";
 let h;
 if(max===r)h=((g-b)/diff)%6;else if(max===g)h=(b-r)/diff+2;else h=(r-g)/diff+4;
 h=(h*60+360)%360;
 return h<18||h>=345?"红":h<48?"橙":h<75?"黄":h<170?"绿":h<205?"青":h<260?"蓝":h<305?"紫":"红紫";
}
export function workStats(w){
 if(!w)return {strokes:0,points:0,colors:[],tools:[],colorFamilies:[],timeSeconds:0,skipped:true};
 const paint=w.strokes.filter(s=>s.tool!=="eraser");
 const colors=[...new Set(paint.map(s=>s.color))];
 return {strokes:w.strokes.length,points:w.strokes.reduce((n,s)=>n+s.points.length,0),
  colors,tools:[...new Set(w.strokes.map(s=>s.tool))],
  colorFamilies:[...new Set(colors.map(hueGroup))],
  timeSeconds:w.startedAt&&w.finishedAt?
   Math.max(0,Math.round((new Date(w.finishedAt)-new Date(w.startedAt))/1000)):0,
  skipped:!!w.skipped,undo:w.actions.undo,redo:w.actions.redo};
}
export function projectSummary(project){
 const w=project.works;
 const a=workStats(w.baseline),b=workStats(w.reviseApple),
 c=workStats(w.transfer),d=workStats(w.revisePear);
 return {works:[a,b,c,d],appleDelta:delta(w.baseline,w.reviseApple),
  pearDelta:delta(w.transfer,w.revisePear),
  completedWorks:["baseline","reviseApple","transfer","revisePear"].filter(k=>w[k]&&!w[k].skipped&&w[k].strokes.length>0).length,
  hints:project.hints};
}
