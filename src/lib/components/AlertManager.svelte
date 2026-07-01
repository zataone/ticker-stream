<script lang="ts">
  import { tickerStore } from '$lib/state/tickerStore.svelte';

  let { theme } = $props<{ theme: 'dark' | 'light' }>();

  // Form values
  let selectedSymbol = $state('BTCUSDT');
  let alertType = $state<'above' | 'below'>('above');
  let targetPrice = $state<number>(0);

  // Sync default target price when selecting asset
  $effect(() => {
    const asset = tickerStore.assets[selectedSymbol];
    if (asset) {
      targetPrice = Math.round(asset.price * 100) / 100;
    }
  });

  function handleCreateAlert(e: Event) {
    e.preventDefault();
    if (targetPrice <= 0) return;
    
    tickerStore.addAlert(selectedSymbol, alertType, targetPrice);
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-5">
  <!-- Create Alert Card -->
  <div class="md:col-span-1 p-5 rounded-2xl border flex flex-col justify-between
    {theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}">
    <div class="space-y-4">
      <h3 class="font-bold text-sm uppercase tracking-wider text-indigo-400">Pasang Alarm Harga</h3>
      
      <form onsubmit={handleCreateAlert} class="space-y-3.5">
        <!-- Asset Selector -->
        <div>
          <label for="alert-symbol" class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Aset</label>
          <select
            id="alert-symbol"
            bind:value={selectedSymbol}
            class="w-full text-xs p-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500
              {theme === 'dark' 
                ? 'bg-slate-950 border-slate-850 text-slate-100' 
                : 'bg-white border-slate-200 text-slate-800'}"
          >
            {#each Object.keys(tickerStore.assets) as symbol}
              <option value={symbol}>{symbol} ({tickerStore.assets[symbol].name})</option>
            {/each}
          </select>
        </div>

        <!-- Condition Selector -->
        <div>
          <span class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Kondisi</span>
          <div class="grid grid-cols-2 gap-2 p-1 rounded-xl border
            {theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}">
            <button
              type="button"
              onclick={() => alertType = 'above'}
              class="py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                {alertType === 'above'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'}"
            >
              Naik ke / Di Atas (≥)
            </button>
            <button
              type="button"
              onclick={() => alertType = 'below'}
              class="py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                {alertType === 'below'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'}"
            >
              Turun ke / Di Bawah (≤)
            </button>
          </div>
        </div>

        <!-- Target Price Input -->
        <div>
          <label for="alert-target" class="block text-[10px] font-bold uppercase text-slate-500 mb-1">Harga Target ($)</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400 font-bold">$</span>
            <input
              id="alert-target"
              type="number"
              step="any"
              required
              bind:value={targetPrice}
              class="w-full text-xs pl-7 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono
                {theme === 'dark' 
                  ? 'bg-slate-950 border-slate-850 text-slate-100' 
                  : 'bg-white border-slate-200 text-slate-800'}"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/15"
        >
          Aktifkan Alarm
        </button>
      </form>
    </div>

    <!-- Alarm sound tip -->
    <div class="mt-4 p-3 rounded-xl flex items-start gap-2 border border-dashed text-[10px] leading-relaxed
      {theme === 'dark' ? 'bg-slate-950/40 border-slate-850 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
      <span>Pemicu alarm akan memutar efek suara profesional menggunakan API Web Audio sintesis.</span>
    </div>
  </div>

  <!-- Alerts List Column -->
  <div class="md:col-span-2 p-5 rounded-2xl border flex flex-col
    {theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}">
    <h3 class="font-bold text-sm uppercase tracking-wider text-indigo-400 mb-4">Daftar Alarm Aktif</h3>

    <div class="flex-1 overflow-y-auto max-h-[295px] pr-1 space-y-2">
      {#each tickerStore.alerts as alert (alert.id)}
        <div class="flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200
          {theme === 'dark' 
            ? 'bg-slate-950/40 border-slate-850 hover:bg-slate-950/60' 
            : 'bg-slate-50 border-slate-150 hover:bg-slate-100/50'}">
          <div class="flex items-center gap-3">
            <!-- Alert Badge -->
            <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs
              {alert.type === 'above'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
              {alert.type === 'above' ? '≥' : '≤'}
            </div>
            
            <div class="space-y-0.5">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-sm">{alert.symbol}</span>
                <span class="text-[10px] text-slate-500">
                  {tickerStore.assets[alert.symbol]?.name}
                </span>
              </div>
              <p class="text-xs text-slate-400">
                Picu ketika harga {alert.type === 'above' ? 'naik ke atas' : 'turun ke bawah'} 
                <span class="font-mono font-bold text-slate-300">${alert.targetPrice}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 uppercase font-bold animate-pulse">
              Monitoring
            </span>
            
            <!-- Remove Alert Button -->
            <button
              onclick={() => tickerStore.removeAlert(alert.id)}
              class="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
              aria-label="Hapus alarm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center h-44 text-center border border-dashed rounded-xl border-slate-800 text-slate-500 space-y-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div class="text-xs">
            <p class="font-bold">Tidak ada alarm aktif</p>
            <p class="text-[10px] text-slate-500 mt-0.5">Pasang alarm di sebelah kiri untuk memonitor target pergerakan pasar.</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
