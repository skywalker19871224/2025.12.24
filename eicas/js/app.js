document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    initInstruments();
    initEngineControls();
});

function updateClock() {
    const now = new Date();
    const timeString = now.toISOString().slice(11, 19);
    const clockEl = document.getElementById('system-time');
    if (clockEl) clockEl.textContent = timeString + ' UTC';
}

function initEngineControls() {
    const engines = [
        // Engine 1 (Left)
        { id: 1, type: 'n1', slider: 'slider-L-n1', fill: 'fill-L-n1', text: 'txt-L-n1' },
        { id: 2, type: 'n2', slider: 'slider-L-n2', fill: 'fan-fill-L-n2', text: 'txt-L-n2', needle: 'needle-L-n2' },
        // Engine 2 (Right)
        { id: 3, type: 'n1', slider: 'slider-R-n1', fill: 'fill-R-n1', text: 'txt-R-n1' },
        { id: 4, type: 'n2', slider: 'slider-R-n2', fill: 'fan-fill-R-n2', text: 'txt-R-n2', needle: 'needle-R-n2' }
    ];

    engines.forEach(eng => {
        const slider = document.getElementById(eng.slider);
        const fill = document.getElementById(eng.fill);
        const text = document.getElementById(eng.text);
        const needle = eng.needle ? document.getElementById(eng.needle) : null;

        if (!slider || !fill || !text) return;

        // Initialize N1 specific stuff
        let totalPathLength = 0;
        if (eng.type === 'n1') {
            const arcPath = fill;
            totalPathLength = arcPath.getTotalLength();
            fill.style.strokeDasharray = totalPathLength;
        }

        const updateGauge = (val) => {
            text.textContent = parseFloat(val).toFixed(1);

            if (eng.type === 'n1') {
                // N1 Logic (Stroke Dashoffset)
                const percentage = val / 100;
                const offset = totalPathLength * (1 - percentage);
                fill.style.strokeDashoffset = offset;
            } else if (eng.type === 'n2') {
                // N2 Logic (Fan Fill + Needle)
                const deg = (val / 100) * 220;
                const rad = deg * (Math.PI / 180);
                const cx = 70, cy = 70, r = 55;
                const ex = cx + r * Math.cos(rad);
                const ey = cy + r * Math.sin(rad);

                const largeArcFlag = deg > 180 ? 1 : 0;
                const pathD = `M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 ${largeArcFlag} 1 ${ex} ${ey} Z`;
                fill.setAttribute('d', pathD);

                if (needle) {
                    needle.setAttribute('x2', ex);
                    needle.setAttribute('y2', ey);
                }
            }
        };

        slider.addEventListener('input', (e) => {
            updateGauge(e.target.value);
        });

        updateGauge(slider.value);

        setInterval(() => {
            if (document.activeElement === slider) return;
            // Disable jitter for N2 (Permanent Edition)
            if (eng.type === 'n2') return;

            const currentVal = parseFloat(slider.value);
            const jitter = (Math.random() - 0.5) * 0.15;
            const nextVal = Math.min(100, Math.max(0, currentVal + jitter));
            slider.value = nextVal;
            updateGauge(nextVal);
        }, 1500 + Math.random() * 1000);
    });
}

function initInstruments() {
    const cards = document.querySelectorAll('.hud-card');

    cards.forEach(card => {
        const title = card.querySelector('.card-header span')?.textContent;
        const valueEl = card.querySelector('.card-value .value');
        if (!valueEl) return;

        let baseValue = parseFloat(valueEl.textContent.replace(',', ''));
        if (isNaN(baseValue)) return;

        setInterval(() => {
            let variation;
            if (title === 'CABIN ENV') {
                variation = (Math.random() - 0.5) * 0.05;
            } else if (title === 'COMM / XPDR') {
                if (Math.random() > 0.95) {
                    baseValue = 7000 + Math.floor(Math.random() * 5);
                }
                variation = 0;
            } else {
                variation = (Math.random() - 0.5) * 0.1;
            }

            const newValue = baseValue + variation;

            if (title === 'COMM / XPDR') {
                valueEl.textContent = Math.round(newValue);
            } else if (baseValue > 1000) {
                valueEl.textContent = Math.round(newValue).toLocaleString();
            } else {
                valueEl.textContent = newValue.toFixed(1);
            }

            if (title !== 'COMM / XPDR') baseValue = newValue;
        }, 2000 + Math.random() * 2000);
    });
}
