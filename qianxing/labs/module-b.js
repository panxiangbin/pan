"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const colorOptions=[["#1b817d","深青绿"],["#e6b15c","温暖金"],["#cf6756","陶土红"],["#4776a5","灰蓝"],["#7b6599","烟紫"],["#273d52","深灰"]];
function scene9(s){
 const backgrounds={warm:["#fff3da","#d6ecf2","#d8af83"],blue:["#dceaf9","#c8e1f2","#8ab0cd"],dark:["#36475d","#667993","#405166"]};
 const col=backgrounds[s.background]||backgrounds.warm;
 const lightX=360+(s.light/120)*260,lightY=33;
 const cupX=180+(s.position/100)*360,bright=s.exposure/100;
 const shadow=-(s.light/120)*100;
 return '<svg class="art-export" viewBox="0 0 720 455" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="曝光和光位可调的玻璃杯静物"><defs>'+
 '<linearGradient id="photobg" x2="0" y2="1"><stop stop-color="'+col[0]+'"/><stop offset=".7" stop-color="'+col[1]+'"/><stop offset="1" stop-color="'+col[2]+'"/></linearGradient>'+
 '<linearGradient id="glass" x2="1" y2="0"><stop stop-color="#ffffff" stop-opacity=".68"/><stop offset=".35" stop-color="#9ad6e1" stop-opacity=".13"/><stop offset=".75" stop-color="#e7faff" stop-opacity=".18"/><stop offset="1" stop-color="#ffffff" stop-opacity=".8"/></linearGradient>'+
 '<radialGradient id="light"><stop stop-color="#fff9c7" stop-opacity=".85"/><stop offset="1" stop-color="#fff9c7" stop-opacity="0"/></radialGradient></defs>'+
 '<rect width="720" height="455" fill="url(#photobg)"/><circle cx="'+lightX+'" cy="'+lightY+'" r="185" fill="url(#light)" opacity="'+(bright*.9)+'"/>'+
 '<path d="M0 335 H720 V455 H0Z" fill="'+col[2]+'" opacity=".45"/>'+
 '<path d="M0 338 H720" stroke="#fff" stroke-opacity=".8" stroke-width="3"/>'+
 '<ellipse cx="'+(cupX+shadow)+'" cy="377" rx="'+(96+Math.abs(shadow)*.25)+'" ry="21" fill="#193f57" opacity="'+(.14+.17*(120-s.exposure)/100)+'"/>'+
 '<ellipse cx="'+cupX+'" cy="373" rx="75" ry="14" fill="#ddf6f8" opacity=".56"/>'+
 '<path d="M'+(cupX-63)+' 198 L'+(cupX-53)+' 361 Q'+cupX+' 378 '+(cupX+53)+' 361 L'+(cupX+63)+' 198Z" fill="url(#glass)" stroke="#e9faff" stroke-width="6" stroke-opacity=".85"/>'+
 '<ellipse cx="'+cupX+'" cy="198" rx="63" ry="16" fill="#f0fcff" opacity=".39" stroke="#ffffff" stroke-width="5"/>'+
 '<path d="M'+(cupX-53)+' 259 Q'+cupX+' 276 '+(cupX+53)+' 259 V352 Q'+cupX+' 372 '+(cupX-53)+' 352Z" fill="#a1e2e7" opacity="'+(.28+.11*bright)+'"/>'+
 '<path d="M'+(cupX-31)+' 216 l8 128" stroke="white" stroke-width="10" stroke-linecap="round" opacity=".68"/>'+
 '<path d="M'+(cupX+43)+' 215 l-5 132" stroke="white" stroke-width="4" opacity=".52"/>'+
 '<circle cx="'+lightX+'" cy="'+lightY+'" r="16" fill="#fff4af" opacity=".85"/>'+
 '<path d="M'+lightX+' '+(lightY+20)+' L'+(cupX-40)+' 210 L'+(cupX+40)+' 210 Z" fill="#fff8d9" opacity="'+(.04+bright*.05)+'"/>'+
 '<rect width="720" height="455" fill="'+(s.exposure>=100?"#ffffff":"#142e56")+'" opacity="'+(s.exposure>=100?(s.exposure-100)*.006:(100-s.exposure)*.007)+'"/>'+
 '<text x="25" y="32" fill="#476b80" font-size="14" font-weight="700">LIGHT STUDIO · 模拟静物摄影</text>'+
 '<text x="25" y="429" fill="#3f596e" font-size="13">光位 '+s.light+'° | 曝光 '+s.exposure+'% | 主体位置 '+s.position+'%</text></svg>';
}
M[9]={
 heading:"一只玻璃杯，三种光影效果",goal:"实时改变光位与画面明暗，看清玻璃杯如何产生轮廓、反光和影子。",
 instruction:"拖动光位、曝光与构图滑杆。试试逆光时主体边缘怎样变亮，背景色如何改变整体气氛。",
 boundary:"画面为可调参数的矢量光影示意，不能代替真实摄影设备的测光、焦深或光学模拟。",
 hasArt:true,
 init(){return {light:-65,exposure:92,position:50,background:"warm"};},
 stage(s){return '<div class="artboard">'+scene9(s)+'</div><p class="canvas-caption">这是单一场景，随调整动态变化。可导出 SVG 继续设计。</p>';},
 controls(s,H){return H.field("主光位置","light",s.light,"range",{min:-120,max:120,step:5,unit:"度"})+
 H.field("画面曝光","exposure",s.exposure,"range",{min:55,max:135,step:5,unit:"%"})+
 H.field("主体横向位置","position",s.position,"range",{min:20,max:80,step:5,unit:"%"})+
 H.field("背景基调","background",s.background,"select",[["warm","暖色黄昏"],["blue","冷色清晨"],["dark","深色影棚"]])+
 '<div class="control-row">'+H.btn("侧光摄影","side")+H.btn("逆光摄影","back")+H.btn("恢复初始","reset")+'</div>';},
 click(act,d,s){if(act==="side"){s.light=-65;s.exposure=92;s.position=50;s.background="warm";}
 if(act==="back"){s.light=110;s.exposure=120;s.position=50;s.background="dark";}
 if(act==="reset"){s.light=-65;s.exposure=92;s.position=50;s.background="warm";}},
 status:"调整后，玻璃杯画面即时更新。"};
function storyboardShot(item,i,active){
 const sizes={"远景":.57,"中景":.78,"近景":1.1,"特写":1.65};
 const scale=sizes[item.type]||1;
 const images={雨夜:"☂",下车:"🚶",落信:"✉",看见:"◉",拾起:"✉",转折:"✦"};
 return '<button type="button" data-act="pickshot" data-idx="'+i+'" class="shot'+(active?" active":"")+'">'+
 '<div class="picture"><span style="font-size:'+Math.round(41*scale)+'px;line-height:1">'+(images[item.action]||"◆")+'</span></div>'+
 '<div class="desc"><b>'+String(i+1).padStart(2,"0")+' · '+esc(item.type)+'</b><span>'+esc(item.action)+'</span></div></button>';
}
const shotDefaults=[
{type:"远景",action:"雨夜",note:"建立车站位置和天气"},
{type:"中景",action:"下车",note:"人物进入画面"},
{type:"近景",action:"落信",note:"一封信从袋口滑落"},
{type:"中景",action:"看见",note:"另一人注意到信"},
{type:"特写",action:"拾起",note:"指尖触碰信封"},
{type:"近景",action:"转折",note:"信封上出现陌生名字"}];
M[10]={
 heading:"雨夜拾信 · 6镜头可编辑分镜",goal:"选择镜头景别，修改行为与镜头目的，并调整镜头顺序。",
 instruction:"先点击一个镜头卡，再调整景别与情节说明。使用箭头交换镜头；反复比较叙事节奏。",
 boundary:"示意帧不包含实际影视取景或完整演员表现；分镜连贯性需要拍摄或动画进一步验证。",
 hasArt:false,
 init(){return {selected:0,shots:JSON.parse(JSON.stringify(shotDefaults))};},
 stage(s){return '<div class="stage-frame"><div class="section-label">STORYBOARD / SIX FRAMES</div><div class="story-grid">'+s.shots.map((shot,i)=>storyboardShot(shot,i,i===s.selected)).join('')+'</div></div>'+
 '<div class="cue-box"><b>当前镜头 #'+(s.selected+1)+' · '+esc(s.shots[s.selected].type)+'</b><p>'+esc(s.shots[s.selected].note)+'</p><p class="hint">点击各帧可以调整镜头信息。分镜卡的图形仅辅助判断景别。</p></div>';},
 controls(s,H){const shot=s.shots[s.selected];
 return H.field("镜头景别","shotType",shot.type,"select",[["远景","远景 / 环境"],["中景","中景 / 关系"],["近景","近景 / 动作"],["特写","特写 / 细节"]])+
 H.field("主要动作","shotAction",shot.action,"select",[["雨夜","雨夜"],["下车","下车"],["落信","信封掉落"],["看见","发现信封"],["拾起","拾起信封"],["转折","线索转折"]])+
 H.field("镜头目的或备注","shotNote",shot.note,"textarea")+
 '<div class="control-row">'+H.btn("镜头左移","moveleft")+H.btn("镜头右移","moveright")+'</div>'+
 '<div class="control-row">'+H.btn("恢复六镜示范","reset")+'</div>';},
 change(key,val,s){const shot=s.shots[s.selected];if(key==="shotType")shot.type=val;if(key==="shotAction")shot.action=val;if(key==="shotNote")shot.note=val;},
 input(key,val,s){this.change(key,val,s);},
 click(act,d,s){if(act==="pickshot")s.selected=Number(d.idx);
 if(act==="moveleft"&&s.selected>0){const j=s.selected;[s.shots[j-1],s.shots[j]]=[s.shots[j],s.shots[j-1]];s.selected--;}
 if(act==="moveright"&&s.selected<5){const j=s.selected;[s.shots[j+1],s.shots[j]]=[s.shots[j],s.shots[j+1]];s.selected++;}
 if(act==="reset"){s.selected=0;s.shots=JSON.parse(JSON.stringify(shotDefaults));}
 },
 status:"编辑过的六个镜头可保存为 JSON，后续能据此制作画面。"};
function posterSvg(s){
 const c=s.color,ink=s.ink,style=s.theme;
 const split=s.title.length>6?[s.title.slice(0,6),s.title.slice(6,12)]:[s.title];
 const pattern=style==="modern"?'<circle cx="300" cy="365" r="210" fill="'+ink+'" opacity=".07"/><circle cx="300" cy="365" r="145" fill="none" stroke="'+ink+'" opacity=".14" stroke-width="17"/>':
 style==="vintage"?'<path d="M24 24 H576 V816 H24Z" fill="none" stroke="'+ink+'" stroke-opacity=".25" stroke-width="5"/><path d="M36 36 H564 V804 H36Z" fill="none" stroke="'+ink+'" stroke-opacity=".14" stroke-width="2"/>':
 '<path d="M0 560 Q230 415 600 570 V840 H0Z" fill="'+ink+'" opacity=".055"/><circle cx="470" cy="230" r="180" fill="'+ink+'" opacity=".07"/>';
 const tspan=split.map((v,i)=>'<tspan x="300" dy="'+(i===0?'0':'87')+'">'+esc(v)+'</tspan>').join('');
 return '<svg class="art-export" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" role="img" aria-label="即时可调的图书交换活动海报"><rect width="600" height="840" fill="'+c+'"/>'+
 pattern+'<circle cx="300" cy="176" r="57" fill="'+ink+'" opacity=".92"/>'+
 '<path d="M265 144 V200 Q300 180 300 210 Q300 180 335 200 V144 Q300 124 300 150 Q300 124 265 144Z" fill="'+c+'" stroke="'+c+'" stroke-width="4"/>'+
 '<text x="300" y="80" text-anchor="middle" fill="'+ink+'" font-size="21" font-weight="700" letter-spacing="5">COMMUNITY EXCHANGE</text>'+
 '<text x="300" y="309" fill="'+ink+'" text-anchor="middle" font-size="'+s.size+'" font-weight="900">'+tspan+'</text>'+
 '<path d="M140 515 H460" stroke="'+ink+'" stroke-width="3" opacity=".65"/>'+
 '<text x="300" y="600" text-anchor="middle" fill="'+ink+'" font-size="40" font-weight="800">'+esc(s.date)+'</text>'+
 '<text x="300" y="656" text-anchor="middle" fill="'+ink+'" font-size="31">'+esc(s.place)+'</text>'+
 '<text x="300" y="744" text-anchor="middle" fill="'+ink+'" font-size="22">'+esc(s.detail)+'</text>'+
 '<text x="300" y="788" text-anchor="middle" fill="'+ink+'" font-size="16" opacity=".68">一起让知识流动 · 无需注册</text></svg>';
}
M[11]={
 heading:"图书交换日 · 在线海报工作台",goal:"改变标题、日期、位置、信息层次和色调，直接生成一张可导出的 SVG 海报。",
 instruction:"修改文字和配色，关注别人能否一眼找到时间、地点和参与方式。",
 boundary:"文字排版工具仅能演示基础视觉层级，字体兼容性与打印色彩需要另行检查。",
 hasArt:true,
 init(){return {title:"社区图书交换日",date:"周六 14:00",place:"社区文化中心",detail:"带一本书 · 换一本好故事",color:"#e7f4e9",ink:"#185e69",theme:"minimal",size:68};},
 stage(s){return '<div class="showcase"><div class="artboard">'+posterSvg(s)+'</div></div>';},
 controls(s,H){return H.field("主标题（建议不超过12字）","title",s.title,"text")+
 H.field("活动时间","date",s.date,"text")+H.field("活动地点","place",s.place,"text")+
 H.field("参与说明","detail",s.detail,"text")+H.field("底色","color",s.color,"color")+
 H.field("主要文字色","ink",s.ink,"color")+
 H.field("设计风格","theme",s.theme,"select",[["minimal","简洁清爽"],["modern","现代几何"],["vintage","复古印刷"]])+
 H.field("主标题字号","size",s.size,"range",{min:40,max:80,step:2,unit:"px"})+
 '<div class="control-row">'+H.btn("恢复海报示范","reset")+'</div>';},
 click(act,d,s){if(act==="reset")Object.assign(s,this.init());},
 status:"可导出可编辑 SVG 矢量海报。"};
const furnitureDefaults=[
{id:"bed",name:"床",x:226,y:38,w:165,h:105,color:"#b8d9ea",rot:0},
{id:"desk",name:"书桌",x:37,y:48,w:120,h:60,color:"#efc88e",rot:0},
{id:"closet",name:"衣柜",x:374,y:205,w:78,h:100,color:"#bfe3b2",rot:0},
{id:"shelf",name:"书架",x:204,y:290,w:95,h:42,color:"#d8c6ef",rot:0}
];
function dims(f){return f.rot%2?[f.h,f.w]:[f.w,f.h];}
function collision(s,index){
 const f=s.furniture[index],[w,h]=dims(f);
 if(f.x<0||f.y<0||f.x+w>480||f.y+h>360)return "家具超出房间边界。";
 if(f.x<170&&f.x+w>55&&f.y<360&&f.y+h>277)return "家具占用了门口附近的建议通道。";
 for(let i=0;i<s.furniture.length;i++){if(i===index)continue;const b=s.furniture[i],[bw,bh]=dims(b);
 if(f.x < b.x+bw && f.x+w>b.x && f.y<b.y+bh && f.y+h>b.y)return "家具之间发生重叠。";}
 return "";
}
function planSvg(s){
 const positions=[];
 let z='<svg xmlns="http://www.w3.org/2000/svg" class="art-export floor-board" viewBox="0 0 560 468" aria-label="可以拖动家具的4米乘3米房间俯视图">'+
 '<rect width="560" height="468" fill="#f3f9fb"/><rect x="40" y="32" width="480" height="360" fill="#fffaf0" stroke="none"/>';
 for(let x=40;x<=520;x+=40)z+='<path class="plan-grid" d="M'+x+' 32 V392"/>';
 for(let y=32;y<=392;y+=40)z+='<path class="plan-grid" d="M40 '+y+' H520"/>';
 z+='<path d="M40 392 V32 H520 V392 H175 M40 392 H95" stroke="#3d5f6b" stroke-width="8" fill="none"/>'+
 '<path d="M95 392 L95 312 M95 392 Q158 391 175 336" fill="none" stroke="#55a19a" stroke-width="3"/>'+
 '<text x="135" y="424" font-size="13" fill="#557c85" text-anchor="middle">房门 0.7m</text>'+
 '<text x="282" y="20" text-anchor="middle" font-size="15" fill="#285b69">4.0 米</text>'+
 '<text x="20" y="215" text-anchor="middle" font-size="14" fill="#285b69" transform="rotate(-90 20 215)">3.0 米</text>';
 s.furniture.forEach((f,i)=>{const [w,h]=dims(f);positions.push([f.x,f.y,w,h]);
 z+='<g class="furn'+(i===s.selected?' selected':'')+'" data-furn="'+i+'">'+
 '<rect x="'+(40+f.x)+'" y="'+(32+f.y)+'" width="'+w+'" height="'+h+'" fill="'+f.color+'" rx="8"/>'+
 '<text x="'+(40+f.x+w/2)+'" y="'+(32+f.y+h/2+5)+'">'+f.name+'</text></g>';});
 return z+'<text x="280" y="455" text-anchor="middle" fill="#627d83" font-size="12">拖动家具，或用右侧方向按钮精确移动（每步20像素）</text></svg>';
}
M[12]={
 heading:"3×4米小屋 · 家具平面布局",goal:"移动、旋转床、书桌、衣柜和书架，避免重叠并给门口留通道。",
 instruction:"点击或拖动家具选中目标，再用方向按钮微调。门在左下方，尽量不要堵住入口。",
 boundary:"这只是布局体验，不提供建筑规范、消防验收或专业空间测量结论。",
 hasArt:true,
 init(){return {furniture:JSON.parse(JSON.stringify(furnitureDefaults)),selected:0,feedback:"可以移动家具，检查碰撞和门口的通道。"};},
 stage(s){return '<div class="plan">'+planSvg(s)+'</div><div class="cue-box"><b>已选择：'+esc(s.furniture[s.selected].name)+'</b><p>'+esc(s.feedback)+'</p></div>';},
 controls(s,H){return H.field("选择家具","selected",s.selected,"select",s.furniture.map((f,i)=>[String(i),f.name]))+
 '<div class="control-row">'+H.btn("↑","up")+H.btn("↓","down")+H.btn("←","left")+H.btn("→","right")+'</div>'+
 '<div class="control-row">'+H.btn("旋转90°","rotate")+H.btn("恢复布置","reset")+'</div>'+
 '<p class="hint">平面图尺寸以4m×3m示意，简单碰撞检查不能替代真实尺寸和门窗安全检查。</p>';},
 click(act,d,s){if(act==="reset"){s.furniture=JSON.parse(JSON.stringify(furnitureDefaults));s.selected=0;s.feedback="已恢复初始布局。";return;}
 const f=s.furniture[s.selected],old={x:f.x,y:f.y,rot:f.rot};
 if(act==="up")f.y-=20;if(act==="down")f.y+=20;if(act==="left")f.x-=20;if(act==="right")f.x+=20;if(act==="rotate")f.rot=(f.rot+1)%2;
 const issue=collision(s,s.selected);
 if(issue){Object.assign(f,old);s.feedback="本次调整已撤回："+issue;}else if(["up","down","left","right","rotate"].includes(act))s.feedback="布局调整成功：当前家具未重叠、未越界，也未进入门口预留区域。";
 },
 afterStage(s,H){
 const svg=H.root.querySelector(".floor-board");if(!svg)return;
 let drag=null;
 const loc=ev=>{const box=svg.getBoundingClientRect();return {x:(ev.clientX-box.left)/box.width*560,y:(ev.clientY-box.top)/box.height*468};};
 svg.addEventListener("pointerdown",ev=>{
   const g=ev.target.closest("[data-furn]");if(!g)return;
   const i=Number(g.dataset.furn);s.selected=i;
   const p=loc(ev),f=s.furniture[i];
   drag={i,x:p.x,y:p.y,oldX:f.x,oldY:f.y,g};
   svg.setPointerCapture(ev.pointerId);
   ev.preventDefault();
 });
 svg.addEventListener("pointermove",ev=>{
   if(!drag)return;
   const p=loc(ev),dx=p.x-drag.x,dy=p.y-drag.y;
   drag.g.setAttribute("transform","translate("+dx+" "+dy+")");
 });
 const end=ev=>{
   if(!drag)return;
   const p=loc(ev),f=s.furniture[drag.i];
   f.x=Math.round((drag.oldX+p.x-drag.x)/10)*10;
   f.y=Math.round((drag.oldY+p.y-drag.y)/10)*10;
   const problem=collision(s,drag.i);
   if(problem){f.x=drag.oldX;f.y=drag.oldY;s.feedback="已撤回拖动："+problem;}
   else s.feedback="拖动成功。当前家具未重叠，门口保持了预留区域。";
   drag=null;H.rerender();
 };
 svg.addEventListener("pointerup",end);svg.addEventListener("pointercancel",end);
 },
 status:"家具可拖动，可用方向按钮调节。"};
function fashionSvg(s){
 const c=s.top,b=s.bottom,a=s.accent;
 let upper='<path d="M250 158 L205 185 L164 278 L196 291 L225 225 L225 332 L377 332 L377 225 L408 291 L438 278 L397 185 L351 158Z" fill="'+c+'" stroke="#3f5361" stroke-width="3"/>';
 if(s.garment==="jacket")upper='<path d="M250 158 L205 184 L157 281 L189 299 L229 227 L226 345 L302 343 L302 176Z" fill="'+c+'" stroke="#3f5361" stroke-width="3"/><path d="M351 158 L397 184 L444 281 L412 299 L372 227 L375 345 L302 343 L302 176Z" fill="'+c+'" stroke="#3f5361" stroke-width="3"/><path d="M272 160 L302 248 L334 160" fill="#f8fafb"/>';
 if(s.garment==="dress")upper='<path d="M255 160 L208 187 L172 276 L204 288 L227 225 L224 305 L175 449 L426 449 L377 305 L376 225 L399 288 L431 276 L394 187 L346 160Z" fill="'+c+'" stroke="#3f5361" stroke-width="3"/>';
 const legs=s.garment!=="dress"?'<path d="M235 329 H369 L365 495 H313 L300 382 L288 495 H239Z" fill="'+b+'" stroke="#3b5263" stroke-width="3"/>':'';
 const scarf=s.scarf?'<path d="M265 170 Q300 205 341 170 L334 186 Q300 219 272 182Z" fill="'+a+'"/><path d="M325 190 L350 284 L330 288 L310 193Z" fill="'+a+'"/>':'';
 const bg=s.occasion==="formal"?"#e9f0f9":s.occasion==="outdoor"?"#dff3e6":"#fff4e5";
 return '<svg class="art-export" viewBox="0 0 600 560" xmlns="http://www.w3.org/2000/svg" aria-label="服饰配色和版型即时搭配图"><rect width="600" height="560" fill="'+bg+'"/>'+
 '<circle cx="300" cy="272" r="235" fill="#fff" opacity=".33"/>'+
 '<ellipse cx="300" cy="522" rx="150" ry="15" fill="#7e9aaa" opacity=".16"/>'+
 '<path d="M252 476 H292 V508 H242 Z M313 476 H350 L360 508 H315 Z" fill="#3a414b"/>'+
 '<path d="M287 148 V171 H319 V148" fill="#efc7ab" stroke="#8a6b59" stroke-width="2"/>'+
 '<ellipse cx="303" cy="99" rx="63" ry="77" fill="#efc7ab" stroke="#8a6b59" stroke-width="2"/>'+
 '<path d="M241 100 Q236 26 298 18 Q367 17 369 100 Q344 58 309 58 Q268 54 241 100" fill="#38404e"/>'+
 legs+upper+scarf+
 '<text x="300" y="541" text-anchor="middle" fill="#527583" font-size="15" font-weight="700">'+(s.occasion==="formal"?"正式场合":s.occasion==="outdoor"?"户外场合":"日常场合")+' · 配色示意</text></svg>';
}
M[13]={
 heading:"三种场合 · 服饰搭配工作台",goal:"通过衣服版型、上装和下装颜色及配饰尝试不同视觉组合。",
 instruction:"先选日常、户外或正式场合，再改变服饰。说明服装是否符合场合、活动方式与实际舒适度。",
 boundary:"服饰搭配是二维色彩图示，不模拟真实人体尺寸、面料力学或穿着安全。",
 hasArt:true,
 init(){return {occasion:"daily",garment:"shirt",top:"#4776a5",bottom:"#273d52",accent:"#cf6756",scarf:false};},
 stage(s){return '<div class="artboard showcase">'+fashionSvg(s)+'</div>';},
 controls(s,H){return H.field("穿着场合","occasion",s.occasion,"select",[["daily","日常休闲"],["formal","正式活动"],["outdoor","户外活动"]])+
 H.field("服饰版型","garment",s.garment,"select",[["shirt","短袖上衣"],["jacket","外套夹克"],["dress","连衣裙"]])+
 H.field("主服装颜色","top",s.top,"color")+H.field("裤装颜色","bottom",s.bottom,"color")+
 H.field("配饰颜色","accent",s.accent,"color")+
 '<div class="control-row">'+H.btn(s.scarf?"去掉围巾":"加上围巾","scarf")+H.btn("正式搭配","formal")+H.btn("恢复初始","reset")+'</div>';},
 click(act,d,s){if(act==="scarf")s.scarf=!s.scarf;
 if(act==="formal"){s.occasion="formal";s.garment="jacket";s.top="#273d52";s.bottom="#273d52";s.accent="#cf6756";s.scarf=true;}
 if(act==="reset")Object.assign(s,this.init());},
 status:"搭配变化会同步显示在模拟服装上。"};
function treeSvg(s){
 const scientific=s.style==="science";
 const bg=scientific?"#f4f9f1":"#fdf4e6",trunk=scientific?"#6e7154":"#92624c";
 const leafColor=s.season==="spring"?["#67b894","#93cea7","#4f9c85"]:["#e1a15a","#d88848","#eac175"];
 let z='<svg class="art-export" viewBox="0 0 720 480" xmlns="http://www.w3.org/2000/svg" aria-label="可修改叶片细节的树木插画"><rect width="720" height="480" fill="'+bg+'"/>';
 if(!scientific)z+='<circle cx="581" cy="94" r="45" fill="#facd75" opacity=".55"/><path d="M0 412 Q200 375 400 409 T720 402 V480 H0Z" fill="#b5d7aa"/>';
 else z+='<path d="M60 58 H660 M60 427 H660" stroke="#bac6b6" stroke-width="2"/><text x="65" y="85" fill="#799080" font-size="13">OBSERVATIONAL STUDY</text>';
 z+='<path d="M350 430 Q335 345 347 256 L313 168 M345 280 Q400 226 425 157 M342 326 Q299 267 263 224" fill="none" stroke="'+trunk+'" stroke-width="'+(scientific?23:31)+'" stroke-linecap="round"/>';
 const n=Math.max(5,Math.round(s.detail/5)+5);
 for(let i=0;i<n;i++){
   const angle=i*2.399963,rad=32+Math.sqrt(i/n)*145,x=348+Math.cos(angle)*rad,y=196+Math.sin(angle)*rad*.69;
   const r=scientific?19:28;
   z+='<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="'+r+'" ry="'+Math.round(r*.64)+'" fill="'+leafColor[i%3]+'" stroke="'+(scientific?"#447e65":"none")+'" stroke-width="'+(scientific?2:0)+'"/>';
   if(scientific&&i%2===0)z+='<path d="M'+(x-14).toFixed(1)+' '+y.toFixed(1)+' L'+(x+14).toFixed(1)+' '+y.toFixed(1)+'" stroke="#518b69" stroke-width="1.5"/>';
 }
 if(scientific)z+='<path d="M468 182 L569 138 H643" fill="none" stroke="#527e68" stroke-width="2"/><text x="570" y="128" fill="#4b7b65" font-size="17">叶片与叶脉</text><path d="M364 335 L515 342 H637" stroke="#527e68" stroke-width="2" fill="none"/><text x="520" y="334" fill="#4b7b65" font-size="17">主干结构</text>';
 else z+='<text x="360" y="447" fill="#835d46" text-anchor="middle" font-size="20">在四季里生长的树</text>';
 return z+'</svg>';
}
M[14]={
 heading:"一棵树 · 绘本与科普插画",goal:"同一主体分别面向儿童故事和观察记录，选择细节密度和季节色彩。",
 instruction:"切换风格与叶片密度，观察信息重点变化。故事插画突出情绪，科普插画强调可观察结构。",
 boundary:"矢量树木是简化示例，不能代替专业植物分类图或真实写生技能评估。",
 hasArt:true,
 init(){return {style:"storybook",season:"spring",detail:65};},
 stage(s){return '<div class="artboard">'+treeSvg(s)+'</div><p class="canvas-caption">'+(s.style==="science"?"科普方向：叶脉与枝干标签强调观察。":"绘本方向：柔和线条与季节氛围强调故事性。")+'</p>';},
 controls(s,H){return H.field("插画用途","style",s.style,"select",[["storybook","儿童绘本插画"],["science","科普观察插画"]])+
 H.field("季节配色","season",s.season,"select",[["spring","春夏绿色"],["autumn","秋季暖色"]])+
 H.field("叶片细节密度","detail",s.detail,"range",{min:10,max:100,step:5,unit:"%"})+
 '<div class="control-row">'+H.btn("绘本示例","storybook")+H.btn("科普示例","science")+H.btn("恢复初始","reset")+'</div>';},
 click(act,d,s){if(act==="storybook"){s.style="storybook";s.detail=70;}
 if(act==="science"){s.style="science";s.detail=85;}
 if(act==="reset")Object.assign(s,this.init());},
 status:"调整插画用途和细节后，可导出 SVG 画面。"};
})(window.QX_MODULES);