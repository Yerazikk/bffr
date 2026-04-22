function startCreateFlow() {
  openNameEdit(() => createLobby());
}

function joinCapture(val) {
  const clean = val.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  const cap = document.getElementById('join-capture');
  cap.value = clean;
  [0, 1, 2].forEach(i => {
    const el = document.getElementById('cc' + i);
    if (el) el.textContent = clean[i] || '';
  });
  [0, 1, 2].forEach(i => {
    const el = document.getElementById('cc' + i);
    if (!el) return;
    const isActive = i === clean.length && clean.length < 3;
    el.style.borderColor = isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.14)';
  });
  if (clean.length === 3) setTimeout(() => handleJoinSubmit(), 200);
}

function joinKey(e) {
  if (e.key === 'Enter') handleJoinSubmit();
}

function handleJoinSubmit() {
  const code = (document.getElementById('join-capture')?.value || '').toUpperCase().trim();
  if (code.length !== 3) return showError('Enter a 3-letter code');
  validateAndJoin(code);
}

function renderLobby(data) {
  const players = data.players || [];
  const hostId = data.hostPlayerId;
  myIsHost = hostId === myPlayerId;

  if (currentScreen === 'waiting-host') {
    const plist = document.getElementById('wh-plist');
    if (plist) plist.innerHTML = players.map(p => playerSlotHTML(p, hostId)).join('');

    const btn = document.getElementById('wh-start-btn');
    const msg = document.getElementById('wh-min-msg');
    const connected = players.filter(p => p.isConnected).length;
    const canStart = connected >= 2;
    if (btn) {
      btn.disabled = !canStart || !myIsHost;
      btn.style.opacity = canStart && myIsHost ? '1' : '0.4';
      btn.style.cursor = canStart && myIsHost ? 'pointer' : 'not-allowed';
    }
    if (msg) msg.style.display = canStart ? 'none' : 'block';
  }

  if (currentScreen === 'waiting-join') {
    const plist = document.getElementById('wj-plist');
    if (plist) plist.innerHTML = players.map(p => playerSlotHTML(p, hostId)).join('');
  }
}

function playerSlotHTML(p, hostId) {
  const isMe = p.id === myPlayerId;
  const isHost = p.id === hostId;
  return `<div style="display:flex;align-items:center;gap:10px">
    <span style="font-size:11px;${isMe ? 'color:var(--text3)' : 'color:transparent'};white-space:nowrap;letter-spacing:0.04em;user-select:none">you →</span>
    <div class="p-slot${isMe ? ' me' : ''}" style="flex:1">
      <div class="dot${p.isConnected ? ' on' : ''}"></div>
      <span style="flex:1${isMe ? ';color:var(--text)' : ''}">${isMe ? myName : p.name}</span>
      ${isHost ? '<span style="font-size:10px;color:var(--text3)">host</span>' : ''}
      ${isMe ? '<span class="pencil-btn" onclick="openNameEdit()">✏️</span>' : ''}
    </div>
  </div>`;
}

function updateRoomCodeDisplays(code) {
  ['wh-code', 'wj-code'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = code;
  });
}

function updateHostButtons() {
  const startBtn = document.getElementById('wh-start-btn');
  if (startBtn) startBtn.style.display = myIsHost ? '' : 'none';
  const settingsBtn = document.getElementById('wh-settings-btn');
  if (settingsBtn) settingsBtn.style.display = myIsHost ? '' : 'none';
}

function exitToHome() {
  myCurrentRoomCode = null;
  myPlayerId = null;
  myIsHost = false;
  screenHistory = [];
  goto('lander');
}
