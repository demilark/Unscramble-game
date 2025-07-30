const words = ["apple", "grape", "chair", "plane", "stone", "light", "house", "mouse", "table", "quiet"];
const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

const addWord = (word) => {
  if (!words.includes(word.toLowerCase())) {
    words.push(word.toLowerCase());
    return true;
  }
  return false;
};

const removeWord = (word) => {
  const index = words.indexOf(word.toLowerCase());
  if (index !== -1) {
    words.splice(index, 1);
    return true;
  }
  return false;
};

export default { words, getRandomWord, addWord, removeWord };