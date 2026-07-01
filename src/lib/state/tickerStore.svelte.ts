import { browser } from '$app/environment';

export interface ChartBar {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Asset {
  symbol: string;
  name: string;
  type: 'crypto' | 'stock';
  price: number;
  prevClose: number;
  change24h: number; // percentage change
  priceChange: number; // nominal change
  high24h: number;
  low24h: number;
  volume: number;
  history: number[]; // for sparklines
  chartData: ChartBar[];
  lastUpdate: number;
}

export interface Alert {
  id: string;
  symbol: string;
  type: 'above' | 'below';
  targetPrice: number;
  active: boolean;
  createdAt: number;
}

export interface TickerNotification {
  id: string;
  symbol: string;
  type: 'alert' | 'info';
  message: string;
  timestamp: number;
}

// Initial base parameters
const ASSET_METADATA: Record<string, { name: string; type: 'crypto' | 'stock'; basePrice: number }> = {
  // Crypto (Real-time Binance WebSocket)
  'BTCUSDT': { name: 'Bitcoin', type: 'crypto', basePrice: 95000 },
  'ETHUSDT': { name: 'Ethereum', type: 'crypto', basePrice: 2700 },
  'SOLUSDT': { name: 'Solana', type: 'crypto', basePrice: 180 },
  'XRPUSDT': { name: 'Ripple', type: 'crypto', basePrice: 1.15 },
  'ADAUSDT': { name: 'Cardano', type: 'crypto', basePrice: 0.65 },
  // Stocks (High-fidelity Client-Side Sim)
  'AAPL': { name: 'Apple Inc.', type: 'stock', basePrice: 185 },
  'TSLA': { name: 'Tesla Inc.', type: 'stock', basePrice: 175 },
  'MSFT': { name: 'Microsoft Corp.', type: 'stock', basePrice: 425 },
  'AMZN': { name: 'Amazon.com Inc.', type: 'stock', basePrice: 180 },
  'GOOGL': { name: 'Alphabet Inc.', type: 'stock', basePrice: 155 }
};

function generateHistoricalData(basePrice: number, points = 150, intervalSeconds = 60): ChartBar[] {
  const data: ChartBar[] = [];
  let currentPrice = basePrice * (0.95 + Math.random() * 0.1);
  let time = Math.floor(Date.now() / 1000) - points * intervalSeconds;
  
  for (let i = 0; i < points; i++) {
    const volatility = 0.003;
    const change = currentPrice * (Math.random() - 0.49) * volatility;
    const open = currentPrice;
    const close = currentPrice + change;
    const high = Math.max(open, close) + Math.random() * (currentPrice * volatility * 0.5);
    const low = Math.min(open, close) - Math.random() * (currentPrice * volatility * 0.5);
    
    data.push({
      time,
      open,
      high,
      low,
      close
    });
    
    currentPrice = close;
    time += intervalSeconds;
  }
  return data;
}

export class TickerStore {
  // Svelte 5 Runes for reactive states
  assets = $state<Record<string, Asset>>({});
  selectedSymbol = $state<string>('BTCUSDT');
  connectionStatus = $state<'connecting' | 'connected' | 'disconnected'>('disconnected');
  alerts = $state<Alert[]>([]);
  notifications = $state<TickerNotification[]>([]);
  
  // Real-time diagnostics
  ticksProcessed = $state<number>(0);
  tickRate = $state<number>(0);
  latency = $state<number>(0);
  domUpdatesEstimated = $state<number>(0);

  // Private fields for web sockets and calculations
  private ws: WebSocket | null = null;
  private stockInterval: any = null;
  private metricsInterval: any = null;
  private ticksThisSecond = 0;
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.initAssets();
    if (browser) {
      this.loadAlerts();
      this.connectWebSocket();
      this.startStockSimulation();
      this.startMetricsTimer();
    }
  }

  // Pre-populate initial asset values and beautiful history
  private initAssets() {
    const newAssets: Record<string, Asset> = {};
    for (const [symbol, meta] of Object.entries(ASSET_METADATA)) {
      const historyBars = generateHistoricalData(meta.basePrice);
      const prices = historyBars.map(b => b.close);
      const currentPrice = prices[prices.length - 1];
      const prevClose = historyBars[0].open;
      const priceChange = currentPrice - prevClose;
      const change24h = (priceChange / prevClose) * 100;
      
      newAssets[symbol] = {
        symbol,
        name: meta.name,
        type: meta.type,
        price: currentPrice,
        prevClose,
        priceChange,
        change24h,
        high24h: Math.max(...historyBars.map(b => b.high)),
        low24h: Math.min(...historyBars.map(b => b.low)),
        volume: meta.basePrice * 12345 + Math.random() * 5000,
        history: prices.slice(-30), // sparkline history (last 30 ticks)
        chartData: historyBars,
        lastUpdate: Date.now()
      };
    }
    this.assets = newAssets;
  }

  // Selected asset reactive getter
  get selectedAsset(): Asset {
    return this.assets[this.selectedSymbol];
  }

  // Binance WebSocket Integration
  private connectWebSocket() {
    this.connectionStatus = 'connecting';
    
    // Connect to multi-stream for mini tickers: btc, eth, sol, xrp, ada
    const streams = ['btcusdt', 'ethusdt', 'solusdt', 'xrpusdt', 'adausdt'].map(s => `${s}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        this.connectionStatus = 'connected';
        this.addNotification('info', 'SYSTEM', 'Koneksi WebSocket Binance terhubung.');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // mini ticker structure
        const symbol = data.s; // e.g. BTCUSDT
        if (this.assets[symbol]) {
          const price = parseFloat(data.c);
          const changePercent = parseFloat(data.P);
          const priceChange = parseFloat(data.p);
          const high = parseFloat(data.h);
          const low = parseFloat(data.l);
          const volume = parseFloat(data.v);
          const timestamp = data.E; // event time
          
          this.latency = Math.max(0, Date.now() - timestamp);
          this.updateAssetPrice(symbol, price, changePercent, priceChange, high, low, volume);
        }
      };

      this.ws.onerror = (e) => {
        console.error('WebSocket Error:', e);
        this.connectionStatus = 'disconnected';
      };

      this.ws.onclose = () => {
        this.connectionStatus = 'disconnected';
        this.addNotification('info', 'SYSTEM', 'WebSocket terputus. Mencoba menghubungkan kembali dalam 5 detik...');
        setTimeout(() => this.connectWebSocket(), 5000);
      };
    } catch (e) {
      console.error(e);
      this.connectionStatus = 'disconnected';
    }
  }

  // Local Stock Ticks Simulator (Geometric Brownian Motion + Noise)
  private startStockSimulation() {
    // Tick every 800ms to update a random stock
    const stockSymbols = ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL'];
    
    this.stockInterval = setInterval(() => {
      stockSymbols.forEach(symbol => {
        // 60% chance to tick this stock to make it feel organic and asynchronous
        if (Math.random() > 0.4) {
          const asset = this.assets[symbol];
          const prevPrice = asset.price;
          
          // Drift + Volatility random walk
          const drift = 0.00005; // upward bias
          const volatility = 0.0012; // stock movement scale
          const randomFactor = (Math.random() - 0.495); // centered around ~0
          const priceMultiplier = Math.exp(drift + volatility * randomFactor);
          let newPrice = prevPrice * priceMultiplier;
          
          // Round to 2 decimals
          newPrice = Math.round(newPrice * 100) / 100;
          
          // Compute nominal metrics relative to daily close
          const priceChange = newPrice - asset.prevClose;
          const changePercent = (priceChange / asset.prevClose) * 100;
          
          const high = Math.max(asset.high24h, newPrice);
          const low = Math.min(asset.low24h, newPrice);
          const volume = asset.volume + (Math.random() * 50);

          // Simulated network latency
          this.latency = Math.floor(10 + Math.random() * 15);
          
          this.updateAssetPrice(symbol, newPrice, changePercent, priceChange, high, low, volume);
        }
      });
    }, 800);
  }

  // Unified Price Updater
  private updateAssetPrice(
    symbol: string, 
    price: number, 
    change24h: number, 
    priceChange: number,
    high24h: number,
    low24h: number,
    volume: number
  ) {
    const asset = this.assets[symbol];
    if (!asset) return;

    // Update fields
    asset.price = price;
    asset.change24h = change24h;
    asset.priceChange = priceChange;
    asset.high24h = high24h;
    asset.low24h = low24h;
    asset.volume = volume;
    asset.lastUpdate = Date.now();

    // Push to sparkline history
    asset.history.push(price);
    if (asset.history.length > 30) {
      asset.history.shift();
    }

    // Update Main Chart Candlestick Data
    this.updateCandlestick(asset, price);

    // Diagnostics calculations
    this.ticksProcessed++;
    this.ticksThisSecond++;
    
    // Simulate DOM updates based on list sizes
    // Grid items, navigation values, chart updates, alert evaluations, logs
    this.domUpdatesEstimated += 18;

    // Alert Checker
    this.checkAlerts(symbol, price);
  }

  // Real-time Chart Tick Collapsing (updates active minute bar or adds a new one)
  private updateCandlestick(asset: Asset, price: number) {
    const nowSec = Math.floor(Date.now() / 1000);
    const lastBarIndex = asset.chartData.length - 1;
    
    if (lastBarIndex >= 0) {
      const lastBar = asset.chartData[lastBarIndex];
      const barInterval = 60; // 1-minute chart bars
      
      // If current timestamp belongs to the same bar duration, update it
      if (nowSec - lastBar.time < barInterval) {
        lastBar.close = price;
        lastBar.high = Math.max(lastBar.high, price);
        lastBar.low = Math.min(lastBar.low, price);
      } else {
        // Otherwise, add a new bar starting from the last close
        asset.chartData.push({
          time: lastBar.time + barInterval,
          open: lastBar.close,
          high: Math.max(lastBar.close, price),
          low: Math.min(lastBar.close, price),
          close: price
        });
        
        // Cap chart data to last 300 points to save client-side memory
        if (asset.chartData.length > 300) {
          asset.chartData.shift();
        }
      }
    }
  }

  // Active Metrics Calculator
  private startMetricsTimer() {
    this.metricsInterval = setInterval(() => {
      this.tickRate = this.ticksThisSecond;
      this.ticksThisSecond = 0;
    }, 1000);
  }

  // Price Alerts Engine
  addAlert(symbol: string, type: 'above' | 'below', targetPrice: number) {
    const alert: Alert = {
      id: Math.random().toString(36).substring(2, 9),
      symbol,
      type,
      targetPrice,
      active: true,
      createdAt: Date.now()
    };
    
    this.alerts.push(alert);
    this.saveAlerts();
    this.addNotification('info', symbol, `Alarm dipasang: ${type === 'above' ? '≥' : '≤'} ${targetPrice}`);
  }

  removeAlert(id: string) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.saveAlerts();
  }

  private checkAlerts(symbol: string, price: number) {
    this.alerts.forEach(alert => {
      if (alert.symbol === symbol && alert.active) {
        let triggered = false;
        if (alert.type === 'above' && price >= alert.targetPrice) {
          triggered = true;
        } else if (alert.type === 'below' && price <= alert.targetPrice) {
          triggered = true;
        }

        if (triggered) {
          alert.active = false;
          this.triggerAlertActions(alert, price);
          this.saveAlerts();
        }
      }
    });
  }

  private triggerAlertActions(alert: Alert, currentPrice: number) {
    const message = `${alert.symbol} menyentuh target ${alert.type === 'above' ? 'atas' : 'bawah'} di $${alert.targetPrice} (Harga sekarang: $${currentPrice})`;
    this.addNotification('alert', alert.symbol, message);
    this.playAlertSound();
  }

  private playAlertSound() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Play a professional sci-fi double beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      
      osc.start(ctx.currentTime);
      
      // Pitch drop effect
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio autoplay restrictions or not supported
      console.log('Audio alert blocked or unsupported:', e);
    }
  }

  // Notifications manager
  addNotification(type: 'alert' | 'info', symbol: string, message: string) {
    const notif: TickerNotification = {
      id: Math.random().toString(36).substring(2, 9),
      symbol,
      type,
      message,
      timestamp: Date.now()
    };
    this.notifications.unshift(notif);
    
    // Keep max 50 notifications
    if (this.notifications.length > 50) {
      this.notifications.pop();
    }
  }

  clearNotifications() {
    this.notifications = [];
  }

  // LocalStorage Persistence
  private saveAlerts() {
    if (browser) {
      localStorage.setItem('ticker_alerts', JSON.stringify(this.alerts));
    }
  }

  private loadAlerts() {
    if (browser) {
      const saved = localStorage.getItem('ticker_alerts');
      if (saved) {
        try {
          this.alerts = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse alerts from localStorage', e);
        }
      }
    }
  }

  // Clean resources
  destroy() {
    if (this.ws) {
      this.ws.close();
    }
    if (this.stockInterval) {
      clearInterval(this.stockInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }
}

// Global Singleton Export
export const tickerStore = new TickerStore();
