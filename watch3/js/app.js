/**
 * Digital Timer Logic
 */

class Timer {
    constructor() {
        // State
        this.totalSeconds = 45 * 60; // Default 45 minutes
        this.remainingSeconds = this.totalSeconds;
        this.timerId = null;
        this.isRunning = false;

        // DOM Elements
        this.hoursEl = document.getElementById('hours');
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');

        this.startBtn = document.getElementById('start-btn');
        this.startText = document.getElementById('start-text');
        this.playIcon = document.getElementById('play-icon');
        this.resetBtn = document.getElementById('reset-btn');
        this.settingsBtn = document.getElementById('settings-btn');

        this.modal = document.getElementById('settings-modal');
        this.saveBtn = document.getElementById('save-settings');
        this.cancelBtn = document.getElementById('cancel-settings');

        this.inputH = document.getElementById('input-hours');
        this.inputM = document.getElementById('input-minutes');
        this.inputS = document.getElementById('input-seconds');

        this.circle = document.getElementById('progress-ring-circle');
        this.radius = this.circle.r.baseVal.value;
        this.circumference = this.radius * 2 * Math.PI;

        this.init();
    }

    init() {
        this.circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        this.circle.style.strokeDashoffset = this.circumference;

        this.updateDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.toggle());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.cancelBtn.addEventListener('click', () => this.closeSettings());
        this.saveBtn.addEventListener('click', () => this.saveSettings());

        // Quick set by clicking units
        document.getElementById('timer-display').addEventListener('click', () => this.openSettings());
    }

    updateDisplay() {
        const h = Math.floor(this.remainingSeconds / 3600);
        const m = Math.floor((this.remainingSeconds % 3600) / 60);
        const s = this.remainingSeconds % 60;

        this.hoursEl.textContent = h.toString().padStart(2, '0');
        this.minutesEl.textContent = m.toString().padStart(2, '0');
        this.secondsEl.textContent = s.toString().padStart(2, '0');

        // Progress ring
        const offset = this.circumference - (this.remainingSeconds / this.totalSeconds) * this.circumference;
        this.circle.style.strokeDashoffset = offset;

        // Change color when nearly finished
        if (this.remainingSeconds < 60 && this.remainingSeconds > 0) {
            this.circle.style.stroke = "#ff0055";
            this.circle.style.filter = "blur(5px) drop-shadow(0 0 10px #ff0055)";
        } else {
            this.circle.style.stroke = "var(--accent-color)";
            this.circle.style.filter = "blur(2px)";
        }
    }

    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }

    start() {
        if (this.remainingSeconds <= 0) return;

        this.isRunning = true;
        this.startText.textContent = "PAUSE";
        this.playIcon.setAttribute('name', 'pause');

        this.timerId = setInterval(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
                this.updateDisplay();
            } else {
                this.complete();
            }
        }, 1000);
    }

    pause() {
        this.isRunning = false;
        this.startText.textContent = "START";
        this.playIcon.setAttribute('name', 'play');
        clearInterval(this.timerId);
    }

    reset() {
        this.pause();
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
    }

    complete() {
        this.pause();
        // Visual feedback for completion
        this.circle.style.strokeDashoffset = 0;
        alert("Time is up!");
    }

    openSettings() {
        this.pause();
        this.modal.classList.add('active');

        const h = Math.floor(this.totalSeconds / 3600);
        const m = Math.floor((this.totalSeconds % 3600) / 60);
        const s = this.totalSeconds % 60;

        this.inputH.value = h || '';
        this.inputM.value = m || '';
        this.inputS.value = s || '';
    }

    closeSettings() {
        this.modal.classList.remove('active');
    }

    saveSettings() {
        const h = parseInt(this.inputH.value) || 0;
        const m = parseInt(this.inputM.value) || 0;
        const s = parseInt(this.inputS.value) || 0;

        this.totalSeconds = (h * 3600) + (m * 60) + s;
        if (this.totalSeconds <= 0) this.totalSeconds = 1; // Minimum 1 second

        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
        this.closeSettings();
    }
}

// Initialize Timer
document.addEventListener('DOMContentLoaded', () => {
    window.appTimer = new Timer();
});
