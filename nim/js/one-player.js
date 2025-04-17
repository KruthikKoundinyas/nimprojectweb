// one-player.js - Implementation for one player mode against AI

// Additional settings for one-player mode
const onePlayerSettings = {
  aiThinkingTime: {
    easy: { min: 500, max: 1500 },
    medium: { min: 800, max: 2000 },
    hard: { min: 1200, max: 2500 },
    "q-learning": { min: 1000, max: 2000 },
  },
  aiPersonality: {
    easy: {
      name: "Novice AI",
      messages: [
        "Hmm, let me try this...",
        "I'm still learning this game!",
        "Was that a good move?",
        "Your turn now!",
      ],
    },
    medium: {
      name: "Smart AI",
      messages: [
        "I see what you did there...",
        "Interesting choice!",
        "I think this is a good move.",
        "Getting challenging!",
      ],
    },
    hard: {
      name: "Master AI",
      messages: [
        "Calculating optimal move...",
        "I've analyzed all possibilities.",
        "This game follows mathematical patterns.",
        "A perfect move exists for every state.",
      ],
    },
    "q-learning": {
      name: "Learning AI",
      messages: [
        "I'm learning from our games!",
        "Each move teaches me something new.",
        "Let me try something I learned...",
        "My strategy is evolving!",
      ],
    },
  },
  streaks: {
    player: 0,
    ai: 0,
  },
};

// Enhanced AI move with personality and animations
function enhancedAIMove() {
  if (gameState.gameOver) return;

  // Show thinking animation
  showAIThinking();

  // Get AI personality based on difficulty
  const personality = onePlayerSettings.aiPersonality[gameState.difficulty];

  // Get random thinking time based on difficulty
  const thinkTime = onePlayerSettings.aiThinkingTime[gameState.difficulty];
  const randomThinkTime =
    Math.floor(Math.random() * (thinkTime.max - thinkTime.min + 1)) +
    thinkTime.min;

  // Show AI thinking message
  const randomMessage =
    personality.messages[
      Math.floor(Math.random() * personality.messages.length)
    ];
  showAIMessage(randomMessage);

  // Make move after "thinking"
  setTimeout(() => {
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

    // Hide thinking animation
    hideAIThinking();

    // Visualize AI's move
    visualizeAIMove(move.row, move.count);
  }, randomThinkTime);
}

// Show AI thinking animation
function showAIThinking() {
  // Create thinking indicator if it doesn't exist
  if ($("#ai-thinking").length === 0) {
    $(
      '<div id="ai-thinking" class="ai-thinking"><span>.</span><span>.</span><span>.</span></div>'
    ).insertAfter(".turn-indicator");
  }

  // Show thinking indicator
  $("#ai-thinking").show();

  // Animate dots
  let dotIndex = 0;
  const dots = $("#ai-thinking span");

  // Clear any existing animation interval
  clearInterval(window.thinkingInterval);

  // Set up animation
  window.thinkingInterval = setInterval(() => {
    dots.removeClass("active");
    $(dots[dotIndex]).addClass("active");
    dotIndex = (dotIndex + 1) % dots.length;
  }, 300);
}

// Hide AI thinking animation
function hideAIThinking() {
  clearInterval(window.thinkingInterval);
  $("#ai-thinking").hide();
}

// Show AI message
function showAIMessage(message) {
  // Create message element if it doesn't exist
  if ($("#ai-message").length === 0) {
    $('<div id="ai-message" class="ai-message"></div>').insertAfter(
      "#ai-thinking"
    );
  }

  // Show message with typing effect
  const $message = $("#ai-message");
  $message.empty().show();

  let charIndex = 0;
  const typeInterval = setInterval(() => {
    if (charIndex < message.length) {
      $message.append(message.charAt(charIndex));
      charIndex++;
    } else {
      clearInterval(typeInterval);

      // Hide message after delay
      setTimeout(() => {
        $message.fadeOut(500);
      }, 2000);
    }
  }, 50);
}

// Track game statistics
function updateGameStats(winner) {
  // Update streaks
  if (winner === "player") {
    onePlayerSettings.streaks.player++;
    onePlayerSettings.streaks.ai = 0;
  } else {
    onePlayerSettings.streaks.ai++;
    onePlayerSettings.streaks.player = 0;
  }

  // Update local storage stats
  let stats = JSON.parse(
    localStorage.getItem("nim_stats") ||
      '{"wins":0,"losses":0,"streak":0,"highestStreak":0}'
  );

  if (winner === "player") {
    stats.wins++;
    stats.streak++;
    stats.highestStreak = Math.max(stats.highestStreak, stats.streak);
  } else {
    stats.losses++;
    stats.streak = 0;
  }

  localStorage.setItem("nim_stats", JSON.stringify(stats));

  // Update stats display
  updateStatsDisplay(stats);
}

// Update stats display
function updateStatsDisplay(stats) {
  // Create stats panel if it doesn't exist
  if ($("#stats-panel").length === 0) {
    $(
      '<div id="stats-panel" class="stats-panel">' +
        "<h3>Your Stats</h3>" +
        '<div class="stats-content">' +
        '<div class="stat-item"><span class="stat-label">Wins:</span> <span class="wins">0</span></div>' +
        '<div class="stat-item"><span class="stat-label">Losses:</span> <span class="losses">0</span></div>' +
        '<div class="stat-item"><span class="stat-label">Current Streak:</span> <span class="streak">0</span></div>' +
        '<div class="stat-item"><span class="stat-label">Best Streak:</span> <span class="highest-streak">0</span></div>' +
        "</div>" +
        "</div>"
    ).insertAfter(".difficulty");
  }

  // Update stats values
  $("#stats-panel .wins").text(stats.wins);
  $("#stats-panel .losses").text(stats.losses);
  $("#stats-panel .streak").text(stats.streak);
  $("#stats-panel .highest-streak").text(stats.highestStreak);
}

// Override the aiMove function to use enhanced version
const originalAiMove = aiMove;
aiMove = enhancedAIMove;

// Override the endGame function to track stats
const originalEndGame = endGame;
endGame = function (lastPlayer) {
  originalEndGame(lastPlayer);

  // Update game stats
  const winner = lastPlayer === "player" ? "ai" : "player";
  updateGameStats(winner);
};

// Load game stats when document is ready
$(document).ready(function () {
  // Load and display stats
  const stats = JSON.parse(
    localStorage.getItem("nim_stats") ||
      '{"wins":0,"losses":0,"streak":0,"highestStreak":0}'
  );
  updateStatsDisplay(stats);

  // Add sound toggle button
  $('<button id="sound-toggle" class="button">Sound: ON</button>')
    .insertAfter(".controls")
    .on("click", function () {
      toggleSound();
      $(this).text(`Sound: ${gameState.soundEnabled ? "ON" : "OFF"}`);
    });
});
