document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    initInstruments();
});

function updateClock() {
    const now = new Date();
    const timeString = now.toISOString().slice(11, 19);
    const clockEl = document.getElementById('system-time');
    if (clockEl) clockEl.textContent = timeString + ' UTC';
}

function initInstruments() {
    // Simulate slight fluctuations in instruments for "live" feel
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
                // Occasionally change transponder code slightly for effect
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
                valueEl.textContent = newValue.toFixed(title === 'CABIN ENV' ? 1 : 1);
            }

            if (title !== 'COMM / XPDR') baseValue = newValue;
        }, 2000 + Math.random() * 2000);
    });
}
