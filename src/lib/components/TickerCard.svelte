<script lang="ts">
  import { type Asset, tickerStore } from '$lib/state/tickerStore.svelte';
  
  let { asset, theme, isSelected } = $props<{
    asset: Asset;
    theme: 'dark' | 'light';
    isSelected: boolean;
  }>();

  // Track prices to trigger the flash animations
  const initialPrice = $state.snapshot(asset.price);
  let lastPrice = $state(initialPrice);
  let flashState = $state<'up' | 'down' | 'none'>('none');
  let flashTimer: any = null;

  // React to price change to flash border/text
  $effect(() => {
    const currentPrice = asset.price;
    if (currentPrice !== lastPrice) {
      if (currentPrice > lastPrice) {
        flashState = 'up';
      } else if (currentPrice < lastPrice) {
        flashState = 'down';
      }
      lastPrice = currentPrice;
      
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = setTimeout(() => {
        flashState = 'none';
      }, 400);
    }
    
    return () => {
      if (flashTimer) clearTimeout(flashTimer);
    };
  });

  // Calculate SVG Sparkline Path
  const sparklinePath = $derived.by(() => {
    const history = asset.history;
    if (history.length < 2) return '';
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min === 0 ? 1 : max - min;
    const width = 75;
    const height = 30;
    const padding = 2;
    
    return history.map((val: number, index: number) => {
      const x = (index / (history.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  });

  // Color classes for flash state
  const cardBorderClass = $derived(() => {
    if (flashState === 'up') return 'border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
    if (flashState === 'down') return 'border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.15)]';
    
    if (isSelected) return 'border-indigo-500 shadow-md ring-1 ring-indigo-500/30';
    
    return theme === 'dark' 
      ? 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-850/50' 
      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50';
  });

  const priceColorClass = $derived(() => {
    if (flashState === 'up') return 'text-emerald-500 scale-105';
    if (flashState === 'down') return 'text-rose-500 scale-105';
    return theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  });

  const isPositive = $derived(asset.change24h >= 0);
</script>

<!-- Asset Card Container -->
<button 
  onclick={() => tickerStore.selectedSymbol = asset.symbol}
  class="w-full text-left p-4 rounded-2xl border transition-all duration-300 transform outline-none cursor-pointer flex flex-col justify-between h-[135px] {cardBorderClass()}"
>
  <!-- Card Header -->
  <div class="flex items-center justify-between w-full">
    <div class="flex items-center gap-2">
      <!-- Icon representation -->
      <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-inner
        {asset.type === 'crypto' 
          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
          : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'}">
        {asset.symbol.substring(0, 2)}
      </div>
      <div>
        <h4 class="font-bold text-sm tracking-tight {theme === 'dark' ? 'text-slate-250' : 'text-slate-800'}">{asset.symbol}</h4>
        <p class="text-[10px] text-slate-500 truncate max-w-[90px]">{asset.name}</p>
      </div>
    </div>
    
    <!-- Sparkline mini-chart -->
    <div class="w-[75px] h-[30px] overflow-hidden">
      {#if asset.history.length > 1}
        <svg width="75" height="30" class="overflow-hidden">
          <path 
            d={sparklinePath} 
            fill="none"  
            stroke={isPositive ? '#10b981' : '#f43f5e'} 
            stroke-width="1.8" 
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {/if}
    </div>
  </div>

  <!-- Card Price & Change -->
  <div class="flex items-end justify-between w-full mt-2.5">
    <div class="space-y-0.5">
      <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Harga Live</span>
      <div class="text-xl font-bold transition-all duration-300 font-mono tracking-tight {priceColorClass()}">
        ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
      </div>
    </div>
    
    <!-- Badge Change 24h -->
    <div class="px-2.5 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-0.5 border
      {isPositive 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}">
      <span>{isPositive ? '▲' : '▼'}</span>
      <span>{Math.abs(asset.change24h).toFixed(2)}%</span>
    </div>
  </div>
</button>
