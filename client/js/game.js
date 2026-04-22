function handleStartGame() {
  if (!socket || !myIsHost) return;
  socket.emit('game:start', { settings: roomSettings });
}

function initGameFromServer(data) {
  const count = data.emojiSlots || 3;
  slots = Array(count).fill(null);
  activeSlot = 0;
  mySubmitted = false;

  const container = document.getElementById('e-slots-container');
  if (container) {
    container.innerHTML = Array.from({length: count}, (_, i) =>
      `<div class="e-slot${i === 0 ? ' active-slot' : ''}" id="es${i}" onclick="selectSlot(${i})"></div>`
    ).join('');
  }

  renderSlots();
  updateSubmitBtn();

  document.getElementById('round-label').textContent = `round ${data.roundNumber} of ${data.totalRounds}: in ${count} emoji${count === 1 ? '' : 's'}...`;
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
  if (slots[activeSlot] !== null) {
    slots[activeSlot] = null;
  } else if (activeSlot > 0) {
    activeSlot--;
    slots[activeSlot] = null;
    updateSlotLabel();
  }
  renderSlots(); updateSubmitBtn();
}

document.addEventListener('keydown', e => {
  if (e.key !== 'Backspace') return;
  if (currentScreen !== 'game' || mySubmitted) return;
  if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
  e.preventDefault();
  clearSlot();
});

function renderSlots() {
  slots.forEach((val, i) => {
    const el = document.getElementById('es' + i);
    if (!el) return;
    el.textContent = val || '';
    el.classList.toggle('has', val !== null);
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
  slots.forEach((_, i) => {
    const el = document.getElementById('es' + i);
    if (el) { el.onclick = null; el.style.opacity = '0.7'; }
  });
}
