function getApiUrl() {
  if (window.location.port === "5000" || window.location.port === "5500") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return window.location.origin;
}

const API = getApiUrl();
const meta = {
  growth: ["🌱", "Growth", "SEO & Marketing"],
  experience: ["🎨", "Experience", "UI/UX & Frontend"],
  product: ["🚀", "Product", "BA & Agile"],
  bugHunter: ["🐞", "Bug Hunter", "QA & Testing"],
  aiFuture: ["🤖", "AI Future", "AI & Workflow"]
};

let previewQr = null;
let modalQr = null;
let currentPlayerUrl = "";

function getPlayerUrl(customHost) {
  if (customHost && customHost.trim()) {
    const host = customHost.trim();
    const port = window.location.port ? `:${window.location.port}` : "";
    return `${window.location.protocol}//${host}${port}/index.html`;
  }
  return `${window.location.origin}/index.html`;
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
      renderQrCodes(getPlayerUrl(e.target.value));
    });
    hostInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        renderQrCodes(getPlayerUrl(e.target.value));
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
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(currentPlayerUrl).then(() => {
      alert("Đã sao chép link người chơi:\n" + currentPlayerUrl);
    }).catch(() => {
      prompt("Sao chép link người chơi:", currentPlayerUrl);
    });
  } else {
    prompt("Sao chép link người chơi:", currentPlayerUrl);
  }
}

function timeAgo(dateString) {
  if (!dateString) return "";
  const sec = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (isNaN(sec) || sec < 5) return "vừa xong";
  if (sec < 60) return `${sec} giây trước`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return new Date(dateString).toLocaleDateString("vi-VN");
}

function updateConnectionStatus(isOnline, serverHost) {
  const dot = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  if (!dot || !text) return;

  if (isOnline) {
    dot.className = "status-dot";
    text.textContent = `Máy chủ: Hoạt động (${serverHost || API})`;
  } else {
    dot.className = "status-dot offline";
    text.textContent = `Máy chủ: Chưa kết nối (${serverHost || API})`;
  }
}

async function loadDashboard() {
  try {
    let results = [];
    let isConnected = false;

    try {
      const res = await fetch(`${API}/results?_sort=createdAt&_order=desc`);
      if (res.ok) {
        results = await res.json();
        isConnected = true;
      } else {
        throw new Error("API /results returned " + res.status);
      }
    } catch (e) {
      // Fallback: Read static db.json
      try {
        const staticRes = await fetch("db.json");
        if (staticRes.ok) {
          const db = await staticRes.json();
          results = db.results || [];
          isConnected = true;
        }
      } catch (err2) {
        isConnected = false;
      }
    }

    updateConnectionStatus(isConnected, API);

    if (!Array.isArray(results)) results = [];

    // Update total count
    document.getElementById("total").textContent = results.length;

    // Calculate universe counts
    const count = Object.fromEntries(Object.keys(meta).map((k) => [k, 0]));
    results.forEach((r) => {
      const u = r.primaryUniverse;
      if (u && count[u] !== undefined) {
        count[u] = (count[u] || 0) + 1;
      }
    });

    // Find leader
    const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
    const leaderKey = sorted[0][0];
    const leaderCount = sorted[0][1];
    
    document.getElementById("leader").textContent = (results.length > 0 && leaderCount > 0)
      ? `${meta[leaderKey][0]} ${meta[leaderKey][1]}`
      : "—";

    // Render bars
    document.getElementById("bars").innerHTML = sorted
      .map(([k, v]) => {
        const pct = results.length ? Math.round((v / results.length) * 100) : 0;
        return `<div class="dash-row">
          <div class="dash-head">
            <span>${meta[k][0]} ${meta[k][1]}</span>
            <b>${v} SV · ${pct}%</b>
          </div>
          <div class="dash-bar"><i style="width:${pct}%"></i></div>
        </div>`;
      })
      .join("");

    // Render recent participant list
    if (results.length === 0) {
      document.getElementById("recent").innerHTML = `
        <div style="text-align:center;padding:30px 10px;color:var(--muted)">
          <div style="font-size:32px;margin-bottom:8px">👥</div>
          <p style="margin:0">Chưa có người tham gia.</p>
          <p style="font-size:12px;margin-top:6px">Hãy quét mã QR hoặc bấm <b>"Thêm dữ liệu mẫu"</b> để trải nghiệm.</p>
        </div>
      `;
    } else {
      document.getElementById("recent").innerHTML = results
        .slice(0, 15)
        .map((r) => {
          const uInfo = meta[r.primaryUniverse] || ["✨", "Khám phá"];
          const time = timeAgo(r.createdAt);
          return `
            <div class="person-row">
              <div class="person-avatar">${uInfo[0]}</div>
              <div class="person-main">
                <span class="person-name">${escapeHtml(r.playerName || "Sinh viên")}</span>
                <span class="person-time">${time}</span>
              </div>
              <div class="person-tag">${uInfo[0]} ${uInfo[1]}</div>
            </div>
          `;
        })
        .join("");
    }
  } catch (e) {
    updateConnectionStatus(false, API);
    document.getElementById("recent").innerHTML = "<p style='color:var(--muted)'>Đang chờ kết nối dữ liệu...</p>";
  }
}

async function seedDemoData() {
  try {
    const res = await fetch(`${API}/seed`, { method: "POST" });
    if (res.ok) {
      await loadDashboard();
      alert("Đã thêm 5 người chơi mẫu thành công!");
    } else {
      throw new Error("Không thể gọi API seed");
    }
  } catch (err) {
    alert("Không thể thêm dữ liệu mẫu qua API. Kiểm tra kết nối máy chủ.");
  }
}

async function resetAllData() {
  if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ kết quả để bắt đầu buổi chơi mới?")) return;
  try {
    const res = await fetch(`${API}/reset`, { method: "POST" });
    if (res.ok) {
      await loadDashboard();
      alert("Đã làm sạch toàn bộ dữ liệu kết quả!");
    } else {
      throw new Error("Không thể gọi API reset");
    }
  } catch (err) {
    alert("Không thể xóa dữ liệu qua API. Kiểm tra kết nối máy chủ.");
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

initQr();
loadDashboard();
setInterval(loadDashboard, 3000);