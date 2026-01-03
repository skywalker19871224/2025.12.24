document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
});

function updateClock() {
    const now = new Date();

    // Time Strings
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');

    // Elements
    const clockEl = document.getElementById('digital-clock');
    const dateEl = document.getElementById('date-display');

    if (clockEl) {
        clockEl.innerText = `${h}:${m}:${s}`;
    }

    if (dateEl) {
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const date = now.getDate();
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        const day = dayNames[now.getDay()];

        dateEl.innerText = `${year}/${month}/${date} (${day})`;
    }
}
