let userSymbol = null;
let aiSymbol = null;
let currentPlayer = null;
let gameState = ["", "", "", "", "", "", "", "", ""];
const winningCombinations = [
    [0, 1, 2], [3, 4, 5],
    [6, 7, 8], [0, 3, 6],
    [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let humanScore = parseInt(localStorage.getItem("humanScore")) || 0;
let engineScore = parseInt(localStorage.getItem("engineScore")) || 0;
let tieScore = parseInt(localStorage.getItem("tieScore")) || 0;

document.getElementById("humanWins").innerText = humanScore;
document.getElementById("engineWins").innerText = engineScore;
document.getElementById("ties").innerText = tieScore;

document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".button");
    const grid = document.querySelector(".grid-container");
    const resetButton = document.getElementById("resetData");
    const askBox = document.getElementById("ask");

    grid.classList.add("hidden"); // Hide grid initially
    askBox.classList.remove("hidden"); // Show symbol selection box

    // Check if there is score data in localStorage to show the reset button
    if (humanScore > 0 || engineScore > 0 || tieScore > 0) {
        resetButton.classList.remove("hidden");
    } else {
        resetButton.classList.add("hidden");
    }

    // Symbol selection buttons
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            userSymbol = button.getAttribute("data-value");
            aiSymbol = userSymbol === "X" ? "O" : "X";
            currentPlayer = "Human";

            askBox.classList.add("hidden"); // Hide symbol selection box
            grid.classList.remove("hidden"); // Show grid
        });
    });

    // Cell click event
    document.querySelectorAll(".cell").forEach(cell => {
        cell.addEventListener("click", () => {
            const cellIndex = cell.getAttribute("data-index");

            if (gameState[cellIndex] === "" && currentPlayer === "Human") {
                gameState[cellIndex] = userSymbol;
                cell.innerText = userSymbol;

                if (checkWin()) {
                    alert("Human wins!");
                    updateScore("Human");
                    showResetButton();
                    resetGame();
                } else if (gameState.every(cell => cell)) {
                    alert("It's a tie!");
                    updateTieCount();
                    showResetButton();
                    resetGame();
                } else {
                    currentPlayer = "Engine";
                    aiMove();
                }
            }
        });
    });

    // Reset button event
    resetButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset the data?")) {
            humanScore = 0;
            engineScore = 0;
            tieScore = 0;
            localStorage.setItem("humanScore", humanScore);
            localStorage.setItem("engineScore", engineScore);
            localStorage.setItem("tieScore", tieScore);

            document.getElementById("humanWins").innerText = humanScore;
            document.getElementById("engineWins").innerText = engineScore;
            document.getElementById("ties").innerText = tieScore;

            resetButton.classList.add("hidden");

            // Show symbol selection box after reset
            askBox.classList.remove("hidden");
            grid.classList.add("hidden"); // Hide grid
        }
    });
});

function showResetButton() {
    document.getElementById("resetData").classList.remove("hidden");
}

function aiMove() {
    const aiMoveIndex = getBestMove();
    
    if (aiMoveIndex !== null) {
        gameState[aiMoveIndex] = aiSymbol;
        document.querySelector(`.cell[data-index="${aiMoveIndex}"]`).innerText = aiSymbol;

        if (checkWin()) {
            alert("Engine wins!");
            updateScore("Engine");
            showResetButton();
            resetGame();
        } else if (gameState.every(cell => cell)) {
            alert("It's a tie!");
            updateTieCount();
            showResetButton();
            resetGame();
        } else {
            currentPlayer = "Human";
        }
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    let alpha = -Infinity;
    let beta = Infinity;

    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === "") {
            gameState[i] = aiSymbol;
            let score = minimax(gameState, 0, false, alpha, beta);
            gameState[i] = "";
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) break;
        }
    }
    return bestMove;
}

function minimax(board, depth, isMaximizing, alpha, beta) {
    if (checkWinForSymbol(userSymbol)) return -1;
    if (checkWinForSymbol(aiSymbol)) return 1;
    if (board.every(cell => cell !== "")) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = aiSymbol;
                let score = minimax(board, depth + 1, false, alpha, beta);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = userSymbol;
                let score = minimax(board, depth + 1, true, alpha, beta);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    }
}

function checkWinForSymbol(symbol) {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState[a] === symbol && 
            gameState[a] === gameState[b] && 
            gameState[a] === gameState[c]) {
            return true;
        }
    }
    return false;
}

function checkWin() {
    return checkWinForSymbol(currentPlayer === "Human" ? userSymbol : aiSymbol);
}

function resetGame() {
    gameState = ["", "", "", "", "", "", "", "", ""];
    document.querySelectorAll(".cell").forEach(cell => {
        cell.innerText = "";
    });
    currentPlayer = "Human";
    // Show the symbol selection box again
    const askBox = document.getElementById("ask");
    askBox.classList.remove("hidden"); // Show symbol selection box
    const grid = document.querySelector(".grid-container");
    grid.classList.add("hidden"); // Hide grid
}

function updateScore(winner) {
    if (winner === "Human") {
        humanScore++;
        localStorage.setItem("humanScore", humanScore);
        document.getElementById("humanWins").innerText = humanScore;
    } else if (winner === "Engine") {
        engineScore++;
        localStorage.setItem("engineScore", engineScore);
        document.getElementById("engineWins").innerText = engineScore;
    }
}

function updateTieCount() {
    tieScore++;
    localStorage.setItem("tieScore", tieScore);
    document.getElementById("ties").innerText = tieScore;
}
