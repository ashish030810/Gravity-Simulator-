// ============================================================
// STARDANCE — Main Sketch
// ============================================================

// ---- GLOBALS ----
let planets = [];
let trails = [];
let selectedPlanet = null;
let paused = false;
let simSpeed = 1;
let timeElapsed = 0;
let currentPreset = 'solar';
let frameCounter = 0;
let fps = 60;
let lastFpsTime = 0;

// Camera
let camOffset = { x: 0, y: 0 };
let camZoom = 1;
let camRotation = 0;
let targetCamZoom = 1;
let targetCamRotation = 0;
let isDragging = false;
let dragStart = null;
let dragOffset = { x: 0, y: 0 };
let spawnMass = 10;

// p5.js setup
function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    canvas.style('display', 'block');
    
    // Set up p5 rendering
    pixelDensity(1);
    frameRate(60);
    smooth();
    
    // Load default preset
    loadPreset('solar');
    
    // Setup UI callbacks
    setupUICallbacks();
    
    // Hide loading screen
    ui.showLoading(false);
}

// p5.js draw loop
function draw() {
    // Update FPS
    frameCounter++;
    if (millis() - lastFpsTime > 1000) {
        fps = frameCounter;
        frameCounter = 0;
        lastFpsTime = millis();
    }

    // Physics update
    if (!paused) {
        const steps = Math.max(1, Math.ceil(simSpeed));
        const dt = simSpeed / steps;
        for (let s = 0; s < steps; s++) {
            physics.step(planets, dt);
            physics.handleCollisions(planets);
            timeElapsed += dt;
        }
        
        // Update trails
        updateTrails();
    }

    // ---- RENDER ----
    background(0, 0, 0);

    // Camera transform
    push();
    translate(width / 2 + camOffset.x, height / 2 + camOffset.y);
    scale(camZoom);
    rotate(radians(camRotation));

    // Grid
    if (window._gridEnabled) {
        drawGrid();
    }

    // Heatmap background
    if (window._heatmapEnabled) {
        drawHeatmap();
    }

    // Draw orbits
    if (window._orbitsEnabled) {
        for (const p of planets) {
            p.drawOrbit(this);
        }
    }

    // Draw trails
    if (window._trailsEnabled) {
        drawTrails();
    }

    // Draw planets
    for (const p of planets) {
        p.draw(this, window._glowEnabled, window._labelsEnabled);
    }

    // Selection indicator
    if (selectedPlanet && planets.includes(selectedPlanet)) {
        noFill();
        stroke(255, 255, 100, 150);
        strokeWeight(1.5);
        const r = selectedPlanet.radius * 2.5 + 8;
        ellipse(selectedPlanet.x, selectedPlanet.y, r);
        // Pulsing ring
        const pulse = 0.5 + 0.5 * sin(frameCount * 0.04);
        stroke(255, 255, 100, 50 * pulse);
        strokeWeight(1);
        ellipse(selectedPlanet.x, selectedPlanet.y, r * (1 + pulse * 0.3));
    }

    // Drag indicator
    if (isDragging && dragStart) {
        const dx = mouseX - dragStart.x;
        const dy = mouseY - dragStart.y;
        const dist = sqrt(dx * dx + dy * dy);
        if (dist > 5) {
            const worldPos = screenToWorld(dragStart.x, dragStart.y);
            noFill();
            stroke(139, 92, 246, 100);
            strokeWeight(1);
            const angle = atan2(dy, dx);
            const length = dist * 0.03;
            line(worldPos.x, worldPos.y, 
                 worldPos.x + cos(angle) * length, 
                 worldPos.y + sin(angle) * length);
            // Target preview
            noFill();
            stroke(139, 92, 246, 50);
            strokeWeight(0.5);
            const previewR = sqrt(spawnMass) * 1.5 + 2;
            ellipse(worldPos.x + cos(angle) * length, 
                    worldPos.y + sin(angle) * length, 
                    previewR * 2);
        }
    }

    pop();

    // ---- UI UPDATE ----
    ui.updateStats(planets, timeElapsed, fps);
    ui.updateInspector(selectedPlanet);
}

// ---- TRAILS ----
function updateTrails() {
    // Add trail points
    if (frameCount % 2 === 0) {
        for (const p of planets) {
            if (p.trail && p.orbitHistory.length > 1) {
                trails.push({
                    x: p.x,
                    y: p.y,
                    color: p.color,
                    radius: p.radius * 0.5,
                    life: 255,
                    age: 0
                });
            }
        }
    }

    // Fade and remove old trails
    for (let i = trails.length - 1; i >= 0; i--) {
        trails[i].life -= 2;
        trails[i].age++;
        if (trails[i].life <= 0) {
            trails.splice(i, 1);
        }
    }

    // Limit trails
    if (trails.length > 3000) {
        trails.splice(0, trails.length - 3000);
    }
}

function drawTrails() {
    noStroke();
    for (const t of trails) {
        const alpha = t.life * 0.15;
        const r = t.radius * (0.3 + 0.7 * (t.life / 255));
        fill(t.color[0], t.color[1], t.color[2], alpha);
        ellipse(t.x, t.y, r * 2);
    }
}

// ---- GRID ----
function drawGrid() {
    push();
    const range = 800;
    const step = 50;

    // Major grid
    stroke(50, 50, 70, 60);
    strokeWeight(0.5);
    for (let x = -range; x <= range; x += step) {
        line(x, -range, x, range);
    }
    for (let y = -range; y <= range; y += step) {
        line(-range, y, range, y);
    }

    // Axis
    stroke(80, 80, 120, 80);
    strokeWeight(1);
    line(-range, 0, range, 0);
    line(0, -range, 0, range);

    // Rings
    stroke(40, 40, 60, 30);
    strokeWeight(0.5);
    noFill();
    for (let r = 100; r <= range; r += 100) {
        ellipse(0, 0, r * 2);
    }

    pop();
}

// ---- HEATMAP ----
function drawHeatmap() {
    // Simple heatmap overlay based on planet kinetic energy
    push();
    noStroke();
    for (const p of planets) {
        const intensity = min(1, p.heat * 2);
        const alpha = intensity * 40;
        const r = p.radius * 3;
        fill(255, 200, 50, alpha);
        ellipse(p.x, p.y, r);
    }
    pop();
}

// ---- PRESETS ----
function loadPreset(name) {
    currentPreset = name;
    const data = PRESETS[name]();
    planets = data.map(d => new Planet(d));
    
    // Initialize orbit history
    for (const p of planets) {
        p.orbitHistory = [];
        for (let i = 0; i < 20; i++) {
            p.orbitHistory.push({ x: p.x, y: p.y });
        }
    }
    
    trails = [];
    selectedPlanet = null;
    timeElapsed = 0;
    ui.setPreset(name);
}

// ---- CAMERA HELPERS ----
function screenToWorld(sx, sy) {
    let wx = (sx - width / 2 - camOffset.x) / camZoom;
    let wy = (sy - height / 2 - camOffset.y) / camZoom;
    const angle = radians(camRotation);
    const rx = wx * cos(-angle) - wy * sin(-angle);
    const ry = wx * sin(-angle) + wy * cos(-angle);
    return { x: rx, y: ry };
}

function worldToScreen(wx, wy) {
    const angle = radians(camRotation);
    const rx = wx * cos(angle) - wy * sin(angle);
    const ry = wx * sin(angle) + wy * cos(angle);
    return {
        x: rx * camZoom + width / 2 + camOffset.x,
        y: ry * camZoom + height / 2 + camOffset.y
    };
}

// ---- MOUSE INTERACTIONS ----
let mouseDownPos = null;
let mouseDownTime = 0;

function mousePressed() {
    // Ignore if on UI
    const sidebar = document.getElementById('sidebar');
    const rect = sidebar.getBoundingClientRect();
    if (mouseX >= rect.left && mouseX <= rect.right &&
        mouseY >= rect.top && mouseY <= rect.bottom) return;

    mouseDownPos = { x: mouseX, y: mouseY };
    mouseDownTime = millis();

    // Shift+click to delete
    if (keyIsDown(SHIFT)) {
        const worldPos = screenToWorld(mouseX, mouseY);
        for (let i = planets.length - 1; i >= 0; i--) {
            const p = planets[i];
            const d = dist(worldPos.x, worldPos.y, p.x, p.y);
            if (d < p.radius + 10) {
                if (selectedPlanet === p) selectedPlanet = null;
                planets.splice(i, 1);
                return;
            }
        }
        return;
    }

    // Select planet
    const worldPos = screenToWorld(mouseX, mouseY);
    let found = null;
    let minDist = Infinity;
    for (const p of planets) {
        const d = dist(worldPos.x, worldPos.y, p.x, p.y);
        if (d < p.radius + 8 && d < minDist) {
            found = p;
            minDist = d;
        }
    }
    if (found) {
        selectedPlanet = found;
        return;
    }

    // Start drag for new planet
    isDragging = true;
    dragStart = { x: mouseX, y: mouseY };
}

function mouseDragged() {
    if (mouseButton === RIGHT) {
        camOffset.x += mouseX - pmouseX;
        camOffset.y += mouseY - pmouseY;
        return;
    }

    if (isDragging && dragStart) {
        // Show drag indicator
    }
}

function mouseReleased() {
    if (isDragging && dragStart) {
        const dx = mouseX - dragStart.x;
        const dy = mouseY - dragStart.y;
        const distMoved = sqrt(dx * dx + dy * dy);

        if (distMoved > 8) {
            // Launch new planet
            const worldPos = screenToWorld(dragStart.x, dragStart.y);
            const mass = spawnMass;
            const radius = pow(mass, 0.4) * 1.5 + 2;
            const speed = distMoved * 0.025;
            const angle = atan2(dy, dx);
            
            const planet = new Planet({
                name: `Launch${planets.length}`,
                mass: mass,
                x: worldPos.x,
                y: worldPos.y,
                vx: cos(angle) * speed,
                vy: sin(angle) * speed,
                radius: radius,
                color: [random(100, 255), random(100, 255), random(100, 255)]
            });
            planet.orbitHistory = [];
            for (let i = 0; i < 10; i++) {
                planet.orbitHistory.push({ x: planet.x, y: planet.y });
            }
            planets.push(planet);
            selectedPlanet = planet;
        }

        isDragging = false;
        dragStart = null;
    }
}

function mouseWheel(event) {
    const delta = event.delta > 0 ? -0.05 : 0.05;
    camZoom = constrain(camZoom + delta, 0.1, 3);
    ui.elements.zoomSlider.value = camZoom;
    ui.elements.zoomDisplay.textContent = camZoom.toFixed(1) + 'x';
    return false;
}

// ---- UI CALLBACKS ----
function setupUICallbacks() {
    ui.onPresetChange = (preset) => {
        loadPreset(preset);
    };

    ui.onMassChange = (value) => {
        spawnMass = value;
    };

    ui.onSpeedChange = (value) => {
        simSpeed = value;
    };

    ui.onZoomChange = (value) => {
        camZoom = value;
    };

    ui.onRotationChange = (value) => {
        camRotation = value;
    };

    ui.onPauseToggle = () => {
        paused = !paused;
        ui.setPaused(paused);
    };

    ui.onReset = () => {
        loadPreset(currentPreset);
    };

    ui.onDeleteSelected = () => {
        if (selectedPlanet) {
            const idx = planets.indexOf(selectedPlanet);
            if (idx > -1) {
                planets.splice(idx, 1);
                selectedPlanet = null;
            }
        }
    };

    ui.onClearAll = () => {
        planets = [];
        trails = [];
        selectedPlanet = null;
    };

    ui.onFollowSun = () => {
        // Find the most massive body
        let heaviest = null;
        let maxMass = 0;
        for (const p of planets) {
            if (p.mass > maxMass) {
                maxMass = p.mass;
                heaviest = p;
            }
        }
        if (heaviest) {
            camOffset.x = -heaviest.x * camZoom;
            camOffset.y = -heaviest.y * camZoom;
        } else if (planets.length > 0) {
            camOffset.x = -planets[0].x * camZoom;
            camOffset.y = -planets[0].y * camZoom;
        }
    };

    ui.onResetView = () => {
        camOffset = { x: 0, y: 0 };
        camZoom = 1;
        camRotation = 0;
        ui.elements.zoomSlider.value = 1;
        ui.elements.rotationSlider.value = 0;
        ui.elements.zoomDisplay.textContent = '1.0x';
        ui.elements.rotationDisplay.textContent = '0°';
    };

    ui.onExportPng = () => {
        saveCanvas('stardance_' + Date.now(), 'png');
    };

    ui.onExportJson = () => {
        const data = planets.map(p => p.toJSON());
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stardance_' + Date.now() + '.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    ui.onLoadJson = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                planets = data.map(d => new Planet(d));
                for (const p of planets) {
                    p.orbitHistory = [];
                    for (let i = 0; i < 10; i++) {
                        p.orbitHistory.push({ x: p.x, y: p.y });
                    }
                }
                trails = [];
                selectedPlanet = null;
                timeElapsed = 0;
            } catch (err) {
                alert('Invalid JSON file. Please check the format.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };
}

// ---- WINDOW RESIZE ----
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// ---- RANDOM HELPER ----
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// ---- KEYBOARD SHORTCUTS (additional) ----
document.addEventListener('keydown', (e) => {
    // F for fullscreen follow
    if (e.key === 'f' || e.key === 'F') {
        if (selectedPlanet) {
            camOffset.x = -selectedPlanet.x * camZoom;
            camOffset.y = -selectedPlanet.y * camZoom;
        }
    }
});