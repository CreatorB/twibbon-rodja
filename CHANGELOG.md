# Changelog

Semua perubahan penting pada project ini dicatat di file ini.

## [Unreleased]

### Changed
- Penyesuaian template TK Cahaya Sunnah: warna teks nama diubah menjadi putih dengan bayangan gelap agar kontras meningkat.
- Penyesuaian posisi teks template TK Cahaya Sunnah: nilai anchor Y dinaikkan dari 0.54 ke 0.53 agar lebih center terhadap placeholder bingkai.

## [1.1.0] - 2026-03-13

### Added
- Tambah template baru TK Cahaya Sunnah dengan id `tk-cahaya-sunnah-frame` di `public/templates/manifest.json`.
- Tambah dukungan fallback preset untuk TK Cahaya Sunnah di `src/templates.js`.
- Tambah mapping font rekomendasi untuk TK Cahaya Sunnah di `src/main.js` (`getSuggestedFontId`).

### Changed
- Samakan nilai preset `textBox.y` template TK Cahaya Sunnah pada fallback (`src/templates.js`) dengan nilai pada manifest agar konsisten.
