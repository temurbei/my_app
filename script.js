const API_URL = "http://localhost:3000/api/chat";

let mode = "smart";
let hist = [];

const SYS = {
  smart: "Sen OPENAI NEXUS. O'zbek tilida juda chuqur, analitik, batafsil javob ber.",
  fast: "Sen OPENAI NEXUS. O'zbek tilida qisqa, aniq, tezkor javob ber.",
  creative: "Sen OPENAI NEXUS. O'zbek tilida ijodiy, original, tasviriy javob ber.",
  code: "Sen OPENAI NEXUS. Kod so'ralsa to'liq, izohli, ishlaydigan kod yoz. O'zbek tilida tushuntir."
};

async function callAPI(messages, system) {
  const payloadMessages = [];

  if (system) {
    payloadMessages.push({ role: "system", content: system });
  }

  for (const m of messages) {
    payloadMessages.push({
      role: m.role,
      content: m.content
    });
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: payloadMessages
    })
  });

  const d = await res.json();

  if (!res.ok) {
    throw new Error(d?.error?.message || "Server xatosi");
  }

  return d?.choices?.[0]?.message?.content || "Bo'sh javob.";
}

function go(n, el) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("on"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("on"));
  document.getElementById("p-" + n).classList.add("on");
  el.classList.add("on");
}

function sm(btn, m) {
  document.querySelectorAll(".mb").forEach(b => b.classList.remove("on"));
  btn.classList.add("on");
  mode = m;
}

function qp(t) {
  document.getElementById("inp").value = t;
  send();
}

async function send() {
  const inp = document.getElementById("inp");
  const txt = inp.value.trim();
  if (!txt) return;

  addMsg("u", txt);
  inp.value = "";
  inp.style.height = "auto";

  hist.push({ role: "user", content: txt });
  const tEl = addDots();
  document.getElementById("sb").disabled = true;

  try {
    const reply = await callAPI(hist, SYS[mode]);
    hist.push({ role: "assistant", content: reply });
    tEl.remove();
    addMsg("ai", reply);
  } catch (e) {
    tEl.remove();
    addMsg("ai", e.message);
  }

  document.getElementById("sb").disabled = false;
}

function addMsg(role, text) {
  const box = document.getElementById("msgs");
  const d = document.createElement("div");
  d.className = "msg" + (role === "u" ? " u" : "");

  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>")
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre style="background:#0a0a12;border:1px solid #1e1e30;border-radius:8px;padding:10px;overflow-x:auto;font-family:monospace;font-size:12px;margin:5px 0;white-space:pre-wrap">$1</pre>');

  d.innerHTML = `<div class="av ${role === "ai" ? "ai" : "u"}">${role === "ai" ? "⚡" : "👤"}</div><div class="mb2"><div class="mn">${role === "ai" ? "OPENAI NEXUS" : "SIZ"}</div><div class="mt">${html}</div></div>`;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
  return d;
}

function addDots() {
  const box = document.getElementById("msgs");
  const d = document.createElement("div");
  d.className = "msg";
  d.innerHTML = `<div class="av ai">⚡</div><div class="mb2"><div class="mn">OPENAI NEXUS</div><div class="mt"><div class="think"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div></div>`;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
  return d;
}

async function gp(type) {
  let prompt, bid, oid, tid, lbl;

  if (type === "i") {
    prompt = `Create a professional image generation prompt for ${document.getElementById("ip").value}.
Subject: ${document.getElementById("is").value || "beautiful landscape"}
Style: ${document.getElementById("ist").value}
Mood: ${document.getElementById("im").value}
Make it detailed, add quality tags. English only. Output ONLY the prompt.`;
    bid = "ib"; oid = "io"; tid = "iot"; lbl = "⚡ Prompt Yaratish";
  } else if (type === "v") {
    prompt = `Create a detailed video generation prompt for ${document.getElementById("vp").value}.
Subject: ${document.getElementById("vs").value || "cinematic city"}
Type: ${document.getElementById("vt").value}
Include camera movement, duration, atmosphere. English only. Output ONLY the prompt.`;
    bid = "vb"; oid = "vo"; tid = "vot"; lbl = "⚡ Video Prompt Yaratish";
  } else {
    prompt = `Create a detailed music prompt for ${document.getElementById("ap").value}.
Description: ${document.getElementById("as2").value || "epic music"}
Genre: ${document.getElementById("ag").value}
Include BPM, instruments, mood, structure. English only. Output ONLY the prompt.`;
    bid = "ab"; oid = "ao"; tid = "aot"; lbl = "⚡ Audio Prompt Yaratish";
  }

  const btn = document.getElementById(bid);
  btn.innerHTML = '<span class="sp"></span> Yaratilmoqda...';
  btn.disabled = true;

  try {
    const r = await callAPI([{ role: "user", content: prompt }]);
    document.getElementById(tid).textContent = r;
    document.getElementById(oid).style.display = "block";
  } catch (e) {
    document.getElementById(tid).textContent = e.message;
    document.getElementById(oid).style.display = "block";
  }

  btn.innerHTML = lbl;
  btn.disabled = false;
}

function cp(id) {
  navigator.clipboard.writeText(document.getElementById(id).textContent).then(() => {
    const btn = document.getElementById(id).closest(".ob").querySelector(".cb");
    btn.textContent = "✓ COPIED!";
    setTimeout(() => btn.textContent = "COPY", 2000);
  });
}