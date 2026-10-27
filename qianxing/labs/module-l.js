"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const e=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const msg=(name,p)=>'<div class="cue-box"><b>'+e(name)+'</b><p>'+e(p)+'</p></div>';
const pick=(items,active,action)=>'<div class="options-grid">'+items.map((t,i)=>'<button class="option-tile'+(active===i?" selected":"")+'" data-act="'+action+'" data-idx="'+i+'">'+e(t)+'</button>').join('')+'</div>';
function isocube(x,y,z,color){
 const X=260+(x-y)*72,Y=227+(x+y)*36-z*65;
 return '<path d="M'+X+' '+(Y-40)+' l68 34 -68 35 -68 -35Z" fill="'+color+'" stroke="#406a7d" stroke-width="3"/>'+
 '<path d="M'+(X-68)+' '+(Y-6)+' l68 35 v54 l-68 -35Z" fill="#6faca7" stroke="#406a7d" stroke-width="3"/>'+
 '<path d="M'+X+' '+(Y+29)+' l68 -35 v54 l-68 35Z" fill="#88c7be" stroke="#406a7d" stroke-width="3"/>';
}
M[88]={
 heading:"四块L形积木 · 绕竖直轴旋转",
 goal:"观察三维积木组合并预测高块旋转90°后在底座的相对位置。",
 instruction:"先选择高块旋转后的方位，提交后查看模型。可以旋转观察，但这不构成空间能力评定。",
 boundary:"这是简化的轴测图与一道操作题，不能测量真实三维空间智能。",
 hasArt:true,
 init(){return {rotation:0,choice:-1,revealed:false,notes:"高块在水平面绕中心旋转，竖直高度不改变。"};},
 stage(s){const occupied=[[0,0,0],[1,0,0],[0,1,0],[0,0,1]];
 const sorted=occupied.map(([x,y,z])=>{for(let k=0;k<s.rotation;k++){const nx=1-y;y=x;x=nx;}return{x,y,z};}).sort((a,b)=>(a.x+a.y+a.z)-(b.x+b.y+b.z));
 return '<div class="stage-frame"><div class="section-label">SPATIAL ROTATION / 90° AROUND VERTICAL</div><div class="artboard">'+
 '<svg class="art-export" viewBox="0 0 560 400" xmlns="http://www.w3.org/2000/svg"><rect width="560" height="400" fill="#eff8fc"/>'+
 sorted.map(p=>isocube(p.x,p.y,p.z,"#acdacf")).join('')+
 '<text x="280" y="370" text-anchor="middle" fill="#577f8c" font-size="14">当前显示旋转：'+(s.rotation*90)+'°（相对初始结构）</text></svg></div>'+
 (s.revealed?msg("方向核对",s.choice===1?"选择与旋转后的底座方位一致。":"高块原位为左上底座，顺时针转90°后位于右上底座；可以再回初始态观察。"):'')+'</div>';},
 controls(s,H){return '<p class="hint">预测：从初始姿态顺时针转90°，最高的积木相对底座位于哪里？</p>'+
 pick(["左上","右上","右下","左下"],s.choice,"choose")+
 '<div class="control-row">'+H.btn("揭示90°形态","reveal","primary")+H.btn("继续旋转90°","rotate")+H.btn("回到初始形态","reset")+'</div>'+
 H.field("你的空间变换理解","notes",s.notes,"textarea");},
 click(a,d,s){if(a==="choose")s.choice=Number(d.idx);if(a==="reveal"){s.revealed=true;s.rotation=1;}
 if(a==="rotate")s.rotation=(s.rotation+1)%4;
 if(a==="reset"){s.rotation=0;s.revealed=false;s.choice=-1;}},
 status:"实际3D空间能力评估需要更多新结构、多轴旋转与独立复测。"};
M[89]={
 heading:"虚构小镇 · 计划两条安全路线",
 goal:"从家到车站选择经过哪些道路，并考虑临时道路关闭。",
 instruction:"在小镇节点图中选一种路线，再改变道路开放状态，看是否有替代路径。",
 boundary:"虚构地图不涉及实际导航或交通安全；真实出行必须看官方线路与现场指示。",
 hasArt:true,
 init(){return {route:0,closed:false,notes:"准备一条不依赖单一地标的替代路线。"};},
 stage(s){const paths=[[["A","B"],["B","D"]],[["A","C"],["C","D"]]],times=[10,12],valid=!(s.route===0&&s.closed);
 return '<div class="stage-frame"><div class="section-label">FICTIONAL ROUTE PLANNING</div><div class="artboard"><svg class="art-export" viewBox="0 0 690 390" xmlns="http://www.w3.org/2000/svg"><rect width="690" height="390" fill="#e9f7f6"/>'+
 '<path d="M110 195 L320 80 L560 195 L320 300Z" fill="none" stroke="#b9d5db" stroke-width="16"/>'+
 '<path d="M110 195 L320 80 L560 195" fill="none" stroke="'+(s.route===0?"#12a6a0":"#a2bec3")+'" stroke-width="7"/>'+
 '<path d="M110 195 L320 300 L560 195" fill="none" stroke="'+(s.route===1?"#e9a54d":"#a2bec3")+'" stroke-width="7"/>'+
 (s.closed?'<path d="M420 128 L447 164 M447 128 L420 164" stroke="#df4f4f" stroke-width="10"/>':'')+
 [["A",110,195,"家"],["B",320,80,"北桥"],["C",320,300,"公园"],["D",560,195,"车站"]].map(r=>'<circle cx="'+r[1]+'" cy="'+r[2]+'" r="25" fill="#fff" stroke="#36868a" stroke-width="4"/>'+
 '<text x="'+r[1]+'" y="'+(r[2]+6)+'" text-anchor="middle" font-size="18" fill="#2c6470">'+r[0]+'</text>'+
 '<text x="'+r[1]+'" y="'+(r[2]+44)+'" text-anchor="middle" font-size="15" fill="#447782">'+r[3]+'</text>').join('')+'</svg></div>'+
 msg("路线检查",(valid?"所选线路可用。":"北桥至车站的连接已关闭，这条线路不可通行。")+' 正常情况下该路线模拟行走'+times[s.route]+'分钟，不是实际出行时间。')+'</div>';},
 controls(s,H){return H.field("计划路线","route",s.route,"select",[["0","北桥路线：A→B→D"],["1","公园路线：A→C→D"]])+
 '<div class="control-row">'+H.btn(s.closed?"重新开放北桥道路":"模拟北桥道路封闭","close")+'</div>'+
 H.field("导航备用方案","notes",s.notes,"textarea");},
 click(a,d,s){if(a==="close")s.closed=!s.closed;},
 status:"地图和时间是模拟值，真实ETA需要实时交通和地点信息。"};
const symbols=["◆","▲","●","■","✦","★"];
M[90]={
 heading:"六个图形 · 先看再回忆位置",
 goal:"观察六个中性图形的排列，隐藏之后回忆指定图形位于哪里。",
 instruction:"点“开始回忆”会隐藏图形，再从编号位置中选择星形的位置。",
 boundary:"图形短时回忆会受到环境、显示器、练习和注意影响；几轮任务不能诊断记忆能力。",
 init(){return {order:[2,4,0,5,1,3],hidden:false,selected:-1,show:false,round:0};},
 stage(s){return '<div class="stage-frame"><div class="section-label">VISUAL MEMORY / SIX SYMBOLS</div>'+
 '<div class="memory-grid">'+s.order.map((v,i)=>'<button class="memory-tile'+(s.selected===i?' selected':'')+'" data-act="pos" data-idx="'+i+'"><small>位置'+(i+1)+'</small><strong>'+(s.hidden?"?":symbols[v])+'</strong></button>').join('')+'</div>'+
 (s.show?msg("位置反馈","星形位于第"+(s.order.indexOf(5)+1)+"格。"+(s.selected===s.order.indexOf(5)?"这次位置回忆正确。":"这次选择与预设排列不一致。") ):'')+'</div>';},
 controls(s,H){return '<div class="control-row">'+H.btn(s.hidden?"返回观察":"开始回忆","toggle","primary")+H.btn("核对位置","check")+H.btn("换一组图形","next")+'</div>'+
 '<p class="hint">回忆阶段选择图形“★”所在的格子，核对后可换新排列。</p>';},
 click(a,d,s){if(a==="pos"&&s.hidden)s.selected=Number(d.idx);if(a==="toggle"){s.hidden=!s.hidden;s.show=false;}
 if(a==="check"&&s.hidden&&s.selected>=0)s.show=true;
 if(a==="next"){s.round++;s.order=s.order.slice(1).concat(s.order[0]);s.hidden=false;s.selected=-1;s.show=false;}},
 status:"排列变化可重复练习，但重复后表现提升也可能来自熟悉化。"};
const associations=[["◇","青栈"],["△","云泊"],["○","松原"],["□","岚灯"],["★","河钟"],["✦","羽桥"]];
M[91]={
 heading:"六组陌生词 · 联想与提取",
 goal:"先建立符号—词语的自定义联系，隐藏答案后再尝试回忆。",
 instruction:"学习六组虚构词语后点“开始回忆”，逐组选择匹配词。",
 boundary:"是短时记忆练习，尚无标准化延迟复测，不据此预测学习能力。",
 init(){return {phase:0,index:0,choices:[-1,-1,-1,-1,-1,-1],note:"给几个词编一个连贯故事，可能帮助自己组织记忆。"};},
 stage(s){const k=s.index,arr=associations;
 return '<div class="stage-frame"><div class="section-label">ASSOCIATION / ENCODING VS RECALL</div>'+
 (s.phase===0?'<div class="memory-grid">'+arr.map(x=>'<div class="memory-tile"><strong>'+x[0]+'</strong><span>'+x[1]+'</span></div>').join('')+'</div>':
 '<div class="cue-box"><b>第'+(k+1)+'组：这个符号关联哪个词？</b><div class="speak-preview">'+arr[k][0]+'</div>'+
 '<div class="options-grid">'+[arr[(k+1)%6][1],arr[k][1],arr[(k+2)%6][1]].map((v,i)=>'<button class="option-tile'+(s.choices[k]===i?' selected':'')+'" data-act="choose" data-idx="'+i+'">'+v+'</button>').join('')+'</div></div>')+
 (s.phase===2?msg("本次提取情况","共有"+s.choices.filter(x=>x===1).length+"/6组选到了预设词语。这不等于稳定的语义记忆能力。"):'')+'</div>';},
 controls(s,H){return '<div class="control-row">'+H.btn(s.phase===0?"隐藏学习材料并回忆":s.index<5?"下一组":"查看本次记录","next","primary")+
 H.btn("重新学习","reset")+'</div>'+H.field("编码策略","note",s.note,"textarea");},
 click(a,d,s){if(a==="choose")s.choices[s.index]=Number(d.idx);
 if(a==="next"){if(s.phase===0){s.phase=1;s.index=0;}else if(s.phase===1){if(s.index<5)s.index++;else s.phase=2;}}
 if(a==="reset"){s.phase=0;s.index=0;s.choices=[-1,-1,-1,-1,-1,-1];}},
 status:"本例是短延迟甚至无延迟回忆，未测试长期记忆保持。"};
M[92]={
 heading:"新规则先学后用 · 迁移练习",
 goal:"先阅读一条陌生分类规则，再用新材料判断是否能应用到未出现过的例子。",
 instruction:"规则：带条纹且数字为偶数的卡片归入B，其余归入A。依次做四组新卡片。",
 boundary:"单一新规则不足以推断一般学习速度或真正的知识迁移能力。",
 init(){return {training:true,index:0,answers:[-1,-1,-1,-1],shown:false};},
 stage(s){const data=[["条纹",6,true],["无条纹",8,false],["条纹",7,false],["条纹",12,true]];
 const item=data[s.index],valid=s.answers[s.index]===-1?null:s.answers[s.index]===(item[2]?1:0);
 return '<div class="stage-frame"><div class="section-label">NEW RULE / TRANSFER</div>'+
 (s.training?msg("先学习规则","带条纹且数字为偶数→B；其他情况→A。熟悉后点“进入新例子”。"):
 '<div class="rule-card"><span>'+item[0]+'</span><b>'+item[1]+'</b><small>请选择 A 或 B 类</small></div>'+
 '<div class="options-grid">'+["归入A类","归入B类"].map((t,i)=>'<button class="option-tile'+(s.answers[s.index]===i?' selected':'')+'" data-act="answer" data-idx="'+i+'">'+t+'</button>').join('')+'</div>'+
 (s.shown?msg("本组规则核对",valid?"符合刚才的规则。":"与规则不一致：必须同时满足“条纹”和“偶数”才归B。"):'')
 )+'</div>';},
 controls(s,H){return '<div class="control-row">'+H.btn(s.training?"开始新例子":"核对这一组","check","primary")+
 H.btn("进入下一组","next")+H.btn("返回教学","reset")+'</div>';},
 click(a,d,s){if(a==="answer"&&!s.training)s.answers[s.index]=Number(d.idx);
 if(a==="check"){if(s.training)s.training=false;else s.shown=true;}
 if(a==="next"&&!s.training){s.index=(s.index+1)%4;s.shown=false;}
 if(a==="reset")Object.assign(s,this.init());},
 status:"设计用不同图形练习规则，不将正确率直接定义为潜在天赋。"};
const inspection=[
 ["P101","青色手机绳","1条"],
 ["P102","银色手机绳","1条"],
 ["P103","红色手机绳","1条"],
 ["P102","银色手机绳","1条"],
 ["P104","蓝色手机绳","1箱"],
 ["P105","青色手机绳","1条"]
];
M[93]={
 heading:"库存表细节 · 找重复和异常单位",
 goal:"在六行模拟商品表中标出重复ID、不同单位或需要进一步确认的项目。",
 instruction:"点击可疑行，然后核对预设的问题来源。",
 boundary:"虚构商品数据仅用于观察与流程练习，不说明真实库存存在问题。",
 init(){return {flagged:[],checked:false,notes:"异常可能是录入问题，也可能是不同包装规格，需要复查。"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">DETAIL AUDIT / INVENTORY TABLE</div><div class="can-scroll"><table class="data-table"><thead><tr><th></th><th>SKU</th><th>产品</th><th>数量单位</th></tr></thead><tbody>'+
 inspection.map((r,i)=>'<tr data-act="flag" data-idx="'+i+'" style="cursor:pointer;background:'+(s.flagged.includes(i)?"#fff3dc":"transparent")+'"><td>'+(s.flagged.includes(i)?"✓":"□")+'</td><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('')+'</tbody></table></div>'+
 (s.checked?msg("依据核对","第4行重复P102；第5行单位与常规条数不同；第6行虽同名称但ID不同，需要核实而非直接删掉。"):'')+'</div>';},
 controls(s,H){return '<div class="control-row">'+H.btn("查看预设异常依据","check","primary")+H.btn("清除标记","reset")+'</div>'+H.field("你还会核查哪些字段","notes",s.notes,"textarea");},
 click(a,d,s){if(a==="flag"){let i=Number(d.idx);s.flagged=s.flagged.includes(i)?s.flagged.filter(x=>x!==i):[...s.flagged,i];}
 if(a==="check")s.checked=true;if(a==="reset"){s.flagged=[];s.checked=false;}},
 status:"真实库存核查需与订单、物流和SKU主数据对应。"};
M[94]={
 heading:"销量、天气与缺货 · 系统性理解",
 goal:"观察一个虚构商店的销量、天气与库存变化，考虑多因素而非简单归因。",
 instruction:"滑动假设因素，比较表面销量变化和缺货造成的销量上限。",
 boundary:"所有函数和数据是人为设定的教学模型，不能预测真实市场或天气影响。",
 init(){return {demand:65,inventory:40,weather:30,channel:50,notes:"售出量受需求和可供应量同时限制；不宜仅看订单峰值。"};},
 stage(s){const potential=Math.round(s.demand*.7+s.weather*.1+s.channel*.2),sold=Math.min(potential,s.inventory);
 return '<div class="stage-frame"><div class="section-label">MACRO SYSTEM / BOTTLENECKS</div>'+
 '<div class="metric-grid"><div><b>'+potential+'</b><small>模型中的潜在需求指数</small></div><div><b>'+s.inventory+'</b><small>假设供应上限</small></div><div><b>'+sold+'</b><small>模型中实现销量</small></div></div>'+
 '<div class="allocation"><div style="width:'+(sold/100*100)+'%;background:#159995">模拟售出</div><div style="width:'+(Math.max(0,potential-sold))+'%;background:#dbac60">未满足需求</div></div>'+
 msg("局部与全局","需求升高但库存不足时，销量仍可能不变；仅据观察销量无法直接推出需求不变。")+'</div>';},
 controls(s,H){return H.field("基本需求","demand",s.demand,"range",{min:0,max:100,step:5})+
 H.field("库存供给上限","inventory",s.inventory,"range",{min:0,max:100,step:5})+
 H.field("天气示意因素","weather",s.weather,"range",{min:0,max:100,step:5})+
 H.field("渠道示意因素","channel",s.channel,"range",{min:0,max:100,step:5})+
 H.field("需要核查的数据","notes",s.notes,"textarea");},
 status:"所有指标均为模拟值，不能作真实商业预测。"};
M[95]={
 heading:"7秒时序判断 · 不看倒计时",
 goal:"自行估计7秒时长，按“开始”后在感觉达到目标时间时按“结束”。",
 instruction:"按开始后不显示不断变化的计时数字；自己估计到了7秒再结束。",
 boundary:"网页计时受设备响应、浏览器调度、注意与环境影响，不作为医学或个人反应能力测量。",
 init(){return {startedAt:null,result:null,attempts:[],notes:"心理时间感会随情境而变，一次不能说明稳定特点。"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">TIME ESTIMATION / 7 SECONDS</div>'+
 '<div class="timer-big">'+(s.startedAt===null?"07:00":"…")+'</div>'+
 msg("本轮状态",s.startedAt!==null?"已开始：自己估计7秒后点击“结束计时”。":s.result===null?"尚未开始。":("本次估计"+s.result.toFixed(2)+"秒；相对目标偏差"+(s.result-7).toFixed(2)+"秒。"))+
 '<p class="hint">历史尝试：'+(s.attempts.length?s.attempts.map(x=>x.toFixed(2)+"秒").join("，"):"尚无")+'</p></div>';},
 controls(s,H){return '<div class="control-row">'+H.btn(s.startedAt===null?"▶ 开始计时":"■ 结束计时","toggle","primary")+
 H.btn("清空尝试","reset")+'</div>'+
 H.field("观察与体验","notes",s.notes,"textarea");},
 click(a,d,s){if(a==="toggle"){if(s.startedAt===null){s.startedAt=performance.now();s.result=null;}else{s.result=(performance.now()-s.startedAt)/1000;s.attempts.push(s.result);s.startedAt=null;}}
 if(a==="reset"){s.startedAt=null;s.result=null;s.attempts=[];}},
 status:"时间估计使用浏览器单调时钟，无法消除真实输入延迟。"};
})(window.QX_MODULES);