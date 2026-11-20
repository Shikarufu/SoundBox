// ===================================
// 1. GET HTML ELEMENTS
// ===================================

const musicInput = document.getElementById("musicInput");
const dropZone = document.getElementById("dropZone");
const songContainer = document.getElementById("songContainer");

const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const previousBtn = document.getElementById("previousBtn");

const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");

const progressBar = document.getElementById("progressBar");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const volumeControl = document.getElementById("volumeControl");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

let shuffleEnabled = false;
let repeatEnabled = false;
// ===================================
// 2. MUSIC PLAYER VARIABLES
// ===================================

const audio = new Audio();

let songs = [];
let currentIndex = -1;

shuffleBtn.addEventListener("click", () => {
  shuffleEnabled = !shuffleEnabled;

  shuffleBtn.classList.toggle("enabled", shuffleEnabled);
});

repeatBtn.addEventListener("click", () => {
  repeatEnabled = !repeatEnabled;

  repeatBtn.classList.toggle("enabled", repeatEnabled);
});

function getNextIndex() {
  if (shuffleEnabled && songs.length > 1) {
    let randomIndex;

    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (randomIndex === currentIndex);

    return randomIndex;
  }

  return (currentIndex + 1) % songs.length;
}

// ===================================
// 3. ADD MUSIC FILES
// ===================================

function addMusic(files) {
  for (const file of files) {
    if (!file.type.startsWith("audio/")) {
      console.log("Invalid file:", file.name);
      continue;
    }

    // Remove file extension
    const filename = file.name.replace(/\.[^/.]+$/, "");

    // Separate artist and song title
    const parts = filename.split(" - ");

    const artist = parts.length > 1 ? parts[0].trim() : "Unknown Artist";

    const title =
      parts.length > 1 ? parts.slice(1).join(" - ").trim() : filename;

    const song = {
      id: crypto.randomUUID(),
      name: title,
      artist: artist,
      file: file,
      url: URL.createObjectURL(file),
    };

    songs.push(song);
  }

  displaySongs();
}

// ===================================
// 4. DISPLAY SONGS
// ===================================

function displaySongs() {
  songContainer.innerHTML = "";

  if (songs.length === 0) {
    songContainer.innerHTML =
      '<p class="empty-message">No music added yet.</p>';
    return;
  }

  songs.forEach((song, index) => {
    const songElement = document.createElement("div");
    songElement.className = "song-item";

    if (index === currentIndex) {
      songElement.classList.add("active");
    }

    // Song information
    const info = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = song.name;

    const artist = document.createElement("p");
    artist.textContent = song.artist;

    info.append(title, artist);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.title = "Delete song";

    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      removeSong(index);
    });

    const cover = document.createElement("div");

    cover.className = "song-cover";
    cover.textContent = "♫";

    songElement.append(cover, info, deleteBtn);

    // Play song when clicked
    songElement.addEventListener("click", () => {
      playSong(index);
    });

    songContainer.appendChild(songElement);
  });
}

// ===================================
// 5. PLAY A SONG
// ===================================

function playSong(index) {
  if (index < 0 || index >= songs.length) {
    return;
  }

  currentIndex = index;

  const song = songs[currentIndex];

  audio.src = song.url;

  currentTitle.textContent = song.name;
  currentArtist.textContent = "Local Music";

  audio.play().catch((error) => {
    console.error("Playback failed:", error);
  });

  displaySongs();
}

function removeSong(index) {
  const song = songs[index];

  // Release temporary browser URL
  URL.revokeObjectURL(song.url);

  // Remove song from array
  songs.splice(index, 1);

  if (songs.length === 0) {
    audio.pause();
    audio.src = "";

    currentIndex = -1;

    currentTitle.textContent = "No song selected";
    currentArtist.textContent = "Unknown Artist";

    playBtn.textContent = "▶";

    progressBar.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";
  } else if (index === currentIndex) {
    // Current song was deleted
    const nextIndex = Math.min(index, songs.length - 1);

    playSong(nextIndex);
  } else if (index < currentIndex) {
    // Adjust index because an earlier song was removed
    currentIndex--;
  }

  displaySongs();
}

// ===================================
// 6. PLAY / PAUSE
// ===================================

playBtn.addEventListener("click", () => {
  if (songs.length === 0) {
    alert("Please add some music first!");
    return;
  }

  if (audio.paused) {
    if (currentIndex === -1) {
      playSong(0);
    } else {
      audio.play();
      playBtn.textContent = "⏸";
    }
  } else {
    audio.pause();
    playBtn.textContent = "▶";
  }
});

// ===================================
// 7. NEXT SONG
// ===================================

nextBtn.addEventListener("click", () => {
  if (songs.length === 0) return;

  playSong(getNextIndex());
});

previousBtn.addEventListener("click", () => {
  if (songs.length === 0) return;

  // Restart song if it has played for more than 3 seconds
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  let previousIndex;

  if (shuffleEnabled && songs.length > 1) {
    previousIndex = getNextIndex();
  } else {
    previousIndex = (currentIndex - 1 + songs.length) % songs.length;
  }

  playSong(previousIndex);
});

audio.addEventListener("play", () => {
  playBtn.textContent = "⏸";
});

audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
});

// ===================================
// 9. FILE INPUT
// ===================================

musicInput.addEventListener("change", (event) => {
  addMusic(event.target.files);

  // Allow selecting the same file again later
  musicInput.value = "";
});

// ===================================
// 10. DRAG AND DROP
// ===================================

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();

  dropZone.classList.add("active");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("active");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();

  dropZone.classList.remove("active");

  addMusic(event.dataTransfer.files);
});

// ===================================
// 11. VOLUME CONTROL
// ===================================

volumeControl.addEventListener("input", () => {
  audio.volume = Number(volumeControl.value);
});

// ===================================
// 12. FORMAT TIME
// ===================================

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// ===================================
// 13. UPDATE PROGRESS BAR
// ===================================

audio.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audio.duration)) return;

  const progress = (audio.currentTime / audio.duration) * 100;

  progressBar.value = progress;

  currentTime.textContent = formatTime(audio.currentTime);
});

// ===================================
// 14. LOAD SONG DURATION
// ===================================

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
});

// ===================================
// 15. SEEK MUSIC
// ===================================

progressBar.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration)) return;

  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// ===================================
// 16. AUTO PLAY NEXT SONG
// ===================================

audio.addEventListener("ended", () => {
  if (songs.length === 0) return;

  if (repeatEnabled) {
    audio.currentTime = 0;

    audio.play().catch((error) => {
      console.error("Playback failed:", error);
    });
  } else {
    playSong(getNextIndex());
  }
});
