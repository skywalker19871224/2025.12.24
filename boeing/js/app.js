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
        { id: 2, slider: 'slider-eng2', fill: 'fill-eng2', text: 'txt-eng2', arcLength: 157.1 }
    ];

    engines.forEach(eng => {
        const slider = document.getElementById(eng.slider);
        const fill = document.getElementById(eng.fill);
        const text = document.getElementById(eng.text);

        if (!slider || !fill || !text) return;

        const arcLength = eng.arcLength;
        fill.style.strokeDasharray = arcLength;

        const updateGauge = (val) => {
            const percentage = val / 100;
            const offset = arcLength * (1 - percentage);
            fill.style.strokeDashoffset = offset;
            text.textContent = parseFloat(val).toFixed(1);

            // Update rotation for precision pointer (Right engine only)
            if (eng.id === 2) {
                const pointerGroup = document.getElementById('pointer-group-eng2');
                if (pointerGroup) {
                    // Arc is 180 degrees (semi-circle). 0% = -180deg, 100% = 0deg
                    // Start at (20, 50), Center is (70, 50)
                    const angle = -180 + (percentage * 180);
                    pointerGroup.setAttribute('transform', `translate(${70 + 50 * Math.cos(angle * Math.PI / 180)}, ${50 + 50 * Math.sin(angle * Math.PI / 180)}) rotate(${angle + 90})`);
                }
            }
        };

        slider.addEventListener('input', (e) => {
            updateGauge(e.target.value);
        });

        updateGauge(slider.value);

        setInterval(() => {
            if (document.activeElement === slider) return;
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
