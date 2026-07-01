<script lang="ts">
  import { tickerStore } from '$lib/state/tickerStore.svelte';

  let { theme, toggleTheme } = $props<{
    theme: 'dark' | 'light';
    toggleTheme: () => void;
  }>();

  // Status mapping for connection lights and text
  const statusConfig = $derived({
    connected: {
      color: 'bg-emerald-500 shadow-[0_0_12px_#10b981]',
      text: 'WebSocket Terhubung',
      textMobile: 'Online'
    },
    connecting: {
      color: 'bg-amber-500 animate-pulse shadow-[0_0_12px_#f59e0b]',
      text: 'Menghubungkan...',
      textMobile: 'Connecting'
    },
    disconnected: {
      color: 'bg-rose-500 animate-pulse shadow-[0_0_12px_#f43f5e]',
      text: 'Terputus',
      textMobile: 'Offline'
    }
  }[tickerStore.connectionStatus]);
</script>

<nav class="sticky top-0 z-40 border-b transition-colors duration-300 backdrop-blur-md
  {theme === 'dark' 
    ? 'bg-slate-950/70 border-slate-800 text-slate-100' 
    : 'bg-white/70 border-slate-200 text-slate-800'}">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Left side: Brand Logo and Title -->
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <span class="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            TICKERSTREAM
          </span>
          <span class="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full border border-slate-700 bg-slate-900 text-slate-400">
            v5.0 Runes
          </span>
        </div>
      </div>

      <!-- Right side: Connection Status, Theme -->
      <div class="flex items-center gap-4">
        <!-- Live WS Status Indicator -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300
          {theme === 'dark' ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'}">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 {statusConfig.color}"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 {statusConfig.color}"></span>
          </span>
          <span class="hidden md:inline text-slate-400">{statusConfig.text}</span>
          <span class="md:hidden text-slate-400">{statusConfig.textMobile}</span>
        </div>

        <!-- Light/Dark Toggle -->
        <button 
          onclick={toggleTheme}
          aria-label="Toggle Theme"
          class="p-2 rounded-xl border transition-all hover:scale-105 duration-200
            {theme === 'dark' 
              ? 'border-slate-800 bg-slate-900/60 text-amber-400 hover:bg-slate-800' 
              : 'border-slate-200 bg-slate-50 text-indigo-600 hover:bg-slate-100'}">
          {#if theme === 'dark'}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </div>
</nav>
