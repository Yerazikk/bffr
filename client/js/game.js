function handleStartGame() {
  if (!socket || !myIsHost) return;
  socket.emit('game:start', { settings: roomSettings });
}

function initGameFromServer(data) {
  slots = [null, null, null];
  activeSlot = 0;
  mySubmitted = false;
  renderSlots();
  updateSubmitBtn();

  document.getElementById('round-label').textContent = `round ${data.roundNumber} of ${data.totalRounds}: in 3 emojis...`;
  document.getElementById('g-q').innerHTML = (myQuestion || '').replace(/\n/g, '<br>');
  const sc = document.getElementById('g-submit-count');
  if (sc) sc.textContent = '';

  buildEmojiKeyboard();
  updateSlotLabel();
  startDeadlineCountdown('g-timer', 'g-prog', data.submitDeadline, data.submitDuration || 45, 'var(--text3)');
}

function buildEmojiKeyboard() {
  const bar = document.getElementById('e-cats-bar');
  bar.innerHTML = Object.keys(CATS).map(k =>
    `<div class="e-cat-tab${k === currentCat ? ' on' : ''}" onclick="setCat('${k}',this)" title="${QLABEL[k]}">${k}</div>`
  ).join('');
  document.getElementById('e-search-input').value = '';
  renderGrid(CATS[currentCat]);
}

function setCat(cat, el) {
  currentCat = cat;
  document.querySelectorAll('.e-cat-tab').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('e-search-input').value = '';
  renderGrid(CATS[cat]);
}

function searchEmoji(q) {
  if (!q.trim()) { renderGrid(CATS[currentCat]); return; }
  const results = ALL.filter(e => e.startsWith(q) || q.split('').some(c => e.includes(c)));
  renderGrid(results.length ? results : ALL.slice(0, 80));
}

function renderGrid(list) {
  document.getElementById('e-grid').innerHTML = list.map(e =>
    `<div class="e-btn" onclick="pickEmoji('${e}')">${e}</div>`
  ).join('');
}

function selectSlot(i) {
  if (mySubmitted) return;
  if (activeSlot === i && slots[i] !== null) {
    slots[i] = null; renderSlots(); updateSubmitBtn(); return;
  }
  activeSlot = i; renderSlots(); updateSlotLabel();
}

function pickEmoji(e) {
  if (mySubmitted) return;
  slots[activeSlot] = e;
  const sl = document.getElementById('es' + activeSlot);
  sl.classList.remove('popping'); void sl.offsetWidth; sl.classList.add('popping');
  setTimeout(() => sl.classList.remove('popping'), 300);
  renderSlots(); updateSubmitBtn();
  const next = slots.findIndex((v, i) => v === null && i !== activeSlot);
  if (next !== -1) { activeSlot = next; renderSlots(); updateSlotLabel(); }
}

function clearSlot() {
  if (mySubmitted) return;
  slots[activeSlot] = null; renderSlots(); updateSubmitBtn();
}

function renderSlots() {
  [0, 1, 2].forEach(i => {
    const el = document.getElementById('es' + i);
    if (!el) return;
    el.textContent = slots[i] || '';
    el.classList.toggle('has', slots[i] !== null);
    el.classList.toggle('active-slot', i === activeSlot);
  });
}

function updateSlotLabel() {
  const el = document.getElementById('slot-label');
  if (el) el.textContent = activeSlot + 1;
}

function updateSubmitBtn() {
  const ready = slots.every(v => v !== null) && !mySubmitted;
  const btn = document.getElementById('g-submit');
  if (!btn) return;
  btn.disabled = !ready;
  btn.style.opacity = ready ? '1' : '0.3';
  btn.style.cursor = ready ? 'pointer' : 'not-allowed';
}

function submitEmojis() {
  if (!slots.every(v => v !== null) || mySubmitted || !socket) return;
  mySubmitted = true;
  socket.emit('round:submit', { emojis: [...slots] });

  const btn = document.getElementById('g-submit');
  if (btn) { btn.textContent = 'waiting for others...'; btn.disabled = true; btn.style.opacity = '0.5'; }
  [0, 1, 2].forEach(i => {
    const el = document.getElementById('es' + i);
    if (el) { el.onclick = null; el.style.opacity = '0.7'; }
  });
}
