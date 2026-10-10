/* 移动端二元精馏 x-y 图 + 模块交互辅助。静态SVG，无过程动画。 */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
export function drawMcCabeXY(v,r){
 if(r?.state!=='ready'||!Array.isArray(r.steps)||v.task!=='mccabe')return '';
 const alpha=Number(v.alpha),xD=Number(v.xD),xB=Number(v.xB),zf=Number(v.zF),q=Number(v.q),R=Number(v.R);
 if(![alpha,xD,xB,zf,q,R].every(Number.isFinite))return '';
 const left=48,top=25,w=430,h=360;
 const X=x=>left+Math.max(0,Math.min(1,x))*w;
 const Y=y=>top+(1-Math.max(0,Math.min(1,y)))*h;
 const eq=x=>alpha*x/(1+(alpha-1)*x);
 const mr=R/(R+1),br=xD/(R+1);
 const qline=x=>q===1?NaN:(q*x-zf)/(q-1);
 let xs,ys;
 if(q===1){xs=zf;ys=mr*xs+br;}
 else {const qm=q/(q-1),qb=-zf/(q-1);xs=(qb-br)/(mr-qm);ys=mr*xs+br;}
 if(![xs,ys].every(Number.isFinite)||!(xs>xB&&xs<xD))return '';
 const ms=(ys-xB)/(xs-xB),bs=xB*(1-ms);
 const polyline=fn=>Array.from({length:121},(_,i)=>{const x=i/120;return (i?'L':'M')+X(x).toFixed(2)+','+Y(fn(x)).toFixed(2);}).join(' ');
 const lines=[];
 let previousX=xD;
 for(let i=0;i<r.steps.length;i++){
  const s=r.steps[i];
  const px=X(previousX),currX=X(s.x),yy=Y(s.y);
  lines.push('M'+px.toFixed(2)+','+yy.toFixed(2)+'L'+currX.toFixed(2)+','+yy.toFixed(2));
  const next=r.steps[i+1];
  if(next)lines.push('M'+currX.toFixed(2)+','+yy.toFixed(2)+'L'+currX.toFixed(2)+','+Y(next.y).toFixed(2));
  previousX=s.x;
 }
 const rec='M'+X(xs)+','+Y(ys)+'L'+X(xD)+','+Y(xD);
 const strip='M'+X(xB)+','+Y(xB)+'L'+X(xs)+','+Y(ys);
 const axes=[];
 for(let i=0;i<=5;i++){const x=i/5,xx=X(x),yy=Y(x);
  axes.push('<path d="M'+xx+' '+top+'V'+(top+h)+'" stroke="#e9f0f4" stroke-width=".9"/>');
  axes.push('<path d="M'+left+' '+yy+'H'+(left+w)+'" stroke="#e9f0f4" stroke-width=".9"/>');
  axes.push('<text x="'+xx+'" y="'+(top+h+19)+'" text-anchor="middle" fill="#708799" font-size="11">'+x.toFixed(1)+'</text>');
  axes.push('<text x="'+(left-9)+'" y="'+(yy+4)+'" text-anchor="end" fill="#708799" font-size="11">'+x.toFixed(1)+'</text>');
 }
 const qpath=Math.abs(q-1)<1e-8?'M'+X(zf)+','+Y(0)+'L'+X(zf)+','+Y(1):
   'M'+X(0)+','+Y(qline(0))+'L'+X(1)+','+Y(qline(1));
 const id='clipMcCabe';
 return '<figure class="mccabe-figure"><div class="mccabe-topline"><strong>McCabe–Thiele 平衡图解</strong><small>静态 x-y 图 · 恒定α假设</small></div>'+
 '<svg viewBox="0 0 520 435" role="img" aria-label="二元精馏平衡曲线和逐级阶梯示意">'+
 '<defs><clipPath id="'+id+'"><rect x="'+left+'" y="'+top+'" width="'+w+'" height="'+h+'"/></clipPath></defs>'+
 axes.join('')+
 '<path d="M'+X(0)+','+Y(0)+'L'+X(1)+','+Y(1)+'" stroke="#9fb5c1" stroke-width="1.4" stroke-dasharray="5 5"/>'+
 '<g clip-path="url(#'+id+')"><path d="'+polyline(eq)+'" stroke="#11a59a" stroke-width="3.2" fill="none"/>'+
 '<path d="'+rec+'" stroke="#2d73c6" stroke-width="2.5" fill="none"/>'+
 '<path d="'+strip+'" stroke="#aa72c5" stroke-width="2.5" fill="none"/>'+
 '<path d="'+qpath+'" stroke="#e5ab39" stroke-width="1.7" stroke-dasharray="4 4" fill="none"/>'+
 '<path d="'+lines.join('')+'" stroke="#e37354" stroke-width="1.9" fill="none"/>'+
 '</g><text x="'+(left+w/2)+'" y="431" text-anchor="middle" font-size="12" fill="#5c7486">液相轻组分摩尔分数 x</text>'+
 '<text transform="translate(13,'+(top+h/2)+') rotate(-90)" text-anchor="middle" font-size="12" fill="#5c7486">气相轻组分摩尔分数 y</text></svg>'+
 '<div class="mccabe-legend"><span class="c-eq">平衡线</span><span class="c-rec">精馏段操作线</span><span class="c-strip">提馏段操作线</span><span class="c-steps">理论级阶梯</span></div>'+
 '<figcaption>该图只说明当前算法的计算过程，不是带实测VLE、塔板效率或塔水力学校核的工程设计图。</figcaption></figure>';
}