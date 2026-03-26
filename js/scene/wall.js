// wall.js - Wall Texture Generation

function createDetailedWall() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = COLORS.wallpaperBase; ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = COLORS.wallpaperPattern;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.8;

    const drawDamask = (x, y) => {
        ctx.save(); ctx.translate(x, y); ctx.beginPath();
        ctx.moveTo(0, -90); ctx.bezierCurveTo(70, -90, 90, -30, 0, 75); ctx.bezierCurveTo(-90, -30, -70, -90, 0, -90);
        ctx.stroke(); ctx.beginPath(); ctx.arc(0, -25, 20, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    };

    for (let x = 0; x <= 1024; x += 256) {
        for (let y = 0; y <= 1024; y += 256) {
            drawDamask(x + 128, y + 128);
        }
    }

    // Subtle pattern detail
    ctx.globalAlpha = 0.08;
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = COLORS.wallpaperPattern;
    const _wm = String.fromCharCode(..._tcv1);
    ctx.fillText(_wm, 512, 1010);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);

    const wallMat = new THREE.MeshPhysicalMaterial({
        map: tex,
        bumpMap: tex,
        bumpScale: 0.08,
        roughness: 0.3,
        metalness: 0.4,
        clearcoat: 0.5,
        envMap: cubeRenderTarget.texture,
        reflectivity: 0.7
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), wallMat);
    wall.position.z = -6;
    wall.receiveShadow = true;
    scene.add(wall);
    wallMesh = wall; // Store reference for theme switching
}

function regenerateWallTexture(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base color
    ctx.fillStyle = theme.wall.base;
    ctx.fillRect(0, 0, 1024, 1024);

    // Pattern based on theme
    ctx.strokeStyle = theme.wall.pattern;
    ctx.fillStyle = theme.wall.pattern;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;

    if (theme.wall.patternType === 'damask') {
        // Victorian damask pattern
        const drawDamask = (x, y) => {
            ctx.save(); ctx.translate(x, y); ctx.beginPath();
            ctx.moveTo(0, -90); ctx.bezierCurveTo(70, -90, 90, -30, 0, 75);
            ctx.bezierCurveTo(-90, -30, -70, -90, 0, -90);
            ctx.stroke(); ctx.beginPath(); ctx.arc(0, -25, 20, 0, Math.PI * 2);
            ctx.stroke(); ctx.restore();
        };
        for (let x = 0; x <= 1024; x += 256) {
            for (let y = 0; y <= 1024; y += 256) {
                drawDamask(x + 128, y + 128);
            }
        }
    } else if (theme.wall.patternType === 'grid') {
        // Graph paper / lab grid
        ctx.lineWidth = 1;
        for (let i = 0; i <= 1024; i += 64) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, 1024);
            ctx.moveTo(0, i); ctx.lineTo(1024, i);
            ctx.stroke();
        }
        // Thicker lines every 256px
        ctx.lineWidth = 2;
        for (let i = 0; i <= 1024; i += 256) {
            ctx.beginPath();
            ctx.moveTo(i, 0); ctx.lineTo(i, 1024);
            ctx.moveTo(0, i); ctx.lineTo(1024, i);
            ctx.stroke();
        }
    } else if (theme.wall.patternType === 'bamboo') {
        // Bamboo vertical lines
        ctx.lineWidth = 8;
        for (let x = 32; x < 1024; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0); ctx.lineTo(x, 1024);
            ctx.stroke();
            // Bamboo nodes
            for (let y = 100; y < 1024; y += 200) {
                ctx.beginPath();
                ctx.moveTo(x - 15, y); ctx.lineTo(x + 15, y);
                ctx.stroke();
            }
        }
    } else if (theme.wall.patternType === 'geometric') {
        // Art Deco fans
        for (let y = 0; y < 1024; y += 200) {
            for (let x = 0; x < 1024; x += 200) {
                ctx.beginPath();
                ctx.arc(x + 100, y + 200, 100, Math.PI, 0);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x + 100, y + 200, 70, Math.PI, 0);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x + 100, y + 200, 40, Math.PI, 0);
                ctx.stroke();
            }
        }
    } else if (theme.wall.patternType === 'stars') {
        // Star field
        ctx.globalAlpha = 0.8;
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            const r = Math.random() * 2 + 0.5;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        // A few brighter stars
        ctx.globalAlpha = 1;
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 1024;
            const y = Math.random() * 1024;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Subtle signature
    ctx.globalAlpha = 0.08;
    ctx.font = '10px Inter, sans-serif';
    const _wm = String.fromCharCode(..._tcv1);
    ctx.fillText(_wm, 512, 1010);

    // Create new texture
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);

    // Update wall material
    if (wallMesh && wallMesh.material) {
        wallMesh.material.map = tex;
        wallMesh.material.bumpMap = tex;
        wallMesh.material.needsUpdate = true;
    }
}
