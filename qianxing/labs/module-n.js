"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const e=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const box=(t,p)=>'<div class="cue-box"><b>'+e(t)+'</b><p>'+e(p)+'</p></div>';
M[103]={
 heading:"茶饮感官记录 · 描述而不是评分",
 goal:"为温度适宜的无酒精茶饮准备香气、口感和回甘的观察表。",
 instruction:"记录现实中感受到的描述词，或注明尚未观察。网页不会制造味道，也不替代实际味觉。",
 boundary:"真实品鉴需考虑过敏、温度、饮食限制和个人状况；不涉及酒精，不测试医学味觉功能。",
 init(){return {kind:0,aroma:1,mouth:1,after:0,actual:false,note:"网页未提供真实茶饮；记录的词语须与实际观察分开。"};},
 stage(s){const teas=["无糖温茶（示例）","适温的麦茶（示例）","清水对照"],aromas=["不确定","草木香","谷物香","香气较淡"],mouth=["不确定","清爽","柔和","偏涩"],after=["未判断","回味短","回味较长"];
 return '<div class="stage-frame"><div class="section-label">TASTE / REAL-WORLD RECORD ONLY</div><div class="cue-box"><b>观察卡</b>'+
 '<p>素材：'+teas[s.kind]+'</p><p>香气：'+aromas[s.aroma]+'</p><p>口感：'+mouth[s.mouth]+'</p><p>回味：'+after[s.after]+'</p>'+
 '<p>记录状态：'+(s.actual?"自愿标记为完成现实观察":"尚未进行现实观察")+'</p></div>'+
 box("记录边界","不要从图片、文案或选择项推断自己尝到了某种味道。")+'</div>';},
 controls(s,H){return H.field("计划或已观察的材料","kind",s.kind,"select",[["0","无糖温茶"],["1","麦茶"],["2","清水对照"]])+
 H.field("香气描述","aroma",s.aroma,"select",[["0","不确定"],["1","草木香"],["2","谷物香"],["3","较淡"]])+
 H.field("口感描述","mouth",s.mouth,"select",[["0","不确定"],["1","清爽"],["2","柔和"],["3","偏涩"]])+
 H.field("回味描述","after",s.after,"select",[["0","未判断"],["1","较短"],["2","较长"]])+
 '<div class="control-row">'+H.btn(s.actual?"标记尚未观察":"标记本人已观察","actual")+'</div>'+
 H.field("现实记录与限制","note",s.note,"textarea");},
 click(a,d,s){if(a==="actual")s.actual=!s.actual;},
 status:"不收集真实嗅觉味觉生物测量数据。"};
const glyphs=["◯","△","☰","◇","☷","✦"];
M[104]={
 heading:"象数文化 · 编一段符号故事",
 goal:"用抽象符号按自定顺序构建一段文化创作故事，并解释其中象征。",
 instruction:"点击符号改变排列，再写下每个符号在你的原创故事中代表什么。",
 boundary:"这是文化符号创作，不进行命运占卜、概率预测或任何现实事件预言。",
 hasArt:true,
 init(){return {symbols:[0,2,3,5],active:0,story:"圆代表相聚，三条横线代表路径，菱形代表选择，星形代表希望。",meaning:"所有对应关系均由创作者定义。"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">SYMBOLIC STORYTELLING / NO FORTUNE TELLING</div>'+
 '<div class="symbol-story">'+s.symbols.map((idx,i)=>'<button data-act="slot" data-idx="'+i+'" class="symbol-card'+(s.active===i?" active":"")+'"><strong>'+glyphs[idx]+'</strong><small>第'+(i+1)+'幕</small></button>').join('')+'</div>'+
 box("原创故事",s.story)+'</div>';},
 controls(s,H){return H.field("当前符号","symbol",s.symbols[s.active],"select",glyphs.map((x,i)=>[i,x]))+
 H.field("符号故事","story",s.story,"textarea")+
 H.field("解读边界","meaning",s.meaning,"textarea")+
 '<div class="control-row">'+H.btn("恢复原创示范","reset")+'</div>';},
 change(k,v,s){if(k==="symbol")s.symbols[s.active]=Number(v);},
 click(a,d,s){if(a==="slot")s.active=Number(d.idx);if(a==="reset")Object.assign(s,this.init());},
 status:"不把符号排列用于未来预测或生活决策。"};
M[105]={
 heading:"宠物正向训练 · 记录可观察行为",
 goal:"设计合适的正向强化训练日志，区分训练计划、动物实际反应和福利边界。",
 instruction:"为一次简单、安全、适合个体动物的训练拟定目标、鼓励方式和观察记录。",
 boundary:"不建议惩罚、强迫、危险接触或未经专业指导的特殊训练；不同动物需不同福利条件。",
 init(){return {stage:0,attempts:0,reward:"根据动物情况使用安全、合适且不过量的奖励",observed:"尚未进行真实训练",note:"如动物明显恐惧、疲劳或不适，应停止。"};},
 stage(s){const stages=["准备适宜环境","选择易理解目标","观察动物自主反应","做正向鼓励与暂停"];
 return '<div class="stage-frame"><div class="section-label">ANIMAL WELFARE / POSITIVE REINFORCEMENT LOG</div>'+
 '<div class="movement-grid">'+stages.map((x,i)=>'<button class="move-tile'+(s.stage===i?" picked":"")+'" data-act="stage" data-idx="'+i+'"><small>步骤'+(i+1)+'</small><strong>'+e(x)+'</strong></button>').join('')+'</div>'+
 box("真实记录状态",s.observed)+'</div>';},
 controls(s,H){return H.field("正向鼓励的安全选择","reward",s.reward,"textarea")+
 H.field("真实动物反应（或注明未尝试）","observed",s.observed,"textarea")+
 H.field("安全停止原则","note",s.note,"textarea");},
 click(a,d,s){if(a==="stage")s.stage=Number(d.idx);},
 status:"网页无法判断动物是否理解指令，更不应据模拟称作驯养能力测评。"};
M[106]={
 heading:"豆苗14天观察 · 用真实数据绘图",
 goal:"逐日填写现实观察的豆苗高度，区分真实测量和尚未测量。",
 instruction:"选日期、输入本人测得的高度，再点击记录；曲线只根据你提交的数值绘制。",
 boundary:"不凭虚构高度生成看似真实的植物生长结果；记录需对照实际植株和环境。",
 hasArt:true,
 init(){return {day:0,height:0,values:Array(14).fill(null),sun:"自然光，需记录实际条件",notes:"测量时尽量用同一方法和同一参考点。"};},
 stage(s){const points=s.values.map((v,i)=>v!==null?{day:i,h:v}:null).filter(Boolean);
 const ymax=Math.max(5,...points.map(x=>x.h+2));
 const lines=points.map(p=>(45+p.day*42)+','+(290-p.h/ymax*230)).join(' ');
 const missing=s.values.filter(x=>x===null).length;
 return '<div class="stage-frame"><div class="section-label">PLANT GROWTH / REAL INPUT ONLY</div><div class="artboard">'+
 '<svg class="art-export" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 340"><rect width="660" height="340" fill="#f4fbf3"/>'+
 '<path d="M45 40 V290 H630" fill="none" stroke="#83a38c" stroke-width="3"/>'+
 (points.length>1?'<polyline points="'+lines+'" fill="none" stroke="#5ca26d" stroke-width="5"/>':'')+
 points.map(p=>'<circle cx="'+(45+p.day*42)+'" cy="'+(290-p.h/ymax*230)+'" r="6" fill="#3e8b58"/>').join('')+
 '<text x="330" y="326" text-anchor="middle" fill="#527d69" font-size="14">第1—14天 · 仅显示已有真实记录</text></svg></div>'+
 box("已记录天数",points.length+" / 14天；仍未填写"+missing+"天。未填写的天数不会自动补造。")+'</div>';},
 controls(s,H){return H.field("选择观测日","day",s.day,"select",Array.from({length:14},(_,i)=>[i,"第"+(i+1)+"天"]))+
 H.field("当日实测高度（暂未测量请勿点击记录）","height",s.height,"range",{min:0,max:30,step:.5,unit:"cm"})+
 '<div class="control-row">'+H.btn("记录这一天","record","primary")+H.btn("清除当前日记录","erase")+'</div>'+
 H.field("实际光照条件","sun",s.sun,"text")+H.field("测量与环境说明","notes",s.notes,"textarea");},
 click(a,d,s){if(a==="record")s.values[s.day]=s.height;if(a==="erase")s.values[s.day]=null;},
 status:"导出的个人作品只包含本人录入的值；未观测保持空白。"};
M[107]={
 heading:"暴雨预警 · 来源验证和撤离准备",
 goal:"观察模拟暴雨消息，先区分官方预警与谣传，再设计低风险信息核实顺序。",
 instruction:"选择你先核实的信息来源，判断哪一条消息不应直接当作安全指令。",
 boundary:"全部地名与警报都是虚构情境；真实危险时必须遵循当地政府、气象和应急部门的最新指引。",
 init(){return {source:0,route:0,prepared:[true,false,false],note:"先确认官方预警、所在地区和安全路线，不涉险穿过积水。"};},
 stage(s){const sources=["当地官方气象或应急信息","社交平台不明账号的转发","朋友发来的没有日期的截图"];
 const routes=["依据官方路线前往指定安全区域","穿过看似较浅的积水道路","因为旧经验认为没事而完全不核实"];
 return '<div class="stage-frame"><div class="section-label">STORM ALERT / SOURCE VERIFICATION</div>'+
 '<div class="claim-quote">虚构：某地发布暴雨警报<small>这不是现实天气或灾害提示</small></div>'+
 '<div class="cue-box"><b>首选信息来源</b><p>'+e(sources[s.source])+'</p><b>计划行动</b><p>'+e(routes[s.route])+'</p></div>'+
 box("安全原则","官方信息的更新时间、影响区域、撤离指示与安全通道必须优先核实。不冒险涉水通行。")+'</div>';},
 controls(s,H){return H.field("优先核查来源","source",s.source,"select",[["0","官方预警"],["1","匿名转发"],["2","无日期截图"]])+
 H.field("模拟行动方案","route",s.route,"select",[["0","遵循官方安全路线"],["1","穿过积水"],["2","不核查"]])+
 H.field("还要准备和核实什么？","note",s.note,"textarea");},
 status:"网页不会预测风险。现实危险时应根据官方实时信息行动。"};
M[108]={
 heading:"多文化欢迎仪式 · 自愿参与流程",
 goal:"规划欢迎仪式的时间安排、角色和信息传递，兼顾文化尊重、无障碍与参与自愿。",
 instruction:"逐阶段调整时间与内容，确保没有人因文化差异、语言或不愿发言而被迫参与。",
 boundary:"本项只是活动规划，不能推断主持能力或代表任何文化传统的唯一正确做法。",
 init(){return {blocks:[10,15,15,10],active:0,volume:35,optIn:true,plan:["说明活动目的和自愿原则","简短介绍参与安排","自愿分享或观看交流","结束、感谢与退出方式"],note:"事先询问参与需求，不强迫参加特定仪式。"};},
 stage(s){const names=["欢迎","流程说明","自愿交流","结束"];
 const total=s.blocks.reduce((a,b)=>a+b,0);
 return '<div class="stage-frame"><div class="section-label">INCLUSIVE CEREMONY / ACTIVITY PLAN</div><div class="gantt-list">'+s.blocks.map((v,i)=>
 '<button class="gantt-step'+(s.active===i?" selected":"")+'" data-act="block" data-idx="'+i+'"><span>'+names[i]+'</span><strong>'+v+'分钟</strong><small>'+e(s.plan[i])+'</small></button>').join('')+'</div>'+
 box("计划概览","总时长"+total+"分钟；模拟音量档位"+s.volume+"（非实际分贝）；"+(s.optIn?"已明确允许自愿参与":"尚未明确自愿参与原则。"))+'</div>';},
 controls(s,H){return H.field("当前环节时间","duration",s.blocks[s.active],"range",{min:5,max:30,step:5,unit:"分钟"})+
 H.field("当前环节内容","planText",s.plan[s.active],"textarea")+
 H.field("音量示意档位","volume",s.volume,"range",{min:0,max:100,step:5})+
 '<div class="control-row">'+H.btn(s.optIn?"取消自愿参加声明":"启用自愿参加声明","optin")+'</div>'+
 H.field("无障碍与文化尊重说明","note",s.note,"textarea");},
 change(k,v,s){if(k==="duration")s.blocks[s.active]=Number(v);if(k==="planText")s.plan[s.active]=v;},
 input(k,v,s){this.change(k,v,s);},
 click(a,d,s){if(a==="block")s.active=Number(d.idx);if(a==="optin")s.optIn=!s.optIn;},
 status:"不能通过活动流程模拟判断真实文化理解或领导才能。"};
})(window.QX_MODULES);