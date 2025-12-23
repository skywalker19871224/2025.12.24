document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initAnimations();
});

function initParticles() {
    const container = document.getElementById('particle-container');
    const particleCount = 50;
    const colors = ['#d4af37', '#ffffff', '#00f5ff'];

    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';

        const size = Math.random() * 4 + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];

        Object.assign(p.style, {
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random(),
            boxShadow: `0 0 ${size * 2}px ${color}`,
            transition: 'transform 10s linear, opacity 2s ease'
        });

        container.appendChild(p);
        animateParticle(p);
    }
}

function animateParticle(p) {
    const duration = 10000 + Math.random() * 20000;
    const xMove = (Math.random() - 0.5) * 200;
    const yMove = (Math.random() - 0.5) * 200;

    p.animate([
        { transform: 'translate(0, 0)', opacity: p.style.opacity },
        { transform: `translate(${xMove}px, ${yMove}px)`, opacity: 0 }
    ], {
        duration: duration,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out'
    });
}

function initAnimations() {
    const cards = document.querySelectorAll('.glass-card, .glass-icon-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * index);
    });
}
