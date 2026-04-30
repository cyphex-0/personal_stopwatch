let remainingSeconds = 0;
let timerInterval = null;
let isPaused = false;

const setupView = document.getElementById('setup-view');
const timerView = document.getElementById('timer-view');
const alarmView = document.getElementById('alarm-view');

const inputH = document.getElementById('input-h');
const inputM = document.getElementById('input-m');
const inputS = document.getElementById('input-s');
const displayTime = document.getElementById('display-time');
const alarmSound = document.getElementById('alarm-sound');

const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const btnStop = document.getElementById('btn-stop');
const btnClose = document.getElementById('btn-close');

function pad(val) {
  return val.toString().padStart(2, '0');
}

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function updateDisplay() {
  displayTime.textContent = formatTime(remainingSeconds);
}

function saveState() {
  if (remainingSeconds > 0 && timerInterval !== null) {
    window.electronAPI.saveState({
      remainingSeconds: remainingSeconds
    });
  } else {
    window.electronAPI.saveState(null);
  }
}

function startTimer() {
  if (remainingSeconds <= 0) return;
  
  setupView.classList.add('hidden');
  timerView.classList.remove('hidden');
  isPaused = false;
  btnPause.textContent = 'Pause';
  updateDisplay();

  timerInterval = setInterval(() => {
    if (!isPaused) {
      remainingSeconds--;
      updateDisplay();
      saveState();

      if (remainingSeconds <= 0) {
        triggerAlarm();
      }
    }
  }, 1000);
}

function triggerAlarm() {
  clearInterval(timerInterval);
  timerInterval = null;
  window.electronAPI.saveState(null);
  
  timerView.classList.add('hidden');
  alarmView.classList.remove('hidden');
  
  if (!alarmSound.src || alarmSound.src === window.location.href) {
    alarmSound.src = generateBeepWavDataURI();
  }
  
  alarmSound.play().catch(e => console.error("Audio play failed", e));
}

function stopAlarm() {
  alarmSound.pause();
  alarmSound.currentTime = 0;
  alarmView.classList.add('hidden');
  setupView.classList.remove('hidden');
}

btnStart.addEventListener('click', () => {
  const h = parseInt(inputH.value) || 0;
  const m = parseInt(inputM.value) || 0;
  const s = parseInt(inputS.value) || 0;
  remainingSeconds = h * 3600 + m * 60 + s;
  startTimer();
  saveState();
});

btnPause.addEventListener('click', () => {
  isPaused = !isPaused;
  btnPause.textContent = isPaused ? 'Resume' : 'Pause';
  saveState();
});

btnReset.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  remainingSeconds = 0;
  isPaused = false;
  updateDisplay();
  saveState();
  timerView.classList.add('hidden');
  setupView.classList.remove('hidden');
});

btnStop.addEventListener('click', stopAlarm);
btnClose.addEventListener('click', () => {
  window.electronAPI.closeApp();
});

inputH.addEventListener('change', () => { inputH.value = pad(inputH.value); });
inputM.addEventListener('change', () => { inputM.value = pad(inputM.value); });
inputS.addEventListener('change', () => { inputS.value = pad(inputS.value); });

window.electronAPI.loadState().then(state => {
  if (state && state.remainingSeconds > 0) {
    remainingSeconds = state.remainingSeconds;
    startTimer();
    isPaused = true;
    btnPause.textContent = 'Resume';
  }
});

function generateBeepWavDataURI() {
  const sampleRate = 8000;
  const duration = 0.5;
  const vol = 0.5;
  const numSamples = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const freq = 600;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    if (t < 0.1 || (t > 0.2 && t < 0.3) || (t > 0.4 && t < 0.5)) {
        sample = Math.sin(2 * Math.PI * freq * t);
    }
    const envelope = i < 400 ? i / 400 : (i > numSamples - 400 ? (numSamples - i) / 400 : 1);
    view.setInt16(44 + i * 2, sample * vol * 0x7FFF * envelope, true);
  }

  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
