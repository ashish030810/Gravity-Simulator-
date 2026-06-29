// ============================================================
// UI CONTROLLER
// ============================================================

class UIController {
    constructor() {
        this.elements = {};
        this.setupElements();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
    }

    setupElements() {
        this.elements = {
            planetCount: document.getElementById('planetCount'),
            totalMass: document.getElementById('totalMass'),
            timeDisplay: document.getElementById('timeDisplay'),
            fpsDisplay: document.getElementById('fpsDisplay'),
            massDisplay: document.getElementById('massDisplay'),
            massSlider: document.getElementById('massSlider'),
            speedDisplay: document.getElementById('speedDisplay'),
            speedSlider: document.getElementById('speedSlider'),
            zoomDisplay: document.getElementById('zoomDisplay'),
            zoomSlider: document.getElementById('zoomSlider'),
            rotationDisplay: document.getElementById('rotationDisplay'),
            rotationSlider: document.getElementById('rotationSlider'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            deleteBtn: document.getElementById('deleteBtn'),
            clearBtn: document.getElementById('clearBtn'),
            followSun: document.getElementById('followSun'),
            resetView: document.getElementById('resetView'),
            trailsBtn: document.getElementById('trailsBtn'),
            labelsBtn: document.getElementById('labelsBtn'),
            orbitsBtn: document.getElementById('orbitsBtn'),
            gridBtn: document.getElementById('gridBtn'),
            glowBtn: document.getElementById('glowBtn'),
            heatmapBtn: document.getElementById('heatmapBtn'),
            exportPng: document.getElementById('exportPng'),
            exportJson: document.getElementById('exportJson'),
            loadJson: document.getElementById('loadJson'),
            fileInput: document.getElementById('fileInput'),
            infoName: document.getElementById('infoName'),
            infoMass: document.getElementById('infoMass'),
            infoDist: document.getElementById('infoDist'),
            infoSpeed: document.getElementById('infoSpeed'),
            infoVelocity: document.getElementById('infoVelocity'),
            loadingScreen: document.getElementById('loading-screen'),
        };
    }

    setupEventListeners() {
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onPresetChange(btn.dataset.preset);
            });
        });

        // Mass slider
        this.elements.massSlider.addEventListener('input', () => {
            const val = parseFloat(this.elements.massSlider.value);
            this.elements.massDisplay.textContent = val;
            this.onMassChange(val);
        });

        // Speed slider
        this.elements.speedSlider.addEventListener('input', () => {
            const val = parseFloat(this.elements.speedSlider.value);
            this.elements.speedDisplay.textContent = val.toFixed(1) + 'x';
            this.onSpeedChange(val);
        });

        // Zoom slider
        this.elements.zoomSlider.addEventListener('input', () => {
            const val = parseFloat(this.elements.zoomSlider.value);
            this.elements.zoomDisplay.textContent = val.toFixed(1) + 'x';
            this.onZoomChange(val);
        });

        // Rotation slider
        this.elements.rotationSlider.addEventListener('input', () => {
            const val = parseFloat(this.elements.rotationSlider.value);
            this.elements.rotationDisplay.textContent = Math.round(val) + '°';
            this.onRotationChange(val);
        });

        // Action buttons
        this.elements.pauseBtn.addEventListener('click', () => this.onPauseToggle());
        this.elements.resetBtn.addEventListener('click', () => this.onReset());
        this.elements.deleteBtn.addEventListener('click', () => this.onDeleteSelected());
        this.elements.clearBtn.addEventListener('click', () => this.onClearAll());

        // View buttons
        this.elements.followSun.addEventListener('click', () => this.onFollowSun());
        this.elements.resetView.addEventListener('click', () => this.onResetView());

        // Toggle buttons
        this.elements.trailsBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            window._toggleTrails(this.classList.contains('active'));
        });
        this.elements.labelsBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            window._toggleLabels(this.classList.contains('active'));
        });
        this.elements.orbitsBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            window._toggleOrbits(this.classList.contains('active'));
        });
        this.elements.gridBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            window._toggleGrid(this.classList.contains('active'));
        });
        this.elements.glowBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            window._toggleGlow(this.classList.contains('active'));
        });
        this.elements.heatmapBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            window._toggleHeatmap(this.classList.contains('active'));
        });

        // Export/Import
        this.elements.exportPng.addEventListener('click', () => this.onExportPng());
        this.elements.exportJson.addEventListener('click', () => this.onExportJson());
        this.elements.loadJson.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.onLoadJson(e));
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT') return;

            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.elements.pauseBtn.click();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    const presets = ['solar', 'binary', 'galaxy', 'ring', 'blackhole', 'chaos'];
                    this.onPresetChange(presets[parseInt(e.key) - 1]);
                    break;
                case 'r':
                case 'R':
                    this.onReset();
                    break;
                case 'Delete':
                case 'Backspace':
                    this.onDeleteSelected();
                    break;
            }
        });
    }

    updateStats(planets, timeElapsed, fps) {
        this.elements.planetCount.textContent = planets.length;
        const totalMass = planets.reduce((sum, p) => sum + p.mass, 0);
        this.elements.totalMass.textContent = totalMass.toFixed(0);

        const seconds = Math.floor(timeElapsed);
        const mins = Math.floor(seconds / 60);
        const hrs = Math.floor(mins / 60);
        this.elements.timeDisplay.textContent =
            `${String(hrs).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

        this.elements.fpsDisplay.textContent = fps;
    }

    updateInspector(planet) {
        if (planet) {
            this.elements.infoName.textContent = planet.name;
            this.elements.infoMass.textContent = planet.mass.toFixed(1);
            const dist = Math.sqrt(planet.x * planet.x + planet.y * planet.y);
            this.elements.infoDist.textContent = dist.toFixed(0);
            const speed = planet.getSpeed();
            this.elements.infoSpeed.textContent = speed.toFixed(2);
            this.elements.infoVelocity.textContent =
                `(${planet.vx.toFixed(2)}, ${planet.vy.toFixed(2)})`;
        } else {
            this.elements.infoName.textContent = '—';
            this.elements.infoMass.textContent = '—';
            this.elements.infoDist.textContent = '—';
            this.elements.infoSpeed.textContent = '—';
            this.elements.infoVelocity.textContent = '—';
        }
    }

    setPaused(paused) {
        this.elements.pauseBtn.textContent = paused ? '▶️ Play' : '⏸️ Pause';
        this.elements.pauseBtn.classList.toggle('primary', paused);
    }

    setPreset(name) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === name);
        });
    }

    showLoading(show) {
        this.elements.loadingScreen.classList.toggle('hidden', !show);
    }

    // Event callbacks (to be overridden by main sketch)
    onPresetChange(preset) {}
    onMassChange(value) {}
    onSpeedChange(value) {}
    onZoomChange(value) {}
    onRotationChange(value) {}
    onPauseToggle() {}
    onReset() {}
    onDeleteSelected() {}
    onClearAll() {}
    onFollowSun() {}
    onResetView() {}
    onExportPng() {}
    onExportJson() {}
    onLoadJson(event) {}
}

// Create global UI instance
const ui = new UIController();

// Global toggle functions (called from sketch)
window._toggleTrails = (enabled) => { window._trailsEnabled = enabled; };
window._toggleLabels = (enabled) => { window._labelsEnabled = enabled; };
window._toggleOrbits = (enabled) => { window._orbitsEnabled = enabled; };
window._toggleGrid = (enabled) => { window._gridEnabled = enabled; };
window._toggleGlow = (enabled) => { window._glowEnabled = enabled; };
window._toggleHeatmap = (enabled) => { window._heatmapEnabled = enabled; };

// Initialize toggle states
window._trailsEnabled = true;
window._labelsEnabled = false;
window._orbitsEnabled = true;
window._gridEnabled = false;
window._glowEnabled = true;
window._heatmapEnabled = false;