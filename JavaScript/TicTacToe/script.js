const Player = (name, marker) => {
  let _score = 0;
  return {
    name,
    marker,
    score: () => _score,
    addScore: () => _score++,
    resetScore: () => (_score = 0),
  };
};
const root = document.documentElement;
const ACCENTS = {
  X: "#ffd447",
  O: "#db2b39",
};
function setAccentFor(marker) {
  root.style.setProperty("--accent", ACCENTS[marker]);
}
const GameBoard = (() => {
  const board = Array(9).fill(null);
  const getBoard = () => board.slice();
  const getAt = (index) => board[index];
  const placeMarker = (index, marker) => {
    if (index < 0 || index > 8) return false;
    if (board[index]) return false;
    board[index] = marker;
    return true;
  };
  const reset = () => board.fill(null);
  return {
    getBoard,
    getAt,
    placeMarker,
    reset,
  };
})();

const GameController = (() => {
  let players = [Player("Player 1", "X"), Player("Player 2", "O")];
  let active = 0;
  let round = 0;
  let gameOver = false;
  let gameStarted = false;
  const WINNINGLINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], //winning rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], //winning columns
    [0, 4, 8],
    [2, 4, 6], // winning diagonals
  ];
  const setPlayers = (POneName, PTwoName) => {
    players = [
      Player(POneName?.trim() || "Player 1", "X"),
      Player(PTwoName?.trim() || "Player 2", "O"),
    ];
    restart();
  };
  const getActivePlayer = () => players[active];
  const getPlayers = () => players.slice();
  const setRoundsActivePlayer = () => {
    round++;
    active = round % players.length;
  };
  const startGame = () => {
    gameStarted = true;
  };
  const isGameOver = () => gameOver;
  const isGameStarted = () => gameStarted;
  const checkGameState = () => {
    const board = GameBoard.getBoard();
    //check Winss
    for (const [a, bIndex, c] of WINNINGLINES) {
      if (board[a] && board[a] === board[bIndex] && board[a] === board[c]) {
        return { result: "win", mark: board[a], line: [a, bIndex, c] };
      }
    }
    //check Tie
    if (board.every(Boolean)) return { result: "tie" };
    //Otherwise continue
    return { result: "continue" };
  };
  const playAt = (index) => {
    if (gameOver) return { status: "gameOver" };
    if (!gameStarted) return { status: "notStarted" };
    const current = getActivePlayer();
    const placed = GameBoard.placeMarker(index, current.marker);
    if (!placed) return { status: "invalid" };
    const state = checkGameState();
    if (state.result === "win") {
      gameOver = true;
      current.addScore();
      return { status: "win", winner: current, line: state.line };
    }
    if (state.result === "tie") {
      gameOver = true;
      return { status: "tie" };
    }
    active = 1 - active;
    return {
      status: "continue",
      next: getActivePlayer(),
    };
  };
  const restart = () => {
    players.forEach((p) => p.resetScore());
    GameBoard.reset();
    active = 0;
    gameOver = false;
    gameStarted = false;
  };
  const reset = () => {
    GameBoard.reset();
    setRoundsActivePlayer();
    gameOver = false;
  };
  return {
    startGame,
    setPlayers,
    getPlayers,
    isGameStarted,
    getActivePlayer,
    playAt,
    isGameOver,
    restart,
    reset,
    _debug: { WINNINGLINES },
  };
})();

const DisaplyController = (() => {
  if (typeof document === "undefined") return {};
  const cells = Array.from(document.querySelectorAll("[data-cell]"));
  const messageElement = document.querySelector("[data-message]");
  const startBtn = document.querySelector("[data-start]");
  const resetBtn = document.querySelector("[data-reset]");
  const continueBtn = document.querySelector("[data-continue]");
  const playerOneInput = document.getElementById("playerX");
  const playeTwoInput = document.getElementById("playerO");
  const playerOneScore = document.getElementById("playerXScore");
  const playerTwoScore = document.getElementById("playerOScore");

  const render = () => {
    const board = GameBoard.getBoard();
    cells.forEach((el, index) => {
      el.textContent = board[index] ?? "";
      el.classList.toggle("taken", !!board[index]);
    });
  };
  const clearHighlights = () => {
    cells.forEach((c) => c.classList.remove("win"));
    cells.forEach((i) => i.classList.remove("disabled"));
    cells.forEach((i) => i.classList.remove("tie"));
  };
  const setMessage = (text) => {
    messageElement.textContent = text;
  };
  const renderScore = () => {
    const [pX, pO] = GameController.getPlayers();
    playerOneScore.textContent = pX.score();
    playerTwoScore.textContent = pO.score();
  };
  const handleCellClick = (index) => {
    const result = GameController.playAt(index);
    if (result.status === "invalid") {
      setMessage("That spot is taken.Try another.");
      return;
    }
    render();
    if (result.status === "win") {
      const { winner, line } = result;
      line.forEach((i) => cells[i].classList.add("win"));
      cells.forEach((i) => i.classList.add("disabled"));
      renderScore();
      continueBtn.classList.remove("hidden");
      setMessage(`${winner.name} wins!`);
      return;
    }
    if (result.status === "tie") {
      setMessage("It's a tie!");
      cells.forEach((i) => i.classList.add("disabled"));
      cells.forEach((i) => i.classList.add("tie"));
      continueBtn.classList.remove("hidden");
      return;
    }
    if (result.status === "continue") {
      const next = GameController.getActivePlayer();
      setAccentFor(GameController.getActivePlayer().marker);
      setMessage(`${next.name}'s turn (${next.marker})`);
    }
  };
  cells.forEach((el, i) => {
    el.addEventListener("click", () => {
      if (GameController.isGameOver() || !GameController.isGameStarted())
        return;
      handleCellClick(i);
    });
  });
  startBtn.addEventListener("click", () => {
    GameController.setPlayers(playerOneInput.value, playeTwoInput.value);
    GameController.startGame();
    cells.forEach((i) => i.classList.add("can-hover"));
    setAccentFor(GameController.getActivePlayer().marker);
    clearHighlights();
    render();
    const current = GameController.getActivePlayer();
    setMessage(`${current.name}'s turn (${current.marker})`);
    startBtn.classList.add("hidden");
  });
  resetBtn.addEventListener("click", () => {
    GameController.restart();
    startBtn.classList.remove("hidden");
    cells.forEach((i) => i.classList.remove("can-hover"));
    clearHighlights();
    renderScore();
    render();
    setAccentFor(GameController.getActivePlayer().marker);
    setMessage("Game reset. Press Start to play!");
  });
  continueBtn.addEventListener("click", () => {
    GameController.reset();
    clearHighlights();
    renderScore();
    render();
    const current = GameController.getActivePlayer();
    setMessage(`Game Continues! ${current.name}'s turn (${current.marker})`);
  });

  render();
  setMessage("Enter names and press Start");
  return { render };
})();
