const data=JSON.parse(localStorage.getItem("wmResult")||"null");
if(!data) location.href="index.html";
const meta={
 growth:{name:"GROWTH",icon:"🌱",desc:"Bạn tò mò về traffic, dữ liệu, nội dung và cách một sản phẩm tăng trưởng."},
 experience:{name:"EXPERIENCE",icon:"🎨",desc:"Bạn quan tâm cách người dùng nhìn, cảm nhận và tương tác với sản phẩm."},
 product:{name:"PRODUCT",icon:"🚀",desc:"Bạn thích nhìn bức tranh tổng thể, giải quyết nhu cầu và kết nối công việc của team."},
 bugHunter:{name:"BUG HUNTER",icon:"🐞",desc:"Bạn có xu hướng quan sát kỹ, đặt câu hỏi và tìm những điều bất thường."},
 aiFuture:{name:"AI FUTURE",icon:"🤖",desc:"Bạn thích khám phá cách AI có thể mở rộng năng lực trong thế giới Web."}
};
const m=meta[data.primaryUniverse];
document.getElementById("icon").textContent=m.icon;
document.getElementById("universe").textContent=m.name;
document.getElementById("description").textContent=m.desc;
const total=Object.values(data.scores).reduce((a,b)=>a+b,0);
const list=document.getElementById("scoreList");
Object.entries(data.scores).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>{
 const pct=Math.round(v/total*100);
 list.insertAdjacentHTML("beforeend",`<div class="score-row"><div class="score-head"><span>${meta[k].icon} ${meta[k].name}</span><b>${pct}%</b></div><div class="mini-bar"><i style="width:${pct}%"></i></div></div>`);
});