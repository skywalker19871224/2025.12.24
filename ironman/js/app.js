document.addEventListener('DOMContentLoaded', () => {
    initArcReactor();
    initGaugeFluctuations();
    initGlowEffects();
});

function initArcReactor() {
    const powerValue = document.getElementById('power-value');
    let basePower = 100;

    // Subtle power level fluctuation
    setInterval(() => {
        const fluctuation = (Math.random() - 0.5) * 0.4;
        basePower = Math.min(100, Math.max(99, basePower + fluctuation));
        if (powerValue) powerValue.textContent = basePower.toFixed(1);
    }, 3000);
}

function initGaugeFluctuations() {
    const displays = document.querySelectorAll('.display-val');

    displays.forEach(display => {
        if (display.textContent.includes('MACH')) {
            setInterval(() => {
                const mach = 2.4 + (Math.random() - 0.5) * 0.05;
                display.textContent = `MACH ${mach.toFixed(2)}`;
            }, 4000);
        }

        if (display.classList.contains('big')) {
            setInterval(() => {
                const output = 4.2 + (Math.random() - 0.5) * 0.1;
                display.textContent = output.toFixed(1);
            }, 2500);
        }
    });
}

function initGlowEffects() {
    // Interactive sparks on click/touch
    document.addEventListener('touchstart', (e) => createSpark(e.touches[0].clientX, e.touches[0].clientY));
    document.addEventListener('mousedown', (e) => createSpark(e.clientX, e.clientY));
}

function createSpark(x, y) {
    const spark = document.createElement('div');
    spark.className = 'stark-spark';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;

    // Add temporary style for spark
    Object.assign(spark.style, {
        position: 'fixed',
        width: '4px',
        height: '4px',
        background: '#00D1FF',
        borderRadius: '50%',
        boxShadow: '0 0 10px #00D1FF',
        pointerEvents: 'none',
        zIndex: '1000'
    });

    document.body.appendChild(spark);

    // Simple animation
    const angle = Math.random() * Math.PI * 2;
    const velocity = 2 + Math.random() * 3;
    let opacity = 1;
    let posX = x;
    let posY = y;

    const anim = setInterval(() => {
        posX += Math.cos(angle) * velocity;
        posY += Math.sin(angle) * velocity;
        opacity -= 0.05;

        spark.style.left = `${posX}px`;
        spark.style.top = `${posY}px`;
        spark.style.opacity = opacity;

        if (opacity <= 0) {
            clearInterval(anim);
            spark.remove();
        }
    }, 16);
}
