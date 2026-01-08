document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const statusMsg = document.getElementById('statusMsg');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const dataInput = document.getElementById('dataInput');
    const dashboard = document.getElementById('dashboard');
    const canvas = document.getElementById('sessionChart');
    let chartInstance = null;

    refreshBtn.addEventListener('click', async () => {
        setLoading(true);
        statusMsg.textContent = 'StripHoursからデータを取得中...';

        try {
            const response = await fetch('/api/sync-external');
            const result = await response.json();

            if (result.success && result.data.session_details) {
                statusMsg.textContent = '同期完了！最新データをロードしました。';
                displaySession(result.data.session_details[0]);
                loadSavedSessions();
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (e) {
            console.error('Fetch error:', e);
            statusMsg.textContent = 'エラー: データの取得に失敗しました。';
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        refreshBtn.disabled = isLoading;
        btnText.classList.toggle('hidden', isLoading);
        spinner.classList.toggle('hidden', !isLoading);
    }

    analyzeBtn.addEventListener('click', () => {
        const rawText = dataInput.value.trim();
        if (!rawText) return;
        processRawData(rawText);
    });

    // ページ読み込み時に保存済みの日付リストを取得
    loadSavedSessions();

    async function processRawData(rawText) {
        try {
            let jsonText = rawText;
            if (rawText.includes('charData =')) {
                jsonText = rawText.split('charData =')[1].split(';')[0].trim();
            }

            const data = JSON.parse(jsonText);

            if (data.session_details && data.session_details.length > 0) {
                // サーバーに同期（保存）
                await syncWithServer(data);

                // 表示
                displaySession(data.session_details[0]);
                loadSavedSessions(); // リストを更新
            }
        } catch (e) {
            console.error('Parsing error:', e);
            alert('データの解析に失敗しました。正しいcharDataの形式か確認してください。');
        }
    }

    async function syncWithServer(data) {
        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log('Synced with server:', result);
        } catch (e) {
            console.error('Sync failed:', e);
        }
    }

    async function loadSavedSessions() {
        try {
            const response = await fetch('/api/sessions');
            const { dates } = await response.json();
            updateSessionListUI(dates);
        } catch (e) {
            console.error('Failed to load sessions:', e);
        }
    }

    function updateSessionListUI(dates) {
        if (!dates || dates.length === 0) return;

        let listContainer = document.getElementById('sessionList');
        if (!listContainer) {
            const header = document.querySelector('.chart-header');
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '10px';

            const label = document.createElement('span');
            label.textContent = 'History:';
            label.style.fontSize = '0.8rem';
            label.style.color = 'var(--text-secondary)';

            listContainer = document.createElement('select');
            listContainer.id = 'sessionList';
            listContainer.className = 'session-select';

            // CSSを直書きしてスタイルを即反映
            listContainer.style.background = 'rgba(255,255,255,0.05)';
            listContainer.style.border = '1px solid var(--glass-border)';
            listContainer.style.color = 'var(--text-primary)';
            listContainer.style.padding = '5px 10px';
            listContainer.style.borderRadius = '8px';
            listContainer.style.outline = 'none';

            wrapper.appendChild(label);
            wrapper.appendChild(listContainer);
            header.appendChild(wrapper);

            listContainer.addEventListener('change', (e) => {
                fetchSessionData(e.target.value);
            });
        }

        listContainer.innerHTML = '<option value="">Load Past Session</option>';
        dates.sort().reverse().forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = date;
            listContainer.appendChild(option);
        });
    }

    async function fetchSessionData(date) {
        if (!date) return;
        try {
            const response = await fetch(`/api/sessions?date=${date}`);
            const session = await response.json();
            displaySession(session);
        } catch (e) {
            console.error('Failed to fetch session data:', e);
        }
    }

    function displaySession(session) {
        const chartData = parseSessionData(session.chart.online_time);
        renderChart(chartData, session.date);
        updateStats(chartData);
        dashboard.classList.remove('hidden');
        dashboard.scrollIntoView({ behavior: 'smooth' });
    }

    function parseSessionData(onlineTimeString) {
        const points = onlineTimeString.trim().split(' ');
        return points.map(p => {
            const parts = p.split('|');
            return {
                time: parts[0],
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
                interaction: { mode: 'index', intersect: false },
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
