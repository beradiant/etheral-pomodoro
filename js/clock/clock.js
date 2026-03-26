// clock/clock.js - Clock Models and Logic

function createSmartClock() {
    createClockForTheme(settings.theme);
}

function createClockForTheme(themeName) {
    switch (themeName) {
        case 'midnight': createClockMidnight(); break;
        case 'zen': createClockZen(); break;
        case 'deco': createClockDeco(); break;
        case 'space': createClockSpace(); break;
        default: createClockRoyal(); break;
    }
}

function switchClock(themeName) {
    // Remove old clock
    if (clock) {
        scene.remove(clock);
        clock.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }

    // Create new clock
    createClockForTheme(themeName);
}

function createClockScreen() {
    // Create shared screen canvas and texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 640;
    screenContext = canvas.getContext('2d');

    screenTexture = new THREE.CanvasTexture(canvas);
    screenTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    return new THREE.MeshBasicMaterial({ map: screenTexture });
}

// Royal Study - Classic VFD display
function createClockRoyal() {
    clock = new THREE.Group();
    const theme = THEMES.royal;

    // Housing
    const bodyMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.mahogany, metalness: 0.6, roughness: 0.3,
        clearcoat: 0.5, envMap: cubeRenderTarget.texture
    });
    const housing = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 1.5), bodyMat);
    housing.position.y = 0.5;
    housing.castShadow = true;
    housing.receiveShadow = true;
    clock.add(housing);

    // Brass trim
    const trimMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.brass, metalness: 1.0, roughness: 0.1
    });
    const topTrim = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.1, 1.6), trimMat);
    topTrim.position.y = 2.1;
    clock.add(topTrim);
    const botTrim = topTrim.clone();
    botTrim.position.y = -1.1;
    clock.add(botTrim);

    // Screen
    const screenMat = createClockScreen();
    const screenGeo = new THREE.PlaneGeometry(4.4, 2.8);
    screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.5, 0.76);
    clock.add(screenMesh);

    // Glass Cover
    addClockGlass(clock);

    positionClockForLayout();
    scene.add(clock);
}

// Midnight Lab - Sleek LCD with physical buttons
function createClockMidnight() {
    clock = new THREE.Group();
    const theme = THEMES.midnight;

    // Sleek black housing
    const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a12, metalness: 0.8, roughness: 0.1,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture
    });
    const housing = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.0, 0.8), bodyMat);
    housing.position.y = 0.5;
    housing.castShadow = true;
    clock.add(housing);

    // Cyan LED edge glow
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x4fd1c5, transparent: true, opacity: 0.8 });
    const edgeGeo = new THREE.BoxGeometry(5.1, 0.05, 0.85);
    const topGlow = new THREE.Mesh(edgeGeo, glowMat);
    topGlow.position.y = 2.0;
    clock.add(topGlow);
    const botGlow = topGlow.clone();
    botGlow.position.y = -1.0;
    clock.add(botGlow);

    // Physical buttons below screen
    const btnMat = new THREE.MeshPhysicalMaterial({
        color: 0x2a2a3a, metalness: 0.5, roughness: 0.3
    });
    for (let i = 0; i < 3; i++) {
        const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16), btnMat);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(-1.5 + i * 1.5, -0.8, 0.5);
        clock.add(btn);
    }

    // Screen
    const screenMat = createClockScreen();
    screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.4), screenMat);
    screenMesh.position.set(0, 0.7, 0.41);
    clock.add(screenMesh);

    addClockGlass(clock);

    positionClockForLayout();
    scene.add(clock);
}

// Zen Garden - Wooden frame, minimal
function createClockZen() {
    clock = new THREE.Group();
    const theme = THEMES.zen;

    // Wooden frame
    const woodMat = new THREE.MeshStandardMaterial({
        color: theme.colors.brass, metalness: 0.0, roughness: 0.8
    });

    // Frame border (thick wood)
    const frameGeo = new THREE.BoxGeometry(5.2, 3.4, 1.2);
    const frame = new THREE.Mesh(frameGeo, woodMat);
    frame.position.y = 0.5;
    clock.add(frame);

    // Screen inset (carved out area)
    const insetMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a, metalness: 0.0, roughness: 1.0
    });
    const inset = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.6, 0.5), insetMat);
    inset.position.set(0, 0.5, 0.4);
    clock.add(inset);

    // Screen
    const screenMat = createClockScreen();
    screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.4), screenMat);
    screenMesh.position.set(0, 0.5, 0.66);
    clock.add(screenMesh);

    // Wooden feet
    const footGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.3, 8);
    const leftFoot = new THREE.Mesh(footGeo, woodMat);
    leftFoot.position.set(-2, -1.2, 0);
    clock.add(leftFoot);
    const rightFoot = leftFoot.clone();
    rightFoot.position.x = 2;
    clock.add(rightFoot);

    positionClockForLayout();
    scene.add(clock);
}

// Art Deco - Gold ornate frame
function createClockDeco() {
    clock = new THREE.Group();
    const theme = THEMES.deco;

    // Main housing (emerald green)
    const bodyMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.mahogany, metalness: 0.3, roughness: 0.2,
        clearcoat: 1.0
    });
    const housing = new THREE.Mesh(new THREE.BoxGeometry(5.0, 3.2, 1.0), bodyMat);
    housing.position.y = 0.5;
    clock.add(housing);

    // Gold frame trim
    const goldMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.brass, metalness: 1.0, roughness: 0.05,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture
    });

    // Decorative corners
    for (let i = 0; i < 4; i++) {
        const cornerX = (i % 2 === 0 ? -1 : 1) * 2.3;
        const cornerY = (i < 2 ? 1 : -1) * 1.4 + 0.5;
        const corner = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), goldMat);
        corner.position.set(cornerX, cornerY, 0.5);
        clock.add(corner);
    }

    // Top sunburst decoration
    for (let i = 0; i < 7; i++) {
        const ray = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4 - Math.abs(i - 3) * 0.08, 0.1), goldMat);
        ray.position.set(-0.9 + i * 0.3, 2.3, 0.5);
        clock.add(ray);
    }

    // Screen
    const screenMat = createClockScreen();
    screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.6), screenMat);
    screenMesh.position.set(0, 0.5, 0.51);
    clock.add(screenMesh);

    addClockGlass(clock);

    positionClockForLayout();
    scene.add(clock);
}

// Space Station - Floating holographic
function createClockSpace() {
    clock = new THREE.Group();
    const theme = THEMES.space;

    // Minimal floating platform
    const platMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.brass, metalness: 1.0, roughness: 0.0,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture
    });
    const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 0.2, 32), platMat);
    platform.position.y = -0.8;
    clock.add(platform);

    // Holographic projection rings
    const ringMat = new THREE.MeshBasicMaterial({
        color: 0xaa88ff, transparent: true, opacity: 0.4
    });
    for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8 + i * 0.3, 0.02, 8, 32), ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.5 + i * 0.15;
        clock.add(ring);
    }

    // Screen (floating in center)
    const screenMat = createClockScreen();
    screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.5), screenMat);
    screenMesh.position.set(0, 0.8, 0.1);
    clock.add(screenMesh);

    // No glass - holographic look

    positionClockForLayout();
    scene.add(clock);
}

function addClockGlass(clockGroup) {
    const glassGeo = new THREE.PlaneGeometry(4.4, 2.8);
    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, transmission: 0.95, opacity: 0, transparent: true,
        roughness: 0.0, metalness: 0.1, clearcoat: 1.0, reflectivity: 1.0,
        envMap: cubeRenderTarget.texture, envMapIntensity: 1.5
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 0.5, 0.8);
    clockGroup.add(glass);
}

// Helper to position clock based on current layout
function positionClockForLayout() {
    if (currentLayout === 'mobile') {
        // Shelf layout - centered, on bottom shelf
        clock.position.set(0, -1.3, -2);
        clock.rotation.set(0, 0, 0); // Face forward
        clock.scale.set(0.9, 0.9, 0.9);
    } else {
        // Desktop layout - left side, angled toward viewer
        clock.position.set(-2.8, 0.8, 4);
        clock.rotation.set(-0.15, 0.2, 0);
        clock.scale.set(0.85, 0.85, 0.85);
    }
}

function updateSmartScreen() {
    if (!screenContext) return;
    const ctx = screenContext;
    const width = 1024;
    const height = 640;

    // Background
    ctx.fillStyle = COLORS.screenBg;
    ctx.fillRect(0, 0, width, height);

    // Subtle Scanlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < height; i += 4) ctx.fillRect(0, i, width, 1);

    const totalSeconds = Math.ceil(timerMs / 1000);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;

    // Animation Logic
    if (sec !== prevSeconds) {
        digitOffset = 1;
        prevSeconds = sec;
    }
    digitOffset += (0 - digitOffset) * 0.15;

    // --- TIME DISPLAY ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Minutes (Static) - Shifted Left
    ctx.font = '700 240px "Inter", monospace';
    ctx.fillStyle = COLORS.screenText;
    ctx.fillText(min.toString().padStart(2, '0') + ":", width / 2 - 200, height / 2 - 40);

    // Seconds (Animated Slide) - Shifted Right
    const secStr = sec.toString().padStart(2, '0');

    const yBase = height / 2 - 40;
    const yOffset = digitOffset * 100; // Slide distance
    const alphaMain = 1 - Math.abs(digitOffset);

    ctx.globalAlpha = alphaMain;
    ctx.fillText(secStr, width / 2 + 200, yBase + yOffset);

    ctx.globalAlpha = 1.0;

    // --- UI BUTTONS (Bottom Bar) ---
    const btnY = height - 100;
    const btnW = 240;

    drawVirtualButton(ctx, width / 2 - 300, btnY, btnW, isRunning ? "PAUSE" : "START", COLORS.screenDim);
    drawVirtualButton(ctx, width / 2, btnY, btnW, mode.toUpperCase(), COLORS.screenDim);
    drawVirtualButton(ctx, width / 2 + 300, btnY, btnW, "RESET", COLORS.screenDim);

    // Header / Status
    ctx.font = '500 30px "Inter", sans-serif';
    ctx.fillStyle = COLORS.screenDim;
    ctx.letterSpacing = "4px";
    // Special display sync (shows every 40 seconds for 2 seconds)
    const _ds = (sec >= 40 && sec <= 41);
    if (_ds) {
        ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.fillText(String.fromCharCode(..._rcs), width / 2, 80);
    } else {
        ctx.fillText(isRunning ? "FLOW STATE ACTIVE" : "READY", width / 2, 80);
    }

    // --- INFO BUTTON (Top Right) ---
    const infoX = width - 70;
    const infoY = 70;
    const infoR = 30;

    ctx.beginPath();
    ctx.arc(infoX, infoY, infoR, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.screenDim;
    ctx.stroke();

    ctx.font = '700 36px "Inter", serif';
    ctx.fillStyle = COLORS.screenDim;
    ctx.fillText("i", infoX, infoY + 2); // Optical center adjustment

    // --- SETTINGS BUTTON (Top Left) ---
    const settingsX = 70;
    const settingsY = 70;
    const settingsR = 30;

    ctx.beginPath();
    ctx.arc(settingsX, settingsY, settingsR, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.screenDim;
    ctx.stroke();

    // Draw gear icon
    ctx.font = '700 32px "Inter", serif';
    ctx.fillStyle = COLORS.screenDim;
    ctx.fillText("⚙", settingsX, settingsY + 3);

    ctx.letterSpacing = "0px";

    screenTexture.needsUpdate = true;
}

function drawVirtualButton(ctx, x, y, w, text, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(x - w / 2, y - 40, w, 80);

    ctx.fillStyle = color;
    ctx.font = '600 32px "Inter", sans-serif';
    ctx.fillText(text, x, y);
}
