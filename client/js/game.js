function handleStartGame() {
  if (!socket || !myIsHost) return;
  socket.emit('game:start', { settings: roomSettings });
}

function initGameFromServer(data) {
  myAnswerMode = data.answerMode || 'emoji';
  mySubmitted = false;

  const isText = myAnswerMode !== 'emoji';
  const count = data.emojiSlots || 3;

  const kb = document.getElementById('e-kb');
  const slotsEl = document.getElementById('e-slots-container');
  const emojiHint = document.getElementById('g-emoji-hint');
  const textWrap = document.getElementById('g-text-input-wrap');
  const textInput = document.getElementById('g-text-input');
  const textHint = document.getElementById('g-text-hint');

  if (isText) {
    if (kb) kb.style.display = 'none';
    if (slotsEl) slotsEl.style.display = 'none';
    if (emojiHint) emojiHint.style.display = 'none';
    if (textWrap) textWrap.style.display = '';
    if (textInput) { textInput.value = ''; textInput.disabled = false; textInput.style.opacity = '1'; }
    if (textHint) textHint.textContent = myAnswerMode === 'word' ? 'one word only' : 'keep it short';
    if (data.alreadySubmitted && data.submittedText) {
      if (textInput) textInput.value = data.submittedText;
      mySubmitted = true;
    }
  } else {
    if (kb) kb.style.display = '';
    if (slotsEl) slotsEl.style.display = '';
    if (emojiHint) emojiHint.style.display = '';
    if (textWrap) textWrap.style.display = 'none';

    slots = Array(count).fill(null);
    activeSlot = 0;

    if (slotsEl) {
      slotsEl.innerHTML = Array.from({length: count}, (_, i) =>
        `<div class="e-slot${i === 0 ? ' active-slot' : ''}" id="es${i}" onclick="selectSlot(${i})"></div>`
      ).join('');
    }

    if (data.alreadySubmitted && data.submittedEmojis) {
      slots = [...data.submittedEmojis];
      mySubmitted = true;
    }

    renderSlots();
    buildEmojiKeyboard();
    updateSlotLabel();
  }

  updateSubmitBtn();

  if (mySubmitted) {
    const btn = document.getElementById('g-submit');
    if (btn) { btn.textContent = 'waiting for others...'; btn.disabled = true; btn.style.opacity = '0.5'; }
    if (isText) {
      if (textInput) { textInput.disabled = true; textInput.style.opacity = '0.7'; }
    } else {
      slots.forEach((_, i) => {
        const el = document.getElementById('es' + i);
        if (el) { el.onclick = null; el.style.opacity = '0.7'; }
      });
    }
  }

  const modeLabel = isText
    ? (myAnswerMode === 'word' ? 'in one word...' : 'in one sentence...')
    : `in ${count} emoji${count === 1 ? '' : 's'}...`;
  document.getElementById('round-label').textContent = `round ${data.roundNumber} of ${data.totalRounds}: ${modeLabel}`;
  document.getElementById('g-q').innerHTML = (myQuestion || '').replace(/\n/g, '<br>');
  const sc = document.getElementById('g-submit-count');
  if (sc) sc.textContent = '';

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
  const term = q.trim().toLowerCase();
  if (!term) { renderGrid(CATS[currentCat]); return; }
  const exact = ALL.filter(e => {
    const kw = EMOJI_KEYWORDS[e] || '';
    return kw.split(' ').some(w => w.startsWith(term));
  });
  if (exact.length) { renderGrid(exact); return; }
  // fallback: any keyword contains the term
  const partial = ALL.filter(e => (EMOJI_KEYWORDS[e] || '').includes(term));
  renderGrid(partial.length ? partial : CATS[currentCat]);
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
  let ready;
  if (myAnswerMode !== 'emoji') {
    const val = (document.getElementById('g-text-input')?.value || '').trim();
    ready = val.length > 0 && !mySubmitted;
  } else {
    ready = slots.every(v => v !== null) && !mySubmitted;
  }
  const btn = document.getElementById('g-submit');
  if (!btn) return;
  btn.disabled = !ready;
  btn.style.opacity = ready ? '1' : '0.3';
  btn.style.cursor = ready ? 'pointer' : 'not-allowed';
}

function submitAnswer() {
  if (myAnswerMode === 'emoji') submitEmojis();
  else submitText();
}

function onTextInput(val) {
  if (myAnswerMode === 'word') {
    const cleaned = val.replace(/\s/g, '');
    const inp = document.getElementById('g-text-input');
    if (inp && inp.value !== cleaned) inp.value = cleaned;
  }
  updateSubmitBtn();
}

function submitText() {
  const inp = document.getElementById('g-text-input');
  const val = (inp?.value || '').trim();
  if (!val || mySubmitted || !socket) return;
  mySubmitted = true;
  socket.emit('round:submit', { text: val });
  const btn = document.getElementById('g-submit');
  if (btn) { btn.textContent = 'waiting for others...'; btn.disabled = true; btn.style.opacity = '0.5'; }
  if (inp) { inp.disabled = true; inp.style.opacity = '0.7'; }
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

// Drag-to-resize emoji keyboard panel
(function initEmojiKbDrag() {
  let dragStartY = null, startGridH = null;
  const MIN_H = 100, MAX_H = 400;

  function getGrid() { return document.querySelector('#e-kb .e-grid'); }

  function onStart(y) {
    const grid = getGrid();
    if (!grid) return;
    dragStartY = y;
    startGridH = grid.offsetHeight;
  }

  function onMove(y) {
    if (dragStartY === null) return;
    const grid = getGrid();
    if (!grid) return;
    const delta = dragStartY - y;
    grid.style.maxHeight = Math.min(MAX_H, Math.max(MIN_H, startGridH + delta)) + 'px';
  }

  function onEnd() { dragStartY = null; }

  document.addEventListener('mousedown', e => {
    if (e.target.id === 'e-kb-handle') { e.preventDefault(); onStart(e.clientY); }
  });
  document.addEventListener('mousemove', e => onMove(e.clientY));
  document.addEventListener('mouseup', onEnd);

  document.addEventListener('touchstart', e => {
    if (e.target.id === 'e-kb-handle') { e.preventDefault(); onStart(e.touches[0].clientY); }
  }, { passive: false });
  document.addEventListener('touchmove', e => {
    if (dragStartY !== null) { e.preventDefault(); onMove(e.touches[0].clientY); }
  }, { passive: false });
  document.addEventListener('touchend', onEnd);
})();
