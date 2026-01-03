document.addEventListener('DOMContentLoaded', () => {
    initWatches();
    animate();
});

const watches = [];
const DEFAULT_LIMIT = 30 * 60; // 1800 seconds (30 minutes)

function initWatches() {
    const ids = ['watch-1', 'watch-2', 'watch-3'];
    ids.forEach((id, index) => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = generateDeltaSVG(id);

            // Stagger start times for demonstration (optional, but makes them "independent")
            // In a real app, users would click to start.
            const startTime = Date.now();

            watches.push({
                id: id,
                clockId: `clock-${index + 1}`,
                startTime: startTime,
                duration: DEFAULT_LIMIT,
                hands: {
                    hour: container.querySelector('.hand-h'),
                    minute: container.querySelector('.hand-m'),
                    second: container.querySelector('.hand-s'),
                    fan: container.querySelector('.fan-fill')
                }
            });

            // Add click to reset timer
            const card = container.closest('.watch-item');
            if (card) {
                card.addEventListener('click', () => {
                    const w = watches.find(item => item.id === id);
                    if (w) w.startTime = Date.now();
                });
            }
        }
    });
}

function generateDeltaSVG(id) {
    const cx = 120, cy = 120;
    const amber = '#FFB000';
    const amberBg = 'rgba(255, 176, 0, 0.15)';

    let ticks = '';
    for (let i = 0; i < 60; i++) {
        const angle = i * 6;
        const r1 = (i % 5 === 0) ? 85 : 92;
        const r2 = 98;
        const x1 = cx + r1 * Math.cos((angle - 90) * Math.PI / 180);
        const y1 = cy + r1 * Math.sin((angle - 90) * Math.PI / 180);
        const x2 = cx + r2 * Math.cos((angle - 90) * Math.PI / 180);
        const y2 = cy + r2 * Math.sin((angle - 90) * Math.PI / 180);
        ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${amber}" stroke-width="${i % 5 === 0 ? 2.0 : 1.0}" opacity="${i % 5 === 0 ? 0.8 : 0.3}" />`;
    }

    return `
        <svg viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="110" fill="none" stroke="#222" stroke-width="1.5" />
            <circle cx="120" cy="120" r="114" fill="none" stroke="#333" stroke-width="1.0" />

            <!-- Fan Fill (Timer Progress) -->
            <path class="fan-fill" d="M 120 120 L 120 30 A 90 90 0 0 1 120 30 Z" fill="${amberBg}" />
            
            <g>${ticks}</g>

            <!-- Warning Brackets -->
            <path d="M 40 40 L 20 40 L 20 60" fill="none" stroke="${amber}" stroke-width="2.0" opacity="0.3" />
            <path d="M 200 40 L 220 40 L 220 60" fill="none" stroke="${amber}" stroke-width="2.0" opacity="0.3" />
            <path d="M 40 200 L 20 200 L 20 180" fill="none" stroke="${amber}" stroke-width="2.0" opacity="0.3" />
            <path d="M 200 200 L 220 200 L 220 180" fill="none" stroke="${amber}" stroke-width="2.0" opacity="0.3" />
            
            <!-- Vertical Advisory Scales -->
            <line x1="15" y1="80" x2="15" y2="160" stroke="${amber}" stroke-width="1.0" opacity="0.4" />
            <line x1="225" y1="80" x2="225" y2="160" stroke="${amber}" stroke-width="1.0" opacity="0.4" />
            ${[0, 1, 2, 3, 4].map(i => `
                <line x1="15" y1="${80 + i * 20}" x2="22" y2="${80 + i * 20}" stroke="${amber}" stroke-width="1.0" opacity="0.2" />
                <line x1="218" y1="${80 + i * 20}" x2="225" y2="${80 + i * 20}" stroke="${amber}" stroke-width="1.0" opacity="0.2" />
            `).join('')}

            <text x="120" y="210" fill="${amber}" font-family="Orbitron" font-size="7" font-weight="bold" text-anchor="middle" letter-spacing="1" opacity="0.5">TIMER MISSION</text>

            <!-- Hands -->
            <line class="hand-h" x1="120" y1="120" x2="120" y2="70" stroke="white" stroke-width="4.5" stroke-linecap="square" opacity="0.8" />
            <line class="hand-m" x1="120" y1="120" x2="120" y2="40" stroke="white" stroke-width="2.5" stroke-linecap="square" opacity="0.8" />
            
            <g class="hand-s">
                <line x1="120" y1="140" x2="120" y2="20" stroke="orange" stroke-width="2.0" />
                <circle cx="120" cy="120" r="4" fill="#050b1a" stroke="white" stroke-width="1.5" />
            </g>

            <circle cx="120" cy="120" r="2" fill="black" />
        </svg>
    `;
}

function animate() {
    const now = Date.now();

    watches.forEach(watch => {
        const elapsed = (now - watch.startTime) / 1000;
        const remaining = Math.max(0, watch.duration - elapsed);

        // Digital Countdown (MM:SS)
        const mins = Math.floor(remaining / 60);
        const secs = Math.floor(remaining % 60);
        const clockEl = document.getElementById(watch.clockId);
        if (clockEl) {
            clockEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            // Change color when time is low
            if (remaining < 60) clockEl.style.color = '#ff3333';
            else clockEl.style.color = '';
        }

        // Timer Progress Angle (0 to 360)
        // 30 mins = 360 degrees. 
        const progressRatio = Math.min(1, elapsed / watch.duration);
        const progressAngle = progressRatio * 360;

        // Fan Fill Update
        if (watch.hands.fan) {
            const r = 90;
            const endAngle = progressAngle - 90;
            const x = 120 + r * Math.cos(endAngle * Math.PI / 180);
            const y = 120 + r * Math.sin(endAngle * Math.PI / 180);
            const largeArcFlag = progressAngle > 180 ? 1 : 0;

            if (progressAngle >= 359.9) {
                // Completely full circle path
                watch.hands.fan.setAttribute('d', `M 120 120 m -90, 0 a 90,90 0 1,0 180,0 a 90,90 0 1,0 -180,0`);
            } else {
                watch.hands.fan.setAttribute('d', `M 120 120 L 120 30 A 90 90 0 ${largeArcFlag} 1 ${x} ${y} Z`);
            }
        }

        // Hand Rotations (Visual feedback for seconds)
        const s_angle = (elapsed % 60) * 6;
        const m_angle = (elapsed / 60) * 6; // Completes 1 circle in 60 mins
        const h_angle = (elapsed / 3600) * 30; // 1 hour per 30 deg

        if (watch.hands.hour) setRotation(watch.hands.hour, h_angle);
        if (watch.hands.minute) setRotation(watch.hands.minute, m_angle);
        if (watch.hands.second) setRotation(watch.hands.second, s_angle);
    });

    requestAnimationFrame(animate);
}

function setRotation(el, angle) {
    el.setAttribute('transform', `rotate(${angle}, 120, 120)`);
}
