// ─── APP STATE ───
const AppState = {
  currentPage: 'flashcards',
  settings: {
    language: 'tr',
    voice: 'female',
    speed: 'normal',
    autoPlay: false,
    showPhonetic: true,
    dailyGoal: 20
  },
  progress: {
    // SM-2 data per card: { ef, interval, nextReview, reps, again, hard, easy }
    cards: {},
    // SR data per sentence
    sentences: {},
    studyDays: new Set(),
    totalSessions: 0
  }
};

// ─── LOCAL STORAGE ───
function saveState() {
  try {
    const toSave = {
      settings: AppState.settings,
      progress: {
        cards: AppState.progress.cards,
        sentences: AppState.progress.sentences,
        studyDays: [...AppState.progress.studyDays],
        totalSessions: AppState.progress.totalSessions
      }
    };
    localStorage.setItem('francais_state', JSON.stringify(toSave));
  } catch(e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem('francais_state');
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.settings) Object.assign(AppState.settings, saved.settings);
    if (saved.progress) {
      AppState.progress.cards = saved.progress.cards || {};
      AppState.progress.sentences = saved.progress.sentences || {};
      AppState.progress.studyDays = new Set(saved.progress.studyDays || []);
      AppState.progress.totalSessions = saved.progress.totalSessions || 0;
    }
  } catch(e) {}
}

// ─── ROUTER ───
function navigate(page) {
  AppState.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

  if (page === 'flashcards') renderFlashcards();
  if (page === 'pronunciation') renderPronunciation();
  if (page === 'settings') renderSettings();
  updateLangToggle();
}

// ─── LANGUAGE ───
function setLanguage(lang) {
  AppState.settings.language = lang;
  saveState();
  updateLangToggle();
  navigate(AppState.currentPage);
}

function updateLangToggle() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === AppState.settings.language);
  });
}

// ─── TOAST ───
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// ─── PEXELS IMAGE CACHE ───
const imageCache = {};

async function fetchPexelsImage(query, wordId) {
  if (imageCache[wordId]) return imageCache[wordId];
  const PEXELS_KEY = window.PEXELS_API_KEY || '';
  if (!PEXELS_KEY) return null;
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: { Authorization: PEXELS_KEY }
    });
    const data = await res.json();
    const url = data.photos?.[0]?.src?.medium || null;
    if (url) imageCache[wordId] = url;
    return url;
  } catch { return null; }
}

// ─── SM-2 ALGORITHM ───
function sm2(card, quality) {
  // quality: 0=again, 3=hard, 5=easy
  let { ef = 2.5, interval = 1, reps = 0 } = card;

  if (quality < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ef);
    reps++;
  }

  ef = Math.max(1.3, ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
  return { ef, interval, reps, nextReview };
}

function isDue(cardData) {
  if (!cardData || !cardData.nextReview) return true;
  return Date.now() >= cardData.nextReview;
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', async () => {
  loadState();

  // Nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });

  // Lang toggle
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // Load data
  await Promise.all([
    loadWords(),
    loadSentences()
  ]);

  navigate('flashcards');

  // Mark study day
  const today = new Date().toISOString().split('T')[0];
  AppState.progress.studyDays.add(today);
  saveState();
});
