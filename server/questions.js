const QUESTION_PAIRS = [
  // romance
  { id: 'q01', category: 'romance', real: "What's your ideal date night?", imposter: "What's your ideal dinner party?" },
  { id: 'q02', category: 'romance', real: "How do you show someone you like them?", imposter: "How do you show someone you're grateful?" },
  { id: 'q03', category: 'romance', real: "What's a red flag on a first date?", imposter: "What's a red flag in a new friendship?" },
  { id: 'q04', category: 'romance', real: "What does your perfect anniversary look like?", imposter: "What does your perfect birthday look like?" },
  { id: 'q05', category: 'romance', real: "What's your love language?", imposter: "What's your apology style?" },

  // lifestyle
  { id: 'q06', category: 'lifestyle', real: "Describe your perfect Sunday", imposter: "Describe your perfect Saturday morning" },
  { id: 'q07', category: 'lifestyle', real: "What do you do when you have a free afternoon?", imposter: "What do you do when you can't sleep?" },
  { id: 'q08', category: 'lifestyle', real: "What does getting ready to go out look like for you?", imposter: "What does a lazy morning look like for you?" },
  { id: 'q09', category: 'lifestyle', real: "How do you unwind after a long week?", imposter: "How do you power up before a big day?" },
  { id: 'q10', category: 'lifestyle', real: "What's your go-to comfort routine?", imposter: "What's your go-to hype routine?" },

  // work
  { id: 'q11', category: 'work', real: "How do you handle a stressful deadline?", imposter: "How do you handle a boring workday?" },
  { id: 'q12', category: 'work', real: "What does your dream job look like?", imposter: "What does your dream office look like?" },
  { id: 'q13', category: 'work', real: "How do you deal with a difficult coworker?", imposter: "How do you deal with a difficult client?" },
  { id: 'q14', category: 'work', real: "How do you celebrate a professional win?", imposter: "How do you bounce back from a setback?" },
  { id: 'q15', category: 'work', real: "What does your ideal workday look like?", imposter: "What does your ideal vacation look like?" },

  // social
  { id: 'q16', category: 'social', real: "What are you like at a party where you don't know anyone?", imposter: "What are you like at a family gathering?" },
  { id: 'q17', category: 'social', real: "How do you start a conversation with a stranger?", imposter: "How do you end a conversation politely?" },
  { id: 'q18', category: 'social', real: "What do you do when a friend is going through something hard?", imposter: "What do you do when you're going through something hard?" },
  { id: 'q19', category: 'social', real: "Describe your Friday night vibe", imposter: "Describe your Monday morning vibe" },
  { id: 'q20', category: 'social', real: "How do you make a big decision?", imposter: "How do you ask for help when you need it?" },

  // food
  { id: 'q21', category: 'food', real: "What do you order when you go out to eat?", imposter: "What do you cook when you want to impress someone?" },
  { id: 'q22', category: 'food', real: "Describe your perfect meal", imposter: "Describe your perfect snack spread" },
  { id: 'q23', category: 'food', real: "What's your relationship with coffee?", imposter: "What's your relationship with sleep?" },
  { id: 'q24', category: 'food', real: "What do you eat when you're sad?", imposter: "What do you eat when you're celebrating?" },
  { id: 'q25', category: 'food', real: "How do you feel about brunch culture?", imposter: "How do you feel about meal prepping?" },
];

const VALID_CATEGORIES = ['all', 'romance', 'lifestyle', 'work', 'social', 'food'];

function getRandomPair(usedIds = [], category = 'all') {
  let pool = category === 'all' ? QUESTION_PAIRS : QUESTION_PAIRS.filter(q => q.category === category);
  if (pool.length === 0) pool = QUESTION_PAIRS;
  const available = pool.filter(q => !usedIds.includes(q.id));
  const source = available.length > 0 ? available : pool;
  return source[Math.floor(Math.random() * source.length)];
}

module.exports = { QUESTION_PAIRS, VALID_CATEGORIES, getRandomPair };
