const videoInput = document.getElementById("videoInput");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const audio = document.getElementById("audio");

const shakeInput = document.getElementById("shake");
const zoomInput = document.getElementById("zoom");

let fileURL;
let beats = [];
let time = 0;

// 📥 LOAD VIDEO
videoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  fileURL = URL.createObjectURL(file);
  video.src = fileURL;
});

// 🎧 SIMPLE BEAT DETECTION (FAKE BPM SIMULATION)
document.getElementById("analyze").addEventListener("click", () => {
  beats = [];

  const bpm = 120; // pseudo BPM
  const interval = 60 / bpm;

  for (let i = 0; i < 50; i++) {
    beats.push(i * interval);
  }

  alert("Beat analysis done (simulated BPM 120)");
});

// 🎬 RENDER ENGINE
function render() {
  requestAnimationFrame(render);

  if (!video.videoWidth) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  time = video.currentTime;

  let shake = parseFloat(shakeInput.value);
  let zoomBase = parseFloat(zoomInput.value);

  // 🎯 CHECK BEAT PULSE
  let isBeat = beats.some(b => Math.abs(b - time) < 0.05);

  let zoom = isBeat ? zoomBase + 0.2 : zoomBase;
  let shakeX = isBeat ? (Math.random() - 0.5) * shake : 0;
  let shakeY = isBeat ? (Math.random() - 0.5) * shake : 0;

  ctx.save();

  ctx.translate(canvas.width / 2 + shakeX, canvas.height / 2 + shakeY);
  ctx.scale(zoom, zoom);

  ctx.drawImage(
    video,
    -canvas.width / 2,
    -canvas.height / 2
  );

  ctx.restore();
}

video.addEventListener("play", render);

// 🎥 EXPORT VIDEO
document.getElementById("export").addEventListener("click", () => {
  const stream = canvas.captureStream(30);

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm"
  });

  let chunks = [];

  recorder.ondataavailable = (e) => chunks.push(e.data);

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "beat-sync.webm";
    a.click();
  };

  recorder.start();

  setTimeout(() => recorder.stop(), 8000);
});
