# 카나데 (Kanade) · カ

> **히라가나 · 가타카나를 "연주하듯 가볍게" 익히는 단일 페이지 웹앱** — 플래시카드 연습 · 6지선다 퀴즈 · 오답 집중 복습 · 가나 표 · 발음 재생(TTS) · 잔디(활동 히트맵) · 오답률 통계를, 로그인 없이도 쓸 수 있고 Google 로그인 시 클라우드에 자동 동기화합니다.

🔗 **라이브 링크:** https://clayborneyeounjunlee.github.io/kanade/
📦 **저장소:** https://github.com/ClayborneYeounjunLee/kanade

---

## ✨ 주요 기능

- **🃏 연습(플래시카드):** 선택한 파트를 랜덤 순서로 한 장씩. 카드를 누르면 정답이 뜨고 "알았어요 / 몰랐어요"로 자가 채점.
- **❓ 퀴즈(6지선다+오답):** 6개 보기 중 하나 선택. `하드 모드`를 켜면 3·5·7초 제한시간이 붙고, 시간 초과 시 오답 처리.
- **🔁 복습(Remind):** **3회 이상 학습했는데 오답률 30% 이상**인 글자만 자동으로 모아, 오답률 높은 순으로 집중 복습(카드/퀴즈 선택).
- **출제 방식 3종:** `문자 → 발음`, `발음 → 문자`, `랜덤 믹스`.
- **학습 파트 선택:** 히라가나 / 가타카나 각각 **청음 · 탁음 · 반탁음 · 요음**을 조합 선택.
- **📖 가나 표:** 오십음도(46) · 탁음(20) · 반탁음(5) · 요음(33)을 문자표/발음표로 열람. 힌트 표시 토글.
- **🔊 발음 재생(TTS):** 표에서 **글자를 누르면 일본어(ja-JP) 음성으로 발음**을 들려줌 (Web Speech API).
- **📊 마이페이지 통계:** 총 학습 카드 · 전체 정답률 · 학습한 날 · 연속 학습일(streak), **최근 17주 활동 잔디(히트맵)**, **글자별 오답률 히트맵**.
- **🌐 다국어(KO/EN):** 한국어 ↔ English 토글. 첫 방문 시 브라우저 언어로 자동 선택.
- **🌙 다크 모드:** 시스템 설정 자동 감지 + 수동 토글, 선택값 저장.
- **☁️ 로그인/게스트 이중 저장:** Google 로그인 시 Firestore 클라우드 동기화(폰·PC 이어서), 비로그인 시 이 기기 `localStorage`에만 저장.
- **🖨️ (별도) 인쇄용:** 이 앱 자체는 실제로 `가나_암기카드.html` 한 파일에 담긴 웹앱이며, `index.html`은 그 페이지로 자동 리다이렉트하는 진입점입니다.

---

## 🧱 기술 스택 / 언어

| 구분 | 내용 |
|---|---|
| **언어** | 순수 **HTML + CSS + JavaScript(ES 모듈)** — 프레임워크·번들러·빌드 도구 **없음** |
| **구조** | 단일 HTML 파일(`가나_암기카드.html`)에 `<style>`·`<script type="module">` 인라인. 별도 `.js`/`.css` 없음 |
| **JS 모듈** | 최상위 스크립트가 `<script type="module">`. Firebase는 **동적 `import()`** 로 지연 로드 |
| **Firebase SDK** | **v12.14.0** — `firebase-app.js` / `firebase-auth.js` / `firebase-firestore.js`를 `https://www.gstatic.com/firebasejs/12.14.0/` 에서 ESM으로 로드 |
| **인증** | Firebase Auth **Google 로그인** (`signInWithPopup`, 팝업 차단 시 `signInWithRedirect` 폴백) |
| **DB** | **Cloud Firestore** (롱폴링 강제 + 영구 로컬 캐시) |
| **음성** | 브라우저 내장 **Web Speech API** (`SpeechSynthesis`, `lang="ja-JP"`, `rate 0.85`) — 외부 API 아님 |
| **폰트** | 시스템 폰트 스택만 사용(웹폰트 다운로드 없음). 본문 `Pretendard`→`Apple SD Gothic Neo`→`Malgun Gothic`→`Noto Sans KR`, 가나 `Yu Gothic UI`→`Yu Gothic`→`Meiryo`→`Hiragino Kaku Gothic ProN`→`Noto Sans JP` |
| **아이콘/파비콘** | 앱 아이콘 `icon-180.png`(애플 터치 아이콘), 파비콘은 인라인 SVG data-URI(주홍 배경 `カ`) |
| **스타일링** | CSS 커스텀 프로퍼티(변수) 기반 라이트/다크 테마. 반응형(max-width 520px, `env(safe-area-inset-*)`로 노치 대응) |
| **PWA성 메타** | `apple-mobile-web-app-capable`, `theme-color`, `viewport-fit=cover` 등 홈스크린 추가 대응(단, **서비스워커·manifest.json은 없음**) |

> CDN 라이브러리는 Firebase SDK가 유일합니다. jQuery·React 등은 사용하지 않습니다.

---

## 🏗️ 시스템 구조

### 파일 진입 흐름
```
index.html  ──(location.replace + meta refresh)──▶  가나_암기카드.html  (실제 앱)
```
`index.html`(13줄)은 즉시 `가나_암기카드.html`로 보내는 리다이렉트 스텁이며, JS가 막힌 환경을 위해 수동 링크도 제공합니다.

### 단일 파일 SPA — "화면 전환" 방식 라우팅
- URL 라우팅이 아니라, **9개의 `<div id="screen-*">` 를 보였다 숨겼다** 하는 방식입니다.
  ```
  loading · auth · home · study · practice · quiz · result · charts · mypage
  ```
- `showScreen(name)` 이 해당 스크린만 남기고 나머지에 `.hidden`을 토글하고 스크롤을 맨 위로 올립니다.
- `visible(name)` 로 현재 화면을 판별해 조건부 렌더링합니다.

### 부팅 시퀀스 (파일 하단 초기화 블록)
1. `restoreSetup()` — 저장된 학습 설정 복원
2. `applyLang(L)` — 언어 적용(브라우저 언어/저장값 기준)
3. `showScreen("loading")` — 로딩 화면
4. `initFirebase()` — Firebase 설정값이 유효하면 SDK 3종 동적 로드
   - 성공 → `onAuthStateChanged` 구독: 사용자 있으면 `startCloud()`, 없고 이전 모드가 게스트면 `startGuest()`, 아니면 로그인 화면
   - 실패/미설정 → 로그인 버튼 비활성 + 설정 안내(`setup-notice`) 노출, 게스트로는 이용 가능
   - `<head>`의 인라인 스크립트가 **FOUC 방지용으로 테마를 먼저 적용**(저장값 또는 OS 다크 설정)

### 핵심 모듈·함수
| 영역 | 함수 |
|---|---|
| Firebase 부트 | `initFirebase()` |
| 데이터 계층/저장 | `freshProfile`, `legacyProfile`, `scheduleSave`, `flushSave`, `record` |
| 로그인 | `startGuest`, `startCloud`, `applyCloud`, `profileFromSeed`, `syncFromCloud` |
| 홈 | `enterApp`, `calcStreak`, `calcTotals` |
| 학습 허브 | `openStudy`, `renderStudyHub`, `renderParts`, `selectedCards`, `updateCount` |
| 세션 엔진 | `startSession` (연습/퀴즈 공통 덱 생성·셔플) |
| 연습 | `renderPractice`, `revealPractice`, `gradePractice`, `nextCard` |
| 퀴즈 | `renderQuiz`, `buildOptions`(오답 보기 6개 생성), `answerQuiz`, `startTimer`/`clearTimer` |
| 결과 | `showResult`, `chipHtml` |
| 복습 | `remindCards`, `renderReview` |
| TTS | `pickJaVoice`, `speak` |
| 가나 표 | `renderCharts`, `chartSections` |
| 마이페이지 | `renderMypage`, `heatCell` (잔디·오답률 히트맵) |
| 다국어/테마 | `applyLang`, `applyStaticLang`, `applyTheme`, `setTheme` |

### 상태 관리 방식
전역 변수 + `session` 객체로 관리하는 **경량 명령형 상태**(프레임워크 리액티비티 없음). 주요 전역:

| 변수 | 의미 |
|---|---|
| `mode` | `"cloud"` \| `"guest"` |
| `uid` / `userEmail` / `photoURL` | 로그인 사용자 정보 |
| `profile` | 사용자 학습 데이터 `{ nick, created, stats, activity }` |
| `session` | 진행 중 세션(`kind`, `deck`, `idx`, `wrong`, `correctCount` 등) |
| `partsSel` / `studyMode` / `studyTab` / `hardLimit` | 학습 설정 |
| `L` | 현재 언어(`"ko"`/`"en"`) |

렌더링은 대부분 `innerHTML` 문자열 조립 + `addEventListener`. 표·옵션 등 반복 UI에는 **이벤트 위임**을 사용해 다시 그려도 동작하게 했습니다.

---

## 🗂️ 데이터

### 어디에, 어떤 자료구조로
가나 데이터는 **파일 안에 하드코딩된 배열**입니다. 원본은 `[문자, 로마자, 한글, (비고)]` 형태의 배열이며, `mk()`가 이를 객체 `{ char, roma, kor, note, cat }` 로 변환해 `POOLS`에 담습니다. 가타카나는 별도 데이터가 아니라 **히라가나에서 유니코드 오프셋(+0x60)으로 자동 변환**(`toKata`/`deriveKata`)합니다.

### 파트별 개수 (한쪽 104자 × 히라/가타 = 총 208장)
| POOLS 키 | 파트 | 개수(각) |
|---|---|---|
| `hira` / `kata` | 청음(오십음도) | 46 |
| `hiraDaku` / `kataDaku` | 탁음 | 20 |
| `hiraHandaku` / `kataHandaku` | 반탁음 | 5 |
| `hiraYoon` / `kataYoon` | 요음 | 33 |
| — | **한쪽 합계** | **104 (× 히라·가타 = 208)** |

`FULL_POOL = Object.values(POOLS).flat()` 로 전체 풀을 만듭니다.

### 카드 객체 스키마
```js
{ char: "し", roma: "shi", kor: "시", note: "", cat: "hira" }
// 특수 비고 예: を → note "조사 '~을/를' 전용", ん → "받침 소리 (ㄴ/ㅁ/ㅇ)"
```

### 데이터 정의 예시 (실제 스니펫)
```js
const HIRA = [
  ["あ","a","아"],["い","i","이"],["う","u","우"],["え","e","에"],["お","o","오"],
  ...
  ["わ","wa","와"],["を","wo","오","조사 '~을/를' 전용"],["ん","n","응","받침 소리 (ㄴ/ㅁ/ㅇ)"]
];
const toKata = s => s.replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
const KATA = deriveKata(HIRA);           // 히라가나 → 가타카나 자동 파생
```

비고(note) 한국어 원문은 `NOTE_TR` 매핑으로 영어 번역(EN 모드용)을 제공합니다.

### 학습 기록(사용자 데이터) 스키마
```js
profile = {
  nick: "이연준",              // 표시 이름
  created: "2026-07-01",       // 시작일 (YYYY-MM-DD)
  stats: {                     // 글자별 노출/오답 카운트
    "し": { s: 12, w: 3 }      // s=본 횟수, w=틀린 횟수
  },
  activity: {                  // 날짜별 학습 장수 (잔디용)
    "2026-07-01": 24
  }
}
```
- **연속 학습일(streak):** `activity`를 오늘부터 거꾸로 훑어 연속 일수 계산.
- **오답률 히트맵:** `w/s` 비율을 HSL 색으로(초록→빨강) 칠함.
- **복습 대상:** `s >= 3 && w/s >= 0.3`.

---

## 💾 저장소 / DB

두 갈래로 저장하며, 게스트 폴백과 예전 버전 마이그레이션까지 처리합니다.

### 1) Google 로그인 → Cloud Firestore
- **Firebase 프로젝트:** `japanese-site-a0af9`
- **컬렉션 / 문서:** `users/{uid}` — 로그인 사용자당 문서 1개에 `profile` 전체 저장(`setDoc(..., { merge: true })`).
- **저장 정책:** 카드마다 저장하지 않고 **2초 디바운스**(`scheduleSave`→`flushSave`). 탭 숨김(`visibilitychange`)·페이지 이탈(`pagehide`)·세션 종료 시 즉시 flush.
- **연결 안정화:** `experimentalForceLongPolling: true` (GitHub Pages·모바일에서 스트리밍이 막혀 멈추는 것 방지) + `persistentLocalCache`(오프라인 캐시). 두 번째 로그인부터는 캐시(`getDocFromCache`)로 **즉시 입장** 후 백그라운드에서 서버 최신본 동기화.

#### 필요한 Firestore 보안 규칙(권장)
사용자가 **자신의 문서만** 읽고 쓰도록 제한하세요:
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
그리고 Firebase 콘솔에서 **Authentication → Google 공급자 활성화** 및 **승인된 도메인**에 `clayborneyeounjunlee.github.io`(및 로컬 개발 도메인)를 추가해야 팝업/리다이렉트 로그인이 동작합니다.

### 2) 비로그인(게스트) → localStorage
클라우드 대신 이 기기에만 저장합니다.

| localStorage 키 | 용도 |
|---|---|
| `kanade-guest` | 게스트 사용자의 학습 데이터(`profile` JSON) |
| `kanade-mode` | 마지막 접속 모드(`"cloud"` \| `"guest"`) — 다음 방문 자동 진입 |
| `kanade-setup` | 학습 설정(선택 파트·출제방식·하드모드·제한시간) |
| `kanade-lang` | 언어 선택(`"ko"` \| `"en"`) |
| `kanade-theme` | 테마(`"dark"` \| `"light"`) |

> **레거시 마이그레이션:** 예전 버전 키(`kana-users`, `kana-current`, `kana-settings`, `kana-setup2`)는 시작 시 정리·삭제하고, 이메일 가입 시절 데이터(`kanade-users`)는 `legacyProfile()`로 한 번만 가져옵니다.

### 오프라인/폴백 동작
- Firebase 미설정 또는 SDK 로드 실패 시: 로그인 화면에서 안내를 띄우고 **게스트 모드로는 정상 이용** 가능.
- 서버 응답 지연 시: 우선 진입시킨 뒤(`profileFromSeed`) `syncFromCloud`로 연결 회복 후 병합. `merge: true` 저장이라 그동안의 학습도 보존됩니다.

---

## 🌐 외부 API · 의존성

| 의존성 | 용도 | 키 필요 | 넣는 위치 |
|---|---|---|---|
| **Firebase JS SDK v12.14.0** (gstatic CDN) | 인증·DB SDK | — | 동적 import (코드 내 `FB_VER`) |
| **Firebase Authentication (Google)** | Google 로그인 | 웹 config 필요 | `FIREBASE_CONFIG` 객체(파일 상단) |
| **Cloud Firestore** | 학습 기록 클라우드 저장 | 위 config + 보안규칙 | 동일 |
| **Web Speech API** (`SpeechSynthesis`) | 글자 발음(ja-JP) 재생 | **불필요**(브라우저 내장) | — |

- Kakao / TravelTime / 환율 / Skyscanner 등 **다른 외부 API는 사용하지 않습니다.**
- TTS는 브라우저·OS에 설치된 일본어 음성에 의존합니다. `ja-JP` 음성이 없으면 재생되지 않을 수 있습니다.

> **Firebase 웹 설정값(apiKey `AIza…`)은 코드에 포함된 "공개 웹 설정값"**입니다. 이는 비밀키가 아니라 프로젝트 식별자이며, 실제 보안은 **Firestore 보안 규칙**이 담당합니다. 코드 주석에도 동일하게 명시되어 있습니다.

---

## ▶️ 로컬 실행 방법

빌드 과정이 전혀 없습니다. **정적 서버로 열기만** 하면 됩니다. (ES 모듈·동적 import 때문에 `file://` 직접 열기보다 로컬 서버 권장.)

```bash
# 저장소 루트에서 아무 정적 서버나 사용
python -m http.server 8000
#   → http://localhost:8000/  (index.html이 앱으로 리다이렉트)

# 또는 Node
npx serve .
```

- `package.json`이 없으므로 `npm install`/`npm run` 스크립트는 없습니다.
- Google 로그인까지 테스트하려면 Firebase 콘솔의 **승인된 도메인**에 `localhost`를 추가하세요. 추가 전에도 "이 기기에서만 쓰기(게스트)"로 전체 기능을 확인할 수 있습니다.

---

## 🚀 배포

**GitHub Pages** 로 배포됩니다.

1. GitHub 저장소 → **Settings → Pages** 에서 소스 브랜치를 `main`(루트)로 지정.
2. 커밋/푸시하면 `https://clayborneyeounjunlee.github.io/kanade/` 에 게시(루트 `index.html`이 앱으로 리다이렉트).
3. Firebase 기능을 쓰려면 Firebase 콘솔 **Authentication → 승인된 도메인**에 `clayborneyeounjunlee.github.io` 추가.

별도 서버·CI·빌드 파이프라인은 없습니다(정적 호스팅).

---

## 📁 파일 구조

```
kanade/
├── index.html          # 진입 스텁 — 가나_암기카드.html로 자동 리다이렉트(JS + meta refresh)
├── 가나_암기카드.html   # 앱 본체(단일 파일 SPA): HTML+CSS+ES모듈 JS 전부 포함 (약 1,576줄)
└── icon-180.png        # 애플 터치 아이콘(홈스크린 추가용)
```

> 참고: UI 안내 문구에 `설정_가이드.md`가 언급되지만, 현재 저장소에는 포함되어 있지 않습니다(안내 텍스트만 존재).

### `가나_암기카드.html` 내부 논리 구성
```
<head>
 ├─ 테마 선적용 인라인 스크립트(FOUC 방지)
 └─ <style> …CSS 변수 기반 라이트/다크 테마…
<body>
 ├─ 9개 <div id="screen-*">  (loading/auth/home/study/practice/quiz/result/charts/mypage)
 └─ <script type="module">
      ├─ FIREBASE_CONFIG + initFirebase()
      ├─ 가나 데이터(HIRA/DAKU/HANDAKU/YOON → POOLS)
      ├─ 데이터 계층(게스트 localStorage · 클라우드 Firestore)
      ├─ 로그인(Google/게스트)
      ├─ 세션 엔진(연습/퀴즈/복습)
      ├─ TTS · 가나 표 · 마이페이지(잔디/오답률)
      ├─ 다국어(KO/EN) · 테마
      └─ 초기화 부트 시퀀스
```

---

## 🔗 관련 앱 (모아 허브 · 형제 앱)

홈 상단의 **◈ 버튼**은 개인 앱 허브 **"모아(moa)"** 로 돌아갑니다.

- **모아 허브:** https://clayborneyeounjunlee.github.io/moa/

카나데는 그 허브에 속한 형제 단일 파일 앱 중 하나로, 동일한 패턴(단일 HTML · Firebase Google 로그인 + Firestore 동기화 · 게스트 localStorage 폴백 · KO/EN · 다크 모드)을 공유합니다.
