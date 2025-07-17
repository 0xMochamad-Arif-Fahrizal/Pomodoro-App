const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow = null;
let timer = null;
let remainingSeconds = 1500; // default 25 min
let timerRunning = false;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function showNotification() {
  new Notification({
    title: 'Pomodoro Complete',
    body: 'Time is up! Take a break.',
  }).show();
}

function startTimer(duration) {
  if (timer) clearInterval(timer);
  remainingSeconds = duration;
  timerRunning = true;
  timer = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      if (mainWindow) mainWindow.webContents.send('timer-tick', remainingSeconds);
    } else {
      clearInterval(timer);
      timer = null;
      timerRunning = false;
      showNotification();
      if (mainWindow) mainWindow.webContents.send('timer-done');
    }
  }, 1000);
}

function stopTimer() {
  if (timer) clearInterval(timer);
  timer = null;
  timerRunning = false;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 200,
    show: true,
    frame: true, // gunakan frame asli OS
    resizable: false,
    movable: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createMainWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.handle('get-timer-state', () => ({
  remainingSeconds,
  timerRunning,
}));
ipcMain.on('set-timer', (e, seconds) => {
  if (!timerRunning) {
    remainingSeconds = seconds;
    if (mainWindow) mainWindow.webContents.send('timer-tick', remainingSeconds);
  }
});
ipcMain.on('start-timer', (e, seconds) => {
  if (!timerRunning) startTimer(seconds);
});
ipcMain.on('stop-timer', () => {
  stopTimer();
  if (mainWindow) mainWindow.webContents.send('timer-tick', remainingSeconds);
});
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
ipcMain.on('window-quit', () => {
  app.quit();
}); 