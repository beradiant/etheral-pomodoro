// layout.js - Layout Management

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function forceDesktopLayout() {
    if (currentLayout !== 'desktop') {
        transitionToDesktop();
    }
}

function forceMobileLayout() {
    if (currentLayout !== 'mobile') {
        transitionToMobile();
    }
}

function switchLayout(newMode) {
    if (isTransitioning || currentLayout === newMode) return;
    isTransitioning = true;

    // Show Loader
    const loader = document.getElementById('scene-loader');
    loader.classList.add('visible');

    // Wait for fade in
    setTimeout(() => {
        currentLayout = newMode;

        if (newMode === 'mobile') {
            // Switch to Vertical Shelves
            tableMesh.visible = false;
            shelfGroup.visible = true;

            // --- REPOSITION OBJECTS (Precise Contact) ---
            // Shelf 1 Top Surface Y = 2.5 + 0.2 = 2.7
            // Shelf 2 Top Surface Y = -2.5 + 0.2 = -2.3

            positionHourglassForLayout();
            positionClockForLayout();

            // Camera adjustment for vertical stack
            camera.position.z = 24;
            camera.position.y = 3.5;

            // Show Curtains if not already opened
            if (!curtainOpen && curtainGroup) {
                updateRopeLayout(); // <--- Dynamic Rope Adjustment on Switch
                curtainGroup.visible = true;
                const labels = document.getElementById('curtain-labels');
                if (labels) labels.style.display = 'block';
            }

        } else {
            // Switch back to Desktop Table
            tableMesh.visible = true;
            shelfGroup.visible = false;

            if (curtainGroup) {
                curtainGroup.visible = false;
                const labels = document.getElementById('curtain-labels');
                if (labels) labels.style.display = 'none';
            }

            positionHourglassForLayout();
            positionClockForLayout();

            camera.position.set(0, 5, 16);
        }

        // Hide Loader
        setTimeout(() => {
            loader.classList.remove('visible');
            isTransitioning = false;
        }, 500); // Short delay to let scene settle
    }, 500); // Wait for fade in completion
}

function transitionToDesktop() {
    switchLayout('desktop');
}

function transitionToMobile() {
    switchLayout('mobile');
}

function updateLayoutLogic(force = false) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    // --- DECISION THRESHOLDS ---
    // User Request: Use ratio instead of specific px.
    // If height decreases (aspect increases), we should stay/go to desktop.
    // Mobile = Portrait-ish. Desktop = Landscape-ish.

    const isNarrow = aspect < 1.0;

    if (isNarrow && currentLayout === 'desktop') {
        switchLayout('mobile');
        return;
    } else if (!isNarrow && currentLayout === 'mobile') {
        switchLayout('desktop');
        return;
    }

    // --- DESKTOP DYNAMIC SQUEEZE ---
    if (currentLayout === 'desktop' && !isTransitioning) {
        // Define "Comfortable" gap at full width (e.g. 1920px)
        // Define "Minimum" gap just before switching

        // Standard Positions: Clock X = -2.8, Hourglass X = 2.8. Width apart = 5.6
        // Min gap could be tight, e.g. 3.0 total separation (1.5 each)

        const fullWidth = 1600;
        const squeezeWidth = 900;
        const factor = Math.max(0, Math.min(1, (width - squeezeWidth) / (fullWidth - squeezeWidth)));

        // Interpolate positions
        const minX = 1.6; // Closest allowed X magnitude
        const maxX = 2.8; // Standard X magnitude

        const currentX = minX + (maxX - minX) * factor;

        clock.position.x = -currentX;
        hourglass.position.x = currentX;
    }
}
