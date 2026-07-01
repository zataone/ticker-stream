<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tickerStore } from '$lib/state/tickerStore.svelte';

  let { theme } = $props<{ theme: 'dark' | 'light' }>();

  let chartContainer: HTMLDivElement;
  let resizeObserver: ResizeObserver;

  // Non-reactive reference container to store raw lightweight-charts instances.
  // This bypasses Svelte 5's reactivity compiler and prevents wrapping in Proxies,
  // which causes internal method calls to fail on the canvas/WebGL chart logic.
  const chartRef = {
    chart: null as any,
    candlestickSeries: null as any,
    volumeSeries: null as any
  };

  // React to theme changes
  $effect(() => {
    if (chartRef.chart) {
      const isDark = theme === 'dark';
      chartRef.chart.applyOptions({
        layout: {
          background: { color: isDark ? '#0f172a' : '#ffffff' },
          textColor: isDark ? '#94a3b8' : '#64748b'
        },
        grid: {
          vertLines: { color: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f1f5f9' },
          horzLines: { color: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f1f5f9' }
        }
      });
    }
  });

  // Re-run whenever selectedSymbol or assets chartData updates
  $effect(() => {
    const symbol = tickerStore.selectedSymbol;
    const activeAsset = tickerStore.assets[symbol];
    if (activeAsset && chartRef.candlestickSeries && chartRef.volumeSeries) {
      const rawData = $state.snapshot(activeAsset.chartData);
      chartRef.candlestickSeries.setData(rawData);
      
      // Simulating simple volume histogram at the bottom
      const volumeData = rawData.map((bar) => {
        const isUp = bar.close >= bar.open;
        return {
          time: bar.time,
          value: activeAsset.volume * (0.8 + Math.random() * 0.4) * 0.001,
          color: isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'
        };
      });
      chartRef.volumeSeries.setData(volumeData);
    }
  });

  onMount(async () => {
    // Dynamic import to avoid SSR errors during compilation
    const LightweightCharts = await import('lightweight-charts');
    const createChart = LightweightCharts.createChart || (LightweightCharts as any).default?.createChart;
    const CandlestickSeries = LightweightCharts.CandlestickSeries;
    const HistogramSeries = LightweightCharts.HistogramSeries;

    const isDark = theme === 'dark';
    const rect = chartContainer.getBoundingClientRect();
    
    // Create the Chart
    chartRef.chart = createChart(chartContainer, {
      width: rect.width || 600,
      height: rect.height || 350,
      layout: {
        background: { color: isDark ? '#0f172a' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#64748b',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      },
      grid: {
        vertLines: { color: isDark ? '#1e293b' : '#f1f5f9' },
        horzLines: { color: isDark ? '#1e293b' : '#f1f5f9' }
      },
      crosshair: {
        mode: 0 // Normal mode
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.25
        }
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false
      }
    });

    // Add Candlestick series using new unified addSeries API (v5.0.0+)
    chartRef.candlestickSeries = chartRef.chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e'
    });

    // Add Histogram Series for Volume using new unified addSeries API (v5.0.0+)
    chartRef.volumeSeries = chartRef.chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: '', // Overlay over chart
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    });

    // Load initial data
    const activeAsset = tickerStore.assets[tickerStore.selectedSymbol];
    if (activeAsset && chartRef.candlestickSeries && chartRef.volumeSeries) {
      const rawData = $state.snapshot(activeAsset.chartData);
      chartRef.candlestickSeries.setData(rawData);
      
      const volumeData = rawData.map((bar) => {
        const isUp = bar.close >= bar.open;
        return {
          time: bar.time,
          value: activeAsset.volume * (0.8 + Math.random() * 0.4) * 0.001,
          color: isUp ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'
        };
      });
      chartRef.volumeSeries.setData(volumeData);
    }

    // Set Up Resize Observer
    resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartContainer || !chartRef.chart) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chartRef.chart.resize(width, height);
      }
    });
    resizeObserver.observe(chartContainer);
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (chartRef.chart) {
      chartRef.chart.remove();
    }
  });
</script>

<div class="w-full h-full flex flex-col relative">
  <!-- Chart Header Info -->
  <div class="absolute top-4 left-4 z-10 pointer-events-none flex flex-col">
    <div class="flex items-center gap-2">
      <span class="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500 text-white shadow-sm uppercase">
        {tickerStore.selectedAsset?.type}
      </span>
      <span class="text-sm font-bold {theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}">
        {tickerStore.selectedAsset?.name}
      </span>
    </div>
    <div class="text-2xl font-bold font-mono tracking-tight mt-1 {theme === 'dark' ? 'text-white' : 'text-slate-900'}">
      ${tickerStore.selectedAsset?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
    </div>
  </div>

  <!-- Chart Container Element -->
  <div bind:this={chartContainer} class="w-full flex-1 min-h-[320px] overflow-hidden"></div>
</div>
