// two-player.js - Two player mode for NimLab

var currentPlayer = 1;
var gameStarted = false;
var gameOver = false;
var selectedButtons = [];
var selectedRow = null;
var heaps = [1, 3, 5];
var soundEnabled = true;

var buttonSound = new Audio("./assets/audio/buttonPressSound.mp3");
buttonSound.preload = "auto";

var scores = { player1: 0, player2: 0 };

$(document).ready(function () {
  setupTwoPlayer();
});

function setupTwoPlayer() {
  // Sound toggle
  $("#sound-toggle").on("click", function () {
    soundEnabled = !soundEnabled;
    $(this).text("Sound: " + (soundEnabled ? "ON" : "OFF"));
  });

  // Random board
  $("#btn-random-board-2p").on("click", function () {
    var numHeaps = 2 + Math.floor(Math.random() * 3);
    var h = [];
    for (var i = 0; i < numHeaps; i++) {
      h.push(1 + Math.floor(Math.random() * 7));
    }
    $("#heap-config-2p").val(h.join(","));
    showMsg("Board: [" + h.join(", ") + "]", "info");
  });

  // Button clicks
  $(document).on("click", "#game-board .btn", function () {
    if (!gameStarted || gameOver) return;
    if (!$(this).is(":visible")) return;

    var $row = $(this).closest(".row");
    var rowId = $row.attr("id");

    // Enforce same-row selection
    if (selectedButtons.length > 0 && selectedRow !== rowId) {
      showMsg("Select from the same heap only!", "error");
      return;
    }

    if ($(this).hasClass("selected")) {
      $(this).removeClass("selected");
      selectedButtons = selectedButtons.filter(function (b) { return b !== this; }.bind(this));
      if (selectedButtons.length === 0) selectedRow = null;
    } else {
      $(this).addClass("selected");
      selectedButtons.push(this);
      selectedRow = rowId;

      if (soundEnabled) {
        buttonSound.currentTime = 0;
        buttonSound.play().catch(function () {});
      }
    }
  });

  // Next/Start/Confirm
  $(".next").on("click", function () {
    if (!gameStarted) {
      startTwoPlayerGame();
      return;
    }
    if (gameOver) {
      resetTwoPlayer();
      return;
    }
    confirmMove();
  });

  // Restart
  $(".restart").on("click", function () {
    scores.player1 = 0;
    scores.player2 = 0;
    updateScoreboard();
    resetTwoPlayer();
  });

  // Theme
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

  createScoreboard();
}

function startTwoPlayerGame() {
  var configVal = $("#heap-config-2p").val().trim();
  var parsed = configVal.split(",").map(function (s) { return parseInt(s.trim()); });

  if (parsed.some(isNaN) || parsed.some(function (n) { return n < 1; }) || parsed.length < 2) {
    showMsg("Invalid config. Use comma-separated numbers >= 1 (min 2 heaps).", "error");
    return;
  }
  if (parsed.length > 6 || parsed.some(function (n) { return n > 10; })) {
    showMsg("Max 6 heaps, max size 10.", "error");
    return;
  }

  heaps = parsed.slice();
  gameStarted = true;
  gameOver = false;
  currentPlayer = 1;
  selectedButtons = [];
  selectedRow = null;

  buildBoard();
  updateDisplay();
  $(".next").text("Confirm Move");
}

function buildBoard() {
  var $board = $("#game-board");
  $board.empty();

  for (var i = 0; i < heaps.length; i++) {
    var $row = $('<div class="row"></div>').attr("id", "row" + (i + 1));
    $row.append('<span class="row-label">Heap ' + (i + 1) + " (" + heaps[i] + ")</span>");
    for (var j = 0; j < heaps[i]; j++) {
      $row.append('<button type="button" class="btn" data-row="' + i + '" data-index="' + j + '"></button>');
    }
    $board.append($row);
  }
}

function confirmMove() {
  if (selectedButtons.length === 0) {
    showMsg("Select at least one stone!", "error");
    return;
  }

  var rowIndex = parseInt($(selectedButtons[0]).attr("data-row"));
  var count = selectedButtons.length;

  if (count > heaps[rowIndex]) {
    showMsg("Invalid move.", "error");
    return;
  }

  heaps[rowIndex] -= count;
  selectedButtons = [];
  selectedRow = null;

  // Check game over
  var total = heaps.reduce(function (a, b) { return a + b; }, 0);
  if (total === 0) {
    gameOver = true;
    // Misère: last mover loses, so the other player wins
    var winner = (currentPlayer === 1) ? 2 : 1;
    scores["player" + winner]++;
    updateScoreboard();
    $("#level-title").text("Player " + winner + " Wins!");
    $("#turn-indicator").text("Player " + winner + " Wins!");
    $(".next").text("New Game");
    return;
  }

  currentPlayer = (currentPlayer === 1) ? 2 : 1;
  buildBoard();
  updateDisplay();
}

function resetTwoPlayer() {
  gameStarted = false;
  gameOver = false;
  currentPlayer = 1;
  selectedButtons = [];
  selectedRow = null;

  var configVal = $("#heap-config-2p").val().trim();
  var parsed = configVal.split(",").map(function (s) { return parseInt(s.trim()); });
  if (!parsed.some(isNaN) && parsed.length >= 2) {
    heaps = parsed.slice();
  } else {
    heaps = [1, 3, 5];
  }

  buildBoard();
  $("#level-title").text("Press Start to Begin");
  $("#turn-indicator").text("Player 1's Turn");
  $(".next").text("Start");
}

function updateDisplay() {
  $("#level-title").text("Player " + currentPlayer + "'s Turn");
  $("#turn-indicator").text("Player " + currentPlayer + "'s Turn");
}

function createScoreboard() {
  var html = '<div class="stats-panel" style="margin-top:20px">';
  html += "<h3>Score</h3>";
  html += '<div class="stats-content">';
  html += '<div class="stat-item"><span class="stat-label">P1:</span> <span id="score-p1">0</span></div>';
  html += '<div class="stat-item"><span class="stat-label">P2:</span> <span id="score-p2">0</span></div>';
  html += "</div></div>";
  $("#scoreboard").html(html);
}

function updateScoreboard() {
  $("#score-p1").text(scores.player1);
  $("#score-p2").text(scores.player2);
}

function showMsg(message, type) {
  var $msg = $("#game-message");
  if ($msg.length === 0) {
    $msg = $('<div id="game-message"></div>');
    $(".controls").after($msg);
  }
  $msg.text(message).removeClass("info error success").addClass(type).fadeIn(200);
  setTimeout(function () { $msg.fadeOut(500); }, 3000);
}
