<script lang="ts">
  import { tickerStore } from '$lib/state/tickerStore.svelte';

  let { theme } = $props<{ theme: 'dark' | 'light' }>();

  // Format tick numbers nicely
  const totalTicks = $derived(tickerStore.ticksProcessed.toLocaleString());
  const domUpdates = $derived(tickerStore.domUpdatesEstimated.toLocaleString());
</script>

<div class="p-5 rounded-2xl border flex flex-col justify-between h-full
  {theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}">
  
  <div class="space-y-4">
    <div class="flex items-center justify-between border-b pb-3 border-dashed
      {theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}">
      <h3 class="font-bold text-sm uppercase tracking-wider text-indigo-400">Diagnosis Performa Frontend</h3>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase animate-pulse">
        Live
      </span>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3.5">
      <!-- Ticks Processed -->
      <div class="p-3.5 rounded-xl border space-y-1
        {theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}">
        <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total Ticks</span>
        <div class="text-lg font-bold font-mono tracking-tight text-indigo-400">
          {totalTicks}
        </div>
        <p class="text-[9px] text-slate-500 leading-none">Pembaruan data diproses</p>
      </div>

      <!-- Updates Per Second -->
      <div class="p-3.5 rounded-xl border space-y-1
        {theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}">
        <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Tick Rate</span>
        <div class="text-lg font-bold font-mono tracking-tight text-emerald-400">
          {tickerStore.tickRate} <span class="text-[10px] font-normal text-slate-500">t/s</span>
        </div>
        <p class="text-[9px] text-slate-500 leading-none">Frekuensi pembaruan/detik</p>
      </div>

      <!-- Network Latency -->
      <div class="p-3.5 rounded-xl border space-y-1
        {theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}">
        <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Latency Feed</span>
        <div class="text-lg font-bold font-mono tracking-tight text-amber-500">
          {tickerStore.latency} <span class="text-[10px] font-normal text-slate-500">ms</span>
        </div>
        <p class="text-[9px] text-slate-500 leading-none">Tunda terima WebSocket</p>
      </div>

      <!-- DOM Update simulation -->
      <div class="p-3.5 rounded-xl border space-y-1
        {theme === 'dark' ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-150'}">
        <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">DOM Updates</span>
        <div class="text-lg font-bold font-mono tracking-tight text-purple-400">
          {domUpdates}
        </div>
        <p class="text-[9px] text-slate-500 leading-none">Rendering perubahan visual</p>
      </div>
    </div>

    <!-- Optimization info -->
    <div class="p-3 rounded-xl space-y-1.5 border border-dashed text-[10px] leading-relaxed
      {theme === 'dark' ? 'bg-slate-950/20 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-150 text-slate-500'}">
      <div class="font-bold text-slate-300 flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
        </svg>
        Keunggulan Kompilasi Svelte 5:
      </div>
      <p>
        Svelte me-render pembaruan langsung ke simpul DOM secara presisi tanpa membandingkan seluruh pohon Virtual DOM. Ini menghemat siklus CPU client-side secara drastis, menyisakan alokasi daya memori untuk rendering chart interaktif 60 FPS secara konsisten.
      </p>
    </div>
  </div>
</div>
