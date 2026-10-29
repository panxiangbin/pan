"use strict";
import {WIDTH,HEIGHT,appendStroke,nextStrokeId} from "./paint-core.mjs";
const conf=stroke=>{
 const eraser=stroke.tool==="eraser";
 return {
  color:eraser?"#ffffff":stroke.color,
  width:stroke.tool==="pencil"?Math.max(1,stroke.size*.38):stroke.tool==="marker"?stroke.size*1.6:
     eraser?stroke.size*1.75:stroke.size,
  opacity:eraser?1:stroke.tool==="pencil"?Math.min(.82,stroke.opacity):stroke.tool==="marker"?
     Math.min(.33,stroke.opacity*.34):stroke.opacity
 };
};
export function drawStroke(ctx,s){
 const pts=s.points;if(!pts?.length)return;
 const c=conf(s);
 ctx.save();ctx.globalAlpha=c.opacity;ctx.strokeStyle=c.color;ctx.fillStyle=c.color;
 ctx.lineWidth=c.width;ctx.lineJoin="round";ctx.lineCap="round";
 if(pts.length===1){
  ctx.beginPath();ctx.arc(pts[0][0],pts[0][1],Math.max(.5,c.width/2),0,Math.PI*2);ctx.fill();
 }else{
  ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);
  ctx.stroke();
 }
 ctx.restore();
}
export function drawWork(canvas,w){
 canvas.width=WIDTH;canvas.height=HEIGHT;
 const ctx=canvas.getContext("2d",{alpha:false});
 ctx.fillStyle="#fff";ctx.fillRect(0,0,WIDTH,HEIGHT);
 for(const s of w?.strokes||[])drawStroke(ctx,s);
 return ctx;
}
export function createRenderedCanvas(work){
 const canvas=document.createElement("canvas");
 drawWork(canvas,work);return canvas;
}
export function workPNG(work){
 const canvas=createRenderedCanvas(work);
 return new Promise((resolve,reject)=>{
  canvas.toBlob(blob=>blob?resolve(blob):reject(Error("无法导出PNG")),"image/png");
 });
}
export class Painter{
 constructor(canvas,project,getWork,handlers={}){
  this.canvas=canvas;this.project=project;this.getWork=getWork;this.handlers=handlers;
  this.active=null;this.pointerId=null;this.ctx=drawWork(canvas,getWork());
  this.down=e=>this.onDown(e);this.move=e=>this.onMove(e);
  this.up=e=>this.onUp(e);this.cancel=e=>this.onUp(e);
  canvas.addEventListener("pointerdown",this.down);
  canvas.addEventListener("pointermove",this.move);
  canvas.addEventListener("pointerup",this.up);
  canvas.addEventListener("pointercancel",this.cancel);
  canvas.addEventListener("lostpointercapture",this.cancel);
 }
 point(e){
  const box=this.canvas.getBoundingClientRect();
  const x=Math.max(0,Math.min(WIDTH,(e.clientX-box.left)*WIDTH/box.width));
  const y=Math.max(0,Math.min(HEIGHT,(e.clientY-box.top)*HEIGHT/box.height));
  return [Math.round(x*10)/10,Math.round(y*10)/10];
 }
 onDown(e){
  if(this.active||e.button!==0||!this.canvas.isConnected)return;
  e.preventDefault();
  const w=this.getWork(),p=this.point(e);
  const stroke={id:nextStrokeId(this.project),tool:w.tool,color:w.color,size:w.size,
   opacity:w.opacity,points:[p]};
  this.active=stroke;this.pointerId=e.pointerId;
  try{this.canvas.setPointerCapture(e.pointerId)}catch(_){}
  drawStroke(this.ctx,stroke);
 }
 onMove(e){
  if(!this.active||e.pointerId!==this.pointerId)return;
  e.preventDefault();
  const p=this.point(e),arr=this.active.points,last=arr[arr.length-1];
  if(Math.hypot(p[0]-last[0],p[1]-last[1])<.75)return;
  if(arr.length>=2500){this.onUp(e);return;}
  arr.push(p);
  const c=conf(this.active);
  this.ctx.save();this.ctx.strokeStyle=c.color;this.ctx.globalAlpha=c.opacity;
  this.ctx.lineWidth=c.width;this.ctx.lineCap="round";this.ctx.lineJoin="round";
  this.ctx.beginPath();this.ctx.moveTo(last[0],last[1]);this.ctx.lineTo(p[0],p[1]);this.ctx.stroke();
  this.ctx.restore();
 }
 onUp(e){
  if(!this.active||e.pointerId!==this.pointerId)return;
  const stroke=this.active;this.active=null;this.pointerId=null;
  try{if(this.canvas.hasPointerCapture(e.pointerId))this.canvas.releasePointerCapture(e.pointerId)}catch(_){}
  try{
   appendStroke(this.getWork(),stroke);
   this.draw();
   this.handlers.onCommit?.(stroke);
  }catch(err){
   this.draw();
   this.handlers.onError?.(err.message);
  }
 }
 draw(){this.ctx=drawWork(this.canvas,this.getWork());}
 dispose(){
  this.active=null;
  this.canvas.removeEventListener("pointerdown",this.down);
  this.canvas.removeEventListener("pointermove",this.move);
  this.canvas.removeEventListener("pointerup",this.up);
  this.canvas.removeEventListener("pointercancel",this.cancel);
  this.canvas.removeEventListener("lostpointercapture",this.cancel);
 }
}
