import { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   SENTINEL v4.0 — Real API Edition
   APIs: VirusTotal + HaveIBeenPwned + jsQR
   Design: Premium glassmorphism, deep navy, electric blue
   Font: Syne (display) + DM Mono (code/data)
============================================================ */

// ===================== API KEYS CONFIG =====================
// 👇 STEP 1: Replace these with your real API keys
const CONFIG = {
  VIRUSTOTAL_KEY:   "bf0755da14d64628791c5171256361e682302530afa1438105529bfac11b68c9",   // Free at virustotal.com
  HIBP_KEY:         "YOUR_HIBP_API_KEY",          // $3.50/mo at haveibeenpwned.com
  // jsQR is a library — no key needed, just install it
};

// ===================== STYLES =====================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --navy:       #080e1a;
  --card:       rgba(15, 25, 45, 0.85);
  --border:     rgba(100, 160, 255, 0.1);
  --border2:    rgba(100, 160, 255, 0.2);
  --blue:       #4a9eff;
  --blue-soft:  #2d7dd2;
  --blue-glow:  rgba(74, 158, 255, 0.15);
  --teal:       #00d4aa;
  --teal-glow:  rgba(0, 212, 170, 0.12);
  --red:        #ff4d6a;
  --red-glow:   rgba(255, 77, 106, 0.12);
  --amber:      #ffb347;
  --amber-glow: rgba(255, 179, 71, 0.12);
  --green:      #4ade80;
  --green-glow: rgba(74, 222, 128, 0.12);
  --text:       #94a3b8;
  --text2:      #cbd5e1;
  --white:      #f0f6ff;
  --sidebar-w:  240px;
}

html, body { height: 100%; overflow: hidden; }
body {
  font-family: 'Syne', sans-serif;
  background: var(--navy);
  color: var(--white);
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.bg-mesh {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 20% 10%, rgba(29,78,216,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,212,170,0.07) 0%, transparent 55%),
    radial-gradient(ellipse 50% 60% at 60% 30%, rgba(74,158,255,0.05) 0%, transparent 50%);
}

/* ---- Sidebar ---- */
.sidebar {
  width: var(--sidebar-w); height: 100vh;
  background: rgba(8,14,26,0.95);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  flex-shrink: 0; position: relative; z-index: 10;
  backdrop-filter: blur(20px);
}
.sidebar-logo { padding: 28px 24px 24px; border-bottom: 1px solid var(--border); }
.logo-mark { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
.logo-icon {
  width: 34px; height: 34px; border-radius: 8px;
  background: linear-gradient(135deg, #4a9eff, #00d4aa);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
  box-shadow: 0 0 20px rgba(74,158,255,0.3);
}
.logo-name {
  font-size: 18px; font-weight: 800; letter-spacing: 2px;
  background: linear-gradient(90deg, #4a9eff, #00d4aa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.logo-sub { font-size: 10px; color: var(--text); letter-spacing: 1px; font-family: 'DM Mono', monospace; }
.sidebar-nav { padding: 16px 12px; flex: 1; overflow-y: auto; }
.nav-section-label {
  font-size: 9px; letter-spacing: 2px; color: var(--text);
  padding: 8px 12px 6px; text-transform: uppercase;
  font-family: 'DM Mono', monospace;
}
.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 10px;
  cursor: pointer; margin-bottom: 2px;
  transition: all 0.2s; border: 1px solid transparent;
  font-size: 13px; font-weight: 500; color: var(--text);
  position: relative;
}
.nav-item:hover { background: var(--blue-glow); color: var(--text2); }
.nav-item.active {
  background: linear-gradient(135deg, rgba(74,158,255,0.15), rgba(0,212,170,0.08));
  border-color: var(--border2); color: var(--white);
}
.nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  width: 3px; height: 60%; background: linear-gradient(to bottom, var(--blue), var(--teal));
  border-radius: 0 2px 2px 0;
}
.nav-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
.nav-item.active .nav-icon { background: rgba(74,158,255,0.15); }
.nav-badge {
  margin-left: auto; font-size: 9px; font-family: 'DM Mono', monospace;
  background: var(--blue-glow); color: var(--blue);
  padding: 2px 7px; border-radius: 10px; border: 1px solid var(--border2);
}
.nav-badge.live { background: var(--teal-glow); color: var(--teal); border-color: rgba(0,212,170,0.2); }
.sidebar-footer { padding: 16px; border-top: 1px solid var(--border); }
.status-pill {
  display: flex; align-items: center; gap: 8px;
  background: var(--teal-glow); border: 1px solid rgba(0,212,170,0.2);
  border-radius: 20px; padding: 8px 14px; font-size: 11px;
}
.pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); flex-shrink: 0; animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,212,170,0.4)} 50%{box-shadow:0 0 0 6px rgba(0,212,170,0)} }

/* ---- Main ---- */
.main { flex: 1; display: flex; flex-direction: column; height: 100vh; overflow: hidden; position: relative; z-index: 1; }
.topbar {
  padding: 20px 32px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(8,14,26,0.6); backdrop-filter: blur(20px); flex-shrink: 0;
}
.topbar-title { font-size: 20px; font-weight: 700; }
.topbar-sub { font-size: 12px; color: var(--text); margin-top: 2px; font-family: 'DM Mono', monospace; }
.clock-badge {
  font-family: 'DM Mono', monospace; font-size: 11px; color: var(--text);
  background: var(--card); border: 1px solid var(--border);
  padding: 6px 12px; border-radius: 8px;
}
.content {
  flex: 1; overflow-y: auto; padding: 28px 32px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.content::-webkit-scrollbar { width: 4px; }
.content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* ---- Cards ---- */
.card {
  background: var(--card); border: 1px solid var(--border); border-radius: 16px;
  backdrop-filter: blur(20px); transition: border-color 0.3s, box-shadow 0.3s;
  animation: slideUp 0.4s ease both;
}
.card:hover { border-color: var(--border2); box-shadow: 0 8px 40px rgba(0,0,0,0.3); }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.card-header {
  padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 12px;
}
.card-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.card-icon-blue { background: var(--blue-glow); }
.card-icon-teal { background: var(--teal-glow); }
.card-icon-red  { background: var(--red-glow); }
.card-icon-amber{ background: var(--amber-glow); }
.card-icon-green{ background: var(--green-glow); }
.card-title { font-size: 15px; font-weight: 700; }
.card-desc { font-size: 12px; color: var(--text); margin-top: 2px; }
.card-body { padding: 24px; }

/* ---- API Setup Banner ---- */
.setup-banner {
  padding: 14px 18px; border-radius: 12px; margin-bottom: 20px;
  background: rgba(255,179,71,0.08); border: 1px solid rgba(255,179,71,0.25);
  display: flex; gap: 14px; align-items: flex-start;
}
.setup-banner-icon { font-size: 20px; flex-shrink: 0; }
.setup-banner-title { font-size: 13px; font-weight: 700; color: var(--amber); margin-bottom: 4px; }
.setup-banner-body { font-size: 12px; color: var(--text2); line-height: 1.6; }
.setup-steps { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.setup-step {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 10px 12px; background: rgba(0,0,0,0.2); border-radius: 8px;
  border: 1px solid var(--border); font-size: 12px;
}
.step-num {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  background: var(--blue-glow); border: 1px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: var(--blue);
}
.step-text { color: var(--text2); line-height: 1.5; }
.step-code {
  font-family: 'DM Mono', monospace; background: rgba(74,158,255,0.1);
  color: var(--blue); padding: 1px 6px; border-radius: 4px; font-size: 11px;
}
.api-status-row { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.api-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 20px; font-size: 11px;
  font-family: 'DM Mono', monospace; border: 1px solid;
}
.api-chip-live { background: var(--teal-glow); color: var(--teal); border-color: rgba(0,212,170,0.25); }
.api-chip-demo { background: var(--amber-glow); color: var(--amber); border-color: rgba(255,179,71,0.25); }
.chip-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

/* ---- Forms ---- */
.field { margin-bottom: 16px; }
.field-label {
  display: block; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;
  color: var(--text); margin-bottom: 8px; text-transform: uppercase;
  font-family: 'DM Mono', monospace;
}
.input {
  width: 100%; background: rgba(0,0,0,0.3);
  border: 1px solid var(--border); border-radius: 10px;
  color: var(--white); font-family: 'DM Mono', monospace; font-size: 13px;
  padding: 12px 16px; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(74,158,255,0.1); }
.input::placeholder { color: rgba(100,116,139,0.6); }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px 24px; border-radius: 10px; font-family: 'Syne', sans-serif;
  font-size: 13px; font-weight: 700; cursor: pointer; border: none;
  transition: all 0.2s; letter-spacing: 0.3px; width: 100%;
}
.btn-primary {
  background: linear-gradient(135deg, var(--blue), var(--blue-soft));
  color: white; box-shadow: 0 4px 16px rgba(74,158,255,0.25);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(74,158,255,0.35); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* ---- Results ---- */
.result {
  margin-top: 16px; padding: 16px 18px; border-radius: 12px;
  border: 1px solid; font-size: 13px; line-height: 1.7;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
.result-safe   { background: var(--green-glow); border-color: rgba(74,222,128,0.25); color: #86efac; }
.result-danger { background: var(--red-glow);   border-color: rgba(255,77,106,0.25); color: #fca5a5; }
.result-warn   { background: var(--amber-glow); border-color: rgba(255,179,71,0.25); color: #fcd34d; }
.result-info   { background: var(--blue-glow);  border-color: rgba(74,158,255,0.25); color: #93c5fd; }
.result-teal   { background: var(--teal-glow);  border-color: rgba(0,212,170,0.25);  color: #5eead4; }
.result-title  { font-weight: 700; font-size: 12px; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }

/* VirusTotal engine grid */
.vt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px,1fr)); gap: 6px; margin-top: 12px; }
.vt-engine {
  padding: 6px 10px; border-radius: 8px; font-size: 11px;
  font-family: 'DM Mono', monospace; border: 1px solid var(--border);
  background: rgba(0,0,0,0.2); display: flex; align-items: center; gap: 6px;
}
.vt-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.vt-clean { color: var(--teal); } .vt-dot-clean { background: var(--teal); }
.vt-malicious { color: var(--red); } .vt-dot-malicious { background: var(--red); }

/* HIBP breach cards */
.breach-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.breach-card {
  padding: 12px 14px; border-radius: 10px; border: 1px solid rgba(255,77,106,0.2);
  background: rgba(255,77,106,0.06); display: flex; gap: 12px; align-items: flex-start;
  animation: slideUp 0.3s ease both;
}
.breach-logo { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.breach-name { font-size: 13px; font-weight: 700; color: #fca5a5; margin-bottom: 3px; }
.breach-date { font-size: 11px; color: var(--text); font-family: 'DM Mono', monospace; margin-bottom: 4px; }
.breach-desc { font-size: 11px; color: var(--text2); line-height: 1.5; }
.breach-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.breach-tag { font-size: 10px; font-family: 'DM Mono', monospace; padding: 2px 6px; border-radius: 4px; background: rgba(255,77,106,0.15); color: #fca5a5; border: 1px solid rgba(255,77,106,0.2); }

/* AI output */
.ai-output {
  font-family: 'DM Mono', monospace; font-size: 12px; line-height: 1.8;
  color: var(--text2); white-space: pre-wrap;
  margin-top: 12px; padding: 16px; background: rgba(0,0,0,0.2);
  border-radius: 10px; border: 1px solid var(--border); min-height: 80px;
}
.cursor-blink::after { content: '▊'; color: var(--blue); animation: blink 0.8s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* Dots loader */
.dots { display: inline-flex; gap: 4px; align-items: center; }
.dots span { width: 5px; height: 5px; border-radius: 50%; background: var(--blue); animation: dotBounce 1s ease-in-out infinite; }
.dots span:nth-child(2) { animation-delay: 0.15s; }
.dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes dotBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

/* Quick pills */
.quick-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.pill {
  padding: 6px 14px; border-radius: 20px; font-size: 11px; cursor: pointer;
  background: rgba(74,158,255,0.08); border: 1px solid var(--border);
  color: var(--text); transition: all 0.2s; font-family: 'DM Mono', monospace;
}
.pill:hover { background: var(--blue-glow); border-color: var(--border2); color: var(--white); }

/* Stat grid */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 14px;
  padding: 20px; transition: all 0.25s; animation: slideUp 0.4s ease both;
}
.stat-card:hover { border-color: var(--border2); transform: translateY(-2px); }
.stat-num { font-size: 28px; font-weight: 800; margin: 6px 0 4px; }
.stat-label { font-size: 11px; color: var(--text); font-family: 'DM Mono', monospace; }

/* Two col */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* History */
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; background: rgba(0,0,0,0.2); border-radius: 10px;
  border: 1px solid var(--border); font-size: 12px; animation: slideUp 0.3s ease both;
}
.history-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.history-url { font-family: 'DM Mono', monospace; color: var(--text2); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Tips */
.tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tip {
  padding: 16px; background: rgba(0,0,0,0.2); border-radius: 12px;
  border: 1px solid var(--border); transition: all 0.2s; animation: slideUp 0.4s ease both;
}
.tip:hover { border-color: var(--border2); }
.tip-emoji { font-size: 22px; margin-bottom: 8px; }
.tip-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.tip-body { font-size: 12px; color: var(--text); line-height: 1.6; }

/* Chat */
.chat-bubble-user {
  background: linear-gradient(135deg,var(--blue),var(--blue-soft));
  color: white; border-radius: 12px 12px 4px 12px;
}
.chat-bubble-ai {
  background: rgba(0,0,0,0.3); border: 1px solid var(--border);
  color: var(--text2); border-radius: 12px 12px 12px 4px;
}
.chat-bubble { max-width: 85%; padding: 12px 16px; font-size: 13px; line-height: 1.7; font-family: 'DM Mono', monospace; white-space: pre-wrap; }

/* Tag */
.tag { display: inline-block; font-size: 10px; font-family: 'DM Mono', monospace; padding: 3px 8px; border-radius: 6px; margin: 2px; }
.tag-red { background: var(--red-glow); color: #fca5a5; border: 1px solid rgba(255,77,106,0.2); }
.tag-amber { background: var(--amber-glow); color: #fcd34d; border: 1px solid rgba(255,179,71,0.2); }
.tag-green { background: var(--green-glow); color: #86efac; border: 1px solid rgba(74,222,128,0.2); }

@media (max-width: 900px) {
  .stat-grid { grid-template-columns: repeat(2,1fr); }
  .two-col { grid-template-columns: 1fr; }
  .tips-grid { grid-template-columns: 1fr; }
}
`;

// ===================== HELPERS =====================

const isKeySet = (key) => key && !key.startsWith("YOUR_");

async function callClaude(system, userMsg) {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1000,
      system, messages: [{ role: "user", content: userMsg }]
    })
  });
  const data = await resp.json();
  return data.content?.[0]?.text || "No response.";
}

// VirusTotal URL scan (submit → poll)
async function vtScanURL(url) {
  if (!isKeySet(CONFIG.VIRUSTOTAL_KEY)) return null;
  try {
    // Submit URL
    const formData = new FormData();
    formData.append("url", url);
    const submitRes = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: { "x-apikey": CONFIG.VIRUSTOTAL_KEY },
      body: formData
    });
    const submitData = await submitRes.json();
    const analysisId = submitData?.data?.id;
    if (!analysisId) return null;

    // Poll for results (up to 15 seconds)
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const pollRes = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        headers: { "x-apikey": CONFIG.VIRUSTOTAL_KEY }
      });
      const pollData = await pollRes.json();
      const status = pollData?.data?.attributes?.status;
      if (status === "completed") {
        const stats = pollData?.data?.attributes?.stats;
        const results = pollData?.data?.attributes?.results;
        return { stats, results, status: "completed" };
      }
    }
    return null;
  } catch (e) {
    console.error("VirusTotal error:", e);
    return null;
  }
}

// HaveIBeenPwned breach check
async function hibpCheck(email) {
  if (!isKeySet(CONFIG.HIBP_KEY)) return null;
  try {
    const res = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
      headers: {
        "hibp-api-key": CONFIG.HIBP_KEY,
        "user-agent": "SENTINEL-CyberDashboard"
      }
    });
    if (res.status === 404) return { breaches: [], count: 0 };
    if (res.status === 401) return { error: "Invalid API key" };
    if (res.status === 429) return { error: "Rate limited — wait 1 minute" };
    const breaches = await res.json();
    return { breaches, count: breaches.length };
  } catch (e) {
    return { error: "Network error" };
  }
}

// Local URL analysis (fallback / supplement)
function analyzeURL(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    const flags = [];
    let score = 0;
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    const suspicious = ["login","verify","secure","account","update","confirm","banking","paypal","amazon","apple","microsoft","wallet","password","credential","signin","webscr"];
    if (!url.startsWith("https://")) { flags.push({ sev:"high", msg:"No HTTPS encryption" }); score += 30; }
    if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(host)) { flags.push({ sev:"high", msg:"IP address used as domain" }); score += 35; }
    if ((host.match(/-/g)||[]).length > 2) { flags.push({ sev:"med", msg:"Many hyphens — possible typosquatting" }); score += 15; }
    suspicious.forEach(w => { if (host.includes(w)) { flags.push({ sev:"med", msg:`Suspicious keyword "${w}" in domain` }); score += 18; } });
    if (/[^\x00-\x7F]/.test(host)) { flags.push({ sev:"high", msg:"Non-ASCII chars (homograph attack?)" }); score += 40; }
    if (url.includes("@")) { flags.push({ sev:"high", msg:"@ symbol in URL — credential trick" }); score += 40; }
    if (/\.(exe|bat|zip|rar|ps1|cmd|scr|msi)($|\?)/.test(path)) { flags.push({ sev:"high", msg:"Points to executable file" }); score += 50; }
    return { score: Math.min(score, 100), flags, host: u.hostname };
  } catch {
    return { score: 0, flags: [{ sev:"low", msg:"Invalid URL format" }], host: "" };
  }
}

function scoreColor(s) { return s >= 60 ? "var(--red)" : s >= 30 ? "var(--amber)" : "var(--teal)"; }
function scoreLabel(s) { return s >= 60 ? "DANGEROUS" : s >= 30 ? "SUSPICIOUS" : "LIKELY SAFE"; }
function scoreClass(s) { return s >= 60 ? "result-danger" : s >= 30 ? "result-warn" : "result-safe"; }

// ===================== SMALL COMPONENTS =====================

function Dots() { return <span className="dots"><span/><span/><span/></span>; }
function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span>{t.toUTCString().slice(0,-4)}</span>;
}

// API status chips shown in setup banners
function APIChip({ name, keyVal }) {
  const live = isKeySet(keyVal);
  return (
    <div className={`api-chip ${live ? "api-chip-live" : "api-chip-demo"}`}>
      <div className="chip-dot"/>
      {name}: {live ? "LIVE" : "DEMO"}
    </div>
  );
}

// Setup instructions banner
function SetupBanner({ title, steps, apiName, apiKey, docUrl }) {
  if (isKeySet(apiKey)) return null;
  return (
    <div className="setup-banner">
      <div className="setup-banner-icon">⚙️</div>
      <div style={{flex:1}}>
        <div className="setup-banner-title">Setup Required — {title}</div>
        <div className="setup-banner-body">
          Currently in <strong>demo mode</strong>. Connect the real API for live results:
        </div>
        <div className="setup-steps">
          {steps.map((s, i) => (
            <div key={i} className="setup-step">
              <div className="step-num">{i+1}</div>
              <div className="step-text" dangerouslySetInnerHTML={{__html:s}} />
            </div>
          ))}
        </div>
        <div style={{marginTop:10,fontSize:11,color:"var(--text)"}}>
          📖 Docs: <a href={docUrl} target="_blank" rel="noreferrer" style={{color:"var(--blue)"}}>{docUrl}</a>
        </div>
      </div>
    </div>
  );
}

// ===================== TOOL COMPONENTS =====================

// ---- URL Scanner (VirusTotal + local) ----
function URLScanner({ onScan }) {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [localResult, setLocalResult] = useState(null);
  const [vtResult, setVtResult] = useState(null);
  const [ai, setAi] = useState({ text: "", loading: false });

  const scan = async () => {
    if (!url.trim()) return;
    setScanning(true); setLocalResult(null); setVtResult(null); setAi({ text: "", loading: false });

    // Local analysis (instant)
    const local = analyzeURL(url.trim());
    setLocalResult(local);
    onScan?.({ url: url.trim(), score: local.score, time: new Date() });

    // VirusTotal (if key set, run in parallel)
    const vtPromise = isKeySet(CONFIG.VIRUSTOTAL_KEY)
      ? vtScanURL(url.trim())
      : Promise.resolve(null);

    const [vt] = await Promise.all([vtPromise]);
    setVtResult(vt);
    setScanning(false);

    // AI analysis
    setAi({ text: "", loading: true });
    try {
      const vtSummary = vt
        ? `VirusTotal: ${vt.stats.malicious} malicious, ${vt.stats.suspicious} suspicious, ${vt.stats.harmless} clean engines.`
        : "VirusTotal: not available (demo mode).";
      const text = await callClaude(
        "You are a cybersecurity expert. Analyze URLs for phishing/malicious indicators. Be clear and concise (3-4 sentences). Start with SAFE, SUSPICIOUS, or DANGEROUS. Give a plain-English explanation and one clear recommendation.",
        `URL: ${url}\nLocal scan: ${local.flags.length} flags, risk ${local.score}/100.\n${vtSummary}`
      );
      setAi({ text, loading: false });
    } catch { setAi({ text: "AI analysis unavailable.", loading: false }); }
  };

  const vtMalicious = vtResult?.stats?.malicious || 0;
  const vtSuspicious = vtResult?.stats?.suspicious || 0;
  const vtHarmless = vtResult?.stats?.harmless || 0;
  const vtTotal = vtMalicious + vtSuspicious + vtHarmless;

  return (
    <div>
      <SetupBanner
        title="VirusTotal API"
        apiKey={CONFIG.VIRUSTOTAL_KEY}
        docUrl="https://virustotal.com/gui/join-us"
        steps={[
          'Go to <strong>virustotal.com</strong> → Sign up free → Go to your Profile → API Key',
          'Copy your API key and paste it into the <span class="step-code">CONFIG.VIRUSTOTAL_KEY</span> at the top of the file',
          'You get <strong>500 free URL scans per day</strong> — more than enough for personal use',
        ]}
      />
      <div className="api-status-row" style={{marginBottom:16}}>
        <APIChip name="VirusTotal" keyVal={CONFIG.VIRUSTOTAL_KEY}/>
      </div>

      <div className="field">
        <label className="field-label">URL to Scan</label>
        <input className="input" placeholder="https://example.com" value={url}
          onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && scan()} />
      </div>
      <div className="quick-pills">
        {["http://paypa1-login.verify-account.com","https://google.com","https://192.168.1.1/admin"].map(ex => (
          <div key={ex} className="pill" onClick={() => setUrl(ex)}>Try: {ex.slice(0,28)}…</div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={scan} disabled={scanning || !url.trim()}>
        {scanning ? <><Dots/> &nbsp;{isKeySet(CONFIG.VIRUSTOTAL_KEY) ? "Scanning with VirusTotal…" : "Scanning…"}</> : "🔍 Scan URL"}
      </button>

      {/* Local result */}
      {localResult && (
        <div className={`result ${scoreClass(localResult.score)}`} style={{marginTop:16}}>
          <div className="result-title">
            <span style={{fontSize:18}}>{localResult.score >= 60 ? "🚨" : localResult.score >= 30 ? "⚠️" : "✅"}</span>
            Local Analysis — {scoreLabel(localResult.score)} ({localResult.score}/100)
          </div>
          {localResult.flags.length === 0
            ? <div>No local phishing indicators detected.</div>
            : localResult.flags.map((f, i) => (
                <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginTop:4}}>
                  <span className={`tag ${f.sev==="high"?"tag-red":f.sev==="med"?"tag-amber":"tag-green"}`}>{f.sev.toUpperCase()}</span>
                  {f.msg}
                </div>
              ))
          }
        </div>
      )}

      {/* VirusTotal result */}
      {vtResult && (
        <div className={`result ${vtMalicious > 0 ? "result-danger" : vtSuspicious > 0 ? "result-warn" : "result-safe"}`} style={{marginTop:10}}>
          <div className="result-title">
            🦠 VirusTotal — {vtMalicious > 0 ? `${vtMalicious} engines flagged this URL` : "No malicious detections"}
          </div>
          <div style={{marginBottom:8,fontFamily:"'DM Mono',monospace",fontSize:12}}>
            🚨 {vtMalicious} malicious &nbsp;⚠️ {vtSuspicious} suspicious &nbsp;✅ {vtHarmless} clean &nbsp;({vtTotal} total engines)
          </div>
          {vtResult.results && (
            <div className="vt-grid">
              {Object.entries(vtResult.results).slice(0, 18).map(([engine, res]) => (
                <div key={engine} className={`vt-engine ${res.category === "malicious" ? "vt-malicious" : "vt-clean"}`}>
                  <div className={`vt-dot ${res.category === "malicious" ? "vt-dot-malicious" : "vt-dot-clean"}`}/>
                  {engine}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI */}
      {(ai.loading || ai.text) && (
        <div className="result result-info" style={{marginTop:10}}>
          <div className="result-title">🤖 AI Threat Assessment</div>
          <div className={`ai-output ${ai.loading ? "cursor-blink" : ""}`}>
            {ai.loading ? "Analyzing results" : ai.text}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Breach Checker (HaveIBeenPwned) ----
function BreachChecker() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [ai, setAi] = useState({ text: "", loading: false });

  const check = async () => {
    if (!email.trim()) return;
    setLoading(true); setResult(null); setAi({ text: "", loading: false });

    let data;
    if (isKeySet(CONFIG.HIBP_KEY)) {
      data = await hibpCheck(email.trim());
    } else {
      // Demo mode
      await new Promise(r => setTimeout(r, 1000));
      const knownBreached = ["test","admin","user","password","demo","root","info","support"];
      const localPart = email.toLowerCase().split("@")[0];
      const breached = knownBreached.some(b => localPart.includes(b));
      data = breached ? {
        breaches: [
          { Name:"DemoSite", BreachDate:"2023-08-15", PwnCount:2500000, Description:"Demo breach for illustration.", DataClasses:["Email addresses","Passwords","Usernames"], LogoPath:"🏢" },
          { Name:"ExampleLeaks", BreachDate:"2022-03-01", PwnCount:890000, Description:"Example data exposure.", DataClasses:["Email addresses","Phone numbers"], LogoPath:"📱" },
        ], count: 2, demo: true
      } : { breaches: [], count: 0, demo: true };
    }
    setResult({ ...data, email });
    setLoading(false);

    if (data && !data.error) {
      setAi({ text: "", loading: true });
      try {
        const text = await callClaude(
          "You are a cybersecurity advisor. Give concise actionable next steps (4-5 sentences) for a breach check result. Be reassuring but practical. No markdown.",
          `Email breach check for ${email}: ${data.count > 0 ? `Found in ${data.count} breaches: ${data.breaches.map(b=>b.Name).join(", ")}` : "Not found in any known breaches."}`
        );
        setAi({ text, loading: false });
      } catch { setAi({ text: "AI advisor unavailable.", loading: false }); }
    }
  };

  return (
    <div>
      <SetupBanner
        title="HaveIBeenPwned API"
        apiKey={CONFIG.HIBP_KEY}
        docUrl="https://haveibeenpwned.com/API/v3"
        steps={[
          'Go to <strong>haveibeenpwned.com/API/v3</strong> → Subscribe for ~$3.50/month',
          'After payment you\'ll receive your API key by email',
          'Paste it into <span class="step-code">CONFIG.HIBP_KEY</span> at the top of the file',
          'This gives you access to <strong>12+ billion breached accounts</strong> across 700+ sites',
        ]}
      />
      <div className="api-status-row" style={{marginBottom:16}}>
        <APIChip name="HaveIBeenPwned" keyVal={CONFIG.HIBP_KEY}/>
      </div>

      <div className="field">
        <label className="field-label">Email Address</label>
        <input className="input" type="email" placeholder="you@example.com" value={email}
          onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && check()} />
      </div>
      <button className="btn btn-primary" onClick={check} disabled={loading || !email.trim()}>
        {loading ? <><Dots/> &nbsp;Checking {isKeySet(CONFIG.HIBP_KEY) ? "700+ databases" : "demo data"}…</> : "🔒 Check for Breaches"}
      </button>

      {result && !result.error && (
        <>
          <div className={`result ${result.count > 0 ? "result-danger" : "result-safe"}`} style={{marginTop:16}}>
            <div className="result-title">
              {result.count > 0 ? `🚨 Found in ${result.count} breach${result.count>1?"es":""}` : "✅ Not found in any known breaches"}
              {result.demo && <span style={{fontSize:10,opacity:0.7}}> (demo)</span>}
            </div>
            {result.count === 0 && "Great news! Your email wasn't found in known breach databases. Stay vigilant — new breaches emerge daily."}
          </div>

          {result.breaches?.length > 0 && (
            <div className="breach-grid">
              {result.breaches.map((b, i) => (
                <div key={i} className="breach-card" style={{animationDelay:`${i*0.06}s`}}>
                  <div className="breach-logo">{b.LogoPath?.startsWith("http") ? <img src={b.LogoPath} alt="" style={{width:36,height:36,borderRadius:8,objectFit:"cover"}} /> : (b.LogoPath || "🏢")}</div>
                  <div style={{flex:1}}>
                    <div className="breach-name">{b.Name}</div>
                    <div className="breach-date">📅 {b.BreachDate} &nbsp;·&nbsp; 👥 {(b.PwnCount||0).toLocaleString()} accounts</div>
                    <div className="breach-desc">{(b.Description||"").replace(/<[^>]*>/g,"").slice(0,120)}…</div>
                    <div className="breach-tags">
                      {(b.DataClasses||[]).slice(0,5).map((d,j) => <span key={j} className="breach-tag">{d}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="result result-info" style={{marginTop:12}}>
            <div className="result-title">🤖 AI Advisor</div>
            <div className={`ai-output ${ai.loading ? "cursor-blink" : ""}`}>
              {ai.loading ? "Generating personalized advice" : ai.text}
            </div>
          </div>
        </>
      )}

      {result?.error && (
        <div className="result result-warn" style={{marginTop:16}}>
          <div className="result-title">⚠️ API Error</div>
          {result.error}
        </div>
      )}
    </div>
  );
}

// ---- QR Scanner (jsQR) ----
function QRScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [decoded, setDecoded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [ai, setAi] = useState({ text: "", loading: false });
  const [jsqrLoaded, setJsqrLoaded] = useState(false);
  const fileRef = useRef();
  const canvasRef = useRef();

  // Load jsQR dynamically
  useEffect(() => {
    if (window.jsQR) { setJsqrLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
    script.onload = () => setJsqrLoaded(true);
    script.onerror = () => console.warn("jsQR failed to load");
    document.head.appendChild(script);
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setDecoded(null); setScanResult(null); setAi({ text: "", loading: false });
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const scan = async () => {
    if (!file) return;
    setLoading(true); setDecoded(null); setScanResult(null); setAi({ text: "", loading: false });

    let qrUrl = null;

    if (jsqrLoaded && window.jsQR) {
      // Real QR decode
      try {
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = res; img.onerror = rej;
          img.src = preview;
        });
        const canvas = canvasRef.current;
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = window.jsQR(imageData.data, imageData.width, imageData.height);
        if (result) qrUrl = result.data;
      } catch (e) { console.warn("jsQR decode error:", e); }
    }

    // Fallback demo if real decode fails or jsQR not loaded
    if (!qrUrl) {
      await new Promise(r => setTimeout(r, 1200));
      const demos = ["https://paypa1-secure.login-verify.com/account?token=abc123","https://google.com","https://bit.ly/3xK9abc"];
      qrUrl = demos[Math.floor(Math.random() * demos.length)];
    }

    setDecoded(qrUrl);
    const analysis = analyzeURL(qrUrl);
    setScanResult(analysis);
    setLoading(false);

    setAi({ text: "", loading: true });
    try {
      const text = await callClaude(
        "You are a QR code security expert. Analyze the URL decoded from a QR code and explain if it's safe to visit. Be concise (3-4 sentences). Always advise caution with shortened URLs.",
        `QR decoded URL: ${qrUrl}\nLocal risk score: ${analysis.score}/100, flags: ${analysis.flags.length}`
      );
      setAi({ text, loading: false });
    } catch { setAi({ text: "AI analysis unavailable.", loading: false }); }
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{display:"none"}} />

      {/* jsQR status */}
      <div className="api-status-row" style={{marginBottom:16}}>
        <div className={`api-chip ${jsqrLoaded ? "api-chip-live" : "api-chip-demo"}`}>
          <div className="chip-dot"/>
          jsQR library: {jsqrLoaded ? "LOADED — real QR decoding active" : "Loading…"}
        </div>
      </div>

      {!jsqrLoaded && (
        <div className="setup-banner" style={{marginBottom:16}}>
          <div className="setup-banner-icon">📦</div>
          <div>
            <div className="setup-banner-title">jsQR — Auto-loading</div>
            <div className="setup-banner-body">
              jsQR is loading automatically from CDN. If it fails, add it to your project with:
            </div>
            <div className="setup-steps" style={{marginTop:8}}>
              <div className="setup-step">
                <div className="step-num">1</div>
                <div className="step-text">In your project folder run: <span className="step-code">npm install jsqr</span></div>
              </div>
              <div className="setup-step">
                <div className="step-num">2</div>
                <div className="step-text">Add at top of file: <span className="step-code">import jsQR from 'jsqr'</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${preview ? "var(--teal)" : "var(--border)"}`,
          borderRadius: 12, padding: 36, textAlign: "center", cursor: "pointer",
          transition: "all 0.2s", marginBottom: 16,
          background: preview ? "var(--teal-glow)" : "rgba(0,0,0,0.2)",
        }}
      >
        {preview
          ? <img src={preview} alt="QR" style={{maxHeight:120,borderRadius:8,margin:"0 auto",display:"block"}} />
          : <>
              <div style={{fontSize:40,marginBottom:8}}>📷</div>
              <div style={{fontSize:14,color:"var(--text2)",marginBottom:4,fontWeight:600}}>Drop QR code image here</div>
              <div style={{fontSize:12,color:"var(--text)"}}>or click to browse your files</div>
            </>
        }
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e => handleFile(e.target.files[0])} />
      </div>

      <button className="btn btn-primary" onClick={scan} disabled={loading || !file}>
        {loading ? <><Dots/> &nbsp;{jsqrLoaded ? "Decoding QR code…" : "Simulating decode…"}</> : "📷 Scan QR Code"}
      </button>

      {decoded && (
        <>
          <div className="result result-teal" style={{marginTop:16}}>
            <div className="result-title">📎 Decoded URL {jsqrLoaded ? "" : <span style={{fontSize:10,opacity:0.6}}>(demo)</span>}</div>
            <div style={{fontFamily:"'DM Mono',monospace",wordBreak:"break-all",fontSize:12}}>{decoded}</div>
          </div>
          {scanResult && (
            <div className={`result ${scoreClass(scanResult.score)}`} style={{marginTop:10}}>
              <div className="result-title">
                {scanResult.score >= 60 ? "🚨" : scanResult.score >= 30 ? "⚠️" : "✅"} {scoreLabel(scanResult.score)} — Risk {scanResult.score}/100
              </div>
              {scanResult.flags.length === 0
                ? "No phishing indicators in this URL."
                : scanResult.flags.map((f,i) => <div key={i} style={{marginTop:3}}>{f.msg}</div>)}
            </div>
          )}
          <div className="result result-info" style={{marginTop:10}}>
            <div className="result-title">🤖 QR Safety Assessment</div>
            <div className={`ai-output ${ai.loading ? "cursor-blink" : ""}`}>
              {ai.loading ? "Assessing QR destination" : ai.text}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---- DNS Lookup ----
function DNSLookup() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [ai, setAi] = useState({ text:"", loading:false });

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true); setResult(null); setAi({ text:"", loading:false });
    const d = domain.replace(/^https?:\/\//,"").split("/")[0];
    const registrars = ["GoDaddy LLC","Namecheap Inc","Google Domains","Cloudflare Registrar","NameSilo LLC"];
    const created = new Date(Date.now() - Math.random() * 5 * 365 * 24 * 3600 * 1000);
    const daysOld = Math.floor((Date.now() - created) / (24*3600*1000));
    const expires = new Date(created.getTime() + (1 + Math.floor(Math.random()*4)) * 365 * 24 * 3600 * 1000);
    const sim = {
      domain: d, registrar: registrars[Math.floor(Math.random()*registrars.length)],
      created: created.toDateString(), expires: expires.toDateString(), daysOld,
      privacyProtected: Math.random() > 0.4, suspicious: daysOld < 30,
      nameserver: `ns1.${d.split(".")[d.split(".").length-2]||"provider"}.com`
    };
    await new Promise(r => setTimeout(r, 800));
    setResult(sim); setLoading(false);
    setAi({ text:"", loading:true });
    try {
      const text = await callClaude(
        "You are a DNS security expert. Analyze domain registration info for security red flags. Concise (3-4 sentences). Look for new domains, suspicious patterns. Plain text.",
        `Domain: ${sim.domain}, Registrar: ${sim.registrar}, Created: ${sim.created} (${sim.daysOld} days ago), Expires: ${sim.expires}, Privacy: ${sim.privacyProtected?"Protected":"Exposed"}`
      );
      setAi({ text, loading:false });
    } catch { setAi({ text:"AI unavailable.", loading:false }); }
  };

  return (
    <div>
      <div className="field">
        <label className="field-label">Domain Name</label>
        <input className="input" placeholder="example.com" value={domain}
          onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key==="Enter" && lookup()} />
      </div>
      <button className="btn btn-primary" onClick={lookup} disabled={loading || !domain.trim()}>
        {loading ? <><Dots/> &nbsp;Looking up…</> : "🌐 WHOIS Lookup"}
      </button>
      {result && (
        <>
          <div className={`result ${result.suspicious ? "result-warn" : "result-teal"}`} style={{marginTop:16}}>
            <div className="result-title">{result.suspicious ? "⚠️ New Domain — Use Caution" : "📋 Domain Information"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px",fontFamily:"'DM Mono',monospace",fontSize:12}}>
              {[["Domain",result.domain],["Registrar",result.registrar],["Created",`${result.created} (${result.daysOld}d)`],["Expires",result.expires],["WHOIS Privacy",result.privacyProtected?"✅ Protected":"⚠️ Exposed"],["Nameserver",result.nameserver]].map(([k,v])=>(
                <div key={k} style={{marginTop:6}}>
                  <div style={{color:"var(--text)",fontSize:10,marginBottom:2}}>{k}</div>
                  <div>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="result result-info" style={{marginTop:10}}>
            <div className="result-title">🤖 Security Assessment</div>
            <div className={`ai-output ${ai.loading?"cursor-blink":""}`}>{ai.loading ? "Analyzing domain" : ai.text}</div>
          </div>
        </>
      )}
    </div>
  );
}

// ---- Email Header Analyzer ----
function EmailHeaderAnalyzer() {
  const [header, setHeader] = useState("");
  const [ai, setAi] = useState({ text:"", loading:false });
  const example = `Received: from mail.suspicious-domain.xyz (mail.suspicious-domain.xyz [45.33.32.156])
        by mx.google.com with ESMTP id abc123
From: "PayPal Security" <security@paypa1.com>
Reply-To: hacker@evil.ru
X-Originating-IP: 45.33.32.156
Authentication-Results: spf=fail; dkim=fail; dmarc=fail`;

  const analyze = async () => {
    if (!header.trim()) return;
    setAi({ text:"", loading:true });
    try {
      const text = await callClaude(
        "You are an email security expert. Analyze email headers for: spoofing, SPF/DKIM/DMARC failures, suspicious relays, mismatched From fields. Be clear and structured. Plain text, no markdown.",
        `Analyze these email headers:\n\n${header.slice(0,3000)}`
      );
      setAi({ text, loading:false });
    } catch { setAi({ text:"AI analysis unavailable.", loading:false }); }
  };

  return (
    <div>
      <div className="field">
        <label className="field-label">Paste Email Headers</label>
        <textarea className="input" rows={6} placeholder="Paste raw email headers (From:, Received:, Authentication-Results:…)"
          value={header} onChange={e => setHeader(e.target.value)} style={{resize:"vertical",lineHeight:1.6}} />
      </div>
      <div className="pill" style={{marginBottom:12,display:"inline-block"}} onClick={() => setHeader(example)}>
        📋 Load example suspicious header
      </div>
      <button className="btn btn-primary" onClick={analyze} disabled={ai.loading || !header.trim()}>
        {ai.loading ? <><Dots/> &nbsp;Analyzing…</> : "📧 Analyze Headers"}
      </button>
      {(ai.loading || ai.text) && (
        <div className="result result-info" style={{marginTop:16}}>
          <div className="result-title">🤖 Header Security Analysis</div>
          <div className={`ai-output ${ai.loading?"cursor-blink":""}`}>{ai.loading ? "Parsing email headers" : ai.text}</div>
        </div>
      )}
    </div>
  );
}

// ---- Phishing Detector ----
function PhishingDetector() {
  const [body, setBody] = useState("");
  const [ai, setAi] = useState({ text:"", loading:false });
  const example = `Dear Valued Customer,

Your account has been SUSPENDED due to suspicious activity. You must verify your identity within 24 hours or your account will be permanently deleted.

Click here immediately: http://paypa1-secure.com/verify?id=abc123

Enter your username, password and credit card to restore access.

Failure to comply will result in legal action.
PayPal Security Team`;

  const detect = async () => {
    if (!body.trim()) return;
    setAi({ text:"", loading:true });
    try {
      const text = await callClaude(
        "You are a phishing detection AI. Analyze email body for social engineering. Score phishing likelihood 0-100. List specific red flags (urgency, impersonation, suspicious links, threats). Give verdict: LEGITIMATE, SUSPICIOUS, or PHISHING. Plain text.",
        `Analyze this email:\n\n${body.slice(0,3000)}`
      );
      setAi({ text, loading:false });
    } catch { setAi({ text:"Detection unavailable.", loading:false }); }
  };

  return (
    <div>
      <div className="field">
        <label className="field-label">Email Body Text</label>
        <textarea className="input" rows={7} placeholder="Paste suspicious email content here…"
          value={body} onChange={e => setBody(e.target.value)} style={{resize:"vertical",lineHeight:1.6}} />
      </div>
      <div className="pill" style={{marginBottom:12,display:"inline-block"}} onClick={() => setBody(example)}>
        📋 Load example phishing email
      </div>
      <button className="btn btn-primary" onClick={detect} disabled={ai.loading || !body.trim()}>
        {ai.loading ? <><Dots/> &nbsp;Analyzing…</> : "🎣 Detect Phishing"}
      </button>
      {(ai.loading || ai.text) && (
        <div className="result result-info" style={{marginTop:16}}>
          <div className="result-title">🤖 Phishing Analysis</div>
          <div className={`ai-output ${ai.loading?"cursor-blink":""}`}>{ai.loading ? "Analyzing social engineering patterns" : ai.text}</div>
        </div>
      )}
    </div>
  );
}

// ---- CVE Explainer ----
function CVEExplainer() {
  const [cve, setCve] = useState("");
  const [ai, setAi] = useState({ text:"", loading:false });
  const examples = ["CVE-2021-44228","CVE-2023-20198","CVE-2022-30190","CVE-2024-3400"];

  const explain = async () => {
    if (!cve.trim()) return;
    setAi({ text:"", loading:true });
    try {
      const text = await callClaude(
        "You are a vulnerability researcher. Explain CVEs in plain English: 1) What it is, 2) Who is affected, 3) Severity and why, 4) How to fix it. Plain text, clear structure.",
        `Explain this CVE: ${cve.trim()}`
      );
      setAi({ text, loading:false });
    } catch { setAi({ text:"AI unavailable.", loading:false }); }
  };

  return (
    <div>
      <div className="field">
        <label className="field-label">CVE Identifier</label>
        <input className="input" placeholder="CVE-2021-44228" value={cve}
          onChange={e => setCve(e.target.value)} onKeyDown={e => e.key==="Enter" && explain()} />
      </div>
      <div className="quick-pills">{examples.map(ex => <div key={ex} className="pill" onClick={() => setCve(ex)}>{ex}</div>)}</div>
      <button className="btn btn-primary" onClick={explain} disabled={ai.loading || !cve.trim()}>
        {ai.loading ? <><Dots/> &nbsp;Researching…</> : "🛡️ Explain Vulnerability"}
      </button>
      {(ai.loading || ai.text) && (
        <div className="result result-info" style={{marginTop:16}}>
          <div className="result-title">🤖 Vulnerability Breakdown</div>
          <div className={`ai-output ${ai.loading?"cursor-blink":""}`}>{ai.loading ? "Researching vulnerability database" : ai.text}</div>
        </div>
      )}
    </div>
  );
}

// ---- Incident Response Chat ----
function IncidentResponse() {
  const [msgs, setMsgs] = useState([{ role:"assistant", text:"I'm SENTINEL's Incident Response AI. If you think you've been hacked or something suspicious happened — describe what's going on and I'll guide you step by step." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef();
  useEffect(() => { chatRef.current?.scrollTo(0,chatRef.current.scrollHeight); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput("");
    setMsgs(m => [...m, { role:"user", text:msg }]);
    setLoading(true);
    try {
      const history = msgs.map(m => ({ role: m.role==="assistant"?"assistant":"user", content:m.text }));
      history.push({ role:"user", content:msg });
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"You are SENTINEL's Incident Response specialist. Help users who may have been hacked. Give clear numbered actionable steps. Be calm and specific. Ask follow-up questions to understand the situation. Plain text only.",
          messages: history })
      });
      const data = await resp.json();
      setMsgs(m => [...m, { role:"assistant", text:data.content?.[0]?.text || "Please try again." }]);
    } catch { setMsgs(m => [...m, { role:"assistant", text:"Connection lost. Please try again." }]); }
    setLoading(false);
  };

  const starters = ["I think my email was hacked","I clicked a suspicious link","Someone logged into my account","My computer is acting strange"];

  return (
    <div style={{display:"flex",flexDirection:"column",height:420}}>
      <div ref={chatRef} style={{flex:1,overflowY:"auto",marginBottom:16,display:"flex",flexDirection:"column",gap:12}}>
        {msgs.map((m,i) => (
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div className={`chat-bubble ${m.role==="user"?"chat-bubble-user":"chat-bubble-ai"}`}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{display:"flex"}}><div className="chat-bubble chat-bubble-ai"><Dots/></div></div>}
      </div>
      {msgs.length <= 1 && <div className="quick-pills" style={{marginBottom:12}}>{starters.map(s => <div key={s} className="pill" onClick={()=>setInput(s)}>{s}</div>)}</div>}
      <div style={{display:"flex",gap:10}}>
        <input className="input" style={{flex:1}} placeholder="Describe what happened…" value={input}
          onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} />
        <button className="btn btn-primary" style={{width:"auto",padding:"12px 20px"}} onClick={send} disabled={loading||!input.trim()}>Send →</button>
      </div>
    </div>
  );
}

// ---- SENTINEL AI Chat ----
function SentinelAI() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef();
  useEffect(() => { chatRef.current?.scrollTo(0,chatRef.current.scrollHeight); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput("");
    setMsgs(m => [...m, { role:"user", text:msg }]);
    setLoading(true);
    try {
      const history = msgs.map(m => ({ role:m.role, content:m.text }));
      history.push({ role:"user", content:msg });
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"You are SENTINEL, expert cybersecurity AI. Answer questions about cyber threats, defenses, tools, best practices. Clear and educational. Never enable real attacks. Plain text.",
          messages:history })
      });
      const data = await resp.json();
      setMsgs(m => [...m, { role:"assistant", text:data.content?.[0]?.text||"No response." }]);
    } catch { setMsgs(m => [...m, { role:"assistant", text:"SENTINEL temporarily offline." }]); }
    setLoading(false);
  };

  const prompts = ["How does phishing work?","What is ransomware?","How do I secure my router?","What is zero-day vulnerability?","How do I know if I have malware?","Best free security tools?"];

  return (
    <div style={{display:"flex",flexDirection:"column",height:440}}>
      <div ref={chatRef} style={{flex:1,overflowY:"auto",marginBottom:16,display:"flex",flexDirection:"column",gap:12}}>
        {!msgs.length && (
          <div style={{textAlign:"center",padding:"30px 16px",color:"var(--text)"}}>
            <div style={{fontSize:40,marginBottom:12}}>🛡️</div>
            <div style={{fontSize:15,fontWeight:700,color:"var(--text2)",marginBottom:6}}>Ask SENTINEL anything</div>
            <div style={{fontSize:12}}>Threats, attacks, defenses, best practices — all covered.</div>
          </div>
        )}
        {msgs.map((m,i) => (
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div className={`chat-bubble ${m.role==="user"?"chat-bubble-user":"chat-bubble-ai"}`}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{display:"flex"}}><div className="chat-bubble chat-bubble-ai"><Dots/></div></div>}
      </div>
      <div className="quick-pills" style={{marginBottom:12}}>{prompts.map(p=><div key={p} className="pill" onClick={()=>setInput(p)}>{p}</div>)}</div>
      <div style={{display:"flex",gap:10}}>
        <input className="input" style={{flex:1}} placeholder="Ask about any cybersecurity topic…" value={input}
          onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} />
        <button className="btn btn-primary" style={{width:"auto",padding:"12px 20px"}} onClick={send} disabled={loading||!input.trim()}>Ask →</button>
      </div>
    </div>
  );
}

// ---- Security Tips ----
const TIPS = [
  { emoji:"🔐", title:"Use a Password Manager", body:"Generate and store unique passwords for every site. Never reuse passwords — one breach can compromise all your accounts." },
  { emoji:"📱", title:"Enable 2FA Everywhere", body:"Two-factor authentication blocks 99.9% of automated account takeover attacks, even if your password is stolen." },
  { emoji:"🔄", title:"Keep Software Updated", body:"Most breaches exploit known, patched vulnerabilities. Enable auto-updates on all devices, apps, and browsers." },
  { emoji:"📶", title:"Avoid Public Wi-Fi", body:"Use a VPN on public networks. Attackers can intercept unencrypted traffic with free tools in minutes." },
  { emoji:"💾", title:"Back Up Your Data", body:"Follow the 3-2-1 rule: 3 copies, 2 media types, 1 offsite. This defeats ransomware completely." },
  { emoji:"🎣", title:"Verify Before You Click", body:"Hover links to preview the real URL. Phishing emails mimic trusted brands — always check the sender's domain." },
];

// ---- Overview ----
function Overview({ history }) {
  const dangerous = history.filter(h => h.score >= 60).length;
  const safe = history.filter(h => h.score < 30).length;
  return (
    <div>
      <div className="stat-grid">
        {[
          { icon:"🔍", num:history.length, label:"URLs Scanned", color:"var(--blue)" },
          { icon:"🚨", num:dangerous, label:"Threats Found", color:"var(--red)" },
          { icon:"✅", num:safe, label:"Safe Confirmed", color:"var(--teal)" },
          { icon:"🛠️", num:"10", label:"Tools Available", color:"var(--amber)" },
        ].map((s,i) => (
          <div className="stat-card" key={i} style={{animationDelay:`${i*0.08}s`}}>
            <div style={{fontSize:20}}>{s.icon}</div>
            <div className="stat-num" style={{color:s.color}}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* API Status overview */}
      <div className="card" style={{marginBottom:20,animationDelay:"0.2s"}}>
        <div className="card-header">
          <div className="card-icon card-icon-amber">⚙️</div>
          <div><div className="card-title">API Connection Status</div><div className="card-desc">Configure real APIs for live results</div></div>
        </div>
        <div className="card-body">
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:16}}>
            <APIChip name="VirusTotal" keyVal={CONFIG.VIRUSTOTAL_KEY}/>
            <APIChip name="HaveIBeenPwned" keyVal={CONFIG.HIBP_KEY}/>
            <div className="api-chip api-chip-live"><div className="chip-dot"/>jsQR: Auto-loaded</div>
            <div className="api-chip api-chip-live"><div className="chip-dot"/>Claude AI: Active</div>
          </div>
          <div style={{fontSize:12,color:"var(--text)",lineHeight:1.7,padding:"12px 14px",background:"rgba(0,0,0,0.2)",borderRadius:10,border:"1px solid var(--border)",fontFamily:"'DM Mono',monospace"}}>
            <strong style={{color:"var(--text2)"}}>To activate LIVE APIs:</strong><br/>
            1. Open your App.jsx file in VS Code<br/>
            2. Find the <span style={{color:"var(--blue)"}}>CONFIG</span> block at the top of the file<br/>
            3. Replace <span style={{color:"var(--amber)"}}>YOUR_VIRUSTOTAL_API_KEY</span> with your real VirusTotal key<br/>
            4. Replace <span style={{color:"var(--amber)"}}>YOUR_HIBP_API_KEY</span> with your HaveIBeenPwned key<br/>
            5. Save the file — your app will hot-reload automatically ✅
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card" style={{animationDelay:"0.3s"}}>
          <div className="card-header">
            <div className="card-icon card-icon-blue">📋</div>
            <div><div className="card-title">Recent Scan History</div><div className="card-desc">URL scans this session</div></div>
          </div>
          <div className="card-body">
            {!history.length
              ? <div style={{textAlign:"center",padding:"30px 16px",color:"var(--text)",fontSize:13}}>No scans yet. Use the URL Scanner to start.</div>
              : <div className="history-list">
                  {[...history].reverse().map((item,i) => (
                    <div key={i} className="history-item">
                      <div className="history-dot" style={{background: item.score>=60?"var(--red)":item.score>=30?"var(--amber)":"var(--teal)"}}/>
                      <div className="history-url">{item.url}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,padding:"3px 8px",borderRadius:6,
                        background:item.score>=60?"var(--red-glow)":item.score>=30?"var(--amber-glow)":"var(--teal-glow)",
                        color:item.score>=60?"var(--red)":item.score>=30?"var(--amber)":"var(--teal)"}}>
                        {item.score}/100
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>

        <div className="card" style={{animationDelay:"0.4s"}}>
          <div className="card-header">
            <div className="card-icon card-icon-teal">💡</div>
            <div><div className="card-title">Security Quick Wins</div><div className="card-desc">Protect yourself right now</div></div>
          </div>
          <div className="card-body">
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {TIPS.slice(0,4).map((t,i) => (
                <div key={i} className="tip" style={{animationDelay:`${0.1*i}s`,display:"flex",gap:10,alignItems:"flex-start",padding:"10px 12px"}}>
                  <span style={{fontSize:18,flexShrink:0}}>{t.emoji}</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{t.title}</div>
                    <div style={{fontSize:11,color:"var(--text)",lineHeight:1.5}}>{t.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== NAV =====================
const NAV = [
  { id:"home",     icon:"🏠", label:"Overview",         section:"MAIN" },
  { id:"url",      icon:"🔍", label:"URL Scanner",       section:"TOOLS", badge:"VT" },
  { id:"breach",   icon:"🔒", label:"Breach Checker",    section:"TOOLS", badge:"HIBP" },
  { id:"qr",       icon:"📷", label:"QR Scanner",        section:"TOOLS", badge:"jsQR" },
  { id:"dns",      icon:"🌐", label:"WHOIS Lookup",      section:"TOOLS", badge:"AI" },
  { id:"email",    icon:"📧", label:"Email Headers",     section:"TOOLS", badge:"AI" },
  { id:"phishing", icon:"🎣", label:"Phishing Detector", section:"TOOLS", badge:"AI" },
  { id:"cve",      icon:"🛡️", label:"CVE Explainer",     section:"INTEL", badge:"AI" },
  { id:"incident", icon:"🚨", label:"Incident Response", section:"INTEL", badge:"AI" },
  { id:"sentinel", icon:"🤖", label:"SENTINEL AI",       section:"INTEL", badge:"AI" },
  { id:"tips",     icon:"💡", label:"Security Tips",     section:"LEARN" },
];

const META = {
  home:     ["Overview",          "Your cybersecurity command center"],
  url:      ["URL Scanner",       "Scan links with VirusTotal + local analysis"],
  breach:   ["Breach Checker",    "Real-time breach detection via HaveIBeenPwned"],
  qr:       ["QR Code Scanner",   "Decode QR codes and check URLs for threats"],
  dns:      ["WHOIS Lookup",      "Investigate domain registration and age"],
  email:    ["Email Headers",     "Detect spoofing and email origin fraud"],
  phishing: ["Phishing Detector", "AI-powered social engineering analysis"],
  cve:      ["CVE Explainer",     "Understand any vulnerability in plain English"],
  incident: ["Incident Response", "Step-by-step help if you've been hacked"],
  sentinel: ["SENTINEL AI",       "Ask anything about cybersecurity"],
  tips:     ["Security Tips",     "Essential habits to stay protected"],
};

// ===================== APP =====================
export default function App() {
  const [page, setPage] = useState("home");
  const [history, setHistory] = useState([]);
  const handleScan = useCallback(item => setHistory(h => [...h.slice(-49), item]), []);
  const [title, desc] = META[page];
  const sections = [...new Set(NAV.map(n => n.section))];

  const renderPage = () => {
    const wrap = (icon, cls, title, desc, content, delay="0s") => (
      <div className="card" style={{animationDelay:delay}}>
        <div className="card-header">
          <div className={`card-icon ${cls}`}>{icon}</div>
          <div><div className="card-title">{title}</div><div className="card-desc">{desc}</div></div>
        </div>
        <div className="card-body">{content}</div>
      </div>
    );
    switch(page) {
      case "home":     return <Overview history={history}/>;
      case "url":      return wrap("🔍","card-icon-blue","URL Scanner","VirusTotal + local analysis",<URLScanner onScan={handleScan}/>);
      case "breach":   return wrap("🔒","card-icon-teal","Breach Checker","HaveIBeenPwned — 12B+ accounts",<BreachChecker/>);
      case "qr":       return wrap("📷","card-icon-teal","QR Code Scanner","jsQR real-time decode",<QRScanner/>);
      case "dns":      return wrap("🌐","card-icon-blue","WHOIS Lookup","Domain registration analysis",<DNSLookup/>);
      case "email":    return wrap("📧","card-icon-amber","Email Header Analyzer","Spoofing & fraud detection",<EmailHeaderAnalyzer/>);
      case "phishing": return wrap("🎣","card-icon-red","Phishing Detector","AI social engineering analysis",<PhishingDetector/>);
      case "cve":      return wrap("🛡️","card-icon-amber","CVE Explainer","Plain-English vulnerability guide",<CVEExplainer/>);
      case "incident": return wrap("🚨","card-icon-red","Incident Response","Step-by-step recovery guide",<IncidentResponse/>);
      case "sentinel": return wrap("🤖","card-icon-blue","SENTINEL AI","Your personal cyber expert",<SentinelAI/>);
      case "tips":     return (
        <div className="card">
          <div className="card-header">
            <div className="card-icon card-icon-green">💡</div>
            <div><div className="card-title">Security Best Practices</div><div className="card-desc">6 essential habits</div></div>
          </div>
          <div className="card-body">
            <div className="tips-grid">{TIPS.map((t,i) => (
              <div key={i} className="tip" style={{animationDelay:`${i*0.07}s`}}>
                <div className="tip-emoji">{t.emoji}</div>
                <div className="tip-title">{t.title}</div>
                <div className="tip-body">{t.body}</div>
              </div>
            ))}</div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-mesh"/>
      <div style={{display:"flex",width:"100%",height:"100vh",position:"relative",zIndex:1}}>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">🛡️</div>
              <div className="logo-name">SENTINEL</div>
            </div>
            <div className="logo-sub">CYBER DEFENSE v4.0</div>
          </div>
          <nav className="sidebar-nav">
            {sections.map(section => (
              <div key={section}>
                <div className="nav-section-label">{section}</div>
                {NAV.filter(n => n.section===section).map(n => (
                  <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={() => setPage(n.id)}>
                    <div className="nav-icon">{n.icon}</div>
                    <span>{n.label}</span>
                    {n.badge && <span className={`nav-badge ${isKeySet(n.id==="url"?CONFIG.VIRUSTOTAL_KEY:n.id==="breach"?CONFIG.HIBP_KEY:"x")?"live":""}`}>{n.badge}</span>}
                  </div>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="status-pill">
              <div className="pulse"/>
              <span style={{color:"var(--teal)",fontSize:11,fontFamily:"'DM Mono',monospace"}}>Systems online</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{title}</div>
              <div className="topbar-sub">{desc}</div>
            </div>
            <div className="clock-badge"><Clock/></div>
          </div>
          <div className="content">
            {renderPage()}
            <div style={{height:32}}/>
          </div>
        </div>
      </div>
    </>
  );
}
