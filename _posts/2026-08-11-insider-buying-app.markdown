---
layout: post
title: "SEC Insider Trades Dashboard"
date: 2026-08-11 22:15:00 +0200
categories: finance
---

<!-- CDN Dependencies -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>

<style>
  /* -------------------------------------------------------------
     1. EXPAND PAGE WIDTH (Overrides Jekyll Theme Constraints)
     ------------------------------------------------------------- */
  .wrapper,
  .page-content,
  .post-content,
  .post,
  main {
    max-width: 1400px !important;
    width: 95% !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  /* -------------------------------------------------------------
     2. DASHBOARD & CONTAINER STYLES
     ------------------------------------------------------------- */
  .insider-dashboard-container {
    background-color: #1e293b;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    color: #f8fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    width: 100%;
  }

  /* Navigation Tabs */
  .dashboard-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 2px solid #334155;
    margin-bottom: 20px;
  }

  .tab-btn {
    padding: 10px 18px;
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
  }

  .tab-btn:hover {
    color: #f8fafc;
  }

  .tab-btn.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }

  /* Control Panels */
  .control-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    margin-bottom: 20px;
    background: #0f172a;
    padding: 12px 16px;
    border-radius: 6px;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .control-group label {
    font-size: 13px;
    color: #94a3b8;
  }

  .control-panel input {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #334155;
    background: #1e293b;
    color: #ffffff;
    font-size: 14px;
  }

  /* Invert date picker calendar icon from black to white */
  .control-panel input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
  }

  .control-panel button {
    padding: 8px 16px;
    border-radius: 6px;
    border: none;
    background: #2563eb;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .control-panel button:hover {
    background: #1d4ed8;
  }

  /* View Containers */
  .view-content {
    display: none;
  }

  .view-content.active {
    display: block;
  }

  /* Table Container */
  .table-responsive {
    overflow-x: auto;
    max-height: 600px;
    border-radius: 6px;
    border: 1px solid #cbd5e1;
  }

  /* -------------------------------------------------------------
     3. UNIFORM WHITE TABLE ROWS
     ------------------------------------------------------------- */
  .trades-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
    background-color: #ffffff !important;
  }

  .trades-table th {
    background-color: #0f172a !important;
    color: #94a3b8 !important;
    padding: 12px;
    font-weight: 600;
    cursor: pointer;
    user-select: none;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 2px solid #334155;
  }

  .trades-table th:hover {
    color: #3b82f6 !important;
  }

  .trades-table tr,
  .trades-table tr:nth-child(even),
  .trades-table tr:nth-child(odd) {
    background-color: #ffffff !important;
    color: #1e293b !important;
  }

  .trades-table td {
    padding: 12px;
    border-bottom: 1px solid #e2e8f0 !important;
    color: #1e293b !important;
  }

  .trades-table tr:hover,
  .trades-table tr:hover td {
    background-color: #f1f5f9 !important;
  }

  .badge-ticker {
    font-weight: 700;
    color: #1d4ed8;
  }

  .sort-icon {
    font-size: 11px;
    margin-left: 4px;
  }

  /* Chart View Styles */
  #tv-chart-viewport {
    width: 100%;
    height: 550px;
    border-radius: 6px;
    overflow: hidden;
  }
</style>

<!-- Main Container -->
<div class="insider-dashboard-container">

  <!-- Navigation Tabs -->
  <div class="dashboard-tabs">
    <button class="tab-btn active" onclick="switchView('table-view', this)">📊 Trades Table</button>
    <button class="tab-btn" onclick="switchView('chart-view', this)">📈 Stock Chart Overlay</button>
  </div>

  <!-- Option 1: Table / Range View -->
  <div id="table-view" class="view-content active">
    <div class="control-panel">
      <div class="control-group">
        <label for="start-date">Start Date:</label>
        <input type="date" id="start-date">
      </div>
      <div class="control-group">
        <label for="end-date">End Date:</label>
        <input type="date" id="end-date">
      </div>
      <button onclick="fetchTableData()">Fetch Trades</button>
    </div>

    <div class="table-responsive">
      <table class="trades-table" id="trades-table">
        <thead>
          <tr>
            <th onclick="sortTable('filingDate')">Filing Date <span class="sort-icon" id="sort-filingDate"></span></th>
            <th onclick="sortTable('transactionDate')">Tx Date <span class="sort-icon" id="sort-transactionDate"></span></th>
            <th onclick="sortTable('issuerTicker')">Ticker <span class="sort-icon" id="sort-issuerTicker"></span></th>
            <th onclick="sortTable('issuerName')">Company <span class="sort-icon" id="sort-issuerName"></span></th>
            <th onclick="sortTable('insiderName')">Insider <span class="sort-icon" id="sort-insiderName"></span></th>
            <th onclick="sortTable('insiderRole')">Role <span class="sort-icon" id="sort-insiderRole"></span></th>
            <th onclick="sortTable('price')">Price <span class="sort-icon" id="sort-price"></span></th>
            <th onclick="sortTable('shares')">Shares Purchased <span class="sort-icon" id="sort-shares"></span></th>
            <th onclick="sortTable('sharesAfter')">Position After <span class="sort-icon" id="sort-sharesAfter"></span></th>
            <th onclick="sortTable('relShares')">Rel Shares (%) <span class="sort-icon" id="sort-relShares"></span></th>
          </tr>
        </thead>
        <tbody id="trades-table-body">
          <tr><td colspan="10" style="text-align: center; color: #94a3b8;">Loading trades...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Option 2: Stock Chart Overlay View -->
  <div id="chart-view" class="view-content">
    <div class="control-panel">
      <div class="control-group">
        <label for="ticker-input">Ticker Symbol:</label>
        <input type="text" id="ticker-input" value="AAPL" placeholder="e.g. AAPL">
      </div>
      <button onclick="loadChartData()">Load Chart</button>
    </div>

    <div id="tv-chart-viewport"></div>
  </div>

</div>

<script>
  // 1. Supabase Initialization
  const SUPABASE_URL = "https://woicdsoekhwgcdtecrux.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_Oj0yjwFXkRL7cON1TMdaaQ_oB5Y_GdU";
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // State Management
  let tableData = [];
  let sortColumn = 'transactionDate';
  let sortAscending = false;
  let chartInitialized = false;
  let chart, candlestickSeries;

  // Set default dates (Today for start & end)
  document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').value = today;
    document.getElementById('end-date').value = today;
    fetchTableData();
  });

  // Tab View Switcher
  function switchView(viewId, element) {
    document.querySelectorAll('.view-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(viewId).classList.add('active');
    element.classList.add('active');

    if (viewId === 'chart-view' && !chartInitialized) {
      initChart();
      loadChartData();
      chartInitialized = true;
    }
  }

  // --- OPTION 1: TABLE VIEW LOGIC ---

  async function fetchTableData() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const tbody = document.getElementById('trades-table-body');

    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: #94a3b8;">Fetching records...</td></tr>`;

    const { data, error } = await supabaseClient
      .from('insider_trades')
      .select('*')
      .gte('transactionDate', startDate)
      .lte('transactionDate', endDate);

    if (error) {
      console.error("Supabase Error:", error);
      tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: #ef4444;">Failed to load data.</td></tr>`;
      return;
    }

    if (!data || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: #94a3b8;">No insider trades registered for this date range.</td></tr>`;
      tableData = [];
      return;
    }

    tableData = data;
    sortTable(sortColumn, false);
  }

  function sortTable(column, toggleDirection = true) {
    if (toggleDirection) {
      if (sortColumn === column) {
        sortAscending = !sortAscending;
      } else {
        sortColumn = column;
        sortAscending = false;
      }
    }

    // Update UI headers
    document.querySelectorAll('.sort-icon').forEach(icon => icon.innerText = '');
    const iconSpan = document.getElementById(`sort-${column}`);
    if (iconSpan) iconSpan.innerText = sortAscending ? '▲' : '▼';

    // Sort Array
    tableData.sort((a, b) => {
      let valA = a[column] ?? '';
      let valB = b[column] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortAscending ? -1 : 1;
      if (valA > valB) return sortAscending ? 1 : -1;
      return 0;
    });

    renderTable();
  }

  function renderTable() {
    const tbody = document.getElementById('trades-table-body');
    tbody.innerHTML = tableData.map(trade => `
      <tr>
        <td>${trade.filingDate || '-'}</td>
        <td>${trade.transactionDate}</td>
        <td><span class="badge-ticker">${trade.issuerTicker}</span></td>
        <td>${trade.issuerName || '-'}</td>
        <td>${trade.insiderName}</td>
        <td>${trade.insiderRole || '-'}</td>
        <td>$${Number(trade.price).toFixed(2)}</td>
        <td>${Number(trade.shares).toLocaleString()}</td>
        <td>${Number(trade.sharesAfter).toLocaleString()}</td>
        <td><strong>${Number(trade.relShares).toFixed(2)}%</strong></td>
      </tr>
    `).join('');
  }

  // --- OPTION 2: CHART OVERLAY LOGIC ---

  function initChart() {
    const chartContainer = document.getElementById('tv-chart-viewport');
    chart = LightweightCharts.createChart(chartContainer, {
      layout: { backgroundColor: '#1e293b', textColor: '#94a3b8' },
      grid: { vertLines: { color: '#334155' }, horzLines: { color: '#334155' } },
      timeScale: { borderColor: '#475569', timeVisible: true }
    });

    candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e', downColor: '#ef4444', borderVisible: false,
      wickUpColor: '#22c55e', wickDownColor: '#ef4444'
    });

    window.addEventListener('resize', () => {
      chart.applyOptions({ width: chartContainer.clientWidth });
    });
  }

  async function loadChartData() {
    const ticker = document.getElementById('ticker-input').value.trim().toUpperCase();
    if (!ticker) return;

    const { data: trades } = await supabaseClient
      .from('insider_trades')
      .select('*')
      .eq('issuerTicker', ticker)
      .order('transactionDate', { ascending: true });

    const priceCandles = await fetchHistoricalPrices(ticker);
    if (priceCandles.length > 0) {
      candlestickSeries.setData(priceCandles);
    }

    if (trades && trades.length > 0) {
      const markers = trades.map(trade => ({
        time: trade.transactionDate,
        position: 'belowBar',
        color: '#3b82f6',
        shape: 'arrowUp',
        text: `${trade.insiderName.split(' ')[0]}: $${trade.price} (${trade.shares.toLocaleString()} sh)`
      })).sort((a, b) => (a.time > b.time ? 1 : -1));

      candlestickSeries.setMarkers(markers);
    } else {
      candlestickSeries.setMarkers([]);
    }
  }

  async function fetchHistoricalPrices(ticker) {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=6m`);
      const json = await res.json();
      const result = json.chart.result[0];
      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];

      return timestamps.map((ts, i) => ({
        time: new Date(ts * 1000).toISOString().split('T')[0],
        open: quote.open[i] || quote.close[i],
        high: quote.high[i] || quote.close[i],
        low: quote.low[i] || quote.close[i],
        close: quote.close[i],
      })).filter(candle => candle.close !== null && candle.close !== undefined);
    } catch (e) {
      console.error("Error fetching prices:", e);
      return [];
    }
  }
</script>