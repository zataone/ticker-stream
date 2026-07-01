# TickerStream — Real-Time Crypto & Stock Tracker 🚀📈

Aplikasi dasbor finansial berkinerja tinggi yang dirancang untuk memantau pergerakan harga saham dan mata uang kripto secara langsung (*live streaming*). Proyek ini dikembangkan menggunakan **Svelte 5 (Runes)**, **TypeScript**, dan **Tailwind CSS v4** untuk menghasilkan antarmuka yang ultra-responsif, hemat memori, dan mudah disematkan ke dalam sistem portofolio Anda.

---

## 🌟 Fitur Utama

* **Real-Time Data Streaming**: Integrasi penuh dengan **Binance WebSocket API** untuk pembaruan data harga mata uang kripto secara langsung tanpa jeda (nol *delay*).
* **High-Fidelity Stock Simulation**: Simulasi real-time pergerakan harga saham populer (AAPL, TSLA, MSFT, AMZN, GOOGL) menggunakan permodelan matematika *Geometric Brownian Motion* (GBM) untuk mensimulasikan data-heavy environment secara realistis di sisi klien.
* **TradingView Financial Charts**: Integrasi interaktif dengan pustaka `@lightweight-charts` (TradingView) untuk visualisasi pergerakan harga lilin (*candlestick*) dan volume transaksi yang diperbarui secara *real-time*.
* **Smart Alert System (Web Audio API)**: Sistem alarm harga target yang mengevaluasi kecocokan harga di setiap detak WebSocket. Ketika terpicu, sistem memicu efek suara menggunakan modul sintesis audio bawaan browser serta memunculkan notifikasi melayang (*toast*).
* **Performance Diagnostics Dashboard**: Widget diagnosis performa aktif yang menampilkan metrik frekuensi detak (*tick rate*), perkiraan pembaruan DOM (*DOM updates count*), total pemrosesan pembaruan, dan latensi jaringan (*network latency*) untuk membuktikan efisiensi kompilasi Svelte 5.
* **Responsive Grid & Dark/Light Theme**: Dasbor responsif dengan visualisasi sparkline SVG mini pada setiap kartu aset dan transisi mulus antara tema gelap dan terang.

---

## ⚡ Keunggulan Sistem (Mengapa Svelte?)

Aplikasi ini memanfaatkan kelebihan arsitektur kompiler **Svelte 5** secara maksimal untuk memproses volume data tinggi:
* **Tanpa Virtual DOM**: Svelte mengompilasi kode menjadi manipulasi DOM murni saat *build-time*, meminimalkan overhead pemrosesan dan rendering ketika memproses ribuan data per detik.
* **Svelte 5 Runes**: Pemanfaatan reactivity modern (`$state`, `$derived`, `$effect`, `$state.snapshot`) untuk struktur state yang sangat bersih, modular, dan bebas *boilerplate*.
* **Hemat Memori**: Konsumsi memori sisi klien (*client-side memory footprint*) yang sangat kecil karena Svelte tidak perlu membandingkan seluruh pohon render saat terjadi pembaruan.
* **Type Safety**: Integrasi penuh **TypeScript** di seluruh model data, store, dan properti komponen Svelte untuk meminimalisasi bug runtime data finansial.

---

## 🛠️ Teknologi yang Digunakan

* **Framework:** SvelteKit / Svelte 5 (TypeScript)
* **Styling:** Tailwind CSS v4 (menggunakan CSS-first `@theme` variables)
* **State Management:** Svelte 5 Runes (`tickerStore.svelte.ts`)
* **Charts:** TradingView `@lightweight-charts`
* **Real-time Protocol:** Native browser WebSocket API (koneksi ke wss://stream.binance.com) & Web Audio API (untuk sound synthesis)

---

## 📦 Instalasi & Penggunaan

### Prasyarat
Pastikan Anda sudah menginstal **Node.js** (versi 18+) di komputer Anda.

### Langkah-langkah
1. **Klon repositori ini:**
   ```bash
   git clone https://github.com/username/ticker-stream.git
   cd ticker-stream
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan lokal:**
   ```bash
   npm run dev
   ```
   Buka peramban (browser) Anda ke alamat `http://localhost:5173`.

4. **Kompilasi build produksi:**
   ```bash
   npm run build
   ```
   Untuk melihat pratinjau hasil build produksi lokal:
   ```bash
   npm run preview
   ```
