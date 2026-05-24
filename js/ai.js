// js/ai.js — All AI calls go through your backend proxy

const AI_ENDPOINT = 'https://engine-portal-api.onrender.com/api/ai/ask';

async function callAI(prompt) {
  const res = await fetch(AI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error('AI request failed');
  const data = await res.json();
  return data.reply;
}

function showThinking(elId) {
  const el = document.getElementById(elId);
  if (el) el.innerHTML = `<div class="ai-thinking"><span>●</span><span>●</span><span>●</span>&nbsp; AI is thinking...</div>`;
}

function showAIResult(elId, text) {
  const el = document.getElementById(elId);
  if (el) el.innerHTML = `<div class="ai-result">${escHtml(text)}</div>`;
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Dashboard AI ask
async function dashAsk() {
  const inp = document.getElementById('dashAiInput');
  const q = inp.value.trim();
  if (!q) return;
  inp.value = '';
  showThinking('dashAiResult');
  try {
    const reply = await callAI(q);
    showAIResult('dashAiResult', reply);
  } catch (e) {
    showAIResult('dashAiResult', 'Could not reach AI engine. Make sure your backend is running.');
  }
}

// Full AI page ask
async function fullAsk(preset) {
  goPage('ai');
  const inp = document.getElementById('fullAiInput');
  const q = preset || inp.value.trim();
  if (!q) return;
  inp.value = '';
  showThinking('fullAiResult');
  try {
    const reply = await callAI(q);
    showAIResult('fullAiResult', reply);
  } catch (e) {
    showAIResult('fullAiResult', 'Could not reach AI engine. Make sure your backend is running on port 3000.');
  }
}

// Quick ask — redirects to AI page with a preset
async function quickAsk(prompt) {
  fullAsk(prompt);
}
