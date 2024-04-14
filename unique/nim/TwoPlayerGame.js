turn = 1;
let isFirstClick = true;
var nextClicked = false;
var locked = false;
$(document).ready(function () {
  $(".container").hide();
  $(".btn").click(function () {
    var selectedButton = $(this);
    selectedButton.toggleClass("pressed");
    var audio = new Audio("buttonPressSound.mp3");
    audio.play();
  });
});

$(".next").click(function () {
  if (isFirstClick) {
    $(".container").toggleClass("contained");//to fix
    isFirstClick = false;
  }

  if (turn > 0) {
    turn--;
  } else {
    turn++;
  }
  $("#level-title").text("Player " + (turn + 1));

  if ($(".btn").length == $(".btn.pressed").length) {
    $("#level-title").text("Player " + (turn + 1) + " wins");
    $(this).hide();
  }

  $(".pressed").hide();
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
      alert("You can't select multiple rows! please deselect the previous action");
    }
  }
});

