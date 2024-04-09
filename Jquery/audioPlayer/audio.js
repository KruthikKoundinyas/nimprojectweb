const Audios = [
  {
    title: "Preethse",
    artist: "FEMALE",
    file: "C:Projects/Jquery/audioPlayer/audio/WhatsApp Audio 2024-03-21 at 4.45.06 PM.mp3",
    //image: "album-art1.png",
  },
  {
    title: "Nee amruthadare",
    artist: "MALE",
    file: "C:Projects/Jquery/audioPlayer/audio/WhatsApp Audio 2024-03-21 at 4.45.07 PM.mp3",
    //image: "album-art2.png",
  },
];

const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const repeatButton = document.getElementById("repeat");

const audio = new Audio();
let currentAudioIndex = 0;
let isPlaying = false;
let isRepeat = false;

function playAudio() {
  const currentAudio = Audios[currentAudioIndex];
  const AudioTitle = document.querySelector(".audio-info h2");
  const AudioArtist = document.querySelector(".audio-info h3");
  const progressBar = document.querySelector(".progress");

  audio.src = currentAudio.file;
  AudioTitle.textContent = currentAudio.title;
  AudioArtist.textContent = currentAudio.artist;
  progressBar.style.width = 0;

  audio.play();
  isPlaying = true;
  playButton.style.display = "none";
  pauseButton.style.display = "inline-block";
}

function pauseAudio() {
  audio.pause();
  isPlaying = false;
  playButton.style.display = "inline-block";
  pauseButton.style.display = "none";
}

function playNextAudio() {
  currentAudioIndex++;
  if (currentAudioIndex >= Audios.length) {
    currentAudioIndex = 0;
  }
  playAudio();
}

function playPrevAudio() {
  currentAudioIndex--;
  if (currentAudioIndex < 0) {
    currentAudioIndex = Audios.length - 1;
  }
  playAudio();
}

function updateProgressBar() {
  const currentTime = audio.currentTime;
  const duration = audio.duration;
  const progressBar = document.querySelector(".progress");
  const progressPercent = (currentTime / duration) * 100;
  progressBar.style.width = `${progressPercent}%`;

  if (currentTime >= duration && isRepeat) {
    playAudio();
  } else if (currentTime >= duration) {
    pauseAudio();
  }
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  repeatButton.classList.toggle("active");
}

playButton.addEventListener("click", playAudio);
pauseButton.addEventListener("click", pauseAudio);
nextButton.addEventListener("click", playNextAudio);
prevButton.addEventListener("click", playPrevAudio);
repeatButton.addEventListener("click", toggleRepeat);
audio.addEventListener("ended", playNextAudio);
audio.addEventListener("timeupdate", updateProgressBar);
