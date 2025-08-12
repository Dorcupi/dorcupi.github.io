const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const videoOutput = document.getElementById('videoOutput');
const statusEl = document.getElementById('status');
const generateBtn = document.getElementById('generate');
const fontSelect = document.getElementById('font');
const fontUpload = document.getElementById('fontUpload');

const defaultTextSize = 360; // px

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.setAttribute("data-theme", "light");
});

document.getElementById("themeToggle").addEventListener("click", () => {
  const html = document.documentElement;
  html.setAttribute("data-theme", html.getAttribute("data-theme") === "light" ? "dark" : "light");
});


fontUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
    const url = URL.createObjectURL(file);
    const font = new FontFace(file.name, `url(${url})`);
    await font.load();
    document.fonts.add(font);
    const option = document.createElement('option');
    option.value = `'${file.name}'`;
    option.textContent = file.name;
    fontSelect.appendChild(option);
    fontSelect.value = `'${file.name}'`;
    }
});

document.querySelectorAll('.reset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    input.value = btn.getAttribute('data-default');
    if (input.id === 'textSizePx') {
        document.getElementById('textSizePercent').value = (input.value / defaultTextSize) * 100;
    } else if (input.id === 'textSizePercent') {
        document.getElementById('textSizePx').value = (input.value / 100) * defaultTextSize;
    }
    });
});

const pxInput = document.getElementById('textSizePx');
const percentInput = document.getElementById('textSizePercent');

pxInput.addEventListener('input', () => {
    percentInput.value = ((pxInput.value / defaultTextSize) * 100).toFixed(2);
});

percentInput.addEventListener('input', () => {
    pxInput.value = ((percentInput.value / 100) * defaultTextSize).toFixed(2);
});

document.getElementById('generate').addEventListener('click', async () => {
    const startNumber = parseInt(document.getElementById('startNumber').value, 10);
    const endNumber = parseInt(document.getElementById('endNumber').value, 10);
    const duration = parseFloat(document.getElementById('duration').value);
    const font = fontSelect.value || 'Arial';
    const textColor = document.getElementById('textColor').value;
    const bgColor = document.getElementById('bgColor').value;
    const timeMode = document.getElementById('timeMode').checked;
    const strokeWidth = parseInt(document.getElementById('strokeWidth').value, 10);
    const strokeColor = document.getElementById('strokeColor').value;
    const textSize = parseFloat(pxInput.value);
    const offsetX = parseFloat(document.getElementById('offsetX').value);
    const offsetY = parseFloat(document.getElementById('offsetY').value);

    const fps = 30;
    const totalFrames = duration * fps;
    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    generateBtn.disabled = true;
    statusEl.style.display = 'block';

    let chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = e => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    videoOutput.src = URL.createObjectURL(blob);
    generateBtn.disabled = false;
    statusEl.style.display = 'none';
    };

    recorder.start();

    for (let frame = 0; frame < totalFrames; frame++) {
    const progress = frame / totalFrames;
    const currentNumber = Math.round(startNumber + (endNumber - startNumber) * progress);

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${textSize}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (strokeWidth > 0) {
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(timeMode ? formatTime(currentNumber) : currentNumber, canvas.width / 2 + offsetX, canvas.height / 2 - offsetY);
    }

    ctx.fillStyle = textColor;
    ctx.fillText(timeMode ? formatTime(currentNumber) : currentNumber, canvas.width / 2 + offsetX, canvas.height / 2 - offsetY);

    await new Promise(r => setTimeout(r, 1000 / fps));
    }

    recorder.stop();
});