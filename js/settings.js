// settings.js - Settings UI and Logic

function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        setTimeout(() => { modal.style.display = 'none'; }, 400);
    } else {
        modal.style.display = 'flex';
        setTimeout(() => { modal.classList.add('active'); }, 10);
    }
    playSound('click');
}

function switchSettingsTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).setAttribute('aria-selected', 'true');

    // Update sections
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section-${tabName}`).classList.add('active');
    playSound('click');
}

function selectTheme(themeName) {
    settings.theme = themeName;
    document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.remove('selected');
        card.setAttribute('aria-checked', 'false');
    });
    document.querySelector(`[data-theme="${themeName}"]`).classList.add('selected');
    document.querySelector(`[data-theme="${themeName}"]`).setAttribute('aria-checked', 'true');
    applyTheme(themeName);
    saveSettings();
    playSound('click');
}

function selectPreset(presetName) {
    const presets = {
        classic: { work: 25, break: 5, longBreak: 15, sessions: 4 },
        deep: { work: 50, break: 10, longBreak: 30, sessions: 2 },
        sprint: { work: 15, break: 3, longBreak: 10, sessions: 6 },
        marathon: { work: 45, break: 10, longBreak: 20, sessions: 4 }
    };

    const p = presets[presetName];
    settings.preset = presetName;
    settings.workDuration = p.work;
    settings.breakDuration = p.break;
    settings.longBreakDuration = p.longBreak;
    settings.sessionsBeforeLong = p.sessions;

    // Update UI
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-preset="${presetName}"]`).classList.add('selected');

    updateTimerUI();
    applyTimerSettings();
    saveSettings();
    playSound('click');
}

function setWorkTime(mins) {
    settings.workDuration = mins;
    settings.preset = 'custom';
    document.querySelectorAll('[data-work]').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-work="${mins}"]`).classList.add('selected');
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    applyTimerSettings();
    saveSettings();
    playSound('click');
}

function setBreakTime(mins) {
    settings.breakDuration = mins;
    settings.preset = 'custom';
    document.querySelectorAll('[data-break]').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-break="${mins}"]`).classList.add('selected');
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    applyTimerSettings();
    saveSettings();
    playSound('click');
}

function setLongBreakTime(mins) {
    settings.longBreakDuration = mins;
    settings.preset = 'custom';
    document.querySelectorAll('[data-longbreak]').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-longbreak="${mins}"]`).classList.add('selected');
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    saveSettings();
    playSound('click');
}

function setSessionsBeforeLong(count) {
    settings.sessionsBeforeLong = count;
    settings.preset = 'custom';
    document.querySelectorAll('[data-sessions]').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-sessions="${count}"]`).classList.add('selected');
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    saveSettings();
    playSound('click');
}

function setViewMode(viewMode) {
    settings.viewMode = viewMode;
    document.querySelectorAll('.view-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-view="${viewMode}"]`).classList.add('selected');

    // Apply view mode
    if (viewMode === 'desktop') {
        forceDesktopLayout();
    } else if (viewMode === 'shelf') {
        forceMobileLayout();
    } else {
        // Auto mode - check current window size
        updateLayoutLogic();
    }
    saveSettings();
    playSound('click');
}

function updateTimerUI() {
    // Sync UI with current settings
    document.querySelectorAll('[data-work]').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.work) === settings.workDuration);
    });
    document.querySelectorAll('[data-break]').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.break) === settings.breakDuration);
    });
    document.querySelectorAll('[data-longbreak]').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.longbreak) === settings.longBreakDuration);
    });
    document.querySelectorAll('[data-sessions]').forEach(btn => {
        btn.classList.toggle('selected', parseInt(btn.dataset.sessions) === settings.sessionsBeforeLong);
    });
}

function applyTimerSettings() {
    // Apply timer settings to the actual timer
    if (mode === 'work') {
        timerMs = settings.workDuration * 60 * 1000;
        totalTimeMs = timerMs;
    } else {
        timerMs = settings.breakDuration * 60 * 1000;
        totalTimeMs = timerMs;
    }
    // Reset sand
    topSandAmount = 1.0;
    bottomSandAmount = 0.0;
}

function saveSettings() {
    localStorage.setItem('etherealPomodoro_settings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('etherealPomodoro_settings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };

        // Apply loaded settings to UI
        updateTimerUI();
        applyTimerSettings();

        // Apply theme
        if (settings.theme !== 'royal') {
            selectTheme(settings.theme);
        }

        // Apply view mode UI
        document.querySelectorAll('.view-option').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.view === settings.viewMode);
        });

        // Apply sound toggle UI
        document.querySelector('.toggle-switch').classList.toggle('active', settings.soundEnabled);

        // Apply preset UI
        if (settings.preset !== 'custom') {
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.preset === settings.preset);
            });
        }
    }
}

function applyTheme(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    console.log('Applying theme:', themeName);

    // Update COLORS object for screen rendering
    COLORS.sand = theme.colors.sand;
    COLORS.brass = theme.colors.brass;
    COLORS.mahogany = theme.colors.mahogany;
    COLORS.screenBg = theme.colors.screenBg;
    COLORS.screenText = theme.colors.screenText;
    COLORS.screenDim = theme.colors.screenDim;
    COLORS.wallpaperBase = theme.wall.base;
    COLORS.wallpaperPattern = theme.wall.pattern;

    // Update sand material if it exists
    if (sandMaterial) {
        sandMaterial.color.setHex(theme.colors.sand);
    }

    // Update hourglass brass materials
    if (hourglass) {
        hourglass.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.color && child.name !== 'sand') {
                    // Check if it's a brass/metal part
                    const matColor = child.material.color.getHex();
                    if (matColor === 0xb09b75 || matColor === COLORS.brass) {
                        child.material.color.setHex(theme.colors.brass);
                    }
                }
            }
        });
    }

    // Update ambient light
    if (ambientLight) {
        ambientLight.color.setHex(theme.lighting.ambient);
        ambientLight.intensity = theme.lighting.ambientIntensity;
    }

    // Update window/directional light
    if (windowLight) {
        windowLight.color.setHex(theme.lighting.windowColor);
        windowLight.intensity = theme.lighting.windowIntensity;
    }

    // Regenerate wall texture with new theme
    if (wallMesh) {
        regenerateWallTexture(theme);
    }

    // Switch hourglass and clock models
    switchHourglass(themeName);
    switchClock(themeName);

    // Update CSS accent color for UI
    document.documentElement.style.setProperty('--theme-accent', theme.colors.accent);
}
