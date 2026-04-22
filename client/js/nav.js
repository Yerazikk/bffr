function goto(id) {
  stopCountdown();
  const prev = document.querySelector('.screen.active');
  if (prev) { prev.classList.remove('active', 'enter'); screenHistory.push(currentScreen); }
  const next = document.getElementById('s-' + id);
  if (!next) return;
  next.classList.add('active');
  void next.offsetWidth;
  next.classList.add('enter');
  currentScreen = id;
  const showBack = !['lander', 'waiting-host', 'waiting-join', 'game', 'vote-imp', 'vote-inn', 'results'].includes(id);
  document.getElementById('back-btn').style.display = showBack ? 'block' : 'none';
  document.getElementById('footer-link').style.display = ['game', 'vote-imp', 'vote-inn'].includes(id) ? 'none' : 'block';
  if (id === 'join') {
    setTimeout(() => {
      const el = document.getElementById('join-capture');
      if (el) { el.value = ''; joinCapture(''); el.focus(); }
    }, 80);
  }
}

function goBack() {
  const prev = screenHistory.pop();
  if (prev) goto(prev);
}
