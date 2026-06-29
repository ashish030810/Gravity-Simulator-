// ============================================================
// PHYSICS ENGINE
// ============================================================

class PhysicsEngine {
    constructor() {
        this.G = 0.5;
        this.softening = 5;
        this.timeScale = 1;
        this.substeps = 2;
    }

    // Calculate gravitational forces for all bodies
    calculateForces(planets) {
        const n = planets.length;
        // Reset accelerations
        for (let i = 0; i < n; i++) {
            planets[i].ax = 0;
            planets[i].ay = 0;
        }

        // Calculate pairwise forces
        for (let i = 0; i < n; i++) {
            const p1 = planets[i];
            for (let j = i + 1; j < n; j++) {
                const p2 = planets[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distSq = dx * dx + dy * dy + this.softening;
                const dist = Math.sqrt(distSq);
                const force = this.G / distSq;

                const fx = force * dx / dist;
                const fy = force * dy / dist;

                p1.ax += p2.mass * fx;
                p1.ay += p2.mass * fy;
                p2.ax -= p1.mass * fx;
                p2.ay -= p1.mass * fy;
            }
        }
    }

    // Integrate positions using Verlet-like integration
    integrate(planets, dt) {
        for (const p of planets) {
            p.x += p.vx * dt + 0.5 * p.ax * dt * dt;
            p.y += p.vy * dt + 0.5 * p.ay * dt * dt;
            p.vx += p.ax * dt;
            p.vy += p.ay * dt;
        }
    }

    // Full physics step
    step(planets, dt) {
        const subDt = dt / this.substeps;
        for (let s = 0; s < this.substeps; s++) {
            this.calculateForces(planets);
            this.integrate(planets, subDt);
        }
    }

    // Handle collisions (merging)
    handleCollisions(planets) {
        let merged = false;
        for (let i = planets.length - 1; i >= 0; i--) {
            for (let j = i - 1; j >= 0; j--) {
                const p1 = planets[i];
                const p2 = planets[j];
                const dist = p1.getDistanceTo(p2);
                if (dist < p1.radius + p2.radius) {
                    this.mergeBodies(p1, p2);
                    planets.splice(j, 1);
                    merged = true;
                    break;
                }
            }
            if (merged) break;
        }
        return merged;
    }

    // Merge two bodies
    mergeBodies(a, b) {
        const totalMass = a.mass + b.mass;
        const aRatio = a.mass / totalMass;
        const bRatio = b.mass / totalMass;

        // Conservation of momentum
        const newX = a.x * aRatio + b.x * bRatio;
        const newY = a.y * aRatio + b.y * bRatio;
        const newVx = a.vx * aRatio + b.vx * bRatio;
        const newVy = a.vy * aRatio + b.vy * bRatio;

        // New radius based on mass
        const newRadius = Math.pow(totalMass, 0.4) * 1.5 + 2;

        // Average colors
        const newColor = [
            (a.color[0] + b.color[0]) / 2,
            (a.color[1] + b.color[1]) / 2,
            (a.color[2] + b.color[2]) / 2
        ];

        // Update a (keep it, remove b)
        a.mass = totalMass;
        a.x = newX;
        a.y = newY;
        a.vx = newVx;
        a.vy = newVy;
        a.radius = newRadius;
        a.color = newColor;
        a.name = a.name + '+' + b.name;
        a.orbitHistory = a.orbitHistory.concat(b.orbitHistory);
        if (a.orbitHistory.length > a.maxOrbitHistory) {
            a.orbitHistory = a.orbitHistory.slice(-a.maxOrbitHistory);
        }
        a.heat = Math.max(a.heat, b.heat);
    }

    // Calculate total energy of the system
    calculateEnergy(planets) {
        let kinetic = 0;
        let potential = 0;

        for (let i = 0; i < planets.length; i++) {
            const p = planets[i];
            kinetic += 0.5 * p.mass * p.getSpeed() ** 2;
            for (let j = i + 1; j < planets.length; j++) {
                potential += p.getPotentialEnergy(planets[j]);
            }
        }

        return { kinetic, potential, total: kinetic + potential };
    }

    // Get center of mass
    getCenterOfMass(planets) {
        let totalMass = 0;
        let cx = 0;
        let cy = 0;
        for (const p of planets) {
            totalMass += p.mass;
            cx += p.x * p.mass;
            cy += p.y * p.mass;
        }
        if (totalMass === 0) return { x: 0, y: 0 };
        return { x: cx / totalMass, y: cy / totalMass };
    }

    // Get total angular momentum
    getAngularMomentum(planets, center) {
        let L = 0;
        for (const p of planets) {
            const rx = p.x - center.x;
            const ry = p.y - center.y;
            L += p.mass * (rx * p.vy - ry * p.vx);
        }
        return L;
    }

    // Check if system is stable (rough estimate)
    isStable(planets) {
        if (planets.length < 2) return true;
        const energy = this.calculateEnergy(planets);
        // Check for large fluctuations
        return Math.abs(energy.total) > 0.01;
    }
}

// Global physics engine instance
const physics = new PhysicsEngine();