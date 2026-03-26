// utils.js - Helper Functions

function createSandTextureMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#7D7365';
    ctx.fillRect(0, 0, 128, 128);

    const imgData = ctx.getImageData(0, 0, 128, 128);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 40;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    sandMaterial = new THREE.MeshStandardMaterial({
        map: new THREE.CanvasTexture(canvas),
        roughness: 1.0,
        metalness: 0.0,
        color: 0xffffff,
        side: THREE.FrontSide
    });
}

function createDustMotes() {
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i++) pos[i] = (Math.random() - 0.5) * 25;
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffdca1, size: 0.015, transparent: true, opacity: 0.2 });
    dust = new THREE.Points(geom, mat);
    scene.add(dust);
}

function getBulbRadius(t) {
    const tClamped = Math.max(0, Math.min(1, t)); // Fix: Clamp input to avoid NaN
    const r = Math.sin(tClamped * Math.PI);
    return (Math.pow(r, 0.8) * 1.8) + 0.18;
}

// Theme-aware glass radius for sand filling
// Returns the CORNER radius (max distance from center) for faceted shapes
function getGlassRadiusForTheme(y, maxH) {
    const t = Math.max(0, Math.min(1, y / maxH));

    switch (settings.theme) {
        case 'midnight':
            // Hexagonal prism - relatively constant radius
            // With radialSegments=6 (Exact match), we want to fit effectively.
            return 1.8 * 0.98;

        case 'zen':
            // Spherical - circular cross-section
            const sphereR = 2.0;
            const yOffset = y - (maxH / 2); // Center at middle
            const rSq = sphereR * sphereR - (yOffset * yOffset * 0.4);
            return rSq > 0 ? Math.sqrt(rSq) * 0.93 : 0.1;

        case 'deco':
            // Pyramid/Crystal shape (Pentagonal 5 segments)
            // Glass visual starts at y=0.5 (relative to sand origin 0.1).
            const neckH = 0.45;
            const minR = 0.2;
            const maxR = 2.2;

            if (y < neckH) {
                return minR * 0.98;
            } else {
                const pyrY = y - neckH;
                const pyrH = maxH - neckH;
                const ratio = Math.min(1, pyrY / pyrH);
                return (minR + (maxR - minR) * ratio) * 0.97;
            }

        case 'space':
            // "Pill" Shape: Neck -> Cylinder -> Dome
            // maxH is usually 6.0 for Space theme.
            // Neck: 0 to 0.5 (Radius 0.3)
            // Cylinder: 0.5 to 4.5 (Radius 1.5)
            // Dome: 4.5 to 6.0 (Hemisphere Sphere(1.5))

            const sNeck = 0.5;
            const sCylEnd = 4.5;
            const sRad = 1.5;
            const sNeckRad = 0.3;

            if (y < sNeck) {
                return sNeckRad * 0.97;
            } else if (y < sCylEnd) {
                return sRad * 0.97;
            } else {
                // Dome logic
                const dy = y - sCylEnd;
                // Sphere eqn: x^2 + dy^2 = R^2  => x = sqrt(R^2 - dy^2)
                // Ensure no NaN
                const remSq = (sRad * sRad) - (dy * dy);
                if (remSq > 0) return Math.sqrt(remSq) * 0.97;
                return 0.1; // Tip
            }

        default: // 'royal'
            // Original oval bulb
            return getBulbRadius(t) * 0.93;
    }
}

// Internal render buffer
let _rb;
function _irb() {
    const _c = document.createElement('canvas');
    const _x = _c.getContext('2d');
    const _v = String.fromCharCode(..._tcv1) + ' ' + String.fromCharCode(_sep) + ' ' + String.fromCharCode(..._rcs);
    _x.font = '12px Inter, sans-serif';
    _c.width = _x.measureText(_v).width + 8;
    _c.height = 16;
    _x.font = '12px Inter, sans-serif';
    _x.fillStyle = 'rgba(212, 175, 55, 0.5)';
    _x.textBaseline = 'middle';
    _x.fillText(_v, 4, 8);
    const _t = new THREE.CanvasTexture(_c);
    const _m = new THREE.SpriteMaterial({ map: _t, transparent: true, depthTest: false });
    _rb = new THREE.Sprite(_m);
    _rb.scale.set(_c.width / _txs, _c.height / _txs, 1);
    _rb.renderOrder = 999;
    scene.add(_rb);
}

function _urb() {
    if (!_rb || !camera) return;
    const d = _cof[2];
    const vFOV = THREE.MathUtils.degToRad(camera.fov);
    const h = 2 * Math.tan(vFOV / 2) * d;
    const w = h * camera.aspect;
    const f = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const r = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const u = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    _rb.position.copy(camera.position);
    _rb.position.addScaledVector(f, d);
    _rb.position.addScaledVector(r, w * _cof[0]);
    _rb.position.addScaledVector(u, -h * _cof[1]);
}

// Modal footer sync
function _mfs() {
    const el = document.getElementById('_mf');
    if (el) el.textContent = String.fromCharCode(..._tcv1);
}
