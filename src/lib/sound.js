export const SOUND_PATHS = {
  uiClick: "/assets/sounds/ui-click.mp3",
  menuMusic: "/assets/sounds/menu-music.mp3",
  crowdKickoff: "/assets/sounds/crowd-kickoff.mp3",
  goalCheer: "/assets/sounds/goal-cheer.mp3",
  halftimeWhistle: "/assets/sounds/halftime-whistle.mp3",
  crowdCheer: "/assets/sounds/crowd-cheer.mp3",
  readWin: "/assets/sounds/read-win-cheer.mp3",
  readLoss: "/assets/sounds/read-loss-cheer.mp3",
  matchEnd: "/assets/sounds/match-end-cheer.mp3",
};

let audioUnlocked = false;
const loops = new Map();
const MASTER_VOLUME = 0.42;

export function unlockAudio() {
  audioUnlocked = true;
}

export function playSound(key, { volume = 0.55 } = {}) {
  if (!audioUnlocked) return;
  const src = SOUND_PATHS[key];
  if (!src) return;

  try {
    const audio = new Audio(src);
    audio.volume = Math.max(0, Math.min(1, volume * MASTER_VOLUME));
    audio.play().catch(() => {});
  } catch (_) {}
}

export function playLoop(key, { volume = 0.22 } = {}) {
  if (!audioUnlocked || loops.has(key)) return;
  const src = SOUND_PATHS[key];
  if (!src) return;

  try {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = Math.max(0, Math.min(1, volume * MASTER_VOLUME));
    loops.set(key, audio);
    audio.play().catch(() => {
      loops.delete(key);
    });
  } catch (_) {}
}

export function stopLoop(key) {
  const audio = loops.get(key);
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  loops.delete(key);
}
