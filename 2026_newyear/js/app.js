document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    updateDate();

    // Animate numbers
    animateValue("current-date", 1.01, 1.01, 1000);
});

function updateDate() {
    const now = new Date();
    // In JS 2026-01-01 is roughly now if the local time says so
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    document.getElementById('current-date').textContent = `${month}.${day}`;
}

function initParticles() {
    const container = document.getElementById('particle-container');
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random styles
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        const opacity = Math.random() * 0.5 + 0.2;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${Math.random() > 0.5 ? '#d4af37' : '#fff'};
            left: ${left}%;
            top: -20px;
            opacity: ${opacity};
            border-radius: ${Math.random() > 0.5 ? '0%' : '50%'};
            transform: rotate(${Math.random() * 360}deg);
            animation: fall ${duration}s linear ${delay}s infinite;
            filter: blur(${Math.random() * 1}px);
        `;

        container.appendChild(particle);
    }

    // Inject animation keyframes
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(calc(100vh + 40px)) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

function animateValue(id, start, end, duration) {
    // Basic number animation if we had a count
    // Since current-date is static or date-based, we'll just keep it simple
}
