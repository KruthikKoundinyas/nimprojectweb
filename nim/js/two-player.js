// Game state variables
let currentPlayer = 1;
let gameStarted = false;
let gameOver = false;
let selectedRow = null;

const gameState = {
  soundEnabled: true,
  scores: {
    player1: 0,
    player2: 0,
  },
};

const buttonSound = new Audio("./assets/audio/buttonPressSound.mp3");
buttonSound.preload = "auto";

$(document).ready(function () {
  // Hide game board initially
  $("#game-board").hide();

  // Create and add scoreboard
  createScoreboard();

  // Add sound toggle button
  $('<button id="sound-toggle" class="button">Sound: ON</button>')
    .insertAfter(".controls")
    .on("click", function () {
      gameState.soundEnabled = !gameState.soundEnabled;
      $(this).text(`Sound: ${gameState.soundEnabled ? "ON" : "OFF"}`);
    });

  // Add new game button
  $('<button id="new-game" class="button">New Game</button>')
    .insertAfter("#sound-toggle")
    .on("click", function () {
      resetGame();
    });

  // Handle row selection with event delegation
  $(document).on("click", ".row", function () {
    if (!gameStarted || gameOver) return;

    // Don't allow selection of empty rows
    if ($(this).find(".btn:visible").length === 0) {
      return;
    }

    // Handle row selection/deselection
    handleRowSelection($(this));
  });

  // Handle button clicks with event delegation
  $(document).on("click", ".btn", function (e) {
    if (!gameStarted || gameOver) return;

    // Stop event propagation to prevent triggering the row click handler
    e.stopPropagation();

    const $row = $(this).closest(".row");

    // First ensure a row is selected
    if (!$row.hasClass("active-row")) {
      handleRowSelection($row);
    }

    // Toggle button selection
    $(this).toggleClass("selected");

    if (gameState.soundEnabled) {
      buttonSound.currentTime = 0;
      buttonSound.play();
    }
  });

  // Next button handler
  $(".next").click(function () {
    if (!gameStarted) {
      startGame();
      return;
    }

    if (!selectedRow) {
      alert("Please select a row first!");
      return;
    }

    const pressedButtons = $(".active-row .btn.selected").length;
    if (pressedButtons === 0) {
      alert("You must select at least one piece to remove!");
      return;
    }

    processTurn();
  });

  $(".restart").click(function () {
    if (gameStarted) {
      resetGame();
      gameState.scores.player1 = 0;
      gameState.scores.player2 = 0;
      updateScoreboard();
      $("#level-title").text("Game restarted! Select a row to start.");
    } else {
      alert("Game not started yet!");
    }
  });
});

// Create scoreboard elements
function createScoreboard() {
  const scoreboard = $('<div id="scoreboard"></div>').css({
    display: "flex",
    "justify-content": "space-around",
    margin: "20px 0",
    padding: "10px",
    "background-color": "#f0f0f0",
    "border-radius": "5px",
    "box-shadow": "0 2px 5px rgba(0,0,0,0.1)",
  });

  const player1Score = $(
    '<div class="score-container"><h3>Player 1</h3><p class="score">0</p></div>'
  );
  const player2Score = $(
    '<div class="score-container"><h3>Player 2</h3><p class="score">0</p></div>'
  );

  scoreboard.append(player1Score, player2Score);

  // Add styles for score containers
  $("<style>")
    .prop("type", "text/css")
    .html(
      `
      .score-container {
        text-align: center;
        padding: 10px;
      }
      .score {
        font-size: 24px;
        font-weight: bold;
        margin: 5px 0;
      }
    `
    )
    .appendTo("head");

  scoreboard.insertAfter("#level-title");
}

// Update scoreboard display
function updateScoreboard() {
  $("#scoreboard .score-container:nth-child(1) .score").text(
    gameState.scores.player1
  );
  $("#scoreboard .score-container:nth-child(2) .score").text(
    gameState.scores.player2
  );
}

// Handle row selection logic
function handleRowSelection($row) {
  // If we already have a selected row, deselect it
  if (selectedRow) {
    selectedRow.removeClass("active-row");
    selectedRow.find(".btn").removeClass("selected");
  }

  // If clicking the same row, just deselect it
  if (selectedRow && selectedRow.get(0) === $row.get(0)) {
    selectedRow = null;
    return;
  }

  // Select the new row
  $row.addClass("active-row");
  selectedRow = $row;
}

// Start the game
function startGame() {
  gameStarted = true;
  $("#game-board").show();
  $(".container").hide();
  updateTurnDisplay();
}

// Process a completed turn
function processTurn() {
  // Hide selected buttons
  $(".btn.selected").hide().removeClass("selected");

  // Remove row selection
  if (selectedRow) {
    selectedRow.removeClass("active-row");
    selectedRow = null;
  }

  // Check for game over
  if ($(".btn:visible").length === 0) {
    gameOver = true;

    // Update scores
    if (currentPlayer === 1) {
      gameState.scores.player1++;
    } else {
      gameState.scores.player2++;
    }

    updateScoreboard();

    // Update display
    $("#level-title").text(`Player ${currentPlayer} wins!`);

    // Add option to play again
    if (!$("#play-again").length) {
      $('<button id="play-again" class="button">Play Again</button>')
        .insertAfter(".next")
        .on("click", function () {
          resetGame();
          $(this).remove();
        });
    }

    return;
  }

  // Switch players and update display
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateTurnDisplay();
}

// Reset the game for a new round
function resetGame() {
  // Reset game state
  gameStarted = gameOver ? false : true;
  gameOver = false;
  selectedRow = null;

  // Show all buttons
  $(".btn").show().removeClass("selected");
  $(".row").removeClass("active-row");

  // If this is a new game after a completed one, start immediately
  if (!gameStarted) {
    startGame();
  } else {
    // Otherwise just update the display
    updateTurnDisplay();
  }
}

// Update the turn display
function updateTurnDisplay() {
  $("#level-title").text(`Player ${currentPlayer}'s Turn`);
}
