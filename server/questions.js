const QUESTION_PAIRS = [
  // romance
  { id: 'q01', category: 'romance', real: "What's your ideal date night?", imposter: "What's your ideal dinner party?" },
  { id: 'q02', category: 'romance', real: "How do you show someone you like them?", imposter: "How do you show someone you're grateful?" },
  { id: 'q03', category: 'romance', real: "What's a red flag on a first date?", imposter: "What's a red flag in a new friendship?" },
  { id: 'q04', category: 'romance', real: "What does your perfect anniversary look like?", imposter: "What does your perfect birthday look like?" },
  { id: 'q05', category: 'romance', real: "What's your love language?", imposter: "What's your apology style?" },
  { id: 'q06', category: 'romance', real: "How do you know when you're falling for someone?", imposter: "How do you know when a friendship is getting serious?" },
  { id: 'q07', category: 'romance', real: "What makes a great first kiss?", imposter: "What makes a great first impression?" },
  { id: 'q08', category: 'romance', real: "How do you handle a breakup?", imposter: "How do you handle a falling out with a friend?" },
  { id: 'q09', category: 'romance', real: "What's the most romantic thing someone has done for you?", imposter: "What's the kindest thing someone has done for you?" },
  { id: 'q10', category: 'romance', real: "What does a healthy relationship look like to you?", imposter: "What does a healthy friendship look like to you?" },
  { id: 'q11', category: 'romance', real: "What's your take on long distance relationships?", imposter: "What's your take on online friendships?" },
  { id: 'q12', category: 'romance', real: "How soon is too soon to say I love you?", imposter: "How soon is too soon to meet someone's family?" },

  // lifestyle
  { id: 'q13', category: 'lifestyle', real: "Describe your perfect Sunday", imposter: "Describe your perfect Saturday morning" },
  { id: 'q14', category: 'lifestyle', real: "What do you do when you have a free afternoon?", imposter: "What do you do when you can't sleep?" },
  { id: 'q15', category: 'lifestyle', real: "What does getting ready to go out look like for you?", imposter: "What does a lazy morning look like for you?" },
  { id: 'q16', category: 'lifestyle', real: "How do you unwind after a long week?", imposter: "How do you power up before a big day?" },
  { id: 'q17', category: 'lifestyle', real: "What's your go-to comfort routine?", imposter: "What's your go-to hype routine?" },
  { id: 'q18', category: 'lifestyle', real: "How would you spend a surprise day off?", imposter: "How would you spend an unexpected windfall?" },
  { id: 'q19', category: 'lifestyle', real: "What does your morning routine look like?", imposter: "What does your nighttime routine look like?" },
  { id: 'q20', category: 'lifestyle', real: "What's a habit you swear by?", imposter: "What's a habit you're trying to break?" },
  { id: 'q21', category: 'lifestyle', real: "How do you stay motivated?", imposter: "How do you stay calm under pressure?" },
  { id: 'q22', category: 'lifestyle', real: "What does your ideal living situation look like?", imposter: "What does your ideal vacation home look like?" },
  { id: 'q23', category: 'lifestyle', real: "How do you decompress after a bad day?", imposter: "How do you celebrate after a good day?" },
  { id: 'q24', category: 'lifestyle', real: "What's something you do every day without fail?", imposter: "What's something you always forget to do?" },

  // work
  { id: 'q25', category: 'work', real: "How do you handle a stressful deadline?", imposter: "How do you handle a boring workday?" },
  { id: 'q26', category: 'work', real: "What does your dream job look like?", imposter: "What does your dream office look like?" },
  { id: 'q27', category: 'work', real: "How do you deal with a difficult coworker?", imposter: "How do you deal with a difficult client?" },
  { id: 'q28', category: 'work', real: "How do you celebrate a professional win?", imposter: "How do you bounce back from a setback?" },
  { id: 'q29', category: 'work', real: "What does your ideal workday look like?", imposter: "What does your ideal vacation look like?" },
  { id: 'q30', category: 'work', real: "How do you prepare for a big presentation?", imposter: "How do you prepare for a big interview?" },
  { id: 'q31', category: 'work', real: "What's your approach to getting feedback?", imposter: "What's your approach to giving feedback?" },
  { id: 'q32', category: 'work', real: "How do you prioritize when everything feels urgent?", imposter: "How do you stay focused when you're bored?" },
  { id: 'q33', category: 'work', real: "What's the best career advice you've ever gotten?", imposter: "What's the best life advice you've ever gotten?" },
  { id: 'q34', category: 'work', real: "How do you know when it's time to leave a job?", imposter: "How do you know when it's time to end a project?" },
  { id: 'q35', category: 'work', real: "What makes a great manager?", imposter: "What makes a great mentor?" },
  { id: 'q36', category: 'work', real: "How do you handle working with people you don't click with?", imposter: "How do you handle living with people you don't click with?" },

  // social
  { id: 'q37', category: 'social', real: "What are you like at a party where you don't know anyone?", imposter: "What are you like at a family gathering?" },
  { id: 'q38', category: 'social', real: "How do you start a conversation with a stranger?", imposter: "How do you end a conversation politely?" },
  { id: 'q39', category: 'social', real: "What do you do when a friend is going through something hard?", imposter: "What do you do when you're going through something hard?" },
  { id: 'q40', category: 'social', real: "Describe your Friday night vibe", imposter: "Describe your Monday morning vibe" },
  { id: 'q41', category: 'social', real: "How do you make a big decision?", imposter: "How do you ask for help when you need it?" },
  { id: 'q42', category: 'social', real: "What kind of friend are you?", imposter: "What kind of partner are you?" },
  { id: 'q43', category: 'social', real: "How do you handle conflict with someone close to you?", imposter: "How do you handle conflict with a stranger?" },
  { id: 'q44', category: 'social', real: "What do you bring to a group dynamic?", imposter: "What do you look for in a group dynamic?" },
  { id: 'q45', category: 'social', real: "How do you know when a friendship has run its course?", imposter: "How do you know when a relationship has run its course?" },
  { id: 'q46', category: 'social', real: "What's your move when someone cancels on you last minute?", imposter: "What's your move when you need to cancel last minute?" },
  { id: 'q47', category: 'social', real: "How do you feel about group chats?", imposter: "How do you feel about social media?" },
  { id: 'q48', category: 'social', real: "What's your ideal night in with friends?", imposter: "What's your ideal night in alone?" },

  // food
  { id: 'q49', category: 'food', real: "What do you order when you go out to eat?", imposter: "What do you cook when you want to impress someone?" },
  { id: 'q50', category: 'food', real: "Describe your perfect meal", imposter: "Describe your perfect snack spread" },
  { id: 'q51', category: 'food', real: "What's your relationship with coffee?", imposter: "What's your relationship with sleep?" },
  { id: 'q52', category: 'food', real: "What do you eat when you're sad?", imposter: "What do you eat when you're celebrating?" },
  { id: 'q53', category: 'food', real: "How do you feel about brunch culture?", imposter: "How do you feel about meal prepping?" },
  { id: 'q54', category: 'food', real: "What's your go-to takeout order?", imposter: "What's your go-to grocery store splurge?" },
  { id: 'q55', category: 'food', real: "How do you feel about spicy food?", imposter: "How do you feel about bitter food?" },
  { id: 'q56', category: 'food', real: "What does a perfect breakfast look like?", imposter: "What does a perfect midnight snack look like?" },
  { id: 'q57', category: 'food', real: "How do you feel about cooking for others?", imposter: "How do you feel about eating alone?" },
  { id: 'q58', category: 'food', real: "What food do you always have in your fridge?", imposter: "What food do you always have in your pantry?" },
  { id: 'q59', category: 'food', real: "What's a food you hated as a kid but love now?", imposter: "What's a food you loved as a kid but hate now?" },
  { id: 'q60', category: 'food', real: "How do you feel about trying new cuisines?", imposter: "How do you feel about trying new restaurants?" },
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
