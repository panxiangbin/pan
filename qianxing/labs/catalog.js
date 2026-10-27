"use strict";
(function(){
 const tags={research:"证据与研究",dialogue:"观点与沟通",strategy:"决策与规划",experiment:"观察与验证",offline:"线下实践",create:"创作与表达"};
 const arr=(window.QX_ACTIVITIES||[]).filter(x=>x.id>=28);
 window.QX_LAB_CATALOG=Object.fromEntries(arr.map(x=>[x.id,{name:x.name,desc:x.prompt,tag:tags[x.mode]||"跨领域探索"}]));
})();