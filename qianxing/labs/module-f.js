"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const e=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const option=(label,act,i,chosen)=>'<button type="button" class="option-tile'+(i===chosen?' selected':'')+'" data-act="'+act+'" data-idx="'+i+'">'+e(label)+'</button>';
const opts=(arr,act,chosen)=>'<div class="options-grid">'+arr.map((x,i)=>option(x,act,i,chosen)).join('')+'</div>';
const para=(title,p)=>'<div class="cue-box"><b>'+e(title)+'</b><p>'+e(p)+'</p></div>';
M[42]={
 heading:"一分钟观察卡 · 记录而非评判",
 goal:"选择一种感受通道，给自己60秒记录当下注意到的变化，然后区分观察与解释。",
 instruction:"按开始后留意周围可见、可听或自身动作的细节；时间结束仅写观察记录，无好坏评分。",
 boundary:"这是一项普通注意力记录练习，不构成心理健康评价，也不是任何宗教修行的正确标准。",
 init(){return {mode:0,time:60,running:false,observation:"",interpretation:"",note:""};},
 stage(s){const modes=["看到的细节","听到的环境","注意到的动作"];
 return '<div class="stage-frame"><div class="section-label">ATTENTION JOURNAL / OPTIONAL PRACTICE</div>'+opts(modes,"mode",s.mode)+
 '<div class="timer-big">'+String(Math.floor(s.time/60)).padStart(2,"0")+':'+String(s.time%60).padStart(2,"0")+'</div>'+
 '<div class="cue-box"><b>你选的是：'+modes[s.mode]+'</b><p>只描述确实注意到的现象，不需要达到特定心理状态。</p></div></div>';},
 controls(s,H){return H.field("刚才直接观察到了什么？","observation",s.observation,"textarea")+
 H.field("哪些是你自己的解释？","interpretation",s.interpretation,"textarea")+
 H.field("不确定的地方","note",s.note,"textarea")+
 '<div class="control-row">'+H.btn(s.running?"暂停":"开始60秒","toggle","primary")+H.btn("重新计时","reset")+'</div>';},
 click(a,d,s,H){if(a==="mode")s.mode=Number(d.idx);
 if(a==="reset"){H.cleanTimers();s.time=60;s.running=false;}
 if(a==="toggle"){if(s.running){s.running=false;H.cleanTimers();return;}s.running=true;
 const tick=()=>{if(!s.running)return;s.time=Math.max(0,s.time-1);H.rerender();if(s.time>0)H.addTimer(setTimeout(tick,1000));else s.running=false;};
 H.addTimer(setTimeout(tick,1000));}},
 status:"记录不会上传，不给冥想或心理状态打分。"};
M[43]={
 heading:"公共图书室 · 选择你的判断原则",
 goal:"一间小型公共图书室只能新增一种服务。比较公平、效率、自由和可及性的不同取舍。",
 instruction:"在四种原则中排序两项最重要的，然后看它们对有限预算决策可能产生的影响。",
 boundary:"这不是人格测试：价值观可以多元合理，情境没有一个适合所有人的唯一答案。",
 init(){return {priority1:0,priority2:2,decision:0,reason:"要公开说明选择如何影响不同使用者。"};},
 stage(s){const principles=["机会公平","资源效率","使用者自主","弱势者可及性"];
 const actions=["增加周末开放时段","采购面向所有人的电子阅读器","保留免费纸质借阅服务","增加无障碍阅读设备"];
 return '<div class="stage-frame"><div class="section-label">VALUES / FINITE RESOURCE</div><h2>只能新增一项服务</h2>'+opts(actions,"decision",s.decision)+
 '<div class="cue-box"><b>你选择：'+actions[s.decision]+'</b><p>优先考虑“'+principles[s.priority1]+'”和“'+principles[s.priority2]+'”。选定原则并不直接决定行动；还要比较人群需求和证据。</p></div></div>';},
 controls(s,H){const p=[["0","机会公平"],["1","资源效率"],["2","使用者自主"],["3","弱势者可及性"]];
 return H.field("第一优先原则","priority1",s.priority1,"select",p)+H.field("第二优先原则","priority2",s.priority2,"select",p)+
 H.field("为什么这样选择","reason",s.reason,"textarea");},
 click(a,d,s){if(a==="decision")s.decision=Number(d.idx);},
 status:"没有道德高低排名；不同选择应说明具体受益人及代价。"};
M[44]={
 heading:"任务受阻 · 三步复盘与下一次尝试",
 goal:"当一件工作没有如期完成时，记录已知事实、仍可控制的步骤和替代方案。",
 instruction:"选择下一个具体行动，区分自己能改变的环节与外部限制。",
 boundary:"这是工作场景规划练习，不能诊断或治疗心理问题，也不保证减少压力。",
 init(){return {step:0,problem:"项目材料没有按时送达。",fact:"已经核实供货延迟一天。",control:"把不依赖材料的工作先完成，并通知相关人。",fallback:"如果延迟延长，重新确认交付日期和备选方案。"};},
 stage(s){const options=["核实未完成原因","拆出今天仍可完成的步骤","向合作方沟通新的计划","继续等待不作处理"];
 return '<div class="stage-frame"><div class="section-label">SETBACK / ACTION PLANNING</div>'+opts(options,"step",s.step)+
 '<div class="cue-box"><b>场景</b><p>'+e(s.problem)+'</p><b>你已确认的事实</b><p>'+e(s.fact)+'</p><b>可以采取的行动</b><p>'+e(s.control)+'</p></div></div>';},
 controls(s,H){return H.field("遇到的困难（可用虚构案例）","problem",s.problem,"textarea")+
 H.field("已核实的事实","fact",s.fact,"textarea")+
 H.field("自己可执行的小步骤","control",s.control,"textarea")+
 H.field("如果第一次调整失败","fallback",s.fallback,"textarea");},
 click(a,d,s){if(a==="step")s.step=Number(d.idx);},
 status:"步骤用于自我复盘，不能由一次回应判断抗压能力。"};
M[45]={
 heading:"朋友突然沉默 · 不急着猜原因",
 goal:"给出多种可以同时成立的解释，尝试设计尊重对方意愿的澄清问题。",
 instruction:"选择你认为可能的原因，然后写一个不强迫对方解释的回应。",
 boundary:"虚构短对话不能揭示真实他人情绪或动机，不属于共情能力诊断。",
 init(){return {hypotheses:[0,1],message:"今天好像比平时安静。你想聊聊吗？如果现在不方便，也没关系。",uncertainty:"对方也许正在忙自己的事。"};},
 stage(s){const theories=["对方有别的事情在考虑","对方工作较忙","对方希望独处","对方对我不满"];
 return '<div class="stage-frame"><div class="section-label">AMBIGUOUS SOCIAL SIGNALS</div><div class="chat"><div class="chat-bubble peer">“最近几天我不太想说话。”</div><div class="chat-bubble you">'+e(s.message)+'</div></div>'+
 '<p class="section-label">你保留了哪些可能解释？</p>'+theories.map((v,i)=>'<button class="check-tile'+(s.hypotheses.includes(i)?" checked":"")+'" data-act="hypothesis" data-idx="'+i+'"><b>'+(s.hypotheses.includes(i)?"✓":"＋")+'</b><span>'+e(v)+'</span></button>').join('')+'</div>';},
 controls(s,H){return H.field("友善、不过度假设的回应","message",s.message,"textarea")+
 H.field("还不能确定的事情","uncertainty",s.uncertainty,"textarea");},
 click(a,d,s){if(a==="hypothesis"){let i=Number(d.idx);s.hypotheses=s.hypotheses.includes(i)?s.hypotheses.filter(x=>x!==i):[...s.hypotheses,i];}},
 status:"可以提问和倾听，但不能凭短句推定他人的内心。"};
M[46]={
 heading:"同事多次改变意见 · 从观察到假设",
 goal:"整理同事改变决定的实际证据，区分事实与未经证实的动机推断。",
 instruction:"勾选已观察的事实，再写出至少一种不带恶意的替代解释和一项可直接询问的问题。",
 boundary:"不通过网页推断个人动机、性格或诚实程度；所有人物均为虚构。",
 init(){return {facts:[0],theory:0,question:"最近的方案有新要求吗？我们把变化点一起核对一下？",note:"不能因为改变意见，就断定他在故意隐瞒。"};},
 stage(s){const facts=["过去一周方案改了三次","最后一次修改在客户来信后","会议纪要没有记录新的约束","有同事说他肯定在撒谎"];
 const labels=["外部需求发生变化","前一版方案缺少信息","需要与多方协调","个人有不愿透露的理由"];
 return '<div class="stage-frame"><div class="section-label">OBSERVED FACTS VS MOTIVES</div>'+
 facts.map((v,i)=>'<button class="check-tile'+(s.facts.includes(i)?" checked":"")+'" data-act="fact" data-idx="'+i+'"><b>'+(s.facts.includes(i)?"✓":"＋")+'</b><span>'+e(v)+'</span></button>').join('')+
 '<div class="cue-box"><b>当前待验证解释</b><p>'+labels[s.theory]+'</p><p>被选择的第四条属于他人传闻，不能直接等同于可核查事实。</p></div></div>';},
 controls(s,H){return H.field("暂时考虑的原因","theory",s.theory,"select",[["0","外部需求变化"],["1","前一版信息不足"],["2","多方协商"],["3","私人原因（不可擅自推断）"]])+
 H.field("你准备怎样直接询问？","question",s.question,"textarea")+
 H.field("有哪些证据仍缺失？","note",s.note,"textarea");},
 click(a,d,s){if(a==="fact"){const i=Number(d.idx);s.facts=s.facts.includes(i)?s.facts.filter(x=>x!==i):[...s.facts,i];}},
 status:"传闻与直接证据应分开，承认未知比武断下结论更可靠。"};
M[47]={
 heading:"对方在倾诉 · 三种回应方式",
 goal:"练习倾听、澄清、询问资源需求，不做诊断或治疗承诺。",
 instruction:"选择一种回应目标，修改示范说法。与真实倾诉者沟通前，应尊重他们是否愿意继续。",
 boundary:"这是沟通练习，不能替代专业心理咨询、危机干预或心理治疗。",
 init(){return {intent:0,response:"听起来这段时间对你来说很不容易。我愿意听你说。",consent:true,note:"不对对方做心理诊断，也不保证结果。"};},
 stage(s){const prompts=["先表示愿意倾听","澄清对方希望你做什么","询问是否需要实际支持"];
 const consequences=["有助于表达倾听意愿，但还应尊重是否愿意继续。","可以减少自己擅自出主意的可能。","可以提供现实帮助，但不可过度承诺。"];
 return '<div class="stage-frame"><div class="section-label">LISTENING / SUPPORTIVE COMMUNICATION</div>'+
 '<div class="chat"><div class="chat-bubble peer">“最近工作堆得太多，我有点不知道该从哪里开始。”</div><div class="chat-bubble you">'+e(s.response)+'</div></div>'+opts(prompts,"intent",s.intent)+para("所选回应目的",consequences[s.intent])+'</div>';},
 controls(s,H){return H.field("你准备说的话","response",s.response,"textarea")+
 H.field("需要避免的误解与承诺","note",s.note,"textarea")+
 '<div class="control-row">'+H.btn("查看倾听示范","listen")+H.btn("查看澄清示范","clarify")+H.btn("查看资源支持示范","resource")+'</div>';},
 click(a,d,s){const text={listen:"听起来事情有点多。你愿意说说现在最困扰你的一件事吗？",clarify:"你希望我先陪你梳理，还是需要我一起处理一项具体任务？",resource:"如果你愿意，我们可以一起列出最紧急的事项，或找合适的人帮助。"};if(text[a]){s.response=text[a];s.intent={listen:0,clarify:1,resource:2}[a];}},
 status:"回应仅供语言练习，不评价沟通者的临床胜任能力。"};
M[48]={
 heading:"忙碌工作日 · 可以自行修改的安排",
 goal:"为繁忙的一天安排任务优先级、短暂休息与可求助的环节。",
 instruction:"把不同任务放入需要尽快完成、可以延后、需要求助的栏位，并记录实际完成情况。",
 boundary:"是日程与工作安排练习，不是情绪障碍检测，也不保证可以缓解任何症状。",
 init(){return {tasks:[0,1,2,1],breaks:2,notes:"先完成有外部截止时间的任务，必要时请求协助。"};},
 stage(s){const names=["今天必须回复客户","整理三个月旧文件","完成明天的发货核对","更新一个非紧急的页面"];
 const groups=["今天优先","可以延后","请求协助"];
 return '<div class="stage-frame"><div class="section-label">WORKDAY / ADAPTIVE PLAN</div>'+
 names.map((n,i)=>'<div class="priority-row"><b>'+e(n)+'</b><button data-act="task" data-idx="'+i+'" class="pill action-pill">'+groups[s.tasks[i]]+'（点此切换）</button></div>').join('')+
 para("本次安排","短时休息或切换任务计划："+s.breaks+" 次（按需要调整）。")+'</div>';},
 controls(s,H){return H.field("拟安排的短时休息或切换次数","breaks",s.breaks,"range",{min:0,max:6,step:1})+
 H.field("实际可执行的计划","notes",s.notes,"textarea")+
 H.btn("恢复示范安排","reset");},
 click(a,d,s){if(a==="task"){let i=Number(d.idx);s.tasks[i]=(s.tasks[i]+1)%3;}if(a==="reset")Object.assign(s,this.init());},
 status:"任务优先级会随实际要求而变，不给情绪健康分数。"};
M[49]={
 heading:"两方争用会议室 · 共同协商方案",
 goal:"观察两个团队的最低需要、可替代时段与双方可以接受的折中。",
 instruction:"安排会议室8个小时的分配，比较两方得到的时长与原始需求。",
 boundary:"双方满意度只是时间差的教学模拟，不代表真实人的感受或调解能力。",
 init(){return {hoursA:5,hoursB:3,notes:"先核对两方的最小需求，再提出备选地点和时段。",approved:false};},
 stage(s){const remain=8-s.hoursA-s.hoursB;const needsA=5,needsB=5;
 return '<div class="stage-frame"><div class="section-label">MEDIATE A COMMON RESOURCE / 8 HOURS</div>'+
 '<div class="allocation"><div style="width:'+s.hoursA/8*100+'%;background:#258e9d">A '+s.hoursA+'h</div><div style="width:'+s.hoursB/8*100+'%;background:#e0a457">B '+s.hoursB+'h</div></div>'+
 '<div class="argument-grid"><div class="argument pro"><b>团队 A：原需求5小时</b><p>当前分配 '+s.hoursA+' 小时，缺口 '+Math.max(0,needsA-s.hoursA)+' 小时</p></div><div class="argument con"><b>团队 B：原需求5小时</b><p>当前分配 '+s.hoursB+' 小时，缺口 '+Math.max(0,needsB-s.hoursB)+' 小时</p></div></div>'+
 '<div class="cue-box"><b>空闲余量：'+remain+'小时</b><p>'+(remain<0?"分配超过可用时间，需要调整。":remain===0?"已分配满8小时。可以考虑错峰或借用其他场地。":"还留有未分配时段。")+'</p></div></div>';},
 controls(s,H){return H.field("团队A分配时长","hoursA",s.hoursA,"range",{min:0,max:8,step:1,unit:"小时"})+
 H.field("团队B分配时长","hoursB",s.hoursB,"range",{min:0,max:8,step:1,unit:"小时"})+
 H.field("双方共同确认的下一步","notes",s.notes,"textarea")+
 '<div class="control-row">'+H.btn("平均分配4/4","equal")+H.btn("尝试错峰5/3","reset")+'</div>';},
 click(a,d,s){if(a==="equal"){s.hoursA=4;s.hoursB=4;}if(a==="reset"){s.hoursA=5;s.hoursB=3;}},
 status:"工具展示时长冲突，真正的调解需要双方参加和达成同意。"};
M[50]={
 heading:"新社群成员 · 设计低压力欢迎流程",
 goal:"设计欢迎、介绍、邀请和留出退出自由的社群流程。",
 instruction:"逐阶段选择一种交流方式。重点在于尊重自愿参与，不强迫公开自我信息。",
 boundary:"一套在线话术不能证明真实社交联结能力；不同社群和个人需要不同边界。",
 init(){return {stage:0,choices:[1,1,1,0],welcome:"欢迎加入！你可以先随便看看，有问题也欢迎私信管理员。",note:"尊重不愿发言的人，也不索取不必要的信息。"};},
 stage(s){const stages=["首次欢迎","信息介绍","活动邀请","退出自由"];
 const choices=[
 ["要求公开真实姓名与经历","私下发送简短欢迎","直接安排公开自我介绍"],
 ["一次发送30条群规","发送清晰的关键规则和链接","什么都不告诉新成员"],
 ["必须报名本周活动","说明可选活动和参与方式","未经同意直接添加到工作组"],
 ["允许自由退群且不追问","需要说明私人原因才允许退出","直接阻止退出"]
 ];
 return '<div class="stage-frame"><div class="section-label">COMMUNITY ONBOARDING / OPT-IN</div>'+opts(stages,"stage",s.stage)+
 '<div class="options-grid">'+choices[s.stage].map((o,i)=>option(o,"choice",i,s.choices[s.stage])).join('')+'</div>'+
 para("欢迎文本示范",s.welcome)+'</div>';},
 controls(s,H){return H.field("欢迎消息（可编辑）","welcome",s.welcome,"textarea")+
 H.field("隐私与退出说明","note",s.note,"textarea");},
 click(a,d,s){if(a==="stage")s.stage=Number(d.idx);if(a==="choice")s.choices[s.stage]=Number(d.idx);},
 status:"不以参加次数或主动讲话程度衡量一个人的社交价值。"};
M[51]={
 heading:"孩子拼图遇到困难 · 引导层级",
 goal:"比较直接替孩子做、提出问题和提供局部提示等不同方式对自主尝试机会的影响。",
 instruction:"选择帮助程度，观察每种做法的可能利弊。情境没有一刀切的育儿答案。",
 boundary:"模拟只是引导方式练习，不提供儿童发展诊断，不推断任何真实孩子的能力。",
 init(){return {help:1,ageContext:"假设是自愿玩拼图的孩子，对题目有基本兴趣。",note:"需要观察是否愿意继续，不强制完成任务。"};},
 stage(s){const names=["完全代做","问一个引导性问题","提供一条具体线索","让孩子独自尝试、不回应任何请求"];
 const outcomes=["孩子立刻看到结果，但可能失去练习机会。","保留尝试机会，但问题需要与当前困难对应。","可以减少卡住的挫败感，但需逐步减少提示。","尊重自主性并非不提供需要的帮助。"];
 return '<div class="stage-frame"><div class="section-label">SCAFFOLDING / SUPPORT LEVELS</div>'+
 '<div class="cue-box"><b>情境</b><p>孩子找不到拼图中缺失的蓝色角块，并说：“这题太难了。”</p></div>'+
 opts(names,"help",s.help)+para("可能影响",outcomes[s.help])+'</div>';},
 controls(s,H){return H.field("学习情境与背景条件","ageContext",s.ageContext,"textarea")+
 H.field("如何判断是否需要更多帮助？","note",s.note,"textarea");},
 click(a,d,s){if(a==="help")s.help=Number(d.idx);},
 status:"引导方式需要考虑儿童意愿、实际任务和现实照护者判断。"};
})(window.QX_MODULES);