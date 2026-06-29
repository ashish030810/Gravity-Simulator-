// ============================================================
// PRESET DEFINITIONS
// ============================================================

const PRESETS = {
    solar: () => {
        return [
            { name: 'Sun', mass: 1000, x: 0, y: 0, vx: 0, vy: 0, radius: 28, color: [255, 200, 50] },
            { name: 'Mercury', mass: 1, x: 70, y: 0, vx: 0, vy: 3.8, radius: 4, color: [180, 160, 140] },
            { name: 'Venus', mass: 3, x: 120, y: 0, vx: 0, vy: 3.0, radius: 6, color: [240, 200, 150] },
            { name: 'Earth', mass: 4, x: 170, y: 0, vx: 0, vy: 2.6, radius: 7, color: [80, 180, 255] },
            { name: 'Mars', mass: 2, x: 230, y: 0, vx: 0, vy: 2.2, radius: 5, color: [200, 100, 50] },
            { name: 'Jupiter', mass: 30, x: 310, y: 0, vx: 0, vy: 1.7, radius: 14, color: [220, 180, 120] },
            { name: 'Saturn', mass: 20, x: 410, y: 0, vx: 0, vy: 1.4, radius: 12, color: [200, 180, 100] },
            { name: 'Uranus', mass: 15, x: 500, y: 0, vx: 0, vy: 1.2, radius: 10, color: [150, 220, 220] },
            { name: 'Neptune', mass: 18, x: 580, y: 0, vx: 0, vy: 1.0, radius: 11, color: [80, 100, 200] },
        ];
    },

    binary: () => {
        return [
            { name: 'Alpha', mass: 800, x: -120, y: 0, vx: 0, vy: -1.6, radius: 24, color: [255, 180, 80] },
            { name: 'Beta', mass: 800, x: 120, y: 0, vx: 0, vy: 1.6, radius: 24, color: [150, 200, 255] },
            { name: 'Proxima', mass: 8, x: 0, y: 140, vx: 2.8, vy: 0, radius: 7, color: [100, 255, 150] },
            { name: 'Centauri', mass: 5, x: 0, y: -200, vx: -2.4, vy: 0, radius: 6, color: [255, 100, 200] },
            { name: 'Orbit 1', mass: 3, x: -180, y: 80, vx: 1.2, vy: 2.0, radius: 5, color: [255, 200, 150] },
            { name: 'Orbit 2', mass: 3, x: 180, y: -80, vx: -1.2, vy: -2.0, radius: 5, color: [150, 200, 255] },
        ];
    },

    galaxy: () => {
        const pts = [];
        // Spiral arms
        const arms = 3;
        const starsPerArm = 35;
        for (let a = 0; a < arms; a++) {
            const armAngle = (a / arms) * Math.PI * 2;
            for (let i = 0; i < starsPerArm; i++) {
                const t = i / starsPerArm;
                const dist = 60 + t * 380;
                const angle = armAngle + t * 4.5 + (Math.random() - 0.5) * 0.4;
                const speed = Math.sqrt(3000 / dist) * (0.7 + Math.random() * 0.6);
                pts.push({
                    name: `Star${i + a * starsPerArm}`,
                    mass: 0.3 + Math.random() * 3,
                    x: Math.cos(angle) * dist + (Math.random() - 0.5) * 15,
                    y: Math.sin(angle) * dist + (Math.random() - 0.5) * 15,
                    vx: -Math.sin(angle) * speed + (Math.random() - 0.5) * 0.2,
                    vy: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.2,
                    radius: 1.5 + Math.random() * 3.5,
                    color: [
                        150 + Math.random() * 105,
                        100 + Math.random() * 155,
                        100 + Math.random() * 155
                    ]
                });
            }
        }
        // Central bulge
        for (let i = 0; i < 40; i++) {
            const dist = Math.random() * 80;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.sqrt(3000 / (dist + 10)) * 0.7;
            pts.push({
                name: `Core${i}`,
                mass: 0.3 + Math.random() * 2,
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                vx: -Math.sin(angle) * speed + (Math.random() - 0.5) * 0.2,
                vy: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.2,
                radius: 1 + Math.random() * 2.5,
                color: [255, 220 + Math.random() * 35, 180 + Math.random() * 50]
            });
        }
        // Supermassive center
        pts.push({
            name: 'Sagittarius A*',
            mass: 5000,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            radius: 32,
            color: [255, 220, 100]
        });
        return pts;
    },

    ring: () => {
        const pts = [];
        pts.push({
            name: 'Ring Star',
            mass: 1500,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            radius: 30,
            color: [255, 230, 80]
        });
        const ringCount = 80;
        for (let i = 0; i < ringCount; i++) {
            const angle = (i / ringCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.03;
            const dist = 180 + (Math.random() - 0.5) * 40;
            const speed = Math.sqrt(1500 / dist) * 1.05;
            const mass = 0.2 + Math.random() * 1.5;
            pts.push({
                name: `Ring${i}`,
                mass: mass,
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                vx: -Math.sin(angle) * speed + (Math.random() - 0.5) * 0.05,
                vy: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.05,
                radius: 1.5 + Math.random() * 3,
                color: [
                    150 + Math.random() * 105,
                    100 + Math.random() * 100,
                    150 + Math.random() * 105
                ]
            });
        }
        // Inner ring
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
            const dist = 80 + Math.random() * 40;
            const speed = Math.sqrt(1500 / dist) * 1.1;
            pts.push({
                name: `Inner${i}`,
                mass: 0.5 + Math.random() * 2,
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                vx: -Math.sin(angle) * speed,
                vy: Math.cos(angle) * speed,
                radius: 2 + Math.random() * 3,
                color: [255, 200 + Math.random() * 55, 150 + Math.random() * 50]
            });
        }
        return pts;
    },

    blackhole: () => {
        const pts = [];
        pts.push({
            name: 'Black Hole',
            mass: 8000,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            radius: 40,
            color: [30, 30, 60]
        });
        // Accretion disk
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 350;
            const speed = Math.sqrt(8000 / dist) * (0.7 + Math.random() * 0.6);
            const mass = 0.2 + Math.random() * 3;
            pts.push({
                name: `Acc${i}`,
                mass: mass,
                x: Math.cos(angle) * dist + (Math.random() - 0.5) * 8,
                y: Math.sin(angle) * dist + (Math.random() - 0.5) * 8,
                vx: -Math.sin(angle) * speed + (Math.random() - 0.5) * 0.3,
                vy: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.3,
                radius: 1.5 + Math.random() * 4,
                color: [
                    200 + Math.random() * 55,
                    100 + Math.random() * 100,
                    50 + Math.random() * 100
                ]
            });
        }
        // Event horizon particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 30;
            const speed = Math.sqrt(8000 / dist) * 1.5;
            pts.push({
                name: `Horizon${i}`,
                mass: 0.5 + Math.random() * 1.5,
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                vx: -Math.sin(angle) * speed,
                vy: Math.cos(angle) * speed,
                radius: 1 + Math.random() * 2,
                color: [200 + Math.random() * 55, 50 + Math.random() * 50, 50 + Math.random() * 50]
            });
        }
        return pts;
    },

    chaos: () => {
        const pts = [];
        const count = 60;
        // Create a chaotic system with multiple massive bodies
        const bigMasses = [200, 150, 180, 100, 120];
        for (let i = 0; i < bigMasses.length; i++) {
            const angle = (i / bigMasses.length) * Math.PI * 2 + Math.random() * 0.3;
            const dist = 50 + Math.random() * 100;
            const mass = bigMasses[i];
            pts.push({
                name: `Giant${i}`,
                mass: mass,
                x: Math.cos(angle) * dist + (Math.random() - 0.5) * 20,
                y: Math.sin(angle) * dist + (Math.random() - 0.5) * 20,
                vx: -Math.sin(angle) * 1.5 + (Math.random() - 0.5) * 0.5,
                vy: Math.cos(angle) * 1.5 + (Math.random() - 0.5) * 0.5,
                radius: Math.pow(mass, 0.4) * 1.2 + 4,
                color: [
                    150 + Math.random() * 105,
                    80 + Math.random() * 100,
                    150 + Math.random() * 105
                ]
            });
        }
        // Smaller chaotic bodies
        for (let i = 0; i < count - bigMasses.length; i++) {
            const mass = 0.5 + Math.random() * 15;
            pts.push({
                name: `Chaos${i}`,
                mass: mass,
                x: (Math.random() - 0.5) * 500,
                y: (Math.random() - 0.5) * 500,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: Math.pow(mass, 0.4) * 1.2 + 1.5,
                color: [
                    100 + Math.random() * 155,
                    50 + Math.random() * 150,
                    100 + Math.random() * 155
                ]
            });
        }
        return pts;
    }
};

// Helper function to load a preset
function loadPreset(name, planetClass) {
    const data = PRESETS[name]();
    return data.map(d => new planetClass(d));
}