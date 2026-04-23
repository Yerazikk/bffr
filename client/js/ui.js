function startDeadlineCountdown(timerId, progId, deadline, totalSeconds, color) {
  stopCountdown();
  const tel = document.getElementById(timerId);
  const pel = document.getElementById(progId);
  if (pel) { pel.style.background = color || 'var(--text3)'; pel.style.width = '100%'; }

  function tick() {
    const remaining = Math.max(0, deadline - Date.now());
    const secs = Math.ceil(remaining / 1000);
    if (tel) {
      tel.textContent = '0:' + String(secs).padStart(2, '0');
      tel.classList.toggle('warn', secs <= 5 && secs > 0);
    }
    if (pel) pel.style.width = Math.min(100, (remaining / (totalSeconds * 1000)) * 100) + '%';
    if (remaining > 0) countdownId = setTimeout(tick, 250);
  }
  tick();
}

function stopCountdown() {
  if (countdownId) { clearTimeout(countdownId); countdownId = null; }
}

function showError(msg, duration = 3000) {
  const el = document.getElementById('error-toast');
  if (!el) return;
  el.textContent = msg;
  el.style.background = 'rgba(224,85,85,0.92)';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, duration);
}

function showToast(msg, duration = 2000) {
  const el = document.getElementById('error-toast');
  if (!el) return;
  el.textContent = msg;
  el.style.background = 'rgba(50,50,50,0.95)';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, duration);
}

function showLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'all'; }
}

function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; }
}
