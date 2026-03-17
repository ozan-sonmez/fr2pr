// ─── DATA ───
let allWords = [];
let filteredWords = [];
let currentCardIndex = 0;
let sessionStats = { again: 0, hard: 0, easy: 0 };
let fcFilter = 'all';
let cardFlipped = false;

function loadWords() {
  // Embedded data — no fetch needed (GitHub Pages compatible)
  allWords = [...DATA_A1_WORDS, ...DATA_A2_WORDS];
}

// ─── FILTER WORDS ───
function getFilteredWords() {
  let words = [...allWords];
  if (fcFilter === 'a1') words = words.filter(w => w.level === 'A1');
  else if (fcFilter === 'a2') words = words.filter(w => w.level === 'A2');
  else if (fcFilter === 'verbs') words = words.filter(w => w.category === 'verb');
  return words;
}

function getDueWords() {
  return getFilteredWords().filter(w => isDue(AppState.progress.cards[w.id]));
}

// ─── RENDER FLASHCARDS PAGE ───
function renderFlashcards() {
  const page = document.getElementById('page-flashcards');
  if (!page) return;

  filteredWords = getFilteredWords();
  const dueWords = getDueWords();
  const learnedCount = filteredWords.filter(w => {
    const c = AppState.progress.cards[w.id];
    return c && c.reps > 0 && !isDue(c);
  }).length;

  page.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">${t('flashcards.title')}</h1>
      <p class="section-subtitle">${t('flashcards.subtitle')}</p>
    </div>

    <div class="fc-stats">
      <div class="fc-stat">
        <div class="fc-stat-num" style="color:var(--warning)">${dueWords.length}</div>
        <div class="fc-stat-label">${t('flashcards.due')}</div>
      </div>
      <div class="fc-stat">
        <div class="fc-stat-num" style="color:var(--success)">${learnedCount}</div>
        <div class="fc-stat-label">${t('flashcards.learned')}</div>
      </div>
      <div class="fc-stat">
        <div class="fc-stat-num">${filteredWords.length}</div>
        <div class="fc-stat-label">${t('flashcards.total')}</div>
      </div>
    </div>

    <div class="filter-row">
      ${['all','a1','a2','verbs'].map(f => `
        <button class="chip ${fcFilter === f ? 'active' : ''}" onclick="setFcFilter('${f}')">
          ${t('flashcards.level_' + f)}
        </button>
      `).join('')}
    </div>

    <div id="fc-content">
      ${dueWords.length === 0 ? renderSessionComplete() : renderCardArea(dueWords)}
    </div>
  `;

  if (dueWords.length > 0) {
    currentCardIndex = 0;
    sessionStats = { again: 0, hard: 0, easy: 0 };
    cardFlipped = false;
    loadCardContent(dueWords[0]);
  }
}

function setFcFilter(filter) {
  fcFilter = filter;
  renderFlashcards();
}

function renderCardArea(dueWords) {
  const card = dueWords[currentCardIndex];
  return `
    <div class="card-counter">
      <span class="counter-text">${currentCardIndex + 1} / ${dueWords.length}</span>
    </div>
    <div class="progress-bar" style="margin-bottom:16px">
      <div class="progress-fill" style="width:${(currentCardIndex / dueWords.length) * 100}%"></div>
    </div>

    <div class="flashcard-scene">
      <div class="flashcard" id="flashcard" onclick="flipCard()">
        <div class="flashcard-face flashcard-front">
          <div class="fc-image" id="fc-image">
            <div class="fc-image-placeholder" id="fc-placeholder">
              <span id="fc-emoji">⏳</span>
            </div>
          </div>
          <div class="fc-image-overlay"></div>
          <div class="fc-hint">👆 ${t('flashcards.tapToFlip')}</div>
          <div class="fc-front-content">
            <div class="fc-word" id="fc-word">${card.word}</div>
            ${AppState.settings.showPhonetic ? `<div class="fc-phonetic" id="fc-phonetic">${card.phonetic || ''}</div>` : ''}
          </div>
        </div>
        <div class="flashcard-face flashcard-back">
          <div class="fc-back-emoji" id="fc-back-emoji">🇫🇷</div>
          <div class="fc-translation" id="fc-translation">
            ${AppState.settings.language === 'tr' ? card.translation_tr : card.translation_en}
          </div>
          <div class="fc-back-word" id="fc-back-word">${card.word}</div>
          <div class="fc-category-badge">${card.category || card.level || 'A1'}</div>
        </div>
      </div>
    </div>

    <div class="sm2-buttons" id="sm2-buttons" style="display:none">
      <button class="sm2-btn sm2-btn-again" onclick="rateCard(0)">
        <span class="sm2-btn-icon">😰</span>
        <span class="sm2-btn-label">${t('flashcards.again')}</span>
        <span class="sm2-btn-interval">${t('flashcards.againInterval')}</span>
      </button>
      <button class="sm2-btn sm2-btn-hard" onclick="rateCard(3)">
        <span class="sm2-btn-icon">😐</span>
        <span class="sm2-btn-label">${t('flashcards.hard')}</span>
        <span class="sm2-btn-interval">${t('flashcards.hardInterval')}</span>
      </button>
      <button class="sm2-btn sm2-btn-easy" onclick="rateCard(5)">
        <span class="sm2-btn-icon">😄</span>
        <span class="sm2-btn-label">${t('flashcards.easy')}</span>
        <span class="sm2-btn-interval">${t('flashcards.easyInterval')}</span>
      </button>
    </div>
  `;
}

function renderSessionComplete() {
  const total = sessionStats.again + sessionStats.hard + sessionStats.easy;
  const acc = total > 0 ? Math.round((sessionStats.easy / total) * 100) : 0;
  return `
    <div class="session-complete">
      <div class="trophy">🏆</div>
      <h2>${t('flashcards.sessionDone')}</h2>
      <p>${t('flashcards.sessionDoneMsg')}</p>
      <div class="session-stats">
        <div class="sess-stat">
          <div class="sess-stat-num" style="color:var(--danger)">${sessionStats.again}</div>
          <div class="sess-stat-label">${t('flashcards.again_count')}</div>
        </div>
        <div class="sess-stat">
          <div class="sess-stat-num" style="color:var(--warning)">${sessionStats.hard}</div>
          <div class="sess-stat-label">${t('flashcards.hard_count')}</div>
        </div>
        <div class="sess-stat">
          <div class="sess-stat-num" style="color:var(--success)">${sessionStats.easy}</div>
          <div class="sess-stat-label">${t('flashcards.easy_count')}</div>
        </div>
      </div>
      <button class="btn btn-primary" onclick="renderFlashcards()" style="width:100%">
        ${t('flashcards.newSession')}
      </button>
    </div>
  `;
}

// ─── LOAD CARD IMAGE ───
async function loadCardContent(word) {
  const EMOJIS = {
    greetings:'👋', food:'🍽️', home:'🏠', animals:'🐾', transport:'🚗',
    places:'📍', people:'👥', nature:'🌿', objects:'📦', basics:'💬', verb:'✨'
  };
  const emoji = word.emoji || EMOJIS[word.category] || '🇫🇷';
  const placeholder = document.getElementById('fc-placeholder');
  if (placeholder) placeholder.querySelector('#fc-emoji').textContent = emoji;

  // Try Pexels
  const imgUrl = await fetchPexelsImage(word.pexels_query || word.word, word.id);
  if (imgUrl) {
    const fcImage = document.getElementById('fc-image');
    if (fcImage) {
      fcImage.innerHTML = `<img src="${imgUrl}" alt="${word.word}" loading="lazy"><div class="fc-image-overlay"></div>`;
    }
  }
}

// ─── FLIP ───
function flipCard() {
  if (cardFlipped) return;
  cardFlipped = true;
  const card = document.getElementById('flashcard');
  const btns = document.getElementById('sm2-buttons');
  if (card) card.classList.add('flipped');
  if (btns) btns.style.display = 'grid';
}

// ─── RATE ───
function rateCard(quality) {
  const dueWords = getDueWords();
  if (currentCardIndex >= dueWords.length) return;

  const word = dueWords[currentCardIndex];
  const existing = AppState.progress.cards[word.id] || {};
  const result = sm2(existing, quality);
  AppState.progress.cards[word.id] = { ...existing, ...result };

  if (quality === 0) sessionStats.again++;
  else if (quality === 3) sessionStats.hard++;
  else sessionStats.easy++;

  saveState();

  currentCardIndex++;
  cardFlipped = false;

  const remaining = getDueWords();
  const fcContent = document.getElementById('fc-content');
  if (!fcContent) return;

  if (remaining.length === 0 || currentCardIndex >= dueWords.length) {
    AppState.progress.totalSessions++;
    saveState();
    fcContent.innerHTML = renderSessionComplete();
    return;
  }

  fcContent.innerHTML = renderCardArea(remaining);
  loadCardContent(remaining[currentCardIndex] || remaining[0]);
}
