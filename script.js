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

const consoleContext = (function () {
  const displayBoard = function () {
    for (row of gameBoard.readBoard()) {
      console.log(row);
    }
    console.log("-".repeat(15));
  };

  const addPlayer = function (playerName) {
    game.addPlayer(playerName);
  };

  const reset = function (isRematch) {
    game.reset(isRematch);
  };

  const doTurn = function (row, col) {
    const currentState = game.readState();
    if (!currentState.ready) {
      console.log("Game needs more players to begin");
      return;
    } else if (currentState.gameOver) {
      console.log("Game has ended");
      return;
    }

    const tookTurn = game.takeTurn(row, col);
    const newState = game.readState();

    if (!tookTurn) {
      console.log("Not allowed");
    } else if (newState.gameOver) {
      console.log("Game Over!");
      if (newState.winner) {
        console.log(`${newState.winner.name} wins!`);
      } else {
        console.log("It's a tie!");
      }
    }
    displayBoard();
  };

  return { doTurn, addPlayer, reset };
})();

const display = (function () {
  const container = document.querySelector("#game-container");
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

  const createCell = function (cellValue) {
    const cell = document.createElement("div");
    cell.classList.add("board-cell");
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
    boardData.forEach((row) => {
      row.forEach((cell) => {
        const cellDisplay = createCell(cell);
        boardBox.appendChild(cellDisplay);
      });
    });
    container.appendChild(boardBox);
  };

  return { renderBoard };
})();

// For testing purposes
// Yes, I could write actual tests, but I ostensibly don't know how
// at this point in the curriculum, so this is what I'm doing

const testGame = function () {
  // not ready yet
  consoleContext.doTurn(0, 0);

  // add 1st player
  consoleContext.addPlayer("ONE (X)");

  // still not ready yet
  consoleContext.doTurn(0, 0);

  // add 2nd player
  consoleContext.addPlayer("TWO (O)");

  // fill all squares
  consoleContext.doTurn(0, 0); // works (X)
  consoleContext.doTurn(0, 0); // can't go there, remains O turn

  consoleContext.doTurn(1, 1); // O actual turn
  consoleContext.doTurn(2, 2); // X
  consoleContext.doTurn(1, 2); // etc.
  consoleContext.doTurn(0, 2);
  consoleContext.doTurn(2, 0);
  // consoleContext.doTurn(1, 0);
  // consoleContext.doTurn(0, 1);
  // consoleContext.doTurn(2, 1); // game over / tie

  // consoleContext.reset(true); // rematch, keeps players

  // consoleContext.doTurn(0, 0); // goes back to X turn
  // consoleContext.doTurn(0, 1);
  // consoleContext.doTurn(1, 1);
  // consoleContext.doTurn(0, 2);
  // consoleContext.doTurn(2, 2); // x wins

  // consoleContext.reset(false); // need new players
  // consoleContext.doTurn(0, 0); // doesn't work (no players)
};

testGame();
display.renderBoard();
