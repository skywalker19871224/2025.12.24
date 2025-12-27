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
        { id: 1, slider: 'slider-eng1', fill: 'fill-eng1', text: 'txt-eng1', arcLength: 188.5 },
        { id: 2, slider: 'slider-eng2', fill: 'fan-fill-eng2', text: 'txt-eng2', needle: 'needle-eng2' }
    ];

    engines.forEach(eng => {
        const slider = document.getElementById(eng.slider);
        // For N2, fill is the fan path relative to center. For N1 it's stroke-dash.
        const fill = document.getElementById(eng.fill);
        const text = document.getElementById(eng.text);
        const needle = eng.needle ? document.getElementById(eng.needle) : null;

        if (!slider || !fill || !text) return;

        // Initialize N1 specific stuff
        let totalPathLength = 0;
        if (eng.id === 1) {
            const arcPath = fill;
            totalPathLength = arcPath.getTotalLength();
            fill.style.strokeDasharray = totalPathLength;
        }

        const updateGauge = (val) => {
            text.textContent = parseFloat(val).toFixed(1);

            if (eng.id === 1) {
                // N1 Logic (Stroke Dashoffset)
                const percentage = val / 100;
                const offset = totalPathLength * (1 - percentage);
                fill.style.strokeDashoffset = offset;
            } else if (eng.id === 2) {
                // N2 Logic (Fan Fill + Needle)
                // Range 0-100 maps to 0-220 degrees (approx)
                // Center 70, 70. Radius 55. Start Angle 0 (3 o'clock).
                const deg = (val / 100) * 220; // 0 to 220
                const rad = deg * (Math.PI / 180);

                // Calculate end point on circle
                // SVG coordinates: y increases downwards. 
                // 3 o'clock is 0 rad. Clockwise is positive angle.
                const cx = 70, cy = 70, r = 55;
                const ex = cx + r * Math.cos(rad);
                const ey = cy + r * Math.sin(rad); // Positive sin goes down (0-90deg), then left... correct

                // Draw Fan Slice
                // M 70 70 L 125 70 A 55 55 0 [large-arc] 1 [ex] [ey] Z
                const largeArcFlag = deg > 180 ? 1 : 0;
                const pathD = `M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 ${largeArcFlag} 1 ${ex} ${ey} Z`;
                fill.setAttribute('d', pathD);

                // Move Needle Line
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
            if (eng.id === 2) return;

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
