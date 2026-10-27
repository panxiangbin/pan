"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const e=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const box=(a,b)=>'<div class="cue-box"><b>'+e(a)+'</b><p>'+e(b)+'</p></div>';
M[76]={
 heading:"登录—存储—导出 · 模块依赖实验",
 goal:"改变认证、数据校验和存储模块的启用状态，比较哪些条件下应该允许导出。",
 instruction:"切换模拟用户权限和各个组件的状态，看是否应阻止导出。",
 boundary:"这只是结构与权限概念演示，不实际保存个人数据，也不构成安全审计。",
 init(){return {auth:true,validation:true,storage:true,role:"viewer",comment:"权限检查应由可信服务器完成，不能只靠隐藏按钮。"};},
 stage(s){const authorized=s.auth&&s.validation&&s.storage&&s.role==="editor";
 const missing=[];if(!s.auth)missing.push("认证不可用");if(!s.validation)missing.push("输入校验关闭");if(!s.storage)missing.push("存储不可用");if(s.role!=="editor")missing.push("访客没有导出权限");
 return '<div class="stage-frame"><div class="section-label">SYSTEM ARCHITECTURE / ACCESS CONTROL</div><div class="control-flow">'+
 '<div>认证<strong>'+(s.auth?"正常":"关闭")+'</strong></div><span>→</span>'+
 '<div>输入校验<strong>'+(s.validation?"正常":"关闭")+'</strong></div><span>→</span>'+
 '<div>数据存储<strong>'+(s.storage?"正常":"关闭")+'</strong></div></div>'+
 '<div class="status-light '+(authorized?"on":"off")+'">'+(authorized?"允许进入模拟导出流程":"导出应被阻止")+'</div>'+
 box("检查结果",missing.length?missing.join("、"):"角色与模拟模块条件都满足；真实后端仍需独立验证。")+'</div>';},
 controls(s,H){return H.field("访问身份","role",s.role,"select",[["viewer","普通访客"],["editor","具备导出权限的编辑者"]])+
 '<div class="control-row">'+H.btn(s.auth?"关闭认证":"开启认证","auth")+
 H.btn(s.validation?"关闭校验":"开启校验","validation")+
 H.btn(s.storage?"关闭存储":"开启存储","storage")+'</div>'+
 H.field("错误与权限说明","comment",s.comment,"textarea");},
 click(a,d,s){if(["auth","validation","storage"].includes(a))s[a]=!s[a];},
 status:"现实系统要验证实际服务端实现，不根据示意判定安全。"};
M[77]={
 heading:"八周销量 · 异常与重复行",
 goal:"用一组虚构销售数据分析波峰背后可能的重复录入、活动与季节因素。",
 instruction:"删除虚构的重复行、打开活动影响，比对峰值为什么发生变化。",
 boundary:"全部数据均为合成数据，不代表真实店铺或具体销售预测。",
 hasArt:true,
 init(){return {duplicate:true,promotion:false,source:"order",comment:"需要核对订单ID、退款、渠道和时间窗口。"};},
 stage(s){const baseline=[28,31,29,36,35,60,42,38];
 const values=baseline.map((v,i)=>v+(i===5&&s.duplicate?24:0)+(i===5&&s.promotion?10:0));
 const bars=values.map((v,i)=>'<rect x="'+(48+i*76)+'" y="'+(280-v/100*230)+'" width="47" height="'+(v/100*230)+'" rx="5" fill="'+(i===5?"#e6a654":"#54aaa8")+'"/>'+
 '<text x="'+(72+i*76)+'" y="'+(265-v/100*230)+'" font-size="14" text-anchor="middle" fill="#346372">'+v+'</text>'+
 '<text x="'+(72+i*76)+'" y="309" font-size="13" text-anchor="middle" fill="#53727e">'+(i+1)+'</text>').join('');
 return '<div class="stage-frame"><div class="section-label">SYNTHETIC SALES / 8 WEEKS</div><div class="artboard">'+
 '<svg class="art-export" viewBox="0 0 710 340" xmlns="http://www.w3.org/2000/svg"><rect width="710" height="340" fill="#eff8fa"/>'+
 '<path d="M35 280 H685" fill="none" stroke="#83a3ab" stroke-width="3"/>'+bars+
 '<text x="355" y="330" font-size="13" text-anchor="middle" fill="#57848d">周编号</text></svg></div>'+
 box("波峰复核","第6周当前"+(s.duplicate?"包含":"不包含")+"重复记录，"+(s.promotion?"叠加了":"没有叠加")+"教学用促销影响。异常峰值需要逐项核实。")+'</div>';},
 controls(s,H){return '<div class="control-row">'+H.btn(s.duplicate?"去掉重复记录":"恢复重复记录","duplicate")+
 H.btn(s.promotion?"取消假定活动影响":"添加假定活动影响","promotion")+'</div>'+
 H.field("查验数据口径","source",s.source,"select",[["order","订单ID"],["channel","渠道来源"],["date","统计日期"]])+
 H.field("复核方案","comment",s.comment,"textarea");},
 click(a,d,s){if(a==="duplicate")s.duplicate=!s.duplicate;if(a==="promotion")s.promotion=!s.promotion;},
 status:"分析需要区分相关性和因果，不虚构真实业绩数据。"};
M[78]={
 heading:"访客Wi-Fi · 隔离与最小权限",
 goal:"通过开关模拟访客无线网络分区、访客到办公网访问限制与安全更新。",
 instruction:"尝试更改隔离和访问策略，看看哪些组合会触发安全问题提醒。",
 boundary:"只涉及授权环境下的防护概念，不提供侵入系统、绕过限制或监控他人的操作。",
 init(){return {isolated:true,officeAccess:false,updated:true,logs:false,comment:"访客网络不应直接访问内部办公设备。"};},
 stage(s){const okay=s.isolated&&!s.officeAccess&&s.updated;
 return '<div class="stage-frame"><div class="section-label">DEFENSIVE NETWORK DESIGN</div><div class="control-flow">'+
 '<div>访客设备<strong>非内部用户</strong></div><span>→</span>'+
 '<div>隔离规则<strong>'+(s.isolated?"已设置":"未设置")+'</strong></div><span>→</span>'+
 '<div>办公内网<strong>'+(s.officeAccess?"允许访问":"限制访问")+'</strong></div></div>'+
 '<div class="status-light '+(okay?"on":"off")+'">'+(okay?"示例主要隔离条件满足":"存在示例中的网络防护风险")+'</div>'+
 box("进一步确认","网络隔离并不能单独保证安全，还需要身份验证、设备更新与必要且合规的日志。")+'</div>';},
 controls(s,H){return '<div class="control-row">'+H.btn(s.isolated?"关闭访客隔离":"开启访客隔离","isolated")+
 H.btn(s.officeAccess?"禁止访问办公网":"允许访问办公网","officeAccess")+
 H.btn(s.updated?"标记设备未更新":"标记设备已更新","updated")+
 H.btn(s.logs?"关闭日志示例":"开启日志示例","logs")+'</div>'+
 H.field("实际防护需要哪些环节","comment",s.comment,"textarea");},
 click(a,d,s){if(["isolated","officeAccess","updated","logs"].includes(a))s[a]=!s[a];},
 status:"没有连接真实网络，不会更改路由器设置。"};
const safeChecks=["外部环境无烟味、过热或液体","外部电源连接外观已检查","显示器或外设的连接已检查","已记录故障发生方式与提示信息"];
M[79]={
 heading:"设备不开机 · 安全的外部检查",
 goal:"建立故障记录流程，区分可安全检查的外观事项与必须交给专业人员的环节。",
 instruction:"依次完成外部安全清单，写明什么时候需要停止并交给专业人员。",
 boundary:"不指导打开外壳、测量市电或触碰带电设备；如有危险迹象应立即停止使用。",
 init(){return {checked:[false,false,false,false],notes:"如有焦味、冒烟、触电风险应断开使用并求助专业人员。"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">SAFE EXTERNAL CHECK / DO NOT OPEN</div>'+
 safeChecks.map((x,i)=>'<button class="check-tile'+(s.checked[i]?" checked":"")+'" data-act="check" data-idx="'+i+'"><b>'+(s.checked[i]?"✓":"□")+'</b><span>'+x+'</span></button>').join('')+
 box("排查记录","已确认"+s.checked.filter(Boolean).length+"/4条外部项目，不能据此断定内部硬件健康。")+'</div>';},
 controls(s,H){return H.field("停止和求助的条件","notes",s.notes,"textarea")+H.btn("重置检查","reset");},
 click(a,d,s){if(a==="check"){const i=Number(d.idx);s.checked[i]=!s.checked[i];}if(a==="reset")s.checked=[false,false,false,false];},
 status:"这是安全记录模板，不包含硬件维修指导。"};
function sketch(s){
const len=s.length,t=s.thickness,gap=s.gap;const x2=95+len*4.3,y=255-t*9;
return '<svg class="art-export" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 730 390" aria-label="参数变化的卡扣零件二维尺寸示意"><rect width="730" height="390" fill="#edf8fa"/>'+
 '<path d="M95 255 H'+x2+' V'+y+' H'+(x2-35)+' V'+(y+28)+' H95Z" fill="#5aaba5" stroke="#285f72" stroke-width="4"/>'+
 '<rect x="'+(x2-50)+'" y="'+(y-13)+'" width="'+(12+gap*11)+'" height="12" fill="#efb56b" stroke="#ab8047" stroke-width="2"/>'+
 '<path d="M95 295 H'+x2+' M95 282 V308 M'+x2+' 282 V308" stroke="#416a79" stroke-width="2"/>'+
 '<text x="'+((95+x2)/2)+'" y="323" text-anchor="middle" font-size="17" fill="#365e73">'+len+' mm 长度</text>'+
 '<text x="23" y="81" font-size="17" fill="#356879">宽度 '+s.width+'mm · 厚度 '+t+'mm · 间隙 '+gap+'mm</text>'+
 '<text x="370" y="365" text-anchor="middle" font-size="13" fill="#5d7a87">仅是尺寸示意 · 不是满足装配规范的三维工程图</text></svg>';
}
M[80]={
 heading:"卡扣设计 · 参数化尺寸草图",
 goal:"修改长、宽、厚度和间隙，观察参数对二维零件示意的影响。",
 instruction:"先确定尺寸基准和装配限制，随后调整尺寸并导出SVG草图。",
 boundary:"本项目不是SOLIDWORKS完整建模，也未校核强度、公差和材料；不能直接用于生产。",
 hasArt:true,
 init(){return {length:85,width:18,thickness:5,gap:1,material:"plastic",notes:"需要测量配合零件、确认材料并进行实际装配验证。"};},
 stage(s){const ratio=s.length/s.thickness;
 return '<div class="stage-frame"><div class="section-label">CAD PARAMETRIC SKETCH / NOT A SOLID MODEL</div><div class="artboard">'+sketch(s)+'</div>'+
 box("几何检查","长度与厚度比约为"+ratio.toFixed(1)+"。比例只能提醒继续做结构校核，不能证明强度或柔韧性。")+'</div>';},
 controls(s,H){return H.field("梁长度","length",s.length,"range",{min:30,max:135,step:5,unit:"mm"})+
 H.field("零件宽度","width",s.width,"range",{min:8,max:35,step:1,unit:"mm"})+
 H.field("基本厚度","thickness",s.thickness,"range",{min:2,max:12,step:.5,unit:"mm"})+
 H.field("装配间隙","gap",s.gap,"range",{min:.2,max:3,step:.2,unit:"mm"})+
 H.field("材料类型（仅记录）","material",s.material,"select",[["plastic","塑料，待明确牌号"],["metal","金属，待明确牌号"]])+
 H.field("实际工程需求","notes",s.notes,"textarea");},
 status:"导出SVG仅供方案沟通，真实3D建模仍需工程约束。"};
})(window.QX_MODULES);