"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const box=(t,x)=>'<div class="cue-box"><b>'+t+'</b><p>'+x+'</p></div>';
const f=(x,d=1)=>Number(x).toFixed(d);
M[72]={
 heading:"齿轮传动 · 算转速与方向",
 goal:"调整三只外啮合齿轮的齿数和转速，检验惰轮是否影响最后的传动比。",
 instruction:"改变主动轮、中间轮及输出轮的齿数，观察转速及转向。",
 boundary:"几何只作教学示意，不模拟真实齿形、中心距、轴承负载或机械安全。",
 hasArt:true,
 init(){return {z1:20,z2:36,z3:50,rpm:120,clockwise:true,note:"两次外啮合后输出轮转向与输入轮相同。"};},
 stage(s){const r=[35+s.z1*.35,35+s.z2*.35,35+s.z3*.35];const cx=[140,140+r[0]+r[1],140+r[0]+r[1]+r[1]+r[2]];
 const wheels=r.map((radius,i)=>'<circle cx="'+cx[i]+'" cy="157" r="'+radius+'" fill="'+["#e9b46d","#72a5bd","#74baae"][i]+'" stroke="#3b6677" stroke-width="6"/>'+
 '<circle cx="'+cx[i]+'" cy="157" r="15" fill="#f0fbfc" stroke="#4a7786" stroke-width="3"/>'+
 '<text x="'+cx[i]+'" y="254" font-size="16" text-anchor="middle" fill="#375d70">'+[s.z1,s.z2,s.z3][i]+'齿</text>').join('');
 const n2=s.rpm*s.z1/s.z2,n3=s.rpm*s.z1/s.z3;
 return '<div class="stage-frame"><div class="section-label">GEAR TRAIN / 2 EXTERNAL MESHES</div><div class="artboard"><svg class="art-export" viewBox="0 0 740 290" xmlns="http://www.w3.org/2000/svg"><rect width="740" height="290" fill="#eaf7fa"/>'+wheels+'</svg></div>'+
 '<div class="metric-grid"><div><b>'+s.rpm+' rpm</b><small>输入 · '+(s.clockwise?"顺":"逆")+'时针</small></div>'+
 '<div><b>'+f(n2)+' rpm</b><small>中间轮 · 反向</small></div>'+
 '<div><b>'+f(n3)+' rpm</b><small>输出 · '+(s.clockwise?"顺":"逆")+'时针</small></div></div>'+
 box("理想计算","输入与中间轮速比为Z1/Z2；最终输出速比为Z1/Z3。中间惰轮不改变最终速比。")+'</div>';},
 controls(s,H){return H.field("输入齿数","z1",s.z1,"range",{min:12,max:65,step:1,unit:"齿"})+
 H.field("中间齿数","z2",s.z2,"range",{min:12,max:65,step:1,unit:"齿"})+
 H.field("输出齿数","z3",s.z3,"range",{min:12,max:65,step:1,unit:"齿"})+
 H.field("输入转速","rpm",s.rpm,"range",{min:30,max:360,step:10,unit:"rpm"})+
 H.field("你的结论","note",s.note,"textarea")+
 H.btn("切换输入方向","reverse");},
 click(a,d,s){if(a==="reverse")s.clockwise=!s.clockwise;},
 status:"输出结果由齿数比例计算，未包含传动损失。"};
M[73]={
 heading:"低压直流电路 · 欧姆定律",
 goal:"调节理想电压与电阻，计算闭合电路中的电流和功率。",
 instruction:"选择电压、电阻，开关可以断开或闭合。观察 I=V/R 的结果。",
 boundary:"仅为网页低压理想直流示意；不提供市电接线、带电操作或器件选择建议。",
 hasArt:true,
 init(){return {voltage:4.5,resistance:300,closed:true,comment:"当电阻增加，电压不变时，电流将下降。"};},
 stage(s){const i=s.closed?s.voltage/s.resistance:0,p=s.voltage*i;
 return '<div class="stage-frame"><div class="section-label">IDEAL DC / OHM LAW</div><div class="artboard"><svg class="art-export" viewBox="0 0 650 270" xmlns="http://www.w3.org/2000/svg"><rect width="650" height="270" fill="#f1fbfc"/>'+
 '<path d="M110 130 V45 H530 V215 H110 V130 M110 130 H125 M148 130 H190" stroke="#36878c" fill="none" stroke-width="8"/>'+
 '<path d="M127 105 V156 M144 117 V143" stroke="#374d65" stroke-width="5"/>'+
 '<path d="M267 45 l13 -18 14 36 14 -36 14 36 14 -18" fill="none" stroke="#dd9b4b" stroke-width="6"/>'+
 '<circle cx="530" cy="130" r="29" fill="'+(s.closed?"#f1c966":"#becbd2")+'" stroke="#537581" stroke-width="4"/>'+
 '<text x="130" y="202" text-anchor="middle" fill="#406b78" font-size="20">'+s.voltage+'V</text>'+
 '<text x="300" y="103" text-anchor="middle" fill="#406b78" font-size="20">'+s.resistance+'Ω</text>'+
 '<text x="530" y="185" text-anchor="middle" fill="#406b78" font-size="18">'+(s.closed?"ON":"OFF")+'</text></svg></div>'+
 '<div class="metric-grid"><div><b>'+f(i*1000,1)+'mA</b><small>理论电流</small></div><div><b>'+f(p,3)+'W</b><small>电阻功耗</small></div><div><b>'+(s.closed?"闭合":"断开")+'</b><small>开关状态</small></div></div>'+
 box("公式","闭合：I=V/R，P=VI；断开时理想模型电流为0。")+'</div>';},
 controls(s,H){return H.field("电压","voltage",s.voltage,"range",{min:1.5,max:9,step:1.5,unit:"V"})+
 H.field("电阻","resistance",s.resistance,"range",{min:50,max:1000,step:50,unit:"Ω"})+
 H.field("观察笔记","comment",s.comment,"textarea")+
 H.btn(s.closed?"断开开关":"闭合开关","toggle");},
 click(a,d,s){if(a==="toggle")s.closed=!s.closed;},
 status:"网页计算不能代替真实电气安全设计。"};
M[74]={
 heading:"自动浇水 · 故障保护条件",
 goal:"组合湿度、阈值、水箱和传感器状态，体验自动控制和失效安全。",
 instruction:"调湿度、模拟传感器损坏或水箱缺水，检查水泵是否安全停止。",
 boundary:"控制逻辑仅是教学状态机，不直接控制实际水泵；真实设备需防干转、电气保护与监控。",
 init(){return {moisture:35,threshold:45,sensorFail:false,tankEmpty:false,stop:false,comment:"传感器失效时默认停止。"};},
 stage(s){const pump=!(s.sensorFail||s.tankEmpty||s.stop)&&s.moisture<s.threshold;
 const reason=s.sensorFail?"传感器失效":s.tankEmpty?"水箱缺水":s.stop?"人工停止":pump?"低于设定湿度":"湿度已达到阈值";
 return '<div class="stage-frame"><div class="section-label">AUTOMATION / FAIL-SAFE</div><div class="control-flow"><div>传感输入<strong>'+s.moisture+'</strong></div><span>→</span><div>阈值比较<strong>'+s.threshold+'</strong></div><span>→</span><div>水泵输出<strong>'+(pump?"运行":"停止")+'</strong></div></div>'+
 '<div class="status-light '+(pump?"on":"off")+'">'+(pump?"● 水泵允许运行":"○ 进入停止状态")+'</div>'+
 box("当前控制原因",reason)+'</div>';},
 controls(s,H){return H.field("湿度模拟值","moisture",s.moisture,"range",{min:0,max:100,step:5})+
 H.field("灌溉阈值","threshold",s.threshold,"range",{min:10,max:90,step:5})+
 '<div class="control-row">'+H.btn(s.sensorFail?"恢复传感器":"模拟故障","sensor")+
 H.btn(s.tankEmpty?"补足水箱":"模拟缺水","tank")+
 H.btn(s.stop?"解除停机":"人工停机","stop")+'</div>'+
 H.field("控制逻辑说明","comment",s.comment,"textarea");},
 click(a,d,s){if(a==="sensor")s.sensorFail=!s.sensorFail;if(a==="tank")s.tankEmpty=!s.tankEmpty;if(a==="stop")s.stop=!s.stop;},
 status:"故障情况下输出被阻止，演示不连接真实硬件。"};
const rows=[["A01","王明","郑州"],["A02","王明","洛阳"],["A03","刘芳","北京"],["A01","王明","郑州"],["A04","陈杰","上海"],["A03","刘芳","北京"]];
M[75]={
 heading:"名单算法 · 不同去重键的后果",
 goal:"选择唯一ID、姓名或地区作为去重依据，观察错删风险。",
 instruction:"在六条虚构记录中选择去重键，执行并对比保留条数。",
 boundary:"全部为虚构个人记录，不上传数据；真实身份去重需合法授权和稳定识别键。",
 init(){return {key:"id",run:false,note:"同名不一定是同一人，应优先核对稳定标识。"};},
 stage(s){const col={id:0,name:1,region:2}[s.key],seen=new Set();
 const data=rows.map(r=>{const keep=!seen.has(r[col]);seen.add(r[col]);return [...r,keep];});
 return '<div class="stage-frame"><div class="section-label">DEDUPLICATION / ID VS NAME</div><div class="can-scroll"><table class="data-table"><thead><tr><th>ID</th><th>姓名</th><th>地区</th><th>结果</th></tr></thead><tbody>'+
 data.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+(s.run?(r[3]?"保留":"<span style=\"color:#a36a45\">重复</span>"):"未执行")+'</td></tr>').join('')+'</tbody></table></div>'+
 box("检查规则",s.run?"保留 "+data.filter(x=>x[3]).length+" 条记录。按姓名去重可能把两个不同的王明合并。":"先选定去重依据。")+'</div>';},
 controls(s,H){return H.field("去重字段","key",s.key,"select",[["id","按唯一ID"],["name","按姓名"],["region","按地区"]])+
 '<div class="control-row">'+H.btn("执行去重","run","primary")+H.btn("重置","reset")+'</div>'+
 H.field("风险与修正","note",s.note,"textarea");},
 change(k,v,s){if(k==="key")s.run=false;},
 click(a,d,s){if(a==="run")s.run=true;if(a==="reset")s.run=false;},
 status:"这是重复检测规则演示，不是数据处理生产系统。"};
})(window.QX_MODULES);