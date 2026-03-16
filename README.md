# 🇫🇷 Le Français — Fransızca Öğrenme Uygulaması

TCF sınavına uyumlu, mobil dostu Fransızca öğrenme uygulaması.

## Özellikler

- 📚 **Flashcards** — SM-2 algoritması ile spaced repetition
- 🎧 **Telaffuz** — Web Speech API ile kelime kelime highlight
- ⚙️ **Ayarlar** — Ses, hız, dil, günlük hedef
- 🌍 **TR / EN** — Çift dil desteği
- 📱 **Mobil uyumlu** — PWA olarak ana ekrana eklenebilir

## Kurulum

### 1. Pexels API Key Al
1. [pexels.com/api](https://www.pexels.com/api/) adresine git
2. Ücretsiz API key al
3. `index.html` dosyasında şunu değiştir:
```js
window.PEXELS_API_KEY = 'YOUR_PEXELS_API_KEY_HERE';
```

### 2. GitHub'a Yükle
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/francais-app.git
git push -u origin main
```

### 3. GitHub Pages Aç
1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **(root)**
4. **Save**
5. URL: `https://KULLANICI_ADI.github.io/francais-app`

## Dataset Genişletme

Yeni kelimeler için `data/a1-words.json` formatı:
```json
{
  "id": "a1_XXX",
  "word": "bonjour",
  "translation_tr": "merhaba",
  "translation_en": "hello",
  "phonetic": "bɔ̃.ʒuʁ",
  "category": "greetings",
  "level": "A1",
  "pexels_query": "greeting hello"
}
```

## Dosya Yapısı

```
francais-app/
├── index.html          # Ana sayfa
├── css/
│   ├── main.css        # Genel stiller
│   ├── flashcards.css  # Kart stilleri
│   ├── pronunciation.css
│   └── settings.css
├── js/
│   ├── i18n.js         # TR/EN çeviriler
│   ├── app.js          # Router, SM-2, state
│   ├── flashcards.js   # Flashcard modülü
│   ├── pronunciation.js # Telaffuz modülü
│   └── settings.js     # Ayarlar modülü
└── data/
    ├── a1-words.json
    ├── a2-words.json
    ├── a1-sentences.json
    └── a2-sentences.json
```

## Yol Haritası

- [ ] A1 500 kelime dataseti tamamlama
- [ ] A2 500 kelime dataseti
- [ ] 100 fiil dataseti
- [ ] Resimli flashcard görünümü geliştirme
- [ ] Offline PWA desteği (Service Worker)
- [ ] İstatistik grafikleri
