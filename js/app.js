function getApiUrl() {
  if (window.location.port === "5000" || window.location.port === "5500") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return window.location.origin;
}

const API = getApiUrl();

document.getElementById("joinForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("name");
  const name = nameInput ? nameInput.value.trim() : "";
  if (!name) return;

  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang vào game...";
  }

  let player = {
    id: Date.now(),
    name: name,
    joinedAt: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, joinedAt: player.joinedAt })
    });
    if (res.ok) {
      player = await res.json();
    }
  } catch (err) {
    console.warn("API offline or blocked, using local player session:", err);
  }

  localStorage.setItem("wmPlayer", JSON.stringify(player));
  location.href = "game.html";
});

// QR Share Modal
let shareQr = null;
function openShareQrModal() {
  const modal = document.getElementById("shareQrModal");
  const display = document.getElementById("shareUrlDisplay");
  const container = document.getElementById("shareQrCode");
  
  // Clean URL to index.html
  const currentUrl = `${window.location.origin}/index.html`;

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