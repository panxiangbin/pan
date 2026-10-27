"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const e=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const b=(title,body)=>'<div class="cardmini"><b>'+e(title)+'</b><p>'+e(body)+'</p></div>';
const chips=(labels,selected,act)=>'<div class="control-row">'+labels.map((x,i)=>'<button class="btn'+(selected===i?' primary':'')+'" data-act="'+act+'" data-idx="'+i+'">'+e(x)+'</button>').join('')+'</div>';
const evidence=(items,s,act)=>'<div class="evidence-grid">'+items.map((t,i)=>'<button type="button" class="evidence-card'+(s.includes(i)?' checked':'')+'" data-act="'+act+'" data-idx="'+i+'"><span>'+(s.includes(i)?'✓ 选入依据':'＋ 纳入依据')+'</span><strong>'+e(t[0])+'</strong><small>'+e(t[1])+'</small></button>').join('')+'</div>';
const toggle=(s,k,i)=>{const arr=s[k];if(arr.includes(i))s[k]=arr.filter(x=>x!==i);else s[k]=[...arr,i].sort((a,b)=>a-b);};
M[28]={
 heading:"四张线索卡 · 重建事件时间线",
 goal:"利用时间记录、先后关系和不确定来源，将模拟史料按发生时间排序。",
 instruction:"先观察四份材料日期，选择卡片并上下移动，再检查你拼出的顺序。",
 boundary:"这里使用虚构档案，不是史实知识测验；真实历史研究需要来源鉴定和交叉验证。",
 init(){return {order:[2,0,3,1],selected:0,checked:false,notes:"文档的成文时间可能不等于事件发生时间。"};},
 stage(s){const docs=[["港口水位首次升高","6月3日早晨","河道记录册"],["第一次停航通知","6月4日中午","码头公告"],["连续暴雨开始","6月2日夜间","雨量仪日志"],["新航线重新开放","6月6日清晨","航运日报"]];
 return '<div class="stage-frame"><div class="section-label">FICTIONAL HISTORICAL DOCUMENTS / CHRONOLOGY</div>'+
 s.order.map((idx,pos)=>'<button class="source-row'+(s.selected===pos?' active':'')+'" data-act="choose" data-idx="'+pos+'"><span class="source-order">'+(pos+1)+'</span><span><strong>'+e(docs[idx][0])+'</strong><small>'+e(docs[idx][1])+' · '+e(docs[idx][2])+'</small></span></button>').join('')+'</div>'+
 (s.checked?'<div class="cue-box"><b>'+((s.order.join(',')==='2,0,1,3')?'时间线一致':'仍有顺序需要核对')+'</b><p>依据材料注明的事件时点，顺序应为：暴雨开始 → 水位升高 → 停航 → 恢复。</p></div>':'<div class="cue-box">将卡片从最早的事件排列到最晚。可以先记录哪些材料需要核实。</div>');},
 controls(s,H){return '<div class="control-row">'+H.btn("↑ 把选中卡上移","up")+H.btn("↓ 把选中卡下移","down")+H.btn("检查顺序与依据","verify","primary")+'</div>'+H.field("哪些日期可能存在争议？","notes",s.notes,"textarea")+H.btn("重新打乱示例","reset");},
 click(a,d,s){if(a==="choose")s.selected=Number(d.idx);
 if((a==="up"&&s.selected>0)||(a==="down"&&s.selected<3)){const next=s.selected+(a==="up"?-1:1);[s.order[s.selected],s.order[next]]=[s.order[next],s.order[s.selected]];s.selected=next;}
 if(a==="verify")s.checked=true;if(a==="reset")Object.assign(s,this.init());},
 status:"材料为虚构事件：结论仅针对本组卡片里的时间记录。"};
M[29]={
 heading:"无标签古器物 · 用证据检验用途假设",
 goal:"给一件虚构出土器物列出三种用途，比较形状、磨损和发现环境。",
 instruction:"勾选证据，切换假设。比一比不同证据对推断的支持和局限。",
 boundary:"所有材料均为教学虚构数据；网页不能确定真实文物年代、用途或出土背景。",
 init(){return {selected:0,selectedEvidence:[0,2],method:0,notes:"待确认器物年代与真实发现地点。"};},
 stage(s){const ev=[["边缘有反复摩擦纹","有可能与长期接触其他物品有关"],["内部残留少量矿物颗粒","尚未完成成分与污染对照"],["底部平整且直径较宽","可能方便竖直放置"],["旁边同时发现陶片","出土共现未必表示共同用途"]];
 const names=["盛装与保存","研磨或加工","装饰与仪式"],support=[[2,3],[0,1],[3]];
 const overlap=s.selectedEvidence.filter(n=>support[s.selected].includes(n)).length;
 return '<div class="stage-frame"><div class="section-label">HYPOTHESIS × EVIDENCE</div><div class="artifact-row"><svg viewBox="0 0 260 180" role="img" aria-label="虚构陶器形状示意"><ellipse cx="130" cy="151" rx="75" ry="14" fill="#ced5d7"/><path d="M69 45 Q57 145 107 150 H153 Q202 145 190 45Z" fill="#caa278" stroke="#7b675a" stroke-width="5"/><ellipse cx="130" cy="45" rx="62" ry="17" fill="#e2bd91" stroke="#7b675a" stroke-width="5"/><path d="M89 80 Q130 98 171 80" fill="none" stroke="#9d7759" stroke-width="5"/></svg><div><b>匿名出土器物 X-01</b><p>仅提供模拟外形和四条可检验线索，不提供唯一用途标签。</p><div class="pill">当前研究假设：'+names[s.selected]+'</div><p>与该假设相关的已选证据：'+overlap+' 项</p></div></div>'+
 evidence(ev,s.selectedEvidence,"evidence")+'</div>';},
 controls(s,H){return H.field("选择当前研究假设","selected",s.selected,"select",[["0","盛装与保存"],["1","研磨或加工"],["2","装饰与仪式"]])+
 H.field("下一项实际验证方法","method",s.method,"select",[["0","检测残留物并设置空白对照"],["1","显微观察磨损并与实验复制品比较"],["2","核对地层与同期器物记录"]])+
 H.field("还有哪些未知信息？","notes",s.notes,"textarea")+'<p class="hint">相关证据数量不是用途概率；可记录与假设相矛盾的证据。</p>';},
 click(a,d,s){if(a==="evidence")toggle(s,"selectedEvidence",Number(d.idx));},
 status:"未证实前，假设应保留竞争关系。"};
M[30]={
 heading:"虚构古字符 · 比较笔画证据",
 goal:"观察未知符号的笔画、方向和组合，尝试匹配候选释读。",
 instruction:"改变图样显示细节后选择一个候选，明确你支持该判断的笔画证据。",
 boundary:"使用虚构字符，不代表任何实际古文字的真实释读。古文字研究必须依赖语料与语境。",
 init(){return {trace:70,mirrored:false,selected:0,clue:false,reason:"先比较交叉笔画数量，不凭图形外形直接认字。"};},
 stage(s){const mirror=s.mirrored?'translate(220,0) scale(-1,1)':'';
 return '<div class="stage-frame"><div class="section-label">UNKNOWN GLYPH / SHAPE COMPARISON</div><div class="glyph-panel">'+
 '<svg viewBox="0 0 280 255" xmlns="http://www.w3.org/2000/svg"><rect width="280" height="255" rx="16" fill="#f5ead4"/><g transform="translate(28 17) '+mirror+'" stroke="#55504a" stroke-linecap="round" stroke-width="13" fill="none"><path d="M110 17 V205 M35 60 Q110 45 187 60 M45 127 Q107 156 182 126 M110 89 L63 193 M111 88 L173 196" opacity="'+s.trace/100+'"/></g></svg>'+
 '<div><b>无来源铭记片（虚构）</b><p>此符号没有真实读音、年代和语料环境。只检验你如何描述与比较形状。</p><p class="pill">候选：'+["树状构形","道路分支","抽象装饰"][s.selected]+'</p></div></div>'+
 (s.clue?'<div class="cue-box"><b>形状观察提示</b><p>可以看到一条竖向主笔、横向交叉与两条向下斜笔。三种含义目前均无法通过形状独立确证。</p></div>':'')+'</div>';},
 controls(s,H){return H.field("石片磨损后的笔画清晰度","trace",s.trace,"range",{min:25,max:100,step:5,unit:"%"})+
 H.field("你的候选释读","selected",s.selected,"select",[["0","树状构形"],["1","道路分支"],["2","抽象装饰"]])+
 H.field("笔画对比理由","reason",s.reason,"textarea")+
 '<div class="control-row">'+H.btn("左右翻转比对","flip")+H.btn("显示形状提示","hint")+'</div>';},
 click(a,d,s){if(a==="flip")s.mirrored=!s.mirrored;if(a==="hint")s.clue=!s.clue;},
 status:"没有出土地点、语料和比对材料时，任何释读都只是候选。"};
const variants=[
{base:"村民在桥边等待商船",a:"村民在桥边等待商船",b:"村民在桥边等待军船",note:"船只类型不同，影响对事件性质的判断。"},
{base:"记录中写道：夜里三次鸣钟",a:"夜里三次鸣钟",b:"夜里二次鸣钟",note:"数词变化，可能来自抄写误差或不同版本。"},
{base:"官员随后关闭南门",a:"官员随后关闭南门",b:"官员随后打开南门",note:"动作相反，必须核对其他来源。"}
];
M[31]={
 heading:"手抄文本校勘 · 三处异文",
 goal:"并排比较两个虚构抄本，标记有歧义的词，再为每处写校勘意见。",
 instruction:"逐条比较 A/B 两个版本；选定作为底本的字句，并解释为什么需要留存异文。",
 boundary:"不能仅凭哪个词更顺口确定真实原文；所有文字片段是模拟抄本文本。",
 init(){return {index:0,choices:[-1,-1,-1],annotation:"优先核对抄本来源、年代与上下文。"};},
 stage(s){const v=variants[s.index];
 return '<div class="stage-frame"><div class="section-label">TEXTUAL CRITICISM / VARIANTS</div>'+chips(["异文 1","异文 2","异文 3"],s.index,"case")+
 '<div class="argument-grid"><div class="argument pro"><b>抄本 A</b><p style="font-size:21px">'+e(v.a)+'</p></div><div class="argument con"><b>抄本 B</b><p style="font-size:21px">'+e(v.b)+'</p></div></div>'+
 '<p class="hint">'+e(v.note)+'</p><div class="cue-box"><b>目前选择</b><p>'+["未作选定","选 A 作为暂定底本","选 B 作为暂定底本"][s.choices[s.index]+1]+'</p></div></div>';},
 controls(s,H){return '<div class="control-row">'+H.btn("暂定采用 A","pickA")+H.btn("暂定采用 B","pickB")+H.btn("保持存疑","unset")+'</div>'+
 H.field("校勘说明","annotation",s.annotation,"textarea")+
 '<p class="hint">保留存疑是合理选项；三份不同材料并不保证存在唯一答案。</p>';},
 click(a,d,s){if(a==="case")s.index=Number(d.idx);if(a==="pickA")s.choices[s.index]=0;if(a==="pickB")s.choices[s.index]=1;if(a==="unset")s.choices[s.index]=-1;},
 status:"所有版本均为教学用虚构抄本。"};
const folk=[
["河畔镇","秋季交换自制灯笼","夜间、集体绘制、家人参加","制作并互赠灯笼"],
["山谷镇","秋季交换手织彩绳","白天、社区集市、家人参加","编织并互赠彩绳"]
];
M[32]={
 heading:"两种节俗 · 相同之处与局限",
 goal:"比较两个虚构社区的节日实践，辨别共同功能与不可直接类推的差异。",
 instruction:"选择你想比较的维度，找出共同点，写下需要向当地参与者继续核实的地方。",
 boundary:"案例完全虚构，不能用来推断任何现实民族、宗教或地区的固有特征。",
 init(){return {dimension:0,common:"都有参与者之间的互赠与聚会。",difference:"活动的时间与材料并不相同。",verification:"需要分别访谈本地居民并确认习俗并非人人参与。"};},
 stage(s){const dimensions=["活动内容","开展时间","参与方式","互赠物品"];
 const a=[folk[0][1],"夜间","家庭与社区","自制灯笼"],b=[folk[1][1],"白天","家庭与社区","手织彩绳"];
 return '<div class="stage-frame"><div class="section-label">FOLK CUSTOM / COMPARE CONTEXT</div>'+chips(dimensions,s.dimension,"dim")+
 '<div class="argument-grid"><div class="argument pro"><b>'+folk[0][0]+'</b><p>'+e(a[s.dimension])+'</p></div><div class="argument con"><b>'+folk[1][0]+'</b><p>'+e(b[s.dimension])+'</p></div></div>'+
 '<div class="cue-box"><b>比较视角</b><p>不要仅用一个节俗描述推断整个社区的共同价值。可同时记录参与者、季节、材料和外来传播。</p></div></div>';},
 controls(s,H){return H.field("两种习俗的共同点","common",s.common,"textarea")+
 H.field("不可直接类推的差异","difference",s.difference,"textarea")+
 H.field("进一步的现场核实","verification",s.verification,"textarea");},
 click(a,d,s){if(a==="dim")s.dimension=Number(d.idx);},
 status:"民俗研究尊重参与者的多样性，避免刻板印象。"};
M[33]={
 heading:"两个神话片段 · 对照叙事母题",
 goal:"观察虚构的洪水故事，区分共享叙事结构与未经证实的文化联系。",
 instruction:"点选叙事阶段，比较两个虚构故事如何处理预兆、危机与重建。",
 boundary:"内容是为练习创作的虚构神话；共同母题不能证明存在共同历史来源。",
 init(){return {stage:0,links:[0,2],interpret:"相同的危机叙事可以由不同的经验与传播路径产生。"};},
 stage(s){const stages=["预兆","大水","求生","重建"];
 const A=["夜晚湖水持续上涨","河水漫过石桥","村民搭起木筏","人们在高地种植新树"],
 B=["天空出现异常云层","山谷遭遇连续暴雨","居民迁至旧塔","人们改造新的排水沟"];
 return '<div class="stage-frame"><div class="section-label">FICTIONAL MYTH MOTIFS</div>'+chips(stages,s.stage,"stage")+
 '<div class="argument-grid"><div class="argument pro"><b>故事 A · 湖畔</b><p>'+A[s.stage]+'</p></div><div class="argument con"><b>故事 B · 山谷</b><p>'+B[s.stage]+'</p></div></div>'+
 '<p class="hint">选中母题：'+s.links.map(x=>stages[x]).join('、')+'</p></div>';},
 controls(s,H){return '<div class="control-row">'+H.btn("将当前阶段标记为共同母题","toggle")+'</div>'+H.field("相似性可能来自哪里？","interpret",s.interpret,"textarea");},
 click(a,d,s){if(a==="stage")s.stage=Number(d.idx);if(a==="toggle")toggle(s,"links",s.stage);},
 status:"神话叙事可以比较，但不把神话情节直接当作历史事实。"};
const anthData=[
["观察到三人带来食物并放到公共桌上","记录直接可见行动",0],
["这个社区所有人一定十分慷慨","以少数观察推断全部群体",2],
["可能是某个集体活动的分享规则","提出可进一步验证的解释",1],
["有两名参与者离开前没有讲话","记录可见行为，不解释其心理",0],
["不说话说明他们不欢迎外人","在缺乏证据时推断动机",2],
["也许活动规则鼓励安静离场","可检验的替代解释",1]
];
M[34]={
 heading:"社区观察笔记 · 事实、解释与偏见",
 goal:"区分可观察的事实、合理但未证实的假说、对他人群体的武断判断。",
 instruction:"每张笔记卡点击切换类别，再检查分类依据。",
 boundary:"教学情境完全虚构；单次分类结果不用于推断人格、民族特征或社会研究能力。",
 init(){return {label:[-1,-1,-1,-1,-1,-1],checked:false};},
 stage(s){const labels=["直接观察","待核实假说","武断概括"];
 return '<div class="stage-frame"><div class="section-label">OBSERVATION / INFERENCE / GENERALIZATION</div><div class="observ-grid">'+anthData.map((a,i)=>
 '<button class="observ-item" data-act="label" data-idx="'+i+'"><span>记录 '+(i+1)+'</span><strong>'+e(a[0])+'</strong><small>你的分类：'+(s.label[i]<0?"未选择":labels[s.label[i]])+'</small></button>').join('')+'</div></div>'+
 (s.checked?'<div class="cue-box"><b>分类复核</b><p>一致 '+s.label.filter((x,i)=>x===anthData[i][2]).length+' / 6 项。重新看事实和推测的界限。</p><p>'+anthData.map((x,i)=>(i+1)+'. '+x[1]).join('；')+'</p></div>':'');},
 controls(s,H){return '<p class="hint">点同一张卡，在“直接观察 → 待核实假说 → 武断概括”间循环。</p><div class="control-row">'+H.btn("检查分类","check","primary")+H.btn("清空重新判断","reset")+'</div>';},
 click(a,d,s){if(a==="label"){let i=Number(d.idx);s.label[i]=(s.label[i]+1)%3;}if(a==="check")s.checked=true;if(a==="reset")Object.assign(s,this.init());},
 status:"分类仅在模拟记录内有效，现实调查仍需知情同意和资料核实。"};
M[35]={
 heading:"家谱同名者 · 年代与关系核对",
 goal:"用出生年代、父母关系和档案来源区分两个同名人物，避免把名字一致误认为同一人。",
 instruction:"点击档案卡切换查看证据，选择是否属于同一人并解释所依据的日期。",
 boundary:"族谱材料是虚构示范，真实家谱考证须检查原始记录、年代冲突和隐私。",
 init(){return {select:0,same:"unknown",confidence:45,reason:"首先核对日期与代际，不把同名直接视为同一身份。"};},
 stage(s){const records=[
 ["张守礼 A","生于1887年","父亲张敬德","1909年商会登记"],
 ["张守礼 B","生于1939年","父亲张文山","1964年学校校友录"],
 ["张文山","生于1915年","父亲张守礼 A（推测）","1951年地方户籍摘要"]
 ];
 return '<div class="stage-frame"><div class="section-label">GENEALOGY / TWO PEOPLE, SAME NAME</div><div class="family-tree"><div class="family-line">张守礼 A（1887） — 可能亲属 → 张文山（1915） → 张守礼 B（1939）</div>'+
 records.map((r,i)=>'<button data-act="person" data-idx="'+i+'" class="family-record'+(s.select===i?' active':'')+'"><b>'+r[0]+'</b><span>'+r[1]+'</span></button>').join('')+'</div></div>'+
 '<div class="cue-box"><b>档案来源</b><p>'+e(records[s.select][2])+'；'+e(records[s.select][3])+'。</p><p>当前判断：'+({yes:"认为同一人",no:"不是同一人",unknown:"尚无足够依据"}[s.same])+'</p></div>';},
 controls(s,H){return H.field("两名同名者是否为同一人？","same",s.same,"select",[["unknown","目前存疑"],["no","不是同一人"],["yes","可能是同一人"]])+
 H.field("判断把握（只是自我记录）","confidence",s.confidence,"range",{min:0,max:100,step:5,unit:"%"})+
 H.field("判断依据","reason",s.reason,"textarea");},
 click(a,d,s){if(a==="person")s.select=Number(d.idx);},
 status:"同时检查日期、亲属关系与来源，不要凭同名作身份确认。"};
M[36]={
 heading:"两地早餐文化 · 寻找多种解释",
 goal:"对比虚构地域里的早餐习俗，将气候、贸易与人口流动作为竞争解释。",
 instruction:"选不同因素观察其可能影响，再写出一个与你最初推断相反的例子。",
 boundary:"纯属虚构场景；不对真实地域人口或文化作固定本质化评价。",
 init(){return {factor:0,findings:[0,2],counter:"即使环境相似，两地也可能因历史贸易不同而有不同饮食。"};},
 stage(s){const f=["气候条件","贸易传播","劳动时间","食材价格"],a=["海风与潮湿","码头商人往来","清晨集市较早","鱼类相对易得"],b=["冬季寒冷","山路商贸较少","农作时段不同","谷物相对易得"];
 return '<div class="stage-frame"><div class="section-label">PLACE · ENVIRONMENT · CULTURE</div>'+chips(f,s.factor,"factor")+
 '<div class="argument-grid"><div class="argument pro"><b>海湾镇（虚构）</b><p>'+a[s.factor]+'</p></div><div class="argument con"><b>山原镇（虚构）</b><p>'+b[s.factor]+'</p></div></div><p class="hint">已考虑解释 '+s.findings.length+' 种，不应只用一种原因直接确定结论。</p></div>';},
 controls(s,H){return '<div class="control-row">'+H.btn("将该因素纳入比较","toggle")+'</div>'+H.field("反例或替代解释","counter",s.counter,"textarea");},
 click(a,d,s){if(a==="factor")s.factor=Number(d.idx);if(a==="toggle")toggle(s,"findings",s.factor);},
 status:"文化差异通常涉及多重因素，不能根据地域标签推断个人。"};
M[37]={
 heading:"忒修斯之船 · 先定义再推理",
 goal:"对一艘零件逐渐被更换的船，尝试不同的“同一性”标准，并记录相应推论。",
 instruction:"滑动零件更换比例，再选择认定同一艘船的原则；比较规则对结论的影响。",
 boundary:"哲学概念实验没有唯一的天赋评分或公认唯一答案。",
 hasArt:true,
 init(){return {replaced:60,standard:"form",notes:"如果只强调外形，修理后物体可能被视为同一件。"};},
 stage(s){const rep=s.replaced,stan=s.standard,answer=stan==="matter"?(rep===0?"仍可视为同一艘":"严格物质标准下不再完全同一"):stan==="form"?"依赖结构/形状保持程度，尚需自订阈值":"依赖历史连续使用与身份约定，不由材料比例独立决定";
 return '<div class="stage-frame"><div class="section-label">SHIP OF THESEUS / IDENTITY</div>'+
 '<svg class="art-export" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 270"><rect width="650" height="270" rx="15" fill="#eaf7fb"/><path d="M130 195 H520 L450 237 H205Z" fill="#3a9fa4" stroke="#24556b" stroke-width="4"/>'+
 Array.from({length:10},(_,i)=>'<rect x="'+(165+i*33)+'" y="195" width="31" height="23" fill="'+(i<Math.round(rep/10)?"#e0b266":"#3a9fa4")+'" stroke="#377889" stroke-width="1"/>').join('')+
 '<path d="M321 44 V194 M321 53 L452 166 H321Z" fill="#fff" stroke="#337c8b" stroke-width="4"/><path d="M0 246 Q50 238 100 246 T200 246 T300 246 T400 246 T500 246 T600 246" fill="none" stroke="#8dd3dc" stroke-width="4"/>'+
 '<text x="325" y="27" text-anchor="middle" font-size="16" fill="#385e70">橙色板块：被换过的船体材料</text></svg>'+
 '<div class="cue-box"><b>目前更换 '+rep+'% 零件</b><p>'+answer+'</p></div></div>';},
 controls(s,H){return H.field("累计被更换的零件","replaced",s.replaced,"range",{min:0,max:100,step:10,unit:"%"})+
 H.field("你采用的同一性标准","standard",s.standard,"select",[["matter","保持原材料"],["form","保持结构与形式"],["history","历史使用的连续性"]])+
 H.field("你选择该标准的理由","notes",s.notes,"textarea");},
 status:"注意先说明自己的定义，再讨论结论。"};
M[38]={
 heading:"伦理动机与后果 · 多视角解释",
 goal:"比较一个帮助他人却意外造成损失的行为，从动机、后果和责任三种角度表达不同观点。",
 instruction:"选择评判视角，再按案例写出需要了解的事实。这里不考宗教信仰对错。",
 boundary:"只是一般伦理思辨情境，不代表任何宗教传统的完整教义，也不评价个人信仰。",
 init(){return {perspective:0,intent:"出于帮助邻居的善意。",effect:"未经核实的方法造成了植物损坏。",responsibility:"需要承认错误并帮助修复，同时改进方法。"};},
 stage(s){const l=["从动机看","从后果看","从责任与补救看"];
const f=["善意会影响行为的伦理评价，但不自动保证结果正当。","即使出于好心，也需要承认对他人造成的实际影响。","完整评价既要关注动机与后果，也要看后续补救与学习。"];
 return '<div class="stage-frame"><div class="section-label">INTENTION · CONSEQUENCE · REPAIR</div>'+
 '<div class="cue-box"><b>虚构情境</b><p>邻居出于好意，替外出的人给花浇水，但浇水过多，导致盆栽受损。</p></div>'+
 chips(l,s.perspective,"view")+b(l[s.perspective],f[s.perspective])+'</div>';},
 controls(s,H){return H.field("你理解的动机","intent",s.intent,"textarea")+
 H.field("你理解的后果","effect",s.effect,"textarea")+
 H.field("责任与补救计划","responsibility",s.responsibility,"textarea");},
 click(a,d,s){if(a==="view")s.perspective=Number(d.idx);},
 status:"不因选择一种伦理视角就判断一个人的人格或信仰。"};
M[39]={
 heading:"救援船只剩一席 · 权衡不同公平原则",
 goal:"分析抽象救援情境下的原则冲突，练习解释规则、后果与未知情况。",
 instruction:"选择一种公平规则，看它可能优先考虑的信息以及无法解决的分歧。",
 boundary:"纯属伦理思辨练习，不是现实救援行动指南；真实危机应遵循应急部门指挥。",
 init(){return {rule:0,more:"未核实实际风险、必要性与可用其他救援方式。",revised:"当重要信息改变时，规则应允许复核。"};},
 stage(s){const rules=[["先到先得","需要可靠、公平的排队信息","忽略不同人的迫切需求"],
 ["需求紧急优先","先确定谁面临更迫切的危险","紧急程度可能难以可靠判断"],
 ["抽签程序","避免由个人偏好决定所有选择","不能直接解决危险差异"],
 ["特殊责任优先","考虑被救助者对他人的实际照护责任","容易忽略其他人的基本权利"]];
 return '<div class="stage-frame"><div class="section-label">ETHICS / TRADEOFF NOT SCORING</div>'+chips(rules.map(x=>x[0]),s.rule,"rule")+
 '<div class="argument-grid"><div class="argument pro"><b>规则重视什么</b><p>'+rules[s.rule][1]+'</p></div><div class="argument con"><b>规则遗漏什么</b><p>'+rules[s.rule][2]+'</p></div></div></div>';},
 controls(s,H){return H.field("还缺哪些关键事实","more",s.more,"textarea")+H.field("如果信息改变，你怎样修订？","revised",s.revised,"textarea");},
 click(a,d,s){if(a==="rule")s.rule=Number(d.idx);},
 status:"不把一个虚构救援选择视为道德高低或实际应急能力。"};
const logicCases=[
 {assume:"所有 A 都属于 B；部分 B 属于 C。",claim:"一定存在既属于 A 又属于 C 的元素。",valid:false,detail:"可能 B={1,2}，A={1}，C={2}。两条前提都成立，但 A∩C 为空。"},
 {assume:"所有 A 都属于 B；所有 B 都属于 C。",claim:"所有 A 都属于 C。",valid:true,detail:"A⊆B 且 B⊆C，因此 A⊆C，这是传递关系。"},
 {assume:"某些 A 属于 B；所有 B 都属于 C。",claim:"存在 A 属于 C。",valid:true,detail:"取一个属于 A∩B 的元素，因为 B⊆C，它也属于 A∩C。"},
 {assume:"所有 A 都属于 B；所有 A 都属于 C。",claim:"所有 B 都属于 C。",valid:false,detail:"A 只可能是 B 和 C 的共同部分，B 还有不属于 C 的元素。"}
];
M[40]={
 heading:"前提与结论 · 找反例验证逻辑",
 goal:"不是背公式：给出不同集合关系，判断结论是否一定从前提成立。",
 instruction:"逐组阅读前提，先选择结论是否必然成立，再查看具体反例或推演。",
 boundary:"这里仅有少量形式逻辑题，答对也不能据此推断一般智力或逻辑天赋。",
 init(){return {case:0,choices:[-1,-1,-1,-1],explain:[false,false,false,false]};},
 stage(s){const c=logicCases[s.case],pick=s.choices[s.case];let box='<div class="stage-frame"><div class="section-label">FORMAL REASONING / COUNTEREXAMPLE</div>'+chips(["第1组","第2组","第3组","第4组"],s.case,"case")+
 '<div class="logic-premise"><span>给定前提</span><h2>'+e(c.assume)+'</h2><span>尝试判断</span><p>'+e(c.claim)+'</p></div>'+
 '<div class="control-row">'+[["必然成立",1],["不一定成立",0]].map(([l,v])=>'<button class="btn'+(pick===v?' primary':'')+'" data-act="answer" data-idx="'+v+'">'+l+'</button>').join('')+'</div>';
 if(s.explain[s.case])box+='<div class="cue-box"><b>'+ (pick===-1?"先作一次判断":(Boolean(pick)===c.valid?"判断与推理一致":"需要再找一个反例"))+'</b><p>'+e(c.detail)+'</p></div>';
 return box+'</div>';},
 controls(s,H){return '<div class="control-row">'+H.btn("显示推演与反例","check","primary")+H.btn("清空全部判断","reset")+'</div>'+
 '<p class="hint">每道题都需要区分“可能是真的”和“由前提必然推出”。</p>';},
 click(a,d,s){if(a==="case")s.case=Number(d.idx);if(a==="answer")s.choices[s.case]=Number(d.idx);
 if(a==="check")s.explain[s.case]=true;if(a==="reset")Object.assign(s,this.init());},
 status:"形式逻辑的结论有可核查依据，不因一次结果判断智力。"};
M[41]={
 heading:"视觉均衡与留白 · 自己调一张构图",
 goal:"改变左右对称、留白宽度和对比色，体验审美理由并非单一指标。",
 instruction:"调整滑杆观察两块抽象图形的位置关系，再写下你认为“协调”或“有张力”的理由。",
 boundary:"可视偏好具有文化、经验与情境差异，不能通过一次选择判断审美天赋。",
 hasArt:true,
 init(){return {symmetry:65,space:50,contrast:70,shape:0,notes:"我在这幅图上更在意视觉焦点和留白比例。"};},
 stage(s){const x1=130+Math.round(s.space*.8),x2=520+Math.round((s.symmetry-50)*1.8),col=s.contrast>50?"#e69c5d":"#72b5b5",inv=s.shape===0?'circle':s.shape===1?'rect':'polygon';
 const one=inv==="circle"?'<circle cx="'+x1+'" cy="215" r="76" fill="#1b7b8a"/>':inv==="rect"?'<rect x="'+(x1-78)+'" y="138" width="156" height="156" rx="16" fill="#1b7b8a"/>':'<polygon points="'+x1+',125 '+(x1+85)+',290 '+(x1-85)+',290" fill="#1b7b8a"/>';
 const two=inv==="circle"?'<circle cx="'+x2+'" cy="215" r="'+(48+s.contrast*.45)+'" fill="'+col+'"/>':inv==="rect"?'<rect x="'+(x2-70)+'" y="145" width="140" height="140" fill="'+col+'"/>':'<polygon points="'+x2+',135 '+(x2+90)+',287 '+(x2-90)+',287" fill="'+col+'"/>';
 return '<div class="stage-frame"><div class="section-label">COMPOSITION / BALANCE AND CONTRAST</div><div class="artboard"><svg class="art-export" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 430"><rect width="720" height="430" fill="#faf9f2"/>'+
 '<path d="M360 25 V405" stroke="#d5dfdf" stroke-dasharray="7 8" stroke-width="2"/>'+one+two+
 '<text x="360" y="400" fill="#68858b" text-anchor="middle" font-size="16">调整对称关系、色彩反差和留白</text></svg></div></div>';},
 controls(s,H){return H.field("视觉对称度","symmetry",s.symmetry,"range",{min:0,max:100,step:5,unit:"%"})+
 H.field("留白与间距","space",s.space,"range",{min:0,max:100,step:5,unit:"%"})+
 H.field("色彩反差","contrast",s.contrast,"range",{min:0,max:100,step:5,unit:"%"})+
 H.field("形状","shape",s.shape,"select",[["0","圆形"],["1","方形"],["2","三角形"]])+
 H.field("你的审美理由","notes",s.notes,"textarea");},
 status:"构图可以导出为 SVG；没有公认的单一审美最优答案。"};
})(window.QX_MODULES);