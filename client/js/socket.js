function clearRoomSession() {
  localStorage.removeItem('bsffr_pid');
  localStorage.removeItem('bsffr_room');
}

function connectSocket() {
  if (socket && socket.connected) return;
  if (socket) { socket.removeAllListeners(); socket.disconnect(); }

  socket = io(BACKEND_URL, { transports: ['websocket', 'polling'], reconnection: true });

  socket.on('connect', () => {
    hideLoading();
    if (myCurrentRoomCode && myPlayerId) {
      socket.emit('room:join', { roomCode: myCurrentRoomCode, name: myName, playerId: myPlayerId });
    }
  });

  socket.on('connect_error', () => {
    hideLoading();
    showError('Cannot reach server.', 5000);
  });

  socket.on('self:info', ({ playerId, isHost, roomCode }) => {
    myPlayerId = playerId;
    myIsHost = isHost;
    myCurrentRoomCode = roomCode;
    localStorage.setItem('bsffr_pid', playerId);
    localStorage.setItem('bsffr_room', roomCode);
    updateHostButtons();
  });

  socket.on('lobby:update', (data) => {
    if (data.settings) {
      roomSettings = { ...roomSettings, ...data.settings };
    }
    humanPlayerCount = (data.players || []).filter(p => !p.isBot).length;
    if (data.gameState === 'lobby' && currentScreen !== 'waiting-host' && currentScreen !== 'waiting-join') {
      const isHost = data.hostPlayerId === myPlayerId;
      goto(isHost ? 'waiting-host' : 'waiting-join');
      updateRoomCodeDisplays(data.roomCode);
      updateHostButtons();
    }
    renderLobby(data);
    updateHostButtons();
  });

  socket.on('round:question', (data) => {
    myIsImposter = data.isImposter;
    myQuestion = data.prompt;
    myAnswerMode = data.answerMode || 'emoji';
    mySubmitted = data.alreadySubmitted || false;
    myVote = null;
    currentSubmissions = null;
    currentRoundNumber = data.roundNumber;
    totalRoundsCount = data.totalRounds;
    goto('game');
    initGameFromServer(data);
  });

  socket.on('round:submission-progress', ({ submitted, total }) => {
    const el = document.getElementById('g-submit-count');
    if (el) el.textContent = `${submitted}/${total} submitted`;
    // Hide "change answer" if all others have submitted (player is the last one)
    if (mySubmitted && submitted >= total - 1) hideChangeAnswerHint();
  });

  socket.on('round:all-submissions', (data) => {
    currentSubmissions = data;
    if (data.isImposter !== undefined) myIsImposter = data.isImposter;
    if (myIsImposter) goto('vote-imp');
    else goto('vote-inn');
    initVoteFromServer(data);
    if (data.myVote) restoreVote(data.myVote);
  });

  socket.on('vote:progress', ({ votesCast, totalVoters }) => {
    const id = currentScreen === 'vote-imp' ? 'vi-count' : 'vn-count';
    const el = document.getElementById(id);
    if (el) el.textContent = `${votesCast}/${totalVoters}`;
  });


  socket.on('round:results', (data) => {
    goto('results');
    renderRoundResults(data);
  });

  socket.on('game:over', (data) => {
    goto('gameover');
    renderGameOver(data.finalScores);
  });

  socket.on('error', ({ message }) => {
    hideLoading();
    showError(message || 'Something went wrong');
    if (message === 'Room not found') {
      clearRoomSession();
      myCurrentRoomCode = null;
      myPlayerId = null;
    }
  });

  socket.on('kicked', () => {
    clearRoomSession();
    myCurrentRoomCode = null;
    myPlayerId = null;
    myIsHost = false;
    screenHistory = [];
    history.replaceState(null, '', '/');
    showError('You were removed from the lobby');
    goto('lander');
  });

  socket.on('room:closed', () => {
    clearRoomSession();
    stopCountdown();
    myCurrentRoomCode = null;
    myPlayerId = null;
    myIsHost = false;
    history.replaceState(null, '', '/');
    goto('closed');
  });
}

// Auto-join on page load: existing session or URL-based code
(function initFromUrl() {
  const match = window.location.pathname.match(/^\/([A-Za-z]{3})$/);
  const urlCode = match ? match[1].toUpperCase() : null;

  if (myCurrentRoomCode && myPlayerId) {
    // Session already saved — rejoin (existing code handles this in connectSocket)
    showLoading();
    connectSocket();
  } else if (urlCode) {
    // Fresh visit to /ABC — prompt to join that lobby
    validateAndJoin(urlCode);
  }
})();
