let myPlayerId = null, myIsHost = false, myCurrentRoomCode = null, myName = 'Player 1';
let myIsImposter = false, myQuestion = null, mySubmitted = false, myVote = null;
let currentRoundNumber = 0, totalRoundsCount = 5;
let currentSubmissions = null;
let roomSettings = { rounds: 5, submitSeconds: 45, voteSeconds: 20, category: 'all' };
let nameModalCallback = null;
let socket = null, countdownId = null;
let currentScreen = 'lander', screenHistory = [];
let slots = [null, null, null], activeSlot = 0, currentCat = '😀';
