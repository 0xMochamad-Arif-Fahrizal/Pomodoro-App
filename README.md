# Pomodoro Menu Bar App

Aplikasi Pomodoro Timer minimalis untuk macOS, berjalan di menu bar menggunakan Electron.

## Cara Menjalankan

1. **Pastikan Node.js sudah terinstal di komputer Anda.**

2. Buka terminal di folder proyek ini, lalu jalankan perintah berikut untuk menginstal dependensi:

   ```bash
   npm install
   ```

3. Setelah instalasi selesai, jalankan aplikasi dengan perintah:

   ```bash
   npm start
   ```

4. Aplikasi akan muncul di menu bar (pojok kanan atas layar Mac Anda). Tidak ada jendela utama atau ikon di Dock.

5. Klik ikon tray untuk membuka popup pengatur timer.

## Catatan
- Pastikan file ikon tray (`assets/trayTemplate.png`) sudah tersedia. Anda bisa mengganti dengan ikon PNG transparan ukuran 16x16 atau 24x24 px.
- Jika ingin build aplikasi menjadi file .app, gunakan [electron-builder](https://www.electron.build/) atau [electron-forge](https://www.electronforge.io/).

---

**Selamat fokus dan produktif!** # Pomodoro App
