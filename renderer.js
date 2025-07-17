// Ketika dokumen sudah siap
document.addEventListener('DOMContentLoaded', async () => {
  // Ambil elemen slider, tick, indikator, timer, dan tombol
  const barSlider = document.getElementById('bar-slider'); // SVG slider
  const barTicks = document.getElementById('bar-ticks');   // Grup garis tick
  const barIndicator = document.getElementById('bar-indicator'); // Indikator tebal
  const timeDisplay = document.getElementById('time-display');   // Teks timer
  const startBtn = document.getElementById('start-btn');   // Tombol start
  const resetBtn = document.getElementById('reset-btn');   // Tombol reset

  // Konfigurasi slider
  const minValue = 0, maxValue = 120; // Range waktu (menit) diperpanjang sampai 2 jam
  const tickCount = 120;              // Jumlah tick
  const sliderX = 0, sliderY = 10, sliderW = 600, sliderH = 40; // Posisi & ukuran slider
  let value = 25;                    // Nilai awal (menit)
  let dragging = false;              // Status drag
  let timerRunning = false;          // Status timer berjalan
  let timerPaused = false;           // Status timer pause
  let timerInterval = null;          // Interval timer
  let remainingSeconds = value * 60; // Sisa detik timer

  // Fungsi untuk menggambar tick/mark pada slider
  function drawTicks() {
    barTicks.innerHTML = '';
    for (let i = 0; i <= tickCount; i++) {
      const x = sliderX + (i / tickCount) * sliderW; // Posisi X tiap tick
      // Tambahkan garis tipis ke SVG
      barTicks.innerHTML += `<rect x="${x-1}" y="${sliderY}" width="2" height="${sliderH}" rx="1" fill="#e5e5e5"/>`;
    }
  }

  // Fungsi untuk update posisi indikator dan tampilan timer
  function updateUI(val, forceUpdateSlider = false, fromTimer = false) {
    // Jika update dari timer, value diambil dari sisa detik
    if (fromTimer) {
      value = Math.max(minValue, Math.min(maxValue, remainingSeconds / 60));
    } else {
      value = Math.max(minValue, Math.min(maxValue, val)); // Clamp nilai
    }
    const percent = (value - minValue) / (maxValue - minValue); // Persentase posisi
    const x = sliderX + percent * sliderW; // Posisi X indikator
    barIndicator.setAttribute('x', x-2);   // Geser indikator
    // Update tampilan timer (format X:XX:XX jika >1 jam, XX:XX jika <1 jam)
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = (remainingSeconds % 60);
    let display;
    if (h > 0) {
      display = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      display = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    timeDisplay.textContent = display;
    // Jika slider diubah manual (bukan timer), update remainingSeconds
    if ((!timerRunning || forceUpdateSlider) && !fromTimer) {
      remainingSeconds = value * 60;
    }
  }

  // Fungsi untuk konversi posisi mouse/touch ke nilai waktu
  function eventToValue(e) {
    const rect = barSlider.getBoundingClientRect(); // Ambil posisi slider di layar
    const mouseX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; // Posisi X mouse
    let x = Math.max(sliderX, Math.min(sliderX + sliderW, mouseX)); // Clamp ke area slider
    const percent = (x - sliderX) / sliderW; // Persentase posisi
    return Math.round(minValue + percent * (maxValue - minValue)); // Nilai waktu
  }

  // Fungsi untuk update tampilan tombol sesuai status timer
  function setButtonState() {
    if (!timerRunning) {
      resetBtn.textContent = 'Reset';
      startBtn.textContent = 'Start';
    } else if (timerPaused) {
      resetBtn.textContent = 'Stop';
      startBtn.textContent = 'Resume';
    } else {
      resetBtn.textContent = 'Stop';
      startBtn.textContent = 'Pause';
    }
  }

  // Fungsi untuk menampilkan notifikasi native
  function showNotification(type) {
    let title = '';
    let body = '';
    if (type === 'start') {
      title = 'Pomodoro Dimulai!';
      body = 'Fokus pada tugasmu sekarang.';
    } else if (type === 'done') {
      title = 'Pomodoro Selesai!';
      body = 'Waktumu sudah habis. Saatnya istirahat!';
    }
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (window.Notification && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }

  // Fungsi untuk menjalankan timer
  function runTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!timerPaused && timerRunning) {
        if (remainingSeconds > 0) {
          remainingSeconds--;
          updateUI(value, true, true); // Update UI dan slider dari timer
        }
        if (remainingSeconds <= 0) {
          clearInterval(timerInterval);
          timerRunning = false;
          timerPaused = false;
          setButtonState();
          value = 0;
          updateUI(value, true, true);
          showNotification('done'); // Notifikasi selesai
        }
      }
    }, 1000);
  }

  // Interaksi drag mouse pada indikator
  barIndicator.addEventListener('mousedown', (e) => {
    if (timerRunning) return; // Tidak bisa drag saat timer berjalan
    dragging = true; // Mulai drag
    document.body.style.cursor = 'grabbing'; // Ubah cursor
    e.stopPropagation(); // Stop event bubbling
  });
  // Interaksi klik/drag pada slider
  barSlider.addEventListener('mousedown', (e) => {
    if (timerRunning) return; // Tidak bisa drag saat timer berjalan
    const val = eventToValue(e); // Hitung nilai dari posisi mouse
    dragging = true;
    updateUI(val, true);
  });
  // Update saat mouse digeser
  document.addEventListener('mousemove', (e) => {
    if (!dragging || timerRunning) return;
    const val = eventToValue(e);
    updateUI(val, true);
  });
  // Selesai drag
  document.addEventListener('mouseup', () => {
    dragging = false;
    document.body.style.cursor = '';
  });

  // Interaksi drag pada mobile (touch)
  barIndicator.addEventListener('touchstart', (e) => { if (!timerRunning) dragging = true; e.stopPropagation(); });
  barSlider.addEventListener('touchstart', (e) => {
    if (timerRunning) return;
    const val = eventToValue(e);
    dragging = true;
    updateUI(val, true);
  });
  document.addEventListener('touchmove', (e) => {
    if (!dragging || timerRunning) return;
    const val = eventToValue(e);
    updateUI(val, true);
  });
  document.addEventListener('touchend', () => { dragging = false; });

  // Tombol Start/Pause/Resume
  startBtn.addEventListener('click', () => {
    if (!timerRunning) {
      timerRunning = true;
      timerPaused = false;
      setButtonState();
      runTimer();
      showNotification('start'); // Notifikasi mulai
    } else if (!timerPaused) {
      timerPaused = true;
      setButtonState();
    } else {
      timerPaused = false;
      setButtonState();
      runTimer();
      showNotification('start'); // Notifikasi resume
    }
  });

  // Tombol Reset/Stop
  resetBtn.addEventListener('click', () => {
    if (!timerRunning) {
      value = 25;
      updateUI(value, true);
    } else {
      timerRunning = false;
      timerPaused = false;
      setButtonState();
      value = 25;
      updateUI(value, true);
      clearInterval(timerInterval);
    }
  });

  // Gambar tick dan set UI awal
  drawTicks();
  updateUI(value, true);
  setButtonState();
}); // force update timestamp
