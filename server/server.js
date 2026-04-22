const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getRandomPair, VALID_CATEGORIES } = require('./questions');

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_URL || 'https://bsffr.vercel.app';

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ['GET', 'POST'] },
});

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// ── ROOM STATE ────────────────────────────────────────────────────────────────

const rooms = new Map();
const socketMeta = new Map(); // socketId → { roomCode, playerId }

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function genCode() {
  let code;
  do {
    code = Array.from({ length: 3 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function clamp(v, lo, hi) {
  return Math.min(Math.max(Number(v) || lo, lo), hi);
}

function sanitizeSettings(s = {}) {
  return {
    rounds: clamp(s.rounds, 1, 10) || 5,
    submitSeconds: clamp(s.submitSeconds, 10, 120) || 45,
    voteSeconds: clamp(s.voteSeconds, 10, 60) || 20,
    category: VALID_CATEGORIES.includes(s.category) ? s.category : 'all',
  };
}

function activePlayers(room) {
  return room.players.filter(p => p.connected);
}

function lobbyPayload(room) {
  return {
    roomCode: room.code,
    hostPlayerId: room.hostPlayerId,
    players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score, isConnected: p.connected })),
    settings: room.settings,
    gameState: room.gameState,
  };
}

function clearTimers(room) {
  room.timers.forEach(t => clearTimeout(t));
  room.timers = [];
}

// ── HTTP ──────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/ping',   (_req, res) => res.sendStatus(200));

app.post('/rooms', (req, res) => {
  const { name, settings } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const code = genCode();
  const hostId = genId();
  rooms.set(code, {
    code,
    hostPlayerId: hostId,
    players: [{ id: hostId, name: name.trim().slice(0, 20), socketId: null, score: 0, connected: false }],
    settings: sanitizeSettings(settings),
    gameState: 'lobby',
    roundNumber: 0,
    usedQuestionIds: [],
    currentRound: null,
    timers: [],
  });
  res.json({ roomCode: code, playerId: hostId, isHost: true });
});

app.get('/rooms/:code', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) return res.json({ exists: false });
  res.json({
    exists: true,
    joinable: room.gameState === 'lobby' && room.players.length < 8,
    playerCount: room.players.length,
    gameState: room.gameState,
  });
});

// ── SOCKET ────────────────────────────────────────────────────────────────────

io.on('connection', socket => {

  socket.on('room:join', ({ roomCode, name, playerId } = {}) => {
    const code = (roomCode || '').toUpperCase();
    const room = rooms.get(code);
    if (!room) return socket.emit('error', { message: 'Room not found' });

    let player = playerId ? room.players.find(p => p.id === playerId) : null;

    if (!player) {
      if (room.gameState !== 'lobby') return socket.emit('error', { message: 'Game already in progress' });
      if (room.players.length >= 8) return socket.emit('error', { message: 'Room is full' });
      if (!name || !name.trim()) return socket.emit('error', { message: 'Name is required' });
      player = { id: genId(), name: name.trim().slice(0, 20), socketId: socket.id, score: 0, connected: true };
      room.players.push(player);
    } else {
      player.socketId = socket.id;
      player.connected = true;
      if (name && name.trim()) player.name = name.trim().slice(0, 20);
    }

    socket.join(code);
    socketMeta.set(socket.id, { roomCode: code, playerId: player.id });

    socket.emit('self:info', { playerId: player.id, isHost: room.hostPlayerId === player.id, roomCode: code });
    io.to(code).emit('lobby:update', lobbyPayload(room));

    // Rejoin mid-game: resend current question
    if (room.gameState === 'submitting' && room.currentRound && !room.currentRound.submissions[player.id]) {
      socket.emit('round:question', {
        prompt: room.currentRound.imposterPlayerId === player.id
          ? room.currentRound.pair.imposter
          : room.currentRound.pair.real,
        isImposter: room.currentRound.imposterPlayerId === player.id,
        submitDeadline: room.currentRound.submitDeadline,
        submitDuration: room.settings.submitSeconds,
        roundNumber: room.roundNumber,
        totalRounds: room.settings.rounds,
      });
    }
  });

  socket.on('room:leave', () => handleLeave(socket));

  socket.on('game:start', ({ settings } = {}) => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    const room = rooms.get(meta.roomCode);
    if (!room) return;
    if (room.hostPlayerId !== meta.playerId) return socket.emit('error', { message: 'Only the host can start' });
    if (room.gameState !== 'lobby') return socket.emit('error', { message: 'Game already started' });
    if (activePlayers(room).length < 2) return socket.emit('error', { message: 'Need at least 2 players' });

    if (settings) room.settings = sanitizeSettings({ ...room.settings, ...settings });
    room.players.forEach(p => p.score = 0);
    room.roundNumber = 0;
    room.usedQuestionIds = [];
    startRound(room);
  });

  socket.on('game:next-round', () => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    const room = rooms.get(meta.roomCode);
    if (!room || room.hostPlayerId !== meta.playerId || room.gameState !== 'results') return;
    startRound(room);
  });

  socket.on('game:restart', () => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    const room = rooms.get(meta.roomCode);
    if (!room || room.hostPlayerId !== meta.playerId) return;
    clearTimers(room);
    room.players.forEach(p => p.score = 0);
    room.roundNumber = 0;
    room.usedQuestionIds = [];
    room.gameState = 'lobby';
    room.currentRound = null;
    io.to(room.code).emit('lobby:update', lobbyPayload(room));
  });

  socket.on('round:submit', ({ emojis } = {}) => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    const room = rooms.get(meta.roomCode);
    if (!room?.currentRound) return;
    if (room.gameState !== 'submitting') return socket.emit('error', { message: 'Not submission phase' });
    if (room.currentRound.submissions[meta.playerId]) return socket.emit('error', { message: 'Already submitted' });
    if (!Array.isArray(emojis) || emojis.length !== 3) return socket.emit('error', { message: 'Submit exactly 3 emojis' });

    room.currentRound.submissions[meta.playerId] = emojis;

    const active = activePlayers(room);
    const submitted = Object.keys(room.currentRound.submissions).length;
    io.to(room.code).emit('round:submission-progress', { submitted, total: active.length });

    if (submitted >= active.length) {
      clearTimers(room);
      endSubmitPhase(room);
    }
  });

  socket.on('vote:cast', ({ targetPlayerId } = {}) => {
    const meta = socketMeta.get(socket.id);
    if (!meta) return;
    const room = rooms.get(meta.roomCode);
    if (!room?.currentRound) return;
    if (room.gameState !== 'voting') return socket.emit('error', { message: 'Not voting phase' });
    if (room.currentRound.votes[meta.playerId]) return socket.emit('error', { message: 'Already voted' });
    if (meta.playerId === targetPlayerId) return socket.emit('error', { message: 'Cannot vote for yourself' });
    if (!room.players.find(p => p.id === targetPlayerId)) return socket.emit('error', { message: 'Player not found' });

    room.currentRound.votes[meta.playerId] = targetPlayerId;

    const active = activePlayers(room);
    const cast = Object.keys(room.currentRound.votes).length;
    io.to(room.code).emit('vote:progress', { votesCast: cast, totalVoters: active.length });

    if (cast >= active.length) {
      clearTimers(room);
      endVotePhase(room);
    }
  });

  socket.on('disconnect', () => handleLeave(socket));
});

// ── GAME LOGIC ────────────────────────────────────────────────────────────────

function startRound(room) {
  clearTimers(room);
  room.roundNumber++;

  const pair = getRandomPair(room.usedQuestionIds, room.settings.category);
  room.usedQuestionIds.push(pair.id);

  const active = activePlayers(room);
  const imposter = active[Math.floor(Math.random() * active.length)];

  const now = Date.now();
  const deadline = now + room.settings.submitSeconds * 1000;

  room.currentRound = {
    imposterPlayerId: imposter.id,
    pair,
    submissions: {},
    votes: {},
    submitDeadline: deadline,
    voteDeadline: 0,
  };
  room.gameState = 'submitting';

  active.forEach(p => {
    const sock = io.sockets.sockets.get(p.socketId);
    if (sock) sock.emit('round:question', {
      prompt: p.id === imposter.id ? pair.imposter : pair.real,
      isImposter: p.id === imposter.id,
      submitDeadline: deadline,
      submitDuration: room.settings.submitSeconds,
      roundNumber: room.roundNumber,
      totalRounds: room.settings.rounds,
    });
  });

  const t = setTimeout(() => endSubmitPhase(room), room.settings.submitSeconds * 1000);
  room.timers.push(t);
}

function endSubmitPhase(room) {
  if (room.gameState !== 'submitting') return;

  const now = Date.now();
  const voteDeadline = now + room.settings.voteSeconds * 1000;
  room.currentRound.voteDeadline = voteDeadline;
  room.gameState = 'voting';

  const playerMap = Object.fromEntries(room.players.map(p => [p.id, p.name]));

  // Build submissions list — give ❓ to anyone who didn't submit
  const submissions = activePlayers(room).map(p => ({
    playerId: p.id,
    name: playerMap[p.id],
    emojis: room.currentRound.submissions[p.id] || ['❓', '❓', '❓'],
  }));

  io.to(room.code).emit('round:all-submissions', {
    submissions,
    realQuestion: room.currentRound.pair.real,
    voteDeadline,
    voteDuration: room.settings.voteSeconds,
  });

  const t = setTimeout(() => endVotePhase(room), room.settings.voteSeconds * 1000);
  room.timers.push(t);
}

function endVotePhase(room) {
  if (room.gameState !== 'voting') return;
  clearTimers(room);
  room.gameState = 'results';

  const { votes, imposterPlayerId, pair } = room.currentRound;

  // Plurality vote count
  const tally = {};
  Object.values(votes).forEach(id => { tally[id] = (tally[id] || 0) + 1; });

  let maxVotes = 0, mostVotedId = null;
  Object.entries(tally).forEach(([id, n]) => {
    if (n > maxVotes) { maxVotes = n; mostVotedId = id; }
    else if (n === maxVotes) { mostVotedId = null; } // tie = not caught
  });

  const caught = mostVotedId === imposterPlayerId;
  const scoreDelta = [];

  room.players.forEach(p => {
    let delta = 0;
    if (p.id === imposterPlayerId) {
      delta = caught ? 0 : 2;
    } else if (votes[p.id] === imposterPlayerId) {
      delta = 1;
    }
    p.score += delta;
    scoreDelta.push({ playerId: p.id, name: p.name, delta });
  });

  const impPlayer = room.players.find(p => p.id === imposterPlayerId);
  const isLastRound = room.roundNumber >= room.settings.rounds;

  io.to(room.code).emit('round:results', {
    imposterPlayerId,
    imposterName: impPlayer?.name || '?',
    imposterEmojis: room.currentRound.submissions[imposterPlayerId] || ['❓', '❓', '❓'],
    realQuestion: pair.real,
    imposterQuestion: pair.imposter,
    caught,
    votes: Object.entries(votes).map(([voter, target]) => ({ voterPlayerId: voter, targetPlayerId: target })),
    scoreDelta,
    scores: room.players.map(p => ({ playerId: p.id, name: p.name, score: p.score })),
    roundNumber: room.roundNumber,
    totalRounds: room.settings.rounds,
    isLastRound,
  });

  if (isLastRound) {
    room.gameState = 'finished';
    const t = setTimeout(() => {
      io.to(room.code).emit('game:over', {
        finalScores: [...room.players].sort((a, b) => b.score - a.score)
          .map(p => ({ playerId: p.id, name: p.name, score: p.score })),
      });
    }, 3000);
    room.timers.push(t);
  }
}

function handleLeave(socket) {
  const meta = socketMeta.get(socket.id);
  if (!meta) return;
  socketMeta.delete(socket.id);

  const room = rooms.get(meta.roomCode);
  if (!room) return;

  const player = room.players.find(p => p.id === meta.playerId);
  if (!player) return;

  player.connected = false;
  player.socketId = null;

  // Transfer host
  if (room.hostPlayerId === player.id) {
    const next = room.players.find(p => p.connected);
    if (next) {
      room.hostPlayerId = next.id;
      const nextSock = io.sockets.sockets.get(next.socketId);
      if (nextSock) nextSock.emit('self:info', { playerId: next.id, isHost: true, roomCode: room.code });
    }
  }

  const connected = activePlayers(room);
  if (connected.length === 0) {
    clearTimers(room);
    rooms.delete(room.code);
    return;
  }

  io.to(room.code).emit('lobby:update', lobbyPayload(room));

  // Check if remaining players complete the phase
  if (room.gameState === 'submitting' && room.currentRound) {
    const subCount = Object.keys(room.currentRound.submissions).length;
    if (subCount >= connected.length) { clearTimers(room); endSubmitPhase(room); }
  } else if (room.gameState === 'voting' && room.currentRound) {
    const voteCount = Object.keys(room.currentRound.votes).length;
    if (voteCount >= connected.length) { clearTimers(room); endVotePhase(room); }
  }
}

// ── START ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server on :${PORT}`));
