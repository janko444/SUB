const fileInput = document.getElementById("fileInput");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const shakeInput = document.getElementById("shake");
const zoomInput = document.getElementById("zoom");
const cinemaInput = document.getElementById("cinema");
const denoiseInput = document.getElementById("denoise");
const vignetteInput = document.getElementById("vignette");

const speedInput = document.getElementById("speed");
const intensityInput = document.getElementById("intensity");
const glitchInput = document.getElementById("glitch");
const rgbInput = document.getElementById("rgb");
const grainInput = document.getElementById("grain");

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

// 🎧 FAKE BEAT ANALYSIS
document.getElementById("analyze").addEventListener("click", () => {
  beats = [];

  const bpm = 120;
  const interval = 60 / bpm;

  for (let i = 0; i < 200; i++) {
    beats.push(i * interval);
  }

  alert("Beat analysis done (simulated BPM 120)");
});

// 🎬 MAIN ENGINE
function render() {
  requestAnimationFrame(render);

  if (!video.videoWidth) return;

  time = video.currentTime;

  let shake = parseFloat(shakeInput.value);
  let zoomBase = parseFloat(zoomInput.value);
  let cinema = parseFloat(cinemaInput.value);
  let denoise = parseFloat(denoiseInput.value);
  let vignette = parseFloat(vignetteInput.value);

  let speed = parseFloat(speedInput.value);
  let intensity = parseFloat(intensityInput.value);
  let glitch = parseFloat(glitchInput.value);
  let rgb = parseFloat(rgbInput.value);
  let grain = parseFloat(grainInput.value);

  let isBeat = beats.some(b => Math.abs(b - time) < 0.05);
  let beatPower = isBeat ? intensity : 0;

  // 🎯 CAMERA FX
  let zoom = zoomBase + beatPower * 0.2;

  let shakeX = beatPower * (Math.random() - 0.5) * shake;
  let shakeY = beatPower * (Math.random() - 0.5) * shake;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.save();

  // 🎬 cinematic movement
  let panX = Math.sin(time * 0.5) * 10;
  let panY = Math.cos(time * 0.3) * 10;

  ctx.translate(canvas.width / 2 + shakeX + panX, canvas.height / 2 + shakeY + panY);
  ctx.scale(zoom, zoom);

  // 🎨 MAIN FILTER STACK (AI LOOK SIMULATION)
  ctx.filter = `
    brightness(${1 + cinema * 0.05 + beatPower * 0.1})
    contrast(${1 + cinema * 0.2})
    blur(${denoise}px)
    saturate(${1 + cinema * 0.3})
  `;

  // 🎬 RGB SPLIT (GLITCH STYLE)
  if (rgb > 0 && isBeat) {
    ctx.globalCompositeOperation = "screen";

    ctx.drawImage(video, -canvas.width/2 + rgb, -canvas.height/2);
    ctx.drawImage(video, -canvas.width/2 - rgb, -canvas.height/2);
  }

  ctx.globalCompositeOperation = "source-over";

  // 🎥 DRAW FRAME
  ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2);

  ctx.restore();

  // ⚡ GLITCH EFFECT
  if (glitch > 0 && isBeat) {
    let offset = (Math.random() - 0.5) * glitch;
    ctx.drawImage(canvas, offset, 0);
  }

  // 🌑 VIGNETTE
  if (vignette > 0) {
    let g = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.2,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width
    );

    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${vignette})`);

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 🎞 GRAIN (FILM LOOK)
  if (grain > 0) {
    for (let i = 0; i < grain * 40; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
  }
}

video.addEventListener("play", render);

// 🎥 EXPORT FIX
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
    a.download = "pro-editor.webm";
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
