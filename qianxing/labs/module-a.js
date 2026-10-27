"use strict";
window.QX_MODULES=window.QX_MODULES||{};
(function(M){
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const seqSeed=[
{mel:[1,3,4,3,1,0,2,3],bass:[1,0,0,0,1,0,0,0],drum:[1,0,1,0,1,0,1,0]},
{mel:[4,5,6,5,3,4,6,5],bass:[1,0,1,0,1,0,1,0],drum:[1,1,1,0,1,1,1,0]},
{mel:[3,2,1,0,2,1,1,0],bass:[1,0,0,0,1,0,0,0],drum:[1,0,1,0,1,0,1,0]}
];
function sectionButtons(s){return '<div class="segmented">'+["① 平静","② 转折","③ 收束"].map((v,i)=>'<button type="button" class="'+(s.section===i?"active":"")+'" data-act="section" data-idx="'+i+'">'+v+'</button>').join('')+'</div>';}
M[3]={
 heading:"把一段短片变成24拍旋律",goal:"3段×8步。每一拍可调整主旋律音高、低音和敲击节奏。",
 instruction:"选择段落，点击格子来改变旋律或节拍，然后点“试听整首”。每次修改都属于作品的一部分。",
 boundary:"这是简化的音乐序列器，不测量演奏技巧，也没有专业编曲软件的音质和混音能力。",
 hasArt:false,
 init(){return {tempo:112,section:0,parts:JSON.parse(JSON.stringify(seqSeed)),playing:false};},
 stage(s){const p=s.parts[s.section];const captions=["主旋律","低音","节奏"];let rows=["mel","bass","drum"].map((row,k)=>'<div class="step-row"><span class="step-name">'+captions[k]+'</span><div class="steps">'+p[row].map((v,i)=>'<button type="button" aria-label="'+captions[k]+'第'+(i+1)+'拍，'+(row==="mel"?(v?"音级"+v:"休止"):(v?"开启":"关闭"))+'" data-act="beat" data-row="'+row+'" data-idx="'+i+'" class="step '+row+(v?" on":"")+'">'+(row==="mel"?(v||"—"):(v?"●":"—"))+'</button>').join('')+'</div></div>').join('');
return '<div class="stage-frame"><div class="space-between"><span class="section-label">24 STEP SEQUENCER</span><span class="badge">速度 '+s.tempo+' BPM</span></div>'+sectionButtons(s)+'<div style="padding-top:15px">'+rows+'</div><p class="music-desc">主旋律点击依次在休止、六种音高间循环；低音和鼓点可以开关。3个段落会连在一起播放。</p></div>'+
'<div class="control-row">'+(s.playing?'<span class="badge">整首试听进行中</span>':'<span class="pill">可调整每段的音符</span>')+'</div>';
},
 controls(s,H){return H.field("整曲速度","tempo",s.tempo,"range",{min:72,max:160,step:4,unit:"BPM"})+
 '<div class="control-row">'+H.btn("▶ 试听整首","play","primary")+H.btn("■ 停止播放","stop")+H.btn("恢复默认旋律","reset")+'</div>'+
 '<p class="hint">声音由浏览器实时合成。音符越密，听感通常越忙；改变速度和旋律可对比效果。</p>';},
 click(act,d,s,H){if(act==="section")s.section=Number(d.idx);
 if(act==="beat"){const arr=s.parts[s.section][d.row],i=Number(d.idx);arr[i]=d.row==="mel"?(arr[i]+1)%7:(1-arr[i]);}
 if(act==="reset"){s.parts=JSON.parse(JSON.stringify(seqSeed));s.playing=false;H.stopMedia();}
 if(act==="stop"){H.stopMedia();s.playing=false;}
 if(act==="play"){
   if(!H.audio){s.playing=false;H.note("当前浏览器不支持 Web Audio。");return;}
   H.stopMedia();H.cleanTimers();
   const ctx=new H.audio(),osc=[];
   H.setMedia({stop(){osc.forEach(x=>{try{x.stop()}catch(e){}});ctx.close().catch(()=>{});}});
   try{ctx.resume();}catch(e){}
   const step=60/s.tempo/2, start=ctx.currentTime+.10,scale=[0,60,62,64,67,69,72];
   s.parts.forEach((part,j)=>{part.mel.forEach((n,k)=>{
     const when=start+(j*8+k)*step;
     if(n)osc.push(H.midi(ctx,scale[n],when,step*.87,.06,"triangle"));
     if(part.bass[k])osc.push(H.midi(ctx,[48,50,53][j],when,step*.9,.052,"sine"));
     if(part.drum[k]){const o=ctx.createOscillator(),g=ctx.createGain();o.type="triangle";o.frequency.setValueAtTime(190,when);o.frequency.exponentialRampToValueAtTime(55,when+.08);g.gain.setValueAtTime(.09,when);g.gain.exponentialRampToValueAtTime(.0001,when+.09);o.connect(g).connect(ctx.destination);o.start(when);o.stop(when+.1);osc.push(o);}
   });});
   s.playing=true;
   H.addTimer(setTimeout(()=>{s.playing=false;H.note("24拍试听已播放完，可以换一段旋律继续创作。");H.rerender();},24*step*1000+500));
 }
},status:"点格子修改后，再试听整首作品。"};
function fader(title,key,subtitle,s){return '<div class="mixer-track"><div class="track-led"></div><div class="track-name">'+title+'</div><div class="track-sub">'+subtitle+'</div><div class="fader"><input aria-label="'+title+'的音量" type="range" min="0" max="100" value="'+s[key]+'" data-key="'+key+'"></div><div class="readout">'+s[key]+'%</div></div>';}
M[4]={
 heading:"雨夜旁白 · 三轨混音台",goal:"尝试听见旁白、环境雨声与背景音乐互相遮蔽的关系。",
 instruction:"拖动三个推子，再点“试听混音”。降低背景雨声，看看文字是不是容易听清。",
 boundary:"使用浏览器生成的环境音、简单音符和系统语音合成，是混音原理体验；不等于真人配音与专业录音。",
 init(){return {voice:90,rain:38,music:24,rate:1,previewed:0};},
 stage(s){return '<div class="stage-frame"><div class="space-between"><span class="section-label">SOUND MIXING / 3 TRACKS</span><span class="badge">雨夜站台</span></div><div class="mixer-tracks">'+
 fader("旁白","voice","系统合成语音",s)+fader("雨声","rain","合成环境噪声",s)+fader("背景音乐","music","三音旋律",s)+'</div></div>'+
 '<div class="cue-box"><b>试听旁白台词</b><p>雨夜的最后一班车，驶过安静的街道。远处的灯光，渐渐亮了起来。</p>'+
 '<p class="hint">推子为相对响度示意；实际听感受设备和扬声器影响。</p></div>';},
 controls(s,H){return '<div class="control-row">'+H.btn("▶ 试听当前混音","mix","primary")+H.btn("■ 停止","stop")+'</div>'+
 H.field("旁白语速","rate",s.rate,"range",{min:.7,max:1.3,step:.1})+
 '<div class="control-row">'+H.btn("突出旁白","clear")+H.btn("雨声较大","storm")+H.btn("恢复平衡","reset")+'</div><p class="hint">系统的中文语音是否可用，取决于操作系统与浏览器。</p>';},
 click(act,d,s,H){
 if(act==="clear"){s.voice=100;s.rain=15;s.music=13;}
 if(act==="storm"){s.voice=45;s.rain=100;s.music=60;}
 if(act==="reset"){s.voice=90;s.rain=38;s.music=24;}
 if(act==="stop")H.stopMedia();
 if(act==="mix"){
   H.stopMedia();
   const Speech=typeof speechSynthesis!=="undefined"&&typeof SpeechSynthesisUtterance!=="undefined";
   if(!H.audio){H.note("当前浏览器不支持声音合成。");return;}
   const ctx=new H.audio(),duration=8;
   const buffers=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate),buf=buffers.getChannelData(0);
   for(let i=0;i<buf.length;i++)buf[i]=(Math.random()*2-1)*.48;
   const noise=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
   noise.buffer=buffers;filter.type="lowpass";filter.frequency.value=1450;gain.gain.value=(s.rain/100)*.18;
   noise.connect(filter).connect(gain).connect(ctx.destination);noise.start();
   const oscs=[];const scale=[60,64,67,72,69,67,64,60];
   for(let i=0;i<16;i++)oscs.push(H.midi(ctx,scale[i%8],ctx.currentTime+.13+i*.42,.31,.036*s.music/100,"triangle"));
   if(Speech){const utter=new SpeechSynthesisUtterance("雨夜的最后一班车，驶过安静的街道。远处的灯光，渐渐亮了起来。");utter.lang="zh-CN";utter.rate=s.rate;utter.volume=Math.max(0,Math.min(1,s.voice/100));speechSynthesis.speak(utter);}
   H.setMedia({stop(){try{noise.stop()}catch(e){}oscs.forEach(o=>{try{o.stop()}catch(e){}});ctx.close().catch(()=>{});if(Speech)speechSynthesis.cancel();}});
   H.addTimer(setTimeout(()=>H.stopMedia(),8100));
   s.previewed++;
 }
 },status:"点击试听后可调整三条音轨的推子。"};
M[5]={
 heading:"同一段话，读出不同含义",goal:"改变语速、音高和重点词，让系统语音播出不同版本。",
 instruction:"改动语速或重读词并试听。可自己朗读对比，但系统合成语音不代表真实朗诵表现。",
 boundary:"受系统 TTS 自然度、声音库和浏览器限制；网页版不能评定配音或真实朗诵能力。",
 init(){return {text:"暮色渐渐落下。远方的灯光亮了起来，我们终于找到了回家的路。",rate:1,pitch:1,focus:"终于",played:0};},
 stage(s){const txt=e(s.text),focus=e(s.focus);const pos=txt.indexOf(focus);let visible=txt;
   if(pos>=0&&focus)visible=txt.slice(0,pos)+'<span class="emphasis">'+focus+'</span>'+txt.slice(pos+focus.length);
   return '<div class="speak-preview">'+visible+'</div><div class="cue-box"><div class="section-label">朗诵提示</div><p>先用平稳语速读一次，再把重音放在“终于”或“回家”。听听你希望观众注意什么。</p><div class="score"><span class="pill">语速 '+s.rate+'</span><span class="pill">音高 '+s.pitch+'</span><span class="pill">重点词 '+e(s.focus)+'</span></div></div>';},
 controls(s,H){return H.field("朗诵文稿","text",s.text,"textarea")+
 H.field("重读词","focus",s.focus,"select",[["终于","终于"],["远方","远方"],["回家","回家"],["灯光","灯光"]])+
 H.field("朗诵速度","rate",s.rate,"range",{min:.65,max:1.35,step:.05})+
 H.field("声音音高","pitch",s.pitch,"range",{min:.7,max:1.3,step:.1})+
 '<div class="control-row">'+H.btn("▶ 系统语音试听","speak","primary")+H.btn("■ 停止朗诵","stop")+'</div>';},
 click(act,d,s,H){if(act==="stop")H.stopMedia();
 if(act==="speak"){
   H.stopMedia();
   if(typeof speechSynthesis==="undefined"||typeof SpeechSynthesisUtterance==="undefined"){H.note("设备不支持语音合成，请自行朗读并记录差异。");return;}
   const txt=s.text||"",idx=txt.indexOf(s.focus),chunks=idx<0?[[txt,false]]:[[txt.slice(0,idx),false],[txt.slice(idx,idx+s.focus.length),true],[txt.slice(idx+s.focus.length),false]];
   const say=[];for(const [t,em] of chunks){if(!t)continue;const u=new SpeechSynthesisUtterance(t);u.lang="zh-CN";u.rate=em?s.rate*.78:s.rate;u.pitch=em?Math.min(2,s.pitch+.13):s.pitch;u.volume=1;say.push(u);}
   H.setMedia({stop(){speechSynthesis.cancel();}});
   for(const u of say)speechSynthesis.speak(u);
   s.played++;
 }
},status:"选择重读位置和语速，比较同一句话的表达区别。"};
function canvasSvg(s,calligraphy){
  return '<div class="canvas-wrap"><canvas class="draw" width="720" height="420" aria-label="'+(calligraphy?"书法描摹画布":"数字绘画画布")+'"></canvas></div>'+
   '<p class="canvas-caption">'+(calligraphy?"格线仅用于书写参考。鼠标或触屏自由书写，不按字体分数评判。":"可以自由绘画、撤回上一笔、换画笔。画面可下载为 PNG。")+'</p>';
}
function paint(c,s,calli){
 const ctx=c.getContext("2d");if(!ctx)return;
 ctx.fillStyle=calli?"#fffdf5":"#fff";ctx.fillRect(0,0,720,420);
 if(s.guide){ctx.save();ctx.strokeStyle=calli?"#f2dfd5":"#e9e8e3";ctx.lineWidth=1;ctx.setLineDash(calli?[7,6]:[4,7]);
 if(calli){for(let k=0;k<4;k++){const x=13+k*173;ctx.strokeRect(x,35,162,340);ctx.beginPath();ctx.moveTo(x,205);ctx.lineTo(x+162,205);ctx.moveTo(x+81,35);ctx.lineTo(x+81,375);ctx.stroke();}
 ctx.globalAlpha=.09;ctx.fillStyle="#997b6d";ctx.font="140px serif";["远","方","的","灯"].forEach((ch,i)=>ctx.fillText(ch,24+i*173,257));}
 else{ctx.beginPath();ctx.moveTo(360,0);ctx.lineTo(360,420);ctx.moveTo(0,210);ctx.lineTo(720,210);ctx.stroke();}
 ctx.restore();}
 for(const stroke of s.strokes){const pts=stroke.points;if(!pts.length)continue;ctx.strokeStyle=stroke.color;ctx.fillStyle=stroke.color;ctx.lineCap="round";ctx.lineJoin="round";if(pts.length===1){ctx.beginPath();ctx.arc(pts[0].x,pts[0].y,stroke.width/2,0,Math.PI*2);ctx.fill();continue;}
 for(let k=1;k<pts.length;k++){const a=pts[k-1],b=pts[k];ctx.lineWidth=calli?stroke.width*(.4+Math.max(.2,b.pressure)*.8):stroke.width;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
}
function bindInk(s,H,calligraphy){
 const c=H.root.querySelector("canvas.draw");if(!c)return;
 paint(c,s,calligraphy);
 let line=null;
 const pos=ev=>{const b=c.getBoundingClientRect();return {x:H.clamp((ev.clientX-b.left)*720/b.width,0,720),y:H.clamp((ev.clientY-b.top)*420/b.height,0,420),pressure:ev.pressure||.55}};
 c.addEventListener("pointerdown",ev=>{ev.preventDefault();c.setPointerCapture(ev.pointerId);line={color:s.color,width:s.size,points:[pos(ev)]};s.strokes.push(line);paint(c,s,calligraphy);});
 c.addEventListener("pointermove",ev=>{if(!line)return;ev.preventDefault();line.points.push(pos(ev));paint(c,s,calligraphy);});
 const end=()=>{line=null;};c.addEventListener("pointerup",end);c.addEventListener("pointercancel",end);
}
function inkControls(s,H,calli){const colors=calli?["#222222","#6b2d25","#2b4d73","#79553e"]:["#255977","#ed794f","#e9bd39","#4c9c87","#834cc0","#111f31"];
return '<div class="section-label">颜色选择</div><div class="palette">'+colors.map(c=>'<button type="button" class="swatch'+(s.color===c?" active":"")+'" style="background:'+c+'" data-act="color" data-color="'+c+'" aria-label="选择画笔颜色"></button>').join('')+'</div>'+
 H.field("画笔粗细","size",s.size,"range",{min:2,max:calli?32:28,step:1,unit:"像素"})+
 '<div class="control-row">'+H.btn("↶ 撤销上笔","undo")+H.btn("清空画布","clear")+H.btn(s.guide?"隐藏格线":"显示格线","guide")+'</div>'; }
function inkClick(act,d,s,H){if(act==="color")s.color=d.color;if(act==="undo")s.strokes.pop();if(act==="clear")s.strokes=[];if(act==="guide")s.guide=!s.guide;}
M[6]={
 heading:"冷暖色彩 · 自由画板",goal:"画出一幅静物或自由形象，调整色彩和笔触，并保存作品。",
 instruction:"用鼠标/触摸绘制。尝试用同样的构图先画暖色，再画冷色，比较自己的选择。",
 boundary:"网页画笔体验可产生实际作品，但不代表完整素描、色彩或绘画能力测量。",
 hasArt:true,
 init(){return {color:"#255977",size:8,guide:true,strokes:[]};},
 stage(s){return canvasSvg(s,false);},
 controls(s,H){return inkControls(s,H,false);},
 click(act,d,s,H){inkClick(act,d,s,H);},
 afterStage(s,H){bindInk(s,H,false);},
 status:"画笔操作在画布中完成，作品可保存 PNG 与 JSON。"};
M[7]={
 heading:"远方的灯 · 笔触与留白",goal:"在辅助格线上亲自写字，控制笔画粗细、节奏与字形空间。",
 instruction:"按四个格书写“远方的灯”，可以关闭字模，自主设计排列。",
 boundary:"鼠标和触屏与毛笔的摩擦、笔锋差别很大；这不是书法熟练度测验。",
 hasArt:true,
 init(){return {color:"#222222",size:15,guide:true,strokes:[]};},
 stage(s){return canvasSvg(s,true);},
 controls(s,H){return inkControls(s,H,true);},
 click(act,d,s,H){inkClick(act,d,s,H);},
 afterStage(s,H){bindInk(s,H,true);},
 status:"粗细笔触和压力会影响线条；设备笔压支持情况可能不同。"};
function iso(x,y,z,turn){let a=x,b=y;for(let k=0;k<turn;k++){const t=a;a=-b;b=t;}return [280+(a-b)*57,198+(a+b)*30-z*34];}
function blockSvg(s){
 const layers=[];
 for(let k=0;k<9;k++){
   const row=Math.floor(k/3)-1,col=k%3-1,h=s.blocks[k];
   const center=iso(col,row,0,s.view);
   layers.push({k,row,col,h,p:center,depth:center[1]+h*0.5});
 }
 layers.sort((a,b)=>a.p[1]-b.p[1]);
 let art='<svg class="art-export" viewBox="0 0 560 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="可以点击九个基座添加或移除积木">';
 art+='<rect width="560" height="440" fill="#eff8fc"/><path d="M280 265 L510 385 L280 424 L50 385 Z" fill="#cfe8e6" opacity=".65"/>';
 for(const cell of layers){
   const {k,h,col,row}=cell,[x,y]=iso(col,row,0,s.view);
   const g='<path d="M'+x+' '+(y-14)+' l51 27 -51 27 -51 -27 Z" fill="#d8eae7" stroke="#89adad" stroke-width="2"/>'+
    '<text x="'+x+'" y="'+(y+9)+'" text-anchor="middle" fill="#5c8588" font-size="13" font-weight="700">'+(k+1)+'</text>';
   art+='<g data-act="block" data-idx="'+k+'" style="cursor:pointer">'+g;
   for(let j=1;j<=h;j++){
     const [xx,yy]=iso(col,row,j,s.view);const Y=yy+19;
     art+='<path d="M'+xx+' '+(Y-17)+' l51 27 -51 27 -51 -27 Z" fill="'+(["#6bc6bf","#efb76d","#8a9ed5"][k%3])+'" stroke="#426a79" stroke-width="2"/>'+
     '<path d="M'+(xx-51)+' '+(Y+10)+' l51 27 v32 l-51 -27 Z" fill="'+(["#329f9c","#d79348","#687eb9"][k%3])+'" stroke="#426a79" stroke-width="2"/>'+
     '<path d="M'+xx+' '+(Y+37)+' l51 -27 v32 l-51 27 Z" fill="'+(["#4bb5b1","#e2a053","#778dcd"][k%3])+'" stroke="#426a79" stroke-width="2"/>';
   }
   art+='</g>';
 }
 art+='<text x="280" y="427" font-size="12" fill="#557c86" text-anchor="middle">点选方块基座 · 每次增加一层 · 第四次重置</text></svg>';
 return art;
}
M[8]={
 heading:"九宫格 · 立体积木造型台",goal:"点击基座向上堆叠立方体，然后旋转观看方向，观察结构与视觉重心。",
 instruction:"每个基座可以堆叠0到3层。点击方块修改高度，使用旋转按钮切换视角。",
 boundary:"此处是二维画面上的等轴测投影，不是经过力学仿真验证的承重结构。",
 hasArt:true,
 init(){return {blocks:[0,1,0,2,1,0,0,0,0],view:0};},
 stage(s){const total=s.blocks.reduce((a,b)=>a+b,0),height=Math.max(...s.blocks);
 return '<div class="artboard">'+blockSvg(s)+'</div><div class="score"><strong>'+total+'</strong><span class="pill">使用的积木块</span><strong>'+height+'</strong><span class="pill">最高层数</span></div>';},
 controls(s,H){return '<div class="control-row">'+H.btn("↶ 向左旋转","left")+H.btn("向右旋转 ↷","right")+'</div>'+
 '<div class="control-row">'+H.btn("增加中央方块","center")+H.btn("全部清空","clear")+H.btn("恢复示范结构","reset")+'</div><p class="hint">通过不同视角检查遮挡、比例与外形。中心承重和稳定性需实体建模验证。</p>';},
 click(act,d,s){if(act==="block"){let i=Number(d.idx);s.blocks[i]=(s.blocks[i]+1)%4;}
 if(act==="left")s.view=(s.view+3)%4;
 if(act==="right")s.view=(s.view+1)%4;
 if(act==="center")s.blocks[4]=(s.blocks[4]+1)%4;
 if(act==="clear")s.blocks=Array(9).fill(0);
 if(act==="reset"){s.blocks=[0,1,0,2,1,0,0,0,0];s.view=0;}
 },
 status:"单击积木或基座改变高度，可旋转查看作品。"};
})(window.QX_MODULES);