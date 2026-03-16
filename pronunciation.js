// ─── DATA ───
let allSentences = [];
let pronFilter = 'all';
let currentVoice = null;
let currentSpeed = null;
let activeAudio = null;

async function loadSentences() {
  try {
    const [a1res, a2res] = await Promise.all([
      fetch('./data/a1-sentences.json'),
      fetch('./data/a2-sentences.json')
    ]);
    const a1 = await a1res.json();
    const a2 = await a2res.json();
    allSentences = [...a1, ...a2];
  } catch(e) {
    allSentences = [
      {id:"s_a1_001",sentence:"Bonjour, je m'appelle Marie.",words:["Bonjour,","je","m'appelle","Marie."],translation_tr:"Merhaba, benim adım Marie.",translation_en:"Hello, my name is Marie.",level:"A1",topic:"introductions"},
      {id:"s_a1_002",sentence:"J'habite à Paris.",words:["J'habite","à","Paris."],translation_tr:"Paris'te oturuyorum.",translation_en:"I live in Paris.",level:"A1",topic:"places"},
      {id:"s_a1_005",sentence:"Je voudrais un café, s'il vous plaît.",words:["Je","voudrais","un","café,","s'il","vous","plaît."],translation_tr:"Bir kahve istiyorum, lütfen.",translation_en:"I would like a coffee, please.",level:"A1",topic:"cafe"}
    ];
  }
}

function getFilteredSentences() {
  if (pronFilter === 'all') return allSentences;
  return allSentences.filter(s => s.level === pronFilter.toUpperCase());
}

// ─── GOOGLE TTS URL ───
function getTTSUrl(text, lang = 'fr', slow = false) {
  const speed = slow ? '0.4' : '1';
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&ttsspeed=${speed}&client=tw-ob`;
}

// ─── RENDER PRONUNCIATION PAGE ───
function renderPronunciation() {
  const page = document.getElementById('page-pronunciation');
  if (!page) return;

  // Use saved settings or defaults
  if (!currentVoice) currentVoice = AppState.settings.voice || 'female';
  if (!currentSpeed) currentSpeed = AppState.settings.speed || 'normal';

  const sentences = getFilteredSentences();

  page.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">${t('pronunciation.title')}</h1>
      <p class="section-subtitle">${t('pronunciation.subtitle')}</p>
    </div>

    <div class="pron-filters">
      <div class="pron-filter-row">
        ${['all','a1','a2'].map(f => `
          <button class="chip ${pronFilter === f ? 'active' : ''}" onclick="setPronFilter('${f}')">
            ${t('pronunciation.level_' + f)}
          </button>
        `).join('')}
      </div>
      <div class="pron-filter-row">
        <button class="audio-chip ${currentVoice === 'male' ? 'active' : ''}" onclick="setVoice('male')">
          🧔 ${t('pronunciation.male')}
        </button>
        <button class="audio-chip ${currentVoice === 'female' ? 'active' : ''}" onclick="setVoice('female')">
          👩 ${t('pronunciation.female')}
        </button>
        <button class="audio-chip ${currentSpeed === 'normal' ? 'active' : ''}" onclick="setSpeed('normal')">
          ▶️ ${t('pronunciation.normal')}
        </button>
        <button class="audio-chip ${currentSpeed === 'slow' ? 'active' : ''}" onclick="setSpeed('slow')">
          🐢 ${t('pronunciation.slow')}
        </button>
      </div>
    </div>

    <div class="sentence-list">
      ${sentences.map(s => renderSentenceCard(s)).join('')}
    </div>
  `;
}

function setPronFilter(f) {
  pronFilter = f;
  renderPronunciation();
}

function setVoice(v) {
  currentVoice = v;
  renderPronunciation();
}

function setSpeed(s) {
  currentSpeed = s;
  renderPronunciation();
}

// ─── RENDER SENTENCE CARD ───
function renderSentenceCard(s) {
  const srData = AppState.progress.sentences[s.id];
  const due = isDue(srData);
  const learned = srData && srData.reps > 0 && !due;

  return `
    <div class="sentence-card" id="card-${s.id}">
      <div class="sentence-card-header">
        <span class="sentence-level-badge">${s.level}</span>
        <span class="sentence-topic">${s.topic || ''}</span>
      </div>

      <div class="sentence-text-area">
        <div class="sentence-words" id="words-${s.id}">
          ${s.words.map((w, i) => `
            <span class="word-token" id="word-${s.id}-${i}">${w}</span>
          `).join('')}
        </div>
        <div class="audio-progress" id="progress-${s.id}">
          <div class="audio-progress-fill" id="progress-fill-${s.id}"></div>
        </div>
      </div>

      <div class="translation-area" id="trans-area-${s.id}">
        <div class="translation-text" id="trans-${s.id}">
          ${AppState.settings.language === 'tr' ? s.translation_tr : s.translation_en}
        </div>
      </div>

      <div class="sentence-actions">
        <button class="translation-toggle-btn" onclick="toggleTranslation('${s.id}')">
          👁️ <span id="trans-toggle-label-${s.id}">${t('pronunciation.showTranslation')}</span>
        </button>
        <div class="sr-indicator">
          <div class="sr-dot ${due ? 'due' : ''} ${learned ? 'learned' : ''}"></div>
          <span style="font-size:0.68rem;color:var(--gray-400)">
            ${learned ? '✓' : due ? t('pronunciation.due') : ''}
          </span>
        </div>
      </div>

      <div class="audio-controls">
        <button class="audio-play-btn" id="play-${s.id}" onclick="playSentence('${s.id}')">
          ▶
        </button>
        <div class="audio-controls-right">
          <div style="font-size:0.75rem;color:var(--gray-600);font-weight:500" id="play-status-${s.id}">
            ${s.sentence.length > 50 ? s.sentence.substring(0,50) + '...' : s.sentence}
          </div>
          <div class="audio-option-row">
            <button class="audio-chip ${currentVoice === 'male' ? 'active' : ''}" onclick="playWithSettings('${s.id}','male',currentSpeed)">
              🧔 ${t('pronunciation.male')}
            </button>
            <button class="audio-chip ${currentVoice === 'female' ? 'active' : ''}" onclick="playWithSettings('${s.id}','female',currentSpeed)">
              👩 ${t('pronunciation.female')}
            </button>
            <button class="audio-chip ${currentSpeed === 'slow' ? 'active' : ''}" onclick="toggleSpeed('${s.id}')">
              🐢 ${currentSpeed === 'slow' ? t('pronunciation.slow') : t('pronunciation.normal')}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── TRANSLATION TOGGLE ───
function toggleTranslation(sentenceId) {
  const trans = document.getElementById(`trans-${sentenceId}`);
  const label = document.getElementById(`trans-toggle-label-${sentenceId}`);
  if (!trans) return;
  const visible = trans.classList.toggle('visible');
  if (label) label.textContent = visible ? t('pronunciation.hideTranslation') : t('pronunciation.showTranslation');
}

// ─── PLAY AUDIO ───
function playSentence(sentenceId) {
  playWithSettings(sentenceId, currentVoice, currentSpeed);
}

function toggleSpeed(sentenceId) {
  currentSpeed = currentSpeed === 'slow' ? 'normal' : 'slow';
  renderPronunciation();
}

function playWithSettings(sentenceId, voice, speed) {
  const sentence = allSentences.find(s => s.id === sentenceId);
  if (!sentence) return;

  // Stop existing audio
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }

  // Reset all play buttons
  document.querySelectorAll('.audio-play-btn').forEach(btn => {
    btn.classList.remove('playing');
    btn.textContent = '▶';
  });

  const isSlow = speed === 'slow';

  // Build TTS URL — Google Translate TTS
  // For male voice we use a different locale approach
  const lang = voice === 'male' ? 'fr-FR' : 'fr';
  const ttsUrl = getTTSUrl(sentence.sentence, 'fr', isSlow);

  const playBtn = document.getElementById(`play-${sentenceId}`);
  const statusEl = document.getElementById(`play-status-${sentenceId}`);

  if (playBtn) { playBtn.classList.add('playing'); playBtn.textContent = '⏸'; }
  if (statusEl) statusEl.textContent = t('pronunciation.playing');

  // Use Web Speech API for word-by-word highlighting
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(sentence.sentence);
    utter.lang = 'fr-FR';
    utter.rate = isSlow ? 0.5 : 1.0;

    // Try to pick voice
    const voices = window.speechSynthesis.getVoices();
    const frVoices = voices.filter(v => v.lang.startsWith('fr'));
    if (frVoices.length > 0) {
      if (voice === 'male') {
        const maleV = frVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('thomas') || v.name.toLowerCase().includes('nicolas'));
        utter.voice = maleV || frVoices[frVoices.length - 1];
      } else {
        const femaleV = frVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('amelie') || v.name.toLowerCase().includes('marie') || v.name.toLowerCase().includes('aurelie'));
        utter.voice = femaleV || frVoices[0];
      }
    }

    // Word boundary highlight
    const words = sentence.words;
    let wordIndex = 0;

    utter.onboundary = (event) => {
      if (event.name === 'word') {
        // Clear previous highlights
        words.forEach((_, i) => {
          const el = document.getElementById(`word-${sentenceId}-${i}`);
          if (el) { el.classList.remove('highlighted'); el.classList.add('played'); }
        });
        if (wordIndex < words.length) {
          const el = document.getElementById(`word-${sentenceId}-${wordIndex}`);
          if (el) {
            el.classList.remove('played');
            el.classList.add('highlighted');
          }
          // Progress bar
          const fill = document.getElementById(`progress-fill-${sentenceId}`);
          if (fill) fill.style.width = `${((wordIndex + 1) / words.length) * 100}%`;
          wordIndex++;
        }
      }
    };

    utter.onend = () => {
      if (playBtn) { playBtn.classList.remove('playing'); playBtn.textContent = '▶'; }
      if (statusEl) statusEl.textContent = sentence.sentence.length > 50 ? sentence.sentence.substring(0,50) + '...' : sentence.sentence;
      // Clear highlights
      words.forEach((_, i) => {
        const el = document.getElementById(`word-${sentenceId}-${i}`);
        if (el) { el.classList.remove('highlighted'); }
      });
      const fill = document.getElementById(`progress-fill-${sentenceId}`);
      if (fill) fill.style.width = '0%';

      // SR update
      updateSentenceSR(sentenceId);
    };

    utter.onerror = () => {
      if (playBtn) { playBtn.classList.remove('playing'); playBtn.textContent = '▶'; }
    };

    window.speechSynthesis.speak(utter);

  } else {
    // Fallback: Google TTS via audio element
    const audio = new Audio(ttsUrl);
    activeAudio = audio;

    audio.onended = () => {
      if (playBtn) { playBtn.classList.remove('playing'); playBtn.textContent = '▶'; }
      if (statusEl) statusEl.textContent = sentence.sentence;
      updateSentenceSR(sentenceId);
    };

    audio.onerror = () => {
      if (playBtn) { playBtn.classList.remove('playing'); playBtn.textContent = '▶'; }
      showToast('Ses yüklenemedi');
    };

    audio.play().catch(() => {
      if (playBtn) { playBtn.classList.remove('playing'); playBtn.textContent = '▶'; }
      showToast('Ses oynatılamadı');
    });
  }
}

// ─── SR FOR SENTENCES ───
function updateSentenceSR(sentenceId) {
  const existing = AppState.progress.sentences[sentenceId] || {};
  const result = sm2(existing, 4); // default "good" rating on listen
  AppState.progress.sentences[sentenceId] = { ...existing, ...result };
  saveState();
}

// Ensure voices are loaded
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}
