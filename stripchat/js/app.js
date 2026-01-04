document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const dataInput = document.getElementById('dataInput');
    const dashboard = document.getElementById('dashboard');
    const canvas = document.getElementById('sessionChart');
    let chartInstance = null;

    analyzeBtn.addEventListener('click', () => {
        const rawText = dataInput.value.trim();
        if (!rawText) return;

        try {
            // charData = { ... } の形式からオブジェクト部分を抽出
            let jsonText = rawText;
            if (rawText.includes('charData =')) {
                jsonText = rawText.split('charData =')[1].split(';')[0].trim();
            }

            // 安全なパースを試みる（evalは避け、JSONとして扱えるよう整形）
            // 実際にはJSオブジェクトそのものが貼られる可能性があるため、簡易的な抽出を実施
            const data = JSON.parse(jsonText);

            if (data.session_details && data.session_details.length > 0) {
                // 直近のセッションを可視化
                const session = data.session_details[0];
                const chartData = parseSessionData(session.chart.online_time);

                renderChart(chartData, session.date);
                updateStats(chartData);

                dashboard.classList.remove('hidden');
                dashboard.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (e) {
            console.error('Parsing error:', e);
            alert('データの解析に失敗しました。正しいcharDataの形式か確認してください。');
        }
    });

    function parseSessionData(onlineTimeString) {
        // "1642|_public|6179|0|0|c|515 1645|..." の形式をパース
        const points = onlineTimeString.trim().split(' ');
        return points.map(p => {
            const parts = p.split('|');
            return {
                time: parts[0], // HHMM
                label: `${parts[0].slice(0, 2)}:${parts[0].slice(2, 4)}`,
                type: parts[1],
                viewers: parseInt(parts[2]) || 0,
                rank: parts[4] || 'N/A'
            };
        });
    }

    function renderChart(data, date) {
        if (chartInstance) {
            chartInstance.destroy();
        }

        document.getElementById('sessionDate').textContent = date;

        const ctx = canvas.getContext('2d');

        // データの数に応じてチャートの幅を動的に調整（3分ごとに十分なスペースを確保）
        const minWidth = Math.max(1200, data.length * 40);
        canvas.parentElement.style.width = `${minWidth}px`;

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    label: 'Viewers',
                    data: data.map(d => d.viewers),
                    borderColor: '#00f2ff',
                    backgroundColor: (context) => {
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, 'rgba(0, 242, 255, 0.3)');
                        gradient.addColorStop(1, 'rgba(0, 242, 255, 0)');
                        return gradient;
                    },
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#00f2ff',
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#00f2ff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(20, 20, 20, 0.9)',
                        titleFont: { size: 16, weight: 'bold' },
                        bodyFont: { size: 14 },
                        padding: 12,
                        borderColor: 'rgba(0, 242, 255, 0.3)',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                const d = data[context.dataIndex];
                                return [
                                    `Viewers: ${context.parsed.y.toLocaleString()}`,
                                    `Rank: ${d.rank}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.5)', maxRotation: 0 }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateStats(data) {
        const viewers = data.map(d => d.viewers);
        const max = Math.max(...viewers);
        const avg = Math.round(viewers.reduce((a, b) => a + b, 0) / viewers.length);

        document.getElementById('maxViewers').textContent = max.toLocaleString();
        document.getElementById('avgViewers').textContent = avg.toLocaleString();
        document.getElementById('totalPoints').textContent = data.length;

        const durationMin = data.length * 3;
        const hours = Math.floor(durationMin / 60);
        const mins = durationMin % 60;
        document.getElementById('duration').textContent = `${hours}h ${mins}m`;
    }
});
