const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pomodoro', {
  getTimerState: () => ipcRenderer.invoke('get-timer-state'),
  setTimer: (seconds) => ipcRenderer.send('set-timer', seconds),
  startTimer: (seconds) => ipcRenderer.send('start-timer', seconds),
  stopTimer: () => ipcRenderer.send('stop-timer'),
  onTick: (cb) => ipcRenderer.on('timer-tick', (e, s) => cb(s)),
  onDone: (cb) => ipcRenderer.on('timer-done', cb),
  windowControl: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    quit: () => ipcRenderer.send('window-quit'),
  },
}); 