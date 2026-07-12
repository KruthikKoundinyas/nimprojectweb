// one-player.js - Stats tracking and enhanced features for single-player mode

$(document).ready(function () {
  loadAndDisplayStats();
});

// --- STATISTICS ---

function loadAndDisplayStats() {
  var stats = getStats();
  displayStats(stats);
  $("#stats-panel").show();
}

function getStats() {
  try {
    var saved = localStorage.getItem("nimlab_stats");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return { wins: 0, losses: 0, streak: 0, highestStreak: 0, byDifficulty: {} };
}

function saveStats(stats) {
  try {
    localStorage.setItem("nimlab_stats", JSON.stringify(stats));
  } catch (e) {}
}

function displayStats(stats) {
  $("#stats-panel .wins").text(stats.wins);
  $("#stats-panel .losses").text(stats.losses);
  $("#stats-panel .streak").text(stats.streak);
  $("#stats-panel .highest-streak").text(stats.highestStreak);
}

// Override endGame via checkGameOver - hook into the game over state
var _originalCheckGameOver = checkGameOver;
checkGameOver = function (lastMover) {
  var result = _originalCheckGameOver(lastMover);
  if (result) {
    var winner = (lastMover === "player") ? "ai" : "player";
    recordGameResult(winner);
  }
  return result;
};

function recordGameResult(winner) {
  var stats = getStats();
  var diff = gameState.difficulty;

  if (!stats.byDifficulty[diff]) {
    stats.byDifficulty[diff] = { wins: 0, losses: 0 };
  }

  if (winner === "player") {
    stats.wins++;
    stats.streak++;
    stats.highestStreak = Math.max(stats.highestStreak, stats.streak);
    stats.byDifficulty[diff].wins++;
  } else {
    stats.losses++;
    stats.streak = 0;
    stats.byDifficulty[diff].losses++;
  }

  saveStats(stats);
  displayStats(stats);
}
