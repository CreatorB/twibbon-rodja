# YCS Kartu Ucapan

YCS adalah singkatan dari Yayasan Cahaya Sunnah.

Web app generator kartu ucapan berbasis Vite dengan 3 tab:

1. Simple
- User cukup isi nama.
- Semua template YCS langsung muncul sebagai preview.
- Setiap card bisa langsung Download atau Share.

2. Studio
- User bisa pilih template, ubah font, warna, ukuran, dan offset teks.
- Teks dapat digeser langsung di canvas (drag).
- User bisa upload template pribadi (hanya lokal browser, tidak tersimpan ke sistem).
- Tersedia Preset Helper untuk menghasilkan JSON placeholder siap copy ke manifest.

3. Gallery
- Tidak ada edit teks atau watermark.
- Card siap pakai untuk Download atau Share langsung.

## Stack
- Vite
- HTML
- CSS
- JavaScript Canvas API

## Jalankan Lokal
```sh
npm install
npm run dev
```

Build production:
```sh
npm run build
```

## Counter Production Namespace
- Counter CountAPI dikonfigurasi lewat `appConfig.counterNamespace` di `public/templates/manifest.json`.
- Build atau deploy ulang tidak akan mereset counter selama namespace dan ID template/card tidak diubah.
- Jika project ini di-clone untuk domain lain, cukup ganti nilai `counterNamespace` agar data counter terpisah.
- Jika ingin mematikan fitur counter, ubah `appConfig.counterEnabled` menjadi `false`.
- Jika ingin mengubah prefix nama file hasil download/share, ubah `appConfig.fileNamePrefix`.

## Cara Pakai `appConfig`
Gunakan `appConfig` di `public/templates/manifest.json` untuk mengubah konfigurasi aplikasi tanpa edit file JavaScript.

Contoh:
```json
{
  "appConfig": {
    "counterNamespace": "ucapan-rodja-co-id",
    "counterEnabled": true,
    "fileNamePrefix": "ycs",
    "pageTitle": "YCS Twibbon",
    "heroEyebrow": "YCS Twibbon",
    "heroTitle": "Yayasan Cahaya Sunnah Twibbon",
    "heroDescription": "Platform kartu ucapan resmi di bawah naungan Yayasan Cahaya Sunnah.",
    "metaDescription": "Platform kartu ucapan resmi Yayasan Cahaya Sunnah untuk membuat dan membagikan kartu ucapan dengan tampilan rapi, cepat, dan siap pakai.",
    "canonicalUrl": "https://ucapan.rodja.co.id/",
    "tabLabelSimple": "Simple",
    "tabLabelStudio": "Studio",
    "tabLabelGallery": "Gallery",
    "simpleSectionTitle": "Simple",
    "simpleSectionDescription": "Isi nama sekali, lalu seluruh template YCS langsung muncul dan siap dibagikan.",
    "simpleSectionHelper": "Preview otomatis menyesuaikan setting placeholder tiap template.",
    "studioSectionTitle": "Studio",
    "studioSectionDescription": "Atur detail teks, geser posisi, dan upload template pribadi untuk kebutuhan personal.",
    "gallerySectionTitle": "Gallery",
    "gallerySectionDescription": "Kumpulan kartu ucapan siap pakai. Tidak perlu edit teks, langsung download atau share.",
    "footerCreditPrefix": "Made with",
    "footerCreditBy": "by",
    "footerCreditLinkText": "IT Syathiby 2024",
    "footerCreditLinkHref": "https://syathiby.github.io/",
    "footerSourceLinkText": "Open Source",
    "footerSourceLinkHref": "https://github.com/CreatorB/twibbon-rodja"
  },
  "ycsTemplates": [],
  "freeFrames": []
}
```

Keterangan field:
- `counterNamespace`: namespace CountAPI agar counter tidak bercampur dengan project/domain lain.
- `counterEnabled`: `true/false` untuk menyalakan atau mematikan fitur counter.
- `fileNamePrefix`: prefix nama file saat download/share.
- `pageTitle`: judul halaman browser.
- `heroEyebrow`: teks kecil di atas judul hero.
- `heroTitle`: judul utama hero.
- `heroDescription`: deskripsi singkat di hero.
- `metaDescription`: deskripsi SEO dasar untuk halaman.
- `canonicalUrl`: canonical URL halaman production.
- `tabLabelSimple`, `tabLabelStudio`, `tabLabelGallery`: label tab desktop + mobile.
- `simpleSectionTitle`, `simpleSectionDescription`, `simpleSectionHelper`: teks panel Simple.
- `studioSectionTitle`, `studioSectionDescription`: teks panel Studio.
- `gallerySectionTitle`, `gallerySectionDescription`: teks panel Gallery.
- `footerCreditPrefix`, `footerCreditBy`: teks footer bagian kredit.
- `footerCreditLinkText`, `footerCreditLinkHref`: label + URL link kredit.
- `footerSourceLinkText`, `footerSourceLinkHref`: label + URL link open source.

### Preset Siap Pakai

Preset A - Production Rodja (saat ini):
```json
{
  "appConfig": {
    "counterNamespace": "ucapan-rodja-co-id",
    "counterEnabled": true,
    "fileNamePrefix": "ycs",
    "pageTitle": "YCS Twibbon",
    "heroEyebrow": "YCS Twibbon",
    "heroTitle": "Yayasan Cahaya Sunnah Twibbon",
    "heroDescription": "Platform kartu ucapan resmi di bawah naungan Yayasan Cahaya Sunnah.",
    "metaDescription": "Platform kartu ucapan resmi Yayasan Cahaya Sunnah untuk membuat dan membagikan kartu ucapan dengan tampilan rapi, cepat, dan siap pakai.",
    "canonicalUrl": "https://ucapan.rodja.co.id/",
    "tabLabelSimple": "Simple",
    "tabLabelStudio": "Studio",
    "tabLabelGallery": "Gallery",
    "simpleSectionTitle": "Simple",
    "simpleSectionDescription": "Isi nama sekali, lalu seluruh template YCS langsung muncul dan siap dibagikan.",
    "simpleSectionHelper": "Preview otomatis menyesuaikan setting placeholder tiap template.",
    "studioSectionTitle": "Studio",
    "studioSectionDescription": "Atur detail teks, geser posisi, dan upload template pribadi untuk kebutuhan personal.",
    "gallerySectionTitle": "Gallery",
    "gallerySectionDescription": "Kumpulan kartu ucapan siap pakai. Tidak perlu edit teks, langsung download atau share.",
    "footerCreditPrefix": "Made with",
    "footerCreditBy": "by",
    "footerCreditLinkText": "IT Syathiby 2024",
    "footerCreditLinkHref": "https://syathiby.github.io/",
    "footerSourceLinkText": "Open Source",
    "footerSourceLinkHref": "https://github.com/CreatorB/twibbon-rodja"
  }
}
```

Preset B - Generic Instansi Lain (template):
```json
{
  "appConfig": {
    "counterNamespace": "ucapan-nama-instansi",
    "counterEnabled": true,
    "fileNamePrefix": "ucapan",
    "pageTitle": "Ucapan Instansi",
    "heroEyebrow": "Ucapan Resmi",
    "heroTitle": "Twibbon Instansi",
    "heroDescription": "Platform kartu ucapan resmi instansi.",
    "metaDescription": "Generator twibbon resmi untuk membuat dan membagikan kartu ucapan.",
    "canonicalUrl": "https://contoh-domain.id/",
    "tabLabelSimple": "Simple",
    "tabLabelStudio": "Studio",
    "tabLabelGallery": "Gallery",
    "simpleSectionTitle": "Simple",
    "simpleSectionDescription": "Isi nama sekali, semua template langsung siap.",
    "simpleSectionHelper": "Preview menyesuaikan placeholder setiap template.",
    "studioSectionTitle": "Studio",
    "studioSectionDescription": "Atur detail teks dan posisi sesuai kebutuhan.",
    "gallerySectionTitle": "Gallery",
    "gallerySectionDescription": "Kartu siap pakai untuk download atau share.",
    "footerCreditPrefix": "Made with",
    "footerCreditBy": "by",
    "footerCreditLinkText": "Tim IT",
    "footerCreditLinkHref": "https://example.com/",
    "footerSourceLinkText": "Open Source",
    "footerSourceLinkHref": "https://github.com/your-org/your-repo"
  }
}
```

Langkah cepat migrasi domain lain:
1. Ganti nilai `appConfig` sesuai brand/domain target.
2. Pastikan `counterNamespace` unik untuk domain target.
3. Ganti `canonicalUrl` ke URL production yang benar.
4. Build lalu deploy seperti biasa.

## Struktur Utama
```txt
twibbon-rodja/
  index.html
  public/
    icon-32.png
    icon-180.png
    icon-192.png
    icon-512.png
    favicon.svg
    og-image-1200x630.png
    site.webmanifest
    templates/
      manifest.json
      ycs-frame/
      galleries/
  src/
    main.js
    style.css
    templates.js
```

## Workflow Template Untuk Tim Designer
1. Simpan frame resmi di folder public/templates/ycs-frame.
2. Simpan kartu ucapan siap pakai di folder public/templates/galleries.
3. Edit daftar template di public/templates/manifest.json.
4. Tidak perlu edit logic rendering di src/main.js.

Struktur manifest yang dipakai:
```json
{
  "ycsTemplates": [],
  "freeFrames": []
}
```

Contoh entri frame pada ycsTemplates:
```json
{
  "id": "kajian-ramadhan-1",
  "title": "Kajian Ramadhan 1",
  "description": "Tema hijau emas",
  "image": "kajian-ramadhan-1.png",
  "textBox": {
    "x": 0.5,
    "y": 0.78,
    "maxWidth": 0.7,
    "maxLines": 3,
    "minFont": 28,
    "maxFont": 72,
    "lineHeight": 1.16,
    "align": "center"
  },
  "textStyle": {
    "mainColor": "#ffffff",
    "shadowColor": "rgba(0, 0, 0, 0.25)"
  }
}
```

Contoh entri kartu ucapan pada freeFrames:
```json
{
  "id": "idulfitri-ucapan-1",
  "title": "Ucapan Idulfitri 1",
  "description": "Kartu siap pakai",
  "image": "idulfitri-ucapan-1.png"
}
```
## Menambah Template Baru (Ringkas)
1. Tambahkan file gambar ke public/templates/ycs-frame.
2. Tambahkan objek template ke array ycsTemplates di public/templates/manifest.json.
3. Jalankan aplikasi dan cek di tab Simple serta Studio.

## Kalibrasi Preset Dengan Preset Helper
1. Buka tab Studio.
2. Pilih template yang ingin dikalibrasi.
3. Atur slider Preset Helper: Anchor X/Y, Max Width, Max Lines, Min/Max Font, dan Line Height.
4. Klik Copy JSON lalu paste ke public/templates/manifest.json pada entri template terkait.

## Menambah Kartu Ucapan (Tab Galeri)
1. Tambahkan file gambar ke public/templates/galleries.
2. Tambahkan objek kartu ke array freeFrames di public/templates/manifest.json.
3. Cek hasilnya di tab Gallery.

Contoh minimal preset (fallback di src/templates.js):
```js
{
  id: "template-baru",
  title: "Template Baru",
  description: "Deskripsi singkat",
  imagePath: "/templates/template-baru.png",
  textBox: {
    x: 0.5,
    y: 0.8,
    maxWidth: 0.72,
    maxLines: 3,
    minFont: 30,
    maxFont: 72,
    lineHeight: 1.16,
    align: "center"
  }
}
```

## Best Practice Placeholder Teks
- Gunakan nilai relatif 0 sampai 1 untuk x, y, maxWidth agar konsisten di semua ukuran output.
- Fokuskan textBox untuk area aman yang tidak menabrak ornamen template.
- Uji minimal 3 skenario:
  - Nama pendek (1-2 kata)
  - Nama sedang (3-4 kata)
  - Nama panjang (5+ kata)
- Jika template punya area sempit, turunkan maxFont dan naikkan maxLines.

## Checklist QA Sebelum Publish Template
1. Cek template di ukuran 1080x1350, 1080x1080, dan 1080x1920.
2. Uji nama pendek, sedang, panjang, dan nama dengan 2 baris.
3. Cek kontras teks terhadap background pada tab Simple dan Studio.
4. Cek hasil download PNG dan pastikan resolusi sesuai pilihan ukuran.
5. Cek fitur share di minimal 1 Android dan 1 iOS (jika tersedia).
6. Pastikan tidak ada elemen teks menabrak logo, ornament, atau area wajah pada desain.
7. Pastikan metadata dan aset share image sudah sesuai untuk production.

## Langkah Berikutnya Yang Perlu Anda Cek
1. Siapkan frame production ke public/templates/ycs-frame.
2. Siapkan kartu ucapan siap pakai ke public/templates/galleries.
3. Isi metadata placeholder di public/templates/manifest.json.
4. Jalankan QA checklist di atas, lalu catat template yang perlu penyesuaian textBox.
5. Finalisasi branch setelah semua template lolos di semua tab.

## Deploy via SSH + Git

Pilih salah satu metode deploy berikut.

### Deploy Cepat Production (Rekomendasi)
Jika targetnya langsung live dan server sering OOM saat build, gunakan urutan ini:

```sh
# lokal
cd D:/IT/HSN/syathiby/ycs/twibbon-rodja
git checkout dev
git pull origin dev
npm install
npm run build

# upload ke hosting
rsync -avz --delete -e "ssh -p 18765" dist/ u44-ymt6jwdhjg4c@ssh.rodja.co.id:~/www/ucapan.rodja.co.id/public_html/
```

Lalu verifikasi:
```sh
ssh u44-ymt6jwdhjg4c@ssh.rodja.co.id -p 18765
cd ~/www/ucapan.rodja.co.id/public_html
ls
```

Pastikan minimal ada `index.html`, `assets/`, `templates/`, `site.webmanifest`, dan `favicon.svg`.

### Metode A: Build di Hosting (jika RAM server cukup)
```sh
ssh u44-ymt6jwdhjg4c@ssh.rodja.co.id -p 18765
cd ~/www/ucapan.rodja.co.id

# clone pertama kali
git clone https://github.com/CreatorB/twibbon-rodja.git public_html
cd public_html

# pilih branch yang berisi update terbaru
git fetch origin
git checkout dev
git pull origin dev

# install dependency dan build
npm install
npm run build

# publish static build ke document root yang diserve
rsync -av --delete dist/ ./
```

Catatan:
- Jika muncul error OOM saat `npm run build`, gunakan Metode B (build di lokal).
- Untuk update berikutnya cukup ulang dari `git fetch origin` sampai `rsync dist/ ./`.

### Metode B: Build di Lokal + Upload ke Hosting (disarankan)
```sh
# di lokal
cd D:/IT/HSN/syathiby/ycs/twibbon-rodja
git checkout dev
git pull origin dev
npm install
npm run build
```

Upload hasil `dist` ke server (pakai salah satu):

```sh
# opsi 1 (rsync, lebih efisien)
rsync -avz --delete -e "ssh -p 18765" dist/ u44-ymt6jwdhjg4c@ssh.rodja.co.id:~/www/ucapan.rodja.co.id/public_html/
```

```sh
# opsi 2 (scp)
scp -P 18765 -r dist/* u44-ymt6jwdhjg4c@ssh.rodja.co.id:~/www/ucapan.rodja.co.id/public_html/
```

Verifikasi di server:
```sh
ssh u44-ymt6jwdhjg4c@ssh.rodja.co.id -p 18765
cd ~/www/ucapan.rodja.co.id/public_html
ls
```

Pastikan ada file/folder static berikut:
- `index.html`
- `assets/`
- `templates/`
- `favicon.svg`, `icon-*.png`, `site.webmanifest`

### Cek Document Root Domain
Jika website masih menampilkan tema lama, kemungkinan document root bukan di `public_html`.

Uji cepat:
```sh
cd ~/www/ucapan.rodja.co.id/public_html
echo OK-DEPLOY > deploy-check.txt
```

Buka `https://ucapan.rodja.co.id/deploy-check.txt`.
- Jika tampil `OK-DEPLOY`, berarti document root benar.
- Jika tidak tampil, sesuaikan deploy ke folder document root yang benar dari panel hosting.
