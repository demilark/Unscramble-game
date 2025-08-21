let currentWord = "";
let score = 0;
let offlineWords = [];

// === Load bundled offline words (works offline) ===
async function loadOfflineWords() {
  try {
    const url = chrome.runtime.getURL("offline_words.txt");
    const res = await fetch(url);
    const text = await res.text();
    offlineWords = text
      .split(/\r?\n/)
      .map(w => w.trim().toLowerCase())
      .filter(w => /^[a-z]{4,7}$/.test(w)); // keep 4–7 letters
  } catch (e) {
    console.error("Failed to load offline words:", e);
    offlineWords = ["apple"]; // hard fallback
  }
}

// === Online fetch (Datamuse) with graceful fallback ===
async function fetchOnlineWord(length = 5) {
  const sp = "?".repeat(length);
  const url = `https://api.datamuse.com/words?sp=${sp}&max=1000`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (Array.isArray(data) && data.length) {
    // pick a word consisting only of letters
    const pool = data
      .map(x => (x && x.word ? String(x.word).toLowerCase() : ""))
      .filter(w => /^[a-z]{4,7}$/.test(w));
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  }
  throw new Error("No online words");
}

// === Get random word (online first, offline fallback) ===
async function getRandomWord() {
  const targetLen = Math.floor(Math.random() * 4) + 4; // 4–7
  if (navigator.onLine) {
    try {
      const w = await fetchOnlineWord(targetLen);
      return w;
    } catch (_) {
      // fall through to offline
    }
  }
  // Offline (or online failed)
  const candidates = offlineWords.filter(w => w.length === targetLen);
  if (candidates.length) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  // if no exact length match, pick any offline word
  if (offlineWords.length) {
    return offlineWords[Math.floor(Math.random() * offlineWords.length)];
  }
  return "apple";
}

// === Utils ===
function scrambleWord(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const scrambled = arr.join("");
  // ensure it’s not identical to the original (rare)
  return scrambled === word ? scrambleWord(word) : scrambled;
}

function setNextEnabled(enabled) {
  document.getElementById("next-btn").disabled = !enabled;
}

// === UI actions ===
async function nextWord() {
  setNextEnabled(false);
  document.getElementById("feedback").textContent = "";
  document.getElementById("guess").value = "";

  currentWord = (await getRandomWord()).toLowerCase();
  const scrambled = scrambleWord(currentWord);
  document.getElementById("scrambled-word").textContent = scrambled;
  document.getElementById("guess").focus();
}

function checkAnswer() {
  const guess = document.getElementById("guess").value.trim().toLowerCase();
  if (!guess) return;

  if (guess === currentWord) {
    document.getElementById("feedback").textContent = "✅ Correct!";
    score++;
    document.getElementById("score").textContent = `Score: ${score}`;
    setNextEnabled(true);
  } else {
    document.getElementById("feedback").textContent = "❌ Try again.";
  }
}

// === Wire up events (no inline handlers; CSP-safe) ===
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("check-btn").addEventListener("click", checkAnswer);
  document.getElementById("next-btn").addEventListener("click", nextWord);
  document.getElementById("guess").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer();
  });

  await loadOfflineWords();
  await nextWord();
});
