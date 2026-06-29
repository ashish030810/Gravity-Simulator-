// ============================================================
// PLANET CLASS
// ============================================================

class Planet {
    constructor(data) {
        this.name = data.name || this.generateName();
        this.mass = data.mass || 10;
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.vx = data.vx || 0;
        this.vy = data.vy || 0;
        this.ax = 0;
        this.ay = 0;
        this.radius = data.radius || this.calculateRadius();
        this.color = data.color || this.generateColor();
        this.trail = data.trail !== undefined ? data.trail : true;
        this.orbitHistory = [];
        this.maxOrbitHistory = 300;
        this.selected = false;
        this.id = Planet._idCounter++;
        this.creationTime = Date.now();
        this.heat = 0; // For heatmap visualization
    }

    static _idCounter = 0;

    generateName() {
        const prefixes = ['Nova', 'Vega', 'Orion', 'Sirius', 'Androm', 'Cassi', 'Draco', 'Lyra', 'Pegas', 'Phoen'];
        const suffixes = ['is', 'ar', 'on', 'ia', 'us', 'a', 'is', 'um', 'os', 'is'];
        return prefixes[Math.floor(Math.random() * prefixes.length)] +
               suffixes[Math.floor(Math.random() * suffixes.length)] +
               Math.floor(Math.random() * 100);
    }

    calculateRadius() {
        return Math.pow(this.mass, 0.4) * 1.5 + 2;
    }

    generateColor() {
        const hues = [
            [255, 200, 50],   // Sun
            [255, 150, 100],  // Orange
            [100, 200, 255],  // Blue
            [200, 100, 50],   // Red
            [150, 255, 150],  // Green
            [255, 100, 200],  // Pink
            [200, 180, 100],  // Gold
            [100, 150, 255],  // Light Blue
            [255, 200, 200],  // Light Red
            [200, 200, 255],  // Lavender
        ];
        return hues[Math.floor(Math.random() * hues.length)];
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;

        // Store orbit history
        if (this.orbitHistory.length === 0 || 
            dist(this.x, this.y, this.orbitHistory[this.orbitHistory.length - 1].x, 
                 this.orbitHistory[this.orbitHistory.length - 1].y) > 0.5) {
            this.orbitHistory.push({ x: this.x, y: this.y });
            if (this.orbitHistory.length > this.maxOrbitHistory) {
                this.orbitHistory.shift();
            }
        }

        // Update heat (kinetic energy)
        this.heat = Math.min(1, Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 10);
    }

    draw(p5, showGlow, showLabels) {
        const r = this.radius;
        const [cr, cg, cb] = this.color;

        p5.push();

        // Glow effect
        if (showGlow) {
            const glowSize = r * 4;
            const grad = p5.drawingContext.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.25)`);
            grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, 0.08)`);
            grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
            p5.drawingContext.fillStyle = grad;
            p5.drawingContext.beginPath();
            p5.drawingContext.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
            p5.drawingContext.fill();
        }

        // Planet body with gradient
        const grad = p5.drawingContext.createRadialGradient(
            -r * 0.3, -r * 0.3, 0,
            0, 0, r
        );
        grad.addColorStop(0, `rgba(${Math.min(255, cr + 80)}, ${Math.min(255, cg + 80)}, ${Math.min(255, cb + 80)}, 1)`);
        grad.addColorStop(0.7, `rgba(${cr}, ${cg}, ${cb}, 1)`);
        grad.addColorStop(1, `rgba(${Math.max(0, cr - 40)}, ${Math.max(0, cg - 40)}, ${Math.max(0, cb - 40)}, 1)`);
        p5.drawingContext.fillStyle = grad;
        p5.drawingContext.beginPath();
        p5.drawingContext.arc(this.x, this.y, r, 0, Math.PI * 2);
        p5.drawingContext.fill();

        // Highlight
        p5.noStroke();
        p5.fill(255, 255, 255, 25);
        p5.ellipse(this.x - r * 0.25, this.y - r * 0.3, r * 0.6, r * 0.4);

        // Ring for special planets
        if (this.mass > 100) {
            p5.noFill();
            p5.stroke(cr, cg, cb, 30);
            p5.strokeWeight(1);
            p5.ellipse(this.x, this.y, r * 2.8, r * 1.2);
            p5.ellipse(this.x, this.y, r * 3.2, r * 0.8);
        }

        // Label
        if (showLabels) {
            p5.fill(255, 255, 255, 200);
            p5.textSize(11);
            p5.textAlign(p5.CENTER, p5.BOTTOM);
            p5.textStyle(p5.BOLD);
            p5.text(this.name, this.x, this.y - r - 6);
            p5.textSize(9);
            p5.fill(200, 200, 200, 150);
            p5.textStyle(p5.NORMAL);
            p5.text(`M:${this.mass.toFixed(0)}`, this.x, this.y - r - 20);
        }

        p5.pop();
    }

    drawOrbit(p5) {
        if (this.orbitHistory.length < 5) return;
        p5.push();
        p5.noFill();
        const [cr, cg, cb] = this.color;
        p5.stroke(cr, cg, cb, 50);
        p5.strokeWeight(0.8);
        p5.beginShape();
        const step = Math.max(1, Math.floor(this.orbitHistory.length / 100));
        for (let i = 0; i < this.orbitHistory.length; i += step) {
            const pt = this.orbitHistory[i];
            p5.vertex(pt.x, pt.y);
        }
        p5.endShape();
        p5.pop();
    }

    getDistanceTo(other) {
        return Math.sqrt((this.x - other.x) ** 2 + (this.y - other.y) ** 2);
    }

    getSpeed() {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }

    getKineticEnergy() {
        return 0.5 * this.mass * this.getSpeed() ** 2;
    }

    getPotentialEnergy(other) {
        const G = 0.5;
        const dist = this.getDistanceTo(other);
        if (dist < 0.1) return 0;
        return -G * this.mass * other.mass / dist;
    }

    toJSON() {
        return {
            name: this.name,
            mass: this.mass,
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            radius: this.radius,
            color: this.color,
            trail: this.trail
        };
    }

    static fromJSON(data) {
        return new Planet(data);
    }
}