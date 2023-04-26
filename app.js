const TRANSLATIONS = {
  pt: {
    team: "Equipe",
    "how-many-teams": "Quantas equipes?",
    continue: "Continuar",
    pass: "Passar",
    "got-it-right": "Acertou!",
    start: "Começar",
    "start-game": "Começar partida",
    "click-start-when-ready": "Clique em começar quando estiver pronto",
    "last-word-of-round": "Última palavra da fase",
    "time-is-up": "Acabou o tempo!",
    "click-start-and-pass-to-next-team": "Clique em continuar e passe para a próxima equipe",
    "game-is-over": "Fim do jogo!",
    round_0: "1ª Fase",
    round_1: "2ª Fase",
    round_2: "3ª Fase",
    round_0_instruction: "descrição livre",
    round_1_instruction: "uma palavra só",
    round_2_instruction: "mímica",
    round_end_of: "Fim da",
    "remaining-words": "Palavras restantes",
    winner: "Vencedor",
    scores: "Placar",
  },
  en: {
    team: "Team",
    "how-many-teams": "How many teams?",
    continue: "Continue",
    pass: "Pass",
    "got-it-right": "Got it!",
    start: "Start",
    "start-game": "Start game",
    "click-start-when-ready": "Click start when ready",
    "last-word-of-round": "Last word of the round",
    "time-is-up": "Time is up!",
    "click-start-and-pass-to-next-team": "Click start and pass it to the next team",
    "game-is-over": "Game is over",
    round_0: "Round 1",
    round_1: "Round 2",
    round_2: "Round 3",
    round_0_instruction: "free description",
    round_1_instruction: "one word only",
    round_2_instruction: "charades",
    round_end_of: "End of",
    "remaining-words": "Remaining words",
    winner: "Winner",
    scores: "Scores",
  },
  "fr": {
    team: "Équipe",
    "how-many-teams": "Combien d'équipes ?",
    continue: "Continuer",
    pass: "Passer",
    "got-it-right": "C'est ça!",
    start: "Commencer",
    "start-game": "Commencer le jeu",
    "click-start-when-ready": "Cliquez sur commencer quand vous êtes prêt",
    "last-word-of-round": "Dernier mot de la manche",
    "time-is-up": "« Time is up ! »",
    "click-start-and-pass-to-next-team": "Cliquez sur continuer et passez à l'équipe suivante",
    "game-is-over": "Le jeu est terminé!",
    round_0: "Manche 1",
    round_1: "Manche 2",
    round_2: "Manche 3",
    round_0_instruction: "description libre",
    round_1_instruction: "un seul mot",
    round_2_instruction: "mime",
    round_end_of: "Fin du",
    "remaining-words": "Mots restants",
    winner: "Gagnant",
    scores: "Scores",
  },
}

let lang = "pt"

const getTranslated = (key) => {
  return TRANSLATIONS[lang][key]
}

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
    this.words = sample(WORDS[lang], amountWords)

    this.currentTeamIndex = 0
    this.currentWordIndex = 0

    this.roundIsOver = false
    this.gameIsOver = false

    this.score = [
      new Array(amountWords).fill(null), // each position contains the team name (e.g. "A", "B", ...) in the position of the word
      new Array(amountWords).fill(null),
      new Array(amountWords).fill(null),
    ]

    this.winnerPerRound = [null, null, null]
    this.roundScores = [[], [], []]
  }

  currentTeam() {
    return this.teams[this.currentTeamIndex]
  }
  currentWord() {
    return this.words[this.currentWordIndex]
  }
  currentRoundWinner() {
    return this.winnerPerRound[this.currentRound]["team"]
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

  countPointsPerTeam = (round) => {
    return this.teams.map((t) => this.score[round].filter((x) => x == t).length)
  }

  scorePointsForAllTeams() {
    // Return an array of objects with the team name and the points for each round
    // e.g. [
    //   [{team: "A", points: 3}, {team: "B", points: 2}, ...], // round 1
    //   [{team: "A", points: 2}, {team: "B", points: 3}, ...], // round 2
    //   [{team: "A", points: 1}, {team: "B", points: 4}, ...], // round 3
    // ]
    return this.score.map((_, i) => {
      const pointsPerTeam = this.countPointsPerTeam(i)
      return this.teams.map((t, j) => {
        return { team: t, points: pointsPerTeam[j] }
      })
    })
  }

  updateScores() {
    this.roundScores = this.scorePointsForAllTeams()
    this.winnerPerRound = this.roundScores.map((round) => {
      let winnerIndex = 0
      round.forEach((p, i) => {
        if (p.points > round[winnerIndex].points) winnerIndex = i
      })
      return round[winnerIndex]
    })
  }

  handleEndOfRound() {
    console.log("end of round")
    this.roundIsOver = true
    this.updateScores()
    if (this.currentRound == 2) {
      console.log("end of game")
      this.gameIsOver = true
    }
  }

  startNextRound() {
    if (this.gameIsOver) {
      console.log("game is finished, gotta start a new one")
    } else {
      this.roundIsOver = false
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

  countRemainingWordsinTheRound() {
    return this.score[this.currentRound].filter((x) => x === null).length
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
const currentTeamBox = document.getElementById("team-box")
const continueBtn = document.getElementById("continue-btn")

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

const roundName = (round, short = false) => {
  if (round > 2) {
    return "Unknown round"
  }
  if (short) {
    return getTranslated(`round_${round}`)
  }
  return getTranslated(`round_${round}`) + ": " + getTranslated(`round_${round}_instruction`)
}

const translateUI = () => {
  const staticLabels = [
    "how-many-teams",
    "team",
    "continue",
    "pass",
    "got-it-right",
    "start-game",
    "start",
    "click-start-when-ready",
  ]
  staticLabels.forEach((label) => {
    document.getElementById(`${label}-label`).innerHTML = getTranslated(label)
  })
}

const setLanguage = (newLang) => {
  lang = newLang
  translateUI()
}

const generateHtmlTableOfTeamsAndScoresForCurrentRound = (game) => {
  const roundScores = game.roundScores[game.currentRound]
  let html = "<table class='table is-size-6 mx-6'>"
  html += "<thead><tr><th colspan='2'>" + getTranslated("scores") + "</th></tr></thead>"
  html += "<tbody>"
  roundScores.forEach((s) => {
    html += `<tr><td>${getTranslated("team")} ${s.team}</td><td>${s.points}</td></tr>`
  })
  html += "</tbody>"
  html += "</table>"
  return html
}

const updateGameUI = () => {
  document.getElementById("timer-seconds").innerHTML = timer
  if (timer < 10) {
    document.getElementById("timer").classList.add("has-text-danger")
  } else {
    document.getElementById("timer").classList.remove("has-text-danger")
  }
  document.getElementById("round").innerHTML = roundName(game.currentRound)
  document.getElementById("current-team").innerHTML = game.currentTeam()
  const wordBox = document.getElementById("word-box")
  if (game.roundIsOver) {
    let message = `<p>${getTranslated("round_end_of")} ${roundName(
      game.currentRound,
      (short = true),
    )}</p>
      <p class="title is-3">${getTranslated("winner")} ${game.currentRoundWinner()} 👏👏</p>
      ${generateHtmlTableOfTeamsAndScoresForCurrentRound(game)}
      `
    if (game.gameIsOver) {
      message += `<p>${getTranslated("game-is-over")}!</p>`
    }
    updateNotif(message)
    show(timesUpDialog)
    hide(playingBox)
    hide(currentTeamBox)
    if (game.gameIsOver) {
      hide(continueBtn)
    }
  } else {
    wordBox.innerHTML = `
      <p>${game.currentWord()}</p>
      <p class="is-size-6 has-text-grey mt-2">${
        game.lastWordOfRound()
          ? getTranslated("last-word-of-round")
          : `${getTranslated("remaining-words")}: ${game.countRemainingWordsinTheRound()}`
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
  if (game.roundIsOver) {
    resetTimer()
  }
  if (game.roundIsOver && !game.gameIsOver) {
    game.startNextRound()
    show(currentTeamBox)
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
    `<p>${getTranslated("time-is-up")} ⌛️</p>
     <p class="is-size-6">${getTranslated("click-start-and-pass-to-next-team")}</p>`,
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
