function renderRoundResults(data) {
  document.getElementById('reveal-who').textContent = data.caught
    ? 'caught! the imposter was'
    : 'they got away. the imposter was';

  const emojis = Array.isArray(data.imposterEmojis) ? data.imposterEmojis.join('') : '';
  document.getElementById('reveal-name').innerHTML =
    `${data.imposterName} <span style="font-size:22px">${emojis}</span>`;

  const qr = document.getElementById('results-question-reveal');
  if (qr) qr.innerHTML =
    `<span style="color:var(--text2)">real:</span> ${data.realQuestion}<br>` +
    `<span style="color:var(--red)">imposter got:</span> ${data.imposterQuestion}`;

  document.getElementById('results-rows').innerHTML = (data.scores || []).map((s, i) => {
    const isImp = s.playerId === data.imposterPlayerId;
    const isMe = s.playerId === myPlayerId;
    const delta = (data.scoreDelta || []).find(d => d.playerId === s.playerId);
    const sub = currentSubmissions?.submissions?.find(ss => ss.playerId === s.playerId);
    const emojisStr = sub ? (Array.isArray(sub.emojis) ? sub.emojis.join('') : sub.emojis) : '';

    let badges = '';
    if (isImp) {
      if (data.caught) badges += '<span class="badge badge-r">caught</span> ';
      const d = delta?.delta || 0;
      badges += d > 0 ? `<span class="badge badge-g">+${d}</span>` : '<span class="badge badge-y">±0</span>';
    } else if (delta?.delta > 0) {
      badges = `<span class="badge badge-g">+${delta.delta}</span>`;
    } else {
      badges = '<span class="badge badge-y">±0</span>';
    }

    return `<div class="row-wrap" style="animation-delay:${i * 0.08 + 0.1}s">
      <div class="row-left">${isMe ? 'you →' : ''}</div>
      <div class="v-row${isImp ? ' imposter' : ''}${isMe ? ' me' : ''}">
        <span class="vname${isMe || isImp ? ' vname-hi' : ''}">${isMe ? myName : s.name}</span>
        <span class="vemoji">${emojisStr}</span>
      </div>
      <div class="row-right">${badges}</div>
    </div>`;
  }).join('');

  const actionsDiv = document.getElementById('results-actions');
  if (!actionsDiv) return;

  const endBtn = humanPlayerCount > 1 ? '' : '<button class="btn" onclick="endGame()">end game</button>';

  if (data.isLastRound) {
    actionsDiv.innerHTML = myIsHost
      ? `<button class="btn btn-fill" style="flex:1" onclick="restartGame()">play again</button>${endBtn}`
      : `<div style="font-size:12px;color:var(--text2);padding:10px 0">waiting for host<span class="wdot">.</span><span class="wdot">.</span><span class="wdot">.</span></div>`;
  } else {
    actionsDiv.innerHTML = myIsHost
      ? `<button class="btn btn-fill" style="flex:1" onclick="nextRound()">next round →</button>${endBtn}`
      : `<div style="font-size:12px;color:var(--text2);padding:10px 0">waiting for host<span class="wdot">.</span><span class="wdot">.</span><span class="wdot">.</span></div>`;
  }
}

function renderGameOver(finalScores) {
  document.getElementById('reveal-who').textContent = 'game over';
  document.getElementById('reveal-name').textContent = '';
  const qr = document.getElementById('results-question-reveal');
  if (qr) qr.textContent = '';

  document.getElementById('results-rows').innerHTML = (finalScores || []).map((s, i) => {
    const isMe = s.playerId === myPlayerId;
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
    return `<div class="row-wrap" style="animation-delay:${i * 0.1}s">
      <div class="row-left">${isMe ? 'you →' : ''}</div>
      <div class="v-row${isMe ? ' me' : ''}">
        <span class="vname${isMe ? ' vname-hi' : ''}">${medal} ${isMe ? myName : s.name}</span>
      </div>
      <div class="row-right"><span class="badge badge-y">${s.score} pts</span></div>
    </div>`;
  }).join('');

  const actionsDiv = document.getElementById('results-actions');
  if (!actionsDiv) return;
  actionsDiv.innerHTML = myIsHost
    ? `<button class="btn btn-fill" style="flex:1" onclick="restartGame()">play again</button>
       <button class="btn" onclick="leaveGame()">go home</button>`
    : `<button class="btn" onclick="leaveGame()">go home</button>`;
}

function nextRound() {
  if (!socket || !myIsHost) return;
  socket.emit('game:next-round');
}

function restartGame() {
  if (!socket || !myIsHost) return;
  socket.emit('game:restart');
}

function endGame() {
  if (!socket || !myIsHost) return;
  socket.emit('game:force-end');
}

function leaveGame() {
  if (socket) socket.emit('room:leave');
  clearRoomSession();
  myPlayerId = null; myIsHost = false; myCurrentRoomCode = null;
  currentSubmissions = null; myVote = null; mySubmitted = false;
  humanPlayerCount = 1;
  screenHistory = [];
  goto('lander');
}
