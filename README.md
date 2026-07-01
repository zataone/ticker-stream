# Real-Time Crypto & Stock Tracker 🚀📈

Aplikasi dasbor finansial berkinerja tinggi yang dirancang untuk memantau pergerakan harga saham dan mata uang kripto secara langsung (*live streaming*). Dibangun dengan kombinasi **TypeScript** dan **Svelte / SvelteKit** untuk menghasilkan antarmuka yang ultra-responsif dan hemat memori.

---

## 🌟 Fitur Utama

* **Real-Time Data Streaming**: Integrasi penuh dengan **WebSocket** untuk pembaruan data harga tanpa jeda (nol *delay*).
* **Smooth Motion Graphics**: Visualisasi grafik harga interaktif dan dinamis dengan animasi yang mulus saat data berfluktuasi.
* **Smart Alert System**: Sistem notifikasi instan yang akan terpicu secara *real-time* ketika harga aset menyentuh target angka yang ditentukan oleh pengguna.
* **Multi-Asset Support**: Kemudahan dalam memantau berbagai aset kripto dan saham populer dalam satu dasbor terintegrasi.

---

## ⚡ Keunggulan Sistem (Mengapa Svelte?)

Berbeda dengan framework modern lainnya, proyek ini memanfaatkan arsitektur **Svelte** secara maksimal:
* **Tanpa Virtual DOM**: Svelte mengompilasi kode menjadi JavaScript murni yang langsung memanipulasi DOM saat *build time*.
* **Performa Ultra Tinggi**: Mampu melakukan *render ulang* (*re-render*) hingga ribuan data per detik dengan mulus tanpa ada gejala macet (*lag*).
* **Hemat Memori**: Konsumsi memori pada sisi klien (*client-side memory footprint*) yang sangat kecil, menjadikannya ideal untuk aplikasi *data-heavy* seperti dasbor finansial ini.
* **Type Safety**: Dukungan penuh **TypeScript** di seluruh komponen untuk memastikan validitas data finansial yang masuk.

---

## 🛠️ Teknologi yang Digunakan

* **Framework:** SvelteKit / Svelte (TypeScript)
* **Styling:** Tailwind CSS (atau sebutkan framework CSS pilihan Anda)
* **State Management:** Svelte Stores (untuk manajemen data WebSocket global)
* **Charts:** Chart.js / Lightweight Charts (TradingView) / LayerCake
* **Real-time Protocol:** native WebSocket API / Socket.io

---

## 📦 Prasyarat & Instalasi

Pastikan Anda sudah menginstal **Node.js** (versi 18+) di komputer Anda.

1. **Klon repositori ini:**
   ```bash
   git clone [https://github.com/username/crypto-stock-tracker.git](https://github.com/username/crypto-stock-tracker.git)
   cd crypto-stock-tracker
