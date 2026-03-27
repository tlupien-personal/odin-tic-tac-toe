const gameBoard = (function (w = 3, h = 3) {
  const createBlankBoard = function () {
    const blankBoard = [];
    for (let i = 0; i < h; i++) {
      blankBoard.push([]);
      for (let j = 0; j < w; j++) {
        blankBoard[i].push(" ");
      }
    }
    return blankBoard;
  };

  let board = createBlankBoard();

  const place = function (token, row, col) {
    if (board[row][col] === " ") {
      board[row][col] = token;
      return true;
    } else {
      return false;
    }
  };

  const readCell = function (row, col) {
    return board[row][col];
  };

  const readBoard = function () {
    return board;
  };

  const isFull = function () {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === " ") {
          return false;
        }
      }
    }
    return true;
  };

  const reset = function () {
    board = createBlankBoard();
  };

  return { place, reset, readCell, readBoard, isFull };
})();

const createPlayer = function (name, token) {
  const placeToken = function (row, col) {
    return gameBoard.place(token, row, col);
  };

  return { name, placeToken };
};

const game = (function () {
  let player1 = null;
  let player2 = null;
  let ready = false;
  let activePlayer = null;
  let gameOver = false;
  let winner = null;

  const reset = function (isRematch) {
    if (!isRematch) {
      player1 = null;
      player2 = null;
      ready = false;
      activePlayer = null;
    } else {
      activePlayer = player1;
    }
    gameOver = false;
    winner = null;
    gameBoard.reset();
  };

  const addPlayer = function (playerName) {
    if (!player1) {
      player1 = createPlayer(playerName, "X");
      activePlayer = player1;
      return true;
    } else if (!player2) {
      player2 = createPlayer(playerName, "O");
      ready = true;
      return true;
    } else {
      return false;
    }
  };

  const readState = function () {
    return {
      activePlayer,
      player1,
      player2,
      ready,
      gameOver,
      winner,
    };
  };

  const swapTurn = function () {
    activePlayer = activePlayer === player1 ? player2 : player1;
  };

  const takeTurn = function (row, col) {
    if (!ready || gameOver) {
      return false;
    }

    const tokenPlaced = activePlayer.placeToken(row, col);
    detectWin();
    const full = detectEnd();

    if (!tokenPlaced) {
      return false;
    } else if (winner || full) {
      gameOver = true;
    } else {
      swapTurn();
    }

    return true;
  };

  const winConditions = [
    // horizontals
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
    ],
    // verticals
    [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
    ],
    // diagonals
    [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    [
      [0, 2],
      [1, 1],
      [2, 0],
    ],
  ];

  const detectWin = function () {
    for (condition of winConditions) {
      const cellValues = [];
      for (cell of condition) {
        const cellValue = gameBoard.readCell(...cell);
        cellValues.push(cellValue);
      }
      if (cellValues.every((c) => c === "X")) {
        winner = player1;
      }
      if (cellValues.every((c) => c === "O")) {
        winner = player2;
      }
    }
  };

  const detectEnd = function () {
    return gameBoard.isFull();
  };

  return { addPlayer, takeTurn, readState, reset };
})();

const display = (function () {
  const container = document.querySelector("#game-container");
  const getCard = function (n) {
    return document.querySelector(`.indicator-card:nth-child(${n})`);
  };

  const iconData = {
    X: {
      viewBox: "0 0 24 24",
      title: "close",
      path: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
    },
    O: {
      viewBox: "0 0 24 24",
      title: "circle-outline",
      path: "M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
    },
  };

  const createIcon = function (iconData, xmlns = "http://www.w3.org/2000/svg") {
    const icon = document.createElementNS(xmlns, "svg");
    icon.setAttribute("xmlns", xmlns);
    icon.setAttribute("viewBox", iconData.viewBox);

    const titleElement = document.createElementNS(xmlns, "title");
    titleElement.innerText = iconData.title;

    const pathElement = document.createElementNS(xmlns, "path");
    pathElement.setAttribute("d", iconData.path);

    icon.appendChild(titleElement);
    icon.appendChild(pathElement);
    return icon;
  };

  const addPlayer = function (e) {
    e.preventDefault();
    const formData = new FormData(e.target.parentElement);
    const playerName = formData.get("playerName");
    game.addPlayer(playerName);
    showGame();
  };

  const createPlayerForm = function () {
    const form = document.createElement("form");
    form.id = "player-form";

    const label = document.createElement("label");
    label.setAttribute("for", "player-name");
    label.innerText = "Name";

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.id = "player-name";
    input.setAttribute("name", "playerName");

    const button = document.createElement("button");
    button.classList.add("add-btn");
    button.innerText = "Add";
    button.addEventListener("click", (e) => addPlayer(e));

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(button);

    return form;
  };

  const attachPlayerForm = function (card) {
    card.innerText = "";
    const form = createPlayerForm();
    card.appendChild(form);
  };

  const doPlayerCards = function (state) {
    const player1Exists = state.player1 !== null;
    const player2Exists = state.player2 !== null;
    if (!player1Exists) {
      const formCard = getCard(1);
      attachPlayerForm(formCard);
    } else if (!player2Exists) {
      const formCard = getCard(3);
      attachPlayerForm(formCard);

      const nameCard = getCard(1);
      nameCard.innerText = state.player1.name;
      nameCard.classList.add("player-name");
      nameCard.classList.add("player-active");
    } else {
      const p1Card = getCard(1);
      p1Card.innerText = state.player1.name;
      p1Card.classList.add("player-name");

      const p2Card = getCard(3);
      p2Card.innerText = state.player2.name;
      p2Card.classList.add("player-name");

      if (state.activePlayer === state.player2) {
        p2Card.classList.add("player-active");
        p1Card.classList.remove("player-active");
      } else {
        p1Card.classList.add("player-active");
        p2Card.classList.remove("player-active");
      }
    }
  };

  const doMsgCard = function (state, tookTurn) {
    // incomplete
    const msgCard = getCard(2);
    if (!state.ready) {
      msgCard.innerText = "Waiting for Players to Join...";
    } else {
      msgCard.innerText = "";
    }
  };

  const doTurn = function (row, col) {
    const tookTurn = game.takeTurn(row, col);
    showGame(tookTurn);
  };

  const cellClick = function (e) {
    const cell = e.currentTarget;
    const row = cell.getAttribute("data-row");
    const col = cell.getAttribute("data-col");
    doTurn(row, col);
  };

  const createCell = function (cellValue, row, col) {
    const cell = document.createElement("div");
    cell.classList.add("board-cell");
    cell.setAttribute("data-row", row);
    cell.setAttribute("data-col", col);

    cell.addEventListener("click", (e) => cellClick(e));

    if (cellValue === " ") {
      return cell;
    }
    const icon = createIcon(iconData[cellValue]);
    icon.classList.add(`${cellValue}-icon`);
    cell.appendChild(icon);
    return cell;
  };

  const renderBoard = function () {
    container.innerText = "";
    const boardBox = document.createElement("div");
    boardBox.classList.add("game-board");

    const boardData = gameBoard.readBoard();

    for (let i = 0; i < boardData.length; i++) {
      for (let j = 0; j < boardData.length; j++) {
        const cell = createCell(boardData[i][j], i, j);
        boardBox.appendChild(cell);
      }
    }
    container.appendChild(boardBox);
  };

  const showGame = function (tookTurn) {
    const state = game.readState();
    doPlayerCards(state);
    doMsgCard(state, tookTurn);
    renderBoard();
  };

  showGame(true);
})();

// add dummy players
// game.addPlayer("ONE (X)");
// game.addPlayer("TWO (O)");
