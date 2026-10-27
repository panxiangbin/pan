"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const E=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const movement=["原地踏步","左移一步","右移一步","抬起双臂","转身准备","停顿定格"];
M[15]={
 heading:"八拍动作编排",goal:"设计八拍舞蹈动作的衔接与节奏，不以网页代替实际舞蹈。",
 instruction:"点选一个节拍再更换动作。回放按钮会依次高亮动作步骤。",
 boundary:"网页仅做动作编排，无法测量真实的舞蹈技巧、身体协调或运动能力。线下尝试应量力而行。",
 init(){return {beats:[0,1,0,2,3,5,3,5],pick:0,playing:-1,notes:""};},
 stage(s){return '<div class="stage-frame"><div class="section-label">EIGHT-COUNT MOVEMENT DESIGN</div><div class="movement-grid">'+s.beats.map((b,i)=>'<button class="move-tile'+(s.pick===i?" picked":"")+(s.playing===i?" current":"")+'" data-act="beat" data-idx="'+i+'"><small>第'+(i+1)+'拍</small><strong>'+movement[b]+'</strong></button>').join('')+'</div></div><div class="cue-box"><b>第'+(s.pick+1)+'拍：'+movement[s.beats[s.pick]]+'</b><p>尝试检查前后动作之间是否能够自然衔接。</p></div>';},
 controls(s,H){return H.field("选中节拍动作","move",s.beats[s.pick],"select",movement.map((name,i)=>[i,name]))+
 H.field("动作编排笔记","notes",s.notes,"textarea")+
 '<div class="control-row">'+H.btn("▶ 顺序高亮八拍","play","primary")+H.btn("停止","stop")+H.btn("恢复示范","reset")+'</div>';},
 change(k,v,s){if(k==="move")s.beats[s.pick]=Number(v);},
 click(a,d,s,H){if(a==="beat")s.pick=Number(d.idx);if(a==="reset")Object.assign(s,this.init());
 if(a==="stop"){H.cleanTimers();s.playing=-1;}
 if(a==="play"){H.cleanTimers();for(let i=0;i<8;i++)H.addTimer(setTimeout(()=>{s.playing=i;H.rerender();},i*400));H.addTimer(setTimeout(()=>{s.playing=-1;H.rerender();},3400));}
 },status:"动作预览只显示时间顺序，不能得出舞蹈能力结论。"};
function avatar(s){
const a=s.expression==="喜悦",v=s.intensity,eyebrow=a?126-v*.1:146+v*.08,mouth=a?235+v*.27:220-v*.15;
const hands=s.gesture==="拥抱"?'<path d="M223 286 Q310 340 356 276 M414 290 Q355 335 319 283" stroke="#e7b89d" stroke-width="21" fill="none" stroke-linecap="round"/>':s.gesture==="张开"?'<path d="M223 290 L152 222 M414 290 L490 222" stroke="#e7b89d" stroke-width="21" fill="none" stroke-linecap="round"/>':'<path d="M223 290 L203 405 M414 290 L435 405" stroke="#e7b89d" stroke-width="21" fill="none" stroke-linecap="round"/>';
return '<svg class="art-export" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 445"><rect width="640" height="445" fill="#eff7fa"/><ellipse cx="320" cy="417" rx="173" ry="16" fill="#b7d7de"/><path d="M220 294 Q318 236 420 294 L452 440 H190Z" fill="#6b93a6"/>'+
'<ellipse cx="320" cy="173" rx="103" ry="121" fill="#efc4a6"/><path d="M219 140 Q220 52 315 48 Q422 39 421 151 Q385 95 318 96 Q243 91 219 140" fill="#455363"/>'+
'<path d="M255 '+eyebrow+' L296 137 M344 137 L385 '+eyebrow+'" stroke="#715952" stroke-width="8" stroke-linecap="round"/>'+
'<circle cx="278" cy="173" r="10" fill="#384753"/><circle cx="367" cy="173" r="10" fill="#384753"/>'+
'<path d="M273 220 Q320 '+mouth+' 370 220" stroke="#ad635d" stroke-width="7" stroke-linecap="round" fill="none"/>'+hands+
'<text x="320" y="29" text-anchor="middle" font-size="14" fill="#497484">'+E(s.expression)+' · '+E(s.gesture)+'</text></svg>';
}
M[16]={
 heading:"同一句话 · 两种表演",goal:"选择表情、手势和停顿，探索角色如何传递不同意思。",
 instruction:"尝试把“终于见到你了”演成喜悦或者迟疑。图像只能辅助设计，真实表演需本人实践。",
 boundary:"表情图示不能测评演员的真实表演能力，不采集人脸或声音。",
 hasArt:true,
 init(){return {expression:"喜悦",intensity:65,gesture:"张开",pause:"终于 / 见到你了",reflection:""};},
 stage(s){return '<div class="artboard">'+avatar(s)+'</div><div class="cue-box"><b>台词与停顿</b><p style="font-size:21px">'+E(s.pause)+'</p></div>';},
 controls(s,H){return H.field("情绪方向","expression",s.expression,"select",[["喜悦","喜悦"],["迟疑","迟疑"]])+
 H.field("表情强度","intensity",s.intensity,"range",{min:0,max:100,step:5})+
 H.field("手势","gesture",s.gesture,"select",[["张开","张开"],["拥抱","收拢"],["自然","自然下垂"]])+
 H.field("停顿","pause",s.pause,"text")+H.field("实际表演后的观察（可选）","reflection",s.reflection,"textarea")+
 '<div class="control-row">'+H.btn("切换表情","switch")+H.btn("恢复示范","reset")+'</div>';},
 click(a,d,s){if(a==="switch")s.expression=s.expression==="喜悦"?"迟疑":"喜悦";if(a==="reset")Object.assign(s,this.init());},
 status:"可导出表演示意 SVG；不进行表演评分。"};
const safety=["场地平整、没有明显障碍物","符合自己的身体状态与活动限制","清楚如何安全停止与求助","不安排倒立、空翻或危险器械","将实际结果和计划分开记录"];
M[17]={
 heading:"肢体控制 · 安全观察准备",goal:"制定安全实践的前提条件，并记录现实动作观察，不使用危险动作自测。",
 instruction:"点选安全前提的每一条，填写你愿意线下尝试的非危险观察方案。",
 boundary:"不提供杂技高风险动作指导，不将点击勾选或文字描述当作真实肢体控制能力。",
 init(){return {checks:[false,false,false,false,false],plan:"尚未确定线下活动",record:"尚未进行现实观察"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">SAFETY CHECKLIST</div>'+safety.map((x,i)=>'<button type="button" class="check-tile'+(s.checks[i]?" checked":"")+'" data-act="check" data-idx="'+i+'"><b>'+(s.checks[i]?"✓":"□")+'</b><span>'+E(x)+'</span></button>').join('')+'</div>'+
 '<div class="cue-box"><b>已确认 '+s.checks.filter(Boolean).length+' / 5 条安全准备</b><p>'+E(s.record)+'</p></div>';},
 controls(s,H){return H.field("安全线下活动计划","plan",s.plan,"textarea")+H.field("实际观察记录","record",s.record,"textarea")+H.btn("重置确认项","reset");},
 click(a,d,s){if(a==="check")s.checks[Number(d.idx)]=!s.checks[Number(d.idx)];if(a==="reset")s.checks=[false,false,false,false,false];},
 status:"安全核对只是准备步骤，不构成身体能力成绩。"};
const dirs={up:["前进",0,-1],down:["后退",0,1],left:["左移",-1,0],right:["右移",1,0]};
function foot(s){
let x=2,y=2,pts=[[x,y]];
for(const a of s.steps){const t=dirs[a];x=Math.max(0,Math.min(4,x+t[1]));y=Math.max(0,Math.min(4,y+t[2]));pts.push([x,y]);}
let z='<svg class="art-export" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 450"><rect width="560" height="450" fill="#f1f9f7"/>';
for(let c=0;c<5;c++)for(let r=0;r<5;r++)z+='<rect x="'+(66+c*88)+'" y="'+(20+r*78)+'" width="84" height="74" rx="9" fill="#fff" stroke="#c8e0db"/>';
z+='<polyline fill="none" stroke="#0b8588" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" points="'+pts.map(([xx,yy])=>(108+xx*88)+','+(58+yy*78)).join(' ')+'"/>';
pts.forEach(([xx,yy],i)=>{z+='<circle cx="'+(108+xx*88)+'" cy="'+(58+yy*78)+'" r="'+(i===0?15:10)+'" fill="'+(i===0?"#e2ab56":"#0f8886")+'" stroke="white" stroke-width="3"/>';});
return z+'<text x="280" y="435" font-size="14" text-anchor="middle" fill="#5b838a">安全方向路线草图 · 非武术训练</text></svg>';
}
M[18]={
 heading:"前后左右 · 步伐路线示意",goal:"设计安全步伐的方向顺序，观察路线上的方向变化。",
 instruction:"点击方向按钮添加一步。真实武术动作需合适场地与安全指导。",
 boundary:"不教授对抗、击打或危险技法；图示不能测量真实武术身法。",
 hasArt:true,
 init(){return {steps:["up","right"],notes:"只计划基础方向，不做对抗动作。"};},
 stage(s){return '<div class="artboard">'+foot(s)+'</div><div class="cue-box"><b>方向顺序</b><p>'+s.steps.map((v,i)=>(i+1)+'.'+dirs[v][0]).join(' → ')+'</p></div>';},
 controls(s,H){return '<div class="control-row">'+H.btn("↑ 前进","up")+H.btn("↓ 后退","down")+H.btn("← 左移","left")+H.btn("→ 右移","right")+'</div><div class="control-row">'+H.btn("撤销一步","undo")+H.btn("清空路线","clear")+'</div>'+H.field("备注","notes",s.notes,"textarea");},
 click(a,d,s){if(a in dirs&&s.steps.length<20)s.steps.push(a);if(a==="undo")s.steps.pop();if(a==="clear")s.steps=[];},
 status:"可以保存方向图，但不能作为真实身体能力结论。"};
const mime=["看向远方","惊讶停顿","指向某处","捂住嘴巴","小心收好","示意保密"];
M[19]={
 heading:"无声表达 · 四幕小故事",goal:"用四个动作组织“发现秘密”的情节，观察没有语言时怎样传递信息。",
 instruction:"选择四个镜头的手势与动作，然后可让自愿观看的人讲讲他们理解了什么。",
 boundary:"图片只帮助规划；默剧表现需真人演绎与观众反馈，网页无法直接测量。",
 init(){return {frames:[0,1,3,5],picked:0,audience:"暂无真实观众反馈"};},
 stage(s){return '<div class="stage-frame"><div class="section-label">MIME · FOUR FRAMES</div><div class="mime-grid">'+s.frames.map((f,i)=>'<button class="mime-card'+(s.picked===i?" active":"")+'" data-act="frame" data-idx="'+i+'"><span class="mime-glyph">'+["◎","!","☞","◌","▣","◇"][f]+'</span><b>场景'+(i+1)+'</b><small>'+mime[f]+'</small></button>').join('')+'</div></div><div class="cue-box"><b>他人实际理解记录</b><p>'+E(s.audience)+'</p></div>';},
 controls(s,H){return H.field("当前场景动作","gesture",s.frames[s.picked],"select",mime.map((t,i)=>[i,t]))+
 H.field("观众反馈（可空）","audience",s.audience,"textarea")+H.btn("恢复示范","reset");},
 change(k,v,s){if(k==="gesture")s.frames[s.picked]=Number(v);},
 click(a,d,s){if(a==="frame")s.picked=Number(d.idx);if(a==="reset")Object.assign(s,this.init());},
 status:"不提供真实默剧表演的正确率评分。"};
M[20]={
 heading:"一座车站 · 两个人物 · 150字故事",goal:"创作短篇文字并观察作品结构，支持修改和导出。",
 instruction:"限制在一个场景、两个人物内，写出事件和转折。文字长度不是天赋成绩。",
 boundary:"限制条件只是创作约束；不依据字数或单次作品判断文学能力。",
 init(){return {story:"夜里，车站只剩两个人。旅客在长椅上发现一个旧钱包……",characters:"旅客甲、旅客乙",location:"车站站台",turn:"归还钱包时，发现钱包另有来历。"};},
 stage(s){const n=[...s.story].filter(c=>!/\s/.test(c)).length;
 return '<div class="stage-frame"><div class="space-between"><div class="section-label">SHORT STORY DRAFT</div><span class="badge">'+n+' / 150字建议</span></div><div class="story-paper"><div class="story-label">两个人物 · 一个场景</div><p>'+E(s.story).replace(/\n/g,"<br>")+'</p></div></div>'+
 '<div class="cue-box"><b>创作约束</b><p>人物：'+E(s.characters)+'；地点：'+E(s.location)+'</p><p>转折：'+E(s.turn)+'</p></div>';},
 controls(s,H){return H.field("短篇故事","story",s.story,"textarea")+H.field("人物","characters",s.characters,"text")+
 H.field("场景","location",s.location,"text")+H.field("故事转折","turn",s.turn,"textarea")+
 '<div class="control-row">'+H.btn("提供转折提示","idea")+H.btn("恢复初稿","reset")+'</div>';},
 click(a,d,s){if(a==="idea")s.turn="归还钱包时，对方却说钱包不是自己的，还念出了旅客的名字。";if(a==="reset")Object.assign(s,this.init());},
 status:"在右侧修改文字，左侧实时生成故事排版。"};
})(window.QX_MODULES);