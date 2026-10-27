"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const e=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const format=(n,d=1)=>Number(n).toFixed(d);
const panel=(heading,msg)=>'<div class="cue-box"><b>'+e(heading)+'</b><p>'+e(msg)+'</p></div>';
const segmented=(values,at,action)=>'<div class="options-grid">'+values.map((v,i)=>'<button class="option-tile'+(at===i?" selected":"")+'" data-act="'+action+'" data-idx="'+i+'">'+e(v)+'</button>').join('')+'</div>';
M[64]={
 heading:"倾斜轨道 · 小车的理想化运动",
 goal:"改变斜坡角度、等效摩擦和观察时间，计算简化运动模型下小车能移动的距离。",
 instruction:"在同一个简化模型中，只改一个条件观察位移的变化，再解释为什么。",
 boundary:"理想刚体运动示例忽略空气阻力、滚动惯量与实际表面差异，不能据此判断真实设备的安全性。",
 hasArt:true,
 init(){return {angle:15,friction:0.12,time:2,mass:1,reason:"倾角增大会改变沿斜面的重力分量。"};},
 stage(s){const angle=s.angle*Math.PI/180,acc=Math.max(0,9.81*(Math.sin(angle)-s.friction*Math.cos(angle))),distance=.5*acc*s.time*s.time;
 const pos=Math.min(500,90+distance*35),height=340-(620-pos)*Math.tan(angle)*.55;
 return '<div class="stage-frame"><div class="section-label">IDEAL INCLINE / PHYSICS MODEL</div><div class="artboard">'+
 '<svg class="art-export" viewBox="0 0 690 395" xmlns="http://www.w3.org/2000/svg"><rect width="690" height="395" fill="#eaf6fb"/>'+
 '<path d="M60 '+Math.max(60,340-560*Math.tan(angle)*.55)+' L620 340 L620 360 L60 360Z" fill="#bedbdc" stroke="#517f90" stroke-width="4"/>'+
 '<path d="M'+(pos-26)+' '+(Math.max(30,height)-37)+' h52 v24 h-52z" rx="5" fill="#e3ab57" stroke="#345973" stroke-width="3"/>'+
 '<circle cx="'+(pos-17)+'" cy="'+(Math.max(30,height)-9)+'" r="8" fill="#345973"/><circle cx="'+(pos+17)+'" cy="'+(Math.max(30,height)-9)+'" r="8" fill="#345973"/>'+
 '<text x="36" y="30" fill="#557b88" font-size="15">理想斜坡角 '+s.angle+'°</text><text x="345" y="385" text-anchor="middle" fill="#6b8690" font-size="13">车辆示意位置按模拟位移缩放，并非实测轨迹</text></svg></div>'+
 '<div class="metric-grid"><div><b>'+format(acc,2)+' m/s²</b><small>沿坡加速度（简化）</small></div><div><b>'+format(distance,2)+' m</b><small>理论位移</small></div><div><b>'+s.time+'s</b><small>观察时间</small></div></div></div>';},
 controls(s,H){return H.field("斜坡角度","angle",s.angle,"range",{min:0,max:30,step:1,unit:"度"})+
 H.field("等效摩擦系数","friction",s.friction,"range",{min:0,max:.35,step:.01})+
 H.field("观察秒数","time",s.time,"range",{min:.5,max:4,step:.5,unit:"秒"})+
 H.field("你的物理解释","reason",s.reason,"textarea");},
 status:"采用 a=max(0,g(sinθ−μcosθ))、s=½at² 的简化模型；不预测真实小车。"};
M[65]={
 heading:"颜色溶液稀释 · 浓度守恒实验",
 goal:"在不发生化学反应的假想混合条件下，改变原液浓度、液量和补水量。",
 instruction:"先预测补水后浓度怎样变化，再移动补水滑杆观察理论结果。",
 boundary:"只是无反应、体积可加的稀释计算；不鼓励混合化学品，不涉及危险试剂。",
 hasArt:true,
 init(){return {initial:30,volume:100,water:100,note:"补水量增加时溶质假定不变，总体积增加。"};},
 stage(s){const all=s.volume+s.water,final=s.initial*s.volume/all,alpha=Math.max(.08,Math.min(.9,final/55));
 return '<div class="stage-frame"><div class="section-label">CONCENTRATION BALANCE / CONCEPTUAL DILUTION</div><div class="beaker-row"><div class="beaker"><div style="height:'+(s.volume/400*100)+'%;background:rgba(46,143,180,'+(s.initial/80)+')"></div></div><span>＋ 补水 '+s.water+'mL →</span><div class="beaker"><div style="height:'+(all/400*100)+'%;background:rgba(46,143,180,'+alpha+')"></div></div></div>'+
 '<div class="metric-grid"><div><b>'+s.initial+'%</b><small>原液浓度</small></div><div><b>'+all+' mL</b><small>理论总体积</small></div><div><b>'+format(final,2)+'%</b><small>理论混合浓度</small></div></div>'+
 panel("计算关系","C2=C1×V1/(V1+V水)，仅在溶质守恒且体积可加的假设下成立。")+'</div>';},
 controls(s,H){return H.field("原液浓度","initial",s.initial,"range",{min:5,max:60,step:5,unit:"%"})+
 H.field("原液体积","volume",s.volume,"range",{min:50,max:200,step:10,unit:"mL"})+
 H.field("加入水量","water",s.water,"range",{min:0,max:200,step:10,unit:"mL"})+
 H.field("你的预测与解释","note",s.note,"textarea");},
 status:"本练习不用真实试剂；不把颜色深浅直接等同于精确浓度。"};
M[66]={
 heading:"月相与位置 · 区分明暗和月食",
 goal:"通过观察太阳—地球—月球相对位置，理解月相周期中受光面的变化。",
 instruction:"移动月相滑杆观察月面受光比例，注意月相不是地球影子造成的。",
 boundary:"月球轨道模型为二维示意，忽略倾角、偏心率与观测者方位；月食另需轨道交点条件。",
 hasArt:true,
 init(){return {phase:0,view:0,explain:"月相由日、地、月相对几何导致的可见受光部分变化。"};},
 stage(s){const angle=2*Math.PI*s.phase/100,cx=300+Math.cos(angle)*190,cy=180+Math.sin(angle)*120;
 const lit=(1+Math.cos(angle))/2;
 return '<div class="stage-frame"><div class="section-label">MOON PHASES / SIMPLIFIED GEOMETRY</div><div class="artboard">'+
 '<svg class="art-export" viewBox="0 0 700 410" xmlns="http://www.w3.org/2000/svg"><rect width="700" height="410" fill="#132843"/>'+
 '<circle cx="300" cy="180" r="105" fill="none" stroke="#6d89a3" stroke-width="2" stroke-dasharray="7 10"/>'+
 '<ellipse cx="300" cy="180" rx="190" ry="120" fill="none" stroke="#607f98" stroke-width="3"/>'+
 '<circle cx="300" cy="180" r="39" fill="#418bb5" stroke="#b9ddec" stroke-width="2"/>'+
 '<circle cx="'+cx+'" cy="'+cy+'" r="22" fill="#d6dbe3" stroke="#fff" stroke-width="2"/>'+
 '<path d="M25 175 H112 M95 162 L114 175 L95 188" fill="none" stroke="#f8d36e" stroke-width="8" stroke-linecap="round"/>'+
 '<circle cx="55" cy="70" r="32" fill="#f6d063"/>'+
 '<text x="32" y="128" fill="#f9e8ac" font-size="16">日光 →</text>'+
 '<text x="300" y="234" text-anchor="middle" font-size="15" fill="#f1f8fc">地球</text>'+
 '<text x="520" y="355" font-size="13" fill="#dcecf4">月亮位置指示</text>'+
 '<circle cx="590" cy="90" r="55" fill="#273c59"/><path d="M590 35 A55 55 0 0 1 590 145 Z" fill="#e5e8e9" transform="rotate('+(s.phase*3.6)+' 590 90)"/>'+
 '<text x="590" y="175" font-size="14" text-anchor="middle" fill="#e9f4fa">明亮比例约 '+Math.round(lit*100)+'%</text></svg></div>'+
 panel("受光比例（示意）",Math.round(lit*100)+"%。真实月相还取决于观察几何，这张演示不作为精确天文历算。")+'</div>';},
 controls(s,H){return H.field("轨道相位（0—100）","phase",s.phase,"range",{min:0,max:100,step:5})+
 H.field("观察关注点","view",s.view,"select",[["0","月相成因"],["1","月球位置"],["2","月食为何少见"]])+
 H.field("你的解释","explain",s.explain,"textarea");},
 status:"注意月相不等于月食；用模型检验想法而非背诵标签。"};
M[67]={
 heading:"三个不同形状容器 · 公平比较容量",
 goal:"通过截面积、高度和体积关系比较容器中的水量，发现仅凭液面高度无法判定多少。",
 instruction:"调整三个容器的横截面积和液面高度，看看谁装的水最多。",
 boundary:"容器简化为直立等截面柱体，体积=截面积×液柱高度，不适用于不规则瓶身。",
 hasArt:true,
 init(){return {widths:[7,4,10],heights:[8,12,5],selected:0,guess:0};},
 stage(s){const volumes=s.widths.map((w,i)=>w*s.heights[i]),max=volumes.indexOf(Math.max(...volumes));
 return '<div class="stage-frame"><div class="section-label">MATHEMATICAL VOLUME / CROSS-SECTION × HEIGHT</div><div class="cylinder-grid">'+s.widths.map((w,i)=>'<button class="cylinder-card'+(s.selected===i?' selected':'')+'" data-act="vessel" data-idx="'+i+'"><span>容器'+(i+1)+'</span><div class="cylinder" style="width:'+Math.round(32+w*9)+'px"><div style="height:'+(s.heights[i]/15*100)+'%"></div></div><strong>'+volumes[i]+' cm³</strong></button>').join('')+'</div>'+
 panel("按等截面模型计算","三个容器的水量分别为："+volumes.join("、")+" cm³；最多的是容器"+(max+1)+"。")+'</div>';},
 controls(s,H){return H.field("当前容器截面积","area",s.widths[s.selected],"range",{min:2,max:12,step:1,unit:"cm²"})+
 H.field("当前容器液面高度","height",s.heights[s.selected],"range",{min:1,max:15,step:1,unit:"cm"})+
 '<p class="hint">点击左边三个容器切换要调整的对象。</p>';},
 change(k,v,s){if(k==="area")s.widths[s.selected]=Number(v);if(k==="height")s.heights[s.selected]=Number(v);},
 click(a,d,s){if(a==="vessel")s.selected=Number(d.idx);},
 status:"实际测量需要校准量具、容器内径和单位。"};
M[68]={
 heading:"叶片发黄 · 设计排查顺序",
 goal:"面对一种常见植物异常，按水、光、虫害等因素制定可验证的观察顺序。",
 instruction:"在模拟植物记录里选择要观察的指标，区分现象、假设和需要持续记录的证据。",
 boundary:"不能仅凭一张网页示意判断真实植物病害或具体施用药剂；真实植株因品种、季节而异。",
 hasArt:true,
 init(){return {hyp:0,soil:40,light:70,spots:false,method:"先看近一周水分记录，再逐步核查光照与叶面。"};},
 stage(s){const leaves=["#e1cc55","#84b963","#e3a05a"];
 return '<div class="stage-frame"><div class="section-label">BOTANY / MULTIPLE POSSIBLE CAUSES</div><div class="artboard">'+
 '<svg class="art-export" viewBox="0 0 650 300" xmlns="http://www.w3.org/2000/svg"><rect width="650" height="300" fill="#eff8f0"/><rect x="245" y="210" width="160" height="70" rx="11" fill="#bb8c67"/><path d="M325 230 V45" stroke="#42876a" stroke-width="12"/>'+
 Array.from({length:7},(_,i)=>'<ellipse cx="'+(325+(i%2===0?-1:1)*55)+'" cy="'+(55+i*22)+'" rx="54" ry="21" transform="rotate('+(i%2===0?-25:25)+' '+(325+(i%2===0?-1:1)*55)+' '+(55+i*22)+')" fill="'+leaves[s.soil>75?0:s.light<20?2:1]+'" stroke="#4d8866" stroke-width="2"/>').join('')+
 '<text x="30" y="35" fill="#53866e" font-size="15">植物叶片观察示意</text></svg></div>'+
 panel("当前模拟观察","土壤湿度指数："+s.soil+"；光照指数："+s.light+"；叶面斑点："+(s.spots?"有":"尚未记录")+"。不能仅据这些指数确定原因。")+'</div>';},
 controls(s,H){return H.field("正在核查的假设","hyp",s.hyp,"select",[["0","浇水与排水"],["1","光照变化"],["2","虫害或斑点"],["3","养分与季节"]])+
 H.field("土壤湿度（模拟指数）","soil",s.soil,"range",{min:0,max:100,step:5})+
 H.field("光照（模拟指数）","light",s.light,"range",{min:0,max:100,step:5})+
 H.field("排查计划","method",s.method,"textarea")+
 '<div class="control-row">'+H.btn(s.spots?"清除斑点记录":"记录叶面有斑点","spots")+'</div>';},
 click(a,d,s){if(a==="spots")s.spots=!s.spots;},
 status:"避免凭单一症状归因，观察需要有时间记录与控制变量。"};
M[69]={
 heading:"医学新闻 · 分辨夸大结论",
 goal:"阅读一条虚构健康产品宣传，区分宣传口号、证据类型和需要核实的事实。",
 instruction:"选择两项较有价值的核查工作，并记录不应过度推断的地方。",
 boundary:"只是科学信息素养练习，不提供疾病诊断、治疗建议或药物推荐。",
 init(){return {checked:[0,2],source:0,notice:"任何声称能预防所有疾病的说法都需要高度谨慎核实。"};},
 stage(s){const choices=["先找到研究原文和研究对象","只根据广告里的成功案例判断","检查是否有合适对照组","核对研究规模与真实结局"];
 return '<div class="stage-frame"><div class="section-label">HEALTH CLAIM / SOURCE CRITICISM</div>'+
 '<div class="claim-quote">“某饮料可以预防所有疾病！”<small>虚构宣传文字，非真实产品</small></div>'+
 choices.map((v,i)=>'<button class="check-tile'+(s.checked.includes(i)?" checked":"")+'" data-act="evidence" data-idx="'+i+'"><b>'+(s.checked.includes(i)?"✓":"＋")+'</b><span>'+e(v)+'</span></button>').join('')+
 panel("证据逻辑","个别故事不能代替严谨研究；即使有研究也要审视人群、对照、终点及局限。")+'</div>';},
 controls(s,H){return H.field("宣传里最需要确认的地方","notice",s.notice,"textarea")+
 H.field("你想优先核对的信息来源","source",s.source,"select",[["0","公开研究原文"],["1","受监管的健康信息"],["2","广告词出处"]]);},
 click(a,d,s){if(a==="evidence"){const i=Number(d.idx);s.checked=s.checked.includes(i)?s.checked.filter(x=>x!==i):[...s.checked,i];}},
 status:"此网页不应被用于做个人健康决策。"};
M[70]={
 heading:"暴雨后的街道积水 · 地表径流示意",
 goal:"模拟降雨、地面透水比例与坡度对“简化径流量指数”的影响。",
 instruction:"改变降雨和透水比例，观察不同区域径流指标的变化，并列出仍缺的信息。",
 boundary:"此模型不包含真实排水设施、流域面积、地表汇流和气象预测，不能用于洪水危险判断。",
 hasArt:true,
 init(){return {rain:70,permeability:35,slope:8,location:1,notes:"现实排涝必须核查下水道能力、地形、雨强和现场通行安全。"};},
 stage(s){const runoff=s.rain*(1-s.permeability/100),flow=runoff*(1+s.slope/30);
 return '<div class="stage-frame"><div class="section-label">SURFACE RUNOFF / INDEX ONLY</div><div class="artboard">'+
 '<svg class="art-export" viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg"><rect width="680" height="360" fill="#d8ecf4"/><path d="M40 245 L630 '+(245-s.slope*8)+' L630 310 L40 310Z" fill="#9eaea9" stroke="#5d8385" stroke-width="4"/>'+
 Array.from({length:18},(_,i)=>'<path d="M'+(60+i*31)+' 34 l-9 '+(35+(i%3)*8)+'" stroke="#64abc9" stroke-width="4" stroke-linecap="round"/>').join('')+
 '<path d="M50 289 Q230 '+(280-s.slope*1.2)+' 410 260 T640 235" stroke="#3da4d2" stroke-width="'+(4+runoff/8)+'" fill="none" stroke-linecap="round"/>'+
 '<text x="36" y="336" font-size="14" fill="#456d79">径流表示受地表条件影响，水线非真实水位</text></svg></div>'+
 '<div class="metric-grid"><div><b>'+format(runoff,1)+'</b><small>径流指数</small></div><div><b>'+format(flow,1)+'</b><small>坡度调整指标</small></div><div><b>'+s.permeability+'%</b><small>假定可渗透比例</small></div></div></div>';},
 controls(s,H){return H.field("降雨强度模拟指数","rain",s.rain,"range",{min:0,max:100,step:5})+
 H.field("可渗透比例","permeability",s.permeability,"range",{min:0,max:100,step:5,unit:"%"})+
 H.field("地面坡度模拟参数","slope",s.slope,"range",{min:0,max:20,step:1})+
 H.field("额外需核查的现实条件","notes",s.notes,"textarea");},
 status:"数值无现实洪水预测意义；遇官方暴雨预警应遵循当地安全指引。"};
M[71]={
 heading:"校园池塘 · 藻类变化的多因素观察",
 goal:"把营养物、光照和温度当作互相作用的条件，设计简化生态观察。",
 instruction:"改变虚构池塘的条件，查看可能的趋势，再想想哪些因素被模型忽略。",
 boundary:"只提供定性演示，不预测真实水质、鱼类存活或污染原因；不指导危险采样。",
 hasArt:true,
 init(){return {nutrient:45,sun:65,temp:22,algae:"",notes:"需要比较季节、上游活动、降雨与长期记录。"};},
 stage(s){const score=Math.round((s.nutrient*.45+s.sun*.35+Math.max(0,s.temp-8)*1.1)*.8),n=Math.round(6+score*.6);
 return '<div class="stage-frame"><div class="section-label">POND ECOLOGY / QUALITATIVE TREND</div><div class="artboard">'+
 '<svg class="art-export" viewBox="0 0 650 330" xmlns="http://www.w3.org/2000/svg"><rect width="650" height="330" fill="#ddf3f2"/><ellipse cx="325" cy="180" rx="260" ry="105" fill="#6eb7c7"/>'+
 Array.from({length:n},(_,i)=>{const a=i*2.399963,rad=15+Math.sqrt(i/Math.max(1,n))*195,x=325+Math.cos(a)*rad,y=180+Math.sin(a)*rad*.43;
 return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(5+i%4)+'" fill="#60a777" opacity=".9"/>'}).join('')+
 '<path d="M65 180 Q140 110 235 180 T430 180 T590 180" fill="none" stroke="#e6f9f6" opacity=".65" stroke-width="3"/>'+
 '<text x="325" y="317" text-anchor="middle" fill="#4c7c89" font-size="14">示意性藻类点数不代表实际浓度</text></svg></div>'+
 panel("观察提示","营养物、光照和温度可能都影响藻类状况；模拟趋势指数约 "+score+"，不是实测水质。")+'</div>';},
 controls(s,H){return H.field("营养物水平模拟指数","nutrient",s.nutrient,"range",{min:0,max:100,step:5})+
 H.field("光照水平模拟指数","sun",s.sun,"range",{min:0,max:100,step:5})+
 H.field("水温","temp",s.temp,"range",{min:5,max:35,step:1,unit:"℃"})+
 H.field("你想跟踪哪些现实指标","notes",s.notes,"textarea");},
 status:"不能凭画面推断真实污染；真实水质研究需要规范采样和对照。"};
})(window.QX_MODULES);