window.__KANADE_DATA = (function(){
/* kanade-duo-data.js
   카나데 원본(kanade/가나_암기카드.html)에서 그대로 이식한 데이터 · 유틸 모듈.
   가나 데이터, KO/EN 번역, 오십음도 레이아웃, 복습 기준, 데모 프로필 생성기. */

/* ═════════ 가나 데이터: [문자, 로마자, 한글, 비고] (원본 그대로) ═════════ */
const HIRA = [
  ["あ","a","아"],["い","i","이"],["う","u","우"],["え","e","에"],["お","o","오"],
  ["か","ka","카"],["き","ki","키"],["く","ku","쿠"],["け","ke","케"],["こ","ko","코"],
  ["さ","sa","사"],["し","shi","시"],["す","su","스"],["せ","se","세"],["そ","so","소"],
  ["た","ta","타"],["ち","chi","치"],["つ","tsu","츠"],["て","te","테"],["と","to","토"],
  ["な","na","나"],["に","ni","니"],["ぬ","nu","누"],["ね","ne","네"],["の","no","노"],
  ["は","ha","하"],["ひ","hi","히"],["ふ","fu","후"],["へ","he","헤"],["ほ","ho","호"],
  ["ま","ma","마"],["み","mi","미"],["む","mu","무"],["め","me","메"],["も","mo","모"],
  ["や","ya","야"],["ゆ","yu","유"],["よ","yo","요"],
  ["ら","ra","라"],["り","ri","리"],["る","ru","루"],["れ","re","레"],["ろ","ro","로"],
  ["わ","wa","와"],["を","wo","오","조사 '~을/를' 전용"],["ん","n","응","받침 소리 (ㄴ/ㅁ/ㅇ)"]
];
const DAKU_H = [
  ["が","ga","가"],["ぎ","gi","기"],["ぐ","gu","구"],["げ","ge","게"],["ご","go","고"],
  ["ざ","za","자"],["じ","ji","지","さ행 (자주 사용)"],["ず","zu","즈","さ행 (자주 사용)"],["ぜ","ze","제"],["ぞ","zo","조"],
  ["だ","da","다"],["ぢ","ji","지","た행 (드물게 사용)"],["づ","zu","즈","た행 (드물게 사용)"],["で","de","데"],["ど","do","도"],
  ["ば","ba","바"],["び","bi","비"],["ぶ","bu","부"],["べ","be","베"],["ぼ","bo","보"]
];
const HANDAKU_H = [["ぱ","pa","파"],["ぴ","pi","피"],["ぷ","pu","푸"],["ぺ","pe","페"],["ぽ","po","포"]];
const YOON_H = [
  ["きゃ","kya","캬"],["きゅ","kyu","큐"],["きょ","kyo","쿄"],
  ["しゃ","sha","샤"],["しゅ","shu","슈"],["しょ","sho","쇼"],
  ["ちゃ","cha","챠"],["ちゅ","chu","츄"],["ちょ","cho","쵸"],
  ["にゃ","nya","냐"],["にゅ","nyu","뉴"],["にょ","nyo","뇨"],
  ["ひゃ","hya","햐"],["ひゅ","hyu","휴"],["ひょ","hyo","효"],
  ["みゃ","mya","먀"],["みゅ","myu","뮤"],["みょ","myo","묘"],
  ["りゃ","rya","랴"],["りゅ","ryu","류"],["りょ","ryo","료"],
  ["ぎゃ","gya","갸"],["ぎゅ","gyu","규"],["ぎょ","gyo","교"],
  ["じゃ","ja","쟈"],["じゅ","ju","쥬"],["じょ","jo","죠"],
  ["びゃ","bya","뱌"],["びゅ","byu","뷰"],["びょ","byo","뵤"],
  ["ぴゃ","pya","퍄"],["ぴゅ","pyu","퓨"],["ぴょ","pyo","표"]
];
const toKata = s => s.replace(/[ぁ-ゖ]/g, ch => String.fromCharCode(ch.charCodeAt(0) + 0x60));
const deriveKata = arr => arr.map(e => [toKata(e[0]), e[1], e[2], e[3] ? toKata(e[3]) : undefined]);
const KATA = deriveKata(HIRA);
KATA[44][3] = "거의 사용 안 함"; // ヲ
const DAKU_K = deriveKata(DAKU_H);
const HANDAKU_K = deriveKata(HANDAKU_H);
const YOON_K = deriveKata(YOON_H);

const mk = (arr, cat) => arr.map(e => ({ char: e[0], roma: e[1], kor: e[2], note: e[3] || "", cat }));
const POOLS = {
  hira:        mk(HIRA,      "hira"),
  hiraDaku:    mk(DAKU_H,    "hiraDaku"),
  hiraHandaku: mk(HANDAKU_H, "hiraHandaku"),
  hiraYoon:    mk(YOON_H,    "hiraYoon"),
  kata:        mk(KATA,      "kata"),
  kataDaku:    mk(DAKU_K,    "kataDaku"),
  kataHandaku: mk(HANDAKU_K, "kataHandaku"),
  kataYoon:    mk(YOON_K,    "kataYoon")
};
const FULL_POOL = Object.values(POOLS).flat();

const NOTE_TR = {
  "조사 '~을/를' 전용": "object particle (wo)",
  "받침 소리 (ㄴ/ㅁ/ㅇ)": "final n sound",
  "거의 사용 안 함": "rarely used",
  "さ행 (자주 사용)": "sa-row (common)",
  "サ행 (자주 사용)": "sa-row (common)",
  "た행 (드물게 사용)": "ta-row (rare)",
  "タ행 (드물게 사용)": "ta-row (rare)"
};

/* ═════════ 학습 파트 · 표 레이아웃 (원본 그대로) ═════════ */
const PART_GROUPS = [
  { cat: "hira", items: [["hira","pBasic"],["hiraDaku","pDaku"],["hiraHandaku","pHandaku"],["hiraYoon","pYoon"]] },
  { cat: "kata", items: [["kata","pBasic"],["kataDaku","pDaku"],["kataHandaku","pHandaku"],["kataYoon","pYoon"]] }
];
const ROWS_46 = [
  [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
  [25,26,27,28,29],[30,31,32,33,34],[35,null,36,null,37],[38,39,40,41,42],
  [43,null,null,null,44],[45,null,null,null,null]
];
const chunkRows = (n, per) => {
  const rows = [];
  for (let i = 0; i < n; i += per) rows.push(Array.from({length: per}, (_, j) => i + j < n ? i + j : null));
  return rows;
};
const CHART_TABS = [["hira","cat_hira"],["kata","cat_kata"],["daku","tabDaku"],["handaku","tabHandaku"],["yoon","tabYoon"]];
const STAT_SECTIONS = ["hira","kata","hiraDaku","kataDaku","hiraHandaku","kataHandaku","hiraYoon","kataYoon"];
const REMIND_MIN_SEEN = 3, REMIND_MIN_RATE = 0.3;

/* ═════════ 유틸 ═════════ */
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const pad2 = n => String(n).padStart(2, "0");
const dateKey = d => d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
const todayKey = () => dateKey(new Date());

/* ═════════ 다국어 (원본 전체 + 게임화 신규 키) ═════════ */
const T = {
  ko: {
    brandSub:"카나데",
    tagline:"히라가나 · 가타카나, 연주하듯 가볍게 ♪",
    googleBtn:"Google로 시작하기",
    authStart:"이 기기에서 바로 시작하기",
    protoLogin:"프로토타입에서는 Google 로그인 대신 이 기기 저장(게스트)을 사용해요.",
    authHint:"학습 기록은 이 기기에 자동 저장돼요.",
    toDark:"다크 모드로 전환", toLight:"라이트 모드로 전환",
    greetLine1:"안녕하세요,", greetHonorific:"님",
    heroSub:"오늘도 한 장씩, 연주하듯 가볍게.",
    qsToday:"오늘 학습", qsStreak:"연속 학습일", qsAcc:"전체 정답률",
    studyName:"학습하기", studyDesc:"연습 · 퀴즈 · 복습을 한 곳에서",
    chartsName:"가나 표", chartsDesc:"오십음도 · 탁음 · 반탁음 · 요음",
    myName:"마이페이지", myDesc:"학습 기록 · 오답률 · 로그아웃",
    segPractice:"🃏 연습", segQuiz:"❓ 퀴즈", segReview:"🔁 복습",
    labelParts:"학습할 파트", labelMode:"출제 방식",
    modeChar:"문자 → 발음", modeSound:"발음 → 문자", modeRandom:"랜덤 믹스",
    labelHard:"하드 모드", hardName:"⏱ 제한시간", hardDesc:"시간 안에 못 고르면 오답 처리",
    totalPre:"총 ", totalPost:"장의 카드가 랜덤 순서로 나와요",
    beginPractice:"연습 시작", beginQuiz:"퀴즈 시작",
    reviewIntro:"3회 이상 학습했는데 오답률이 30% 이상인 글자를 모아 집중 복습합니다. 오답률 높은 순으로 보여드려요.",
    quitTitle:"그만하기", revealBtn:"정답 보기",
    revealHint:"카드를 누르거나 스페이스/엔터로 정답 보기",
    gradeHint:"스페이스/엔터 = 알았어요 · X = 몰랐어요",
    dunnoBtn:"✗ 몰랐어요", knowBtn:"✓ 알았어요",
    quizKbdHint:"키보드 1〜6으로도 선택할 수 있어요",
    restartAllBtn:"전체 다시 (재셔플)", toSetupBtn:"학습 설정으로", homeBtn:"홈으로",
    resultPracticeTitle:"연습 완료!", resultQuizTitle:"퀴즈 완료!",
    heartsOutTitle:"하트가 다 떨어졌어요!",
    heartsOutSub:"괜찮아요 — 틀린 글자만 다시 도전해봐요!",
    scoreKnew:"알았어요", scoreDunno:"몰랐어요",
    scoreCorrect:"정답", scoreWrong:"오답", scoreRate:"오답률", scoreCombo:"최고 콤보",
    comboSuffix:" 콤보!",
    retryWrongPractice:"📝 저장한 카드만 다시 학습", retryWrongQuiz:"💪 틀린 것만 다시 퀴즈",
    reviewPracticeBtn:"🃏 카드로 복습하기", reviewQuizBtn:"❓ 퀴즈로 복습하기",
    reviewEmpty:"아직 복습이 필요한 글자가 없어요 🌿 연습 · 퀴즈를 진행하면 기록이 쌓이고, 3회 이상 학습 + 오답률 30% 이상인 글자가 여기에 모입니다.",
    ctypeChar:"문자 표", ctypeSound:"발음 표", hintName:"힌트 표시",
    hintDescChar:"글자 아래에 발음을 흐리게 표시", hintDescSound:"발음 아래에 글자를 흐리게 표시",
    chartSpeakHint:"🔊 글자를 누르면 발음이 들려요",
    tabDaku:"탁음", tabHandaku:"반탁음", tabYoon:"요음",
    statTotal:"총 학습 카드", statAcc:"전체 정답률", statDays:"학습한 날", statStreak:"연속 학습일",
    activityTitle:"🌱 학습 활동 (최근 17주)", legendLess:"적음", legendMore:"많음",
    errTitle:"📊 글자별 오답률",
    langName:"🌐 English mode", langDesc:"끄면 한국어로 표시",
    darkName:"🌙 다크 모드", darkDesc:"어두운 곳에서 눈이 편한 테마",
    soundName:"🔊 사운드 이펙트", soundDesc:"정답 · 오답 · 콤보 효과음",
    logoutBtn:"로그아웃",
    unseen:"미학습", guest:"게스트", learner:"학습자",
    guestLocal:"게스트 · 이 기기에만 저장", since:"시작일",
    streakSuffix:"일 연속",
    moaLink:"◈ 모아 허브로",
    pBasic:"청음 46", pDaku:"탁음 20", pHandaku:"반탁음 5", pYoon:"요음 33",
    cat_hira:"히라가나", cat_kata:"가타카나",
    cat_hiraDaku:"탁음 · 히라가나", cat_kataDaku:"탁음 · 가타카나",
    cat_hiraHandaku:"반탁음 · 히라가나", cat_kataHandaku:"반탁음 · 가타카나",
    cat_hiraYoon:"요음 · 히라가나", cat_kataYoon:"요음 · 가타카나"
  },
  en: {
    brandSub:"Kana Flashcards",
    tagline:"Hiragana & Katakana — light as a melody ♪",
    googleBtn:"Continue with Google",
    authStart:"Start on this device",
    protoLogin:"This prototype uses on-device (guest) save instead of Google login.",
    authHint:"Your progress is saved automatically on this device.",
    toDark:"Switch to dark mode", toLight:"Switch to light mode",
    greetLine1:"Hello,", greetHonorific:"",
    heroSub:"One card a day, light as a melody.",
    qsToday:"Today", qsStreak:"Day streak", qsAcc:"Accuracy",
    studyName:"Study", studyDesc:"Practice · Quiz · Review in one place",
    chartsName:"Kana Chart", chartsDesc:"Gojūon · Dakuten · Handakuten · Yōon",
    myName:"My Page", myDesc:"History · Errors · Logout",
    segPractice:"🃏 Practice", segQuiz:"❓ Quiz", segReview:"🔁 Review",
    labelParts:"Parts to study", labelMode:"Question type",
    modeChar:"Kana → Reading", modeSound:"Reading → Kana", modeRandom:"Random mix",
    labelHard:"Hard mode", hardName:"⏱ Time limit", hardDesc:"Counts as wrong if time runs out",
    totalPre:"", totalPost:" cards in random order",
    beginPractice:"Start practice", beginQuiz:"Start quiz",
    reviewIntro:"Characters studied 3+ times with an error rate of 30%+ are gathered here for focused review, sorted by highest error rate.",
    quitTitle:"Quit", revealBtn:"Show answer",
    revealHint:"Tap the card or press Space/Enter to reveal",
    gradeHint:"Space/Enter = Knew it · X = Didn't know",
    dunnoBtn:"✗ Didn't know", knowBtn:"✓ Knew it",
    quizKbdHint:"You can also pick with keys 1–6",
    restartAllBtn:"Restart all (reshuffle)", toSetupBtn:"Back to setup", homeBtn:"Home",
    resultPracticeTitle:"Practice done!", resultQuizTitle:"Quiz done!",
    heartsOutTitle:"Out of hearts!",
    heartsOutSub:"No worries — retry just the ones you missed!",
    scoreKnew:"Knew", scoreDunno:"Didn't",
    scoreCorrect:"Correct", scoreWrong:"Wrong", scoreRate:"Error %", scoreCombo:"Best combo",
    comboSuffix:" combo!",
    retryWrongPractice:"📝 Restudy saved cards", retryWrongQuiz:"💪 Retry wrong ones",
    reviewPracticeBtn:"🃏 Review with cards", reviewQuizBtn:"❓ Review with quiz",
    reviewEmpty:"No characters need review yet 🌿 Do some practice or quizzes to build up records. Characters studied 3+ times with a 30%+ error rate appear here.",
    ctypeChar:"Characters", ctypeSound:"Readings", hintName:"Show hint",
    hintDescChar:"Show the reading faintly under each character", hintDescSound:"Show the character faintly under each reading",
    chartSpeakHint:"🔊 Tap a character to hear it",
    tabDaku:"Dakuten", tabHandaku:"Handakuten", tabYoon:"Yōon",
    statTotal:"Total cards", statAcc:"Accuracy", statDays:"Days studied", statStreak:"Day streak",
    activityTitle:"🌱 Activity (last 17 weeks)", legendLess:"Less", legendMore:"More",
    errTitle:"📊 Error rate by character",
    langName:"🌐 한국어 (Korean)", langDesc:"Turn off for Korean",
    darkName:"🌙 Dark mode", darkDesc:"Easy on the eyes in the dark",
    soundName:"🔊 Sound effects", soundDesc:"Correct · wrong · combo sounds",
    logoutBtn:"Logout",
    unseen:"Unseen", guest:"Guest", learner:"Learner",
    guestLocal:"Guest · saved on this device only", since:"since",
    streakSuffix:"-day streak",
    moaLink:"◈ Back to moa hub",
    pBasic:"Basic 46", pDaku:"Dakuten 20", pHandaku:"Handakuten 5", pYoon:"Yōon 33",
    cat_hira:"Hiragana", cat_kata:"Katakana",
    cat_hiraDaku:"Dakuten · Hiragana", cat_kataDaku:"Dakuten · Katakana",
    cat_hiraHandaku:"Handakuten · Hiragana", cat_kataHandaku:"Handakuten · Katakana",
    cat_hiraYoon:"Yōon · Hiragana", cat_kataYoon:"Yōon · Katakana"
  }
};

/* ═════════ 데모 프로필 (디자인 리뷰용 — 잔디·오답률·복습 목록이 채워져 보이도록) ═════════ */
function makeDemoProfile(){
  const stats = {}, activity = {};
  const today = new Date();
  // 오늘 포함 7일 연속 스트릭
  for (let i = 0; i < 7; i++){
    const d = new Date(today); d.setDate(d.getDate() - i);
    activity[dateKey(d)] = i === 0 ? 24 : 8 + Math.floor(Math.random() * 42);
  }
  // 최근 17주에 드문드문 활동
  for (let i = 8; i < 119; i++){
    if (Math.random() < 0.45){
      const d = new Date(today); d.setDate(d.getDate() - i);
      activity[dateKey(d)] = 3 + Math.floor(Math.random() * 62);
    }
  }
  // 글자별 기록: 절반쯤 학습, 일부는 복습 대상(오답률 30%+)이 되도록
  FULL_POOL.forEach(c => {
    if (Math.random() < 0.55){
      const s = 3 + Math.floor(Math.random() * 12);
      let w = Math.random() < 0.25
        ? Math.ceil(s * (0.3 + Math.random() * 0.4))
        : Math.floor(s * Math.random() * 0.25);
      if (w > s) w = s;
      stats[c.char] = { s, w };
    }
  });
  const created = new Date(today); created.setDate(created.getDate() - 118);
  return { nick: "이연준", created: dateKey(created), stats, activity, bestCombo: 12 };
}

return { HIRA, DAKU_H, HANDAKU_H, YOON_H, toKata, KATA, DAKU_K, HANDAKU_K, YOON_K, POOLS, FULL_POOL, NOTE_TR, PART_GROUPS, ROWS_46, chunkRows, CHART_TABS, STAT_SECTIONS, REMIND_MIN_SEEN, REMIND_MIN_RATE, shuffle, pad2, dateKey, todayKey, T, makeDemoProfile };
})();
