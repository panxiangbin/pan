"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const E=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
M[21]={
 heading:"六行小诗 · 节奏与意象实验",goal:"完成6行短诗，观察停顿、画面感和重复词怎样改变朗读节奏。",
 instruction:"选中一行后编辑内容。可以修改重复词和意象，但不会给诗歌机械打分。",
 boundary:"自动字符统计不能证明文学创造力，作品审美也不是唯一标准。",
 init(){return {lines:["夜色落在窗前，","雨轻轻敲着玻璃。","路灯照亮一把伞，","脚步声在远处停下。","有人等到最后一班车，","雨仍轻轻敲着玻璃。"],pick:0,theme:"窗外的雨"};},
 stage(s){const count=s.lines.reduce((n,x)=>n+[...x].length,0);
 return '<div class="stage-frame"><div class="section-label">SIX LINE POETRY · 共'+count+'字</div><div class="poetry-paper">'+s.lines.map((t,i)=>'<button type="button" class="poem-line'+(s.pick===i?" picked":"")+'" data-act="line" data-idx="'+i+'"><span>'+String(i+1).padStart(2,"0")+'</span>'+E(t||"（留白）")+'</button>').join('')+'</div></div>'+
 '<div class="cue-box"><b>观察方向</b><p>第2与第6行可以重复同一意象，但也可以改为不同画面，看看节奏感和故事感发生什么变化。</p></div>';},
 controls(s,H){return H.field("诗歌主题","theme",s.theme,"text")+
 H.field("第"+(s.pick+1)+"行","lineText",s.lines[s.pick],"textarea")+
 '<div class="control-row">'+H.btn("上一行","prev")+H.btn("下一行","next")+H.btn("恢复示范","reset")+'</div>';},
 change(k,v,s){if(k==="lineText")s.lines[s.pick]=v;},
 input(k,v,s){this.change(k,v,s);},
 click(a,d,s){if(a==="line")s.pick=Number(d.idx);if(a==="prev")s.pick=Math.max(0,s.pick-1);if(a==="next")s.pick=Math.min(5,s.pick+1);if(a==="reset")Object.assign(s,this.init());},
 status:"诗歌支持逐行修改、留白和作品导出。"};
const acts=[{title:"第一幕·建立情境",goal:"角色发现车票遗失",conflict:"末班车即将出发",turn:"有人似乎捡到了车票"},
{title:"第二幕·障碍升级",goal:"追回车票登车",conflict:"捡到票的人不愿交出",turn:"发现车票上写着另一个名字"},
{title:"第三幕·结局抉择",goal:"理解真相并作出决定",conflict:"一人赶车，一人需要帮助",turn:"他们选择留下一起解决困难"}];
M[22]={
 heading:"三幕剧本 · 冲突和转折编辑器",goal:"把“丢失车票”扩写成包含目标、阻碍和选择的三幕短剧。",
 instruction:"点击幕次，再修改角色目标、冲突与转折，观察事件因果关系是否连贯。",
 boundary:"这是基础剧作结构练习；剧本质量仍需阅读与演出反馈验证。",
 init(){return {acts:JSON.parse(JSON.stringify(acts)),selected:0,characters:"旅客、检票员"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">THREE-ACT STORY STRUCTURE</div><div class="act-grid">'+s.acts.map((act,i)=>
 '<button class="act-card'+(s.selected===i?" active":"")+'" data-act="act" data-idx="'+i+'"><small>ACT '+(i+1)+'</small><b>'+E(act.title)+'</b><span>目标：'+E(act.goal)+'</span><span>阻碍：'+E(act.conflict)+'</span><span>转折：'+E(act.turn)+'</span></button>').join('')+'</div></div>';},
 controls(s,H){const act=s.acts[s.selected];return H.field("参与角色","characters",s.characters,"text")+
 H.field("这一幕的角色目标","actGoal",act.goal,"textarea")+
 H.field("这一幕的主要阻碍","actConflict",act.conflict,"textarea")+
 H.field("这一幕的转折或后果","actTurn",act.turn,"textarea")+
 '<div class="control-row">'+H.btn("上一幕","prev")+H.btn("下一幕","next")+H.btn("恢复剧本","reset")+'</div>';},
 change(k,v,s){const act=s.acts[s.selected];if(k==="actGoal")act.goal=v;if(k==="actConflict")act.conflict=v;if(k==="actTurn")act.turn=v;},
 input(k,v,s){this.change(k,v,s);},
 click(a,d,s){if(a==="act")s.selected=Number(d.idx);if(a==="prev")s.selected=Math.max(0,s.selected-1);if(a==="next")s.selected=Math.min(2,s.selected+1);if(a==="reset")Object.assign(s,this.init());},
 status:"每一幕都可以编辑目标、障碍和转折，并保存完整结构。"};
const riskyWords=["最好","第一","绝对","100%","永久","唯一","最强","无敌","包治","零风险","万能"];
M[23]={
 heading:"同一产品 · 两类受众的文案",goal:"写出有具体使用场景和真实依据的产品文案，排查夸大表达。",
 instruction:"切换目标受众，修改主标题和卖点。风险提示只是关键词检查，并不能代替平台审核。",
 boundary:"关键词提示不等于法律或平台合规意见；产品材质、价格及功效描述须核实后才能发布。",
 init(){return {audience:"通勤使用者",title:"轻便随行保温杯",feature:"盖子方便单手操作，适合日常通勤携带。",proof:"材质、尺寸、保温数据以产品实测与说明书为准",tone:"清晰实用"};},
 stage(s){const joined=s.title+s.feature+s.proof,flag=riskyWords.filter(x=>joined.includes(x));
 return '<div class="ad-preview"><span class="ad-kicker">PRODUCT MESSAGE / '+E(s.audience)+'</span><div class="ad-product">◇</div><h2>'+E(s.title)+'</h2><p>'+E(s.feature)+'</p><small>'+E(s.proof)+'</small></div>'+
 '<div class="cue-box"><b>发布前的自查</b><p>'+ (flag.length?'发现需人工核实的表达：'+E(flag.join('、')):'暂未发现预设的明显极限词；仍需核查事实依据、图片和平台规则。')+'</p></div>';},
 controls(s,H){return H.field("受众","audience",s.audience,"select",[["通勤使用者","通勤使用者"],["学生群体","学生群体"],["户外旅行者","户外旅行者"]])+
 H.field("产品主标题","title",s.title,"text")+
 H.field("一个具体卖点","feature",s.feature,"textarea")+
 H.field("信息依据或待核实事项","proof",s.proof,"textarea")+
 H.field("表达风格","tone",s.tone,"select",[["清晰实用","清晰实用"],["轻快生活","轻快生活"],["技术说明","技术说明"]])+
 '<div class="control-row">'+H.btn("通勤文案示范","commute")+H.btn("学生文案示范","student")+'</div>';},
 click(a,d,s){if(a==="commute"){s.audience="通勤使用者";s.title="轻便随行保温杯";s.feature="盖子便于开合，适合上班通勤携带。";}
 if(a==="student"){s.audience="学生群体";s.title="课间饮水更方便";s.feature="便于放进书包，适合教室和图书馆使用。";}},
 status:"内容会实时显示成产品介绍，并提示需核实的极限词。"};
M[24]={
 heading:"一件争议 · 正反观点证据板",goal:"围绕城市夜间照明，练习提出观点、证据和可回应的反例。",
 instruction:"不是选阵营，而是分别写明支持与反对观点，并指出你尚需核实的事实。",
 boundary:"观点数量和文字长度不是批判思维能力的有效量尺；事实需外部资料验证。",
 init(){return {topic:"城市是否应延长夜间公共照明？",support:"适度延长有利于夜间行人识别道路环境。",oppose:"额外照明可能增加能耗和光污染。",evidence:"需要核查人流量、能耗和事故记录。",revise:"根据不同街区实际情况采用分时分区照明。"};},
 stage(s){return '<div class="argument-grid"><div class="argument pro"><b>支持理由</b><p>'+E(s.support)+'</p></div>'+
 '<div class="argument con"><b>反对理由</b><p>'+E(s.oppose)+'</p></div></div>'+
 '<div class="cue-box"><b>待核查依据</b><p>'+E(s.evidence)+'</p><b>可能的折中方案</b><p>'+E(s.revise)+'</p></div>';},
 controls(s,H){return H.field("讨论议题","topic",s.topic,"text")+
 H.field("支持立场的理由","support",s.support,"textarea")+
 H.field("反对立场的理由","oppose",s.oppose,"textarea")+
 H.field("还缺哪些事实证据？","evidence",s.evidence,"textarea")+
 H.field("根据反例做出的修改","revise",s.revise,"textarea")+
 H.btn("恢复示范","reset");},
 click(a,d,s){if(a==="reset")Object.assign(s,this.init());},
 status:"支持与反对立场均可保留，允许修正原观点。"};
M[25]={
 heading:"同一句请求 · 两种语域翻译",goal:"尝试把相同的请求写成正式和日常两种英语表达，对比礼貌和信息保留情况。",
 instruction:"改写两种英文版本。记得保持请求的对象、截止时间和内容，不要只追求字面对应。",
 boundary:"本站不自动判断译文是否准确或有语言能力天赋；译文需要人工与真实场景核对。",
 init(){return {source:"您好，方便在周五前发来最新版的产品说明书吗？谢谢。",formal:"Could you please send us the latest product manual by Friday? Thank you.",casual:"Could you send me the updated manual by Friday? Thanks!",purpose:"保留截止时间、文件名称和请求语气。"};},
 stage(s){return '<div class="translation"><div class="source"><b>中文原文</b><p>'+E(s.source)+'</p></div>'+
 '<div class="pair"><div><b>正式表达</b><p>'+E(s.formal)+'</p></div><div><b>日常表达</b><p>'+E(s.casual)+'</p></div></div></div>'+
 '<div class="cue-box"><b>对比要点</b><p>'+E(s.purpose)+'</p></div>';},
 controls(s,H){return H.field("中文原文","source",s.source,"textarea")+
 H.field("正式英文翻译","formal",s.formal,"textarea")+
 H.field("日常英文翻译","casual",s.casual,"textarea")+
 H.field("需要保留的信息","purpose",s.purpose,"textarea")+
 H.btn("恢复参考示范","reset");},
 click(a,d,s){if(a==="reset")Object.assign(s,this.init());},
 status:"双版本可编辑，作品导出后方便与真实翻译核对。"};
M[26]={
 heading:"两分钟介绍 · 演说计时台",goal:"将陌生流程整理成开场、核心说明、结尾行动三部分，并练习时间安排。",
 instruction:"修改演讲提纲，点击计时器模拟一次两分钟演讲。实测表达质量仍需现实听众反馈。",
 boundary:"计时与写提纲无法单独评价口才、演说表现或实际声音清晰度。",
 init(){return {start:"先说清楚听众将学会什么。",main:"按开始、关键步骤、异常处理三个部分介绍。",end:"用一句话总结并提醒听众下一步行动。",time:120,running:false,record:"尚未开始现实试讲"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">TWO-MINUTE PRESENTATION</div><div class="timer-big">'+String(Math.floor(s.time/60)).padStart(2,"0")+':'+String(s.time%60).padStart(2,"0")+'</div>'+
 '<div class="speech-beats"><div><b>开场</b><p>'+E(s.start)+'</p></div><div><b>重点</b><p>'+E(s.main)+'</p></div><div><b>结尾</b><p>'+E(s.end)+'</p></div></div></div><div class="cue-box"><b>线下试讲记录</b><p>'+E(s.record)+'</p></div>';},
 controls(s,H){return H.field("开场要点","start",s.start,"textarea")+H.field("主体结构","main",s.main,"textarea")+
 H.field("结尾行动","end",s.end,"textarea")+H.field("实际观察反馈","record",s.record,"textarea")+
 '<div class="control-row">'+H.btn(s.running?"暂停计时":"开始计时",s.running?"pause":"start","primary")+H.btn("重置120秒","reset")+'</div>';},
 click(a,d,s,H){if(a==="reset"){H.cleanTimers();s.time=120;s.running=false;}
 if(a==="pause"){H.cleanTimers();s.running=false;}
 if(a==="start"&&!s.running){s.running=true;const tick=()=>{if(!s.running)return;s.time=Math.max(0,s.time-1);H.rerender();if(s.time>0)H.addTimer(setTimeout(tick,1000));else s.running=false;};H.addTimer(setTimeout(tick,1000));}
 },
 status:"计时在浏览器本地进行；后台标签页可能暂停计时，不作为严格秒表。"};
M[27]={
 heading:"日常小事 · 幽默结构设计",goal:"把忘带钥匙的小经历改写成有铺垫、误导和反转的段子。",
 instruction:"分别修改三个部分，尝试不同转折，但避免拿真实个人或群体开恶意玩笑。",
 boundary:"文本模板无法判定真实观众是否觉得好笑，也不把笑点结构当成幽默天赋分数。",
 init(){return {setup:"出门时，我觉得今天准备得特别充分。",expect:"手机、钱包、耳机、咖啡，一个都没忘。",punchline:"然后发现：门钥匙在屋里，最充分的是门锁的工作。",note:"让意外来自生活，而不是冒犯别人。"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">COMEDY WRITING / THREE BEATS</div>'+
 '<div class="comedy-paper"><p>'+E(s.setup)+'</p><p>'+E(s.expect)+'</p><p><strong>'+E(s.punchline)+'</strong></p></div></div>'+
 '<div class="cue-box"><b>创作检查</b><p>'+E(s.note)+'</p></div>';},
 controls(s,H){return H.field("铺垫","setup",s.setup,"textarea")+
 H.field("让观众形成预期","expect",s.expect,"textarea")+
 H.field("反转句","punchline",s.punchline,"textarea")+
 H.field("修改依据","note",s.note,"textarea")+
 '<div class="control-row">'+H.btn("换一种反转","twist")+H.btn("恢复示范","reset")+'</div>';},
 click(a,d,s){if(a==="twist")s.punchline="到公司才发现，钥匙我带了——只是那把属于三年前的旧门。";if(a==="reset")Object.assign(s,this.init());},
 status:"可以编辑铺垫、预期和反转，导出完整段子。"};
})(window.QX_MODULES);