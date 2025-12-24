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
        const valueEl = card.querySelector('.value');
        if (!valueEl || card.classList.contains('span-2')) return;
        
        const baseValue = parseFloat(valueEl.textContent.replace(',', ''));
        
        setInterval(() => {
            const variation = (Math.random() - 0.5) * 0.1;
            const newValue = baseValue + variation;
            
            if (baseValue > 1000) {
                valueEl.textContent = Math.round(newValue).toLocaleString();
            } else {
                valueEl.textContent = newValue.toFixed(1);
            }
        }, 2000 + Math.random() * 2000);
    });
}
