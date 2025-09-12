const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const rows = 4;
const columns = 4;
let board = [];
let score = 0;
let highScore = 0;

const replayButton = document.getElementById('replay-button');
const startButton = document.getElementById('start-button');
const leftVideoPlayer = document.getElementById('left-video-player');
const rightVideoPlayer = document.getElementById('right-video-player');
let leftPlayer, rightPlayer;

function onYouTubeIframeAPIReady() {
    leftPlayer = new YT.Player('left-video-player', {
        events: {
            'onReady': onLeftPlayerReady,
        }
    });
    rightPlayer = new YT.Player('right-video-player', {
        events: {
            'onReady': onRightPlayerReady,
        }
    });
}

function onLeftPlayerReady(event) {
    // Left video player is ready
    // We'll start the video when the start button is clicked
    leftPlayer.setLoop(true);
}

function onRightPlayerReady(event) {
    // Right video player is ready
    rightPlayer.setLoop(true);
    rightPlayer.playVideo();
}

function resetGame() {
    board = Array(rows).fill().map(() => Array(columns).fill(0));
    score = 0;
    addNewTile();
    addNewTile();
    updateBoard();
    replayButton.classList.add('hidden');
}

function initGame() {
    resetGame();
    loadHighScore();
    gameBoard.classList.add('hidden');
    replayButton.classList.add('hidden');
    startButton.classList.remove('hidden');
}

function loadHighScore() {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        highScoreDisplay.textContent = highScore;
    }
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
}

function addNewTile() {
    const emptyTiles = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (board[i][j] === 0) {
                emptyTiles.push({ row: i, col: j });
            }
        }
    }
    if (emptyTiles.length > 0) {
        const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
}

function updateBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            if (board[i][j] !== 0) {
                tile.textContent = board[i][j];
                tile.style.backgroundColor = getTileColor(board[i][j]);
            }
            gameBoard.appendChild(tile);
        }
    }
    scoreDisplay.textContent = score;
    saveHighScore();
}

function getTileColor(value) {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
}

function move(direction) {
    let moved = false;
    const newBoard = JSON.parse(JSON.stringify(board));

    function shiftTiles(arr) {
        const filtered = arr.filter(val => val !== 0);
        const missing = rows - filtered.length;
        const zeros = Array(missing).fill(0);
        return direction === 'left' || direction === 'up' ? [...filtered, ...zeros] : [...zeros, ...filtered];
    }

    function mergeTiles(arr) {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] !== 0 && arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                score += arr[i];
                arr[i + 1] = 0;
                moved = true;
            }
        }
        return arr;
    }

    for (let i = 0; i < rows; i++) {
        let row = direction === 'left' || direction === 'right' ? newBoard[i] : newBoard.map(r => r[i]);
        row = shiftTiles(row);
        row = mergeTiles(row);
        row = shiftTiles(row);

        if (direction === 'left' || direction === 'right') {
            newBoard[i] = row;
        } else {
            for (let j = 0; j < columns; j++) {
                newBoard[j][i] = row[j];
            }
        }

        if (JSON.stringify(newBoard[i]) !== JSON.stringify(board[i])) {
            moved = true;
        }
    }

    if (moved) {
        board = newBoard;
        addNewTile();
        updateBoard();
        if (isGameOver()) {
            alert('Game Over! Your score: ' + score);
            saveHighScore();
        }
    }
}

function isGameOver() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (board[i][j] === 0) return false;
            if (j < 3 && board[i][j] === board[i][j + 1]) return false;
            if (i < 3 && board[i][j] === board[i + 1][j]) return false;
        }
    }
    replayButton.classList.remove('hidden');
    // Remove the pause video call as we want it to play continuously
    return true;
}

function startGame() {
    gameBoard.classList.remove('hidden');
    startButton.classList.add('hidden');
    resetGame();
    if (leftPlayer && leftPlayer.playVideo) {
        leftPlayer.playVideo();
    }
}

startButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'arrowleft':
        case 'a':
            move('left');
            break;
        case 'arrowright':
        case 'd':
            move('right');
            break;
        case 'arrowup':
        case 'w':
            move('up');
            break;
        case 'arrowdown':
        case 's':
            move('down');
            break;
    }
});

replayButton.addEventListener('click', () => {
    resetGame();
    // Remove the play video call as it's already playing continuously
});

initGame();

// Remove this line as the right video will start playing automatically due to the loop parameter
// if (rightPlayer && rightPlayer.playVideo) {
//     rightPlayer.playVideo();
// }

replayButton.style.display = 'none';