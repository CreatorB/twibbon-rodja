# Changelog

Semua perubahan penting pada project ini dicatat di file ini.

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
