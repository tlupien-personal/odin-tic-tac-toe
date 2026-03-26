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

  const place = function (token, x, y) {
    if (board[x][y] === " ") {
      board[x][y] = token;
      return true;
    } else {
      return false;
    }
  };

  const readCell = function (x, y) {
    return board[x][y];
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
  const placeToken = function (x, y) {
    return gameBoard.place(token, x, y);
  };

  return { name, placeToken };
};

const createGame = function (name1, name2) {
  const player1 = createPlayer(name1, "X");
  const player2 = createPlayer(name2, "O");

  let activePlayer = player1;
  let activeGame = true;
  let winner = null;

  const readState = function () {
    return {
      activePlayer,
      activeGame,
      winner,
    };
  };

  const swapTurn = function () {
    activePlayer = activePlayer === player1 ? player2 : player1;
  };

  const takeTurn = function (x, y) {
    const tokenPlaced = activePlayer.placeToken(x, y);
    const win = detectWin();
    const full = detectEnd();

    if (!tokenPlaced) {
      return false;
    } else if (win) {
      winner = activePlayer;
      activeGame = false;
    } else if (full) {
      activeGame = false;
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
        return player1;
      }
      if (cellValues.every((c) => c === "O")) {
        return player2;
      }
    }
    return false;
  };

  const detectEnd = function () {
    return gameBoard.isFull();
  };

  return { takeTurn, readState };
};

const createConsoleDisplay = function (game) {
  const displayBoard = function () {
    for (row of gameBoard.readBoard()) {
      console.log(row);
    }
  };

  const doTurn = function (x, y) {
    const currentState = game.readState();
    if (!currentState.activeGame) {
      console.log("The game is already over!")
      return
    }

    const tookTurn = game.takeTurn(x, y);
    if (!tookTurn) {
      console.log("Can't go there!")
    } else {
      const newState = game.readState();
      if (!newState.activeGame) {
        console.log("Game Over!")
        if (newState.winner) {
          console.log(`${newState.winner.name} wins!`)
        } else {
          console.log("It's a tie!")
        }
      }
    }
    displayBoard();
  };

  displayBoard();
  return { doTurn };
};
