let currentWord = "";
let scrambled = "";
let score = 0;

// Fetch a random English word of specified length
async function getRandomWord(length = 5) {
  try {
    const res = await fetch(`https://api.datamuse.com/words?sp=${'?'.repeat(length)}&max=1000`);
    const words = await res.json();
    if (words.length > 0) {
      const randomWord = words[Math.floor(Math.random() * words.length)].word;
      return randomWord;
    } else {
      return "apple"; // fallback
    }
  } catch (error) {
    console.error("Failed to fetch word:", error);
    return "apple";
  }
}

// Shuffle the letters of a word
function scrambleWord(word) {
  return word.split('').sort(() => Math.random() - 0.5).join('');
}

// Display a new word
async function nextWord() {
  currentWord = await getRandomWord(Math.floor(Math.random() * 4) + 4); // 4-7 letter words
  scrambled = scrambleWord(currentWord);
  document.getElementById('scrambled-word').textContent = scrambled;
  document.getElementById('guess').value = '';
  document.getElementById('feedback').textContent = '';
}

// Check the user's guess
function checkAnswer() {
  const guess = document.getElementById('guess').value.trim().toLowerCase();
  if (guess === currentWord.toLowerCase()) {
    document.getElementById('feedback').textContent = "✅ Correct!";
    score++;
    document.getElementById('score').textContent = `Score: ${score}`;
  } else {
    document.getElementById('feedback').textContent = `❌ Nope! Try again.`;
  }
}

document.getElementById("next-btn").addEventListener("click", nextWord);
document.getElementById("guess").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    checkAnswer();
  }
});

// Load the first word
nextWord();
document.getElementById("check-btn").addEventListener("click", checkAnswer);
