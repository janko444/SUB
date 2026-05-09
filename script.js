const fileInput = document.getElementById("fileInput");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const shakeInput = document.getElementById("shake");
const zoomInput = document.getElementById("zoom");
const cinemaInput = document.getElementById("cinema");
const denoiseInput = document.getElementById("denoise");
const vignetteInput = document.getElementById("vignette");

let beats = [];
let time = 0;

// 📥 LOAD VIDEO
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

// 🎧 BEAT SIMULATION
document.getElementById("analyze").addEventListener("click", () => {
  beats = [];

  const bpm = 120;
  const interval = 60 / bpm;

  for (let i = 0; i < 100; i++) {
    beats.push(i * interval);
  }

  alert("Beat analysis done (simulated)");
});

// 🎬 RENDER ENGINE (AE + CAPCUT STYLE)
function render() {
  requestAnimationFrame(render);

  if (!video.videoWidth) return;

  time = video.currentTime;

  let shake = parseFloat(shakeInput.value);
  let zoomBase = parseFloat(zoomInput.value);
  let cinema = parseFloat(cinemaInput.value);
  let denoise = parseFloat(denoiseInput.value);
  let vignette = parseFloat(vignetteInput.value);

  let isBeat = beats.some(b => Math.abs(b - time) < 0.05);

  let zoom = isBeat ? zoomBase + 0.15 : zoomBase;
  let shakeX = isBeat ? (Math.random() - 0.5) * shake : 0;
  let shakeY = isBeat ? (Math.random() - 0.5) * shake : 0;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.save();

  ctx.translate(canvas.width / 2 + shakeX, canvas.height / 2 + shakeY);
  ctx.scale(zoom, zoom);

  // 🎨 "AI LOOK" FILTER STACK
  ctx.filter = `
    brightness(${1 + cinema * 0.05})
    contrast(${1 + cinema * 0.2})
    blur(${denoise}px)
    saturate(${1 + cinema * 0.3})
  `;

  ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2);

  ctx.restore();

  // 🌑 VIGNETTE
  if (vignette > 0) {
    let g = ctx.createRadialGradient(
      canvas.width/2,
      canvas.height/2,
      canvas.width * 0.2,
      canvas.width/2,
      canvas.height/2,
      canvas.width
    );

    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${vignette})`);

    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
}

video.addEventListener("play", render);

// 🎥 EXPORT FIX (STABILNY)
document.getElementById("export").addEventListener("click", () => {
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
    a.download = "beat-sync-pro.webm";
    a.click();
  };

  recorder.start();

  video.currentTime = 0;
  video.play();

  const duration = video.duration || 5;

  setTimeout(() => {
    recorder.stop();
  }, duration * 1000);
});
