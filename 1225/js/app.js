document.addEventListener('DOMContentLoaded', () => {
    initSnow();
});

function initSnow() {
    const container = document.getElementById('snow-container');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    container.appendChild(canvas);

    let width, height;
    const snowflakes = [];
    const snowflakeCount = 80;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Snowflake {
        constructor() {
            this.reset();
            // Start at random y to fill screen immediately
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -10;
            this.size = Math.random() * 2 + 1; // Small, elegant flakes
            this.speed = Math.random() * 0.5 + 0.2; // Slow, drifting fall
            this.opacity = Math.random() * 0.5 + 0.3;
            this.swing = Math.random() * 0.2; // Horizontal sway
            this.swingStep = Math.random() * 0.02;
            this.swingCounter = Math.random() * Math.PI * 2;
        }

        update() {
            this.y += this.speed;
            this.swingCounter += this.swingStep;
            this.x += Math.sin(this.swingCounter) * this.swing;

            if (this.y > height) {
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
            snowflakes.push(new Snowflake());
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
