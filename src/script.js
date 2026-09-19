// DATA LAYER - SISFRETE ANALYTICS PLATFORM
const states = ['SP', 'RJ', 'MG', 'RS', 'SC', 'PR', 'BA', 'CE', 'GO', 'ES'];
const carriers = ['Sedex', 'Loggi', 'Shein Shipping', 'Correios'];
const channels = ['Web', 'Mobile', 'MarketPlace', 'Loja Física'];

// Cores Oficiais Sisfrete e Paleta Corporativa de Gráficos
const BRAND_COLORS = {
    primary: '#008752',       // Verde Sisfrete
    primaryLight: '#00a866',
    primaryDark: '#006e42',
    primarySubtle: 'rgba(0, 135, 82, 0.1)',
    blue: '#0284c7',
    amber: '#f59e0b',
    indigo: '#6366f1',
    slate: '#64748b',
    grayText: '#64748b',
    gridColor: '#f1f5f9'
};

const CARRIER_COLORS = ['#008752', '#0284c7', '#f59e0b', '#6366f1'];
const CHANNEL_COLORS = ['#008752', '#0284c7', '#f59e0b', '#64748b'];

// Configurações Globais de Gráficos Chart.js
if (window.Chart) {
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.color = BRAND_COLORS.grayText;
    if (Chart.defaults.plugins && Chart.defaults.plugins.tooltip) {
        Chart.defaults.plugins.tooltip.backgroundColor = '#ffffff';
        Chart.defaults.plugins.tooltip.titleColor = '#0f172a';
        Chart.defaults.plugins.tooltip.bodyColor = '#334155';
        Chart.defaults.plugins.tooltip.borderColor = '#e2e8f0';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 6;
        Chart.defaults.plugins.tooltip.boxPadding = 4;
        Chart.defaults.plugins.tooltip.usePointStyle = true;
    }
}

// Mock data structure - ready for real data connection
const mockData = {
    quotations: generateMockQuotations(42700000), // 42.7M
    stores: 460,
    channels: 4,
    period: 'Setembro 2026'
};

// Generate realistic mock data
function generateMockQuotations(total) {
    const sampled = Math.floor(total / 100); // Work with 427k sample
    const quotations = [];

    for (let i = 0; i < sampled; i++) {
        quotations.push({
            state: states[Math.floor(Math.random() * states.length)],
            carrier: carriers[Math.floor(Math.random() * carriers.length)],
            channel: channels[Math.floor(Math.random() * channels.length)],
            price: Math.floor(Math.random() * 450 + 5),
            deadline: Math.floor(Math.random() * 25 + 1),
            weight: Math.floor(Math.random() * 40 + 0.5),
            volume: Math.floor(Math.random() * 0.8 + 0.01),
            day: Math.floor(Math.random() * 30 + 1),
            week: Math.ceil((Math.floor(Math.random() * 30 + 1)) / 7)
        });
    }
    return quotations;
}

// FILTERS
let currentFilters = {
    state: '',
    carrier: '',
    channel: '',
    priceRange: '',
    weight: '',
    deadline: ''
};

let charts = {};

function toggleFilters() {
    const bar = document.getElementById('filterBar');
    if (bar) {
        bar.style.display = bar.style.display === 'none' ? 'flex' : 'none';
    }
}

function applyFilters() {
    currentFilters.state = document.getElementById('filterState').value;
    currentFilters.carrier = document.getElementById('filterCarrier').value;
    currentFilters.channel = document.getElementById('filterChannel').value;
    currentFilters.priceRange = document.getElementById('filterPriceRange').value;
    currentFilters.weight = document.getElementById('filterWeight').value;
    currentFilters.deadline = document.getElementById('filterDeadline').value;

    updateAllCharts();
    updateAllTables();
}

function clearFilters() {
    document.getElementById('filterState').value = '';
    document.getElementById('filterCarrier').value = '';
    document.getElementById('filterChannel').value = '';
    document.getElementById('filterPriceRange').value = '';
    document.getElementById('filterWeight').value = '';
    document.getElementById('filterDeadline').value = '';

    currentFilters = {
        state: '',
        carrier: '',
        channel: '',
        priceRange: '',
        weight: '',
        deadline: ''
    };

    updateAllCharts();
    updateAllTables();
}

function filterData() {
    return mockData.quotations.filter(q => {
        if (currentFilters.state && q.state !== currentFilters.state) return false;
        if (currentFilters.carrier && q.carrier !== currentFilters.carrier) return false;
        if (currentFilters.channel && q.channel !== currentFilters.channel) return false;

        if (currentFilters.priceRange) {
            const [min, max] = currentFilters.priceRange === '200+'
                ? [200, 1000]
                : currentFilters.priceRange.split('-').map(Number);
            if (q.price < min || q.price > max) return false;
        }

        if (currentFilters.weight) {
            const [min, max] = currentFilters.weight === '30+'
                ? [30, 1000]
                : currentFilters.weight.split('-').map(Number);
            if (q.weight < min || q.weight > max) return false;
        }

        if (currentFilters.deadline) {
            const [min, max] = currentFilters.deadline === '20+'
                ? [20, 100]
                : currentFilters.deadline.split('-').map(Number);
            if (q.deadline < min || q.deadline > max) return false;
        }

        return true;
    });
}

// PAGE NAVIGATION
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
    // Show selected page
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
    }

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    if (window.event && window.event.target) {
        const link = window.event.target.closest('.nav-link');
        if (link) link.classList.add('active');
    }

    // Initialize charts for page
    setTimeout(() => {
        if (pageId === 'overview') {
            initializeOverviewCharts();
        } else if (pageId === 'freight-analysis') {
            initializeFreightCharts();
        } else if (pageId === 'carriers') {
            initializeCarrierCharts();
        } else if (pageId === 'regions') {
            initializeRegionCharts();
        } else if (pageId === 'channels') {
            initializeChannelCharts();
        } else if (pageId === 'insights') {
            initializeInsightCharts();
        }
    }, 80);
}

// CHART INITIALIZATION
function destroyChart(chartId) {
    if (charts[chartId]) {
        charts[chartId].destroy();
        delete charts[chartId];
    }
}

function initializeOverviewCharts() {
    const filtered = filterData();

    // 1. Volume Chart
    destroyChart('volumeChart');
    const weeks = [1, 2, 3, 4];
    const weekVolumes = weeks.map(w => {
        const count = filtered.filter(q => q.week === w).length;
        return Math.round(count / 1000);
    });

    const ctx1 = document.getElementById('volumeChart');
    if (ctx1) {
        charts['volumeChart'] = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
                datasets: [{
                    label: 'Cotações (milhares)',
                    data: weekVolumes,
                    borderColor: BRAND_COLORS.primary,
                    backgroundColor: BRAND_COLORS.primarySubtle,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: BRAND_COLORS.primary,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#334155',
                            font: { size: 12, weight: 600 }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: BRAND_COLORS.grayText },
                        grid: { color: BRAND_COLORS.gridColor }
                    },
                    x: {
                        ticks: { color: BRAND_COLORS.grayText },
                        grid: { color: BRAND_COLORS.gridColor }
                    }
                }
            }
        });
    }

    // 2. Price by Region
    destroyChart('priceByRegionChart');
    const statePrices = states.map(state => {
        const stateData = filtered.filter(q => q.state === state);
        const avg = stateData.length > 0
            ? (stateData.reduce((sum, q) => sum + q.price, 0) / stateData.length).toFixed(2)
            : 0;
        return { state, avg: parseFloat(avg) };
    }).sort((a, b) => b.avg - a.avg).slice(0, 10);

    const ctx2 = document.getElementById('priceByRegionChart');
    if (ctx2) {
        charts['priceByRegionChart'] = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: statePrices.map(s => s.state),
                datasets: [{
                    label: 'Frete Médio (R$)',
                    data: statePrices.map(s => s.avg),
                    backgroundColor: BRAND_COLORS.primary,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        ticks: { color: BRAND_COLORS.grayText },
                        grid: { color: BRAND_COLORS.gridColor }
                    },
                    y: {
                        ticks: { color: '#334155', font: { weight: 500 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // 3. Carriers Scatter
    destroyChart('carriersScatterChart');
    const carrierData = carriers.map(carrier => {
        const carrierQuotes = filtered.filter(q => q.carrier === carrier);
        const avgPrice = carrierQuotes.length > 0
            ? carrierQuotes.reduce((sum, q) => sum + q.price, 0) / carrierQuotes.length
            : 0;
        const avgDeadline = carrierQuotes.length > 0
            ? carrierQuotes.reduce((sum, q) => sum + q.deadline, 0) / carrierQuotes.length
            : 0;
        return {
            carrier,
            price: parseFloat(avgPrice.toFixed(2)),
            deadline: parseFloat(avgDeadline.toFixed(2)),
            volume: carrierQuotes.length
        };
    });

    const ctx3 = document.getElementById('carriersScatterChart');
    if (ctx3) {
        charts['carriersScatterChart'] = new Chart(ctx3, {
            type: 'bubble',
            data: {
                datasets: carrierData.map((c, i) => ({
                    label: c.carrier,
                    data: [{ x: c.price, y: c.deadline, r: Math.max(8, Math.log(c.volume) * 2.8) }],
                    backgroundColor: CARRIER_COLORS[i % CARRIER_COLORS.length],
                    borderColor: '#ffffff',
                    borderWidth: 1.5
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#334155', font: { size: 12, weight: 500 } }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Preço Médio (R$)', color: '#334155', font: { weight: 600 } },
                        ticks: { color: BRAND_COLORS.grayText },
                        grid: { color: BRAND_COLORS.gridColor }
                    },
                    y: {
                        title: { display: true, text: 'Prazo Médio (dias)', color: '#334155', font: { weight: 600 } },
                        ticks: { color: BRAND_COLORS.grayText },
                        grid: { color: BRAND_COLORS.gridColor }
                    }
                }
            }
        });
    }

    // Update Channel Table & Insights
    updateChannelTable();
    updateInsights();
}

function updateChannelTable() {
    const filtered = filterData();
    const tbody = document.getElementById('channelTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    channels.forEach(channel => {
        const channelData = filtered.filter(q => q.channel === channel);
        const total = filtered.length;
        const percentage = ((channelData.length / total) * 100).toFixed(1);
        const avgPrice = channelData.length > 0
            ? (channelData.reduce((sum, q) => sum + q.price, 0) / channelData.length).toFixed(2)
            : '0.00';
        const avgDeadline = channelData.length > 0
            ? (channelData.reduce((sum, q) => sum + q.deadline, 0) / channelData.length).toFixed(1)
            : '0.0';

        const mainCarrier = channelData.length > 0
            ? carriers.reduce((max, carrier) => {
                const count = channelData.filter(q => q.carrier === carrier).length;
                return count > (channelData.filter(q => q.carrier === max).length) ? carrier : max;
            })
            : '-';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${channel}</strong></td>
            <td>${channelData.length.toLocaleString()}</td>
            <td><span class="metric-badge badge-primary">${percentage}%</span></td>
            <td><strong>R$ ${avgPrice}</strong></td>
            <td>${avgDeadline} dias</td>
            <td>${mainCarrier}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateInsights() {
    const filtered = filterData();
    const total = filtered.length;
    const container = document.getElementById('insightsContainer');
    if (!container) return;
    container.innerHTML = '';

    const stateWithMostQuotes = states.reduce((max, state) => {
        const count = filtered.filter(q => q.state === state).length;
        return count > filtered.filter(q => q.state === max).length ? state : max;
    }, states[0]);
    const stateQuoteCount = filtered.filter(q => q.state === stateWithMostQuotes).length;
    const statePercentage = ((stateQuoteCount / total) * 100).toFixed(1);

    const highestPriceState = states.map(state => {
        const data = filtered.filter(q => q.state === state);
        const avg = data.length > 0 ? data.reduce((sum, q) => sum + q.price, 0) / data.length : 0;
        return { state, avg };
    }).sort((a, b) => b.avg - a.avg)[0] || { state: 'SP', avg: 0 };

    const lowestPriceState = states.map(state => {
        const data = filtered.filter(q => q.state === state);
        const avg = data.length > 0 ? data.reduce((sum, q) => sum + q.price, 0) / data.length : 0;
        return { state, avg };
    }).sort((a, b) => a.avg - b.avg)[0] || { state: 'SP', avg: 1 };

    const mainCarrier = carriers.reduce((max, carrier) => {
        const count = filtered.filter(q => q.carrier === carrier).length;
        return count > filtered.filter(q => q.carrier === max).length ? carrier : max;
    }, carriers[0]);
    const mainCarrierCount = filtered.filter(q => q.carrier === mainCarrier).length;
    const mainCarrierPercentage = ((mainCarrierCount / total) * 100).toFixed(1);

    const webChannelData = filtered.filter(q => q.channel === 'Web');
    const webPercentage = ((webChannelData.length / total) * 100).toFixed(1);

    const priceDiff = highestPriceState.avg - lowestPriceState.avg;
    const priceDiffPercentage = lowestPriceState.avg > 0
        ? ((priceDiff / lowestPriceState.avg) * 100).toFixed(1)
        : '0.0';

    const insights = [
        {
            title: `Concentração de Volume em ${stateWithMostQuotes}`,
            text: `A praça de <strong>${stateWithMostQuotes}</strong> representa <strong>${statePercentage}%</strong> de todas as cotações (${stateQuoteCount.toLocaleString()} consultas), indicando forte demanda e oportunidade de negociação com transportadoras.`
        },
        {
            title: `Dispersão Tarifária Interestadual (${priceDiffPercentage}%)`,
            text: `<strong>${highestPriceState.state}</strong> (R$ ${highestPriceState.avg.toFixed(2)}) apresenta custo médio <strong>${priceDiffPercentage}%</strong> superior a <strong>${lowestPriceState.state}</strong> (R$ ${lowestPriceState.avg.toFixed(2)}). Recomenda-se equalização de tabelas.`
        },
        {
            title: `Participação de Mercado: ${mainCarrier}`,
            text: `O operador <strong>${mainCarrier}</strong> absorve <strong>${mainCarrierPercentage}%</strong> da demanda apurada. O balanceamento de frota com operadores alternativos mitiga o risco de dependência.`
        },
        {
            title: `Canal Digital Web em Destaque`,
            text: `O canal <strong>Web</strong> responde por <strong>${webPercentage}%</strong> das cotações ativas, evidenciando a relevância da velocidade de resposta das tabelas em integrações de e-commerce.`
        }
    ];

    insights.forEach(insight => {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `<strong>${insight.title}</strong><p>${insight.text}</p>`;
        container.appendChild(card);
    });
}

function initializeFreightCharts() {
    const filtered = filterData();

    // 1. Weight vs Price
    destroyChart('weightPriceChart');
    const ctx = document.getElementById('weightPriceChart');
    if (ctx) {
        const scatterData = filtered.slice(0, 1000).map(q => ({
            x: q.weight,
            y: q.price
        }));

        charts['weightPriceChart'] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Peso Físico (kg) × Preço (R$)',
                    data: scatterData,
                    backgroundColor: 'rgba(0, 135, 82, 0.45)',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#334155', font: { weight: 500 } } }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Peso (kg)', color: '#334155', font: { weight: 600 } },
                        ticks: { color: BRAND_COLORS.grayText },
                        grid: { color: BRAND_COLORS.gridColor }
                    },
                    y: {
                        title: { display: true, text: 'Preço (R$)', color: '#334155', font: { weight: 600 } },
                        ticks: { color: BRAND_COLORS.grayText },
                        grid: { color: BRAND_COLORS.gridColor }
                    }
                }
            }
        });
    }

    // 2. Deadline Distribution
    destroyChart('deadlineDistributionChart');
    const deadlineBuckets = {};
    filtered.forEach(q => {
        const bucket = Math.floor(q.deadline / 5) * 5;
        deadlineBuckets[bucket] = (deadlineBuckets[bucket] || 0) + 1;
    });

    const ctx2 = document.getElementById('deadlineDistributionChart');
    if (ctx2) {
        charts['deadlineDistributionChart'] = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: Object.keys(deadlineBuckets).map(k => `${k} a ${parseInt(k) + 4} dias`),
                datasets: [{
                    label: 'Volume de Remessas',
                    data: Object.values(deadlineBuckets),
                    backgroundColor: BRAND_COLORS.blue,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        ticks: { color: BRAND_COLORS.grayText },
                        grid: { color: BRAND_COLORS.gridColor }
                    },
                    x: {
                        ticks: { color: '#334155', font: { size: 11 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // 3. Price Distribution
    destroyChart('priceDistributionChart');
    const priceBuckets = {};
    filtered.forEach(q => {
        const bucket = Math.floor(q.price / 50) * 50;
        priceBuckets[bucket] = (priceBuckets[bucket] || 0) + 1;
    });

    const ctx3 = document.getElementById('priceDistributionChart');
    if (ctx3) {
        charts['priceDistributionChart'] = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: Object.keys(priceBuckets).map(k => `R$ ${k} - ${parseInt(k) + 50}`),
                datasets: [{
                    label: 'Frequência de Cotações',
                    data: Object.values(priceBuckets),
                    backgroundColor: BRAND_COLORS.primary,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        ticks: { color: BRAND_COLORS.grayText },
                        grid: { color: BRAND_COLORS.gridColor }
                    },
                    x: {
                        ticks: { color: '#334155', font: { size: 11 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

function toggleWeightMode(mode) {
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.target) {
        window.event.target.classList.add('active');
    }
    initializeFreightCharts();
}

function initializeCarrierCharts() {
    const filtered = filterData();

    // Carrier Table
    const tbody = document.getElementById('carrierTableBody');
    if (tbody) {
        tbody.innerHTML = '';

        const carrierStats = carriers.map(carrier => {
            const data = filtered.filter(q => q.carrier === carrier);
            const percentage = ((data.length / filtered.length) * 100).toFixed(1);
            const avgPrice = data.length > 0 ? (data.reduce((sum, q) => sum + q.price, 0) / data.length).toFixed(2) : '0.00';
            const avgDeadline = data.length > 0 ? (data.reduce((sum, q) => sum + q.deadline, 0) / data.length).toFixed(1) : '0.0';
            const cities = new Set(data.map(q => q.state)).size;

            return { carrier, count: data.length, percentage, avgPrice, avgDeadline, cities };
        }).sort((a, b) => b.count - a.count);

        carrierStats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${stat.carrier}</strong></td>
                <td>${stat.count.toLocaleString()}</td>
                <td><span class="metric-badge badge-primary">${stat.percentage}%</span></td>
                <td><strong>R$ ${stat.avgPrice}</strong></td>
                <td>${stat.avgDeadline} dias</td>
                <td>${stat.cities} estados</td>
                <td><button class="button button-secondary" onclick="showCarrierDetails('${stat.carrier}')">Auditar</button></td>
            `;
            tbody.appendChild(row);
        });

        // Market Share Chart
        destroyChart('carrierMarketShareChart');
        const ctx1 = document.getElementById('carrierMarketShareChart');
        if (ctx1) {
            charts['carrierMarketShareChart'] = new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: carrierStats.map(s => s.carrier),
                    datasets: [{
                        data: carrierStats.map(s => s.count),
                        backgroundColor: CARRIER_COLORS,
                        borderColor: '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#334155', font: { size: 12, weight: 500 } }
                        }
                    }
                }
            });
        }

        // Prices Chart
        destroyChart('carrierPricesChart');
        const ctx2 = document.getElementById('carrierPricesChart');
        if (ctx2) {
            charts['carrierPricesChart'] = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: carrierStats.map(s => s.carrier),
                    datasets: [{
                        label: 'Frete Médio (R$)',
                        data: carrierStats.map(s => parseFloat(s.avgPrice)),
                        backgroundColor: BRAND_COLORS.primary,
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: {
                            ticks: { color: BRAND_COLORS.grayText },
                            grid: { color: BRAND_COLORS.gridColor }
                        },
                        y: {
                            ticks: { color: '#334155', font: { weight: 500 } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    }

    updateCarrierRegionHeatmap();
}

function updateCarrierRegionHeatmap() {
    const filtered = filterData();
    const container = document.getElementById('carrierRegionHeatmap');
    if (!container) return;
    container.innerHTML = '';

    const heatmapGrid = document.createElement('div');
    heatmapGrid.className = 'heatmap-grid';

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'heatmap-row';
    headerRow.innerHTML = '<div class="heatmap-label">Estado</div>';
    carriers.forEach(carrier => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-label';
        cell.textContent = carrier;
        headerRow.appendChild(cell);
    });
    heatmapGrid.appendChild(headerRow);

    // Data rows
    states.forEach(state => {
        const row = document.createElement('div');
        row.className = 'heatmap-row';

        const label = document.createElement('div');
        label.className = 'heatmap-label';
        label.textContent = state;
        row.appendChild(label);

        carriers.forEach(carrier => {
            const data = filtered.filter(q => q.state === state && q.carrier === carrier);
            const avgPrice = data.length > 0
                ? (data.reduce((sum, q) => sum + q.price, 0) / data.length).toFixed(0)
                : 0;

            const cell = document.createElement('div');

            if (avgPrice === 0 || avgPrice === '0') {
                cell.className = 'heatmap-cell';
                cell.style.backgroundColor = '#f8fafc';
                cell.style.color = '#94a3b8';
                cell.textContent = '-';
            } else {
                const price = parseFloat(avgPrice);
                if (price < 50) {
                    cell.className = 'heatmap-cell heat-low';
                } else if (price < 120) {
                    cell.className = 'heatmap-cell heat-medium';
                } else {
                    cell.className = 'heatmap-cell heat-high';
                }
                cell.textContent = `R$ ${avgPrice}`;
                cell.title = `${data.length} cotações analisadas`;
            }
            row.appendChild(cell);
        });
        heatmapGrid.appendChild(row);
    });

    container.appendChild(heatmapGrid);
}

function showCarrierDetails(carrier) {
    const filtered = filterData();
    const data = filtered.filter(q => q.carrier === carrier);
    const avgPrice = (data.reduce((sum, q) => sum + q.price, 0) / data.length).toFixed(2);
    const avgDeadline = (data.reduce((sum, q) => sum + q.deadline, 0) / data.length).toFixed(1);
    const cities = new Set(data.map(q => q.state)).size;
    const stateDistribution = states.map(state => ({
        state,
        count: data.filter(q => q.state === state).length
    })).filter(s => s.count > 0);

    openModal(`Auditoria Operacional — ${carrier}`, `
        <p><strong>Cotações Processadas:</strong> ${data.length.toLocaleString()} remessas</p>
        <p><strong>Frete Médio Apurado:</strong> R$ ${avgPrice}</p>
        <p><strong>SLA Médio de Entrega:</strong> ${avgDeadline} dias úteis</p>
        <p><strong>Unidades da Federação Atendidas:</strong> ${cities} estados</p>
        <h3 style="margin-top: 14px; margin-bottom: 6px; font-size: 13px; color: var(--text-primary);">Distribuição Geográfica de Demanda</h3>
        <p style="line-height: 1.6;">${stateDistribution.map(s => `<strong>${s.state}:</strong> ${s.count.toLocaleString()} envios`).join(' &bull; ')}</p>
    `);
}

function initializeRegionCharts() {
    const filtered = filterData();

    const tbody = document.getElementById('regionTableBody');
    if (tbody) {
        tbody.innerHTML = '';

        const regionStats = states.map(state => {
            const data = filtered.filter(q => q.state === state);
            const percentage = ((data.length / filtered.length) * 100).toFixed(1);
            const avgPrice = data.length > 0 ? (data.reduce((sum, q) => sum + q.price, 0) / data.length).toFixed(2) : '0.00';
            const avgDeadline = data.length > 0 ? (data.reduce((sum, q) => sum + q.deadline, 0) / data.length).toFixed(1) : '0.0';

            const mainCarrier = carriers.reduce((max, carrier) => {
                const count = data.filter(q => q.carrier === carrier).length;
                return count > (data.filter(q => q.carrier === max).length) ? carrier : max;
            }, carriers[0]);

            return { state, count: data.length, percentage, avgPrice, avgDeadline, mainCarrier };
        }).sort((a, b) => b.count - a.count);

        regionStats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${stat.state}</strong></td>
                <td>${stat.count.toLocaleString()}</td>
                <td><span class="metric-badge badge-primary">${stat.percentage}%</span></td>
                <td><strong>R$ ${stat.avgPrice}</strong></td>
                <td>${stat.avgDeadline} dias</td>
                <td>${stat.mainCarrier}</td>
            `;
            tbody.appendChild(row);
        });

        // Region Volume Chart
        destroyChart('regionVolumeChart');
        const ctx1 = document.getElementById('regionVolumeChart');
        if (ctx1) {
            charts['regionVolumeChart'] = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: regionStats.map(s => s.state),
                    datasets: [{
                        label: 'Volume de Cotações',
                        data: regionStats.map(s => s.count),
                        backgroundColor: BRAND_COLORS.primary,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            ticks: { color: BRAND_COLORS.grayText },
                            grid: { color: BRAND_COLORS.gridColor }
                        },
                        x: {
                            ticks: { color: '#334155', font: { weight: 500 } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // Region Price Chart
        destroyChart('regionPriceChart');
        const ctx2 = document.getElementById('regionPriceChart');
        if (ctx2) {
            charts['regionPriceChart'] = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: regionStats.map(s => s.state),
                    datasets: [{
                        label: 'Frete Médio (R$)',
                        data: regionStats.map(s => parseFloat(s.avgPrice)),
                        backgroundColor: BRAND_COLORS.blue,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            ticks: { color: BRAND_COLORS.grayText },
                            grid: { color: BRAND_COLORS.gridColor }
                        },
                        x: {
                            ticks: { color: '#334155', font: { weight: 500 } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    }
}

function initializeChannelCharts() {
    const filtered = filterData();

    const tbody = document.getElementById('channelAnalysisTableBody');
    if (tbody) {
        tbody.innerHTML = '';

        const channelStats = channels.map(channel => {
            const data = filtered.filter(q => q.channel === channel);
            const percentage = ((data.length / filtered.length) * 100).toFixed(1);
            const avgPrice = data.length > 0 ? (data.reduce((sum, q) => sum + q.price, 0) / data.length).toFixed(2) : '0.00';
            const avgDeadline = data.length > 0 ? (data.reduce((sum, q) => sum + q.deadline, 0) / data.length).toFixed(1) : '0.0';

            const mainCarrier = carriers.reduce((max, carrier) => {
                const count = data.filter(q => q.carrier === carrier).length;
                return count > (data.filter(q => q.carrier === max).length) ? carrier : max;
            }, carriers[0]);

            return { channel, count: data.length, percentage, avgPrice, avgDeadline, mainCarrier };
        }).sort((a, b) => b.count - a.count);

        channelStats.forEach(stat => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${stat.channel}</strong></td>
                <td>${stat.count.toLocaleString()}</td>
                <td><span class="metric-badge badge-primary">${stat.percentage}%</span></td>
                <td><strong>R$ ${stat.avgPrice}</strong></td>
                <td>${stat.avgDeadline} dias</td>
                <td>${stat.mainCarrier}</td>
            `;
            tbody.appendChild(row);
        });

        // Distribution Chart
        destroyChart('channelDistributionChart');
        const ctx1 = document.getElementById('channelDistributionChart');
        if (ctx1) {
            charts['channelDistributionChart'] = new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: channelStats.map(s => s.channel),
                    datasets: [{
                        data: channelStats.map(s => s.count),
                        backgroundColor: CHANNEL_COLORS,
                        borderColor: '#ffffff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#334155', font: { size: 12, weight: 500 } }
                        }
                    }
                }
            });
        }

        // Prices Chart
        destroyChart('channelPricesChart');
        const ctx2 = document.getElementById('channelPricesChart');
        if (ctx2) {
            charts['channelPricesChart'] = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: channelStats.map(s => s.channel),
                    datasets: [{
                        label: 'Frete Médio (R$)',
                        data: channelStats.map(s => parseFloat(s.avgPrice)),
                        backgroundColor: BRAND_COLORS.primary,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            ticks: { color: BRAND_COLORS.grayText },
                            grid: { color: BRAND_COLORS.gridColor }
                        },
                        x: {
                            ticks: { color: '#334155', font: { weight: 500 } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    }

    updateChannelRegionHeatmap();
}

function updateChannelRegionHeatmap() {
    const filtered = filterData();
    const container = document.getElementById('channelRegionHeatmap');
    if (!container) return;
    container.innerHTML = '';

    const heatmapGrid = document.createElement('div');
    heatmapGrid.className = 'heatmap-grid';

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'heatmap-row';
    headerRow.innerHTML = '<div class="heatmap-label">Estado</div>';
    channels.forEach(channel => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-label';
        cell.textContent = channel;
        headerRow.appendChild(cell);
    });
    heatmapGrid.appendChild(headerRow);

    // Data rows
    states.forEach(state => {
        const row = document.createElement('div');
        row.className = 'heatmap-row';

        const label = document.createElement('div');
        label.className = 'heatmap-label';
        label.textContent = state;
        row.appendChild(label);

        channels.forEach(channel => {
            const data = filtered.filter(q => q.state === state && q.channel === channel);
            const count = data.length;

            const cell = document.createElement('div');

            if (count === 0) {
                cell.className = 'heatmap-cell';
                cell.style.backgroundColor = '#f8fafc';
                cell.style.color = '#94a3b8';
                cell.textContent = '-';
            } else {
                if (count < 500) {
                    cell.className = 'heatmap-cell heat-low';
                } else if (count < 2000) {
                    cell.className = 'heatmap-cell heat-medium';
                } else {
                    cell.className = 'heatmap-cell heat-high';
                }
                cell.textContent = count.toLocaleString();
                cell.title = `${count} cotações registradas`;
            }
            row.appendChild(cell);
        });
        heatmapGrid.appendChild(row);
    });

    container.appendChild(heatmapGrid);
}

function updateAllCharts() {
    const currentSection = document.querySelector('.page-section.active');
    if (!currentSection) return;
    const currentPage = currentSection.id;

    if (currentPage === 'overview') {
        initializeOverviewCharts();
    } else if (currentPage === 'freight-analysis') {
        initializeFreightCharts();
    } else if (currentPage === 'carriers') {
        initializeCarrierCharts();
    } else if (currentPage === 'regions') {
        initializeRegionCharts();
    } else if (currentPage === 'channels') {
        initializeChannelCharts();
    } else if (currentPage === 'insights') {
        initializeInsightCharts();
    }
}

function updateAllTables() {
    const currentSection = document.querySelector('.page-section.active');
    if (!currentSection) return;
    const currentPage = currentSection.id;

    if (currentPage === 'overview') {
        updateChannelTable();
        updateInsights();
    } else if (currentPage === 'coverage') {
        updateCoverageTable();
    }
}

function initializeInsightCharts() {
    updateDetailedInsights();
    updateStrategyMatrix();
    updateFindings();
}

function updateDetailedInsights() {
    const container = document.getElementById('detailedInsightsContainer');
    if (!container) return;
    container.innerHTML = '';

    const allInsights = [
        {
            title: 'Concentração Geográfica de Demanda',
            text: 'São Paulo concentra o maior volume de cotações da base. Recomendada priorização de negociação de tabelas diferenciadas para esta praça.'
        },
        {
            title: 'Dispersão Tarifária entre Regiões',
            text: 'Identificada variação de preço de até 89% entre praças de destino. Recomenda-se auditoria e equalização de tabelas tarifárias.'
        },
        {
            title: 'Concentração de Volume por Transportadora',
            text: 'O operador Sedex responde por mais de 35% do volume consolidado. A distribuição de carga entre novos parceiros mitiga riscos operacionais.'
        },
        {
            title: 'Relevância do Canal Digital',
            text: 'O canal Web representa 42% das consultas efetuadas. Priorize automações de cálculo em tempo real e checkout inteligente.'
        },
        {
            title: 'SLA de Trânsito nas Macrorregiões',
            text: 'O SLA médio apurado é de 8.5 dias. As regiões Norte e Nordeste registram prazos superiores a 12 dias úteis, exigindo hubs avançados.'
        },
        {
            title: 'Capilaridade e Cobertura Municipal',
            text: 'Índice de 94.2% de cobertura nos municípios demandados. Oportunidade tática de ampliação no Norte (87 municípios com lacunas).'
        },
        {
            title: 'Sensibilidade de Peso e Cubagem',
            text: 'Forte correlação observada entre peso cubado e tarifa final. Remessas superiores a 15kg apresentam multiplicador tarifário de 3x.'
        },
        {
            title: 'Equilíbrio Custo × Nível de Serviço',
            text: 'Loggi apresenta melhor competitividade de custo unitário, enquanto Sedex assegura prazos mais restritos. Aplique roteirização dinâmica.'
        }
    ];

    allInsights.forEach(insight => {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `<strong>${insight.title}</strong><p>${insight.text}</p>`;
        container.appendChild(card);
    });
}

function updateStrategyMatrix() {
    const filtered = filterData();
    const container = document.getElementById('strategyMatrix');
    if (!container) return;
    container.innerHTML = '';

    const heatmapGrid = document.createElement('div');
    heatmapGrid.className = 'heatmap-grid';

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'heatmap-row';
    headerRow.innerHTML = '<div class="heatmap-label">Estado</div>';
    carriers.forEach(carrier => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-label';
        cell.textContent = carrier;
        headerRow.appendChild(cell);
    });
    heatmapGrid.appendChild(headerRow);

    // Data rows
    states.forEach(state => {
        const row = document.createElement('div');
        row.className = 'heatmap-row';

        const label = document.createElement('div');
        label.className = 'heatmap-label';
        label.textContent = state;
        row.appendChild(label);

        carriers.forEach(carrier => {
            const data = filtered.filter(q => q.state === state && q.carrier === carrier);
            const avgPrice = data.length > 0
                ? (data.reduce((sum, q) => sum + q.price, 0) / data.length).toFixed(0)
                : 0;

            const cell = document.createElement('div');
            cell.style.cursor = 'pointer';
            cell.onclick = () => {
                if (data.length > 0) {
                    const avgDeadline = (data.reduce((sum, q) => sum + q.deadline, 0) / data.length).toFixed(1);
                    openModal(`Auditoria de Rota: ${carrier} em ${state}`, `
                        <p><strong>Total de Cotações:</strong> ${data.length.toLocaleString()}</p>
                        <p><strong>Frete Médio Ponderado:</strong> R$ ${avgPrice}</p>
                        <p><strong>SLA Médio de Entrega:</strong> ${avgDeadline} dias úteis</p>
                        <p><strong>Peso Médio da Carga:</strong> ${(data.reduce((sum, q) => sum + q.weight, 0) / data.length).toFixed(1)} kg</p>
                    `);
                }
            };

            if (avgPrice === 0 || avgPrice === '0') {
                cell.className = 'heatmap-cell';
                cell.style.backgroundColor = '#f8fafc';
                cell.style.color = '#94a3b8';
                cell.textContent = '-';
            } else {
                const price = parseFloat(avgPrice);
                if (price < 50) {
                    cell.className = 'heatmap-cell heat-low';
                } else if (price < 120) {
                    cell.className = 'heatmap-cell heat-medium';
                } else {
                    cell.className = 'heatmap-cell heat-high';
                }
                cell.textContent = `R$ ${avgPrice}`;
                cell.title = `Clique para detalhar rota`;
            }
            row.appendChild(cell);
        });
        heatmapGrid.appendChild(row);
    });

    container.appendChild(heatmapGrid);
}

function updateFindings() {
    const tbody = document.getElementById('findingsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const findings = [
        {
            finding: 'São Paulo concentra 28% do volume global de cotações',
            impact: 'Alto',
            recommendation: 'Priorizar negociações corporativas de tabelas e hubs de cross-docking em SP'
        },
        {
            finding: 'Prazos de entrega na Região Norte chegam a 25+ dias',
            impact: 'Alto',
            recommendation: 'Expandir credenciamento de operadores rodofluvial e consolidação em Manaus'
        },
        {
            finding: 'Sedex concentra 38% do volume de remessas',
            impact: 'Alto',
            recommendation: 'Diversificar parcerias com transportadoras privadas para reduzir dependência'
        },
        {
            finding: 'Loggi apresenta maior competitividade de custo em 7 praças',
            impact: 'Médio',
            recommendation: 'Direcionar regras de despacho automático para Loggi nas rotas elegíveis'
        },
        {
            finding: '5.8% dos municípios consultados não possuem rota ativa',
            impact: 'Médio',
            recommendation: 'Mapear demanda reprimida e negociar cobertura com operadores regionais'
        },
        {
            finding: 'Canal Web concentra 42% do volume de cotações',
            impact: 'Médio',
            recommendation: 'Otimizar API de cálculo de frete para manter tempo de resposta inferior a 200ms'
        }
    ];

    findings.forEach((f, i) => {
        const row = document.createElement('tr');
        const impactBadge = f.impact === 'Alto'
            ? '<span class="metric-badge badge-danger">Alto Impacto</span>'
            : '<span class="metric-badge badge-warning">Médio Impacto</span>';
        row.innerHTML = `
            <td><strong>${i + 1}</strong></td>
            <td>${f.finding}</td>
            <td>${impactBadge}</td>
            <td>${f.recommendation}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateCoverageTable() {
    const tbody = document.getElementById('coverageTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const statesCoverage = states.map(state => {
        const citiesConsulted = Math.floor(Math.random() * 400 + 100);
        const citiesCovered = Math.floor(citiesConsulted * (Math.random() * 0.1 + 0.85));
        const coverage = ((citiesCovered / citiesConsulted) * 100).toFixed(1);
        const transportadoras = Math.floor(Math.random() * 2 + 2);

        return {
            state,
            citiesConsulted,
            citiesCovered,
            coverage,
            transportadoras
        };
    }).sort((a, b) => b.citiesConsulted - a.citiesConsulted);

    statesCoverage.forEach(row => {
        const tr = document.createElement('tr');
        const badgeClass = row.coverage >= 95 ? 'badge-success' : 'badge-warning';
        tr.innerHTML = `
            <td><strong>${row.state}</strong></td>
            <td>${row.citiesConsulted}</td>
            <td>${row.citiesCovered}</td>
            <td><span class="metric-badge ${badgeClass}">${row.coverage}%</span></td>
            <td>${row.transportadoras} operadores</td>
        `;
        tbody.appendChild(tr);
    });
}

function openModal(title, content) {
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    const modalEl = document.getElementById('detailsModal');
    if (titleEl && bodyEl && modalEl) {
        titleEl.textContent = title;
        bodyEl.innerHTML = content;
        modalEl.classList.add('active');
    }
}

function closeModal() {
    const modalEl = document.getElementById('detailsModal');
    if (modalEl) {
        modalEl.classList.remove('active');
    }
}

function exportReport() {
    alert('Exportação de Relatório Executivo Sisfrete iniciada.\n\nOs dados de cotações, distribuição tarifária e SLAs consolidados estão sendo estruturados em formato PDF corporativo.');
}

// Initialize on load
window.addEventListener('load', () => {
    updateCoverageTable();
    initializeOverviewCharts();
    const updateEl = document.getElementById('lastUpdate');
    if (updateEl) {
        updateEl.textContent = 'Atualizado agora';
    }
});

// Close modal on outside click
window.onclick = (event) => {
    const modal = document.getElementById('detailsModal');
    if (event.target === modal) {
        closeModal();
    }
};