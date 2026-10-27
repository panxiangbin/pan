"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const e=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const arrtext=(arr)=>arr.map(e).join("、");
const box=(title,content)=>'<div class="cue-box"><b>'+e(title)+'</b><p>'+e(content)+'</p></div>';
M[52]={
 heading:"紧急任务 · 给三个岗位分配负责人",
 goal:"为接单、执行和复核分配不同负责人，判断重复分配与无人负责的风险。",
 instruction:"点选岗位后指定同事，再检查职责覆盖率与谁负责升级沟通。",
 boundary:"虚构团队协作模拟不测量实际组织领导能力，真实人员技能与负荷需要核实。",
 init(){return {assign:[0,0,1],role:0,leader:2,note:"高风险复核最好有独立负责人。"};},
 stage(s){const roles=["客户沟通","现场执行","质量复核"],names=["小林","小王","小陈"];
 const loads=names.map((name,i)=>s.assign.filter(x=>x===i).length);
 return '<div class="stage-frame"><div class="section-label">TEAM ROLES / ASSIGNMENT</div><div class="observ-grid">'+roles.map((r,i)=>
 '<button data-act="role" data-idx="'+i+'" class="observ-item'+(s.role===i?' selected':'')+'"><span>岗位 '+(i+1)+'</span><strong>'+r+'</strong><small>负责人：'+names[s.assign[i]]+'</small></button>').join('')+'</div>'+
 box("当前工作负荷",names.map((n,i)=>n+"："+loads[i]+"项").join("；")+(s.assign[0]===s.assign[2]?"。提示：客户沟通与复核由同一人负责，留意复核独立性。":"。"))+'</div>';},
 controls(s,H){const opts=[["0","小林"],["1","小王"],["2","小陈"]];return H.field("当前岗位负责人","worker",s.assign[s.role],"select",opts)+
 H.field("升级沟通负责人","leader",s.leader,"select",opts)+H.field("协调说明","note",s.note,"textarea")+
 H.btn("恢复示范分配","reset");},
 change(k,v,s){if(k==="worker")s.assign[s.role]=Number(v);},
 click(a,d,s){if(a==="role")s.role=Number(d.idx);if(a==="reset")Object.assign(s,this.init());},
 status:"不能仅从模拟岗位分配判断真实领导力。"};
M[53]={
 heading:"战略规划 · 分配三类项目资源",
 goal:"有限的100单位资源在产品研发、客户服务和市场试探间分配，比较不同阶段的风险。",
 instruction:"滑动资源比例，观察预算余量并解释未来三阶段怎么评估。",
 boundary:"指标是虚构规划示例，不预测真实商业收益或经营表现。",
 init(){return {research:40,service:35,market:25,phase:0,notes:"先保障产品基本品质和现有客户服务。"};},
 stage(s){const remain=100-s.research-s.service-s.market;
 const colors=["#157f83","#e1a353","#7689c2"],labels=["研发","服务","营销"],values=[s.research,s.service,s.market];
 return '<div class="stage-frame"><div class="section-label">STRATEGIC RESOURCE ALLOCATION / 100 POINTS</div><div class="allocation">'+values.map((v,i)=>'<div style="width:'+v+'%;background:'+colors[i]+'">'+labels[i]+' '+v+'</div>').join('')+'</div>'+
 '<div class="metric-grid"><div><b>'+remain+'</b><small>尚未分配（负数=超额）</small></div><div><b>'+Math.min(...values)+'</b><small>投入最少的领域</small></div><div><b>'+Math.max(...values)+'</b><small>集中最高的一项</small></div></div>'+
 box("当前规划阶段",["验证需求与可行性","小规模交付与观察","根据反馈调整投入"][s.phase])+'</div>';},
 controls(s,H){return H.field("产品研发","research",s.research,"range",{min:0,max:100,step:5,unit:"单位"})+
 H.field("客户服务","service",s.service,"range",{min:0,max:100,step:5,unit:"单位"})+
 H.field("市场试探","market",s.market,"range",{min:0,max:100,step:5,unit:"单位"})+
 H.field("规划阶段","phase",s.phase,"select",[["0","需求验证"],["1","小规模执行"],["2","复盘调整"]])+
 H.field("你依据的假设","notes",s.notes,"textarea")+
 H.btn("恢复40/35/25","reset");},
 click(a,d,s){if(a==="reset")Object.assign(s,this.init());},
 status:"资源单位仅用于比较，结果不对应实际投资收益。"};
M[54]={
 heading:"一个技术员，三台设备 · 资源匹配",
 goal:"在三项需要的资源和任务间做匹配，发现同一设备被重复预定时如何调整。",
 instruction:"点选订单任务，改派满足要求的设备或资源，并检查冲突。",
 boundary:"仿真只按预设约束检查，不代替实际设备的安全与技术选型。",
 init(){return {tasks:[0,0,2],active:0,delay:0,notes:"要核查各任务所需的实际规格与人员。"};},
 stage(s){const orders=["加热试验","混合制备","冷却验证"],equipment=["循环水泵","恒温浴锅","冷却循环泵"];
 const counts=equipment.map((_,i)=>s.tasks.filter(v=>v===i).length);
 return '<div class="stage-frame"><div class="section-label">TASK-TO-RESOURCE MATCHING</div><div class="observ-grid">'+orders.map((o,i)=>
 '<button data-act="task" data-idx="'+i+'" class="observ-item'+(s.active===i?' selected':'')+'"><span>任务 '+(i+1)+'</span><strong>'+o+'</strong><small>占用资源：'+equipment[s.tasks[i]]+'</small></button>').join('')+'</div>'+
 box("资源占用",equipment.map((name,i)=>name+":"+counts[i]+"项").join("；")+(counts.some(c=>c>1)?"。出现重复占用，需核对时段。":"。暂无同一资源的重复占用。"))+'</div>';},
 controls(s,H){return H.field("当前任务分配资源","resource",s.tasks[s.active],"select",[["0","循环水泵"],["1","恒温浴锅"],["2","冷却循环泵"]])+
 H.field("错开开始时间（小时）","delay",s.delay,"range",{min:0,max:8,step:1,unit:"h"})+
 H.field("选型和日程注意","notes",s.notes,"textarea");},
 change(k,v,s){if(k==="resource")s.tasks[s.active]=Number(v);},
 click(a,d,s){if(a==="task")s.active=Number(d.idx);},
 status:"资源冲突只是排程提醒，不能把错误的设备改派当成有效解决。"};
M[55]={
 heading:"价格与交期 · 谈判可行区间",
 goal:"调整报价、交货天数和保障期限，比较不同方案能否同时满足双方底线。",
 instruction:"先尝试各自的最低条件，再通过交期或保障作可检查的交换。",
 boundary:"价格与约束均为虚构示例，不代表真实供应商成本或买卖双方心理。",
 init(){return {price:960,days:12,warranty:12,notes:"应将双方可接受的交付条款写成可核实的约定。"};},
 stage(s){const buyer=s.price<=950&&s.days<=15, seller=s.price>=900&&s.days>=10;
 const buyerReq="买方希望不超过950元，15天内交货",sellerReq="卖方希望不低于900元，至少10天备货";
 return '<div class="stage-frame"><div class="section-label">NEGOTIATION / POSSIBLE AGREEMENT ZONE</div>'+
 '<div class="argument-grid"><div class="argument pro"><b>采购方</b><p>'+buyerReq+'</p><div class="pill">'+(buyer?"基本条件满足":"仍存在条件差距")+'</div></div><div class="argument con"><b>供应方</b><p>'+sellerReq+'</p><div class="pill">'+(seller?"基本条件满足":"仍存在条件差距")+'</div></div></div>'+
 '<div class="metric-grid"><div><b>¥'+s.price+'</b><small>报价</small></div><div><b>'+s.days+'天</b><small>交期</small></div><div><b>'+s.warranty+'月</b><small>保障期</small></div></div>'+
 box("方案可行性",buyer&&seller?"在两方预设的核心区间之内；质量、付款和服务条款仍需核实。":"至少一方的基本要求未满足，继续讨论条件。")+'</div>';},
 controls(s,H){return H.field("拟议报价","price",s.price,"range",{min:800,max:1150,step:10,unit:"元"})+
 H.field("交付天数","days",s.days,"range",{min:5,max:25,step:1,unit:"天"})+
 H.field("保障期限","warranty",s.warranty,"range",{min:3,max:24,step:3,unit:"月"})+
 H.field("可核实的协商承诺","notes",s.notes,"textarea")+
 '<div class="control-row">'+H.btn("形成一个区间内方案","deal")+H.btn("恢复起点","reset")+'</div>';},
 click(a,d,s){if(a==="deal"){s.price=930;s.days=12;s.warranty=12;}if(a==="reset")Object.assign(s,this.init());},
 status:"网页只展示虚构边界下的谈判，不评价真实商务谈判能力。"};
M[56]={
 heading:"共享工具室 · 规则设置与例外处理",
 goal:"制定工具借还、损坏登记、隐私和申诉渠道的基础规则。",
 instruction:"逐条开启所需规则，检查哪些场景仍缺流程，并保留例外处理。",
 boundary:"此处规则仅为制度设计草图，实际实施还需参与者同意及相关法律合规审查。",
 init(){return {rules:[true,true,false,false,true],case:0,notes:"应让使用者能看懂规则，并保留问题反馈与申诉渠道。"};},
 stage(s){const names=["记录借用与归还时间","说明损坏报告方式","约定保管与存放标准","设置争议复核程序","仅收集必要的信息"];
 return '<div class="stage-frame"><div class="section-label">RULE DESIGN / TRANSPARENT PROCEDURE</div>'+
 names.map((t,i)=>'<button class="check-tile'+(s.rules[i]?' checked':'')+'" data-act="rule" data-idx="'+i+'"><b>'+(s.rules[i]?'✓':'＋')+'</b><span>'+e(t)+'</span></button>').join('')+
 box("当前流程覆盖",s.rules.filter(Boolean).length+" / 5项；还需指定谁负责登记、复核和更新。")+'</div>';},
 controls(s,H){return H.field("模拟违规场景","case",s.case,"select",[["0","工具超时未归还"],["1","借出工具发生损坏"],["2","借还记录存在争议"]])+
 H.field("例外处理与复核说明","notes",s.notes,"textarea")+
 H.btn("恢复初始制度","reset");},
 click(a,d,s){if(a==="rule"){const i=Number(d.idx);s.rules[i]=!s.rules[i];}if(a==="reset")Object.assign(s,this.init());},
 status:"简短制度清单不代替真正执行与安全培训。"};
const ganttTasks=["确定范围","采购材料","搭建展示","最终检查"];
M[57]={
 heading:"活动筹备 · 依赖关系和缓冲天数",
 goal:"根据任务持续时间、依赖关系和不可预见延迟，构建简单的活动排期图。",
 instruction:"调整每个阶段的工作天数。下一个阶段默认在前一个阶段结束后开始。",
 boundary:"线性甘特图是基本项目规划示例，不等同复杂团队资源和并行任务管理。",
 init(){return {durations:[2,4,5,2],active:0,buffer:2,notes:"至少为临时问题预留一个可调整的时间窗口。"};},
 stage(s){let offset=0;const total=s.durations.reduce((a,b)=>a+b,0)+s.buffer,scale=Math.max(15,total);
 const bars=s.durations.map((n,i)=>{const left=offset/scale*100,width=n/scale*100;offset+=n;
 return '<div class="gantt-row"><span>'+ganttTasks[i]+'</span><div class="gantt-track"><div style="left:'+left+'%;width:'+width+'%;background:'+["#168b8d","#e1a65d","#7589be","#55a28b"][i]+'"></div></div><b>'+n+'天</b></div>';}).join('');
 return '<div class="stage-frame"><div class="section-label">SCHEDULE DEPENDENCIES / FOUR PHASES</div>'+bars+
 '<div class="gantt-row"><span>缓冲</span><div class="gantt-track"><div style="left:'+(offset/scale*100)+'%;width:'+(s.buffer/scale*100)+'%;background:#cdd8df"></div></div><b>'+s.buffer+'天</b></div>'+
 box("整体工期",total+"天（四阶段顺序进行，含"+s.buffer+"天缓冲）")+'</div>';},
 controls(s,H){return H.field("正在调整的阶段","active",s.active,"select",ganttTasks.map((x,i)=>[i,x]))+
 H.field("本阶段工作天数","duration",s.durations[s.active],"range",{min:1,max:12,step:1,unit:"天"})+
 H.field("额外缓冲","buffer",s.buffer,"range",{min:0,max:10,step:1,unit:"天"})+
 H.field("主要风险与备用计划","notes",s.notes,"textarea");},
 change(k,v,s){if(k==="duration")s.durations[s.active]=Number(v);},
 click(a,d,s){},
 status:"工期由所设依赖顺序直接计算，未包含节假日和人员限制。"};
M[58]={
 heading:"小店经营 · 收入、成本与退货实验",
 goal:"调整销量、售价、单位成本和退货数，观察销售收入与模拟毛利的变化。",
 instruction:"尝试“售价提高但销量下降”或“退货增加”情景，区分收入与毛利。",
 boundary:"为教学用虚构数据，未计运费、税费、房租等完整财务项目，不代表真实经营建议。",
 init(){return {sales:90,price:78,cost:43,returned:8,fixed:1600,notes:"订单收入与真实可用现金、净利润不是同一概念。"};},
 stage(s){const sold=Math.max(0,s.sales-s.returned),revenue=sold*s.price,variable=sold*s.cost,profit=revenue-variable-s.fixed;
 return '<div class="stage-frame"><div class="section-label">SMALL BUSINESS / SYNTHETIC MONTH</div><div class="metric-grid"><div><b>¥'+revenue.toLocaleString()+'</b><small>有效销售额</small></div><div><b>¥'+variable.toLocaleString()+'</b><small>商品变量成本</small></div><div><b>¥'+profit.toLocaleString()+'</b><small>扣除假设固定费的余额</small></div></div>'+
 '<div class="allocation"><div style="width:'+(revenue?variable/revenue*100:0)+'%;background:#d79c61">变量成本</div><div style="width:'+(revenue?Math.max(0,revenue-variable)/revenue*100:0)+'%;background:#218c91">成本之外</div></div>'+
 box("口径说明","售出件数="+sold+"；模拟收入=售出件数×售价；剩余额=收入－商品变量成本－固定费用。此处仍不是完整会计净利润。")+'</div>';},
 controls(s,H){return H.field("总订单件数","sales",s.sales,"range",{min:0,max:160,step:5,unit:"件"})+
 H.field("单件售价","price",s.price,"range",{min:20,max:150,step:2,unit:"元"})+
 H.field("商品单位成本","cost",s.cost,"range",{min:10,max:110,step:1,unit:"元"})+
 H.field("退款退货件数","returned",s.returned,"range",{min:0,max:50,step:1,unit:"件"})+
 H.field("模拟固定费用","fixed",s.fixed,"range",{min:0,max:5000,step:100,unit:"元"})+
 H.field("观察到的风险","notes",s.notes,"textarea");},
 status:"成本结构与收入关系有数学依据，虚构参数无法预测现实订单。"};
M[59]={
 heading:"新产品上市 · 客群与渠道信息配对",
 goal:"把产品适用场景、目标客群和传播渠道组织成逻辑一致的营销方案。",
 instruction:"同时选择客群、渠道与核心信息，观察措辞是否和需求匹配。",
 boundary:"不给出假造的点击率或成交率；效果需要真实合法的投放和数据分析才能验证。",
 init(){return {audience:0,channel:0,message:0,budget:0,test:"先说明使用场景，再验证描述有没有事实依据。"};},
 stage(s){const audiences=["办公室通勤","户外短途","校园学习"],channels=["商品详情页","简短演示视频","体验分享文章"],messages=["携带和清洁方便","突出耐用与空间","说明价格与适用范围"];
 const matches=[[0,0,2],[0,1,2],[2,1,0]];
 const score=matches[s.audience].includes(s.message);
 return '<div class="stage-frame"><div class="section-label">MARKETING / MESSAGE-FIT PROTOTYPE</div>'+
 '<div class="ad-preview"><span class="ad-kicker">AUDIENCE '+(s.audience+1)+'</span><div class="ad-product">◇</div><h2>'+e(audiences[s.audience])+'</h2><p>'+e(messages[s.message])+'</p><small>发布载体：'+e(channels[s.channel])+'</small></div>'+
 box("配对提醒",score?"这一条卖点可能适用于该群体，但需要实际证明和使用者研究。":"当前卖点不一定对应这一类需求，可解释为什么仍然选择它。")+'</div>';},
 controls(s,H){return H.field("目标用户情境","audience",s.audience,"select",[["0","办公室通勤"],["1","户外短途"],["2","校园学习"]])+
 H.field("发布渠道","channel",s.channel,"select",[["0","商品详情页"],["1","简短演示视频"],["2","体验文章"]])+
 H.field("核心信息","message",s.message,"select",[["0","携带清洁"],["1","耐用空间"],["2","价格与使用范围"]])+
 H.field("新增费用预算（模拟）","budget",s.budget,"range",{min:0,max:1000,step:50,unit:"元"})+
 H.field("如何验证商品描述","test",s.test,"textarea");},
 status:"匹配提示只是设计启发，不是营销预测模型。"};
M[60]={
 heading:"假想家庭现金流 · 预算与储备",
 goal:"区分收入、日常必要支出、灵活支出和预留储备，观察不同方案的结余。",
 instruction:"拖动不同支出项目，比一比现金流是否能够覆盖计划支出。",
 boundary:"只是基础现金流教育示例，不是个人财务建议、投资推荐或信用评估。",
 init(){return {income:8000,needs:4800,flex:1800,reserve:1000,notes:"储备金额应结合真实需要、账期和风险判断。"};},
 stage(s){const remain=s.income-s.needs-s.flex-s.reserve;
 return '<div class="stage-frame"><div class="section-label">HYPOTHETICAL CASHFLOW / NOT PERSONAL ADVICE</div>'+
 '<div class="metric-grid"><div><b>¥'+s.income+'</b><small>模拟月收入</small></div><div><b>¥'+(s.needs+s.flex)+'</b><small>模拟当月支出</small></div><div><b>¥'+remain+'</b><small>储备后剩余金额</small></div></div>'+
 box("现金流观察",remain>=0?"方案暂时没有超出当月模拟收入，但还需确认未来账单。":"模拟预算已超过收入，需重新评估支出、储备与付款时间。")+'</div>';},
 controls(s,H){return H.field("模拟收入","income",s.income,"range",{min:0,max:20000,step:200,unit:"元"})+
 H.field("必要支出","needs",s.needs,"range",{min:0,max:15000,step:100,unit:"元"})+
 H.field("灵活支出","flex",s.flex,"range",{min:0,max:10000,step:100,unit:"元"})+
 H.field("计划储备","reserve",s.reserve,"range",{min:0,max:10000,step:100,unit:"元"})+
 H.field("需要进一步核实的信息","notes",s.notes,"textarea");},
 status:"全部数据均为虚构；不保存真实金融账户资料。"};
const contractText="供方应及时交货。若产品存在问题，双方友好协商解决。质保按正常标准执行。";
M[61]={
 heading:"合同词语 · 找不明确的责任与期限",
 goal:"在虚构简短合同中标注含糊条款，提出可量化的确认问题。",
 instruction:"点击可能引发歧义的词语，写出你准备向合同双方核实的问题。",
 boundary:"只提供文本理解与起草练习，不构成法律解释或法律建议；实际合同须由专业人员审查。",
 init(){return {selected:[0],revision:"“及时交货”需要明确具体日期、地点和逾期处理。",notes:"还需核查适用法律、履行证据和合同上下文。"};},
 stage(s){const words=["及时交货","存在问题","友好协商","正常标准"];
 return '<div class="stage-frame"><div class="section-label">CONTRACT TEXT / AMBIGUITY SPOTTING</div>'+
 '<div class="legal-text">'+e(contractText)+'</div><p class="section-label">可疑模糊措辞：</p>'+
 words.map((x,i)=>'<button class="option-tile'+(s.selected.includes(i)?" selected":"")+'" data-act="term" data-idx="'+i+'">'+e(x)+'</button>').join('')+
 box("准备澄清的问题",s.revision)+'</div>';},
 controls(s,H){return H.field("改写或核实清单","revision",s.revision,"textarea")+
 H.field("其他需要律师或双方确认的事项","notes",s.notes,"textarea");},
 click(a,d,s){if(a==="term"){const i=Number(d.idx);s.selected=s.selected.includes(i)?s.selected.filter(x=>x!==i):[...s.selected,i];}},
 status:"实际合同不能仅凭关键词判定效力或风险。"};
M[62]={
 heading:"社区公用预算 · 三方意见与取舍",
 goal:"有限的10个预算单位分配到步道、照明和公共绿地，同时解释受益人差异。",
 instruction:"调整预算，看是否超额，并给每种利益相关方留出表达意见的机会。",
 boundary:"政策情境和预算纯属虚构，不能作为现实公共项目可行性、政治立场或行政能力评价。",
 init(){return {path:4,light:3,park:3,group:0,notes:"在预算之前，应先公开议题并让受影响群体平等表达。"};},
 stage(s){const rem=10-s.path-s.light-s.park;
 const groups=["夜间步行者：担心路线照明","带孩子的家庭：希望有更多绿地","轮椅和推车使用者：需要连续通道"];
 return '<div class="stage-frame"><div class="section-label">PUBLIC BUDGET / 10 UNITS</div>'+
 '<div class="allocation"><div style="width:'+s.path*10+'%;background:#258e9d">步道 '+s.path+'</div><div style="width:'+s.light*10+'%;background:#e0a65b">照明 '+s.light+'</div><div style="width:'+s.park*10+'%;background:#76ae7f">绿地 '+s.park+'</div></div>'+
 '<div class="cue-box"><b>剩余 '+rem+' 单位（负数代表超额）</b><p>当前选定利益相关方：'+e(groups[s.group])+'</p></div></div>';},
 controls(s,H){return H.field("人行步道","path",s.path,"range",{min:0,max:10,step:1,unit:"单位"})+
 H.field("公共照明","light",s.light,"range",{min:0,max:10,step:1,unit:"单位"})+
 H.field("公用绿地","park",s.park,"range",{min:0,max:10,step:1,unit:"单位"})+
 H.field("重点听取的人群","group",s.group,"select",[["0","夜间步行者"],["1","儿童家庭"],["2","轮椅和推车使用者"]])+
 H.field("公开沟通方案","notes",s.notes,"textarea");},
 status:"公共决策要核查信息、利益分布、程序与真实预算约束。"};
M[63]={
 heading:"两份样本报告 · 看见抽样偏差",
 goal:"比较线上调查和线下访问，理解样本比例不能自动推断总体意见。",
 instruction:"修改抽样人数与支持人数，检查是否把样本选取方式当成了事实结果。",
 boundary:"所有数字都是模拟数据，不能推断任何真实群体意见，未经代表性验证不可外推。",
 init(){return {onlineN:30,onlineYes:24,offlineN:30,offlineYes:9,weight:50,notes:"需要确认抽样框、无应答偏差与样本覆盖范围。"};},
 stage(s){const r1=s.onlineN>0?s.onlineYes/s.onlineN*100:0,r2=s.offlineN>0?s.offlineYes/s.offlineN*100:0;
 const weighted=(r1*s.weight+r2*(100-s.weight))/100;
 return '<div class="stage-frame"><div class="section-label">SAMPLING / OBSERVED VS INFERRED</div>'+
 '<div class="sample-grid"><div><b>线上自愿填写</b><div class="sample-track"><div style="width:'+Math.min(100,r1)+'%;background:#158c8c"></div></div><strong>'+r1.toFixed(0)+'%</strong><small>'+s.onlineYes+'/'+s.onlineN+' 支持（模拟）</small></div>'+
 '<div><b>线下到场访问</b><div class="sample-track"><div style="width:'+Math.min(100,r2)+'%;background:#df9d50"></div></div><strong>'+r2.toFixed(0)+'%</strong><small>'+s.offlineYes+'/'+s.offlineN+' 支持（模拟）</small></div></div>'+
 box("按你设置的来源权重计算",weighted.toFixed(1)+"%（仅作代数演示）。没有真实的总体构成比例与有效抽样方法，就不能把这个数字当成总体支持率。")+'</div>';},
 controls(s,H){return H.field("线上参与人数","onlineN",s.onlineN,"range",{min:10,max:100,step:5,unit:"人"})+
 H.field("线上支持人数","onlineYes",s.onlineYes,"range",{min:0,max:100,step:1,unit:"人"})+
 H.field("线下参与人数","offlineN",s.offlineN,"range",{min:10,max:100,step:5,unit:"人"})+
 H.field("线下支持人数","offlineYes",s.offlineYes,"range",{min:0,max:100,step:1,unit:"人"})+
 H.field("假设线上群体权重","weight",s.weight,"range",{min:0,max:100,step:5,unit:"%"})+
 H.field("主要抽样问题","notes",s.notes,"textarea");},
 change(k,v,s){if(k==="onlineN")s.onlineYes=Math.min(s.onlineYes,s.onlineN);if(k==="offlineN")s.offlineYes=Math.min(s.offlineYes,s.offlineN);},
 status:"先评估样本怎样产生，再谈比例与结论。"};
})(window.QX_MODULES);