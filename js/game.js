const API = `${window.location.protocol}//${window.location.hostname || "localhost"}:3000`;
const player=JSON.parse(localStorage.getItem("wmPlayer")||"null");
if(!player) location.href="index.html";
let questions=[],current=0;
const scores={growth:0,experience:0,product:0,bugHunter:0,aiFuture:0};

async function init(){
 try{questions=await (await fetch(`${API}/questions`)).json();render();}
 catch(e){document.getElementById("question").textContent="Không tải được câu hỏi. Kiểm tra json-server."}
}
function render(){
 const q=questions[current];
 document.getElementById("counter").textContent=`${current+1}/${questions.length}`;
 document.getElementById("bar").style.width=`${((current+1)/questions.length)*100}%`;
 document.getElementById("question").textContent=q.text;
 const box=document.getElementById("answers"); box.innerHTML="";
 q.answers.forEach(a=>{
   const b=document.createElement("button"); b.className="answer"; b.textContent=a.text;
   b.onclick=()=>choose(a.universe); box.appendChild(b);
 });
}
async function choose(u){
 scores[u]++;
 current++;
 if(current<questions.length){render();return;}
 const primary=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
 const result={playerId:player.id,playerName:player.name,scores,primaryUniverse:primary,createdAt:new Date().toISOString()};
 const saved=await (await fetch(`${API}/results`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(result)})).json();
 localStorage.setItem("wmResult",JSON.stringify(saved)); location.href="result.html";
}
init();