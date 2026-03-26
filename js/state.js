// state.js - Global State Variables

let scene, camera, renderer, composer, raycaster, mouse, cubeCamera, cubeRenderTarget;
let hourglass, tableMesh, clock, screenMesh, dust;
let shelfGroup, curtainGroup;
let leftString, rightString;
let curtainOpen = false;
let currentLayout = 'desktop'; // 'desktop' or 'mobile'
let isTransitioning = false;
let layoutCheckTimer;
let topSand, bottomSand, streamMesh;
let sandMaterial;
let screenTexture, screenContext; // For 2D drawing
let fxaaPass;

let timerMs = 25 * 60 * 1000;
let totalTimeMs = 25 * 60 * 1000;
let isRunning = false;
let isFlipping = false;
let lastTimestamp = 0;
let mode = 'work';
let sessionCount = 1;

// Settings State
let settings = {
    theme: 'royal',
    soundEnabled: true,
    viewMode: 'auto', // 'auto', 'desktop', 'shelf'
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLong: 4,
    preset: 'classic'
};

// Audio context for sound effects
let audioContext = null;

// Sand distribution state - continuous model (0.0 to 1.0 each)
let topSandAmount = 1.0;      // Starts full
let bottomSandAmount = 0.0;   // Starts empty
let lastSandProgress = -1;    // Start at -1 to force initial geometry render

// Animation State
let prevSeconds = 0;
let digitOffset = 0; // For sliding animation 0 -> 1
let frameCount = 0;  // For throttling expensive operations

// Store references for theme changes
let wallMesh = null;
let ambientLight = null;
let windowLight = null;
