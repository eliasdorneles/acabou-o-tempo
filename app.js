const sample = (array, size = 1) => {
  // Return a random sample of the given array of size `size`
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

class Game {
  constructor(howManyTeams) {
    this.currentRound = 0
    this.teams = ["A", "B", "C", "D", "E", "F"].splice(0, howManyTeams)
    const amountWords = 10 + howManyTeams * 10
    this.words = sample(PALAVRAS, amountWords)

    this.currentTeamIndex = 0
    this.currentWordIndex = 0

    this.endOfRound = false
    this.endOfGame = false

    this.score = [
      new Array(amountWords).fill(null), // each position contains the team name (e.g. "A", "B", ...) in the position of the word
      new Array(amountWords).fill(null),
      new Array(amountWords).fill(null),
    ]

    this.winnerPerRound = [null, null, null]
  }

  currentTeam() {
    return this.teams[this.currentTeamIndex]
  }
  currentWord() {
    return this.words[this.currentWordIndex]
  }
  currentRoundWinner() {
    return this.winnerPerRound[this.currentRound]
  }

  calcNextWordIndex() {
    // Return the index for the next unused word.
    // If last word in the round, return the same current index
    // If no more words, return -1
    let nextIndex = this.score[this.currentRound].findIndex(
      (x, i) => i > this.currentWordIndex && x === null,
    )
    if (nextIndex >= 0) {
      return nextIndex
    }
    return this.score[this.currentRound].findIndex((x) => x === null)
  }

  countPointsPerTeam() {
    return this.teams.map((t) => this.score[this.currentRound].filter((x) => x == t).length)
  }

  updateWinnersForCurrentRound() {
    const pointsPerTeam = this.countPointsPerTeam()
    // identify the winner
    let winnerIndex = 0
    pointsPerTeam.forEach((p, i) => {
      if (p > pointsPerTeam[winnerIndex]) winnerIndex = i
    })
    this.winnerPerRound[this.currentRound] = this.teams[winnerIndex]
  }

  handleEndOfRound() {
    console.log("end of round")
    this.endOfRound = true
    this.updateWinnersForCurrentRound()
    if (this.currentRound == 2) {
      console.log("end of game")
      this.endOfGame = true
    }
  }

  startNextRound() {
    if (this.endOfGame) {
      console.log("game is finished, gotta start a new one")
    } else {
      this.endOfRound = false
      this.currentRound += 1
    }
  }

  switchTeams() {
    this.currentTeamIndex =
      this.currentTeamIndex === this.teams.length - 1 ? 0 : this.currentTeamIndex + 1
  }

  lastWordOfRound() {
    // return true if the current word is the last word of the round
    return this.calcNextWordIndex() === this.currentWordIndex
  }

  skipWord() {
    let nextIndex = this.calcNextWordIndex()
    if (nextIndex === this.currentWordIndex) {
      return // last word of the round, don't do anything
    } else if (nextIndex === -1) {
      this.handleEndOfRound()
    } else {
      this.currentWordIndex = nextIndex
    }
  }

  gotItRight() {
    this.score[this.currentRound][this.currentWordIndex] = this.currentTeam()
    let nextIndex = this.calcNextWordIndex()
    if (nextIndex === -1) {
      this.handleEndOfRound()
    } else {
      this.currentWordIndex = nextIndex
    }
  }
}

const startGameDialog = document.getElementById("start-game-dialog")
const getReadyDialog = document.getElementById("get-ready")
const timesUpDialog = document.getElementById("times-up")
const playingBox = document.getElementById("playing")
const gameBox = document.getElementById("game-box")

let game = undefined
let timer = 0
let timerId = null

const resetTimer = () => {
  clearInterval(timerId)
  timer = 40
  // timer = 5 // uncomment for testing
}

resetTimer()

const hide = (el) => (el.style.display = "none")

const show = (el, display = "block") => (el.style.display = display)

const updateNotif = (text) => (document.getElementById("notif").innerHTML = text)

const roundName = (round) => {
  switch (round) {
    case 0:
      return "1ª fase: descrição livre"
    case 1:
      return "2ª fase: uma palavra só"
    case 2:
      return "3ª fase: mímica"
    default:
      return "Fase desconhecida"
  }
}

const updateGameUI = () => {
  document.getElementById("timer-seconds").innerHTML = timer
  // TODO: make more visible the changement of round
  document.getElementById("round").innerHTML = roundName(game.currentRound)
  // TODO: make more visible the changement of team
  document.getElementById("team").innerHTML = game.currentTeam()
  const wordBox = document.getElementById("word-box")
  if (game.endOfRound) {
    resetTimer()
    let message = `<p>Fim da ${roundName(game.currentRound)}</p>
      <p class="title is-3">Equipe ${game.currentRoundWinner()} venceu! 👏</p>`
    if (game.endOfGame) {
      message += "<p>Fim do jogo!</p>"
    }
    updateNotif(message)
    show(timesUpDialog)
    hide(playingBox)
  } else {
    wordBox.innerHTML = `
      <p>${game.currentWord()}</p>
      <p class="is-size-6 has-text-grey mt-2">${
        game.lastWordOfRound() ? "Última palavra da fase atual" : "&nbsp;"
      }</p>
      `
  }
}

const timerFinished = () => {
  resetTimer()
  console.log("timer finished")
  show(timesUpDialog)
  hide(playingBox)
  game.skipWord()
}

const nextToPlay = () => {
  if (game.endOfRound && !game.endOfGame) {
    game.startNextRound()
  }
  // TODO: consider not switching if round switch and last team had less than 20 seconds to work
  game.switchTeams()
  updateGameUI()
  hide(timesUpDialog)
  show(getReadyDialog)
}

const updateTimer = () => {
  if (timer > 0) {
    timer -= 1
  } else {
    timerFinished()
  }
  updateGameUI()
}

const startTimer = () => {
  updateNotif(
    '<p>Acabou o tempo!</p><p class="is-size-6">Clique em continuar e passe para a próxima equipe</p>',
  )
  timerId = setInterval(updateTimer, 1000)
  updateGameUI()
  hide(timesUpDialog)
  hide(getReadyDialog)
  show(playingBox)
}

const skipWord = () => {
  game.skipWord()
  updateGameUI()
}

const gotItRight = () => {
  game.gotItRight()
  updateGameUI()
}

const startGame = () => {
  console.log("starting game...")
  const howMany = document.querySelector('input[name="how-many-teams"]:checked').value
  game = new Game(howMany)
  hide(startGameDialog)
  updateGameUI()
  show(gameBox)
}
