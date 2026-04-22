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
  document.getElementById('modal-settings').classList.add('open');
}

function saveSettings() {
  roomSettings = {
    rounds: +document.getElementById('rounds-range').value,
    submitSeconds: +document.getElementById('submit-range').value,
    voteSeconds: +document.getElementById('vote-range').value,
    category: document.getElementById('cat-select').value,
    emojiSlots: +document.getElementById('emoji-slots-range').value,
    maxPlayers: +document.getElementById('max-players-range').value,
  };
  if (socket && myIsHost) socket.emit('lobby:settings-update', roomSettings);
  closeModal('modal-settings');
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
