document.addEventListener('DOMContentLoaded', () => {
    initBigSnow();
});

function initBigSnow() {
    const container = document.getElementById('snow-container');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    container.appendChild(canvas);

    let width, height;
    const snowflakes = [];
    const snowflakeCount = 40; // Fewer but bigger

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class FluffyFlake {
        constructor() {
            this.reset();
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -20;
            this.size = Math.random() * 5 + 4; // Large fluffy flakes
            this.speed = Math.random() * 1 + 0.5;
            this.opacity = Math.random() * 0.4 + 0.4;
            this.swing = Math.random() * 2;
            this.swingStep = Math.random() * 0.01;
            this.swingCounter = Math.random() * Math.PI * 2;
        }

        update() {
            this.y += this.speed;
            this.swingCounter += this.swingStep;
            this.x += Math.sin(this.swingCounter) * this.swing;

            if (this.y > height + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < snowflakeCount; i++) {
            snowflakes.push(new FluffyFlake());
        }

        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        snowflakes.forEach(flake => {
            flake.update();
            flake.draw();
        });

        requestAnimationFrame(animate);
    }

    init();
}
