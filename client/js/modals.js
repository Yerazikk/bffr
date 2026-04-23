function openRules() {
  document.getElementById('modal-rules').classList.add('open');
}

function openSettings() {
  const s = roomSettings;
  document.getElementById('rounds-range').value = s.rounds;
  document.getElementById('rounds-val').textContent = s.rounds;
  document.getElementById('max-players-range').value = s.maxPlayers || 8;
  document.getElementById('max-players-val').textContent = s.maxPlayers || 8;
  document.getElementById('emoji-slots-range').value = s.emojiSlots || 3;
  document.getElementById('emoji-slots-val').textContent = s.emojiSlots || 3;
  document.getElementById('submit-range').value = s.submitSeconds;
  document.getElementById('submit-val').textContent = s.submitSeconds;
  document.getElementById('vote-range').value = s.voteSeconds;
  document.getElementById('vote-val').textContent = s.voteSeconds;
  document.getElementById('cat-select').value = s.category || 'all';
  document.getElementById('answer-mode-select').value = s.answerMode || 'emoji';
  const packs = s.customPacks || ['','','','',''];
  [0,1,2,3,4].forEach(i => { document.getElementById('custom-pack-' + i).value = packs[i] || ''; });
  switchPackTab(0);
  onAnswerModeChange(s.answerMode || 'emoji');
  document.getElementById('custom-packs-section').style.display = 'none';
  const toggle = document.getElementById('custom-add-toggle');
  toggle.style.background = '';
  toggle.style.color = 'var(--text2)';
  document.getElementById('modal-settings').classList.add('open');
}

function onAnswerModeChange(val) {
  const row = document.getElementById('emoji-slots-row');
  const sep = document.getElementById('emoji-slots-sep');
  const isEmoji = val === 'emoji';
  if (row) row.style.display = isEmoji ? '' : 'none';
  if (sep) sep.style.display = isEmoji ? '' : 'none';
}

function saveSettings() {
  const packs = [0,1,2,3,4].map(i => document.getElementById('custom-pack-' + i).value);
  for (let i = 0; i < packs.length; i++) {
    if (packs[i].trim()) {
      const parsed = packs[i].split(/[?\n]+/).map(q => q.trim()).filter(q => q.length > 2);
      if (parsed.length % 2 !== 0) {
        const sec = document.getElementById('custom-packs-section');
        if (sec) sec.style.display = '';
        const tog = document.getElementById('custom-add-toggle');
        if (tog) { tog.style.background = 'var(--surface2)'; tog.style.color = 'var(--text)'; }
        switchPackTab(i);
        return showError(`pack ${i + 1}: questions must be in pairs — you have ${parsed.length} (need ${parsed.length + 1})`);
      }
    }
  }
  roomSettings = {
    rounds: +document.getElementById('rounds-range').value,
    submitSeconds: +document.getElementById('submit-range').value,
    voteSeconds: +document.getElementById('vote-range').value,
    category: document.getElementById('cat-select').value,
    emojiSlots: +document.getElementById('emoji-slots-range').value,
    maxPlayers: +document.getElementById('max-players-range').value,
    answerMode: document.getElementById('answer-mode-select').value,
    customPacks: packs,
  };
  if (socket && myIsHost) socket.emit('lobby:settings-update', roomSettings);
  closeModal('modal-settings');
}

function switchPackTab(n) {
  [0,1,2,3,4].forEach(i => {
    document.getElementById('custom-pack-' + i).style.display = i === n ? '' : 'none';
  });
  document.querySelectorAll('.pack-tab').forEach((el, i) => el.classList.toggle('on', i === n));
}

function openNameEdit(callback) {
  nameModalCallback = callback || null;
  const inp = document.getElementById('name-input');
  inp.value = myName;
  document.getElementById('modal-name').classList.add('open');
  setTimeout(() => { inp.focus(); inp.select(); }, 120);
}

function saveName() {
  const v = document.getElementById('name-input').value.trim();
  if (v) {
    myName = v;
    localStorage.setItem('bsffr_name', myName);
    document.querySelectorAll('#wh-plist .p-slot.me span:first-of-type, #wj-plist .p-slot.me span:first-of-type')
      .forEach(el => el.textContent = myName);
  }
  closeModal('modal-name');
  if (nameModalCallback) { const cb = nameModalCallback; nameModalCallback = null; cb(); }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function closeOverlay(e, id) {
  if (e.target.id === id) closeModal(id);
}

function toggleCustomAdd() {
  const section = document.getElementById('custom-packs-section');
  const toggle = document.getElementById('custom-add-toggle');
  const isHidden = section.style.display === 'none';
  section.style.display = isHidden ? '' : 'none';
  toggle.style.background = isHidden ? 'var(--surface2)' : '';
  toggle.style.color = isHidden ? 'var(--text)' : 'var(--text2)';
  if (isHidden) {
    const activeTA = document.querySelector('#custom-packs-section textarea:not([style*="display:none"])');
    if (activeTA) setTimeout(() => activeTA.focus(), 50);
  }
}
