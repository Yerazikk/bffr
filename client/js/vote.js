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
    const isText = s.text != null;
    const answer = isText
      ? `<span style="font-size:12px;color:#fff;word-break:break-word;white-space:normal;line-height:1.45;width:100%">${s.text}</span>`
      : `<span class="vemoji">${Array.isArray(s.emojis) ? s.emojis.join('') : (s.emojis || '')}</span>`;
    return `<div class="row-wrap" style="${isText ? 'align-items:flex-start' : ''}">
      <div class="row-left" style="${isText ? 'padding-top:11px' : ''}">${isMe ? 'you →' : ''}</div>
      <div class="v-row${isText ? ' v-text' : ''}${isMe ? ' me' : ''}">
        <span class="vname${isMe ? ' vname-hi' : ''}">${isMe ? myName : s.name}</span>
        ${answer}
      </div>
      <div class="row-right" style="${isText ? 'padding-top:8px' : ''}">
        ${!isMe ? `<button class="vote-btn" id="vbtn-${s.playerId}" onclick="castVoteFor('${s.playerId}')">vote</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function restoreVote(targetId) {
  myVote = targetId;
  document.querySelectorAll('.vote-btn').forEach(btn => {
    const id = btn.id.replace('vbtn-', '');
    btn.textContent = id === targetId ? '✓' : 'vote';
    btn.classList.toggle('mine', id === targetId);
    btn.classList.remove('done');
    btn.disabled = false;
  });
}

function castVoteFor(targetId) {
  if (!socket) return;
  myVote = targetId;
  document.querySelectorAll('.vote-btn').forEach(btn => {
    const id = btn.id.replace('vbtn-', '');
    btn.textContent = id === targetId ? '✓' : 'vote';
    btn.classList.toggle('mine', id === targetId);
    btn.classList.remove('done');
    btn.disabled = false;
  });
  socket.emit('vote:cast', { targetPlayerId: targetId });
}
