# BSFFR API Reference

## HTTP Routes

| Method | Path | Body / Params | Response |
|--------|------|---------------|----------|
| `GET` | `/health` | — | `{ ok: true }` |
| `POST` | `/rooms` | `{ name, settings? }` | `{ roomCode, playerId, isHost: true }` |
| `GET` | `/rooms/:code` | — | `{ exists, joinable, playerCount, gameState }` |

---

## Socket.io Events — Client → Server

| Event | Payload | Notes |
|-------|---------|-------|
| `room:join` | `{ roomCode, name, playerId? }` | `playerId` = rejoin existing player |
| `room:leave` | — | Manual disconnect |
| `game:start` | `{ settings? }` | Host only; `settings` overrides room settings |
| `game:next-round` | — | Host only; only valid in `results` state |
| `game:restart` | — | Host only; resets scores, returns to lobby |
| `round:submit` | `{ emojis: [e1, e2, e3] }` | Exactly 3 emojis |
| `vote:cast` | `{ targetPlayerId }` | Cannot vote for self |

---

## Socket.io Events — Server → Client

| Event | Payload | When fired |
|-------|---------|------------|
| `self:info` | `{ playerId, isHost, roomCode }` | On join / host transfer |
| `lobby:update` | `{ roomCode, hostPlayerId, players[], settings, gameState }` | On any player join/leave |
| `round:question` | `{ prompt, isImposter, submitDeadline, submitDuration, roundNumber, totalRounds }` | Private per-player at round start |
| `round:submission-progress` | `{ submitted, total }` | Each submission received |
| `round:all-submissions` | `{ submissions[], realQuestion, voteDeadline, voteDuration }` | Submit phase ends |
| `vote:progress` | `{ votesCast, totalVoters }` | Each vote cast |
| `round:results` | `{ imposterPlayerId, imposterName, imposterEmojis, realQuestion, imposterQuestion, caught, votes[], scoreDelta[], scores[], roundNumber, totalRounds, isLastRound }` | Vote phase ends |
| `game:over` | `{ finalScores[] }` | 3s after last round results |
| `error` | `{ message }` | Any validation failure |

---

## Settings Object

Used in `POST /rooms` body and `game:start` payload.

| Field | Type | Range | Default |
|-------|------|-------|---------|
| `rounds` | number | 1–10 | 5 |
| `submitSeconds` | number | 10–120 | 45 |
| `voteSeconds` | number | 10–60 | 20 |
| `category` | string | `all`, `romance`, `lifestyle`, `work`, `social`, `food` | `all` |

---

## Game States

| State | Description |
|-------|-------------|
| `lobby` | Waiting for players; host can change settings and start |
| `submitting` | Players pick 3 emojis; server timer auto-advances |
| `voting` | All submissions visible; players vote for the imposter |
| `results` | Round results shown with scores |
| `finished` | Final round complete; `game:over` fires after 3s |
