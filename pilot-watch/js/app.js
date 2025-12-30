document.addEventListener('DOMContentLoaded', () => {
    initWatches();
    requestAnimationFrame(animate);
});

const watchData = [];

function initWatches() {
    const containers = document.querySelectorAll('.watch-face');
    containers.forEach((container, index) => {
        const type = container.parentElement.dataset.type;
        const id = container.id;

        container.innerHTML = generateSVG(type, id);

        watchData.push({
            id: id,
            type: type,
            hands: {
                hour: container.querySelector('.hand-h'),
                minute: container.querySelector('.hand-m'),
                second: container.querySelector('.hand-s'),
                second: container.querySelector('.hand-s'),
                sub1: container.querySelector('.hand-sub1'), // Minutes (Top)
                sub2: container.querySelector('.hand-sub2'), // Hours (Bottom)
                sub3: container.querySelector('.hand-sub3'), // Small Sec (Left)
                sub4: container.querySelector('.hand-sub4'), // Power (Right)
                fan: container.querySelector('.fan-fill'),
                digitalSec: container.querySelector('.digital-seconds')
            }
        });
    });
}

function generateSVG(type, id) {
    const cx = 120, cy = 120;
    let extra = '';

    // Generic Ticks (default)
    let ticks = '';
    // Skip default ticks for some faces
    if (type !== 'cvstos' && type !== 'chrono_pro') {
        for (let i = 0; i < 60; i++) {
            const angle = i * 6;
            const r1 = (i % 5 === 0) ? 95 : 100;
            const r2 = 105;
            const x1 = cx + r1 * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = cy + r1 * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = cx + r2 * Math.cos((angle - 90) * Math.PI / 180);
            const y2 = cy + r2 * Math.sin((angle - 90) * Math.PI / 180);
            const color = (i % 5 === 0) ? 'rgba(0,242,255,0.6)' : 'rgba(255,255,255,0.2)';
            ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${(i % 5 === 0) ? 2 : 1}" />`;
        }
    }

    // Numbers for some faces
    let numbers = '';
    if (type === 'classic' || type === 'navigator' || type === 'utc' || type === 'chrono_pro') {
        const font = type === 'utc' ? 'Rajdhani' : 'Orbitron';
        [12, 3, 6, 9].forEach(n => {
            const angle = n * 30;
            const r = 80;
            const x = cx + r * Math.cos((angle - 90) * Math.PI / 180);
            const y = cy + r * Math.sin((angle - 90) * Math.PI / 180);
            numbers += `<text x="${x}" y="${y}" fill="rgba(255,255,255,0.8)" font-family="${font}" font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${n}</text>`;
        });
    }

    // CVSTOS Challenge Chrono II Replica Logic
    if (type === 'cvstos') {
        // 1. Tonneau Case Shape & Background
        // Approximate Tonneau: M 40,30 Q 120,10 200,30 L 200,210 Q 120,230 40,210 Z
        const tonneauPath = "M 40 30 Q 120 10 200 30 L 200 210 Q 120 230 40 210 Z";

        extra += `
            <!-- Dark Mesh Background -->
            <pattern id="meshPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#222" />
            </pattern>
            <path d="${tonneauPath}" fill="#111" stroke="#333" stroke-width="2" />
            <path d="${tonneauPath}" fill="url(#meshPattern)" opacity="0.5" />

            <!-- Vertical Bridges (Challenge Chrono Style) -->
            <!-- Main vertical struts -->
            <path d="M 80 30 L 80 210" stroke="#444" stroke-width="8" stroke-linecap="butt" />
            <path d="M 160 30 L 160 210" stroke="#444" stroke-width="8" stroke-linecap="butt" />
            
            <!-- Sub-dial Decor: 12 (30m), 6 (12h), 9 (Small Sec), 3 (Power/Date) -->
            
            <!-- Top Sub-dial (12 o'clock, Minutes) -->
            <circle cx="120" cy="65" r="22" fill="#000" stroke="#d4af37" stroke-width="1" />
            <line class="hand-sub1" x1="120" y1="65" x2="120" y2="48" stroke="red" stroke-width="1.5" />
            <text x="120" y="80" fill="#888" font-size="6" text-anchor="middle" font-family="Orbitron">30</text>

            <!-- Bottom Sub-dial (6 o'clock, Hours) -->
            <circle cx="120" cy="175" r="22" fill="#000" stroke="#d4af37" stroke-width="1" />
            <line class="hand-sub2" x1="120" y1="175" x2="120" y2="158" stroke="red" stroke-width="1.5" />
            <text x="120" y="190" fill="#888" font-size="6" text-anchor="middle" font-family="Orbitron">12</text>

            <!-- Left Sub-dial (9 o'clock, Small Seconds) -->
            <circle cx="65" cy="120" r="18" fill="none" stroke="#555" stroke-width="1" />
            <line class="hand-sub3" x1="65" y1="120" x2="65" y2="105" stroke="white" stroke-width="1" />

            <!-- Right Sector (3 o'clock, Power Reserve) -->
            <path d="M 160 120 L 185 120 A 25 25 0 0 0 178 100" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.7" />
            <text x="175" y="125" fill="#d4af37" font-size="8" font-family="Orbitron">PWR</text>
            <line class="hand-sub4" x1="160" y1="120" x2="180" y2="110" stroke="#d4af37" stroke-width="1.5" />

            <!-- Screws on Case -->
            <circle cx="45" cy="35" r="2.5" fill="#aaa" stroke="#000" />
            <circle cx="195" cy="35" r="2.5" fill="#aaa" stroke="#000" />
            <circle cx="45" cy="205" r="2.5" fill="#aaa" stroke="#000" />
            <circle cx="195" cy="205" r="2.5" fill="#aaa" stroke="#000" />
        `;

        // Floating Indices
        [1, 2, 4, 5, 7, 8, 10, 11].forEach(n => {
            const angle = n * 30;
            const r = 85;
            const x = cx + r * Math.cos((angle - 90) * Math.PI / 180);
            const y = cy + r * Math.sin((angle - 90) * Math.PI / 180);

            const xIn = cx + 75 * Math.cos((angle - 90) * Math.PI / 180);
            const yIn = cy + 75 * Math.sin((angle - 90) * Math.PI / 180);

            extra += `<line x1="${x}" y1="${y}" x2="${xIn}" y2="${yIn}" stroke="#fff" stroke-width="3" stroke-linecap="butt" />`;
            // Add small number
            const rNum = 95;
            const xNum = cx + rNum * Math.cos((angle - 90) * Math.PI / 180);
            const yNum = cy + rNum * Math.sin((angle - 90) * Math.PI / 180);
            extra += `<text x="${xNum}" y="${yNum}" fill="#fff" font-size="10" font-family="Orbitron" text-anchor="middle" dominant-baseline="middle">${n}</text>`;
        });

        // Cardinal numbers (12, 3, 6, 9) often omitted or stylized in chrono. 
        // We'll add a big '12' at top if space permits, or leave clear for sub-dials.
        // Let's add a CVSTOS logo placeholder at top
        extra += `<text x="120" y="40" fill="#fff" font-family="Orbitron" font-size="8" letter-spacing="2" text-anchor="middle">CVSTOS</text>`;
    }

    if (type === 'chrono_pro') {
        const jst = new Date(Date.now() + (9 * 60 * 60 * 1000));
        const day = jst.getUTCDate();
        extra += `
            <defs>
                <radialGradient id="sunray" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#1a1c2c" />
                    <stop offset="100%" stop-color="#050b1a" />
                </radialGradient>
            </defs>
            <circle cx="120" cy="120" r="110" fill="url(#sunray)" stroke="#333" stroke-width="2" />
            
            <!-- Tachymeter Scale -->
            <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="15" />
            <text x="120" y="25" fill="rgba(255,255,255,0.4)" font-size="6" text-anchor="middle">TACHYMETRE 400</text>
 
            <!-- 3 Sub Dials -->
            <circle cx="120" cy="70" r="22" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" />
            <text x="120" y="58" fill="#aaa" font-size="6" text-anchor="middle">30</text>
            <line class="hand-sub1" x1="120" y1="70" x2="120" y2="55" stroke="var(--hud-cyan)" stroke-width="1.5" />
 
            <circle cx="120" cy="170" r="22" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" />
            <text x="120" y="182" fill="#aaa" font-size="6" text-anchor="middle">12</text>
            <line class="hand-sub2" x1="120" y1="170" x2="120" y2="155" stroke="var(--hud-cyan)" stroke-width="1.5" />
 
            <circle cx="75" cy="120" r="18" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" />
            <line class="hand-sub3" x1="75" y1="120" x2="75" y2="105" stroke="white" stroke-width="1" />
            
            <rect x="165" y="112" width="20" height="16" fill="#111" stroke="#444" />
            <text x="175" y="124" fill="white" font-size="10" font-family="monospace" text-anchor="middle">${day}</text>
        `;

        for (let i = 0; i < 12; i++) {
            const angle = i * 30;
            const rOut = 100;
            const rIn = 90;
            const x1 = cx + rOut * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = cy + rOut * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = cx + rIn * Math.cos((angle - 90) * Math.PI / 180);
            const y2 = cy + rIn * Math.sin((angle - 90) * Math.PI / 180);
            const color = (i % 3 === 0) ? 'var(--hud-cyan)' : 'white';
            extra += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" stroke-linecap="butt" />`;
            const rDot = 85;
            const xDot = cx + rDot * Math.cos((angle - 90) * Math.PI / 180);
            const yDot = cy + rDot * Math.sin((angle - 90) * Math.PI / 180);
            extra += `<circle cx="${xDot}" cy="${yDot}" r="1.5" fill="${color}" opacity="0.8" />`;
        }
    }

    if (type === 'chrono_gold') {
        const gold = '#C5B358'; // Muted Champagne Gold
        const lightGold = '#E8E0C5'; // Pale Silk Gold
        const darkGold = '#8C7B45'; // Darker Muted Gold

        const jst = new Date(Date.now() + (9 * 60 * 60 * 1000));
        const year = jst.getUTCFullYear();
        const month = String(jst.getUTCMonth() + 1).padStart(2, '0');
        const day = String(jst.getUTCDate()).padStart(2, '0');
        const dateStr = `${year}.${month}.${day}`;

        extra += `
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${lightGold}" />
                    <stop offset="50%" stop-color="${gold}" />
                    <stop offset="100%" stop-color="${darkGold}" />
                </linearGradient>
                <radialGradient id="goldSunray" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#1c1a14" />
                    <stop offset="100%" stop-color="#0a0907" />
                </radialGradient>
            </defs>
            
            <!-- Dial Background with Muted Sunray -->
            <circle cx="120" cy="120" r="110" fill="url(#goldSunray)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            <circle cx="120" cy="120" r="108" fill="none" stroke="url(#goldGradient)" stroke-width="1.5" opacity="0.6" />
            
            <!-- Inner Ring (Subtle) -->
            <circle cx="120" cy="120" r="95" fill="none" stroke="${gold}" stroke-width="0.5" opacity="0.2" />
            
            <!-- Script Engraving: JST Date (Dynamic) -->
            <text x="120" y="165" fill="${gold}" font-family="'Playfair Display', serif" font-style="italic" font-size="12" text-anchor="middle" opacity="0.5">${dateStr}</text>
            
            <!-- Logo area (White/Silver for balance) -->
            <text x="120" y="80" fill="white" font-family="Orbitron" font-size="9" font-weight="bold" letter-spacing="4" text-anchor="middle" opacity="0.9">ANTIGRAVITY</text>
            <text x="120" y="90" fill="${gold}" font-family="Outfit" font-size="5" letter-spacing="1" text-anchor="middle" opacity="0.4">AUTOMATIC CHRONOMETER</text>

            <!-- 3 Muted Sub Dials -->
            <circle cx="120" cy="65" r="22" fill="none" stroke="${gold}" stroke-width="0.5" opacity="0.4" />
            <line class="hand-sub1" x1="120" y1="65" x2="120" y2="48" stroke="white" stroke-width="1" opacity="0.7" />

            <circle cx="120" cy="175" r="22" fill="none" stroke="${gold}" stroke-width="0.5" opacity="0.4" />
            <line class="hand-sub2" x1="120" y1="175" x2="120" y2="158" stroke="white" stroke-width="1" opacity="0.7" />

            <circle cx="65" cy="120" r="18" fill="none" stroke="${gold}" stroke-width="0.5" opacity="0.4" />
            <line class="hand-sub3" x1="65" y1="120" x2="65" y2="105" stroke="white" stroke-width="1" opacity="0.7" />
        `;

        // Simple Elegant Ticks
        for (let i = 0; i < 12; i++) {
            const angle = i * 30;
            const rOut = 108;
            const rIn = 102;
            const x1 = cx + rOut * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = cy + rOut * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = cx + rIn * Math.cos((angle - 90) * Math.PI / 180);
            const y2 = cy + rIn * Math.sin((angle - 90) * Math.PI / 180);
            extra += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="2" opacity="0.8" stroke-linecap="butt" />`;

            // Subtle Dots
            const rDot = 92;
            const xDot = cx + rDot * Math.cos((angle - 90) * Math.PI / 180);
            const yDot = cy + rDot * Math.sin((angle - 90) * Math.PI / 180);
            extra += `<circle cx="${xDot}" cy="${yDot}" r="0.8" fill="${gold}" opacity="0.5" />`;
        }
    }

    if (type === 'chrono') {
        // Sub dials placeholders
        extra += `
            <circle cx="120" cy="80" r="25" class="dial-bg" />
            <line class="hand-sub1" x1="120" y1="80" x2="120" y2="60" stroke="var(--hud-cyan)" stroke-width="1.5" />
            <circle cx="80" cy="140" r="25" class="dial-bg" />
            <line class="hand-sub2" x1="80" y1="140" x2="80" y2="120" stroke="var(--hud-cyan)" stroke-width="1.5" />
        `;
    }

    // Radar UI specific logic
    if (type === 'radar') {
        // Concentric Range Rings
        extra += `
            <circle cx="120" cy="120" r="30" fill="none" stroke="rgba(0, 255, 128, 0.3)" stroke-width="1" />
            <circle cx="120" cy="120" r="60" fill="none" stroke="rgba(0, 255, 128, 0.3)" stroke-width="1" />
            <circle cx="120" cy="120" r="90" fill="none" stroke="rgba(0, 255, 128, 0.3)" stroke-width="1" />
            <!-- Azimuth Lines -->
            <line x1="120" y1="10" x2="120" y2="230" stroke="rgba(0, 255, 128, 0.2)" stroke-width="1" />
            <line x1="10" y1="120" x2="230" y2="120" stroke="rgba(0, 255, 128, 0.2)" stroke-width="1" />
            <!-- Random Blips (Aircraft) -->
            <circle cx="150" cy="80" r="3" fill="#00ff80" opacity="0.8" class="radar-blip" style="filter: blur(1px);" />
            <text x="156" y="80" fill="#00ff80" font-family="monospace" font-size="8" opacity="0.7">UA829</text>
            
            <circle cx="80" cy="160" r="3" fill="#00ff80" opacity="0.8" class="radar-blip" style="filter: blur(1px);" />
            <text x="86" y="160" fill="#00ff80" font-family="monospace" font-size="8" opacity="0.7">NH105</text>

            <circle cx="160" cy="150" r="3" fill="#00ff80" opacity="0.8" class="radar-blip" style="filter: blur(1px);" />
        `;
    }

    if (type === 'fuel' || type === 'eicas' || type === 'eicas_stealth' || type === 'eicas_alpha') {
        const r = (id === 'watch-9' || id === 'watch-3' || id === 'watch-1' || id === 'watch-2') ? 90 : 55;
        const color = (id === 'watch-2') ? 'rgba(255, 165, 0, 0.15)' : 'rgba(0, 242, 255, 0.2)';
        // Initial path set to 12 o'clock (cx, cy-r) to match sync logic
        extra += `
            <path class="fan-fill" data-radius="${r}" d="M 120 120 L ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy - r} Z" fill="${color}" />
            <path d="M ${cx + r} 120 A ${r} ${r} 0 0 0 120 ${cy - r}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2" stroke-dasharray="2,2"/>
        `;

        // No.01 Alpha: Digital Seconds Readout (Positioned near 3 o'clock)
        if (id === 'watch-1') {
            extra += `
                <text x="170" y="125" class="digital-seconds" fill="var(--hud-cyan)" font-family="Orbitron" font-size="16" font-weight="bold" text-anchor="middle">00</text>
                
                <!-- Subtle frame for digital display -->
                <rect x="155" y="108" width="30" height="30" rx="3" fill="none" stroke="var(--hud-cyan)" stroke-width="0.5" opacity="0.2" />
            `;
        }
    }

    // ANA 787 Concept Logic
    if (type === 'ana787') {
        // Triton Blue: #002984, Mohican Blue: #76A4D9
        const tritonBlue = '#002984';
        const mohicanBlue = '#76A4D9';

        extra += `
            <!-- Background: Matte Dark Cockpit Gray -->
            <circle cx="120" cy="120" r="110" fill="#222" />
            
            <!-- Dual Tone Rings (Inspiration of Japan) -->
            <circle cx="120" cy="120" r="105" fill="none" stroke="${tritonBlue}" stroke-width="4" />
            <circle cx="120" cy="120" r="100" fill="none" stroke="${mohicanBlue}" stroke-width="2" />
            
            <!-- Artificial Horizon Reference Line (Subtle) -->
            <line x1="80" y1="120" x2="160" y2="120" stroke="rgba(255,255,255,0.3)" stroke-width="1" stroke-dasharray="2 4" />
            
            <!-- ANA Logo Text (Placeholder Style) -->
            <text x="120" y="80" fill="white" font-family="Outfit" font-weight="bold" font-size="14" letter-spacing="3" text-anchor="middle">ANA</text>
            <text x="120" y="92" fill="#aaa" font-family="Outfit" font-size="6" letter-spacing="1" text-anchor="middle">Inspiration of JAPAN</text>
            
            <!-- 787 Silhouette (Stylized) -->
            <path d="M 120 150 L 135 165 L 120 160 L 105 165 Z" fill="${mohicanBlue}" opacity="0.8" />
            <text x="120" y="180" fill="${mohicanBlue}" font-family="Orbitron" font-size="10" letter-spacing="2" text-anchor="middle">787</text>
            
            <!-- HUD Digits (Static for concept) -->
            <text x="200" y="125" fill="#0f0" font-family="Orbitron" font-size="8" text-anchor="end" opacity="0.6">ALT 35000</text>
            <text x="40" y="125" fill="#0f0" font-family="Orbitron" font-size="8" text-anchor="start" opacity="0.6">GS 480</text>
        `;

        // Simple White Indices
        for (let i = 0; i < 12; i++) {
            const angle = i * 30;
            const rOut = 95;
            const rIn = 85;
            const x1 = cx + rOut * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = cy + rOut * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = cx + rIn * Math.cos((angle - 90) * Math.PI / 180);
            const y2 = cy + rIn * Math.sin((angle - 90) * Math.PI / 180);
            extra += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="2" />`;
        }
    }

    // JAL A350 Concept Logic
    if (type === 'jal') {
        const jalRed = '#CC0000';

        extra += `
            <!-- Background: Clean White/Silver -->
            <circle cx="120" cy="120" r="110" fill="#f5f5f5" />
            <circle cx="120" cy="120" r="105" fill="none" stroke="#ddd" stroke-width="1" />
            
            <!-- Tsurumaru Arc Motif: Elegant Red Arc -->
             <path d="M 170 40 Q 220 120 150 200" fill="none" stroke="${jalRed}" stroke-width="8" stroke-linecap="round" opacity="0.8" />
             <path d="M 160 50 Q 200 120 145 190" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" opacity="0.1" />

            <!-- A350 Branding -->
            <text x="120" y="80" fill="#000" font-family="Orbitron" font-weight="bold" font-size="16" letter-spacing="2" text-anchor="middle">JAL</text>
            <text x="120" y="160" fill="#555" font-family="Outfit" font-weight="bold" font-size="10" letter-spacing="1" text-anchor="middle">A350-1000</text>
            
            <!-- Horizon Line -->
            <line x1="80" y1="120" x2="160" y2="120" stroke="#333" stroke-width="1.5" />
            <line x1="120" y1="120" x2="120" y2="100" stroke="#333" stroke-width="1.5" />
        `;

        // Classic Instrument Indices (Black)
        for (let i = 0; i < 60; i++) {
            if (i % 5 === 0) {
                const angle = i * 6;
                const rOut = 95;
                const rIn = 85;
                const x1 = cx + rOut * Math.cos((angle - 90) * Math.PI / 180);
                const y1 = cy + rOut * Math.sin((angle - 90) * Math.PI / 180);
                const x2 = cx + rIn * Math.cos((angle - 90) * Math.PI / 180);
                const y2 = cy + rIn * Math.sin((angle - 90) * Math.PI / 180);
                extra += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="3" />`;

                // Add numbers 1 to 12
                const n = (i / 5 === 0) ? 12 : i / 5;
                const rNum = 72;
                const xNum = cx + rNum * Math.cos((angle - 90) * Math.PI / 180);
                const yNum = cy + rNum * Math.sin((angle - 90) * Math.PI / 180);
                extra += `<text x="${xNum}" y="${yNum}" fill="#111" font-family="Outfit" font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${n}</text>`;
            }
        }
    }

    const handsSVG = getHandsSVG(type);

    return `
        <svg viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="110" class="dial-bg" stroke-width="2" />
            <g class="ticks">${ticks}</g>
            ${numbers}
            ${extra}
            ${handsSVG}
            <circle cx="120" cy="120" r="3" fill="#000" stroke="${type === 'radar' ? '#00ff80' : 'var(--hud-cyan)'}" stroke-width="1" />
        </svg>
    `;
}

function getHandsSVG(type) {
    let hStyle = '', mStyle = '', sStyle = '';

    switch (type) {
        case 'chrono_pro': // Aeronautical Masterpiece
            hStyle = `<path class="hand-h" d="M120 120 L115 75 L120 50 L125 75 Z" fill="none" stroke="white" stroke-width="2" />`;
            mStyle = `<path class="hand-m" d="M120 120 L116 40 L120 15 L124 40 Z" fill="white" stroke="none" />`;
            sStyle = `
                <g class="hand-s">
                    <line x1="120" y1="140" x2="120" y2="20" stroke="#00F2FF" stroke-width="1.5" />
                    <circle cx="120" cy="120" r="4" fill="#050b1a" stroke="white" stroke-width="1" />
                </g>
            `;
            break;

        case 'classic': // Sword Hands
        case 'navigator':
            hStyle = `<path class="hand-h" d="M120 120 L115 70 L120 50 L125 70 Z" fill="white" stroke="none" />`;
            mStyle = `<path class="hand-m" d="M120 120 L116 35 L120 20 L124 35 Z" fill="white" stroke="none" />`;
            sStyle = `<g class="hand-s"><line x1="120" y1="140" x2="120" y2="30" stroke="#ff3300" stroke-width="1" /><circle cx="120" cy="30" r="2" fill="#ff3300" /></g>`;
            break;

        case 'cvstos': // Skeleton Sport Luxury
            // Hour Hand (Skeleton)
            hStyle = `
                <g class="hand-h">
                    <path d="M120 120 L114 70 L120 50 L126 70 Z" fill="none" stroke="#d4af37" stroke-width="2" />
                    <path d="M120 120 L114 70 L120 50 L126 70 Z" fill="rgba(255,255,255,0.2)" />
                    <line x1="120" y1="50" x2="120" y2="65" stroke="white" stroke-width="2" />
                </g>`;
            // Minute Hand (Skeleton)
            mStyle = `
                <g class="hand-m">
                    <path d="M120 120 L115 30 L120 15 L125 30 Z" fill="none" stroke="#d4af37" stroke-width="2" />
                    <path d="M120 120 L115 30 L120 15 L125 30 Z" fill="rgba(255,255,255,0.2)" />
                    <line x1="120" y1="15" x2="120" y2="35" stroke="white" stroke-width="2" />
                </g>`;
            // Seconds Hand (Red Tip)
            sStyle = `
                <g class="hand-s">
                    <line x1="120" y1="140" x2="120" y2="20" stroke="#cc0000" stroke-width="1.5" />
                    <circle cx="120" cy="120" r="3" fill="#1a1a1a" stroke="#d4af37" stroke-width="1" />
                    <circle cx="120" cy="20" r="2" fill="white" />
                </g>`;
            break;

        case 'utc': // Block/Arrow Hands (Legacy, kept if needed later)
            hStyle = `<path class="hand-h" d="M116 120 L116 70 L120 60 L124 70 L124 120 Z" fill="none" stroke="white" stroke-width="2" />`;
            mStyle = `<path class="hand-m" d="M117 120 L117 30 L123 30 L123 120 Z" fill="white" stroke="none" />`;
            sStyle = `<path class="hand-s" d="M120 120 L115 110 L120 20 L125 110 Z" fill="var(--hud-cyan)" stroke="none" opacity="0.8" />`;
            break;

        case 'radar': // Radar Sweep Style
            // Hour/Minute hands are subtle "Map Markers" or technical lines
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="70" stroke="#00ff80" stroke-width="4" opacity="0.8" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="40" stroke="#00ff80" stroke-width="2" opacity="0.8" />`;
            // The Seconds hand is the Radar Sweep Gradient
            // Using a path arc wedge that fades out
            sStyle = `
                <g class="hand-s">
                    <line x1="120" y1="120" x2="120" y2="10" stroke="#00ff80" stroke-width="2" />
                    <path d="M 120 120 L 120 10 A 110 110 0 0 0 50 40 L 120 120" fill="url(#radarGradient)" opacity="0.5" />
                    <defs>
                        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#00ff80" stop-opacity="0" />
                            <stop offset="100%" stop-color="#00ff80" stop-opacity="0.5" />
                        </linearGradient>
                    </defs>
                </g>
            `;
            // Actually gradient definition inside transform might be tricky, simplified wedge for now.
            // Better visual: A simple large triangle or arc trailing the line.
            sStyle = `
                 <g class="hand-s">
                    <!-- Laser Line -->
                    <line x1="120" y1="120" x2="120" y2="10" stroke="#00ff80" stroke-width="1.5" style="filter: drop-shadow(0 0 5px #00ff80);" />
                    <!-- Visual Trail (Approximate with a few lines or a polygon) -->
                    <polygon points="120,120 120,10 80,40" fill="#00ff80" opacity="0.15" />
                 </g>
            `;
            break;

        case 'chrono': // Skeleton / Sporty
            hStyle = `<path class="hand-h" d="M118 120 L118 70 L122 70 L122 120 Z" fill="none" stroke="white" stroke-width="2" />`;
            mStyle = `<path class="hand-m" d="M119 120 L119 30 L121 30 L121 120 Z" fill="none" stroke="white" stroke-width="2" />`;
            sStyle = `<line class="hand-s" x1="120" y1="135" x2="120" y2="25" stroke="orange" stroke-width="1.5" />`;
            break;

        case 'ana787': // ANA 787 Concept
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="65" stroke="white" stroke-width="4" stroke-linecap="round" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="30" stroke="white" stroke-width="2.5" stroke-linecap="round" />`;
            // Triton Blue Seconds with Plane Tip
            sStyle = `
                <g class="hand-s">
                    <line x1="120" y1="135" x2="120" y2="25" stroke="#76A4D9" stroke-width="1" />
                    <path d="M 120 20 L 123 28 L 120 26 L 117 28 Z" fill="#002984" />
                </g>
            `;
            break;

        case 'jal': // JAL A350 Concept
            // High contrast black hands
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="65" stroke="#111" stroke-width="4" stroke-linecap="square" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="30" stroke="#111" stroke-width="3" stroke-linecap="square" />`;
            // JAL Red Second Hand
            sStyle = `
                <g class="hand-s">
                    <line x1="120" y1="140" x2="120" y2="20" stroke="#CC0000" stroke-width="1.5" />
                    <circle cx="120" cy="120" r="3" fill="#111" />
                    <circle cx="120" cy="20" r="2" fill="#CC0000" />
                </g>
            `;
            break;

        case 'chrono_gold': // Elegant Champagne Edition
            // Simple Bar/Sword Hands
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="75" stroke="white" stroke-width="5" stroke-linecap="square" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="35" stroke="white" stroke-width="3" stroke-linecap="square" />`;
            // Subtle Gold Second Hand
            sStyle = `
                <g class="hand-s">
                    <line x1="120" y1="140" x2="120" y2="20" stroke="#C5B358" stroke-width="1" />
                    <circle cx="120" cy="120" r="2.5" fill="#111" stroke="#C5B358" stroke-width="1" />
                </g>`;
            break;

        case 'stealth': // Technical Thin (Renamed/Replaced or kept if other items needed it, but user replaced Stealth card)
        case 'precision':
        case 'prototype':
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="65" stroke="var(--hud-cyan)" stroke-width="3" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="30" stroke="var(--hud-cyan)" stroke-width="1.5" />`;
            sStyle = `<circle class="hand-s" cx="120" cy="25" r="2" fill="white" />`; // Floating dot for seconds
            break;

        case 'altimeter': // Aviation Instrument
        case 'tachymeter':
            hStyle = `<path class="hand-h" d="M120 120 L112 70 L118 70 L120 55 L122 70 L128 70 Z" fill="#E6F1FF" />`; // Thick arrow
            mStyle = `<path class="hand-m" d="M120 120 L120 20" stroke="white" stroke-width="3" stroke-dasharray="8 4" />`; // Zebra stripe effect logic hard to do in one path, simplified to dash
            sStyle = `<line class="hand-s" x1="120" y1="120" x2="120" y2="20" stroke="#ffcc00" stroke-width="1" />`;
            break;

        case 'eicas_alpha': // No.01: Digital + EICAS Hybrid
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="70" stroke="white" stroke-width="4" stroke-linecap="square" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="40" stroke="white" stroke-width="2" stroke-linecap="square" />`;
            sStyle = `
                <g class="hand-s">
                    <line x1="120" y1="140" x2="120" y2="20" stroke="orange" stroke-width="1.5" />
                    <circle cx="120" cy="120" r="4" fill="#050b1a" stroke="white" stroke-width="1" />
                </g>
            `;
            break;

        case 'eicas_stealth': // No.03: Custom Stealth EICAS
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="70" stroke="white" stroke-width="4" stroke-linecap="square" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="40" stroke="white" stroke-width="2" stroke-linecap="square" />`;
            // Second hand color matched to No.06 (orange)
            sStyle = `
                <g class="hand-s">
                    <line x1="120" y1="140" x2="120" y2="20" stroke="orange" stroke-width="1.5" />
                    <circle cx="120" cy="120" r="4" fill="#050b1a" stroke="white" stroke-width="1" />
                </g>
            `;
            break;

        case 'eicas': // Needle style (matching gauges)
        case 'fuel':
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="70" stroke="white" stroke-width="4" stroke-linecap="square" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="40" stroke="white" stroke-width="2" stroke-linecap="square" />`;
            sStyle = `<line class="hand-s" x1="120" y1="120" x2="120" y2="30" stroke="var(--hud-cyan)" stroke-width="1.5" />`;
            break;

        case 'night': // Lume Stick
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="70" stroke="#0f0" stroke-width="6" stroke-linecap="round" opacity="0.8" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="35" stroke="#0f0" stroke-width="4" stroke-linecap="round" opacity="0.8" />`;
            sStyle = `<line class="hand-s" x1="120" y1="120" x2="120" y2="30" stroke="#ceff00" stroke-width="1" stroke-linecap="round" />`;
            break;

        default: // Fallback
            hStyle = `<line class="hand-h" x1="120" y1="120" x2="120" y2="70" stroke="white" stroke-width="4" stroke-linecap="round" />`;
            mStyle = `<line class="hand-m" x1="120" y1="120" x2="120" y2="40" stroke="white" stroke-width="2" stroke-linecap="round" />`;
            sStyle = `<line class="hand-s" x1="120" y1="120" x2="120" y2="30" stroke="#ff3300" stroke-width="1" stroke-linecap="round" />`;
    }

    return hStyle + mStyle + sStyle;
}

function animate() {
    const now = new Date();
    // Force Japan Standard Time (JST) = UTC + 9
    const jst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const h = jst.getUTCHours();
    const m = jst.getUTCMinutes();
    const s = jst.getUTCSeconds();
    const ms = jst.getUTCMilliseconds();

    watchData.forEach(watch => {
        const s_angle = (s + ms / 1000) * 6;
        const m_angle = m * 6 + s * 0.1;
        const h_angle = (h % 12) * 30 + m * 0.5;

        // Apply rotations
        if (watch.hands.hour) setRotation(watch.hands.hour, h_angle);
        if (watch.hands.minute) setRotation(watch.hands.minute, m_angle);
        if (watch.hands.second) {
            // Some watches have smooth seconds, some have ticking
            // No.01 (eicas_alpha) is now smooth like No.06 (chrono_pro etc handled below)
            if (watch.type === 'stealth' || watch.type === 'precision' || watch.type === 'ana787' || watch.type === 'eicas_stealth' || watch.type === 'eicas_alpha') {
                setRotation(watch.hands.second, s_angle);
            } else {
                setRotation(watch.hands.second, s * 6);
            }
        }

        // Sub dial animations
        if (watch.hands.sub1) {
            // Top: Chrono Minutes (simulate accumulation)
            setRotation(watch.hands.sub1, (m % 30) * 12, 120, 65);
        }
        if (watch.hands.sub2) {
            // Bottom: Chrono Hours (12h)
            setRotation(watch.hands.sub2, (h % 12) * 30, 120, 175);
        }
        if (watch.hands.sub3) {
            // Left: Small Seconds (realtime)
            setRotation(watch.hands.sub3, s_angle, 65, 120);
        }
        if (watch.hands.sub4) {
            // Right: Power Reserve (fake breathe)
            const pwr = (Math.sin(Date.now() / 5000) + 1) * 30 - 30; // Oscillate
            setRotation(watch.hands.sub4, pwr, 160, 120);
        }

        // Fan fill animation for gauge types (Synced with smooth seconds)
        if (watch.hands.fan) {
            // Use s + ms to make the Gauge expansion smooth as the sweep hand
            const smoothSec = s + (ms / 1000);
            const secPercent = (smoothSec / 60) * 100;
            updateFanFill(watch.hands.fan, secPercent);
        }

        // Digital Seconds update for No.01 Alpha
        if (watch.hands.digitalSec) {
            watch.hands.digitalSec.textContent = s.toString().padStart(2, '0');
        }
    });

    requestAnimationFrame(animate);
}

function setRotation(el, deg, cx = 120, cy = 120) {
    el.setAttribute('transform', `rotate(${deg}, ${cx}, ${cy})`);
}

function updateFanFill(el, val) {
    const cx = 120, cy = 120;
    const r = parseFloat(el.dataset.radius) || 55;
    const startAngle = -90; // 12 o'clock position
    const sweepAngle = (val / 100) * 360;
    const endAngle = startAngle + sweepAngle;

    const startRad = startAngle * (Math.PI / 180);
    const endRad = endAngle * (Math.PI / 180);

    const sx = cx + r * Math.cos(startRad);
    const sy = cy + r * Math.sin(startRad);
    const ex = cx + r * Math.cos(endRad);
    const ey = cy + r * Math.sin(endRad);

    const largeArcFlag = sweepAngle > 180 ? 1 : 0;

    // Handle the case where sweepAngle is very close to 0 or 360 to prevent path errors
    let pathD;
    if (sweepAngle >= 359.9) {
        pathD = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`; // Full circle
    } else if (sweepAngle <= 0.1) {
        pathD = `M ${cx} ${cy} Z`; // Empty
    } else {
        pathD = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${largeArcFlag} 1 ${ex} ${ey} Z`;
    }

    el.setAttribute('d', pathD);
}
