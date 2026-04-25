async function createLobby() {
  showLoading();
  try {
    const res = await fetch(`${BACKEND_URL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: myName, settings: roomSettings }),
    });
    const data = await res.json();
    if (data.error) { hideLoading(); return showError(data.error); }

    myPlayerId = data.playerId;
    myIsHost = true;
    myCurrentRoomCode = data.roomCode;

    connectSocket();
    socket.once('connect', () => {
      socket.emit('room:join', { roomCode: data.roomCode, name: myName, playerId: data.playerId });
    });
    if (socket.connected) {
      socket.emit('room:join', { roomCode: data.roomCode, name: myName, playerId: data.playerId });
    }

    goto('waiting-host');
    updateRoomCodeDisplays(data.roomCode);
    history.pushState(null, '', '/' + data.roomCode);
    hideLoading();
  } catch {
    hideLoading();
    showError('Could not create room. Is the server running?');
  }
}

async function validateAndJoin(code) {
  showLoading();
  try {
    const res = await fetch(`${BACKEND_URL}/rooms/${code}`);
    const data = await res.json();
    hideLoading();
    if (!data.exists) return showError('Room not found');
    if (!data.joinable) return showError(
      data.gameState !== 'lobby' ? 'Game already in progress' : 'Room is full'
    );
    openNameEdit(() => {
      connectSocket();
      const doJoin = () => socket.emit('room:join', { roomCode: code, name: myName, playerId: null });
      if (socket.connected) doJoin();
      else socket.once('connect', doJoin);
      goto('waiting-join');
      updateRoomCodeDisplays(code);
      history.pushState(null, '', '/' + code);
    });
  } catch {
    hideLoading();
    showError('Could not reach server. Check your connection.');
  }
}
