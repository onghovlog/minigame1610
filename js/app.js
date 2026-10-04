const API = `${window.location.protocol}//${window.location.hostname || "localhost"}:3000`;

document.getElementById("joinForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  if (!name) return;
  try {
    const r = await fetch(`${API}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, joinedAt: new Date().toISOString() })
    });
    const player = await r.json();
    localStorage.setItem("wmPlayer", JSON.stringify(player));
    location.href = "game.html";
  } catch (err) {
    alert("Không kết nối được dữ liệu. Hãy kiểm tra json-server đang chạy ở cổng 3000.");
  }
});

// QR Share Modal Logic
let shareQr = null;
function openShareQrModal() {
  const modal = document.getElementById("shareQrModal");
  const display = document.getElementById("shareUrlDisplay");
  const container = document.getElementById("shareQrCode");
  const currentUrl = window.location.href.split("#")[0];

  if (display) display.textContent = currentUrl;
  if (container && !shareQr && typeof QRCode !== "undefined") {
    container.innerHTML = "";
    shareQr = new QRCode(container, {
      text: currentUrl,
      width: 220,
      height: 220,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  }
  if (modal) modal.classList.add("active");
}

function closeShareQrModal(e) {
  const modal = document.getElementById("shareQrModal");
  if (modal) modal.classList.remove("active");
}