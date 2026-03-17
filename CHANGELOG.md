# Changelog

Semua perubahan penting pada project ini dicatat di file ini.

## [1.0.3] - 2026-03-17

### Added
- Tambah template Al-Barkah Frame (`albarkah-frame`) di manifest dan fallback preset.
- Tambah counter berbasis GitHub Gist API (mengganti CountAPI yang tidak tersedia).
- Tambah environment variable `VITE_GIST_TOKEN` untuk keamanan token GitHub.
- Tambah file `.env.example` sebagai template konfigurasi.
- Tambah debug logging untuk troubleshooting counter.

### Changed
- Samakan nilai `textBox.maxWidth` seluruh template YCS di fallback preset (`src/templates.js`) menjadi 0.62 sesuai manifest.
- Perbaiki posisi `y` beberapa template di fallback preset agar sesuai dengan manifest:
  - `syathiby-frame`: 0.715
  - `kias-frame`: 0.360
  - `stq-syathiby-frame`: 0.55 (diperbaiki dari 0.54)
- Perbaiki `textStyle.mainColor` template `tk-cahaya-sunnah-frame` di fallback preset menjadi `#1d7a63` sesuai manifest.
- Hapus dropdown pemilihan ukuran output di Simple dan Studio tab.
- Counter sekarang update secara real-time tanpa perlu reload halaman.
- Update README dengan panduan konfigurasi GitHub Gist.

### Removed
- Hapus `OUTPUT_SIZES` dari `src/templates.js`.
- Hapus `getSizeById()` dan semua referensi size selector di `src/main.js`.
- Hapus elemen HTML size select di `index.html`.
- Hapus dependensi ke countapi.xyz.

## [1.0.2] - 2026-03-14

### Changed
- Penyesuaian template TK Cahaya Sunnah: warna teks nama diubah menjadi putih dengan bayangan gelap agar kontras meningkat.
- Penyesuaian posisi teks template TK Cahaya Sunnah: nilai anchor Y dinaikkan dari 0.54 ke 0.53 agar lebih center terhadap placeholder bingkai.
- Rebranding label utama dari "YCS Twibbon" menjadi "YCS Eid Greeting Card" pada title halaman, hero eyebrow, dan metadata sosial.
- Header utama diubah dari "Yayasan Cahaya Sunnah Twibbon" menjadi "Yayasan Cahaya Sunnah".
- Rebranding level package: nama package npm diubah dari "twibbon-rodja" menjadi "ycs-eid-greeting-card" dan disinkronkan ke lockfile.
- Penyesuaian copywriting: frasa "Platform kartu ucapan" diperbarui menjadi "Platform kartu ucapan id" pada hero description, meta description, dan dokumentasi terkait.
- Preset Helper di Studio sekarang memiliki dropdown preset teks berbasis frame dari manifest, sehingga placeholder bisa mengikuti frame lain seperti layout teks rata kiri tanpa mengganti gambar frame aktif.
- Perilaku fitting teks di Studio disamakan dengan mode Simple: ukuran font yang dipilih kini otomatis mengecil bila perlu agar nama tetap muat di area preset dan tidak terpotong hanya karena batas baris.
- Default mode Studio kini mengikuti mode Simple secara persis untuk font, warna teks, ukuran awal, offset, dan auto-fit; user tetap bisa menyesuaikan semuanya secara manual setelahnya.

## [1.0.1] - 2026-03-13

### Added
- Tambah template baru TK Cahaya Sunnah dengan id `tk-cahaya-sunnah-frame` di `public/templates/manifest.json`.
- Tambah dukungan fallback preset untuk TK Cahaya Sunnah di `src/templates.js`.
- Tambah mapping font rekomendasi untuk TK Cahaya Sunnah di `src/main.js` (`getSuggestedFontId`).

### Changed
- Samakan nilai preset `textBox.y` template TK Cahaya Sunnah pada fallback (`src/templates.js`) dengan nilai pada manifest agar konsisten.
