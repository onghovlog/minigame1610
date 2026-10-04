const API = `${window.location.protocol}//${window.location.hostname || "localhost"}:3000`;
const meta={growth:["🌱","Growth"],experience:["🎨","Experience"],product:["🚀","Product"],bugHunter:["🐞","Bug Hunter"],aiFuture:["🤖","AI Future"]};

let previewQr = null;
let modalQr = null;
let currentPlayerUrl = "";

function getPlayerUrl(customHost) {
  const host = customHost || window.location.hostname || "localhost";
  const port = window.location.port ? `:${window.location.port}` : "";
  const protocol = window.location.protocol;
  let pathname = window.location.pathname;
  if (pathname.endsWith("admin.html")) {
    pathname = pathname.replace("admin.html", "index.html");
  } else if (!pathname.endsWith("/")) {
    pathname = pathname + "/index.html";
  } else {
    pathname = pathname + "index.html";
  }
  return `${protocol}//${host}${port}${pathname}`;
}

function renderQrCodes(url) {
  currentPlayerUrl = url;
  const urlDisplay = document.getElementById("playerUrlDisplay");
  const modalDisplay = document.getElementById("modalUrlDisplay");
  if (urlDisplay) urlDisplay.textContent = url;
  if (modalDisplay) modalDisplay.textContent = url;

  const previewEl = document.getElementById("qrCodePreview");
  if (previewEl && typeof QRCode !== "undefined") {
    previewEl.innerHTML = "";
    previewQr = new QRCode(previewEl, {
      text: url,
      width: 110,
      height: 110,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  const modalEl = document.getElementById("bigQrCode");
  if (modalEl && typeof QRCode !== "undefined") {
    modalEl.innerHTML = "";
    modalQr = new QRCode(modalEl, {
      text: url,
      width: 240,
      height: 240,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
}

function initQr() {
  const defaultUrl = getPlayerUrl();
  const hostInput = document.getElementById("customHostInput");
  if (hostInput) {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      hostInput.placeholder = "192.168.1.8 (IP WiFi)";
    }
    hostInput.addEventListener("change", (e) => {
      const val = e.target.value.trim();
      renderQrCodes(getPlayerUrl(val));
    });
    hostInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        const val = e.target.value.trim();
        renderQrCodes(getPlayerUrl(val));
      }
    });
  }
  renderQrCodes(defaultUrl);
}

function openQrModal() {
  const modal = document.getElementById("qrModal");
  if (modal) modal.classList.add("active");
}

function closeQrModal(e) {
  const modal = document.getElementById("qrModal");
  if (modal) modal.classList.remove("active");
}

function copyPlayerUrl() {
  if (!currentPlayerUrl) return;
  navigator.clipboard.writeText(currentPlayerUrl).then(() => {
    alert("Đã sao chép link người chơi: " + currentPlayerUrl);
  }).catch(() => {
    prompt("Sao chép link người chơi:", currentPlayerUrl);
  });
}

async function loadDashboard(){
  try{
    const results=await (await fetch(`${API}/results?_sort=createdAt&_order=desc`)).json();
    document.getElementById("total").textContent=results.length;
    const count=Object.fromEntries(Object.keys(meta).map(k=>[k,0]));
    results.forEach(r=>count[r.primaryUniverse]=(count[r.primaryUniverse]||0)+1);
    const leader=Object.entries(count).sort((a,b)=>b[1]-a[1])[0];
    document.getElementById("leader").textContent=results.length?`${meta[leader[0]][0]} ${meta[leader[0]][1]}`:"—";
    document.getElementById("bars").innerHTML=Object.entries(count).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{
      const pct=results.length?Math.round(v/results.length*100):0;
      return `<div class="dash-row"><div class="dash-head"><span>${meta[k][0]} ${meta[k][1]}</span><b>${v} SV · ${pct}%</b></div><div class="dash-bar"><i style="width:${pct}%"></i></div></div>`;
    }).join("");
    document.getElementById("recent").innerHTML=results.slice(0,10).map(r=>`<div class="person"><span>${escapeHtml(r.playerName||"Sinh viên")}</span><small>${meta[r.primaryUniverse]?.[0]||""} ${meta[r.primaryUniverse]?.[1]||""}</small></div>`).join("")||"<p>Chưa có người tham gia.</p>";
  }catch(e){document.getElementById("recent").innerHTML="<p>Không kết nối được json-server.</p>"}
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

initQr();
loadDashboard();
setInterval(loadDashboard,3000);