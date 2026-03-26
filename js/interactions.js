// interactions.js - User Interactions

function onTouchStart(e) {
    if (e.touches.length > 0) {
        // Prevent default prevents scrolling which is good for this app
        // e.preventDefault(); 
        // Actually, let's allow default if clicking UI, but maybe capture for 3D?
        // For now, just map to mouse logic
        const touch = e.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        checkIntersection();
    }
}

function onMouseDown(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    checkIntersection();
}

function checkIntersection() {
    raycaster.setFromCamera(mouse, camera);

    // 1. Check Curtain Strings (Priority if visible)
    if (curtainGroup && curtainGroup.visible && !curtainOpen) {
        const hits = raycaster.intersectObjects(curtainGroup.children, true);
        if (hits.length > 0) {
            let obj = hits[0].object;

            // Traverse up to find the named group (leftString or rightString)
            while (obj && obj !== scene) {
                if (obj.name === "leftString") {
                    openCurtains(false);
                    return;
                }
                if (obj.name === "rightString") {
                    openCurtains(true);
                    return;
                }
                obj = obj.parent;
            }
        }
    }

    // 2. Main Scene Interaction
    if (screenMesh && clock.visible) { // Only check if clock is visible 
        const hits = raycaster.intersectObject(screenMesh);
        if (hits.length > 0) {
            const uv = hits[0].uv;

            // Bottom Buttons (y < 0.25)
            if (uv.y < 0.25 && uv.y > 0.05) {
                if (uv.x < 0.35) handleAction('start');
                else if (uv.x > 0.65) handleAction('reset');
                else handleAction('mode');
            }

            // Top Right Info Button
            if (uv.y > 0.85 && uv.x > 0.85) {
                toggleInstructions();
            }

            // Top Left Settings Button
            if (uv.y > 0.85 && uv.x < 0.15) {
                toggleSettings();
            }
        }
    }
}

// Blur transition for mode switches
function blurTransition(callback) {
    const overlay = document.getElementById('blur-overlay');
    overlay.classList.add('active');

    // Wait for heavy blur to fully apply, then execute callback
    setTimeout(() => {
        callback();

        // Wait for flip animation to complete, then unblur
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 1500);
    }, 600);
}

function handleAction(a) {
    if (isFlipping && a === 'mode') return;
    lastTimestamp = 0;
    if (a === 'start') isRunning = !isRunning;
    else if (a === 'reset') {
        isRunning = false;
        timerMs = totalTimeMs;
        topSandAmount = 1.0;
        bottomSandAmount = 0.0;
        lastSandProgress = -1; // Force geometry update
    }
    else if (a === 'mode') {
        isRunning = false;

        // Use blur transition to mask the sand reset
        blurTransition(() => {
            mode = mode === 'work' ? 'break' : 'work';
            timerMs = (mode === 'work' ? 25 : 5) * 60 * 1000;
            totalTimeMs = timerMs;
            topSandAmount = 1.0;
            bottomSandAmount = 0.0;
            lastSandProgress = -1; // Force geometry update
            flipHourglass();
        });
    }
}

function flipHourglass() {
    if (isFlipping) return;
    isFlipping = true;

    // Track if sand has been reset mid-flip (at 90 degrees)
    let sandResetDone = false;

    const sZ = hourglass.rotation.z;
    const targetZ = sZ + Math.PI;

    // Edge-pivot rotation: hourglass tips on its edge like a real physical flip
    const startY = hourglass.position.y;
    const liftHeight = 1.2; // Smaller, more natural lift for edge pivot

    const duration = 1200; // Faster, more snappy flip
    const start = performance.now();

    function step(now) {
        let p = Math.min(1, (now - start) / duration);

        // Smooth ease-in-out for natural motion
        const easeVal = p < 0.5
            ? 2 * p * p
            : 1 - Math.pow(-2 * p + 2, 2) / 2;

        hourglass.rotation.z = sZ + ((targetZ - sZ) * easeVal);

        // ILLUSION: Reset sand at 50% (90 degrees) - when hourglass is horizontal
        // At this moment, both bulbs are side-by-side and it's impossible to tell
        // which has more sand. This creates a seamless visual transition.
        if (p >= 0.5 && !sandResetDone) {
            topSandAmount = 1.0;
            bottomSandAmount = 0.0;
            sandResetDone = true;
        }

        // Edge-pivot lift: follows the arc of tipping on edge
        const rotProgress = Math.sin(p * Math.PI);
        const liftOffset = rotProgress * liftHeight;
        hourglass.position.y = startY + liftOffset;

        if (p < 1) requestAnimationFrame(step);
        else {
            hourglass.rotation.z = targetZ;
            hourglass.position.y = startY;
            isFlipping = false;
        }
    }
    requestAnimationFrame(step);
}
