// main.js - Main Application Entry Point

const pStates = Array.from({ length: 6000 }, () => ({ y: -100, speed: 0.13 + Math.random() * 0.06, dir: { x: (Math.random() - 0.5), z: (Math.random() - 0.5) } }));

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0505);
    scene.fog = new THREE.Fog(0x1a0505, 12, 45);

    camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 16);

    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    document.body.appendChild(renderer.domElement);

    const renderScene = new THREE.RenderPass(scene, camera);

    const resolution = new THREE.Vector2(
        window.innerWidth * renderer.getPixelRatio(),
        window.innerHeight * renderer.getPixelRatio()
    );

    const bloomPass = new THREE.UnrealBloomPass(
        resolution,
        0.5,
        0.5,
        1.05
    );

    composer = new THREE.EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    composer.addPass(fxaaPass);

    cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
        format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter
    });
    cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
    scene.add(cubeCamera);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    const hemi = new THREE.HemisphereLight(0xffffff, 0x2e2525, 0.6);
    scene.add(hemi);
    ambientLight = hemi; // Store reference for theme switching

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(-30, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -200;
    dirLight.shadow.camera.right = 200;
    dirLight.shadow.camera.top = 200;
    dirLight.shadow.camera.bottom = -200;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.bias = -0.00005; // Slightly reduced bias for higher res
    dirLight.shadow.radius = 4;
    scene.add(dirLight);
    windowLight = dirLight; // Store reference for theme switching

    const wallWash = new THREE.SpotLight(0xffe0cc, 5.0);
    wallWash.position.set(0, 15, 6);
    wallWash.angle = Math.PI / 3.2;
    wallWash.penumbra = 0.5;
    wallWash.decay = 1.5;
    wallWash.distance = 35;
    const wallTarget = new THREE.Object3D();
    wallTarget.position.set(0, 4, -10);
    scene.add(wallTarget);
    wallWash.target = wallTarget;
    scene.add(wallWash);

    createSandTextureMaterial();
    createTable();
    createShelves(); // Initialize invisible shelves
    createCurtainScene(); // Initialize curtain (hidden by default)
    createHourglass();
    createSmartClock();
    createDustMotes();
    createDetailedWall();

    // Initial Layout Check
    updateLayoutLogic(true);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('mousedown', onMouseDown);
    requestAnimationFrame(animate);
}

function updateSand(dt) {
    if (isFlipping) {
        if (streamMesh) streamMesh.visible = false;
        return;
    }
    if (streamMesh) streamMesh.visible = true;

    // Update sand amounts based on timer running state
    // Guard clause for missing hourglass
    if (!hourglass) return;

    const isFlipped = Math.abs(Math.round(hourglass.rotation.z / Math.PI)) % 2 !== 0;

    if (isRunning && topSandAmount > 0) {
        // Calculate flow rate based on remaining time
        const flowRate = dt / totalTimeMs;
        const flowAmount = Math.min(topSandAmount, flowRate);
        topSandAmount -= flowAmount;
        bottomSandAmount += flowAmount;

        // Clamp values
        topSandAmount = Math.max(0, topSandAmount);
        bottomSandAmount = Math.min(1, bottomSandAmount);
    }

    const conf = THEMES[settings.theme];
    const bh = (conf && conf.bulbHeight) ? conf.bulbHeight : 4.8;
    const segments = (conf && conf.sandSegments) ? conf.sandSegments : 64;
    const pileMaxY = bh;

    const effectiveTop = Math.pow(topSandAmount, 0.75);
    const effectiveBottom = Math.pow(bottomSandAmount, 0.75);

    const topHeight = bh * effectiveTop;
    const bottomHeight = Math.max(0.02, bh * effectiveBottom);

    const glassRadiusAtY = (y) => getGlassRadiusForTheme(y, bh);

    // ---------- TOP SAND (draining) ----------
    const topProfile = [new THREE.Vector2(0, 0)];
    for (let i = 0; i <= 32; i++) {
        const h = (i / 32) * topHeight;
        const r = glassRadiusAtY(h);
        topProfile.push(new THREE.Vector2(r, h));
    }
    topProfile.push(new THREE.Vector2(0, topHeight));

    // ---------- BOTTOM HEAP (accumulating) ----------
    const heapProfile = [];
    const heapHeight = bottomHeight;
    const baseY = pileMaxY - heapHeight;

    const pileProgress = Math.min(1.0, effectiveBottom * 1.2);
    const angleReposeMax = 34;
    const angleReposeMin = 10;
    const angleEase = 1 - Math.pow(1 - pileProgress, 4);
    const currentAngleDeg = angleReposeMin + (angleReposeMax - angleReposeMin) * angleEase;
    const currentTan = Math.tan(THREE.MathUtils.degToRad(currentAngleDeg));

    const isFluid = (conf && conf.fluidSand);

    for (let i = 0; i <= 60; i++) {
        const h = (i / 60) * heapHeight;
        const y = baseY + h;
        const wallRadius = glassRadiusAtY(y);

        let r;
        if (isFluid) {
            // Fluid behavior: Fill strictly to the wall (level surface)
            // Use blend only very close to peak to prevent sharp artifact? No, exact matches desired.
            r = wallRadius;
            // Clamp top surface to be flat-ish? 
            // The heapHeight determines the level.
            // If we just use wallRadius, we fill the container up to heapHeight.
            // But Lathe geometry closes at top? 
            // heapProfile goes from bottom to top of heap.
            // At i=60 (top), r takes wallRadius.
            // Then we add point (0, pileMaxY) which is the very top tip? No, pileMaxY is container top.
            // Wait, heapProfile loop goes 0..60.
            // heapHeight is effective height of sand.
            // So at i=60, h = heapHeight. The sand surface is at baseY + heapHeight.
            // For a fluid, the surface should be flat radius at that height.
            // The next point (0, pileMaxY) closes the shape up to ceiling? No, that's likely artifact or drain stream connection?
            // The original code `heapProfile.push(new THREE.Vector2(0, pileMaxY));` implies a center spine up to top?
            // Actually, `topSand` drains DOWN. `bottomSand` accumulates UP.
            // `bottomSand` geometry is Lathe.
            // If i=60 is the surface, we want a flat top?
            // Lathe(points). If last point has R > 0, it's an open rim.
            // We need to close the top of the fluid.
            // So if isFluid, we should add a point (0, surfaceY) to close it flat.
        } else {
            const distFromPeak = h;
            const softness = 0.75;

            let naturalRadius = Math.pow(distFromPeak, softness) / currentTan;
            const linearRadius = distFromPeak / currentTan;
            const blend = Math.min(1.0, distFromPeak * 0.8);
            naturalRadius = (naturalRadius * (1 - blend)) + (linearRadius * blend);

            r = Math.min(naturalRadius, wallRadius);
        }

        heapProfile.push(new THREE.Vector2(r, y));
    }

    // Cap the pile
    if (isFluid) {
        // Flat top for fluid
        heapProfile.push(new THREE.Vector2(0, baseY + heapHeight));
    } else {
        heapProfile.push(new THREE.Vector2(0, pileMaxY));
    }

    // Apply geometries based on flip state
    if (topSand && bottomSand) {
        if (!isFlipped) {
            topSand.geometry.dispose();
            bottomSand.geometry.dispose();
            topSand.geometry = new THREE.LatheGeometry(topProfile, segments);
            bottomSand.geometry = new THREE.LatheGeometry(heapProfile, segments);
        } else {
            bottomSand.geometry.dispose();
            topSand.geometry.dispose();
            bottomSand.geometry = new THREE.LatheGeometry(topProfile, segments);
            topSand.geometry = new THREE.LatheGeometry(heapProfile, segments);
        }

        topSand.geometry.computeVertexNormals();
        bottomSand.geometry.computeVertexNormals();

        topSand.visible = topHeight > 0.01;
        bottomSand.visible = bottomHeight > 0.01;
    }

    // ---------- STREAM PARTICLES ----------
    const startY = isFlipped ? -0.1 : 0.1;
    const grav = isFlipped ? 1 : -1;
    const targetY = isFlipped
        ? pileMaxY - bottomHeight + 0.15
        : -(pileMaxY - bottomHeight) - 0.15;

    // Reduced particle count for performance (3000 instead of 6000)
    if (streamMesh) {
        for (let i = 0; i < 3000; i++) {
            const p = pStates[i];

            if (!isRunning || topSandAmount <= 0) {
                p.y = -100;
            } else {
                if (p.y === -100) {
                    p.y = startY + Math.random() * (targetY - startY);
                }
                p.y += grav * p.speed;

                if ((grav === -1 && p.y < targetY) || (grav === 1 && p.y > targetY)) {
                    p.y = startY;
                }
            }

            const spread = 0.02 + Math.abs(p.y - startY) * 0.08;
            const m = new THREE.Matrix4();
            m.setPosition(
                p.dir.x * spread,
                p.y,
                p.dir.z * spread
            );
            streamMesh.setMatrixAt(i, m);
        }
        streamMesh.instanceMatrix.needsUpdate = true;
    }
}

function animate(t) {
    if (!lastTimestamp) lastTimestamp = t;
    const dt = t - lastTimestamp;
    lastTimestamp = t;

    if (isRunning && timerMs > 0) {
        timerMs -= dt;
        if (timerMs <= 0) {
            timerMs = 0; isRunning = false;
            sessionCount++; mode = mode === 'work' ? 'break' : 'work';
            timerMs = (mode === 'work' ? 25 : 5) * 60 * 1000;
            totalTimeMs = timerMs;
            flipHourglass();
        }
    }

    if (currentLayout === 'desktop' && !isTransitioning) {
        // Subtle Camera Float
        const time = t * 0.0002;
        camera.position.x = Math.sin(time) * 0.3;
        camera.position.y = 5 + Math.cos(time * 0.5) * 0.1;
        camera.lookAt(0, 1.8, 0);
    } else if (currentLayout === 'mobile' && !isTransitioning) {
        // Slower float for mobile
        const time = t * 0.00015;
        camera.position.x = Math.sin(time) * 0.1;
        // Look closer to center of shelves?
        camera.lookAt(0, 3.5, 0);
    }

    // Throttle CubeCamera updates to every 10 frames for performance
    frameCount++;
    if (frameCount % 10 === 0) {
        if (hourglass) hourglass.visible = false;
        if (clock) clock.visible = false;
        cubeCamera.update(renderer, scene);
        if (hourglass) hourglass.visible = true;
        if (clock) clock.visible = true;
    }

    updateSand(dt);
    updateSmartScreen();
    _urb();
    composer.render();
    requestAnimationFrame(animate);
}

function onWindowResize() {
    updateLayoutLogic();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = renderer.getPixelRatio();

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateRopeLayout();

    if (fxaaPass) {
        fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
        fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
    }
}

window.onload = () => { init(); setTimeout(_irb, 100); _mfs(); loadSettings(); };
