$(document).ready(function () {
  let turn = 1;
  let isFirstClick = true;
  let nextClicked = false;
  let locked = false;
  let Q = {}; // Define the Q variable here

  $(".container").hide();
  $(".btn").click(function () {
    var selectedButton = $(this);
    selectedButton.toggleClass("pressed");
    var audio = new Audio("buttonPressSound.mp3");
    audio.play();
  });

  $(".next").click(function () {
    if (isFirstClick) {
      $("#container").addClass("contained");
      $("#container").removeClass("contained");
      isFirstClick = false;
    }

    turn = turn > 0 ? 0 : 1;
    $("#level-title").text("Player " + (turn + 1));

    if ($(".btn").length == $(".btn.pressed").length) {
      $("#level-title").text("Player " + (turn + 1) + " wins");
      $(this).hide();
    }

    // Check if it's AI's turn
    if (turn === 1) {
      // Perform AI move
      $("#level-title").text("AI's Turn");
      performAIMove();
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
        $(".btn").addClass(".press");
      }
    }
  });

  function performAIMove() {
    let selectedRow = -1;

    // Keep selecting a row until at least one stone can be removed
    while (selectedRow === -1) {
      const rows = $(".row");
      rows.each(function (index) {
        if ($(this).find(".btn:not(.pressed)").length > 0) {
          selectedRow = index;
          return false; // Break out of the loop once a valid row is found
        }
      });
    }

    // Select a row using the Q-learning algorithm
    let stonesToRemove = 0;
    while (stonesToRemove === 0) {
      stonesToRemove = makeMove(selectedRow);
    }

    // Add 'pressed' class to the specified number of buttons in the selected row
    $(
      `.row:nth-child(${
        selectedRow + 1
      }) .btn:not(.pressed):lt(${stonesToRemove})`
    ).addClass("pressed");

    // Hide the pressed buttons after a short delay
    setTimeout(function () {
      $(".pressed").hide();
      updateStonesCount(selectedRow, stonesToRemove);
    }, 5000); // You can adjust the delay as needed
  }

  function updateStonesCount(selectedRow) {
    const stonesToRemove = $(
      ".row:nth-child(" + (selectedRow + 1) + ") .pressed"
    ).length;
    console.log("Stones removed: " + stonesToRemove);
  }

  // Function to select a row using Q-learning algorithm
  function selectRow() {
    // Choose a row based on learned Q-values
    let nextState = 0; // Assuming initial state is always 0 for simplicity
    let selectedRow = makeMove(nextState);
    return selectedRow;
  }

  // Load Q-values from JSON file
  $.getJSON("q_values.json", function (data) {
    Q = data;
  }).fail(function () {
    console.log("Error: JSON file not found or not accessible.");
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
      : actions.reduce((a, b) => (Q[state][a] > Q[state][b] ? a : b));
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

  $(".restart").click(function () {
    $(".row").removeClass("selected").addClass("select");
    $(".next").show();
    $("#level-title").text("Press next button to Start");

    // Reset game state
    turn = 1;
    isFirstClick = true;
    nextClicked = false;
    locked = false;
    Q = {}; //reset Q values(if needed)
    /*
     // Reset UI
     $(".btn").removeClass("pressed");
     $(".btn").addClass("press");
     $(".row").removeClass("selected");
     $(".row").addClass("select");
     $(".next").show();
     $("#level-title").text("Press next button to Start");
 
     // Reset game state
     turn = 1;
     isFirstClick = true;
     nextClicked = false;
     locked = false;
     //Q = {}//reset Q values(if needed)
   });*/
  });
});
