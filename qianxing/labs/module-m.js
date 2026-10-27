"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const e=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tip=(title,t)=>'<div class="cue-box"><b>'+e(title)+'</b><p>'+e(t)+'</p></div>';
const safety=["了解本人当前适合的活动范围","场地与天气条件安全","有合理的休息与停止安排","如有不适不继续尝试"];
M[96]={
 heading:"耐力活动 · 两周安全记录计划",
 goal:"规划现实中适合自身条件的活动观察表，区分计划、实际完成和身体反应。",
 instruction:"选择一周内愿意记录的活动次数与方式，并写出怎样安全停止。",
 boundary:"网页不测量耐力，也不推荐高强度运动；运动安排需符合实际身体条件，必要时咨询专业人员。",
 init(){return {activities:3,duration:15,checked:[true,false,true,true],method:"低强度散步观察",note:"真实时间和感受以线下为准，不追求冲刺或危险挑战。"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">REAL-WORLD ENDURANCE / PLAN ONLY</div>'+
 '<div class="metric-grid"><div><b>'+s.activities+'次</b><small>每周计划记录次数</small></div><div><b>'+s.duration+'分钟</b><small>每次拟观察时长</small></div><div><b>14天</b><small>观察窗口</small></div></div>'+
 safety.map((t,i)=>'<button class="check-tile'+(s.checked[i]?" checked":"")+'" data-act="check" data-idx="'+i+'"><b>'+(s.checked[i]?"✓":"□")+'</b><span>'+t+'</span></button>').join('')+
 tip("计划活动",s.method)+'</div>';},
 controls(s,H){return H.field("计划活动次数（非强制）","activities",s.activities,"range",{min:0,max:7,step:1,unit:"次/周"})+
 H.field("观察时间（自定）","duration",s.duration,"range",{min:5,max:30,step:5,unit:"分钟"})+
 H.field("安全现实活动说明","method",s.method,"textarea")+
 H.field("线下观察记录","note",s.note,"textarea");},
 click(a,d,s){if(a==="check"){let i=Number(d.idx);s.checked[i]=!s.checked[i];}},
 status:"本项不提供心肺、耐力或体能等级。"};
M[97]={
 heading:"爆发力活动 · 仅规划安全观察",
 goal:"建立线下尝试前的风险检查、动作描述与是否需要专业指导的判断。",
 instruction:"选择要记录的安全条件与停止原因，不要求在网页前完成冲刺、跳跃等动作。",
 boundary:"不提供高强度爆发动作测试或技巧指导，真实能力不能通过这份网页推断。",
 init(){return {safe:[false,false,false,false],context:"尚未安排现实活动",observer:"需合适的专业指导和安全场地",note:"如果身体情况不明确或场地不适宜，应停止。"};},
 stage(s){const items=["活动强度符合个人条件","场地空间不存在绊倒与碰撞风险","知道哪些情况必须停止","具备必要的专业指导或支持"];
 return '<div class="stage-frame"><div class="section-label">EXPLOSIVE MOTION / PREPARATION ONLY</div>'+
 items.map((x,i)=>'<button class="check-tile'+(s.safe[i]?" checked":"")+'" data-act="safe" data-idx="'+i+'"><b>'+(s.safe[i]?"✓":"□")+'</b><span>'+x+'</span></button>').join('')+
 tip("当前状态","已核对"+s.safe.filter(Boolean).length+"项；这不是爆发力成绩。")+'</div>';},
 controls(s,H){return H.field("计划记录的活动（非危险）","context",s.context,"textarea")+
 H.field("安全指导与现场条件","observer",s.observer,"textarea")+
 H.field("停止条件","note",s.note,"textarea");},
 click(a,d,s){if(a==="safe"){let i=Number(d.idx);s.safe[i]=!s.safe[i];}},
 status:"不建议通过无准备的冲刺、腾空或最大力量动作探索能力。"};
M[98]={
 heading:"移动方块到目标 · 设备操作偏差",
 goal:"用鼠标或触摸拖动方块到标记区域，观察一次操作与目标之间的距离。",
 instruction:"在左侧工作台上按住蓝色方块拖动到环形目标中心，然后松手。",
 boundary:"屏幕拖拽受输入设备、灵敏度与浏览器差异影响，不能替代线下真实手眼协调评估。",
 hasArt:true,
 init(){return {x:120,y:240,targetX:460,targetY:135,dist:null,round:0,note:"实际精细操作涉及握持、触觉、速度与材料反馈。"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">POINTER COORDINATION / DRAG TASK</div><div class="artboard">'+
 '<svg class="art-export drag-board" viewBox="0 0 650 350" xmlns="http://www.w3.org/2000/svg" style="touch-action:none"><rect width="650" height="350" fill="#f0f9fb"/>'+
 '<circle cx="'+s.targetX+'" cy="'+s.targetY+'" r="44" fill="#e3f5ea" stroke="#2b9988" stroke-dasharray="7 7" stroke-width="6"/>'+
 '<circle cx="'+s.targetX+'" cy="'+s.targetY+'" r="10" fill="#2b9988"/>'+
 '<rect class="drag-piece" x="'+(s.x-25)+'" y="'+(s.y-25)+'" width="50" height="50" rx="11" fill="#558ac1" stroke="#294f83" stroke-width="4" style="cursor:grab"/>'+
 '<text x="24" y="30" font-size="15" fill="#477e88">拖动蓝色方块至绿色目标中心</text></svg></div>'+
 tip("本次操作",s.dist===null?"尚未松开并完成目标定位。":"松开时距目标约"+s.dist.toFixed(1)+"个画布像素；不与能力常模比较。")+'</div>';},
 controls(s,H){return '<div class="control-row">'+H.btn("重新开始同一位置","reset")+H.btn("更换目标位置","next")+'</div>'+
 H.field("为什么设备影响结果","note",s.note,"textarea");},
 afterStage(s,H){const svg=H.root.querySelector("svg.drag-board");if(!svg)return;const piece=svg.querySelector(".drag-piece");let drag=false;
 const get=ev=>{let r=svg.getBoundingClientRect();return{x:Math.max(26,Math.min(624,(ev.clientX-r.left)*650/r.width)),y:Math.max(26,Math.min(324,(ev.clientY-r.top)*350/r.height))};};
 piece.addEventListener("pointerdown",ev=>{drag=true;svg.setPointerCapture(ev.pointerId);ev.preventDefault();});
 svg.addEventListener("pointermove",ev=>{if(!drag)return;ev.preventDefault();let p=get(ev);s.x=p.x;s.y=p.y;piece.setAttribute("x",p.x-25);piece.setAttribute("y",p.y-25);});
 const finish=()=>{if(!drag)return;drag=false;s.dist=Math.hypot(s.x-s.targetX,s.y-s.targetY);H.updateStage();};
 svg.addEventListener("pointerup",finish);svg.addEventListener("pointercancel",finish);},
 click(a,d,s){if(a==="reset"){s.x=120;s.y=240;s.dist=null;}
 if(a==="next"){s.round++;s.targetX=s.round%2?430:460;s.targetY=s.round%2?260:135;s.x=120;s.y=240;s.dist=null;}},
 status:"给出的是一次拖拽的相对位置偏差，不是通用身体协调能力成绩。"};
M[99]={
 heading:"平衡感 · 非危险现实观察记录",
 goal:"记录安全日常动作时是否遇到环境障碍，避免要求不适宜的高风险平衡挑战。",
 instruction:"只填写平稳、安全的日常观察；不要求闭眼单脚站立、登高或快速旋转。",
 boundary:"本项不测平衡能力，也不适合诊断头晕、跌倒或前庭问题；如有症状应寻求专业医疗建议。",
 init(){return {condition:0,checked:[true,false,true],record:"目前仅作日常活动风险观察，未进行专项平衡测试。"};},
 stage(s){const contexts=["正常光线的平坦地面","空间较拥挤的通行路线","家中常用台阶（不做挑战）"];
 const safety=["地面清洁、无易滑物","有需要时可以扶靠稳固支撑","有不适立即停止"];
 return '<div class="stage-frame"><div class="section-label">BALANCE / SAFETY RECORD ONLY</div>'+
 '<div class="cue-box"><b>当前日常环境</b><p>'+contexts[s.condition]+'</p></div>'+
 safety.map((t,i)=>'<button class="check-tile'+(s.checked[i]?" checked":"")+'" data-act="check" data-idx="'+i+'"><b>'+(s.checked[i]?"✓":"□")+'</b><span>'+t+'</span></button>').join('')+'</div>';},
 controls(s,H){return H.field("观察情境","condition",s.condition,"select",[["0","平坦通道"],["1","拥挤通道"],["2","常用台阶（不挑战）"]])+
 H.field("真实观察或尚未实践","record",s.record,"textarea");},
 click(a,d,s){if(a==="check"){const i=Number(d.idx);s.checked[i]=!s.checked[i];}},
 status:"不通过危险动作判断平衡能力，出现跌倒风险应以安全为先。"};
M[100]={
 heading:"信号变色 · 屏幕反应时间体验",
 goal:"随机等待后屏幕出现绿灯，用户点击结束，记录一次相对延迟。",
 instruction:"点“准备开始”，等待提示变绿后尽快按“看到绿灯，点击这里”；提前点击不计有效结果。",
 boundary:"浏览器帧率、输入设备、注意和网络环境会影响结果，不是神经反应测试或医学测量。",
 init(){return {phase:"idle",readyAt:null,elapsed:null,round:0,falseStarts:0,notes:"仅比较自身不同尝试，不能用于诊断或与别人直接排名。"};},
 stage(s){const label=s.phase==="idle"?"准备开始":s.phase==="wait"?"等待绿色信号":s.phase==="ready"?"绿色已出现，点击按钮":s.phase==="early"?"过早点击，请重新开始":"本轮完成";
 return '<div class="stage-frame"><div class="section-label">BROWSER-DEPENDENT RESPONSE TIME</div>'+
 '<div class="signal-disc '+(s.phase==="ready"?"green":s.phase==="wait"?"red":"gray")+'"></div>'+
 '<div class="status-light '+(s.phase==="ready"?"on":"off")+'">'+label+'</div>'+
 tip("本次延迟",s.elapsed===null?"尚无有效计时记录。":Math.round(s.elapsed)+"毫秒（本机交互时间，不是神经系统测量）。")+'</div>';},
 controls(s,H){return '<div class="control-row">'+H.btn(s.phase==="ready"?"看到绿灯，点击这里":s.phase==="wait"?"提前点击（无效）":"准备下一次","act","primary")+'</div>'+
 '<p class="hint">提前点击次数：'+s.falseStarts+'；浏览器切到后台时计时可能不可靠。</p>'+
 H.field("影响结果的设备与环境","notes",s.notes,"textarea");},
 click(a,d,s,H){if(a!=="act")return;
 if(s.phase==="wait"){H.cleanTimers();s.falseStarts++;s.phase="early";return;}
 if(s.phase==="ready"){s.elapsed=performance.now()-s.readyAt;s.phase="done";return;}
 H.cleanTimers();s.phase="wait";s.readyAt=null;s.elapsed=null;s.round++;
 const delay=1000+Math.floor(Math.random()*1800);
 H.addTimer(setTimeout(()=>{if(s.phase==="wait"){s.phase="ready";s.readyAt=performance.now();H.rerender();}},delay));},
 status:"不提供临床反应阈值，不做人与人的速度排行。"};
M[101]={
 heading:"四人传球 · 沟通暗号与交接",
 goal:"设计虚构球队的四步接球路线与简短暗号，比较明确分工和沟通的重要性。",
 instruction:"点选每一棒，再分配成员和暗号，设计容易确认的传球顺序。",
 boundary:"屏幕排布不能检验实际团队运动技巧；多人运动需现场安全与自愿协作。",
 init(){return {pick:0,players:[0,1,2,3],signals:["准备","传给你","接到","完成"],note:"所有参加者先确认规则，再进行安全练习。"};},
 stage(s){const names=["甲","乙","丙","丁"];
 return '<div class="stage-frame"><div class="section-label">TEAM PASS / FOUR STAGES</div><div class="movement-grid">'+s.players.map((n,i)=>
 '<button class="move-tile'+(s.pick===i?" picked":"")+'" data-act="pick" data-idx="'+i+'"><small>交接第'+(i+1)+'步</small><strong>'+names[n]+'</strong><small>'+e(s.signals[i])+'</small></button>').join('')+'</div>'+
 tip("交接检查",new Set(s.players).size+"名不同参与者；如果出现重复角色，需要明确该成员能否按时完成多个交接。")+'</div>';},
 controls(s,H){return H.field("这一棒的成员","player",s.players[s.pick],"select",[["0","甲"],["1","乙"],["2","丙"],["3","丁"]])+
 H.field("沟通暗号","signal",s.signals[s.pick],"text")+
 H.field("现实参与的安全事项","note",s.note,"textarea");},
 change(k,v,s){if(k==="player")s.players[s.pick]=Number(v);if(k==="signal")s.signals[s.pick]=v;},
 input(k,v,s){this.change(k,v,s);},
 click(a,d,s){if(a==="pick")s.pick=Number(d.idx);},
 status:"运动中的沟通需要真实多人练习，不能由路线图作能力结论。"};
M[102]={
 heading:"安全嗅觉观察 · 只设计记录表",
 goal:"为熟悉且安全的气味素材设计描述词和盲测记录，不从屏幕推测实际嗅觉。",
 instruction:"用生活中熟悉的安全材料作观察计划，不直接嗅闻未知化学品或刺激物。",
 boundary:"网页无法释放真实气味，因此本项不进行嗅觉测量，也不指导接触不明物质。",
 init(){return {material:0,descriptor:1,blind:false,record:"未实际进行气味观察。"};},
 stage(s){const materials=["苹果果皮（如适用）","新鲜橙皮（如适用）","清水（对照）"];
 const descriptors=["清新","果香","气味较淡","不确定"];
 return '<div class="stage-frame"><div class="section-label">SMELL / OFFLINE OBSERVATION PLAN</div>'+
 '<div class="cue-box"><b>预设记录卡</b><p>材料：'+materials[s.material]+'；描述：'+descriptors[s.descriptor]+'；遮蔽标签：'+(s.blind?"计划采用":"未安排")+'。</p></div>'+
 tip("真正要做的事","在安全、适宜且不会引起个人不适的现实环境中填写观察结果；不使用未知、刺激性或可能致敏的材料。")+'</div>';},
 controls(s,H){return H.field("示例安全材料","material",s.material,"select",[["0","苹果果皮"],["1","新鲜橙皮"],["2","清水对照"]])+
 H.field("准备使用的描述词","descriptor",s.descriptor,"select",[["0","清新"],["1","果香"],["2","较淡"],["3","不确定"]])+
 '<div class="control-row">'+H.btn(s.blind?"取消盲测记录计划":"添加标签遮蔽计划","blind")+'</div>'+
 H.field("真实观察或未进行说明","record",s.record,"textarea");},
 click(a,d,s){if(a==="blind")s.blind=!s.blind;},
 status:"不要求尝试任何可能刺激或引起过敏的气味。"};
})(window.QX_MODULES);