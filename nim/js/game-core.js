// game-core.js - Core game logic for NimLab

// Game state
const gameState = {
  rows: [1, 3, 5],
  initialRows: [1, 3, 5],
  currentPlayer: "player",
  gameOver: false,
  gameStarted: false,
  difficulty: "random",
  selectedButtons: [],
  turnInProgress: false,
  soundEnabled: true,
  moveHistory: [],
  moveCount: 0,
  generation: 0,
};

// Audio
const buttonSound = new Audio("./assets/audio/buttonPressSound.mp3");
buttonSound.preload = "auto";

// --- GAME BOARD RENDERING ---

function buildGameBoard() {
  const $board = $("#game-board");
  $board.empty();

  for (let rowIndex = 0; rowIndex < gameState.rows.length; rowIndex++) {
    const count = gameState.rows[rowIndex];
    const $row = $('<div class="row"></div>').attr("id", "row" + (rowIndex + 1));
    $row.append('<span class="row-label">Heap ' + (rowIndex + 1) + " (" + count + ")</span>");

    for (let i = 0; i < count; i++) {
      const $btn = $('<div class="btn" tabindex="0" role="button"></div>');
      $btn.attr("data-row", rowIndex);
      $btn.attr("data-index", i);
      $btn.attr("aria-label", "Stone " + (i + 1) + " in Heap " + (rowIndex + 1));
      $row.append($btn);
    }
    $board.append($row);
  }
}

function renderGameBoard() {
  for (let rowIndex = 0; rowIndex < gameState.rows.length; rowIndex++) {
    const $row = $("#row" + (rowIndex + 1));
    const $buttons = $row.find(".btn");
    const remaining = gameState.rows[rowIndex];

    $buttons.each(function (i) {
      if (i < remaining) {
        $(this).show().removeClass("selected");
      } else {
        $(this).hide().removeClass("selected");
      }
    });

    $row.find(".row-label").text("Heap " + (rowIndex + 1) + " (" + remaining + ")");
  }
}

// --- EVENT LISTENERS ---

function setupEventListeners() {
  $(document).on("keydown", "#game-board .btn", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      $(this).trigger("click");
    }
  });

  $(document).on("click", "#game-board .btn", function () {
    if (gameState.gameOver || gameState.currentPlayer !== "player" || gameState.turnInProgress || !gameState.gameStarted) {
      return;
    }
    if (!$(this).is(":visible")) return;

    const rowIndex = parseInt($(this).attr("data-row"));

    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      gameState.selectedButtons = gameState.selectedButtons.filter(function (b) {
        return b !== this;
      }.bind(this));
      return;
    }

    // Ensure all selections are from the same row
    if (gameState.selectedButtons.length > 0) {
      const existingRow = parseInt($(gameState.selectedButtons[0]).attr("data-row"));
      if (existingRow !== rowIndex) {
        showMessage("You must select from the same heap!", "error");
        return;
      }
    }

    $(this).addClass("selected");
    gameState.selectedButtons.push(this);

    if (gameState.soundEnabled) {
      buttonSound.currentTime = 0;
      buttonSound.play().catch(function () {});
    }
  });

  $(".next").on("click", function () {
    if (!gameState.gameStarted) {
      startGame();
      return;
    }
    if (gameState.gameOver) {
      resetGame();
      return;
    }
    if (gameState.currentPlayer === "player") {
      playerMove();
    }
  });

  $(".restart").on("click", function () {
    resetGame();
  });

  $(".difficulty button, .diff-btn").on("click", function () {
    var diff = $(this).attr("data-difficulty") || $(this).attr("class").split(" ")[0];
    gameState.difficulty = diff;
    $(".difficulty button, .diff-btn").removeClass("active");
    $(this).addClass("active");
    showMessage("AI: " + getDifficultyLabel(diff), "info");
  });

  $("#sound-toggle").on("click", function () {
    gameState.soundEnabled = !gameState.soundEnabled;
    $(this).text("Sound: " + (gameState.soundEnabled ? "ON" : "OFF"));
  });

  $("#btn-random-board").on("click", function () {
    var numHeaps = 2 + Math.floor(Math.random() * 3);
    var heaps = [];
    for (var i = 0; i < numHeaps; i++) {
      heaps.push(1 + Math.floor(Math.random() * 7));
    }
    $("#heap-config").val(heaps.join(","));
    if (!gameState.gameStarted) {
      showMessage("Board: [" + heaps.join(", ") + "]", "info");
    }
  });

  // Theme toggle
  $(".theme-toggle").on("click", function () {
    $("body").toggleClass("dark-mode");
    if ($("body").hasClass("dark-mode")) {
      $(this).text("☀️");
      localStorage.setItem("nimlab-theme", "dark");
    } else {
      $(this).text("🌙");
      localStorage.setItem("nimlab-theme", "light");
    }
  });

  if (localStorage.getItem("nimlab-theme") === "dark") {
    $("body").addClass("dark-mode");
    $(".theme-toggle").text("☀️");
  }
}

function getDifficultyLabel(diff) {
  var labels = { random: "Random", greedy: "Greedy", optimal: "Optimal (XOR)", qlearning: "Q-Learning" };
  return labels[diff] || diff;
}

// --- GAME FLOW ---

function startGame() {
  var configVal = $("#heap-config").val().trim();
  var heaps = configVal.split(",").map(function (s) { return parseInt(s.trim()); });

  // Validate
  if (heaps.some(isNaN) || heaps.some(function (n) { return n < 1; }) || heaps.length < 2) {
    showMessage("Invalid board config. Use comma-separated numbers ≥ 1 (min 2 heaps).", "error");
    return;
  }
  if (heaps.length > 6) {
    showMessage("Maximum 6 heaps allowed.", "error");
    return;
  }
  if (heaps.some(function (n) { return n > 10; })) {
    showMessage("Maximum heap size is 10.", "error");
    return;
  }

  gameState.rows = heaps.slice();
  gameState.initialRows = heaps.slice();
  gameState.gameStarted = true;
  gameState.gameOver = false;
  gameState.currentPlayer = "player";
  gameState.selectedButtons = [];
  gameState.turnInProgress = false;
  gameState.moveHistory = [];
  gameState.moveCount = 0;

  buildGameBoard();
  updateUI();
  updateInspector();
  showMoveLog();

  $(".next").text("Confirm Move");
  $("#level-title").text("Your Turn");
  showMessage("Game started! Select stones from one heap, then confirm.", "info");
}

function playerMove() {
  if (gameState.selectedButtons.length === 0) {
    showMessage("Select at least one stone to remove!", "error");
    return;
  }

  gameState.turnInProgress = true;

  var rowIndex = parseInt($(gameState.selectedButtons[0]).attr("data-row"));
  var count = gameState.selectedButtons.length;

  // Safeguard: validate move
  if (count > gameState.rows[rowIndex]) {
    showMessage("Invalid move — not enough stones in that heap.", "error");
    gameState.turnInProgress = false;
    return;
  }

  // Record move
  gameState.moveCount++;
  gameState.moveHistory.push({
    player: "You",
    heap: rowIndex + 1,
    removed: count,
    board: gameState.rows.slice(),
  });

  gameState.rows[rowIndex] -= count;
  gameState.selectedButtons = [];

  renderGameBoard();
  appendMoveLog("You", rowIndex + 1, count);

  if (checkGameOver("player")) {
    gameState.turnInProgress = false;
    return;
  }

  gameState.currentPlayer = "ai";
  updateUI();
  updateInspector();

  var gen = gameState.generation;
  setTimeout(function () {
    if (gameState.generation !== gen) return;
    aiMove();
  }, 800);
}

function aiMove() {
  if (gameState.gameOver) return;
  gameState.turnInProgress = true;

  var move;
  switch (gameState.difficulty) {
    case "random": move = makeRandomMove(); break;
    case "greedy": move = makeGreedyMove(); break;
    case "optimal": move = makeOptimalMove(); break;
    case "qlearning": move = makeQLearningMove(); break;
    default: move = makeRandomMove();
  }

  // Safeguard
  if (!move || move.count <= 0 || move.row < 0 || move.row >= gameState.rows.length || move.count > gameState.rows[move.row]) {
    move = makeFallbackMove();
  }

  gameState.moveCount++;
  gameState.moveHistory.push({
    player: "AI (" + getDifficultyLabel(gameState.difficulty) + ")",
    heap: move.row + 1,
    removed: move.count,
    board: gameState.rows.slice(),
  });

  visualizeAIMove(move.row, move.count);
}

function makeFallbackMove() {
  for (var i = 0; i < gameState.rows.length; i++) {
    if (gameState.rows[i] > 0) {
      return { row: i, count: 1 };
    }
  }
  return { row: 0, count: 1 };
}

// --- AI STRATEGIES ---

function makeRandomMove() {
  var nonEmpty = [];
  for (var i = 0; i < gameState.rows.length; i++) {
    if (gameState.rows[i] > 0) nonEmpty.push(i);
  }
  var row = nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
  var count = 1 + Math.floor(Math.random() * gameState.rows[row]);
  return { row: row, count: count };
}

function makeGreedyMove() {
  // Takes the most from the largest heap, but 40% chance of random
  if (Math.random() < 0.4) return makeRandomMove();

  var maxRow = 0;
  for (var i = 1; i < gameState.rows.length; i++) {
    if (gameState.rows[i] > gameState.rows[maxRow]) maxRow = i;
  }
  var count = Math.max(1, Math.floor(gameState.rows[maxRow] / 2));
  return { row: maxRow, count: count };
}

function makeOptimalMove() {
  // Correct Misère Nim strategy
  var rows = gameState.rows;
  var nimSum = 0;
  for (var i = 0; i < rows.length; i++) nimSum ^= rows[i];

  // Check if we're in the endgame (all heaps ≤ 1)
  var heapsAboveOne = 0;
  var nonEmptyHeaps = 0;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i] > 1) heapsAboveOne++;
    if (rows[i] > 0) nonEmptyHeaps++;
  }

  // Misère endgame: all heaps are 0 or 1
  if (heapsAboveOne === 0) {
    // Leave odd number of heaps (opponent takes last)
    if (nonEmptyHeaps % 2 === 0) {
      // Take one stone from any heap of size 1
      for (var i = 0; i < rows.length; i++) {
        if (rows[i] === 1) return { row: i, count: 1 };
      }
    }
    // Already odd — any move is forced
    return makeRandomMove();
  }

  // Misère mid-game: if exactly one heap > 1
  if (heapsAboveOne === 1) {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i] > 1) {
        // Count heaps of size 1
        var onesCount = nonEmptyHeaps - 1;
        // Leave odd number of size-1 heaps total (misère)
        var target = (onesCount % 2 === 0) ? 1 : 0;
        return { row: i, count: rows[i] - target };
      }
    }
  }

  // Normal Nim strategy: make nimSum = 0
  if (nimSum === 0) {
    return makeRandomMove();
  }

  for (var i = 0; i < rows.length; i++) {
    if (rows[i] > 0) {
      var target = rows[i] ^ nimSum;
      if (target < rows[i]) {
        return { row: i, count: rows[i] - target };
      }
    }
  }

  return makeRandomMove();
}

function makeQLearningMove() {
  var state = gameState.rows.slice();
  var action = chooseAction(state, 0.05);
  if (!action) return makeGreedyMove();
  return action;
}

// --- MOVE VISUALIZATION ---

function visualizeAIMove(rowIndex, count) {
  var gen = gameState.generation;
  var $row = $("#row" + (rowIndex + 1));
  var $visible = $row.find(".btn:visible");
  var $toRemove = $visible.slice(-count);
  var processed = 0;

  function animateNext() {
    if (gameState.generation !== gen) return;
    if (processed < $toRemove.length) {
      $($toRemove[processed]).addClass("selected");
      if (gameState.soundEnabled) {
        buttonSound.currentTime = 0;
        buttonSound.play().catch(function () {});
      }
      processed++;
      setTimeout(animateNext, 250);
    } else {
      setTimeout(function () {
        if (gameState.generation !== gen) return;
        completeAIMove(rowIndex, count);
      }, 600);
    }
  }
  animateNext();
}

function completeAIMove(rowIndex, count) {
  gameState.rows[rowIndex] -= count;
  $(".btn").removeClass("selected");

  renderGameBoard();
  appendMoveLog("AI", rowIndex + 1, count);

  if (checkGameOver("ai")) return;

  gameState.currentPlayer = "player";
  gameState.turnInProgress = false;
  gameState.selectedButtons = [];
  updateUI();
  updateInspector();
  $("#game-board .btn:visible:first").trigger("focus");
}

// --- GAME END ---

function checkGameOver(lastMover) {
  var totalRemaining = 0;
  for (var i = 0; i < gameState.rows.length; i++) totalRemaining += gameState.rows[i];

  if (totalRemaining === 0) {
    gameState.gameOver = true;
    // Misère: the player who took the last stone loses
    var winner = (lastMover === "player") ? "AI" : "You";
    var loser = (lastMover === "player") ? "You" : "AI";

    $("#level-title").text(winner + " Win" + (winner === "You" ? "!" : "s!"));
    $(".turn-indicator, #turn-indicator").text(winner + " Win" + (winner === "You" ? "!" : "s!"));
    $(".next").text("New Game");
    gameState.turnInProgress = false;

    updateInspectorGameOver(winner, loser);

    if (gameState.difficulty === "qlearning") {
      saveQValues();
    }

    return true;
  }
  return false;
}

// --- RESET ---

function resetGame() {
  gameState.generation++;
  gameState.rows = gameState.initialRows.slice();
  gameState.gameStarted = false;
  gameState.gameOver = true;
  gameState.currentPlayer = "player";
  gameState.selectedButtons = [];
  gameState.turnInProgress = false;
  gameState.moveHistory = [];
  gameState.moveCount = 0;

  buildGameBoard();

  $(".next").prop("disabled", false);
  $("#level-title").text("Choose Difficulty & Press Start");
  $(".turn-indicator, #turn-indicator").text("Your Turn").removeClass("player ai");
  $(".next").text("Start");
  $("#move-log").hide();
  $("#inspector-content").html('<p class="inspector-placeholder">Start a game to see AI analysis</p>');

  gameState.gameOver = false;
}

// --- UI UPDATES ---

function updateUI() {
  if (!gameState.gameStarted || gameState.gameOver) return;

  var turnText = gameState.currentPlayer === "player" ? "Your Turn" : "AI Thinking...";
  $(".turn-indicator, #turn-indicator").text(turnText).removeClass("player ai").addClass(gameState.currentPlayer);
  $("#level-title").text(turnText);

  $(".next").prop("disabled", gameState.currentPlayer === "ai");
}

function showMessage(message, type) {
  var $msg = $("#game-message");
  if ($msg.length === 0) {
    $msg = $('<div id="game-message"></div>');
    $(".controls").after($msg);
  }
  $msg.text(message).removeClass("info error success").addClass(type).fadeIn(200);
  setTimeout(function () { $msg.fadeOut(500); }, 3000);
}

// --- MOVE LOG ---

function showMoveLog() {
  $("#move-log").show();
  $("#log-entries").empty();
}

function appendMoveLog(player, heap, count) {
  var entry = '<div class="log-entry ' + (player === "You" ? "player" : "ai") + '">';
  entry += "<span class='log-player'>" + player + ":</span> ";
  entry += "Removed " + count + " from Heap " + heap;
  entry += " → [" + gameState.rows.join(", ") + "]";
  entry += "</div>";
  var $entries = $("#log-entries");
  $entries.append(entry);
  if ($entries[0]) $entries.scrollTop($entries[0].scrollHeight);
}

// --- ALGORITHM INSPECTOR ---

function updateInspector() {
  var rows = gameState.rows;
  var nimSum = 0;
  for (var i = 0; i < rows.length; i++) nimSum ^= rows[i];

  var totalStones = 0;
  for (var i = 0; i < rows.length; i++) totalStones += rows[i];

  // Calculate optimal move
  var optimalMove = calculateOptimalMove(rows);

  var html = "";

  // Current board state
  html += '<div class="insp-section">';
  html += "<h4>Board State</h4>";
  html += '<div class="insp-board">';
  for (var i = 0; i < rows.length; i++) {
    html += '<div class="insp-heap">Heap ' + (i + 1) + ': <strong>' + rows[i] + "</strong>";
    html += ' <span class="insp-binary">(' + rows[i].toString(2).padStart(4, "0") + ")</span></div>";
  }
  html += "</div></div>";

  // Nim Sum
  html += '<div class="insp-section">';
  html += "<h4>Nim Sum (XOR)</h4>";
  html += '<div class="insp-nimsum">';
  html += '<span class="nimsum-value">' + nimSum + "</span>";
  html += ' <span class="insp-binary">(' + nimSum.toString(2).padStart(4, "0") + ")</span>";
  html += "</div>";

  if (nimSum !== 0) {
    html += '<div class="insp-verdict winning">Winning position (for mover)</div>';
  } else {
    html += '<div class="insp-verdict losing">Losing position (for mover)</div>';
  }
  html += "</div>";

  // Optimal move
  if (optimalMove && totalStones > 0) {
    html += '<div class="insp-section">';
    html += "<h4>Optimal Move</h4>";
    html += '<div class="insp-move">Remove <strong>' + optimalMove.count + "</strong> from Heap <strong>" + (optimalMove.row + 1) + "</strong></div>";
    html += '<div class="insp-reason">' + optimalMove.reason + "</div>";
    html += "</div>";
  }

  // AI difficulty info
  html += '<div class="insp-section">';
  html += "<h4>Current AI: " + getDifficultyLabel(gameState.difficulty) + "</h4>";
  html += '<div class="insp-desc">' + getAIDescription(gameState.difficulty) + "</div>";
  html += "</div>";

  // Q-Learning specific info
  if (gameState.difficulty === "qlearning") {
    var stateKey = stateToKey(rows);
    var stateQ = qValues[stateKey];
    if (stateQ) {
      var actionCount = Object.keys(stateQ).length;
      var bestVal = -Infinity;
      var bestAction = "";
      for (var key in stateQ) {
        if (stateQ[key] > bestVal) {
          bestVal = stateQ[key];
          bestAction = key;
        }
      }
      html += '<div class="insp-section">';
      html += "<h4>Q-Learning Info</h4>";
      html += "<div>Known actions: " + actionCount + "</div>";
      html += "<div>Best Q-value: " + bestVal.toFixed(3) + "</div>";
      html += "<div>Best action: " + bestAction + "</div>";
      html += "</div>";
    }
  }

  $("#inspector-content").html(html);
}

function calculateOptimalMove(rows) {
  var nimSum = 0;
  for (var i = 0; i < rows.length; i++) nimSum ^= rows[i];

  var heapsAboveOne = 0;
  var nonEmpty = 0;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i] > 1) heapsAboveOne++;
    if (rows[i] > 0) nonEmpty++;
  }

  // Endgame
  if (heapsAboveOne === 0) {
    if (nonEmpty % 2 === 0) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i] === 1) return { row: i, count: 1, reason: "Misère endgame: leave odd number of size-1 heaps so opponent takes last." };
      }
    }
    return { row: -1, count: 0, reason: "Losing endgame position — any move leads to a loss." };
  }

  // One heap > 1
  if (heapsAboveOne === 1) {
    for (var i = 0; i < rows.length; i++) {
      if (rows[i] > 1) {
        var onesCount = nonEmpty - 1;
        var target = (onesCount % 2 === 0) ? 1 : 0;
        var reason = "Only one heap > 1. Reduce to " + target + " to leave opponent with an odd number of remaining stones.";
        return { row: i, count: rows[i] - target, reason: reason };
      }
    }
  }

  if (nimSum === 0) {
    return { row: -1, count: 0, reason: "Nim Sum = 0. No winning move exists — any move helps the opponent." };
  }

  for (var i = 0; i < rows.length; i++) {
    if (rows[i] > 0) {
      var target = rows[i] ^ nimSum;
      if (target < rows[i]) {
        var reason = "Heap " + (i + 1) + " XOR Nim Sum = " + target + ". Reducing to " + target + " makes new Nim Sum = 0, putting opponent in a losing position.";
        return { row: i, count: rows[i] - target, reason: reason };
      }
    }
  }

  return null;
}

function getAIDescription(diff) {
  var descs = {
    random: "Makes completely random legal moves. No strategy. Baseline for comparison.",
    greedy: "Tends to take from the largest heap. Sometimes random. Moderate difficulty.",
    optimal: "Uses the XOR (Nim Sum) strategy with Misère endgame awareness. Mathematically perfect play.",
    qlearning: "Learns from experience using Q-values. May not play optimally but improves over time.",
  };
  return descs[diff] || "";
}

function updateInspectorGameOver(winner, loser) {
  var html = '<div class="insp-section">';
  html += '<h4 class="insp-gameover">Game Over</h4>';
  html += "<div><strong>" + winner + "</strong> won!</div>";
  html += "<div>" + loser + " took the last stone (Misère rule).</div>";
  html += "</div>";

  html += '<div class="insp-section">';
  html += "<h4>Game Summary</h4>";
  html += "<div>Total moves: " + gameState.moveCount + "</div>";
  html += "<div>AI strategy: " + getDifficultyLabel(gameState.difficulty) + "</div>";
  html += "<div>Board: [" + gameState.initialRows.join(", ") + "]</div>";
  html += "</div>";

  $("#inspector-content").html(html);
}

// --- INIT ---

$(document).ready(function () {
  buildGameBoard();
  setupEventListeners();
});
