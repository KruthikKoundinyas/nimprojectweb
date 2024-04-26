let turn = 1;
let isFirstClick = true;
let nextClicked = false;
let locked = false;
let Q = {}; // Define the Q variable here

$(document).ready(function () {
  $(".container").hide();
  $(".btn").click(function () {
    var selectedButton = $(this);
    selectedButton.toggleClass("pressed");
    var audio = new Audio("buttonPressSound.mp3");
    audio.play();
  });

  $(".next").click(function () {
    if (isFirstClick) {
      $(".container").toggleClass("contained");
      isFirstClick = false;
    }

    turn = turn > 0 ? 0 : 1;
    $("#level-title").text("Player " + (turn + 1));

    if ($(".btn").length == $(".btn.pressed").length) {
      $("#level-title").text("Player " + (turn + 1) + " wins");
      $(this).hide();
    }

    $(".pressed").hide();
    isRowSelected = false;
  });

  let isRowSelected = false;

  $(".row").click(function () {
    if (!isRowSelected) {
      isRowSelected = true;
      $(this).addClass("selected");
    } else {
      if ($(this).hasClass("selected")) {
        isRowSelected = false;
        $(this).removeClass("selected");
      } else {
        alert("You can't select multiple rows!");
      }
    }
  });

  // Load Q-values from JSON file
  $.getJSON("q_values.json", function (data) {
    Q = data;
  });

  // Define Q-learning parameters
  const learningRate = 0.1;
  const discountFactor = 0.9;
  const initialEpsilon = 1.0;
  let epsilon = initialEpsilon;
  const minEpsilon = 0.1;
  const epsilonDecayRate = 0.99;

  // Define the state-action space
  const states = [0, 1, 2, 3, 4]; // Possible states representing the number of stones in each pile
  const actions = [1, 2, 3]; // Possible actions representing the number of stones to remove

  // Function to select an action based on epsilon-greedy strategy
  function selectAction(state) {
    return Math.random() < epsilon
      ? actions[Math.floor(Math.random() * actions.length)]
      : makeMove(state);
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
});
