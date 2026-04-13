const API = "http://localhost:5000";

let allCities = {};
let questions = [];
let currentQ = 0;
let score = 0;
let difficulty = 'easy';
let answered = false;
let history = [];

const DIFFICULTY_CONFIG = {
    easy:   { count: 5,  desc: '5 questions · Multiple choice · No time limit' },
    medium: { count: 8,  desc: '8 questions · Mixed topics · No time limit' },
    hard:   { count: 12, desc: '12 questions · All topics · Tricky options' }
};

async function init() {
    try {
        const res = await fetch(`${API}/cities/all`);
        if (!res.ok) throw new Error('API unreachable');
        allCities = await res.json();
        document.getElementById('api-status').textContent = `✓ ${Object.keys(allCities).length} cities loaded from API`;
    } catch(e) {
        document.getElementById('api-status').textContent = '⚠ Could not connect to API — make sure Flask is running';
    }
}

function setDifficulty(diff) {
    difficulty = diff;
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.diff === diff);
    });
    document.getElementById('diff-desc').textContent = DIFFICULTY_CONFIG[diff].desc;
}

function qCapital() {
    return {
        category: '🏛️ Geography',
        question: 'What is the capital city of Morocco?',
        correct: 'Rabat',
        options: shuffle(['Rabat', 'Casablanca', 'Marrakech', 'Fès']),
        explanation: 'Rabat is Morocco\'s political capital. Casablanca is the largest city and economic hub, but Rabat is the seat of government and the Royal Palace.'
    };
}

function qPopulationLargest() {
    const sorted = Object.values(allCities).sort((a, b) => b.population - a.population);
    const largest = sorted[0];
    const wrong = sorted.slice(1, 4).map(c => c.name);
    return {
        category: '👥 Population',
        question: 'Which Moroccan city has the largest population?',
        correct: largest.name,
        options: shuffle([largest.name, ...wrong]),
        explanation: `${largest.name} is Morocco's most populous city with ${largest.population.toLocaleString()} inhabitants.`
    };
}

function qIsSaharan() {
    const cities = Object.values(allCities);
    const city = randomFrom(cities);
    const answer = city.saharan ? 'Yes — it is a Saharan city' : 'No — it is a northern city';
    return {
        category: '🏜 Saharan Provinces',
        question: `Is ${city.name} located in the Saharan provinces of Morocco?`,
        correct: answer,
        options: shuffle([
            'Yes — it is a Saharan city',
            'No — it is a northern city'
        ]),
        explanation: city.saharan
            ? `${city.name} is in the ${city.region} region, one of Morocco's southern Saharan provinces.`
            : `${city.name} is in the ${city.region} region, in northern Morocco.`
    };
}

function qRegion() {
    const cities = Object.values(allCities);
    const city = randomFrom(cities);
    const regions = [...new Set(cities.map(c => c.region))];
    const wrongRegions = regions.filter(r => r !== city.region);
    const distractors = shuffle(wrongRegions).slice(0, 3);
    return {
        category: '📍 Regions',
        question: `Which region does ${city.name} belong to?`,
        correct: city.region,
        options: shuffle([city.region, ...distractors]),
        explanation: `${city.name} is located in the ${city.region} region of Morocco.`
    };
}

function qFoundedEarliest() {
    const cities = Object.values(allCities).filter(c => !isNaN(parseInt(c.founded)));
    const sorted = cities.sort((a, b) => parseInt(a.founded) - parseInt(b.founded));
    const oldest = sorted[0];
    const wrong = sorted.slice(1, 4).map(c => c.name);
    return {
        category: '🏛️ History',
        question: 'Which city on record has the earliest founding date?',
        correct: oldest.name,
        options: shuffle([oldest.name, ...wrong]),
        explanation: `${oldest.name} was founded in ${oldest.founded}, making it the oldest city in our database.`
    };
}

function qEconomy() {
    const cities = Object.values(allCities);
    const city = randomFrom(cities);
    const others = cities.filter(c => c.name !== city.name);
    const wrong = shuffle(others).slice(0, 3).map(c => c.economy);
    return {
        category: '💼 Economy',
        question: `What best describes the economy of ${city.name}?`,
        correct: city.economy,
        options: shuffle([city.economy, ...wrong]),
        explanation: `${city.name}'s economy is characterised by: ${city.economy}.`
    };
}

function qLanguage() {
    const cities = Object.values(allCities);
    const city = randomFrom(cities);
    const others = cities.filter(c => c.name !== city.name && c.language !== city.language);
    const wrong = shuffle(others).slice(0, 3).map(c => c.language);
    return {
        category: '🗣️ Language',
        question: `Which languages are spoken in ${city.name}?`,
        correct: city.language,
        options: shuffle([city.language, ...wrong]),
        explanation: `The main languages spoken in ${city.name} are: ${city.language}.`
    };
}

function qPopulationOrder() {
    const cities = Object.values(allCities);
    const city = randomFrom(cities);
    const real = city.population;
    const wrong = [
        Math.round(real * (0.5 + Math.random() * 0.3)),
        Math.round(real * (1.4 + Math.random() * 0.4)),
        Math.round(real * (0.2 + Math.random() * 0.2)),
    ];
    return {
        category: '👥 Population',
        question: `What is the approximate population of ${city.name}?`,
        correct: real.toLocaleString(),
        options: shuffle([real, ...wrong]).map(n => n.toLocaleString()),
        explanation: `${city.name} has a population of approximately ${real.toLocaleString()} people, located in the ${city.region} region.`
    };
}

function qSaharanCity() {
    const saharanCities = Object.values(allCities).filter(c => c.saharan);
    const northernCities = Object.values(allCities).filter(c => !c.saharan);
    const correct = randomFrom(saharanCities);
    const wrong = shuffle(northernCities).slice(0, 3).map(c => c.name);
    return {
        category: '🏜 Saharan Provinces',
        question: 'Which of these cities is located in the Saharan provinces?',
        correct: correct.name,
        options: shuffle([correct.name, ...wrong]),
        explanation: `${correct.name} is in the ${correct.region} region — one of Morocco's Saharan southern provinces.`
    };
}

function qOujdaCapital() {
    return {
        category: '🏛️ Geography',
        question: 'What is the capital city of Morocco\'s Oriental region?',
        correct: 'Oujda',
        options: shuffle(['Oujda', 'Nador', 'Tangier', 'Fès']),
        explanation: 'Oujda is the administrative capital of the Oriental region in northeastern Morocco.'
    };
}

function qNadorPort() {
    return {
        category: '💼 Economy',
        question: 'Which Moroccan city is known for its modern port serving as a gateway to Europe?',
        correct: 'Nador',
        options: shuffle(['Nador', 'Tangier', 'Agadir', 'Casablanca']),
        explanation: 'Nador\'s port is a key hub for trade and migration between Morocco and Spain.'
    };
}

function qDescriptionMatch() {
    const cities = Object.values(allCities);
    const city = randomFrom(cities);
    const snippet = city.description.split('.')[0] + '.';
    const wrong = shuffle(cities.filter(c => c.name !== city.name)).slice(0, 3).map(c => c.name);
    return {
        category: '🔎 City Descriptions',
        question: `Which city matches this description?\n"${snippet}"`,
        correct: city.name,
        options: shuffle([city.name, ...wrong]),
        explanation: `That was describing ${city.name}. ${city.description.split('.')[1] || ''}`
    };
}

const EASY_POOL   = [qCapital, qIsSaharan, qSaharanCity, qRegion, qOujdaCapital];
const MEDIUM_POOL = [qCapital, qIsSaharan, qSaharanCity, qRegion, qEconomy, qLanguage, qPopulationLargest, qOujdaCapital, qNadorPort];
const HARD_POOL   = [qCapital, qIsSaharan, qSaharanCity, qRegion, qEconomy, qLanguage,
                     qPopulationLargest, qFoundedEarliest, qPopulationOrder, qDescriptionMatch, qNadorPort];

function generateQuestions() {
    const config = DIFFICULTY_CONFIG[difficulty];
    const pool = difficulty === 'easy' ? EASY_POOL
               : difficulty === 'medium' ? MEDIUM_POOL
               : HARD_POOL;

    const generated = [];
    const shuffledPool = shuffle([...pool]);

    for (let i = 0; i < config.count; i++) {
        const generator = shuffledPool[i % shuffledPool.length];
        try {
            generated.push(generator());
        } catch(e) {
            generated.push(qIsSaharan());
        }
    }
    return generated;
}

function startQuiz() {
    if (Object.keys(allCities).length === 0) {
        document.getElementById('api-status').textContent = '⚠ API not connected — start the Flask server first!';
        return;
    }

    questions = generateQuestions();
    currentQ = 0;
    score = 0;
    history = [];
    answered = false;

    showScreen('screen-question');
    renderQuestion();
}

function renderQuestion() {
    const q = questions[currentQ];
    const total = questions.length;
    answered = false;

    document.getElementById('progress-fill').style.width = `${(currentQ / total) * 100}%`;
    document.getElementById('question-counter').textContent = `Question ${currentQ + 1} of ${total}`;
    document.getElementById('score-display').textContent = `Score: ${score}`;

    document.getElementById('question-category').textContent = q.category;
    document.getElementById('question-text').textContent = q.question;

    const grid = document.getElementById('options-grid');
    const letters = ['A', 'B', 'C', 'D'];
    grid.innerHTML = q.options.map((opt, i) => `
        <button class="option-btn" onclick="selectOption(this, '${escapeAttr(opt)}')">
            <span class="option-letter">${letters[i]}</span>
            <span>${opt}</span>
        </button>
    `).join('');

    const feedback = document.getElementById('feedback-box');
    const nextBtn = document.getElementById('next-btn');
    feedback.className = 'feedback-box hidden';
    nextBtn.classList.add('hidden');

    nextBtn.textContent = currentQ === total - 1 ? 'See Results →' : 'Next Question →';
}

function selectOption(btn, chosen) {
    if (answered) return;
    answered = true;

    const q = questions[currentQ];
    const isCorrect = chosen === q.correct;

    if (isCorrect) score++;

    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => {
        const bText = b.querySelector('span:last-child').textContent;
        b.disabled = true;
        if (bText === q.correct) {
            b.classList.add('correct');
        } else if (b === btn && !isCorrect) {
            b.classList.add('wrong');
        } else {
            b.classList.add('revealed');
        }
    });

    const feedback = document.getElementById('feedback-box');
    feedback.className = `feedback-box ${isCorrect ? 'correct-fb' : 'wrong-fb'}`;
    document.getElementById('feedback-icon').textContent = isCorrect ? '✅' : '❌';
    document.getElementById('feedback-verdict').textContent = isCorrect ? 'Correct!' : `Wrong — the answer is ${q.correct}`;
    document.getElementById('feedback-explain').textContent = q.explanation;

    history.push({
        question: q.question,
        correct: isCorrect,
        chosen,
        rightAnswer: q.correct
    });

    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('score-display').textContent = `Score: ${score}`;
}

function nextQuestion() {
    currentQ++;
    if (currentQ >= questions.length) {
        showResults();
    } else {
        renderQuestion();
    }
}

function showResults() {
    const total = questions.length;
    const pct = score / total;

    let emoji, title, message;
    if (pct === 1)        { emoji = '🏆'; title = 'Perfect Score!';        message = 'Incredible — you know Morocco inside out. A true explorer!'; }
    else if (pct >= 0.8)  { emoji = '🌟'; title = 'Excellent!';            message = 'You have a strong knowledge of Morocco. Just a few things to brush up on!'; }
    else if (pct >= 0.6)  { emoji = '👍'; title = 'Good Job!';             message = 'Solid effort! Keep exploring the map to fill in the gaps.'; }
    else if (pct >= 0.4)  { emoji = '📚'; title = 'Keep Learning!';        message = 'Morocco has so much to discover. Explore the interactive map to boost your knowledge!'; }
    else                  { emoji = '🏜'; title = 'Room to Grow!';         message = 'No worries — head to the Map Explorer to learn about Morocco\'s cities!'; }

    document.getElementById('results-emoji').textContent = emoji;
    document.getElementById('results-title').textContent = title;
    document.getElementById('results-fraction').textContent = `${score} / ${total}`;
    document.getElementById('results-message').textContent = message;

    const breakdown = document.getElementById('results-breakdown');
    breakdown.innerHTML = history.map(h => `
        <div class="breakdown-item ${h.correct ? 'correct-item' : 'wrong-item'}">
            <span>${h.correct ? '✅' : '❌'}</span>
            <span class="breakdown-q">${h.question.length > 60 ? h.question.slice(0, 60) + '…' : h.question}</span>
            ${!h.correct ? `<span class="breakdown-ans">→ ${h.rightAnswer}</span>` : ''}
        </div>
    `).join('');

    document.getElementById('progress-fill').style.width = '100%';

    showScreen('screen-results');
}

function restartQuiz() {
    showScreen('screen-start');
}

function showScreen(id) {
    document.querySelectorAll('.quiz-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function escapeAttr(str) {
    return String(str).replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

init();

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && answered && document.getElementById('screen-question').classList.contains('active')) {
        nextQuestion();
    }
});
