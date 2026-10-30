// =========================================================================
// 食べて元気に｜食品×栄養素ラッシュ＆調理アプリ（p.48〜55）
// 完全無料・ブラウザ標準機能（Web Audio API / localStorage）のみで動作
// =========================================================================

const STORAGE_KEY = "kateika_tabete_genkini_v2";

let appState = {
  stars: 0,
  soundOn: true,
  rushBest: 0,
  rushTotal: 0
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      appState = { ...appState, ...JSON.parse(raw) };
    }
  } catch (e) {}
  updateHeaderUI();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {}
  updateHeaderUI();
}

function addStars(amount) {
  appState.stars += amount;
  playChime(true);
  saveState();
}

function updateHeaderUI() {
  const starEl = document.getElementById("totalStars");
  if (starEl) starEl.textContent = appState.stars;

  const bestEl = document.getElementById("rushBest");
  if (bestEl) bestEl.textContent = appState.rushBest;

  const totalEl = document.getElementById("rushTotal");
  if (totalEl) totalEl.textContent = appState.rushTotal;

  const soundBtn = document.getElementById("soundToggleBtn");
  if (soundBtn) soundBtn.textContent = appState.soundOn ? "🔊" : "🔇";
}

// -------------------- 効果音（Web Audio API） --------------------
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

function toggleSound() {
  appState.soundOn = !appState.soundOn;
  saveState();
  if (appState.soundOn) playChime(true);
}

function playChime(isCorrect = true) {
  if (!appState.soundOn) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (isCorrect) {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.07);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.setValueAtTime(160, now + 0.12);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch (e) {}
}

// -------------------- タブ切替 --------------------
function switchMainTab(tabId) {
  document.querySelectorAll(".nav-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabId}`);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function switchCookSub(subId) {
  const container = document.getElementById("tab-cooking");
  container.querySelectorAll(".sub-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.sub === subId);
  });
  container.querySelectorAll(".sub-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === subId);
  });
}

function switchNutriSub(subId) {
  const container = document.getElementById("tab-nutrition");
  container.querySelectorAll(".sub-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.sub === subId);
  });
  container.querySelectorAll(".sub-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === subId);
  });
}

// =========================================================================
// ⚡ 食品×栄養素 ひたすらクイズ（エンドレスラッシュ）
// 教科書 p.54〜55 の分類表に完全準拠した36食品データベース
// =========================================================================
const RUSH_FOOD_DB = [
  // ① 炭水化物（🟡 主にエネルギーのもとになる食品）
  { name: "米（ご飯）", emoji: "🍚", nutrient: "炭水化物", group: "energy" },
  { name: "食パン", emoji: "🍞", nutrient: "炭水化物", group: "energy" },
  { name: "うどん・めん類", emoji: "🍜", nutrient: "炭水化物", group: "energy" },
  { name: "スパゲッティ", emoji: "🍝", nutrient: "炭水化物", group: "energy" },
  { name: "じゃがいも", emoji: "🥔", nutrient: "炭水化物", group: "energy" },
  { name: "さつまいも", emoji: "🍠", nutrient: "炭水化物", group: "energy" },
  { name: "さといも", emoji: "🥔", nutrient: "炭水化物", group: "energy" },
  { name: "小麦粉", emoji: "🌾", nutrient: "炭水化物", group: "energy" },
  { name: "さとう", emoji: "🍬", nutrient: "炭水化物", group: "energy" },
  { name: "もち", emoji: "🍡", nutrient: "炭水化物", group: "energy" },

  // ② 脂質（🟡 主にエネルギーのもとになる食品）
  { name: "サラダ油", emoji: "🫗", nutrient: "脂質", group: "energy" },
  { name: "バター", emoji: "🧈", nutrient: "脂質", group: "energy" },
  { name: "マヨネーズ", emoji: "🥚", nutrient: "脂質", group: "energy" },
  { name: "ごま油・オリーブ油", emoji: "🫒", nutrient: "脂質", group: "energy" },
  { name: "マーガリン", emoji: "🧈", nutrient: "脂質", group: "energy" },

  // ③ たんぱく質（🔴 主に体をつくるもとになる食品）
  { name: "さけ（魚）", emoji: "🐟", nutrient: "たんぱく質", group: "body" },
  { name: "肉（ぶた肉・とり肉・牛肉）", emoji: "🥩", nutrient: "たんぱく質", group: "body" },
  { name: "卵（たまご）", emoji: "🥚", nutrient: "たんぱく質", group: "body" },
  { name: "大豆（ゆで）", emoji: "🫘", nutrient: "たんぱく質", group: "body" },
  { name: "とうふ", emoji: "⬜", nutrient: "たんぱく質", group: "body" },
  { name: "油あげ", emoji: "🟧", nutrient: "たんぱく質", group: "body" },
  { name: "みそ", emoji: "🥣", nutrient: "たんぱく質", group: "body" },
  { name: "納豆（なっとう）", emoji: "🫘", nutrient: "たんぱく質", group: "body" },
  { name: "かつおぶし", emoji: "🪵", nutrient: "たんぱく質", group: "body" },

  // ④ 無機質・カルシウムなど（🔴 主に体をつくるもとになる食品 ※p.55表の右列）
  { name: "牛乳", emoji: "🥛", nutrient: "無機質", group: "body" },
  { name: "ヨーグルト", emoji: "🥣", nutrient: "無機質", group: "body" },
  { name: "チーズ", emoji: "🧀", nutrient: "無機質", group: "body" },
  { name: "小魚（煮干し・しらす）", emoji: "🐟", nutrient: "無機質", group: "body" },
  { name: "わかめ（海そう）", emoji: "🌿", nutrient: "無機質", group: "body" },
  { name: "のり（海そう）", emoji: "⬛", nutrient: "無機質", group: "body" },
  { name: "こんぶ（海そう）", emoji: "🌿", nutrient: "無機質", group: "body" },

  // ⑤ ビタミン・無機質（🟢 主に体の調子を整えるもとになる食品）
  { name: "だいこん", emoji: "⚪", nutrient: "ビタミン", group: "condition" },
  { name: "ほうれんそう", emoji: "🥬", nutrient: "ビタミン", group: "condition" },
  { name: "にんじん", emoji: "🥕", nutrient: "ビタミン", group: "condition" },
  { name: "キャベツ", emoji: "🥬", nutrient: "ビタミン", group: "condition" },
  { name: "かぼちゃ", emoji: "🎃", nutrient: "ビタミン", group: "condition" },
  { name: "トマト", emoji: "🍅", nutrient: "ビタミン", group: "condition" },
  { name: "ねぎ・たまねぎ", emoji: "🧅", nutrient: "ビタミン", group: "condition" },
  { name: "ピーマン・ブロッコリー", emoji: "🥦", nutrient: "ビタミン", group: "condition" },
  { name: "みかん", emoji: "🍊", nutrient: "ビタミン", group: "condition" },
  { name: "りんご・いちご", emoji: "🍎", nutrient: "ビタミン", group: "condition" },
  { name: "きのこ（しいたけ・まいたけ）", emoji: "🍄", nutrient: "ビタミン", group: "condition" }
];

let rushState = {
  mode: "5nutri", // '5nutri' | '3group'
  queue: [],
  current: null,
  streak: 0,
  history: [],
  locked: false
};

function setRushMode(mode) {
  rushState.mode = mode;
  document.getElementById("modeBtn-5nutri").classList.toggle("active", mode === "5nutri");
  document.getElementById("modeBtn-3group").classList.toggle("active", mode === "3group");
  document.getElementById("rushAnswers5").classList.toggle("hidden", mode !== "5nutri");
  document.getElementById("rushAnswers3").classList.toggle("hidden", mode !== "3group");
  nextRushQuestion();
}

function refillRushQueue() {
  const shuffled = [...RUSH_FOOD_DB].sort(() => Math.random() - 0.5);
  // 直前の問題と同じにならないようにする
  if (rushState.current && shuffled[0].name === rushState.current.name) {
    shuffled.push(shuffled.shift());
  }
  rushState.queue = shuffled;
}

function nextRushQuestion() {
  if (rushState.queue.length === 0) {
    refillRushQueue();
  }
  rushState.current = rushState.queue.shift();
  rushState.locked = false;

  const emojiEl = document.getElementById("rushFoodEmoji");
  const nameEl = document.getElementById("rushFoodName");
  const badgeEl = document.getElementById("rushFeedbackBadge");
  const stageEl = document.getElementById("rushStage");

  if (emojiEl) emojiEl.textContent = rushState.current.emoji;
  if (nameEl) nameEl.textContent = rushState.current.name;
  if (badgeEl) badgeEl.className = "rush-feedback-badge hidden";
  if (stageEl) stageEl.className = "rush-stage";
}

function answerRush(choice) {
  if (rushState.locked || !rushState.current) return;

  const cur = rushState.current;
  const stageEl = document.getElementById("rushStage");
  const badgeEl = document.getElementById("rushFeedbackBadge");

  // 野菜・果物・きのこは教科書p.55で「ビタミン・無機質」両方ふくまれるため、5大栄養素モードで無機質を押した場合も正解扱いにするか？
  // 主な正解は cur.nutrient だが、野菜・果物・きのこはビタミンが代表。分かりやすさのため cur.nutrient で判定しつつ、フィードバックに明記。
  let isCorrect = false;
  if (rushState.mode === "5nutri") {
    isCorrect = choice === cur.nutrient;
  } else {
    isCorrect = choice === cur.group;
  }

  const groupLabels = {
    energy: "🟡 主にエネルギーのもと",
    body: "🔴 主に体をつくるもと",
    condition: "🟢 主に体の調子を整えるもと"
  };

  if (isCorrect) {
    rushState.locked = true;
    rushState.streak++;
    appState.rushTotal++;
    appState.stars++;
    if (rushState.streak > appState.rushBest) {
      appState.rushBest = rushState.streak;
    }
    saveState();
    playChime(true);

    document.getElementById("rushStreak").textContent = rushState.streak;

    if (stageEl) stageEl.classList.add("flash-ok");
    if (badgeEl) {
      badgeEl.className = "rush-feedback-badge ok";
      badgeEl.textContent = `⭕ ${cur.nutrient}（${groupLabels[cur.group]}）`;
    }

    rushState.history.unshift({
      emoji: cur.emoji,
      name: cur.name,
      ans: rushState.mode === "5nutri" ? cur.nutrient : groupLabels[cur.group]
    });
    if (rushState.history.length > 8) rushState.history.pop();
    renderRushHistory();

    setTimeout(() => {
      nextRushQuestion();
    }, 360);
  } else {
    rushState.streak = 0;
    document.getElementById("rushStreak").textContent = "0";
    playChime(false);

    if (stageEl) {
      stageEl.classList.remove("flash-ng");
      void stageEl.offsetWidth;
      stageEl.classList.add("flash-ng");
    }
    if (badgeEl) {
      badgeEl.className = "rush-feedback-badge ng";
      const rightText =
        rushState.mode === "5nutri"
          ? `正解は「${cur.nutrient}」！（${groupLabels[cur.group]}）`
          : `正解は「${groupLabels[cur.group]}」（${cur.nutrient}）！`;
      badgeEl.textContent = `❌ ${rightText}`;
    }
  }
}

function renderRushHistory() {
  const bar = document.getElementById("rushHistoryBar");
  if (!bar) return;
  bar.innerHTML = rushState.history
    .map((h) => `<span class="history-pill">${h.emoji} ${h.name} ＝ ${h.ans}</span>`)
    .join("");
}

// キーボードショートカット（1〜5キーで即答できる）
window.addEventListener("keydown", (e) => {
  const rushPanel = document.getElementById("tab-rush");
  if (!rushPanel || !rushPanel.classList.contains("active")) return;

  if (rushState.mode === "5nutri") {
    const map5 = {
      "1": "炭水化物",
      "2": "脂質",
      "3": "たんぱく質",
      "4": "無機質",
      "5": "ビタミン"
    };
    if (map5[e.key]) answerRush(map5[e.key]);
  } else {
    const map3 = {
      "1": "energy",
      "2": "body",
      "3": "condition"
    };
    if (map3[e.key]) answerRush(map3[e.key]);
  }
});

// =========================================================================
// 🍚 ご飯をたく
// =========================================================================
let riceState = {
  step: 1,
  measuredCorrect: false,
  washCount: 0,
  waterCorrect: false,
  soakCorrect: false,
  heatPhase: 0,
  stirred: false
};

function goToRiceStep(stepNum) {
  riceState.step = stepNum;
  document.querySelectorAll("#riceStepBar .step-dot").forEach((dot, idx) => {
    dot.classList.toggle("active", idx + 1 === stepNum);
    dot.classList.toggle("done", idx + 1 < stepNum);
  });
  renderRiceStage();
}

function renderRiceStage() {
  const box = document.getElementById("riceStageContainer");
  if (!box) return;

  if (riceState.step === 1) {
    box.innerHTML = `
      <div class="stage-grid">
        <div class="visual-pot-box">
          <div class="pot-emoji-big">${riceState.washCount >= 3 ? "✨🌾🥣" : "🌾🥛"}</div>
          <div class="flame-indicator flame-off">
            1人分：米 80g（100mL）｜1合＝150g（180mL）
          </div>
          <div style="margin-top:10px; font-weight:800;">
            ${!riceState.measuredCorrect ? "① カップで計量" : `② 水洗い：${riceState.washCount} / 3 回`}
          </div>
        </div>

        <div>
          <div class="task-block">
            <h4>① 米のはかり方</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn ${riceState.measuredCorrect ? "correct" : ""}" onclick="checkRiceMeasure(true)">
                📏 すり切ってはかる
              </button>
              <button class="Interactive-choice-btn" onclick="checkRiceMeasure(false)">
                ⛰️ 山盛りのまま
              </button>
            </div>
          </div>

          <div class="task-block">
            <h4>② 手早く洗ってざるに上げる（3〜4回）</h4>
            <button class="primary-btn" style="width:100%;" onclick="washRiceAction()" ${!riceState.measuredCorrect || riceState.washCount >= 3 ? "disabled" : ""}>
              💧 水を変えてかき回し、手早く洗う（あと ${Math.max(0, 3 - riceState.washCount)} 回）
            </button>
          </div>

          <div id="riceStep1Feedback" class="feedback-box ${riceState.washCount >= 3 ? "success" : "hidden"}">
            ${riceState.washCount >= 3 ? "⭕ 計量・水洗い完了！" : ""}
          </div>

          <div style="margin-top:12px; text-align:right;">
            <button class="primary-btn" onclick="goToRiceStep(2)" ${riceState.washCount >= 3 ? "" : "disabled"}>
              ② 水・吸水へ ▶
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (riceState.step === 2) {
    box.innerHTML = `
      <div class="stage-grid">
        <div class="visual-pot-box">
          <div class="pot-emoji-big">${riceState.soakCorrect ? "🍲💧⏱️" : "🌾⚖️"}</div>
          <div class="flame-indicator flame-low">
            米 80g (100mL) ＋ 水 ${riceState.waterCorrect ? "120g (120mL)" : "？"}
          </div>
          <div style="margin-top:10px; font-weight:800;">
            ${riceState.soakCorrect ? "白米が吸水して白くなった！" : "重さの1.5倍・体積の1.2倍"}
          </div>
        </div>

        <div>
          <div class="task-block">
            <h4>① 水の分量（米 80g / 100mL に対して）</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn ${riceState.waterCorrect ? "correct" : ""}" onclick="checkRiceWater(true)">
                💧 120g（120mL）
              </button>
              <button class="Interactive-choice-btn" onclick="checkRiceWater(false)">
                💧 40g（40mL）
              </button>
              <button class="Interactive-choice-btn" onclick="checkRiceWater(false)">
                💧 300g（300mL）
              </button>
            </div>
          </div>

          <div class="task-block">
            <h4>② 浸水（吸水）時間</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn" onclick="checkRiceSoak(false)" ${!riceState.waterCorrect ? "disabled" : ""}>
                ⏱️ 1分間
              </button>
              <button class="Interactive-choice-btn ${riceState.soakCorrect ? "correct" : ""}" onclick="checkRiceSoak(true)" ${!riceState.waterCorrect ? "disabled" : ""}>
                ⏱️ 30分間以上
              </button>
            </div>
          </div>

          <div id="riceStep2Feedback" class="feedback-box ${riceState.soakCorrect ? "success" : "hidden"}">
            ${riceState.soakCorrect ? "⭕ 水120mL・30分間以上の吸水完了！" : ""}
          </div>

          <div style="margin-top:12px; display:flex; justify-content:space-between;">
            <button class="secondary-btn" onclick="goToRiceStep(1)">◀</button>
            <button class="primary-btn" onclick="goToRiceStep(3)" ${riceState.soakCorrect ? "" : "disabled"}>
              ③ 火加減・蒸らすへ ▶
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (riceState.step === 3) {
    const phases = [
      { pot: "🍲🔥", badge: "① 点火〜ふっとうするまで", cls: "flame-high" },
      { pot: "🍲💨♨️", badge: "② ふたがゴトゴト動き、湯気が出てきた", cls: "flame-mid" },
      { pot: "🍚💧✨", badge: "③ 水が引いて、ふたが動かなくなった", cls: "flame-low" },
      { pot: "🍚🛑⏲️", badge: "④ 弱火で15分たいた後", cls: "flame-off" }
    ];
    const allDone = riceState.heatPhase >= 4;
    const cur = phases[Math.min(riceState.heatPhase, 3)];

    box.innerHTML = `
      <div class="stage-grid">
        <div class="visual-pot-box">
          <div class="pot-emoji-big ${riceState.heatPhase === 1 ? "pot-bubble-anim" : ""}">
            ${allDone ? "🍚✨♨️" : cur.pot}
          </div>
          <div class="flame-indicator ${allDone ? "flame-off" : cur.cls}">
            ${allDone ? "⭕ 強火 ➡ 中火 ➡ 弱火 ➡ 蒸らし10分" : cur.badge}
          </div>
        </div>

        <div>
          <div class="task-block">
            <h4>火加減を選択</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn ${riceState.heatPhase > 0 ? "correct" : ""}" onclick="selectRiceFlame('high')" ${allDone ? "disabled" : ""}>
                🔥🔥🔥 強火<br /><small>2〜5分</small>
              </button>
              <button class="Interactive-choice-btn ${riceState.heatPhase > 1 ? "correct" : ""}" onclick="selectRiceFlame('mid')" ${allDone ? "disabled" : ""}>
                🔥🔥 中火<br /><small>5〜7分</small>
              </button>
              <button class="Interactive-choice-btn ${riceState.heatPhase > 2 ? "correct" : ""}" onclick="selectRiceFlame('low')" ${allDone ? "disabled" : ""}>
                🔥 弱火<br /><small>15分</small>
              </button>
              <button class="Interactive-choice-btn ${riceState.heatPhase > 3 ? "correct" : ""}" onclick="selectRiceFlame('off')" ${allDone ? "disabled" : ""}>
                🛑 消火・蒸らし<br /><small>10分</small>
              </button>
            </div>
          </div>

          <div id="riceStep3Feedback" class="feedback-box ${allDone ? "success" : "hidden"}">
            ${allDone ? "⭕ 火加減と10分間の蒸らし完了！" : ""}
          </div>

          <div style="margin-top:12px; display:flex; justify-content:space-between;">
            <button class="secondary-btn" onclick="goToRiceStep(2)">◀</button>
            <button class="primary-btn" onclick="goToRiceStep(4)" ${allDone ? "" : "disabled"}>
              ④ ほぐす・完成へ ▶
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (riceState.step === 4) {
    box.innerHTML = `
      <div class="stage-grid">
        <div class="visual-pot-box">
          <div class="pot-emoji-big">${riceState.stirred ? "🍚🥢✨" : "🍲🥄"}</div>
          <div class="flame-indicator flame-off">
            ${riceState.stirred ? "体積・重量が約2.2〜2.3倍に増加！" : "なべつかみで押さえてほぐす"}
          </div>
        </div>

        <div>
          <div class="task-block">
            <h4>⑤ かき混ぜる ➡ ⑥ 盛りつけ ➡ ⑦ 水につけて片づける</h4>
            <button class="primary-btn" style="width:100%;" onclick="finishRiceCooking()" ${riceState.stirred ? "disabled" : ""}>
              🥄 しゃもじで全体をほぐして盛りつける
            </button>
          </div>

          <div id="riceFinalFeedback" class="feedback-box ${riceState.stirred ? "success" : "hidden"}">
            🎉 ふっくらご飯の完成！
          </div>

          <div style="margin-top:12px; display:flex; justify-content:space-between;">
            <button class="secondary-btn" onclick="resetRiceSim()">↺</button>
            <button class="primary-btn" onclick="switchCookSub('cook-miso')">🍲 みそしるを作るへ ▶</button>
          </div>
        </div>
      </div>
    `;
  }
}

function checkRiceMeasure(isCorrect) {
  const fb = document.getElementById("riceStep1Feedback");
  if (isCorrect) {
    riceState.measuredCorrect = true;
    addStars(5);
    renderRiceStage();
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = "カップいっぱいに山盛りにして「すり切って」はかろう！";
  }
}

function washRiceAction() {
  riceState.washCount++;
  playChime(true);
  if (riceState.washCount >= 3) addStars(5);
  renderRiceStage();
}

function checkRiceWater(isCorrect) {
  const fb = document.getElementById("riceStep2Feedback");
  if (isCorrect) {
    riceState.waterCorrect = true;
    addStars(5);
    renderRiceStage();
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = "水は米の重さ(80g)の1.5倍・体積(100mL)の1.2倍＝120g(120mL)！";
  }
}

function checkRiceSoak(isCorrect) {
  const fb = document.getElementById("riceStep2Feedback");
  if (isCorrect) {
    riceState.soakCorrect = true;
    addStars(5);
    renderRiceStage();
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = "30分間以上吸水させよう！";
  }
}

function selectRiceFlame(flame) {
  const expectedOrder = ["high", "mid", "low", "off"];
  const currentExpected = expectedOrder[riceState.heatPhase];
  const fb = document.getElementById("riceStep3Feedback");

  if (flame === currentExpected) {
    riceState.heatPhase++;
    addStars(5);
    renderRiceStage();
  } else {
    playChime(false);
    const hints = {
      high: "ふっとうするまでは「強火」！",
      mid: "ふたがゴトゴト動き湯気が出たら「中火」！",
      low: "水が引いてふたが動かなくなったら「弱火」！",
      off: "最後は「消火・蒸らし（10分間）」！"
    };
    fb.className = "feedback-box error";
    fb.textContent = hints[currentExpected];
  }
}

function finishRiceCooking() {
  riceState.stirred = true;
  addStars(15);
  renderRiceStage();
}

function resetRiceSim() {
  riceState = {
    step: 1,
    measuredCorrect: false,
    washCount: 0,
    waterCorrect: false,
    soakCorrect: false,
    heatPhase: 0,
    stirred: false
  };
  goToRiceStep(1);
}

// =========================================================================
// 🍲 みそしるを作る
// =========================================================================
let misoState = {
  step: 1,
  niboshiCleaned: false,
  cutDaikon: false,
  cutAburaage: false,
  cutNegi: false,
  dashiBoiled: false,
  simmerStep: 0,
  misoDissolved: false,
  heatStoppedRightTime: false
};

function goToMisoStep(stepNum) {
  misoState.step = stepNum;
  document.querySelectorAll("#misoStepBar .step-dot").forEach((dot, idx) => {
    dot.classList.toggle("active", idx + 1 === stepNum);
    dot.classList.toggle("done", idx + 1 < stepNum);
  });
  renderMisoStage();
}

function renderMisoStage() {
  const box = document.getElementById("misoStageContainer");
  if (!box) return;

  if (misoState.step === 1) {
    box.innerHTML = `
      <div class="stage-grid">
        <div class="visual-pot-box">
          <div class="pot-emoji-big">${misoState.niboshiCleaned ? "🍲🐟💧" : "🐟"}</div>
          <div class="flame-indicator flame-off">
            1人分：水 200mL（蒸発分50mLふくむ）・煮干し 5g・みそ 9g
          </div>
        </div>

        <div>
          <div class="task-block">
            <h4>煮干し（いりこ）の下ごしらえ</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn ${misoState.niboshiCleaned ? "correct" : ""}" onclick="checkNiboshiPrep(true)">
                🐟 頭とはらわたを取り、水からなべに入れる
              </button>
              <button class="Interactive-choice-btn" onclick="checkNiboshiPrep(false)">
                🐟 しっぽだけ取って熱湯に入れる
              </button>
            </div>
          </div>

          <div id="misoStep1Feedback" class="feedback-box ${misoState.niboshiCleaned ? "success" : "hidden"}">
            ${misoState.niboshiCleaned ? "⭕ 苦み・えぐみを防ぐ下ごしらえ完了！" : ""}
          </div>

          <div style="margin-top:12px; text-align:right;">
            <button class="primary-btn" onclick="goToMisoStep(2)" ${misoState.niboshiCleaned ? "" : "disabled"}>
              ② 実を切るへ ▶
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (misoState.step === 2) {
    const allCut = misoState.cutDaikon && misoState.cutAburaage && misoState.cutNegi;
    box.innerHTML = `
      <div class="stage-grid">
        <div class="visual-pot-box">
          <div class="pot-emoji-big">${allCut ? "🔪🥕🥬✨" : "🔪📋"}</div>
          <div class="flame-indicator flame-off">
            だいこん 40g ・ 油あげ 7g ・ ねぎ 5〜15g
          </div>
        </div>

        <div>
          <div class="task-block">
            <h4>⚪ だいこん（厚さ5mm）</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn ${misoState.cutDaikon ? "correct" : ""}" onclick="checkMisoCut('daikon', true)">🟡 いちょう切り</button>
              <button class="Interactive-choice-btn" onclick="checkMisoCut('daikon', false)">🟢 小口切り</button>
            </div>
          </div>

          <div class="task-block">
            <h4>🟧 油あげ</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn" onclick="checkMisoCut('aburaage', false)">🟡 いちょう切り</button>
              <button class="Interactive-choice-btn ${misoState.cutAburaage ? "correct" : ""}" onclick="checkMisoCut('aburaage', true)">🟧 短冊切り</button>
            </div>
          </div>

          <div class="task-block">
            <h4>🟢 ねぎ</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn ${misoState.cutNegi ? "correct" : ""}" onclick="checkMisoCut('negi', true)">🟢 小口切り</button>
              <button class="Interactive-choice-btn" onclick="checkMisoCut('negi', false)">🟧 短冊切り</button>
            </div>
          </div>

          <div id="misoStep2Feedback" class="feedback-box ${allCut ? "success" : "hidden"}">
            ${allCut ? "⭕ 3種類の切り方クリア！" : ""}
          </div>

          <div style="margin-top:12px; display:flex; justify-content:space-between;">
            <button class="secondary-btn" onclick="goToMisoStep(1)">◀</button>
            <button class="primary-btn" onclick="goToMisoStep(3)" ${allCut ? "" : "disabled"}>
              ③ だし・煮るへ ▶
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (misoState.step === 3) {
    const doneStep3 = misoState.dashiBoiled && misoState.simmerStep >= 2;
    box.innerHTML = `
      <div class="stage-grid">
        <div class="visual-pot-box">
          <div class="pot-emoji-big ${misoState.dashiBoiled ? "pot-bubble-anim" : ""}">
            ${doneStep3 ? "🍲🥬✨" : misoState.dashiBoiled ? "🍲♨️" : "🍲🐟🔥"}
          </div>
          <div class="flame-indicator ${misoState.dashiBoiled ? "flame-mid" : "flame-high"}">
            ${!misoState.dashiBoiled
              ? "点火前"
              : misoState.simmerStep === 0
              ? "① かたい実から入れる"
              : misoState.simmerStep === 1
              ? "② だいこんがすき通った！"
              : "⭕ 実の加熱完了"}
          </div>
        </div>

        <div>
          <div class="task-block">
            <h4>① だしをとる</h4>
            <button class="primary-btn" style="width:100%;" onclick="boilDashiAction()" ${misoState.dashiBoiled ? "disabled" : ""}>
              🔥 強火で点火 ➡ ふっとう後、中火で4〜5分間
            </button>
          </div>

          <div class="task-block">
            <h4>② 実を入れる順番</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn ${misoState.simmerStep >= 1 ? "correct" : ""}" onclick="selectSimmerOrder('daikon')" ${!misoState.dashiBoiled || misoState.simmerStep >= 2 ? "disabled" : ""}>
                ① ⚪ だいこん
              </button>
              <button class="Interactive-choice-btn ${misoState.simmerStep >= 2 ? "correct" : ""}" onclick="selectSimmerOrder('later')" ${!misoState.dashiBoiled || misoState.simmerStep >= 2 ? "disabled" : ""}>
                ② 🥬 油あげ・ねぎ
              </button>
            </div>
          </div>

          <div id="misoStep3Feedback" class="feedback-box ${doneStep3 ? "success" : "hidden"}">
            ${doneStep3 ? "⭕ だいこん ➡ 油あげ・ねぎの順番クリア！" : ""}
          </div>

          <div style="margin-top:12px; display:flex; justify-content:space-between;">
            <button class="secondary-btn" onclick="goToMisoStep(2)">◀</button>
            <button class="primary-btn" onclick="goToMisoStep(4)" ${doneStep3 ? "" : "disabled"}>
              ④ みそ・完成へ ▶
            </button>
          </div>
        </div>
      </div>
    `;
  } else if (misoState.step === 4) {
    const allMisoDone = misoState.misoDissolved && misoState.heatStoppedRightTime;
    box.innerHTML = `
      <div class="stage-grid">
        <div class="visual-pot-box">
          <div class="pot-emoji-big">${allMisoDone ? "🍲🥢😊" : "🥣🥄"}</div>
          <div class="flame-indicator ${allMisoDone ? "flame-off" : "flame-mid"}">
            ${allMisoDone ? "⭕ 香りのよいみそしる完成！" : "沸騰させすぎると香りが飛ぶ"}
          </div>
        </div>

        <div>
          <div class="task-block">
            <h4>① みその溶き方</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn ${misoState.misoDissolved ? "correct" : ""}" onclick="checkMisoDissolve(true)">
                🥣 少量のだしじるで溶き、味見をして入れる
              </button>
              <button class="Interactive-choice-btn" onclick="checkMisoDissolve(false)">
                🥣 かたまりのまま全部入れる
              </button>
            </div>
          </div>

          <div class="task-block">
            <h4>② 火を消すタイミング</h4>
            <div class="choice-btn-grid">
              <button class="Interactive-choice-btn ${misoState.heatStoppedRightTime ? "correct" : ""}" onclick="checkMisoHeatStop(true)" ${!misoState.misoDissolved ? "disabled" : ""}>
                🛑 ふっとうしそうになったらすぐ消す
              </button>
              <button class="Interactive-choice-btn" onclick="checkMisoHeatStop(false)" ${!misoState.misoDissolved ? "disabled" : ""}>
                🔥 強火でグラグラ煮つめる
              </button>
            </div>
          </div>

          <div id="misoStep4Feedback" class="feedback-box ${allMisoDone ? "success" : "hidden"}">
            ${allMisoDone ? "🎉 おいしいみそしるの完成！" : ""}
          </div>

          <div style="margin-top:12px; display:flex; justify-content:space-between;">
            <button class="secondary-btn" onclick="resetMisoSim()">↺</button>
            <button class="primary-btn" onclick="switchCookSub('cook-manner')">🥢 配膳・米・だしへ ▶</button>
          </div>
        </div>
      </div>
    `;
  }
}

function checkNiboshiPrep(isCorrect) {
  const fb = document.getElementById("misoStep1Feedback");
  if (isCorrect) {
    misoState.niboshiCleaned = true;
    addStars(5);
    renderMisoStage();
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = "頭とはらわたを取って水から入れよう！";
  }
}

function checkMisoCut(type, isCorrect) {
  const fb = document.getElementById("misoStep2Feedback");
  if (isCorrect) {
    if (type === "daikon") misoState.cutDaikon = true;
    if (type === "aburaage") misoState.cutAburaage = true;
    if (type === "negi") misoState.cutNegi = true;
    addStars(5);
    renderMisoStage();
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = "だいこん＝いちょう切り、油あげ＝短冊切り、ねぎ＝小口切り！";
  }
}

function boilDashiAction() {
  misoState.dashiBoiled = true;
  addStars(5);
  renderMisoStage();
}

function selectSimmerOrder(choice) {
  const fb = document.getElementById("misoStep3Feedback");
  if (misoState.simmerStep === 0 && choice === "daikon") {
    misoState.simmerStep = 1;
    addStars(5);
    renderMisoStage();
  } else if (misoState.simmerStep === 1 && choice === "later") {
    misoState.simmerStep = 2;
    addStars(5);
    renderMisoStage();
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = "火の通りにくい「だいこん」が先！";
  }
}

function checkMisoDissolve(isCorrect) {
  const fb = document.getElementById("misoStep4Feedback");
  if (isCorrect) {
    misoState.misoDissolved = true;
    addStars(5);
    renderMisoStage();
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = "少量のだしじるで溶いてから入れよう！";
  }
}

function checkMisoHeatStop(isCorrect) {
  const fb = document.getElementById("misoStep4Feedback");
  if (isCorrect) {
    misoState.heatStoppedRightTime = true;
    addStars(15);
    renderMisoStage();
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = "沸騰しそうになったらすぐに火を消そう！";
  }
}

function resetMisoSim() {
  misoState = {
    step: 1,
    niboshiCleaned: false,
    cutDaikon: false,
    cutAburaage: false,
    cutNegi: false,
    dashiBoiled: false,
    simmerStep: 0,
    misoDissolved: false,
    heatStoppedRightTime: false
  };
  goToMisoStep(1);
}

// =========================================================================
// 🥢 配膳・米・みそ・だし
// =========================================================================
const HAIZEN_STATES = [
  { key: "", icon: "❓", label: "タップ" },
  { key: "rice", icon: "🍚", label: "ご飯（茶わん）" },
  { key: "soup", icon: "🍲", label: "しる物（しるわん）" },
  { key: "chopsticks", icon: "🥢", label: "はし" }
];

let haizenValues = { left: 0, right: 0, front: 0 };

function cycleHaizenSlot(pos) {
  haizenValues[pos] = (haizenValues[pos] + 1) % HAIZEN_STATES.length;
  const st = HAIZEN_STATES[haizenValues[pos]];
  document.getElementById(`preview-${pos}`).textContent = st.icon;
  document.getElementById(`name-${pos}`).textContent = st.label;
  playChime(true);
}

function checkHaizen() {
  const l = HAIZEN_STATES[haizenValues.left].key;
  const r = HAIZEN_STATES[haizenValues.right].key;
  const f = HAIZEN_STATES[haizenValues.front].key;
  const fb = document.getElementById("haizenFeedback");

  if (l === "rice" && r === "soup" && f === "chopsticks") {
    fb.className = "feedback-box success";
    fb.textContent = "⭕ 左：ご飯 ／ 右：しる物 ／ 手前：はし";
    addStars(10);
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = "左＝ご飯、右＝しる物、手前＝はし に並べよう！";
  }
}

const RICE_JOURNEY_DATA = [
  { id: "ine", label: "稲", sub: "脱穀" },
  { id: "momi", label: "もみ", sub: "もみがら外す" },
  { id: "genmai", label: "げん米", sub: "ぬか層とる" },
  { id: "haigamai", label: "はい芽米", sub: "はい芽とる" },
  { id: "hakumai", label: "白米", sub: "たく" },
  { id: "gohan", label: "ご飯", sub: "完成" }
];

let journeySelected = [];

function initRiceJourney() {
  journeySelected = [];
  const fb = document.getElementById("journeyFeedback");
  if (fb) fb.className = "feedback-box hidden";
  renderRiceJourney();
}

function renderRiceJourney() {
  const slotsEl = document.getElementById("riceJourneySlots");
  const choicesEl = document.getElementById("riceJourneyChoices");
  if (!slotsEl || !choicesEl) return;

  slotsEl.innerHTML = RICE_JOURNEY_DATA.map((item, idx) => {
    const picked = journeySelected[idx];
    return `
      <div class="journey-slot ${picked ? "filled" : ""}">
        <div>${picked ? picked.label : idx + 1}</div>
        <small style="font-size:0.68rem; color:#666;">${picked ? picked.sub : ""}</small>
      </div>
    `;
  }).join("");

  const remaining = RICE_JOURNEY_DATA.filter(
    (item) => !journeySelected.some((s) => s.id === item.id)
  );
  const displayOrder = ["genmai", "ine", "gohan", "momi", "hakumai", "haigamai"]
    .map((id) => remaining.find((r) => r.id === id))
    .filter(Boolean);

  choicesEl.innerHTML = displayOrder
    .map(
      (item) => `
      <button class="Interactive-choice-btn" onclick="pickJourneyStep('${item.id}')">
        🌾 ${item.label}
      </button>
    `
    )
    .join("");
}

function pickJourneyStep(id) {
  const expected = RICE_JOURNEY_DATA[journeySelected.length];
  const fb = document.getElementById("journeyFeedback");
  if (expected && expected.id === id) {
    journeySelected.push(expected);
    playChime(true);
    renderRiceJourney();
    if (journeySelected.length === RICE_JOURNEY_DATA.length) {
      fb.className = "feedback-box success";
      fb.textContent = "⭕ 稲 ➡ もみ ➡ げん米 ➡ はい芽米 ➡ 白米 ➡ ご飯！";
      addStars(10);
    } else {
      fb.className = "feedback-box hidden";
    }
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = `次は「${expected.label}」！`;
  }
}

function showDashiDetail(key) {
  const data = {
    niboshi: "🐟 小型のいわしを煮て乾燥（広島・長崎・香川など）｜水から入れ、沸騰後中火4〜5分",
    konbu: "🌿 天日干しで乾燥（北海道・岩手・宮城など）｜水から入れ、ふっとう直前に取り出す",
    katsuo: "🪵 かつおを煮ていぶし乾燥（鹿児島・静岡・高知など）｜沸騰した湯に入れ、再沸騰で火を止めこす",
    shiitake: "🍄 生のしいたけを乾燥（大分・宮崎・熊本など）｜水につけてもどす"
  };
  ["niboshi", "konbu", "katsuo", "shiitake"].forEach((k) => {
    const btn = document.getElementById(`dashiBtn-${k}`);
    if (btn) btn.classList.toggle("active", k === key);
  });
  const box = document.getElementById("dashiDetailBox");
  if (box && data[key]) box.textContent = data[key];
}

// =========================================================================
// 💪 5大栄養素図解
// =========================================================================
const NUTRIENT_DATA = {
  carb: {
    name: "🍚 炭水化物（でんぷん等）",
    roleCols: ["energy"],
    foods: "米（ご飯）・パン・めん類・いも類・さとう"
  },
  lipid: {
    name: "🧈 脂質",
    roleCols: ["energy"],
    foods: "油・バター・マヨネーズ・ごま"
  },
  protein: {
    name: "🥩 たんぱく質*（*エネルギーが足りない時はエネルギーにもなる）",
    roleCols: ["body", "energy"],
    foods: "魚・肉・卵・大豆・豆製品（みそ・油あげ・とうふ）"
  },
  mineral: {
    name: "🦴 無機質（カルシウム＝骨や歯をつくる ／ 調子も整える）",
    roleCols: ["body", "condition"],
    foods: "牛乳・乳製品・小魚・海そう（のり・わかめ） ／ 野菜・果物"
  },
  vitamin: {
    name: "🥦 ビタミン",
    roleCols: ["condition"],
    foods: "野菜（だいこん・ほうれんそう・かぼちゃ等）・果物（みかん等）・きのこ"
  }
};

function selectNutrient(key) {
  const info = NUTRIENT_DATA[key];
  if (!info) return;

  document.querySelectorAll(".nutri-node").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nutri === key);
  });

  ["energy", "body", "condition"].forEach((col) => {
    const el = document.getElementById(`roleCol-${col}`);
    if (el) el.classList.toggle("highlight", info.roleCols.includes(col));
  });

  const spot = document.getElementById("nutrientSpotlight");
  if (spot) {
    spot.innerHTML = `
      <div style="font-weight:800; color:#8a3900;">${info.name}</div>
      <div style="font-size:0.9rem; margin-top:4px;">🍽️ <strong>主な食品：</strong>${info.foods}</div>
    `;
  }
}

function showDigestInfo(idx) {
  const steps = [
    "👄 口の中でよくかむと、消化・吸収に役立ち、栄養素が体内で働きやすくなる。",
    "🔄 胃や腸を通る間に、吸収しやすい小さな形に分解される（消化）。",
    "🩸 分解された栄養素や水分が体内へ取りこまれる（吸収）。",
    "💪 活動中もねむっている間も五大栄養素が助け合って働き、残りははいせつされる。"
  ];
  document.querySelectorAll(".digest-step").forEach((btn, i) => {
    btn.classList.toggle("active", i === idx);
  });
  const box = document.getElementById("digestDetailBox");
  if (box) box.textContent = steps[idx];
}

const FOOD_COMP_DATA = {
  "raw-rice": [
    { label: "炭水化物 77%", pct: 77, color: "#ffd43b" },
    { label: "水分 15%", pct: 15, color: "#74c0fc" },
    { label: "たんぱく質 6%", pct: 6, color: "#ff8787" },
    { label: "他 2%", pct: 2, color: "#69db7c" }
  ],
  "cooked-rice": [
    { label: "水分 60%", pct: 60, color: "#74c0fc" },
    { label: "炭水化物 37%", pct: 37, color: "#ffd43b" },
    { label: "たんぱく質 2.5%", pct: 2.5, color: "#ff8787" },
    { label: "他", pct: 0.5, color: "#69db7c" }
  ],
  bread: [
    { label: "炭水化物 46%", pct: 46, color: "#ffd43b" },
    { label: "水分 38%", pct: 38, color: "#74c0fc" },
    { label: "たんぱく質 9%", pct: 9, color: "#ff8787" },
    { label: "脂質 4%", pct: 4, color: "#ffa94d" },
    { label: "他", pct: 3, color: "#69db7c" }
  ],
  soy: [
    { label: "水分 65%", pct: 65, color: "#74c0fc" },
    { label: "たんぱく質 15%", pct: 15, color: "#ff8787" },
    { label: "炭水化物 10%", pct: 10, color: "#ffd43b" },
    { label: "脂質 8%", pct: 8, color: "#ffa94d" },
    { label: "他 2%", pct: 2, color: "#69db7c" }
  ],
  spinach: [
    { label: "水分 92%", pct: 92, color: "#74c0fc" },
    { label: "炭水化物 3%", pct: 3, color: "#ffd43b" },
    { label: "たんぱく質 2%", pct: 2, color: "#ff8787" },
    { label: "ビタミン・無機質 3%", pct: 3, color: "#69db7c" }
  ]
};

function renderFoodPie(key) {
  const segments = FOOD_COMP_DATA[key];
  if (!segments) return;

  document.querySelectorAll(".chart-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("onclick")?.includes(key));
  });

  const box = document.getElementById("foodChartDisplay");
  if (!box) return;

  const barsHtml = segments
    .map(
      (seg) => `
      <div class="bar-seg" style="width:${seg.pct}%; background:${seg.color};">
        ${seg.pct >= 14 ? seg.label : ""}
      </div>
    `
    )
    .join("");

  const legendHtml = segments
    .map(
      (seg) => `
      <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.78rem; margin-right:8px;">
        <span style="width:10px; height:10px; border-radius:2px; background:${seg.color}; display:inline-block;"></span>
        ${seg.label}
      </span>
    `
    )
    .join("");

  box.innerHTML = `<div class="bar-stack">${barsHtml}</div><div>${legendHtml}</div>`;
}

// =========================================================================
// 🍱 給食の献立＆定食バランス
// =========================================================================
const SCHOOL_LUNCH_ITEMS = [
  { id: "l-rice", name: "米", group: "energy" },
  { id: "l-salmon", name: "さけ", group: "body" },
  { id: "l-oil", name: "油", group: "energy" },
  { id: "l-spinach", name: "ほうれんそう・にんじん・キャベツ・もやし", group: "condition" },
  { id: "l-nori", name: "のり・かつおぶし", group: "body" },
  { id: "l-pumpkin", name: "かぼちゃ・たまねぎ", group: "condition" },
  { id: "l-aburaage", name: "油あげ・みそ", group: "body" },
  { id: "l-mikan", name: "みかん", group: "condition" },
  { id: "l-milk", name: "牛乳", group: "body" }
];

let lunchPlaced = {};
let activeModalChipId = null;

function initSchoolLunch() {
  lunchPlaced = {};
  renderSchoolLunch();
}

function renderSchoolLunch() {
  const poolEl = document.getElementById("lunchChipPool");
  if (!poolEl) return;

  const unplaced = SCHOOL_LUNCH_ITEMS.filter((item) => !lunchPlaced[item.id]);
  poolEl.innerHTML =
    unplaced.length === 0
      ? `<span style="color:#2b8a3e; font-weight:800;">⭕ 全食品の分類完了！</span>`
      : unplaced
          .map(
            (item) => `
          <button class="lunch-chip" onclick="openLunchModal('${item.id}')">
            ➕ ${item.name}
          </button>
        `
          )
          .join("");

  ["energy", "body", "condition"].forEach((grp) => {
    const listEl = document.getElementById(`lunchList-${grp}`);
    if (!listEl) return;
    listEl.innerHTML = SCHOOL_LUNCH_ITEMS.filter((item) => lunchPlaced[item.id] === grp)
      .map((item) => `<span class="placed-chip">${item.name}</span>`)
      .join("");
  });
}

function openLunchModal(chipId) {
  const item = SCHOOL_LUNCH_ITEMS.find((i) => i.id === chipId);
  if (!item) return;
  activeModalChipId = chipId;
  document.getElementById("modalFoodTitle").textContent = item.name;
  document.getElementById("groupSelectModal").classList.remove("hidden");
}

function closeGroupModal() {
  document.getElementById("groupSelectModal").classList.add("hidden");
  activeModalChipId = null;
}

function submitLunchChipGroup(group) {
  const item = SCHOOL_LUNCH_ITEMS.find((i) => i.id === activeModalChipId);
  if (!item) return;
  if (item.group === group) {
    lunchPlaced[item.id] = group;
    addStars(3);
    closeGroupModal();
    renderSchoolLunch();
  } else {
    playChime(false);
  }
}

function autoFillSchoolLunch() {
  SCHOOL_LUNCH_ITEMS.forEach((item) => {
    lunchPlaced[item.id] = item.group;
  });
  playChime(true);
  renderSchoolLunch();
}

function resetSchoolLunch() {
  initSchoolLunch();
}

const MISO_INGREDIENTS = [
  { id: "m-daikon", name: "🟢 だいこん", group: "condition" },
  { id: "m-negi", name: "🟢 ねぎ", group: "condition" },
  { id: "m-aburaage", name: "🔴 油あげ", group: "body" },
  { id: "m-tofu", name: "🔴 とうふ", group: "body" },
  { id: "m-wakame", name: "🔴 わかめ", group: "body" },
  { id: "m-cabbage", name: "🟢 キャベツ", group: "condition" },
  { id: "m-satsumaimo", name: "🟡 さつまいも", group: "energy" },
  { id: "m-kinoko", name: "🟢 きのこ", group: "condition" }
];

const SIDE_DISHES = [
  { id: "s-salmon", name: "🔴 さけの塩焼き", group: "body" },
  { id: "s-egg", name: "🔴 卵焼き", group: "body" },
  { id: "s-spinach", name: "🟢 ほうれんそう", group: "condition" },
  { id: "s-milk", name: "🔴 牛乳", group: "body" },
  { id: "s-mikan", name: "🟢 みかん", group: "condition" }
];

let selectedMisoIngs = new Set(["m-daikon", "m-aburaage", "m-negi"]);
let selectedSides = new Set(["s-salmon", "s-spinach"]);

function initMealBuilder() {
  renderMealBuilder();
}

function renderMealBuilder() {
  const misoPicker = document.getElementById("customMisoPicker");
  const sidePicker = document.getElementById("customSidePicker");
  const meterBox = document.getElementById("balanceMeterBox");
  if (!misoPicker || !sidePicker || !meterBox) return;

  misoPicker.innerHTML = MISO_INGREDIENTS.map(
    (ing) => `
      <button class="ing-toggle-btn ${selectedMisoIngs.has(ing.id) ? "selected" : ""}" onclick="toggleMisoIng('${ing.id}')">
        ${ing.name}
      </button>
    `
  ).join("");

  sidePicker.innerHTML = SIDE_DISHES.map(
    (side) => `
      <button class="ing-toggle-btn ${selectedSides.has(side.id) ? "selected" : ""}" onclick="toggleSideDish('${side.id}')">
        ${side.name}
      </button>
    `
  ).join("");

  let counts = { energy: 1, body: 1, condition: 0 };
  selectedMisoIngs.forEach((id) => {
    const item = MISO_INGREDIENTS.find((i) => i.id === id);
    if (item) counts[item.group]++;
  });
  selectedSides.forEach((id) => {
    const item = SIDE_DISHES.find((i) => i.id === id);
    if (item) counts[item.group]++;
  });

  const isBalanced = counts.energy >= 1 && counts.body >= 2 && counts.condition >= 2;

  meterBox.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; font-size:0.86rem; text-align:center; margin-bottom:8px;">
      <div style="background:#fff9db; padding:6px; border-radius:8px; font-weight:800;">🟡 ${counts.energy}</div>
      <div style="background:#fff5f5; padding:6px; border-radius:8px; font-weight:800;">🔴 ${counts.body}</div>
      <div style="background:#ebfbee; padding:6px; border-radius:8px; font-weight:800;">🟢 ${counts.condition}</div>
    </div>
    <div style="text-align:center; font-weight:800; color:${isBalanced ? "#2b8a3e" : "#d9480f"};">
      ${isBalanced ? "💮 3グループのバランス達成！" : "💡 3グループすべてをそろえよう"}
    </div>
  `;
}

function toggleMisoIng(id) {
  if (selectedMisoIngs.has(id)) selectedMisoIngs.delete(id);
  else selectedMisoIngs.add(id);
  playChime(true);
  renderMealBuilder();
}

function toggleSideDish(id) {
  if (selectedSides.has(id)) selectedSides.delete(id);
  else selectedSides.add(id);
  playChime(true);
  renderMealBuilder();
}

// =========================================================================
// 🏆 総合クイズ
// =========================================================================
const QUIZ_QUESTIONS = [
  {
    q: "毎日元気に生活するために欠かせない3つの柱は「食事」「運動」と、もう1つは何ですか？",
    options: ["休養（すいみん）", "夜ふかし", "間食"],
    answer: 0,
    exp: "食事・運動・休養（すいみん）の3つが大切です。"
  },
  {
    q: "和食の配膳で、食べる人から見て「左」「右」「手前」の正しい配置はどれですか？",
    options: [
      "左：ご飯 ／ 右：しる物 ／ 手前：はし",
      "左：しる物 ／ 右：ご飯 ／ 奥：はし",
      "すべて縦一列"
    ],
    answer: 0,
    exp: "左にご飯（茶わん）、右にしる物（しるわん）、手前にはしを置きます。"
  },
  {
    q: "1人分の米 80g（100mL）に対する「水の分量」と「吸水時間」はどれですか？",
    options: [
      "水 120g（120mL）・吸水 30分間以上",
      "水 80g（80mL）・吸水 3分間",
      "水 300g（300mL）・吸水なし"
    ],
    answer: 0,
    exp: "水は米の重さの1.5倍（体積の1.2倍）＝120mL、30分間以上吸水させます。"
  },
  {
    q: "文化なべでご飯をたくときの火加減の順番はどれですか？",
    options: [
      "強火（沸騰まで）➡ 中火（湯気が出る）➡ 弱火（水が引く）➡ 消火・10分間蒸らす",
      "弱火 ➡ 中火 ➡ 強火 ➡ すぐふたを開ける",
      "ずっと強火のまま"
    ],
    answer: 0,
    exp: "強火 ➡ 中火 ➡ 弱火 ➡ 消火・蒸らし（10分間）の順です。"
  },
  {
    q: "煮干しでだしをとるとき、苦みや生臭さを防ぐために取り除く部分はどこですか？",
    options: ["頭とはらわた", "背びれとしっぽ", "うろこ"],
    answer: 0,
    exp: "頭とはらわたを取って水からなべに入れます。"
  },
  {
    q: "みそしるの実の切り方で正しい組み合わせはどれですか？",
    options: [
      "だいこん＝いちょう切り ／ 油あげ＝短冊切り ／ ねぎ＝小口切り",
      "だいこん＝小口切り ／ 油あげ＝いちょう切り ／ ねぎ＝短冊切り",
      "すべて乱切り"
    ],
    answer: 0,
    exp: "だいこん＝いちょう切り、油あげ＝短冊切り、ねぎ＝小口切りです。"
  },
  {
    q: "みそしるの実を煮る順番と、みそを入れた後の火加減で正しいものはどれですか？",
    options: [
      "かたい物（だいこん）から入れ、みそを溶き入れたら再び沸騰しそうになったらすばやく火を消す",
      "ねぎを最初に入れ、みそを入れてから10分間強火で沸騰させる",
      "最初からみそを入れて野菜を煮る"
    ],
    answer: 0,
    exp: "加熱しすぎるとみその香りが失われるため、沸騰しそうになったらすぐに火を消します。"
  },
  {
    q: "食べ物にふくまれる「五大栄養素」はどれですか？",
    options: [
      "炭水化物・脂質・たんぱく質・無機質・ビタミン",
      "炭水化物・水分・酸素・塩分・でんぷん",
      "肉・魚・野菜・果物・牛乳"
    ],
    answer: 0,
    exp: "炭水化物・脂質・たんぱく質・無機質・ビタミンを五大栄養素といいます。"
  },
  {
    q: "主に筋肉や血液などの「体をつくる」働きをし、エネルギー不足の時はエネルギーにもなる栄養素はどれですか？",
    options: ["たんぱく質", "ビタミン", "脂質"],
    answer: 0,
    exp: "たんぱく質は主に体をつくり、エネルギーにもなります。"
  },
  {
    q: "「野菜・果物・きのこ」に多くふくまれる栄養素と主な働きはどれですか？",
    options: [
      "ビタミン・無機質（主に体の調子を整える）",
      "炭水化物・脂質（主にエネルギーになる）",
      "たんぱく質（主に体をつくる）"
    ],
    answer: 0,
    exp: "野菜・果物・きのこはビタミン・無機質を多くふくみ、主に体の調子を整えます。"
  }
];

let quizState = { idx: 0, score: 0, answered: false };

function initQuiz() {
  quizState = { idx: 0, score: 0, answered: false };
  renderQuiz();
}

function renderQuiz() {
  const box = document.getElementById("quizContainer");
  if (!box) return;

  if (quizState.idx >= QUIZ_QUESTIONS.length) {
    if (quizState.score >= 8) addStars(20);
    box.innerHTML = `
      <div style="text-align:center; padding:16px;">
        <div style="font-size:3.5rem;">🏆</div>
        <h3 style="font-size:1.5rem; margin:8px 0;">${quizState.score} / ${QUIZ_QUESTIONS.length} 問正解</h3>
        <button class="primary-btn" style="margin-top:12px;" onclick="initQuiz()">↺ もう一度</button>
      </div>
    `;
    return;
  }

  const cur = QUIZ_QUESTIONS[quizState.idx];
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-weight:800;">
      <span>Q ${quizState.idx + 1} / ${QUIZ_QUESTIONS.length}</span>
      <span>⭕ ${quizState.score}</span>
    </div>
    <h3 style="font-size:1.15rem; margin-bottom:14px;">${cur.q}</h3>
    <div>
      ${cur.options
        .map(
          (opt, i) => `
          <button class="quiz-option-btn" id="qOpt-${i}" onclick="answerQuiz(${i})">
            ${opt}
          </button>
        `
        )
        .join("")}
    </div>
    <div id="quizFeedbackBox" class="feedback-box hidden"></div>
    <div style="margin-top:12px; text-align:right;">
      <button id="nextQuizBtn" class="primary-btn hidden" onclick="nextQuizQuestion()">次へ ▶</button>
    </div>
  `;
}

function answerQuiz(choiceIdx) {
  if (quizState.answered) return;
  quizState.answered = true;

  const cur = QUIZ_QUESTIONS[quizState.idx];
  const fb = document.getElementById("quizFeedbackBox");
  const nextBtn = document.getElementById("nextQuizBtn");

  cur.options.forEach((_, i) => {
    const btn = document.getElementById(`qOpt-${i}`);
    if (!btn) return;
    btn.disabled = true;
    if (i === cur.answer) btn.classList.add("correct");
    if (i === choiceIdx && choiceIdx !== cur.answer) btn.classList.add("wrong");
  });

  if (choiceIdx === cur.answer) {
    quizState.score++;
    addStars(3);
    fb.className = "feedback-box success";
    fb.textContent = `⭕ ${cur.exp}`;
  } else {
    playChime(false);
    fb.className = "feedback-box error";
    fb.textContent = `❌ ${cur.exp}`;
  }

  nextBtn.classList.remove("hidden");
}

function nextQuizQuestion() {
  quizState.idx++;
  quizState.answered = false;
  renderQuiz();
}

// -------------------- 初期化 --------------------
window.addEventListener("DOMContentLoaded", () => {
  loadState();
  nextRushQuestion();
  renderRiceStage();
  renderMisoStage();
  initRiceJourney();
  showDashiDetail("niboshi");
  selectNutrient("carb");
  showDigestInfo(0);
  renderFoodPie("raw-rice");
  initSchoolLunch();
  initMealBuilder();
  initQuiz();
});
