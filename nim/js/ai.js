// ai.js - Q-Learning implementation for NimLab

var qValues = {};
var LEARNING_RATE = 0.1;
var DISCOUNT_FACTOR = 0.9;
var EPSILON = 0.1;

// --- STATE/ACTION HELPERS ---

function stateToKey(state) {
  return state.join(",");
}

function actionToKey(action) {
  return action.row + "," + action.count;
}

function getPossibleActions(state) {
  var actions = [];
  for (var row = 0; row < state.length; row++) {
    for (var count = 1; count <= state[row]; count++) {
      actions.push({ row: row, count: count });
    }
  }
  return actions;
}

// --- Q-VALUE MANAGEMENT ---

function loadQValues() {
  try {
    var saved = localStorage.getItem("nimlab_qvalues");
    if (saved) {
      qValues = JSON.parse(saved);
    } else {
      qValues = {};
      trainInitial();
    }
  } catch (e) {
    qValues = {};
    trainInitial();
  }
}

function saveQValues() {
  try {
    localStorage.setItem("nimlab_qvalues", JSON.stringify(qValues));
  } catch (e) {
    // localStorage full or unavailable — silently continue
  }
}

function ensureState(state) {
  var key = stateToKey(state);
  if (!qValues[key]) {
    qValues[key] = {};
    var actions = getPossibleActions(state);
    for (var i = 0; i < actions.length; i++) {
      qValues[key][actionToKey(actions[i])] = 0;
    }
  }
  return key;
}

// --- ACTION SELECTION ---

function chooseAction(state, epsilon) {
  if (typeof epsilon === "undefined") epsilon = EPSILON;

  var possibleActions = getPossibleActions(state);
  if (possibleActions.length === 0) return null;

  var stateKey = ensureState(state);

  // Epsilon-greedy
  if (Math.random() < epsilon) {
    return possibleActions[Math.floor(Math.random() * possibleActions.length)];
  }

  // Exploit: choose best Q-value
  var bestAction = possibleActions[0];
  var bestValue = -Infinity;

  for (var i = 0; i < possibleActions.length; i++) {
    var actionKey = actionToKey(possibleActions[i]);
    var val = qValues[stateKey][actionKey] || 0;
    if (val > bestValue) {
      bestValue = val;
      bestAction = possibleActions[i];
    }
  }

  return bestAction;
}

// --- Q-VALUE UPDATE ---

function updateQValue(state, action, reward, nextState) {
  var stateKey = ensureState(state);
  var actionKey = actionToKey(action);

  var maxNextQ = 0;
  var totalNext = 0;
  for (var i = 0; i < nextState.length; i++) totalNext += nextState[i];

  if (totalNext > 0) {
    var nextStateKey = ensureState(nextState);
    var nextActions = getPossibleActions(nextState);
    for (var i = 0; i < nextActions.length; i++) {
      var nKey = actionToKey(nextActions[i]);
      var nVal = qValues[nextStateKey][nKey] || 0;
      if (nVal > maxNextQ) maxNextQ = nVal;
    }
  }

  var oldQ = qValues[stateKey][actionKey] || 0;
  var newQ = oldQ + LEARNING_RATE * (reward + DISCOUNT_FACTOR * maxNextQ - oldQ);
  qValues[stateKey][actionKey] = newQ;
}

// --- TRAINING ---

function trainInitial() {
  // Train against optimal strategy for the default board
  var episodes = 500;
  trainOnBoard([1, 3, 5], episodes);
  trainOnBoard([2, 3, 5], Math.floor(episodes / 2));
  trainOnBoard([1, 4, 5], Math.floor(episodes / 2));
  trainOnBoard([3, 4, 5], Math.floor(episodes / 2));
  saveQValues();
}

function trainOnBoard(initialBoard, episodes) {
  for (var ep = 0; ep < episodes; ep++) {
    var state = initialBoard.slice();
    var history = [];
    var currentPlayer = "agent";

    while (true) {
      var total = 0;
      for (var i = 0; i < state.length; i++) total += state[i];
      if (total === 0) break;

      var action;
      if (currentPlayer === "agent") {
        // Decrease epsilon over training
        var epsilonDecay = Math.max(0.01, 1.0 - ep / episodes);
        action = chooseAction(state, epsilonDecay);
      } else {
        // Opponent plays optimal with some randomness
        action = trainOpponentMove(state);
      }

      if (!action) break;

      var prevState = state.slice();
      state[action.row] -= action.count;

      if (currentPlayer === "agent") {
        history.push({ state: prevState, action: action, nextState: state.slice() });
      }

      currentPlayer = (currentPlayer === "agent") ? "opponent" : "agent";
    }

    // Assign rewards (Misère: last mover loses)
    // currentPlayer at this point is whoever would move next (but game is over)
    // The last player who actually moved is the other one — they lose in Misère
    var lastMover = (currentPlayer === "agent") ? "opponent" : "agent";
    var agentWon = (lastMover === "opponent");

    for (var i = 0; i < history.length; i++) {
      var reward = 0;
      if (i === history.length - 1) {
        reward = agentWon ? 1 : -1;
      }
      updateQValue(history[i].state, history[i].action, reward, history[i].nextState);
    }
  }
}

function trainOpponentMove(state) {
  // Opponent uses optimal strategy 70% of the time
  if (Math.random() < 0.7) {
    return optimalMoveForTraining(state);
  }
  var actions = getPossibleActions(state);
  if (actions.length === 0) return null;
  return actions[Math.floor(Math.random() * actions.length)];
}

function optimalMoveForTraining(state) {
  var nimSum = 0;
  for (var i = 0; i < state.length; i++) nimSum ^= state[i];

  var heapsAboveOne = 0, nonEmpty = 0;
  for (var i = 0; i < state.length; i++) {
    if (state[i] > 1) heapsAboveOne++;
    if (state[i] > 0) nonEmpty++;
  }

  if (heapsAboveOne === 0) {
    if (nonEmpty % 2 === 0) {
      for (var i = 0; i < state.length; i++) {
        if (state[i] === 1) return { row: i, count: 1 };
      }
    }
    var actions = getPossibleActions(state);
    return actions.length > 0 ? actions[Math.floor(Math.random() * actions.length)] : null;
  }

  if (heapsAboveOne === 1) {
    for (var i = 0; i < state.length; i++) {
      if (state[i] > 1) {
        var onesCount = nonEmpty - 1;
        var target = (onesCount % 2 === 0) ? 1 : 0;
        return { row: i, count: state[i] - target };
      }
    }
  }

  if (nimSum === 0) {
    var actions = getPossibleActions(state);
    return actions[Math.floor(Math.random() * actions.length)];
  }

  for (var i = 0; i < state.length; i++) {
    if (state[i] > 0) {
      var target = state[i] ^ nimSum;
      if (target < state[i]) {
        return { row: i, count: state[i] - target };
      }
    }
  }

  var actions = getPossibleActions(state);
  return actions[Math.floor(Math.random() * actions.length)];
}

// --- COMPARISON API (used by compare.html) ---

function getAgentMove(state, type) {
  switch (type) {
    case "random":
      var nonEmpty = [];
      for (var i = 0; i < state.length; i++) if (state[i] > 0) nonEmpty.push(i);
      if (nonEmpty.length === 0) return null;
      var row = nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
      return { row: row, count: 1 + Math.floor(Math.random() * state[row]) };

    case "greedy":
      var maxRow = 0;
      for (var i = 1; i < state.length; i++) if (state[i] > state[maxRow]) maxRow = i;
      if (state[maxRow] === 0) return null;
      var count = Math.max(1, Math.floor(state[maxRow] / 2));
      return { row: maxRow, count: count };

    case "optimal":
      return optimalMoveForTraining(state);

    case "qlearning":
      return chooseAction(state, 0);

    default:
      return null;
  }
}

// --- INIT ---
loadQValues();
