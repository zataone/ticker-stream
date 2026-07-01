<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { tickerStore } from '$lib/state/tickerStore.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import TickerGrid from '$lib/components/TickerGrid.svelte';
  import TradingChart from '$lib/components/TradingChart.svelte';
  import AlertManager from '$lib/components/AlertManager.svelte';
  import PerformanceStats from '$lib/components/PerformanceStats.svelte';

  // State
  let theme = $state<'dark' | 'light'>('dark');

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  onMount(() => {
    document.documentElement.classList.add('dark'); // default dark class
  });

  onDestroy(() => {
    tickerStore.destroy();
  });

  // Derived dismissible alert toasts
  let activeToasts = $derived(
    tickerStore.notifications
      .filter(n => n.type === 'alert')
      .slice(0, 3) // show maximum 3 active alerts as toasts
  );
</script>

<svelte:head>
  <title>TickerStream | High-Performance Financial Dashboard</title>
  <meta name="description" content="Aplikasi dasbor finansial real-time berkinerja tinggi yang dirancang untuk memantau pergerakan harga saham dan kripto secara langsung dengan Svelte 5 Runes." />
</svelte:head>

<div class="min-h-screen flex flex-col font-sans transition-colors duration-300 pb-12
  {theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}">
  
  <!-- Navigation Header -->
  <Navbar 
    {theme} 
    {toggleTheme} 
  />

  <!-- Main Workspace -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    
    <!-- Hero / Intro Badge -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl border transition-all duration-300
      {theme === 'dark' 
        ? 'bg-gradient-to-r from-indigo-950/20 via-purple-950/10 to-slate-900/30 border-indigo-950/80 shadow-[0_4px_30px_rgba(0,0,0,0.4)]' 
        : 'bg-white border-slate-200 shadow-sm'}">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Live Stream
          </span>
          <span class="text-xs text-slate-400 font-mono">
            Svelte 5 + TypeScript + WebSockets
          </span>
        </div>
        <h1 class="text-xl md:text-2xl font-extrabold tracking-tight {theme === 'dark' ? 'text-white' : 'text-slate-900'}">
          Real-Time Crypto & Stock Tracker Dashboard
        </h1>
        <p class="text-xs text-slate-400 leading-relaxed max-w-2xl">
          Dasbor finansial ultra-responsif memproses data WebSocket pasar kripto secara langsung serta simulasi fluktuasi saham bervolume tinggi dengan rendering DOM minimal tanpa jeda.
        </p>
      </div>
    </div>

    <!-- Ticker Cards Grid -->
    <TickerGrid {theme} />

    <!-- Chart & Analytics Middle Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Chart Column (2/3 width) -->
      <div class="lg:col-span-2 p-5 rounded-3xl border flex flex-col h-[480px] justify-between
        {theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
        <div class="flex items-center justify-between border-b pb-3 border-dashed mb-4
          {theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
            <h3 class="font-bold text-sm uppercase tracking-wider text-indigo-400">Grafik Harga Interaktif (TradingView)</h3>
          </div>
          <span class="text-xs text-slate-500 font-mono">Interval: 1m</span>
        </div>
        
        <!-- Live Chart Container -->
        <div class="flex-1 w-full min-h-0">
          <TradingChart {theme} />
        </div>
      </div>

      <!-- Diagnostics & Log Column (1/3 width) -->
      <div class="lg:col-span-1 flex flex-col gap-6">
        
        <!-- Performance Diagnostics -->
        <PerformanceStats {theme} />

        <!-- Live Event/Notification Logs -->
        <div class="flex-1 p-5 rounded-2xl border flex flex-col h-[200px] justify-between
          {theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}">
          <div class="flex items-center justify-between border-b pb-2.5 border-dashed mb-3
            {theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}">
            <h3 class="font-bold text-sm uppercase tracking-wider text-indigo-400">Event Log Sistem</h3>
            <button 
              onclick={() => tickerStore.clearNotifications()}
              class="text-[10px] text-slate-500 hover:text-rose-500 transition-colors uppercase font-bold cursor-pointer"
            >
              Clear Log
            </button>
          </div>

          <!-- Log Feed -->
          <div class="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[10px]">
            {#each tickerStore.notifications as notif (notif.id)}
              <div 
                transition:slide={{ duration: 150 }}
                class="py-1 px-2 rounded flex items-start gap-1.5 leading-normal
                  {notif.type === 'alert' 
                    ? 'bg-rose-500/10 text-rose-400 border-l-2 border-rose-500' 
                    : 'bg-slate-950/40 text-slate-400'}"
              >
                <span class="text-slate-600 shrink-0 select-none">
                  [{new Date(notif.timestamp).toLocaleTimeString()}]
                </span>
                <span class="font-bold shrink-0 text-indigo-400">
                  {notif.symbol}:
                </span>
                <span class="flex-1 break-words">{notif.message}</span>
              </div>
            {:else}
              <div class="text-center text-slate-600 py-10 italic">
                Menunggu log aktivitas WebSocket & Simulasi...
              </div>
            {/each}
          </div>
        </div>

      </div>
    </div>

    <!-- Alarm Manager -->
    <AlertManager {theme} />

  </main>



  <!-- Floating Toast Notifications (Alert Triggers) -->
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
    {#each activeToasts as toast (toast.id)}
      <div 
        transition:fade={{ duration: 200 }}
        class="pointer-events-auto p-4 rounded-2xl shadow-xl flex items-start gap-3 border border-rose-500/30 bg-slate-900/90 text-slate-100 backdrop-blur-md"
      >
        <!-- Bell Icon -->
        <div class="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-swing" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        
        <!-- Text -->
        <div class="flex-1 space-y-0.5">
          <h4 class="font-bold text-xs text-rose-400 uppercase tracking-wider">Alarm Terpicu!</h4>
          <p class="text-xs text-slate-300 leading-normal">{toast.message}</p>
        </div>

        <!-- Dismiss button -->
        <button 
          onclick={() => tickerStore.removeAlert(toast.id)}
          class="text-slate-500 hover:text-slate-300 cursor-pointer"
          aria-label="Dismiss toast"
        >
          <svg xmlns="http://www.w3.org/2500/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/each}
  </div>

</div>
