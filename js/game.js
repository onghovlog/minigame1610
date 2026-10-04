function getApiUrl() {
  if (window.location.port === "5000" || window.location.port === "5500") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return window.location.origin;
}

const API = getApiUrl();
const player = JSON.parse(localStorage.getItem("wmPlayer") || "null");
if (!player) location.href = "index.html";

let questions = [], current = 0;
const scores = { growth: 0, experience: 0, product: 0, bugHunter: 0, aiFuture: 0 };

async function init() {
  try {
    const r = await fetch(`${API}/questions`);
    if (r.ok) {
      questions = await r.json();
    } else {
      throw new Error("Cannot fetch /questions");
    }
  } catch (e) {
    try {
      // Fallback to static db.json (useful for static cloud hosting like Render/GitHub Pages)
      const staticRes = await fetch("db.json");
      if (staticRes.ok) {
        const db = await staticRes.json();
        questions = db.questions || [];
      }
    } catch (err2) {
      console.error("Failed to load questions:", err2);
      document.getElementById("question").textContent = "Không tải được câu hỏi. Vui lòng tải lại trang.";
      return;
    }
  }

  if (questions && questions.length > 0) {
    render();
  } else {
    document.getElementById("question").textContent = "Chưa có câu hỏi nào.";
  }
}

function render() {
  const q = questions[current];
  if (!q) return;
  document.getElementById("counter").textContent = `${current + 1}/${questions.length}`;
  document.getElementById("bar").style.width = `${((current + 1) / questions.length) * 100}%`;
  document.getElementById("question").textContent = q.text;
  const box = document.getElementById("answers");
  box.innerHTML = "";
  q.answers.forEach((a) => {
    const b = document.createElement("button");
    b.className = "answer";
    b.textContent = a.text;
    b.onclick = () => choose(a.universe);
    box.appendChild(b);
  });
}

async function choose(u) {
  if (scores[u] !== undefined) {
    scores[u]++;
  }
  current++;
  if (current < questions.length) {
    render();
    return;
  }

  const primary = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  let result = {
    id: Date.now(),
    playerId: player ? player.id : Date.now(),
    playerName: player ? player.name : "Người chơi",
    scores,
    primaryUniverse: primary,
    createdAt: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result)
    });
    if (res.ok) {
      result = await res.json();
    }
  } catch (err) {
    console.warn("API POST /results offline, saved locally:", err);
  }

  localStorage.setItem("wmResult", JSON.stringify(result));
  location.href = "result.html";
}

init();