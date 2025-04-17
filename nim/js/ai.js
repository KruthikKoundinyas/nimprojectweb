// AI.js - Q-Learning implementation with localStorage instead of PHP

// Initialize Q-values
let qValues = {};

// Load existing Q-values from localStorage if available
function loadQValues() {
  const savedQValues = localStorage.getItem("nim_qvalues");
  if (savedQValues) {
    qValues = JSON.parse(savedQValues);
    console.log("Q-values loaded from localStorage");
  } else {
    initializeQValues();
    console.log("Initialized new Q-values");
  }
}

// Initialize Q-values for all possible states
function initializeQValues() {
  // Generate all possible game states
  const allStates = generateAllStates();

  // Initialize Q-values for each state and action
  allStates.forEach((state) => {
    const stateKey = stateToKey(state);
    qValues[stateKey] = {};

    // For each possible action in this state
    const possibleActions = getPossibleActions(state);
    possibleActions.forEach((action) => {
      const actionKey = actionToKey(action);
      qValues[stateKey][actionKey] = 0; // Initial Q-value
    });
  });

  // Save to localStorage
  saveQValues();
}

// Save Q-values to localStorage
function saveQValues() {
  localStorage.setItem("nim_qvalues", JSON.stringify(qValues));
  console.log("Q-values saved to localStorage");
}

// Generate a key for a state
function stateToKey(state) {
  return state.join(",");
}

// Generate a key for an action
function actionToKey(action) {
  return `${action.row},${action.count}`;
}

// Generate all possible game states
function generateAllStates() {
  const states = [];

  // NIM game typically has 3 rows with 1, 3, 5 objects
  // Generate all possible combinations
  for (let row1 = 0; row1 <= 1; row1++) {
    for (let row2 = 0; row2 <= 3; row2++) {
      for (let row3 = 0; row3 <= 5; row3++) {
        // Skip the state where all rows are empty
        if (row1 === 0 && row2 === 0 && row3 === 0) continue;
        states.push([row1, row2, row3]);
      }
    }
  }

  return states;
}

// Get all possible actions for a given state
function getPossibleActions(state) {
  const actions = [];

  // For each row
  for (let row = 0; row < state.length; row++) {
    // For each possible number of objects to remove
    for (let count = 1; count <= state[row]; count++) {
      actions.push({ row, count });
    }
  }

  return actions;
}

// Choose action using epsilon-greedy policy
function chooseAction(state, epsilon = 0.1) {
  const stateKey = stateToKey(state);
  const possibleActions = getPossibleActions(state);

  // Exploration vs exploitation
  if (Math.random() < epsilon) {
    // Exploration: choose a random action
    const randomIndex = Math.floor(Math.random() * possibleActions.length);
    return possibleActions[randomIndex];
  } else {
    // Exploitation: choose the best action
    let bestAction = null;
    let bestValue = -Infinity;

    possibleActions.forEach((action) => {
      const actionKey = actionToKey(action);
      const qValue = qValues[stateKey][actionKey] || 0;

      if (qValue > bestValue) {
        bestValue = qValue;
        bestAction = action;
      }
    });

    return bestAction;
  }
}

// Update Q-values using Q-learning algorithm
function updateQValues(
  state,
  action,
  reward,
  nextState,
  learningRate = 0.1,
  discount = 0.9
) {
  const stateKey = stateToKey(state);
  const actionKey = actionToKey(action);

  // Calculate maximum Q-value for next state
  let maxNextQ = 0;
  if (nextState.some((val) => val > 0)) {
    // If game not over
    const nextStateKey = stateToKey(nextState);
    const possibleNextActions = getPossibleActions(nextState);

    possibleNextActions.forEach((nextAction) => {
      const nextActionKey = actionToKey(nextAction);
      const nextQ = qValues[nextStateKey][nextActionKey] || 0;
      maxNextQ = Math.max(maxNextQ, nextQ);
    });
  }

  // Q-learning update formula
  const oldQ = qValues[stateKey][actionKey] || 0;
  const newQ = oldQ + learningRate * (reward + discount * maxNextQ - oldQ);

  // Update Q-value
  if (!qValues[stateKey]) qValues[stateKey] = {};
  qValues[stateKey][actionKey] = newQ;

  // Save updated Q-values periodically
  // To avoid excessive localStorage writes, save only occasionally
  if (Math.random() < 0.1) {
    // 10% chance to save on each update
    saveQValues();
  }
}

// Reset all Q-values (for debugging or starting over)
function resetQValues() {
  qValues = {};
  initializeQValues();
  alert("Q-values have been reset");
}

// Export Q-values to a file (for backup)
function exportQValues() {
  const dataStr = JSON.stringify(qValues);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportLink = document.createElement("a");
  exportLink.setAttribute("href", dataUri);
  exportLink.setAttribute("download", "nim_qvalues.json");
  exportLink.click();
}

// Import Q-values from a file
function importQValues(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      qValues = JSON.parse(event.target.result);
      saveQValues();
      alert("Q-values imported successfully");
    } catch (error) {
      alert("Error importing Q-values: " + error.message);
    }
  };
  reader.readAsText(file);
}

// Initialize when the script loads
loadQValues();
