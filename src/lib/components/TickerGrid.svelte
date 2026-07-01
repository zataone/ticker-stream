<script lang="ts">
  import { tickerStore } from '$lib/state/tickerStore.svelte';
  import TickerCard from './TickerCard.svelte';

  let { theme } = $props<{ theme: 'dark' | 'light' }>();

  // Filter states
  let activeTab = $state<'all' | 'crypto' | 'stock'>('all');
  let searchQuery = $state('');

  // Derived filtered asset list
  const filteredAssets = $derived(() => {
    let list = Object.values(tickerStore.assets);
    
    if (activeTab !== 'all') {
      list = list.filter(asset => asset.type === activeTab);
    }
    
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(asset => 
        asset.symbol.toLowerCase().includes(q) || 
        asset.name.toLowerCase().includes(q)
      );
    }
    
    return list;
  });
</script>

<div class="space-y-4">
  <!-- Controls: Tabs & Search Filter -->
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 rounded-2xl border
    {theme === 'dark' ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-50 border-slate-200'}">
    <!-- Tabs -->
    <div class="flex p-1 rounded-xl border w-full sm:w-auto
      {theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}">
      {#each ['all', 'crypto', 'stock'] as tab}
        <button
          onclick={() => activeTab = tab as any}
          class="flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer
            {activeTab === tab
              ? 'bg-gradient-to-r from-indigo-600 to-purple-650 text-white shadow-md'
              : 'text-slate-400 hover:text-indigo-400'}"
        >
          {tab === 'stock' ? 'Saham' : tab}
        </button>
      {/each}
    </div>

    <!-- Search Input -->
    <div class="relative w-full sm:w-64">
      <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari aset..."
        class="w-full text-xs pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors
          {theme === 'dark' 
            ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500' 
            : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'}"
      />
    </div>
  </div>

  <!-- Assets Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
    {#each filteredAssets() as asset (asset.symbol)}
      <TickerCard 
        {asset} 
        {theme} 
        isSelected={tickerStore.selectedSymbol === asset.symbol} 
      />
    {:else}
      <div class="col-span-full py-8 text-center border border-dashed rounded-2xl border-slate-800 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2 text-slate-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xs">Tidak ada aset yang ditemukan</p>
      </div>
    {/each}
  </div>
</div>
