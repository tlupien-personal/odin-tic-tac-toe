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
    }
  };

  const reset = function () {
    board = createBlankBoard();
  };

  const testDisplay = function () {
    console.log(board);
  };

  return { place, reset, testDisplay };
})();

const createPlayer = function (name, token) {
  const placeToken = function (x, y) {
    gameBoard.place(token, x, y);
  };

  return { name, placeToken };
};
