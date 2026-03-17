function renderSettings() {
  const page = document.getElementById('page-settings');
  if (!page) return;

  const s = AppState.settings;
  const p = AppState.progress;

  const totalCards = allWords.length;
  const learnedCards = Object.values(p.cards).filter(c => c.reps > 0 && !isDue(c)).length;
  const studyDays = p.studyDays.size;

  const totalRatings = Object.values(p.cards).reduce((acc, c) => acc + (c.reps || 0), 0);
  const easyRatings = Object.values(p.cards).reduce((acc, c) => acc + (c.easy || 0), 0);
  const accuracy = totalRatings > 0 ? Math.round((easyRatings / totalRatings) * 100) : 0;

  page.innerHTML = `
    <div class="section-header">
      <h1 class="section-title">${t('settings.title')}</h1>
      <p class="section-subtitle">${t('settings.subtitle')}</p>
    </div>

    <div class="settings-list">

      <!-- PRONUNCIATION -->
      <div class="settings-group">
        <div class="settings-group-title">${t('settings.pronunciation')}</div>

        <div class="settings-item">
          <div class="settings-item-left">
            <div class="settings-icon">🎙️</div>
            <div>
              <div class="settings-label">${t('settings.defaultVoice')}</div>
            </div>
          </div>
          <select class="settings-select" onchange="updateSetting('voice', this.value)">
            <option value="female" ${s.voice === 'female' ? 'selected' : ''}>${t('settings.female')}</option>
            <option value="male" ${s.voice === 'male' ? 'selected' : ''}>${t('settings.male')}</option>
          </select>
        </div>

        <div class="settings-item">
          <div class="settings-item-left">
            <div class="settings-icon">🐢</div>
            <div>
              <div class="settings-label">${t('settings.defaultSpeed')}</div>
            </div>
          </div>
          <select class="settings-select" onchange="updateSetting('speed', this.value)">
            <option value="normal" ${s.speed === 'normal' ? 'selected' : ''}>${t('settings.normal')}</option>
            <option value="slow" ${s.speed === 'slow' ? 'selected' : ''}>${t('settings.slow')}</option>
          </select>
        </div>

        <div class="settings-item">
          <div class="settings-item-left">
            <div class="settings-icon">▶️</div>
            <div>
              <div class="settings-label">${t('settings.autoPlay')}</div>
              <div class="settings-desc">${t('settings.autoPlayDesc')}</div>
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${s.autoPlay ? 'checked' : ''} onchange="updateSetting('autoPlay', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>

        <div class="settings-item">
          <div class="settings-item-left">
            <div class="settings-icon">🔤</div>
            <div>
              <div class="settings-label">${t('settings.showPhonetic')}</div>
              <div class="settings-desc">${t('settings.showPhoneticDesc')}</div>
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${s.showPhonetic ? 'checked' : ''} onchange="updateSetting('showPhonetic', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- STUDY -->
      <div class="settings-group">
        <div class="settings-group-title">${t('settings.study')}</div>

        <div class="settings-item">
          <div class="settings-item-left">
            <div class="settings-icon">🎯</div>
            <div>
              <div class="settings-label">${t('settings.dailyGoal')}</div>
            </div>
          </div>
          <div class="range-wrapper">
            <input type="range" min="5" max="50" step="5" value="${s.dailyGoal}"
              oninput="updateSetting('dailyGoal', parseInt(this.value)); document.getElementById('goal-val').textContent = this.value">
            <span class="range-value" id="goal-val">${s.dailyGoal}</span>
          </div>
        </div>
      </div>

      <!-- LANGUAGE -->
      <div class="settings-group">
        <div class="settings-group-title">${t('settings.language')}</div>
        <div class="settings-item">
          <div class="settings-item-left">
            <div class="settings-icon">🌍</div>
            <div>
              <div class="settings-label">${t('settings.appLanguage')}</div>
            </div>
          </div>
          <select class="settings-select" onchange="setLanguage(this.value)">
            <option value="tr" ${s.language === 'tr' ? 'selected' : ''}>Türkçe</option>
            <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
          </select>
        </div>
      </div>

      <!-- PROGRESS -->
      <div class="settings-group">
        <div class="settings-group-title">${t('settings.progress')}</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card-num">${totalCards}</div>
            <div class="stat-card-label">${t('settings.totalCards')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num" style="color:var(--success)">${learnedCards}</div>
            <div class="stat-card-label">${t('settings.learnedCards')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num" style="color:var(--gold)">${studyDays}</div>
            <div class="stat-card-label">${t('settings.studyDays')}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-num" style="color:var(--blue)">${accuracy}%</div>
            <div class="stat-card-label">${t('settings.accuracy')}</div>
          </div>
        </div>
        <div style="padding:0 16px 16px">
          <button class="danger-btn" onclick="confirmReset()">
            🗑️ ${t('settings.resetProgress')}
          </button>
        </div>
      </div>

    </div>

    <div class="version-badge">${t('settings.version')}</div>
  `;
}

function updateSetting(key, value) {
  AppState.settings[key] = value;
  saveState();
  if (key === 'showPhonetic') renderSettings();
}

function confirmReset() {
  const msg = t('settings.resetConfirm');
  if (confirm(msg)) {
    AppState.progress.cards = {};
    AppState.progress.sentences = {};
    AppState.progress.studyDays = new Set();
    AppState.progress.totalSessions = 0;
    saveState();
    renderSettings();
    showToast('✓ Sıfırlandı');
  }
}
