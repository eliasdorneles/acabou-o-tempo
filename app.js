const startGameDialog = document.getElementById("start-game-dialog")
const gameBox = document.getElementById("game-box")
const wordBox = document.getElementById("word-box")
var gameWords = []
var currentWordIndex = 0

const hide = (el) => (el.style.display = "none")

const show = (el, display = "block") => (el.style.display = display)

const sample = (array, size = 1) => {
  const { floor, random } = Math
  let sampleSet = new Set()
  for (let i = 0; i < size; i++) {
    let index
    do {
      index = floor(random() * array.length)
    } while (sampleSet.has(index))
    sampleSet.add(index)
  }
  return [...sampleSet].map((i) => array[i])
}

// stub functions, will be replaced by game logic later
const skipWord = () => {
  currentWordIndex += 1
  if (currentWordIndex >= gameWords.length) currentWordIndex = 0
  wordBox.innerHTML = gameWords[currentWordIndex]
}
const gotItRight = skipWord

// TODO: design the data structure to hold the game state
// and implement its logic

const startGame = () => {
  console.log("starting game...")
  hide(startGameDialog)
  gameWords = sample(PALAVRAS, 30)
  wordBox.innerHTML = gameWords[currentWordIndex]
  show(gameBox)
}
