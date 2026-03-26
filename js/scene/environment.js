// scene/environment.js - Scene Environment Objects

function createTable() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // 1. Base Dark Mahogany Background
    ctx.fillStyle = '#1c0b07';
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Wood Grain (Horizontal Streaks for texture)
    for (let i = 0; i < 400; i++) {
        const y = Math.random() * 1024;
        const height = 1 + Math.random() * 10;
        const val = Math.floor(20 + Math.random() * 30);
        // Varying reddish-brown streaks
        ctx.fillStyle = `rgba(${val + 25}, ${val + 5}, ${val}, 0.15)`;
        ctx.fillRect(0, y, 1024, height);
    }

    // 3. Fine Fibers (Wavy organic lines)
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#0a0402'; // Dark grain lines

    for (let y = 0; y < 1024; y += 6) {
        if (Math.random() > 0.6) continue; // Randomize spacing
        ctx.beginPath();
        let currentY = y;
        ctx.moveTo(0, currentY);
        for (let x = 0; x <= 1024; x += 30) {
            currentY += (Math.random() - 0.5) * 4; // Gentle wave
            ctx.lineTo(x, currentY);
        }
        ctx.stroke();
    }

    // 4. Subtle Mottling (Cloudy varnish unevenness)
    for (let i = 0; i < 60; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        const r = 80 + Math.random() * 150;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, 'rgba(60, 30, 20, 0.06)');
        grd.addColorStop(1, 'rgba(60, 30, 20, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    // 5. Heavy Vignette (For that focused, cinematic desk look)
    const vignette = ctx.createRadialGradient(512, 512, 300, 512, 512, 900);
    vignette.addColorStop(0, 'rgba(10, 5, 2, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1024, 1024);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const tableMat = new THREE.MeshPhysicalMaterial({
        map: tex,
        roughness: 0.25,
        clearcoat: 0.6,
        clearcoatRoughness: 0.15,
        reflectivity: 0.3,
        envMap: cubeRenderTarget.texture,
        color: 0xeeeeee
    });
    tableMesh = new THREE.Mesh(new THREE.BoxGeometry(40, 1.4, 12), tableMat);
    tableMesh.position.y = -0.7;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);
}

function createShelves() {
    shelfGroup = new THREE.Group();

    // Reuse table material for visual consistency, or create a new wood var
    const shelfMat = tableMesh.material;

    // Top Shelf (for Hourglass)
    const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 6), shelfMat);
    shelf1.position.set(0, 2.5, -2); // Positioned higher up
    shelf1.castShadow = true;
    shelf1.receiveShadow = true;
    shelfGroup.add(shelf1);

    // Bottom Shelf (for Clock)
    const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 6), shelfMat);
    shelf2.position.set(0, -2.5, -2); // Positioned lower down
    shelf2.castShadow = true;
    shelf2.receiveShadow = true;
    shelfGroup.add(shelf2);

    shelfGroup.visible = false; // Hidden by default
    scene.add(shelfGroup);
}

// Helper to build a 3-strand braid
function createBraidMesh(length, thickness, color) {
    const group = new THREE.Group();
    const ropeMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        metalness: 0.0
    });

    for (let i = 0; i < 3; i++) {
        const phase = (i / 3) * Math.PI * 2;

        class StrandCurve extends THREE.Curve {
            constructor(len) { super(); this.len = len; }
            getPoint(t) {
                const ty = -t * this.len;
                // Frequency relative to length (approx 5 twists per unit)
                const freq = this.len * 5.0;
                const amp = thickness * 1.5;
                const tx = Math.cos(t * freq + phase) * amp;
                const tz = Math.sin(t * freq + phase) * amp;
                return new THREE.Vector3(tx, ty, tz);
            }
        }

        const path = new StrandCurve(length);
        const strandGeo = new THREE.TubeGeometry(path, Math.floor(length * 20), thickness * 0.6, 6, false);
        group.add(new THREE.Mesh(strandGeo, ropeMat));
    }

    // Knot/Tassel
    const knotGeo = new THREE.SphereGeometry(thickness * 2.5, 16, 16);
    const knot = new THREE.Mesh(knotGeo, ropeMat);
    knot.position.y = -length;
    group.add(knot);

    return group;
}

function updateRopeLayout() {
    if (!curtainGroup || !camera) return;
    if (currentLayout !== 'mobile') return; // Only needed for mobile view

    // 1. Calculate Visible Frustum at Rope Plane (Z=14)
    // Camera is at Z=24, Y=3.5
    const dist = camera.position.z - 14; // 10 units
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const visibleHeight = 2 * Math.tan(vFOV / 2) * dist;
    const visibleWidth = visibleHeight * (window.innerWidth / window.innerHeight);

    // 2. Determine Geometry constraints
    // Ceiling (Top of screen) in World Space
    const ceilingY = camera.position.y + (visibleHeight / 2);

    // Desired Loop: 50% of screen height
    const targetLength = visibleHeight * 0.5;

    // Horizontal Spacing: 25% of width from center
    const xOffset = visibleWidth * 0.25;

    // 3. Remove Old Ropes
    if (leftString) curtainGroup.remove(leftString);
    if (rightString) curtainGroup.remove(rightString);

    // 4. Create New Ropes (Dynamic Length)
    leftString = createBraidMesh(targetLength, 0.04, 0xf0e6d2);
    leftString.position.set(-xOffset, ceilingY, 14);
    leftString.name = "leftString";

    rightString = createBraidMesh(targetLength, 0.04, 0xf0e6d2);
    rightString.position.set(xOffset, ceilingY, 14);
    rightString.name = "rightString";

    // 5. Add Interaction Hitboxes (Dynamic)
    const hitGeo = new THREE.CylinderGeometry(0.8, 0.8, targetLength, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    const leftHit = new THREE.Mesh(hitGeo, hitMat);
    leftHit.position.y = -targetLength / 2;
    leftHit.name = "leftStringHit";
    leftString.add(leftHit);

    const rightHit = new THREE.Mesh(hitGeo, hitMat);
    rightHit.position.y = -targetLength / 2;
    rightHit.name = "rightStringHit";
    rightString.add(rightHit);

    curtainGroup.add(leftString, rightString);
}

function createCurtainScene() {
    curtainGroup = new THREE.Group();

    // 1. Procedural Velvet Material
    const velvetMat = new THREE.MeshStandardMaterial({
        color: 0x4a0404, // Deep Maroon
        roughness: 0.6, // Slightly shinier to catch light
        metalness: 0.1,
        side: THREE.DoubleSide
    });

    // 2. Geometry with Folds
    const width = 14;
    const height = 24;
    const segs = 64;
    const geo = new THREE.PlaneGeometry(width, height, segs, 1);

    // Shift geometry so origin is at the TOP (for pendulum rotation)
    geo.translate(0, -height / 2, 0);

    const posAttr = geo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        // Sine wave displacement for folds
        const z = Math.sin(x * 1.5) * 0.8;
        posAttr.setZ(i, z);
    }
    geo.computeVertexNormals();

    // Pivot Point is Top Edge.
    const topY = 15.5;

    const leftC = new THREE.Mesh(geo, velvetMat);
    leftC.position.set(-width / 2, topY, 12);
    leftC.castShadow = true;
    leftC.receiveShadow = true;
    leftC.name = "curtainLeft";

    const rightC = new THREE.Mesh(geo, velvetMat);
    rightC.position.set(width / 2, topY, 12);
    rightC.castShadow = true;
    rightC.receiveShadow = true;
    rightC.name = "curtainRight";

    curtainGroup.add(leftC, rightC);

    // Ropes are now handled by updateRopeLayout()
    // We call it once to init specific to current view (if mobile)
    // Or if desktop, they will be created when switching to mobile.

    // 4. INTERIM SPOTLIGHT (Theatrical)
    const spot = new THREE.SpotLight(0xfffae6, 2.0);
    spot.position.set(0, 10, 25);
    spot.target = curtainGroup;
    spot.angle = 0.8;
    spot.penumbra = 0.5;
    spot.decay = 1;
    spot.distance = 50;
    spot.castShadow = true;
    spot.name = "curtainLight";
    curtainGroup.add(spot);

    curtainGroup.visible = false;
    scene.add(curtainGroup);

    // Initial call if appropriate
    updateRopeLayout();
}

function openCurtains(isFullScreen) {
    if (curtainOpen) return;
    curtainOpen = true;

    const duration = 2500;
    const start = performance.now();

    const leftC = curtainGroup.getObjectByName("curtainLeft");
    const rightC = curtainGroup.getObjectByName("curtainRight");
    const spot = curtainGroup.getObjectByName("curtainLight");

    const startLX = leftC.position.x;
    const startRX = rightC.position.x;
    const targetLX = startLX - 6; // Move wider
    const targetRX = startRX + 6;

    function animateCurtain(now) {
        let p = Math.min(1, (now - start) / duration);
        // Custom Ease: Start slow, fast middle, rubber band stop
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

        // 1. Slide
        leftC.position.x = startLX + (targetLX - startLX) * ease;
        rightC.position.x = startRX + (targetRX - startRX) * ease;

        // 2. Sway (Pendulum Rotation on Z)
        // Sine wave that dampens over time
        // Left rotates + (CW) to swing out, Right rotates - (CCW)
        const swayAmp = 0.15 * (1 - p); // Decay
        const swayFreq = 8;
        const swayVal = Math.sin(p * Math.PI * swayFreq) * swayAmp;

        leftC.rotation.z = swayVal;
        rightC.rotation.z = -swayVal;

        // 3. Fade out Strings & Light
        if (p > 0.1) {
            leftString.visible = false;
            rightString.visible = false;
        }
        if (spot) {
            spot.intensity = 2.0 * (1 - p);
        }

        const labels = document.getElementById('curtain-labels');
        if (labels) labels.style.opacity = 1 - p * 8;

        if (p < 1) {
            requestAnimationFrame(animateCurtain);
        } else {
            if (labels) labels.style.display = 'none';
            curtainGroup.visible = false;
        }
    }
    requestAnimationFrame(animateCurtain);

    if (isFullScreen) {
        toggleFullScreen();
    }
}
