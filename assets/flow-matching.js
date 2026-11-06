'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const orange = '#c97d45', blue = '#5288b7', ink = '#24313b';
  const line = (x1,y1,x2,y2,color,width=2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
  const label = (x,y,text,color=ink,anchor='middle') => `<text x="${x}" y="${y}" fill="${color}" font-size="14" text-anchor="${anchor}">${text}</text>`;
  const dot = (x,y,color,r=5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
  const path = (points,color,width=2.5) => `<path d="${points.map((p,i)=>(i?'L':'M')+p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
  const arrow = (x,y,dx,color) => {
    if (Math.abs(dx)<0.1) return dot(x,y,color,4);
    const end=x+dx, d=Math.sign(dx);
    return line(x,y,end,y,color,3)+`<path d="M${end-8*d},${y-5} L${end},${y} L${end-8*d},${y+5}" fill="none" stroke="${color}" stroke-width="2"/>`;
  };
  $('expand-all').addEventListener('click',()=>document.querySelectorAll('details.derivation').forEach(d=>d.open=true));
  $('collapse-all').addEventListener('click',()=>document.querySelectorAll('details.derivation').forEach(d=>d.open=false));
  function renderPath() {
    const t=+$('path-time').value, beta=1-t, scaleX=x=>360+x*60;
    const normal=(x,mu)=>Math.exp(-0.5*((x-mu)/beta)**2)/(Math.sqrt(2*Math.PI)*beta);
    const peak=Math.max(...Array.from({length:601},(_,i)=>{const x=-5+i/60;return .5*(normal(x,-2*t)+normal(x,2*t));}));
    const scaleY=y=>195-y/peak*145;
    const curves=[[],[],[]];
    for(let i=0;i<=600;i++){const x=-5+i/60, a=.5*normal(x,-2*t),b=.5*normal(x,2*t); [a,b,a+b].forEach((v,k)=>curves[k].push([scaleX(x),scaleY(v)]));}
    let svg=label(60,20,'密度（纵轴随峰值缩放）',ink,'start')+line(60,195,660,195,'#cbd4cf',1);
    for(let x=-4;x<=4;x+=2)svg+=label(scaleX(x),218,String(x));
    svg+=path(curves[0],orange)+path(curves[1],blue)+path(curves[2],ink,3)+dot(scaleX(-2),195,orange,4)+dot(scaleX(2),195,blue,4);
    svg+=label(410,20,'左条件 × ½',orange)+label(520,20,'右条件 × ½',blue)+label(630,20,'边缘密度',ink);
    $('path-plot').innerHTML=svg;$('path-time-value').value=t.toFixed(2);
    $('path-reading').textContent=`条件均值：${(-2*t).toFixed(2)}、${(2*t).toFixed(2)}；标准差：${beta.toFixed(2)}。${t===0?'此时两条条件路径完全重合，混合后仍是标准高斯。':'时间增大时，均值走向各自终点，标准差逐渐缩小。'}`;
  }
  function renderPosterior(){
    const x=+$('posterior-x').value, right=1/(1+Math.exp(-8*x)),left=1-right;
    const ul=2*(-2-x),ur=2*(2-x),u=left*ul+right*ur;
    const sx=v=>360+v*70, start=sx(x);
    let svg=line(80,35,640,35,'#cbd4cf',1)+dot(sx(-2),35,orange)+dot(sx(2),35,blue)+dot(start,35,ink);
    svg+=label(sx(-2),20,'终点 −2',orange)+label(sx(2),20,'终点 +2',blue)+label(start,58,'当前 x');
    [[85,ul,orange,'左条件速度'],[130,ur,blue,'右条件速度'],[175,u,ink,'后验平均速度']].forEach(([y,v,c,text])=>{svg+=label(14,y-10,text,c,'start')+arrow(start,y,v*14,c)+label(690,y+5,v.toFixed(2),c,'end');});
    $('posterior-plot').innerHTML=svg;$('posterior-x-value').value=x.toFixed(2);
    $('weight-left').value=left;$('weight-right').value=right;
    $('weight-left-value').value=(left*100).toFixed(1)+'%';$('weight-right-value').value=(right*100).toFixed(1)+'%';
    $('posterior-reading').textContent=`边缘速度 = ${left.toFixed(3)} × (${ul.toFixed(2)}) + ${right.toFixed(3)} × (${ur.toFixed(2)}) = ${u.toFixed(2)}。先验始终各 50%，后验随观察位置变化。`;
  }
  function renderLoss(){
    const a=+$('loss-a').value,sx=x=>70+(x+3)/7*580,sy=y=>215-y*7.5;
    let svg=line(70,215,650,215,'#cbd4cf',1)+line(70,20,70,215,'#cbd4cf',1);
    for(let x=-3;x<=4;x++)svg+=label(sx(x),236,String(x));
    for(let y=0;y<=24;y+=6)svg+=label(52,sy(y)+5,String(y));
    const fm=[],cfm=[];for(let i=0;i<=140;i++){let x=-3+i*.05;fm.push([sx(x),sy((x-1)**2)]);cfm.push([sx(x),sy((x-1)**2+3)]);}
    svg+=path(fm,blue)+path(cfm,orange)+label(520,25,'FM',blue)+label(610,25,'CFM',orange)+label(660,254,'预测 a');
    const loss=(a-1)**2;svg+=line(sx(a),sy(loss),sx(a),sy(loss+3),ink,2)+dot(sx(a),sy(loss),blue)+dot(sx(a),sy(loss+3),orange)+label(sx(1),sy(0)-12,'共同最小点 a = 1');
    $('loss-plot').innerHTML=svg;$('loss-a-value').value=a.toFixed(2);
    $('loss-reading').textContent=`FM = ${loss.toFixed(2)}；CFM = ${(loss+3).toFixed(2)}；差值恒为 3；两者对预测的导数均为 2(a − 1) = ${(2*(a-1)).toFixed(2)}。`;
  }
  [['path-time',renderPath],['posterior-x',renderPosterior],['loss-a',renderLoss]].forEach(([id,render])=>{$(id).addEventListener('input',render);render();});
})();
