turn = 1;
$(document).ready(function () {
  $(".btn").click(function () {
    var selectedButton = $(this);
    selectedButton.toggleClass("pressed");
    var audio = new Audio("buttonPressSound.mp3");
    audio.play();
  });
});

$(".finnish").click(function () {
  if (turn > 0) {
    turn--;
    $("#level-title").text("Player " + (turn + 1));
  } else {
    turn++;
    $("#level-title").text("Player " + (turn + 1));
  }
  if ($(".btn").length == $(".btn.pressed").length) {
    $("#level-title").text("Player " + (turn + 1) + " wins");
  }
  $(".pressed").hide();
});
