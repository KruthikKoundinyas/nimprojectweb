// game-core.js - Core game logic for NIM game

// Game state
const gameState = {
  rows: [1, 3, 5], // Default NIM configuration: 1 object in row 1, 3 in row 2, 5 in row 3
  currentPlayer: "player", // 'player' or 'ai'
  gameOver: false,
  difficulty: "easy", // 'easy', 'medium', 'hard', 'q-learning'
  selectedButtons: [], // Keep track of currently selected buttons
  turnInProgress: false, // Flag to prevent multiple moves at once
  soundEnabled: true,
};

// Audio element for button press sound
const buttonSound = new Audio("./assets/audio/buttonPressSound.mp3");

// Initialize the game
function initGame() {
  // Set up the game board
  renderGameBoard();

  // Set up event listeners
  setupEventListeners();

  // Update UI elements
  updateUI();

  console.log("Game initialized");
}

// Render the game board based on current state
function renderGameBoard() {
  // Clear existing buttons
  $(".btn").removeClass("selected");

  // Hide all buttons initially
  $(".btn").hide();

  // Show buttons according to the current game state
  for (let rowIndex = 0; rowIndex < gameState.rows.length; rowIndex++) {
    const rowCount = gameState.rows[rowIndex];
    const $row = $(`#row${rowIndex + 1}`);

    // Show the correct number of buttons in each row
    $row.find(".btn").each(function (buttonIndex) {
      if (buttonIndex < rowCount) {
        $(this).show();
      }
    });
  }
}

// Set up event listeners
function setupEventListeners() {
  // Button click event
  $(".btn").on("click", function () {
    if (
      gameState.gameOver ||
      gameState.currentPlayer !== "player" ||
      gameState.turnInProgress
    ) {
      return;
    }

    // Check if button is already selected
    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      gameState.selectedButtons = gameState.selectedButtons.filter(
        (button) => button !== this
      );
    } else {
      // Check if button is in the same row as already selected buttons
      const rowId = $(this).parent().attr("id");

      if (
        gameState.selectedButtons.length === 0 ||
        $(gameState.selectedButtons[0]).parent().attr("id") === rowId
      ) {
        // Add to selected buttons
        $(this).addClass("selected");
        gameState.selectedButtons.push(this);

        // Play sound
        if (gameState.soundEnabled) {
          buttonSound.currentTime = 0;
          buttonSound.play();
        }
      } else {
        // Show error message (buttons must be from same row)
        showMessage("Select buttons from the same row only", "error");
      }
    }
  });

  // Next button click event
  $(".next").on("click", function () {
    if (gameState.gameOver) {
      resetGame();
      return;
    }

    if (gameState.currentPlayer === "player") {
      playerMove();
    } else {
      aiMove();
    }
  });

  // Restart button click event
  $(".restart").on("click", function () {
    resetGame();
  });

  // Difficulty buttons
  $(".difficulty button").on("click", function () {
    // Update difficulty
    gameState.difficulty = $(this).attr("class").split(" ")[0];

    // Update active class
    $(".difficulty button").removeClass("active");
    $(this).addClass("active");

    // Restart game if it's already over
    if (gameState.gameOver) {
      resetGame();
    }

    // Show appropriate message
    showMessage(
      `Difficulty set to ${
        gameState.difficulty.charAt(0).toUpperCase() +
        gameState.difficulty.slice(1)
      }`,
      "info"
    );
  });
}

// Player makes a move
function playerMove() {
  if (gameState.selectedButtons.length === 0) {
    showMessage("Select at least one button", "error");
    return;
  }

  gameState.turnInProgress = true;

  // Get row index from the first selected button
  const rowId = $(gameState.selectedButtons[0]).parent().attr("id");
  const rowIndex = parseInt(rowId.replace("row", "")) - 1;

  // Update game state
  gameState.rows[rowIndex] -= gameState.selectedButtons.length;

  // Check if game is over
  if (isGameOver()) {
    endGame("player");
    return;
  }

  // Switch to AI's turn
  gameState.currentPlayer = "ai";
  gameState.selectedButtons = [];

  // Update UI
  updateUI();

  // Schedule AI move after a short delay
  setTimeout(aiMove, 1000);
}

// AI makes a move
function aiMove() {
  if (gameState.gameOver) return;

  gameState.turnInProgress = true;

  // Determine move based on difficulty
  let move;

  switch (gameState.difficulty) {
    case "easy":
      move = makeEasyMove();
      break;
    case "medium":
      move = makeMediumMove();
      break;
    case "hard":
      move = makeHardMove();
      break;
    case "q-learning":
      move = makeQLearningMove();
      break;
    default:
      move = makeEasyMove();
  }

  // Visualize AI's move
  visualizeAIMove(move.row, move.count);
}

// Make an easy AI move (random)
function makeEasyMove() {
  // Find non-empty rows
  const nonEmptyRows = [];
  for (let i = 0; i < gameState.rows.length; i++) {
    if (gameState.rows[i] > 0) {
      nonEmptyRows.push(i);
    }
  }

  // Choose a random non-empty row
  const rowIndex =
    nonEmptyRows[Math.floor(Math.random() * nonEmptyRows.length)];

  // Choose a random number of objects to remove (1 to all in the row)
  const maxToRemove = gameState.rows[rowIndex];
  const count = Math.floor(Math.random() * maxToRemove) + 1;

  // Return the move
  return { row: rowIndex, count: count };
}

// Make a medium AI move (some strategy)
function makeMediumMove() {
  // 50% chance of making a strategic move, 50% chance of making a random move
  if (Math.random() < 0.5) {
    return makeHardMove();
  } else {
    return makeEasyMove();
  }
}

// Make a hard AI move (nim-sum strategy)
function makeHardMove() {
  // Calculate nim-sum
  let nimSum = gameState.rows.reduce((xor, count) => xor ^ count, 0);

  // If nim-sum is zero, make a random move
  if (nimSum === 0) {
    return makeEasyMove();
  }

  // Find a row where removing objects creates a zero nim-sum
  for (let i = 0; i < gameState.rows.length; i++) {
    if (gameState.rows[i] > 0) {
      const rowNimSum = nimSum ^ gameState.rows[i];

      // Check how many objects to remove to make nim-sum zero
      for (let remove = 1; remove <= gameState.rows[i]; remove++) {
        if ((gameState.rows[i] - remove) ^ (rowNimSum === 0)) {
          return { row: i, count: remove };
        }
      }
    }
  }

  // If no winning move found, remove one object from the row with the most objects
  const maxRowIndex = gameState.rows.indexOf(Math.max(...gameState.rows));
  return { row: maxRowIndex, count: 1 };
}

// Make a Q-learning based move
function makeQLearningMove() {
  // Convert current game state to the format used by Q-learning
  const state = [...gameState.rows];

  // Choose action using Q-learning algorithm
  const action = chooseAction(state);

  // If no action found (unlikely), fall back to medium difficulty
  if (!action) {
    return makeMediumMove();
  }

  return action;
}

// Visualize AI's move
// Visualize AI's move (continued)
function visualizeAIMove(rowIndex, count) {
  // Get the row
  const $row = $(`#row${rowIndex + 1}`);

  // Get the visible buttons in the row
  const $visibleButtons = $row.find(".btn:visible");

  // Highlight buttons from right to left
  const buttonsToRemove = $visibleButtons.slice(-count);

  // Animate selection
  let buttonsProcessed = 0;

  function animateNextButton() {
    if (buttonsProcessed < buttonsToRemove.length) {
      $(buttonsToRemove[buttonsProcessed]).addClass("selected");

      // Play sound
      if (gameState.soundEnabled) {
        buttonSound.currentTime = 0;
        buttonSound.play();
      }

      buttonsProcessed++;
      setTimeout(animateNextButton, 300); // Add delay between button selections
    } else {
      // After all buttons are highlighted, complete the move
      setTimeout(completeAIMove, 800, rowIndex, count);
    }
  }

  // Start animation
  animateNextButton();
}

// Complete AI's move after visualization
function completeAIMove(rowIndex, count) {
  // Update game state
  gameState.rows[rowIndex] -= count;

  // Check if game is over
  if (isGameOver()) {
    endGame("ai");
    return;
  }

  // Clear selected buttons
  $(".btn").removeClass("selected");

  // Switch to player's turn
  gameState.currentPlayer = "player";
  gameState.turnInProgress = false;
  gameState.selectedButtons = [];

  // Update UI
  renderGameBoard();
  updateUI();

  // If using Q-learning, update Q-values based on the move's outcome
  if (gameState.difficulty === "q-learning") {
    // Record state transition for learning
    const oldState = [...gameState.rows];
    oldState[rowIndex] += count; // Previous state
    const action = { row: rowIndex, count: count };
    const newState = [...gameState.rows];

    // Reward is 0 for non-terminal states
    updateQValues(oldState, action, 0, newState);
  }
}

// Check if the game is over
function isGameOver() {
  return gameState.rows.every((count) => count === 0);
}

// End the game and declare winner
function endGame(lastPlayer) {
  gameState.gameOver = true;

  // In NIM, the player who takes the last object loses
  const winner = lastPlayer === "player" ? "AI" : "Player";

  // Update UI
  $("#level-title").text(`Game Over! ${winner} Wins!`);
  $(".turn-indicator").text(`${winner} Wins!`).addClass(winner.toLowerCase());

  // Change next button text
  $(".next").text("New Game");

  // If AI was using Q-learning, update Q-values with final reward
  if (gameState.difficulty === "q-learning" && lastPlayer === "ai") {
    // Get the last state and action
    const finalState = [...gameState.rows];
    // We don't have the exact action here, but we can reconstruct it
    // from the game state history (would require additional tracking)

    // For now, approximate with a placeholder reward
    // Negative reward if AI lost, positive if AI won
    const reward = lastPlayer === "ai" ? -10 : 10;

    // Update Q-values for this final state
    // This is simplified; in a full implementation we would track exact state-action pairs
    saveQValues(); // Save learning progress
  }
}

// Reset the game
function resetGame() {
  // Reset game state
  gameState.rows = [1, 3, 5]; // Default NIM configuration
  gameState.currentPlayer = "player";
  gameState.gameOver = false;
  gameState.selectedButtons = [];
  gameState.turnInProgress = false;

  // Reset UI
  $("#level-title").text("Your Turn");
  $(".turn-indicator").text("Your Turn").removeClass("ai").addClass("player");
  $(".next").text("Next");

  // Render game board
  renderGameBoard();

  // Update UI
  updateUI();
}

// Update UI elements based on current game state
function updateUI() {
  // Update turn indicator
  if (!gameState.gameOver) {
    const turnText =
      gameState.currentPlayer === "player" ? "Your Turn" : "AI Thinking...";
    $(".turn-indicator")
      .text(turnText)
      .removeClass("player ai")
      .addClass(gameState.currentPlayer);

    // Update main title
    $("#level-title").text(turnText);
  }

  // Enable/disable next button
  if (gameState.currentPlayer === "ai" && !gameState.gameOver) {
    $(".next").prop("disabled", true);
  } else {
    $(".next").prop("disabled", false);
  }
}

// Show a message to the user
function showMessage(message, type = "info") {
  // Create message element if it doesn't exist
  if ($("#game-message").length === 0) {
    $('<div id="game-message"></div>').insertAfter("#game-board");
  }

  // Set message content and style
  $("#game-message")
    .text(message)
    .removeClass("info error success")
    .addClass(type)
    .fadeIn(200);

  // Hide after 3 seconds
  setTimeout(() => {
    $("#game-message").fadeOut(500);
  }, 3000);
}

// Toggle sound effects
function toggleSound() {
  gameState.soundEnabled = !gameState.soundEnabled;
  const status = gameState.soundEnabled ? "on" : "off";
  showMessage(`Sound ${status}`, "info");
}

// Initialize the game when document is ready
$(document).ready(function () {
  initGame();
});
