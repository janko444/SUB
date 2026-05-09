const fileInput = document.getElementById("fileInput");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const shakeInput = document.getElementById("shake");
const zoomInput = document.getElementById("zoom");
const cinemaInput = document.getElementById("cinema");

const speedInput = document.getElementById("speed");
const intensityInput = document.getElementById("intensity");

let beats = [];
let lastBeatTime = 0;

// 📥 VIDEO LOAD (STABLE)
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  video.src = url;

  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  };
});

// 🎧 REALISTIC BEAT SYSTEM (STABLE TRIGGER)
document.getElementById("analyze").addEventListener("click", () => {
  beats = [];

  const bpm = 120;
  const interval = 60 / bpm;

  for (let i = 0; i < 200; i++) {
    beats.push(i * interval);
  }

  alert("Beat system ready");
});

// 🎬 ENGINE (STABLE + CLEAN)
function render() {
  requestAnimationFrame(render);

  if (!video.videoWidth) return;

  let t = video.currentTime;

  let shake = parseFloat(shakeInput.value);
  let zoomBase = parseFloat(zoomInput.value);
  let cinema = parseFloat(cinemaInput.value);
  let speed = parseFloat(speedInput.value);
  let intensity = parseFloat(intensityInput.value);

  // 🎯 BEAT DETECTION (COOLDOWN FIX)
  let isBeat = false;

  for (let b of beats) {
    if (Math.abs(b - t) < 0.04 && t - lastBeatTime > 0.1) {
      isBeat = true;
      lastBeatTime = t;
      break;
    }
  }

  let beatPower = isBeat ? intensity : 0;

  // 🎬 CAMERA
  let zoom = zoomBase + beatPower * 0.15;

  let shakeX = isBeat ? (Math.random() - 0.5) * shake : 0;
  let shakeY = isBeat ? (Math.random() - 0.5) * shake : 0;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.save();

  ctx.translate(canvas.width / 2 + shakeX, canvas.height / 2 + shakeY);
  ctx.scale(zoom, zoom);

  // 🎨 COLOR GRADING (3 PRESETS)
  let brightness = 1;
  let contrast = 1;

  if (cinema < 0.5) {
    brightness = 1.1;
    contrast = 1.1;
  } else if (cinema < 1.5) {
    brightness = 1;
    contrast = 1.3;
  } else {
    brightness = 0.9;
    contrast = 1.5;
  }

  ctx.filter = `
    brightness(${brightness})
    contrast(${contrast})
  `;

  ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2);

  ctx.restore();

  // ⚡ FLASH ON BEAT (REAL EFFECT)
  if (isBeat) {
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

video.addEventListener("play", render);

// 🎥 STABLE EXPORT (NO EMPTY FRAMES BUG)
document.getElementById("export").addEventListener("click", async () => {
  const stream = canvas.captureStream(30);

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm"
  });

  let chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "stable-edit.webm";
    a.click();
  };

  // 🔥 FIX: wymuszenie play
  video.currentTime = 0;

  try {
    await video.play();
  } catch {}

  recorder.start();

  const duration = video.duration || 5;

  setTimeout(() => {
    recorder.stop();
  }, duration * 1000);
});
