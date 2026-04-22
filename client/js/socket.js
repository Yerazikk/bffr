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
    showError('Cannot reach server. Is the backend running?', 5000);
  });

  socket.on('self:info', ({ playerId, isHost, roomCode }) => {
    myPlayerId = playerId;
    myIsHost = isHost;
    myCurrentRoomCode = roomCode;
    updateHostButtons();
  });

  socket.on('lobby:update', (data) => {
    roomSettings = data.settings || roomSettings;
    renderLobby(data);
  });

  socket.on('round:question', (data) => {
    myIsImposter = data.isImposter;
    myQuestion = data.prompt;
    mySubmitted = false;
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
  });

  socket.on('round:all-submissions', (data) => {
    currentSubmissions = data;
    if (myIsImposter) goto('vote-imp');
    else goto('vote-inn');
    initVoteFromServer(data);
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
    if (currentScreen !== 'results') goto('results');
    renderGameOver(data.finalScores);
  });

  socket.on('error', ({ message }) => {
    hideLoading();
    showError(message || 'Something went wrong');
  });

  socket.on('room:closed', () => {
    stopCountdown();
    myCurrentRoomCode = null;
    myPlayerId = null;
    myIsHost = false;
    goto('closed');
  });
}
