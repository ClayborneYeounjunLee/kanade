# Kanade (カナデ · 카나데)

> **A single-page web app for learning Hiragana and Katakana "as lightly as playing music"** — flashcard practice, 6-choice quizzes, focused review of missed characters, kana charts, pronunciation playback (TTS), an activity heatmap ("grass"), and error-rate statistics. Usable without signing in, with automatic cloud sync when you sign in with Google.

🔗 **Live link:** https://clayborneyeounjunlee.github.io/kanade/
📦 **Repository:** https://github.com/ClayborneYeounjunLee/kanade

---

## ✨ Key Features

- **🃏 Practice (flashcards):** Selected parts shown one card at a time in random order. Tap a card to reveal the answer, then self-grade with "Got it / Didn't know."
- **❓ Quiz (6-choice with distractors):** Pick one of 6 options. Enabling `hard mode` adds a 3/5/7-second time limit; running out of time counts as a wrong answer.
- **🔁 Review (Remind):** Automatically collects only the characters **studied 3+ times with an error rate of 30% or higher**, sorted by highest error rate for focused review (choose cards or quiz).
- **3 question formats:** `character → pronunciation`, `pronunciation → character`, `random mix`.
- **Study part selection:** For Hiragana / Katakana, combine any of **seion (basic), dakuon, handakuon, and yoon**.
- **📖 Kana charts:** Browse the gojuon (46), dakuon (20), handakuon (5), and yoon (33) as character/pronunciation tables. Toggle hint display.
- **🔊 Pronunciation playback (TTS):** In the charts, **tap a character to hear its pronunciation in a Japanese (ja-JP) voice** (Web Speech API).
- **📊 My Page statistics:** Total cards studied, overall accuracy, days studied, study streak, **activity heatmap for the last 17 weeks**, and **per-character error-rate heatmap**.
- **🌐 Multilingual (KO/EN):** Korean ↔ English toggle. Automatically selected from the browser language on first visit.
- **🌙 Dark mode:** Auto-detects the system setting plus a manual toggle; the choice is saved.
- **☁️ Dual storage for signed-in/guest use:** With Google sign-in, data syncs to Firestore in the cloud (continue across phone and PC); without signing in, data is saved only to this device's `localStorage`.
- **🖨️ (Aside) About the layout:** The app itself actually lives in a single file, `가나_암기카드.html`, and `index.html` is an entry point that automatically redirects to that page.

---

## 🧱 Tech Stack / Languages

| Category | Details |
|---|---|
| **Languages** | Pure **HTML + CSS + JavaScript (ES modules)** — **no** frameworks, bundlers, or build tools |
| **Structure** | A single HTML file (`가나_암기카드.html`) with inline `<style>` and `<script type="module">`. No separate `.js`/`.css` files |
| **JS modules** | Top-level script is `<script type="module">`. Firebase is lazy-loaded via **dynamic `import()`** |
| **Firebase SDK** | **v12.14.0** — `firebase-app.js` / `firebase-auth.js` / `firebase-firestore.js` loaded as ESM from `https://www.gstatic.com/firebasejs/12.14.0/` |
| **Auth** | Firebase Auth **Google sign-in** (`signInWithPopup`, with `signInWithRedirect` fallback when popups are blocked) |
| **DB** | **Cloud Firestore** (forced long polling + persistent local cache) |
| **Speech** | Built-in browser **Web Speech API** (`SpeechSynthesis`, `lang="ja-JP"`, `rate 0.85`) — not an external API |
| **Fonts** | System font stack only (no web font downloads). Body: `Pretendard`→`Apple SD Gothic Neo`→`Malgun Gothic`→`Noto Sans KR`; kana: `Yu Gothic UI`→`Yu Gothic`→`Meiryo`→`Hiragino Kaku Gothic ProN`→`Noto Sans JP` |
| **Icons/favicon** | App icon `icon-180.png` (Apple touch icon); favicon is an inline SVG data URI (`カ` on a vermilion background) |
| **Styling** | Light/dark themes built on CSS custom properties (variables). Responsive (max-width 520px, notch support via `env(safe-area-inset-*)`) |
| **PWA-ish meta** | `apple-mobile-web-app-capable`, `theme-color`, `viewport-fit=cover`, etc. for add-to-home-screen support (note: **no service worker or manifest.json**) |

> The Firebase SDK is the only CDN library. No jQuery, React, or the like is used.

---

## 🏗️ System Architecture

### File entry flow
```
index.html  ──(location.replace + meta refresh)──▶  가나_암기카드.html  (the actual app)
```
`index.html` (13 lines) is a redirect stub that immediately sends you to `가나_암기카드.html`, and also provides a manual link for environments where JS is blocked.

### Single-file SPA — "screen switching" routing
- Instead of URL routing, it works by **showing/hiding 9 `<div id="screen-*">` elements**.
  ```
  loading · auth · home · study · practice · quiz · result · charts · mypage
  ```
- `showScreen(name)` keeps only the target screen, toggles `.hidden` on the rest, and scrolls to the top.
- `visible(name)` determines the current screen for conditional rendering.

### Boot sequence (initialization block at the bottom of the file)
1. `restoreSetup()` — restore saved study settings
2. `applyLang(L)` — apply language (based on browser language / saved value)
3. `showScreen("loading")` — loading screen
4. `initFirebase()` — if the Firebase config is valid, dynamically load the 3 SDK modules
   - Success → subscribe to `onAuthStateChanged`: if there is a user, `startCloud()`; if not and the previous mode was guest, `startGuest()`; otherwise show the sign-in screen
   - Failure/unconfigured → sign-in button disabled + setup notice (`setup-notice`) shown; guest mode remains usable
   - An inline script in `<head>` **applies the theme first to prevent FOUC** (saved value or OS dark setting)

### Core modules and functions
| Area | Functions |
|---|---|
| Firebase boot | `initFirebase()` |
| Data layer/persistence | `freshProfile`, `legacyProfile`, `scheduleSave`, `flushSave`, `record` |
| Sign-in | `startGuest`, `startCloud`, `applyCloud`, `profileFromSeed`, `syncFromCloud` |
| Home | `enterApp`, `calcStreak`, `calcTotals` |
| Study hub | `openStudy`, `renderStudyHub`, `renderParts`, `selectedCards`, `updateCount` |
| Session engine | `startSession` (shared deck creation/shuffle for practice/quiz) |
| Practice | `renderPractice`, `revealPractice`, `gradePractice`, `nextCard` |
| Quiz | `renderQuiz`, `buildOptions` (generates 6 answer options), `answerQuiz`, `startTimer`/`clearTimer` |
| Results | `showResult`, `chipHtml` |
| Review | `remindCards`, `renderReview` |
| TTS | `pickJaVoice`, `speak` |
| Kana charts | `renderCharts`, `chartSections` |
| My Page | `renderMypage`, `heatCell` (activity/error-rate heatmaps) |
| i18n/theme | `applyLang`, `applyStaticLang`, `applyTheme`, `setTheme` |

### State management approach
**Lightweight imperative state** managed with global variables plus a `session` object (no framework reactivity). Key globals:

| Variable | Meaning |
|---|---|
| `mode` | `"cloud"` \| `"guest"` |
| `uid` / `userEmail` / `photoURL` | Signed-in user info |
| `profile` | User study data `{ nick, created, stats, activity }` |
| `session` | Session in progress (`kind`, `deck`, `idx`, `wrong`, `correctCount`, etc.) |
| `partsSel` / `studyMode` / `studyTab` / `hardLimit` | Study settings |
| `L` | Current language (`"ko"`/`"en"`) |

Rendering is mostly `innerHTML` string assembly + `addEventListener`. Repeated UI such as tables and options uses **event delegation** so it keeps working after re-renders.

---

## 🗂️ Data

### Where it lives and in what structure
The kana data is a set of **arrays hard-coded inside the file**. The source format is arrays of `[character, romaji, Korean, (note)]`, which `mk()` converts into objects `{ char, roma, kor, note, cat }` stored in `POOLS`. Katakana is not separate data — it is **derived automatically from Hiragana via a Unicode offset (+0x60)** (`toKata`/`deriveKata`).

### Counts per part (104 characters per script × Hira/Kata = 208 cards total)
| POOLS key | Part | Count (each) |
|---|---|---|
| `hira` / `kata` | Seion (gojuon) | 46 |
| `hiraDaku` / `kataDaku` | Dakuon | 20 |
| `hiraHandaku` / `kataHandaku` | Handakuon | 5 |
| `hiraYoon` / `kataYoon` | Yoon | 33 |
| — | **Subtotal per script** | **104 (× Hira/Kata = 208)** |

`FULL_POOL = Object.values(POOLS).flat()` builds the full pool.

### Card object schema
```js
{ char: "し", roma: "shi", kor: "시", note: "", cat: "hira" }  // kor: Korean reading ("시" = "shi")
// Special note examples: を → note "조사 '~을/를' 전용" (used only as the object particle),
//                        ん → "받침 소리 (ㄴ/ㅁ/ㅇ)" (final-consonant sound: n/m/ng)
```

### Data definition example (actual snippet)
```js
const HIRA = [
  ["あ","a","아"],["い","i","이"],["う","u","우"],["え","e","에"],["お","o","오"],
  ...
  ["わ","wa","와"],["を","wo","오","조사 '~을/를' 전용"],["ん","n","응","받침 소리 (ㄴ/ㅁ/ㅇ)"]
];
// (Format: [character, romaji, Korean reading, optional Korean note] — the notes above mean
//  "used only as the object particle" and "final-consonant sound (n/m/ng)")
const toKata = s => s.replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
const KATA = deriveKata(HIRA);           // Hiragana → Katakana, derived automatically
```

The original Korean notes have English translations (for EN mode) provided via the `NOTE_TR` mapping.

### Study record (user data) schema
```js
profile = {
  nick: "이연준",              // display name (example: "Yeounjun Lee")
  created: "2026-07-01",       // start date (YYYY-MM-DD)
  stats: {                     // per-character exposure/miss counts
    "し": { s: 12, w: 3 }      // s = times seen, w = times wrong
  },
  activity: {                  // cards studied per day (for the activity heatmap)
    "2026-07-01": 24
  }
}
```
- **Study streak:** Computed by walking `activity` backwards from today and counting consecutive days.
- **Error-rate heatmap:** The `w/s` ratio is colored with HSL (green → red).
- **Review candidates:** `s >= 3 && w/s >= 0.3`.

---

## 💾 Storage / DB

Data is stored via two paths, with guest fallback and migration from older versions handled as well.

### 1) Google sign-in → Cloud Firestore
- **Firebase project:** `japanese-site-a0af9`
- **Collection / document:** `users/{uid}` — the entire `profile` stored in one document per signed-in user (`setDoc(..., { merge: true })`).
- **Save policy:** Rather than saving on every card, saves are **debounced by 2 seconds** (`scheduleSave`→`flushSave`). Flushed immediately on tab hide (`visibilitychange`), page unload (`pagehide`), and session end.
- **Connection hardening:** `experimentalForceLongPolling: true` (prevents stalls where streaming is blocked on GitHub Pages/mobile) + `persistentLocalCache` (offline cache). From the second sign-in on, the app **enters immediately** from cache (`getDocFromCache`) and syncs the latest server copy in the background.

#### Required Firestore security rules (recommended)
Restrict users to reading and writing **only their own document**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
Also, in the Firebase console, enable **Authentication → Google provider** and add `clayborneyeounjunlee.github.io` (and any local development domains) to **Authorized domains** so that popup/redirect sign-in works.

### 2) Not signed in (guest) → localStorage
Data is stored only on this device instead of the cloud.

| localStorage key | Purpose |
|---|---|
| `kanade-guest` | Guest user's study data (`profile` JSON) |
| `kanade-mode` | Last-used mode (`"cloud"` \| `"guest"`) — auto-enters on the next visit |
| `kanade-setup` | Study settings (selected parts, question format, hard mode, time limit) |
| `kanade-lang` | Language selection (`"ko"` \| `"en"`) |
| `kanade-theme` | Theme (`"dark"` \| `"light"`) |

> **Legacy migration:** Keys from older versions (`kana-users`, `kana-current`, `kana-settings`, `kana-setup2`) are cleaned up and deleted at startup, and data from the email-signup era (`kanade-users`) is imported once via `legacyProfile()`.

### Offline/fallback behavior
- If Firebase is unconfigured or the SDK fails to load: a notice appears on the sign-in screen, and the app remains **fully usable in guest mode**.
- If the server is slow to respond: the user is let in first (`profileFromSeed`), then `syncFromCloud` merges once the connection recovers. Because saves use `merge: true`, study done in the meantime is preserved.

---

## 🌐 External APIs · Dependencies

| Dependency | Purpose | Key required | Where it goes |
|---|---|---|---|
| **Firebase JS SDK v12.14.0** (gstatic CDN) | Auth/DB SDK | — | Dynamic import (`FB_VER` in code) |
| **Firebase Authentication (Google)** | Google sign-in | Web config required | `FIREBASE_CONFIG` object (top of file) |
| **Cloud Firestore** | Cloud storage of study records | Same config + security rules | Same |
| **Web Speech API** (`SpeechSynthesis`) | Character pronunciation (ja-JP) playback | **Not required** (built into browsers) | — |

- **No other external APIs are used** — no Kakao, TravelTime, exchange rates, Skyscanner, etc.
- TTS depends on the Japanese voices installed in the browser/OS. If no `ja-JP` voice is available, playback may not work.

> **The Firebase web config values (apiKey `AIza…`) included in the code are "public web config values."** They are project identifiers, not secret keys; actual security is enforced by **Firestore security rules**. The code comments state the same.

---

## ▶️ Running Locally

There is no build step at all. Just **serve it with any static server**. (Because of ES modules and dynamic imports, a local server is recommended over opening via `file://` directly.)

```bash
# From the repository root, use any static server
python -m http.server 8000
#   → http://localhost:8000/  (index.html redirects to the app)

# Or with Node
npx serve .
```

- There is no `package.json`, so there are no `npm install`/`npm run` scripts.
- To test Google sign-in as well, add `localhost` to **Authorized domains** in the Firebase console. Even before doing so, you can verify all features using "this device only (guest)" mode.

---

## 🚀 Deployment

Deployed via **GitHub Pages**.

1. In the GitHub repository, go to **Settings → Pages** and set the source branch to `main` (root).
2. Commit/push and it is published at `https://clayborneyeounjunlee.github.io/kanade/` (the root `index.html` redirects to the app).
3. To use Firebase features, add `clayborneyeounjunlee.github.io` to **Authentication → Authorized domains** in the Firebase console.

There is no separate server, CI, or build pipeline (static hosting).

---

## 📁 File Structure

```
kanade/
├── index.html          # Entry stub — auto-redirects to 가나_암기카드.html (JS + meta refresh)
├── 가나_암기카드.html   # App body ("kana flashcards"; single-file SPA): all HTML+CSS+ES-module JS included (~1,576 lines)
└── icon-180.png        # Apple touch icon (for add-to-home-screen)
```

> Note: The UI help text mentions `설정_가이드.md` (a "setup guide" doc), but it is not currently included in the repository (only the reference text exists).

### Logical layout inside `가나_암기카드.html`
```
<head>
 ├─ Inline script that applies the theme first (prevents FOUC)
 └─ <style> …light/dark themes based on CSS variables…
<body>
 ├─ 9 <div id="screen-*"> elements  (loading/auth/home/study/practice/quiz/result/charts/mypage)
 └─ <script type="module">
      ├─ FIREBASE_CONFIG + initFirebase()
      ├─ Kana data (HIRA/DAKU/HANDAKU/YOON → POOLS)
      ├─ Data layer (guest localStorage · cloud Firestore)
      ├─ Sign-in (Google/guest)
      ├─ Session engine (practice/quiz/review)
      ├─ TTS · kana charts · My Page (activity heatmap/error rates)
      ├─ Multilingual (KO/EN) · theme
      └─ Initialization boot sequence
```

---

## 🔗 Related Apps (moa hub · sibling apps)

The **◈ button** at the top of the home screen returns to **"moa,"** a personal app hub.

- **moa hub:** https://clayborneyeounjunlee.github.io/moa/

Kanade is one of the sibling single-file apps in that hub, sharing the same pattern (single HTML file, Firebase Google sign-in + Firestore sync, guest localStorage fallback, KO/EN, dark mode).
