const cryptoSelect = document.getElementById('crypto-select');
const intervalSelect = document.getElementById('interval-select');
const ctx = document.getElementById('candlestickChart').getContext('2d');

let currentSymbol = 'ethusdt';
let currentInterval = '1m';
let chart;
let ws; // WebSocket connection
let historicalData = {};

function initChart() {
    chart = new Chart(ctx, {
        type: 'candlestick', // Ensure you have the financial chart plugin
        data: {
            datasets: [{
                label: currentSymbol,
                data: [],
                borderColor: '#ff6384',
                backgroundColor: '#ff6384',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute'
                    }
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function connectWebSocket(symbol, interval) {
    if (ws) {
        ws.close(); // Close previous connection if it exists
    }

    ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`);

    ws.onmessage = function(event) {
        const message = JSON.parse(event.data);
        const candlestick = message.k;
        if (candlestick.x) { // Only process closed candles
            const dataPoint = {
                x: new Date(candlestick.t), // Open time
                o: parseFloat(candlestick.o), // Open
                h: parseFloat(candlestick.h), // High
                l: parseFloat(candlestick.l), // Low
                c: parseFloat(candlestick.c)  // Close
            };

            if (!historicalData[symbol]) {
                historicalData[symbol] = [];
            }
            historicalData[symbol].push(dataPoint);
            updateChart(symbol);
        }
    };
}

function updateChart(symbol) {
    const data = historicalData[symbol];
    chart.data.datasets[0].data = data;
    chart.update();
}

function switchSymbol() {
    currentSymbol = cryptoSelect.value;
    currentInterval = intervalSelect.value;

    if (!historicalData[currentSymbol]) {
        historicalData[currentSymbol] = [];
    }
    updateChart(currentSymbol);
}

function switchInterval() {
    currentInterval = intervalSelect.value;
    connectWebSocket(currentSymbol, currentInterval);
}

cryptoSelect.addEventListener('change', () => {
    switchSymbol();
});

intervalSelect.addEventListener('change', () => {
    switchInterval();
});

// Initial setup
initChart();
connectWebSocket(currentSymbol, currentInterval);
