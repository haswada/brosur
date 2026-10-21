# HASWADA — Website Brosur Sekolah (Demo)

Website mobile-first / portrait untuk SMP & SMA Hasanuddin (HASWADA).  
Desain elegan hangat terinspirasi undangan digital premium.

---

## Cara Membuka

1. Extract file ZIP
2. Buka `index.html` di browser HP atau Chrome (mode mobile)
3. Atau upload seluruh folder ke hosting

---

## Cara Mengganti Data & Foto

### 1. Ganti Foto

Semua foto ada di folder `images/`.

| File yang perlu diganti          | Digunakan di section      |
|----------------------------------|---------------------------|
| `grow-1.jpg` ~ `grow-3.jpg`      | Grow (belajar & keterampilan) |
| `live-1.jpg` ~ `live-3.jpg`      | Live (kehidupan sekolah)  |
| `eskul-*.jpg`                    | Ekstrakurikuler           |
| `fasilitas-*.jpg`                | Fasilitas                 |
| `prestasi-1.jpg`, `prestasi-2.jpg` | Prestasi                |
| `guru-1.jpg`, `guru-2.jpg`       | The People                |
| `alumni-1.jpg`, `alumni-2.jpg`   | Alumni                    |

**Ukuran rekomendasi:**
- Foto portrait / vertikal: 800×1000 px atau 1080×1350 px
- Foto landscape (fasilitas): 1200×800 px
- Format: JPG atau WebP (lebih ringan)

Ganti saja file-nya dengan nama yang sama.

---

### 2. Ganti Teks / Data

Buka file `index.html` dengan text editor (VS Code, Notepad++, dll).

#### Nama Sekolah & Tagline
Cari bagian:
```html
<h1 class="logo-text ...">HASWADA</h1>
<p class="tagline ...">Masa Depanmu Dimulai di Sini.</p>
```

#### Daftar Ekstrakurikuler
Cari class `eskul-card`. Contoh:
```html
<div class="eskul-card" data-desc="Deskripsi singkat di sini.">
  <div class="eskul-img" style="background-image: url('images/eskul-sepakbola.jpg')"></div>
  <h3>Sepakbola</h3>
</div>
```
- Ubah `data-desc` untuk kalimat saat disentuh
- Ubah nama di dalam `<h3>`
- Ubah path gambar

#### Data Guru
Cari class `person-card`.

#### Testimonial Alumni
Cari class `testimonial`.

#### Harga Beasiswa / Program
Ada di file `js/main.js`. Cari bagian:
```js
if (selectedProgram === 'Prestasi') {
  ...
  priceValue.textContent = 'Rp 1.205.000';
}
```

#### Nomor WhatsApp
Di `js/main.js`, cari baris:
```js
const phone = '6281234567890'; // <-- GANTI NOMOR INI
```
Ganti dengan nomor WhatsApp sekolah (format 62...).

---

### 3. Warna (Opsional)

Semua warna ada di file `css/style.css` bagian `:root`.

```css
--primary: #7A8F6E;      /* Sage Green */
--secondary: #C48A6E;    /* Dusty Terracotta */
--accent: #C5A46E;       /* Soft Gold */
--bg: #F8F4EF;           /* Cream */
```

---

## Catatan Demo

Konten saat ini adalah **versi demo**.  
Semua nama guru, alumni, harga, dan deskripsi bisa diganti sesuai data asli sekolah.

---

Dibuat dengan desain Elegant Warm + animasi soft.
