// hourglass/hourglass.js - Hourglass Models and Logic

function createHourglass() {
    createHourglassForTheme(settings.theme);
}

function createHourglassForTheme(themeName) {
    switch (themeName) {
        case 'midnight': createHourglassMidnight(); break;
        case 'zen': createHourglassZen(); break;
        case 'deco': createHourglassDeco(); break;
        case 'space': createHourglassSpace(); break;
        default: createHourglassRoyal(); break;
    }
}

function switchHourglass(themeName) {
    const currentTopSand = topSandAmount;
    const currentBottomSand = bottomSandAmount;

    if (hourglass) {
        scene.remove(hourglass);
        hourglass.traverse((child) => {
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

    createHourglassForTheme(themeName);

    topSandAmount = currentTopSand;
    bottomSandAmount = currentBottomSand;
}

function positionHourglassForLayout() {
    const themeConf = THEMES[settings.theme];
    let yPos;

    if (currentLayout === 'mobile') {
        const modelHeight = (themeConf && themeConf.modelHeight) ? themeConf.modelHeight : 10.2;
        const scale = 0.55;
        const halfHeight = (modelHeight * scale) / 2;
        yPos = 2.7 + halfHeight;

        hourglass.position.set(0, yPos, -2);
        hourglass.scale.set(scale, scale, scale);
    } else {
        const modelHeight = (themeConf && themeConf.modelHeight) ? themeConf.modelHeight : 10.2;
        const scale = 0.45;
        const halfHeight = (modelHeight * scale) / 2;
        yPos = 0.0 + halfHeight;

        hourglass.position.set(2.8, yPos, 3.5);
        hourglass.scale.set(scale, scale, scale);
    }
}

function addSandToHourglass() {
    const conf = THEMES[settings.theme];
    const segments = (conf && conf.sandSegments) ? conf.sandSegments : 64;

    const dP = [new THREE.Vector2(0, 0), new THREE.Vector2(0.1, 0)];

    // Use segments from config to match Faceted/Smooth glass
    topSand = new THREE.Mesh(new THREE.LatheGeometry(dP, segments), sandMaterial);
    bottomSand = new THREE.Mesh(new THREE.LatheGeometry(dP, segments), sandMaterial);

    topSand.position.y = 0.1; bottomSand.position.y = -0.1; bottomSand.rotation.x = Math.PI;
    topSand.castShadow = bottomSand.castShadow = true;
    hourglass.add(topSand, bottomSand);

    streamMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.003, 3, 3), sandMaterial, 8000);
    streamMesh.castShadow = true;
    hourglass.add(streamMesh);
}

// Royal Study - Classic brass oval
function createHourglassRoyal() {
    hourglass = new THREE.Group();
    const theme = THEMES.royal;

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.glass, transmission: 1.0, thickness: 1.5, ior: 1.45,
        roughness: 0.05, transparent: true, side: THREE.DoubleSide,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture, envMapIntensity: 2.0
    });

    const pts = [];
    for (let i = 0; i <= 60; i++) {
        pts.push(new THREE.Vector2(getBulbRadius(i / 60), (i / 60) * 4.8));
    }

    const bG = new THREE.LatheGeometry(pts, 64);
    const tB = new THREE.Mesh(bG, glassMat); tB.position.y = 0.1;
    const bB = new THREE.Mesh(bG, glassMat); bB.rotation.x = Math.PI; bB.position.y = -0.1;
    tB.castShadow = bB.castShadow = true;
    hourglass.add(tB, bB);

    const frameMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.brass, metalness: 1.0, roughness: 0.1,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture, reflectivity: 1.0
    });

    const cap = new THREE.CylinderGeometry(2.8, 2.8, 0.15, 64);
    const tC = new THREE.Mesh(cap, frameMat); tC.position.y = 5.0;
    const bC = new THREE.Mesh(cap, frameMat); bC.position.y = -5.0;
    tC.castShadow = bC.castShadow = true;
    hourglass.add(tC, bC);

    for (let i = 0; i < 3; i++) {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 10.2, 16), frameMat);
        const ang = (i / 3) * Math.PI * 2;
        rod.position.set(Math.cos(ang) * 2.5, 0, Math.sin(ang) * 2.5);
        rod.castShadow = true;
        hourglass.add(rod);
    }

    addSandToHourglass();
    positionHourglassForLayout();
    scene.add(hourglass);
}

// Midnight Lab - Hexagonal Prism
function createHourglassMidnight() {
    hourglass = new THREE.Group();
    const theme = THEMES.midnight;

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.glass, transmission: 0.95, thickness: 1.2,
        ior: 1.5, roughness: 0.02, transparent: true, side: THREE.DoubleSide,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture
    });

    const hexGeo = new THREE.CylinderGeometry(1.8, 1.8, 4.0, 6);

    const tB = new THREE.Mesh(hexGeo, glassMat);
    tB.position.y = 2.5;

    const bB = new THREE.Mesh(hexGeo, glassMat);
    bB.position.y = -2.5;

    tB.castShadow = bB.castShadow = true;
    hourglass.add(tB, bB);

    const hexConn = new THREE.CylinderGeometry(1.8, 1.8, 1.0, 6);
    const connMesh = new THREE.Mesh(hexConn, glassMat);
    connMesh.scale.set(0.3, 1, 0.3);
    hourglass.add(connMesh);

    const frameMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.brass, metalness: 0.9, roughness: 0.2,
        envMap: cubeRenderTarget.texture
    });

    const capGeom = new THREE.CylinderGeometry(2.2, 2.2, 0.2, 6);
    const tC = new THREE.Mesh(capGeom, frameMat); tC.position.y = 4.8;
    const bC = new THREE.Mesh(capGeom, frameMat); bC.position.y = -4.8;
    hourglass.add(tC, bC);

    for (let i = 0; i < 6; i++) {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 9.6, 8), frameMat);
        const ang = (i / 6) * Math.PI * 2;
        rod.position.set(Math.cos(ang) * 2.0, 0, Math.sin(ang) * 2.0);
        hourglass.add(rod);
    }

    const ledMat = new THREE.MeshBasicMaterial({ color: 0x4fd1c5, transparent: true, opacity: 0.8 });
    const ledRing = new THREE.TorusGeometry(2.3, 0.05, 6, 32);
    const topLed = new THREE.Mesh(ledRing, ledMat); topLed.rotation.x = Math.PI / 2; topLed.position.y = 4.6;
    const botLed = new THREE.Mesh(ledRing, ledMat); botLed.rotation.x = Math.PI / 2; botLed.position.y = -4.6;
    hourglass.add(topLed, botLed);

    addSandToHourglass();
    positionHourglassForLayout();
    scene.add(hourglass);
}

// Zen Garden - Spherical
function createHourglassZen() {
    hourglass = new THREE.Group();
    const theme = THEMES.zen;

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.glass, transmission: 1.0, thickness: 1.5,
        ior: 1.4, roughness: 0.1, transparent: true, side: THREE.DoubleSide,
        clearcoat: 0.5, envMap: cubeRenderTarget.texture
    });

    const sphereGeom = new THREE.SphereGeometry(2, 32, 32);
    const tB = new THREE.Mesh(sphereGeom, glassMat); tB.position.y = 2.5;
    const bB = new THREE.Mesh(sphereGeom, glassMat); bB.position.y = -2.5;
    tB.castShadow = bB.castShadow = true;
    hourglass.add(tB, bB);

    const neckGeom = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
    const neckMesh = new THREE.Mesh(neckGeom, glassMat);
    hourglass.add(neckMesh);

    const woodMat = new THREE.MeshStandardMaterial({
        color: theme.colors.brass, roughness: 0.7, metalness: 0.0
    });

    const ringGeom = new THREE.TorusGeometry(2.2, 0.15, 8, 32);
    const topRing = new THREE.Mesh(ringGeom, woodMat); topRing.rotation.x = Math.PI / 2; topRing.position.y = 4.5;
    const botRing = new THREE.Mesh(ringGeom, woodMat); botRing.rotation.x = Math.PI / 2; botRing.position.y = -4.5;
    hourglass.add(topRing, botRing);

    for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const x = Math.cos(ang) * 2.2;
        const z = Math.sin(ang) * 2.2;

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 9, 8), woodMat);
        post.position.set(x, 0, z);
        hourglass.add(post);

        for (let j = -3; j <= 3; j += 2) {
            const bead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), woodMat);
            bead.position.set(x, j, z);
            hourglass.add(bead);
        }
    }

    addSandToHourglass();
    positionHourglassForLayout();
    scene.add(hourglass);
}

// Art Deco - Pentagonal Crystal Pyramids
function createHourglassDeco() {
    hourglass = new THREE.Group();
    const theme = THEMES.deco;

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.glass, transmission: 0.9, thickness: 2,
        ior: 1.6, roughness: 0.0, transparent: true, side: THREE.DoubleSide,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture, envMapIntensity: 3.0
    });

    // Height increased to 4.2 to close gap with cap/neck
    const pyrGeom = new THREE.CylinderGeometry(2.2, 0.2, 4.2, 5);
    const pyrGeomBot = new THREE.CylinderGeometry(0.2, 2.2, 4.2, 5);

    const tB = new THREE.Mesh(pyrGeom, glassMat);
    tB.position.y = 2.6;

    const bB = new THREE.Mesh(pyrGeomBot, glassMat);
    bB.position.y = -2.6;

    tB.castShadow = bB.castShadow = true;
    hourglass.add(tB, bB);

    const neckGeom = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 5);
    const neck = new THREE.Mesh(neckGeom, glassMat);
    neck.rotation.y = tB.rotation.y;
    hourglass.add(neck);

    const goldMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.brass, metalness: 1.0, roughness: 0.05,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture, reflectivity: 1.0
    });

    const capGeom = new THREE.CylinderGeometry(2.5, 2.5, 0.3, 5);
    const tC = new THREE.Mesh(capGeom, goldMat); tC.position.y = 4.8;
    const bC = new THREE.Mesh(capGeom, goldMat); bC.position.y = -4.8;
    hourglass.add(tC, bC);

    for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const ray = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.2), goldMat);
        ray.position.set(Math.cos(ang) * 2.3, 4.8, Math.sin(ang) * 2.3);
        ray.rotation.y = -ang;
        hourglass.add(ray);

        const ray2 = ray.clone();
        ray2.position.y = -4.8;
        hourglass.add(ray2);
    }

    // Triangular supports removed as per user request


    addSandToHourglass();
    positionHourglassForLayout();
    scene.add(hourglass);
}

// Space Station - Cylindrical
function createHourglassSpace() {
    hourglass = new THREE.Group();
    const theme = THEMES.space;

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x8888aa, transmission: 0.85, thickness: 1,
        ior: 1.3, roughness: 0.1, transparent: true, side: THREE.DoubleSide,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture
    });

    const tubeGeom = new THREE.CylinderGeometry(1.5, 1.5, 4, 32, 1, true);
    const tB = new THREE.Mesh(tubeGeom, glassMat); tB.position.y = 2.5;
    const bB = new THREE.Mesh(tubeGeom, glassMat); bB.position.y = -2.5;
    tB.castShadow = bB.castShadow = true;
    hourglass.add(tB, bB);

    const endGeom = new THREE.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const tEnd = new THREE.Mesh(endGeom, glassMat); tEnd.position.y = 4.5;
    const bEnd = new THREE.Mesh(endGeom, glassMat); bEnd.rotation.x = Math.PI; bEnd.position.y = -4.5;
    tEnd.castShadow = bEnd.castShadow = true;
    hourglass.add(tEnd, bEnd);

    const centerGeom = new THREE.CylinderGeometry(0.3, 0.3, 1, 16);
    hourglass.add(new THREE.Mesh(centerGeom, glassMat));

    const chromeMat = new THREE.MeshPhysicalMaterial({
        color: theme.colors.brass, metalness: 1.0, roughness: 0.0,
        clearcoat: 1.0, envMap: cubeRenderTarget.texture, reflectivity: 1.0
    });

    const ringPositions = [4.2, 2.5, 0, -2.5, -4.2];
    ringPositions.forEach((y, i) => {
        const ringGeom = new THREE.TorusGeometry(1.8 + (i % 2) * 0.3, 0.08, 8, 32);
        const ring = new THREE.Mesh(ringGeom, chromeMat);
        ring.rotation.x = Math.PI / 2 + (i * 0.1);
        ring.rotation.z = i * 0.3;
        ring.position.y = y;
        hourglass.add(ring);
    });

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xaa88ff, transparent: true, opacity: 0.6 });
    const glowRing = new THREE.TorusGeometry(0.5, 0.05, 8, 32);
    const glow = new THREE.Mesh(glowRing, glowMat);
    glow.rotation.x = Math.PI / 2;
    hourglass.add(glow);

    addSandToHourglass();
    positionHourglassForLayout();
    scene.add(hourglass);
}
