function initVoteFromServer(data) {
  const isImp = myIsImposter;
  const timerId = isImp ? 'vi-timer' : 'vn-timer';
  const progId  = isImp ? 'vi-prog'  : 'vn-prog';
  const qId     = isImp ? 'vi-question' : 'vn-question';
  const rowsId  = isImp ? 'vi-rows' : 'vn-rows';
  const countId = isImp ? 'vi-count' : 'vn-count';
  const color   = isImp ? 'var(--red)' : 'var(--green)';

  const qEl = document.getElementById(qId);
  if (qEl) qEl.innerHTML = (data.realQuestion || '').replace(/\n/g, '<br>');

  const countEl = document.getElementById(countId);
  if (countEl) countEl.textContent = `0/${data.submissions.length}`;

  myVote = null;
  renderVoteRows(rowsId, data.submissions);
  startDeadlineCountdown(timerId, progId, data.voteDeadline, data.voteDuration || 20, color);
}

function renderVoteRows(containerId, submissions) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = submissions.map(s => {
    const isMe = s.playerId === myPlayerId;
    const emojis = Array.isArray(s.emojis) ? s.emojis.join('') : s.emojis;
    return `<div class="v-row${isMe ? ' me' : ''}">
      ${isMe ? '<span style="font-size:10px;color:var(--text3);margin-right:2px">you →</span>' : ''}
      <span class="vname${isMe ? '" style="color:var(--text)' : ''}">${isMe ? myName : s.name}</span>
      <span class="vemoji">${emojis}</span>
      ${!isMe ? `<button class="vote-btn" id="vbtn-${s.playerId}" onclick="castVoteFor('${s.playerId}')">vote</button>` : ''}
    </div>`;
  }).join('');
}

function castVoteFor(targetId) {
  if (myVote || !socket) return;
  myVote = targetId;
  document.querySelectorAll('.vote-btn').forEach(btn => {
    const id = btn.id.replace('vbtn-', '');
    btn.textContent = id === targetId ? '✓' : '—';
    btn.classList.add(id === targetId ? 'mine' : 'done');
    btn.disabled = true;
  });
  socket.emit('vote:cast', { targetPlayerId: targetId });
}
