// Define Q-learning parameters
const learningRate = 0.1;
const discountFactor = 0.9;
let epsilon = 1.0;
const minEpsilon = 0.1;
const epsilonDecayRate = 0.99;

// Define the state-action space
const states = [0, 1, 2, 3, 4]; // Possible states representing the number of stones in each pile
const actions = [1, 2, 3]; // Possible actions representing the number of stones to remove

$(document).ready(function () {
  $(".container").hide();
});

// Initialize Q-values
const Q = {};
states.forEach((state) => {
  Q[state] = {};
  actions.forEach((action) => {
    Q[state][action] = 0; // Initialize Q-values to zero
  });
});

// Function to select an action based on epsilon-greedy strategy
function selectAction(state) {
  if (Math.random() < epsilon) {
    // Explore: choose a random action
    return actions[Math.floor(Math.random() * actions.length)];
  } else {
    // Exploit: choose the action with the highest Q-value
    return actions.reduce((a, b) => (Q[state][a] > Q[state][b] ? a : b));
  }
}

// Function to update Q-values based on Q-learning algorithm
function updateQValue(state, action, reward, nextState) {
  const maxNextQ = Math.max(...Object.values(Q[nextState]));
  Q[state][action] +=
    learningRate * (reward + discountFactor * maxNextQ - Q[state][action]);
}

// Function to simulate a game of Nim and update Q-values
function playNim() {
  let state = Math.floor(Math.random() * 5); // Initial state (random number of stones in each pile)
  while (state > 0) {
    const action = selectAction(state); // Choose an action
    const nextState = state - action; // Calculate the next state
    const reward = nextState === 0 ? 1 : 0; // Reward 1 if the game is won, 0 otherwise
    updateQValue(state, action, reward, nextState); // Update Q-values
    state = nextState; // Update current state
  }
}

// Function to train the Q-learning agent
function train(iterations) {
  for (let i = 0; i < iterations; i++) {
    playNim(); // Play a game of Nim and update Q-values
    epsilon = Math.max(minEpsilon, epsilon * epsilonDecayRate); // Decay epsilon
  }
}

// Function to make a move based on learned Q-values
function makeMove(state) {
  return actions.reduce((a, b) => (Q[state][a] > Q[state][b] ? a : b));
}

// Export necessary functions
export { train, makeMove, Q };
