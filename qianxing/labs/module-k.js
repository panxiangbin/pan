"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const card=(t,b)=>'<div class="cue-box"><b>'+esc(t)+'</b><p>'+esc(b)+'</p></div>';
const guide=x=>190+70*Math.sin((x-35)/650*Math.PI*2);
M[81]={
 heading:"沿曲线移动 · 屏幕精细轨迹挑战",
 goal:"用鼠标、触摸屏或手写笔沿示范曲线移动，观察轨迹偏差，并可以重复尝试。",
 instruction:"从左往右沿蓝色虚线缓慢绘制，不必追求速度。偏差属于本次设备交互，不等于手工技巧。",
 boundary:"屏幕设备、延迟、输入笔压差异很大，不能把它当作真实精密手工天赋测量。",
 hasArt:true,
 init(){return {points:[],attempts:0,showGuide:true,average:null,notes:"与真实折纸、装配或精密手工相比，鼠标操作差异较大。"};},
 stage(s){return '<div class="canvas-wrap"><canvas class="draw" width="720" height="420" aria-label="按曲线描摹的操作画布"></canvas></div>'+
 card("本次轨迹反馈",s.points.length>0?(s.average===null?"正在绘制（可停止指针结束）":"采样平均纵向偏差："+s.average.toFixed(1)+"像素；总尝试 "+s.attempts+" 次。"):"从左向右描一条曲线，可随时重来。");},
 controls(s,H){return '<div class="control-row">'+H.btn("清空重新描摹","clear")+H.btn(s.showGuide?"隐藏参考曲线":"显示参考曲线","guide")+'</div>'+
 H.field("真实手工技能还要核查什么","notes",s.notes,"textarea");},
 afterStage(s,H){const canvas=H.root.querySelector("canvas.draw");if(!canvas)return;
 const ctx=canvas.getContext("2d");if(!ctx)return;
 const draw=()=>{ctx.clearRect(0,0,720,420);ctx.fillStyle="#fff";ctx.fillRect(0,0,720,420);
 ctx.strokeStyle="#edf3f5";ctx.lineWidth=1;for(let x=40;x<720;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,420);ctx.stroke();}
 if(s.showGuide){ctx.strokeStyle="#78b9d2";ctx.lineWidth=5;ctx.setLineDash([9,9]);ctx.beginPath();for(let x=35;x<=685;x+=3){if(x===35)ctx.moveTo(x,guide(x));else ctx.lineTo(x,guide(x));}ctx.stroke();ctx.setLineDash([]);}
 if(s.points.length){ctx.beginPath();ctx.strokeStyle="#e99b42";ctx.lineWidth=7;ctx.lineJoin="round";ctx.lineCap="round";for(let i=0;i<s.points.length;i++){const p=s.points[i];if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}ctx.stroke();}
 ctx.fillStyle="#527d89";ctx.font="16px sans-serif";ctx.fillText("从左到右沿曲线描摹",28,32);};draw();
 let writing=false;const xy=ev=>{const b=canvas.getBoundingClientRect();return{x:(ev.clientX-b.left)*720/b.width,y:(ev.clientY-b.top)*420/b.height};};
 canvas.addEventListener("pointerdown",ev=>{ev.preventDefault();writing=true;s.points=[xy(ev)];s.average=null;canvas.setPointerCapture(ev.pointerId);draw();});
 canvas.addEventListener("pointermove",ev=>{if(!writing)return;ev.preventDefault();s.points.push(xy(ev));draw();});
 const finish=()=>{if(!writing)return;writing=false;s.attempts++;if(s.points.length){const v=s.points.reduce((a,p)=>a+Math.abs(p.y-guide(p.x)),0)/s.points.length;s.average=v;}H.updateStage();};
 canvas.addEventListener("pointerup",finish);canvas.addEventListener("pointercancel",finish);},
 click(a,d,s){if(a==="clear"){s.points=[];s.average=null;}if(a==="guide")s.showGuide=!s.showGuide;},
 status:"偏差是输入轨迹的几何误差，不与人群能力等级比较。"};
const jointNames=["直角拼接","指接拼接","燕尾形示意"];
M[82]={
 heading:"木盒连接 · 选择接头方案",
 goal:"设计一只简单木盒，比较三种接头示意在材料、装配和加工上的不同限制。",
 instruction:"改变盒长、宽、板厚和接头样式，再写出如何检查装配间隙。",
 boundary:"不包含危险电动工具使用指导；真实木工需有操作培训、防护与尺寸复核。",
 hasArt:true,
 init(){return {length:220,width:130,thick:12,joint:1,note:"检查配合尺寸、木材膨胀方向和连接牢靠度。"};},
 stage(s){const w=s.length*.85,h=s.width*.85;
 let teeth="";if(s.joint===1){for(let i=0;i<5;i++)teeth+='<path d="M'+(120+i*42)+' 215 v'+(i%2?12:-12)+'" stroke="#bc915b" stroke-width="4"/>';}
 if(s.joint===2){for(let i=0;i<4;i++)teeth+='<path d="M'+(135+i*50)+' 215 l12 -16 h26 l12 16" stroke="#bc915b" stroke-width="3" fill="none"/>';}
 const pic='<svg class="art-export" viewBox="0 0 660 380" xmlns="http://www.w3.org/2000/svg"><rect width="660" height="380" fill="#edf8fa"/>'+
 '<path d="M105 105 L'+(105+w)+' 105 L'+(135+w)+' 155 L135 155 Z" fill="#f6d5a7" stroke="#a27b54" stroke-width="3"/>'+
 '<path d="M135 155 L'+(135+w)+' 155 V'+(155+h)+' H135 Z" fill="#d9b27e" stroke="#97714c" stroke-width="3"/>'+
 '<path d="M'+(135+w)+' 155 L'+(105+w)+' 105 V'+(105+h)+' L'+(135+w)+' '+(155+h)+'Z" fill="#b88957" stroke="#8c694c" stroke-width="3"/>'+teeth+
 '<text x="330" y="345" text-anchor="middle" font-size="16" fill="#496f7b">接头：'+jointNames[s.joint]+' · 板厚 '+s.thick+'mm</text></svg>';
 return '<div class="stage-frame"><div class="section-label">WOOD JOINT DESIGN / CONCEPT</div><div class="artboard">'+pic+'</div>'+
 card("外形尺寸",s.length+" × "+s.width+" mm，板厚"+s.thick+" mm；接头形状为沟通示意，非真实加工刀路。")+'</div>';},
 controls(s,H){return H.field("木盒长度","length",s.length,"range",{min:120,max:340,step:10,unit:"mm"})+
 H.field("木盒宽度","width",s.width,"range",{min:80,max:220,step:10,unit:"mm"})+
 H.field("板材厚度","thick",s.thick,"range",{min:6,max:24,step:2,unit:"mm"})+
 H.field("连接方式","joint",s.joint,"select",jointNames.map((x,i)=>[i,x]))+
 H.field("实际装配要核查什么","note",s.note,"textarea");},
 status:"不能据此判断连接强度或据SVG直接加工。"};
M[83]={
 heading:"两人份蔬菜炒饭 · 配比与替代",
 goal:"改变人数并调整食材，制作一份材料清楚、可以核对过敏原的食谱。",
 instruction:"调整份数、蔬菜比例和调味选择，观察每项食材所需的数量。",
 boundary:"普通食谱创作示范；饮食禁忌、过敏原和食品安全需要自行查证，不能由网页保证。",
 init(){return {people:2,veg:100,soy:false,notes:"若添加酱油需核对大豆、小麦及标签中的过敏原信息。"};},
 stage(s){const rice=150*s.people,vegs=Math.round(100*s.people*s.veg/100),oil=8*s.people;
 return '<div class="stage-frame"><div class="section-label">RECIPE / PORTION SCALING</div><div class="metric-grid"><div><b>'+rice+'g</b><small>已熟米饭（示例）</small></div><div><b>'+vegs+'g</b><small>蔬菜</small></div><div><b>'+oil+'g</b><small>植物油（示例）</small></div></div>'+
 '<div class="cue-box"><b>'+s.people+'人份蔬菜炒饭</b><p>准备熟米饭和切好的蔬菜，在适合食材的安全烹饪条件下制作，调味适量。'+(s.soy?" 已选择添加酱油，核对标签过敏原。":" 未选择酱油调味。")+'</p></div></div>';},
 controls(s,H){return H.field("用餐人数","people",s.people,"range",{min:1,max:6,step:1,unit:"人"})+
 H.field("蔬菜量相对示范比例","veg",s.veg,"range",{min:50,max:180,step:10,unit:"%"})+
 '<div class="control-row">'+H.btn(s.soy?"不加酱油":"加入酱油","soy")+'</div>'+
 H.field("食品安全与口味限制","notes",s.notes,"textarea");},
 click(a,d,s){if(a==="soy")s.soy=!s.soy;},
 status:"比例示意不能取代营养评估，实际食材需符合个人情况。"};
const weeks=["准备种植","观察发芽","管理生长","回顾与复种"];
M[84]={
 heading:"阳台园艺 · 四周行动计划",
 goal:"设计适合具体植物的观察、浇水和记录安排，跟踪周次变化。",
 instruction:"点击不同周次，修改预计的园艺任务。现实植物生长与光照、品种、季节有关。",
 boundary:"没有访问真实植物与传感器，不能由文字规划评估园艺实际技能。",
 init(){return {week:0,plan:["确认植物品种、容器排水和光照条件","记录是否发芽，不随意追加过量浇水","观察叶片与生长速度，核查虫害","回顾变化，并决定是否需要调整条件"],sun:5,water:2,notes:"每次记录实际日期和环境，不能仅看周计划判断植物健康。"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">GARDENING / FOUR-WEEK PLAN</div>'+
 '<div class="act-grid">'+weeks.map((w,i)=>'<button class="act-card'+(s.week===i?" active":"")+'" data-act="week" data-idx="'+i+'"><small>第'+(i+1)+'周</small><b>'+w+'</b><span>'+esc(s.plan[i])+'</span></button>').join('')+'</div>'+
 card("当前条件记录","计划日照"+s.sun+"小时/天；预设每周浇水检查"+s.water+"次。真实浇水量应按土壤和植物状况决定。")+'</div>';},
 controls(s,H){return H.field("当前周计划","weekPlan",s.plan[s.week],"textarea")+
 H.field("计划光照","sun",s.sun,"range",{min:1,max:10,step:1,unit:"小时/天"})+
 H.field("每周观察土壤湿度次数","water",s.water,"range",{min:0,max:7,step:1,unit:"次"})+
 H.field("实际观察与注意","notes",s.notes,"textarea");},
 change(k,v,s){if(k==="weekPlan")s.plan[s.week]=v;},
 input(k,v,s){this.change(k,v,s);},
 click(a,d,s){if(a==="week")s.week=Number(d.idx);},
 status:"真实种植需在安全现实环境中完成，文本规划不是能力结果。"};
const damage=["表面轻微划痕","固定连接松动","未知材质变色"];
M[85]={
 heading:"旧木盒修复 · 先辨认风险再行动",
 goal:"选择可见损伤类型，区分清洁、记录、检修或暂停操作的不同方向。",
 instruction:"先检查材料与损伤来源，避免直接使用未知化学清洗剂或危险工具。",
 boundary:"这不是古董、精密电子或危险设施的专业修复指导；未知情况交由合格人员评估。",
 init(){return {damage:0,step:0,checked:[true,false,false],notes:"先拍照记录原状，确认材料，再决定是否需要修复。"};},
 stage(s){const steps=["记录外观","核对材料","选择安全方式","复查结果"];
 const tips=[
 ["在光线充足处记录划痕范围。","判断是否只是表层痕迹，避免过度处理。"],
 ["检查是否有明显晃动或缺件。","不拆卸承重/带电设备，必要时咨询人员。"],
 ["确认是否因老化或环境因素变化。","不随意接触未知物质或使用强溶剂。"]
 ];
 return '<div class="stage-frame"><div class="section-label">RESTORATION / NO UNSAFE REPAIR</div>'+
 '<div class="cue-box"><b>当前假设损伤</b><p>'+damage[s.damage]+'</p></div>'+
 '<div class="options-grid">'+steps.map((t,i)=>'<button class="option-tile'+(s.step===i?' selected':'')+'" data-act="step" data-idx="'+i+'">'+(i+1)+'. '+t+'</button>').join('')+'</div>'+
 card("检查重点",tips[s.damage][s.step%2])+'</div>';},
 controls(s,H){return H.field("观察到的损伤类型","damage",s.damage,"select",damage.map((x,i)=>[i,x]))+
 H.field("修复前应核查的信息","notes",s.notes,"textarea");},
 click(a,d,s){if(a==="step")s.step=Number(d.idx);},
 status:"网页只教记录与风险识别，不要求直接拆卸或修复真实设备。"};
M[86]={
 heading:"刺绣纹样 · 12×12针脚图案",
 goal:"在像素绣格上亲自选色并放置针脚，设计可以保存为SVG的纹样。",
 instruction:"选颜色后逐格点选，用相同色块构建传统或原创纹样。真实针线操作需线下尝试。",
 boundary:"图案设计不能测试真实刺绣手眼协调与工艺水平；线下工具使用注意安全。",
 hasArt:true,
 init(){return {cells:Array(144).fill(0),color:1,note:"真实刺绣需考虑布料经纬、针法和线材。"};},
 stage(s){const colors=["#ffffff","#cf7055","#358b8c","#dfac4f","#6b78ad","#57764e"];
 let svg='<svg class="art-export" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 460"><rect width="460" height="460" fill="#f5fbfa"/>';
 s.cells.forEach((v,i)=>{const x=21+i%12*34.8,y=21+Math.floor(i/12)*34.8;svg+='<rect data-act="stitch" data-idx="'+i+'" x="'+x+'" y="'+y+'" width="31" height="31" rx="3" fill="'+colors[v]+'" stroke="#afcfd0" stroke-width="1" style="cursor:pointer"/>';});
 svg+='</svg>';
 return '<div class="stage-frame"><div class="section-label">EMBROIDERY / 12×12 GRID</div><div class="artboard">'+svg+'</div>'+
 card("纹样进展","已填色"+s.cells.filter(Boolean).length+"格。可用对称、重复和留白组织设计。")+'</div>';},
 controls(s,H){return H.field("使用线色","color",s.color,"select",[["0","白色（擦除）"],["1","红褐"],["2","深青"],["3","金黄"],["4","蓝紫"],["5","苔绿"]])+
 '<div class="control-row">'+H.btn("做十字对称示例","symmetry")+H.btn("清空纹样","clear")+'</div>'+
 H.field("实际刺绣需要核实的条件","note",s.note,"textarea");},
 click(a,d,s){if(a==="stitch")s.cells[Number(d.idx)]=s.color;if(a==="clear")s.cells=Array(144).fill(0);
 if(a==="symmetry"){s.cells=Array(144).fill(0);for(let y=1;y<11;y++)for(let x=1;x<11;x++)if(Math.abs(x-5.5)+Math.abs(y-5.5)<5.5)s.cells[y*12+x]=s.color;}},
 status:"保存的SVG是针脚位置草图，不直接等于缝制完成的作品。"};
M[87]={
 heading:"自然观察卡 · 标本信息的可信记录",
 goal:"为一片已自然掉落的叶片设计观察信息卡，记录日期、来源和物种不确定性。",
 instruction:"修改记录卡里的标签和观察文字，学习不把猜测物种写成已核实事实。",
 boundary:"鼓励非破坏性观察，遵守当地采集规定；不采集受保护物种，不从网页鉴定真实植物。",
 hasArt:true,
 init(){return {label:"林地落叶观察卡",date:"2026-10-27",place:"公园步道（示例）",species:"未知阔叶植物",certainty:25,note:"仅观察掉落叶片，不采摘，不声称完成物种鉴定。"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">NATURE SPECIMEN RECORD / ETHICAL OBSERVATION</div>'+
 '<div class="artboard"><svg class="art-export" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 435"><rect width="640" height="435" fill="#fbf8eb"/>'+
 '<path d="M210 327 Q114 154 300 61 Q482 152 302 334 Q268 347 210 327Z" fill="#a5bc73" stroke="#687f54" stroke-width="6"/>'+
 '<path d="M304 332 L305 58 M300 285 L221 191 M300 237 L398 148 M302 162 L259 118" fill="none" stroke="#698659" stroke-width="4"/>'+
 '<text x="44" y="31" fill="#557b70" font-size="16">'+esc(s.label)+'</text>'+
 '<text x="395" y="260" fill="#42675c" font-size="18">日期 '+esc(s.date)+'</text>'+
 '<text x="395" y="290" fill="#42675c" font-size="16">'+esc(s.species)+'</text>'+
 '<text x="395" y="322" fill="#42675c" font-size="14">'+esc(s.place)+'</text>'+
 '<text x="320" y="408" text-anchor="middle" fill="#77958b" font-size="14">图像只是原创植物示意，不代表真实种类</text></svg></div>'+
 card("记录把握",s.certainty+"% 为自填主观把握，并非自动物种鉴定概率。")+'</div>';},
 controls(s,H){return H.field("记录卡名称","label",s.label,"text")+
 H.field("观察日期","date",s.date,"text")+H.field("观察地点说明（可不写准确地点）","place",s.place,"text")+
 H.field("未核实的种类描述","species",s.species,"text")+
 H.field("你对描述的主观把握","certainty",s.certainty,"range",{min:0,max:100,step:5,unit:"%"})+
 H.field("合法观察与事实说明","note",s.note,"textarea");},
 status:"可以导出卡片SVG用于个人作品，不收集自动定位信息。"};
})(window.QX_MODULES);