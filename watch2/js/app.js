document.addEventListener('DOMContentLoaded', () => {
    initWatches();
    animate();
});

const watches = [];

function initWatches() {
    const ids = ['watch-1', 'watch-2', 'watch-3'];
    ids.forEach((id, index) => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = generateDeltaSVG(id);
            watches.push({
                id: id,
                clockId: `clock-${index + 1}`,
                hands: {
                    hour: container.querySelector('.hand-h'),
                    minute: container.querySelector('.hand-m'),
                    second: container.querySelector('.hand-s'),
                    fan: container.querySelector('.fan-fill')
                }
            });
        }
    });
}

function generateDeltaSVG(id) {
    const cx = 120, cy = 120, r = 90;
    const amber = '#FFB000';
    const amberBg = 'rgba(255, 176, 0, 0.15)';

    // Marks / Ticks
    let ticks = '';
    for (let i = 0; i < 60; i++) {
        const angle = i * 6;
        const r1 = (i % 5 === 0) ? 85 : 92;
        const r2 = 98;
        const x1 = cx + r1 * Math.cos((angle - 90) * Math.PI / 180);
        const y1 = cy + r1 * Math.sin((angle - 90) * Math.PI / 180);
        const x2 = cx + r2 * Math.cos((angle - 90) * Math.PI / 180);
        const y2 = cy + r2 * Math.sin((angle - 90) * Math.PI / 180);
        ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${amber}" stroke-width="${i % 5 === 0 ? 1.5 : 0.5}" opacity="${i % 5 === 0 ? 0.8 : 0.3}" />`;
    }

    // SVG Content
    return `
        <svg viewBox="0 0 240 240">
            <!-- Background Ring -->
            <circle cx="120" cy="120" r="110" fill="none" stroke="#222" stroke-width="1" />
            <circle cx="120" cy="120" r="114" fill="none" stroke="#333" stroke-width="0.5" />

            <!-- Fan Fill (Analog Seconds area) -->
            <path class="fan-fill" d="M 120 120 L 120 30 A 90 90 0 0 1 120 30 Z" fill="${amberBg}" />
            
            <!-- Ticks -->
            <g>${ticks}</g>

            <!-- Warning Brackets (from Delta No.05) -->
            <path d="M 40 40 L 20 40 L 20 60" fill="none" stroke="${amber}" stroke-width="1.5" opacity="0.5" />
            <path d="M 200 40 L 220 40 L 220 60" fill="none" stroke="${amber}" stroke-width="1.5" opacity="0.5" />
            <path d="M 40 200 L 20 200 L 20 180" fill="none" stroke="${amber}" stroke-width="1.5" opacity="0.5" />
            <path d="M 200 200 L 220 200 L 220 180" fill="none" stroke="${amber}" stroke-width="1.5" opacity="0.5" />
            
            <!-- Vertical Advisory Scales -->
            <line x1="15" y1="80" x2="15" y2="160" stroke="${amber}" stroke-width="0.5" opacity="0.4" />
            <line x1="225" y1="80" x2="225" y2="160" stroke="${amber}" stroke-width="0.5" opacity="0.4" />
            ${[0, 1, 2, 3, 4].map(i => `
                <line x1="15" y1="${80 + i * 20}" x2="22" y2="${80 + i * 20}" stroke="${amber}" stroke-width="0.5" opacity="0.4" />
                <line x1="218" y1="${80 + i * 20}" x2="225" y2="${80 + i * 20}" stroke="${amber}" stroke-width="0.5" opacity="0.4" />
            `).join('')}

            <text x="120" y="210" fill="${amber}" font-family="Orbitron" font-size="7" font-weight="bold" text-anchor="middle" letter-spacing="1" opacity="0.7">SYSTEM ADVISORY</text>

            <!-- Hands -->
            <line class="hand-h" x1="120" y1="120" x2="120" y2="70" stroke="white" stroke-width="4" stroke-linecap="square" />
            <line class="hand-m" x1="120" y1="120" x2="120" y2="40" stroke="white" stroke-width="2" stroke-linecap="square" />
            
            <g class="hand-s">
                <line x1="120" y1="140" x2="120" y2="20" stroke="orange" stroke-width="1.5" />
                <circle cx="120" cy="120" r="4" fill="#050b1a" stroke="white" stroke-width="1" />
            </g>

            <circle cx="120" cy="120" r="2" fill="black" />
        </svg>
    `;
}

function animate() {
    const now = new Date();
    // Use JST Offset +9 to match system feel
    const jst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const h = jst.getUTCHours();
    const m = jst.getUTCMinutes();
    const s = jst.getUTCSeconds();
    const ms = jst.getUTCMilliseconds();

    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    watches.forEach(watch => {
        // Digital Clock Update
        const clockEl = document.getElementById(watch.clockId);
        if (clockEl) clockEl.innerText = timeStr;

        // Analog Hand Rotations
        const h_angle = (h % 12) * 30 + m * 0.5;
        const m_angle = m * 6 + s * 0.1;
        const s_angle = (s + ms / 1000) * 6;

        if (watch.hands.hour) setRotation(watch.hands.hour, h_angle);
        if (watch.hands.minute) setRotation(watch.hands.minute, m_angle);
        if (watch.hands.second) setRotation(watch.hands.second, s_angle);

        // Fan Fill Update (Analog Seconds Area)
        if (watch.hands.fan) {
            const r = 90;
            const endAngle = s_angle - 90;
            const x = 120 + r * Math.cos(endAngle * Math.PI / 180);
            const y = 120 + r * Math.sin(endAngle * Math.PI / 180);
            const largeArcFlag = s_angle > 180 ? 1 : 0;
            watch.hands.fan.setAttribute('d', `M 120 120 L 120 30 A 90 90 0 ${largeArcFlag} 1 ${x} ${y} Z`);
        }
    });

    requestAnimationFrame(animate);
}

function setRotation(el, angle) {
    el.setAttribute('transform', `rotate(${angle}, 120, 120)`);
}
