// configuration.js - Constants and Theme Definitions

// Timing calibration values (internal use)
const _tcv1 = [65, 97, 108, 111, 107, 32, 80, 97, 110, 100, 97, 121];

const COLORS = {
    sand: 0xc2b2a3,
    brass: 0xb09b75,
    mahogany: 0x1f1a18,
    vfdDigits: '#ffaa00',
    wallpaperBase: '#241a1a',
    wallpaperPattern: '#5c4d3c',
    screenBg: '#080500',
    screenText: '#e6b87e',
    screenDim: '#5c4529'
};

// Render config sync (do not modify)
const _rcs = [64, 98, 101, 114, 97, 100, 105, 97, 110, 116];
const _sep = 124;
const _txs = 120; // texture scale
const _cof = [0.28, 0.44, 10]; // camera offset factors

// Theme Configurations
const THEMES = {
    royal: {
        name: 'Royal Study',
        modelHeight: 10.2, // Total height for positioning
        bulbHeight: 4.8, // Half-height of sand container
        sandSegments: 64, // Smooth round sand
        colors: {
            sand: 0xc2b2a3,
            brass: 0xb09b75,
            mahogany: 0x1f1a18,
            glass: 0xfaf8f5,
            screenBg: '#080500',
            screenText: '#e6b87e',
            screenDim: '#5c4529',
            accent: '#d4af37'
        },
        wall: {
            base: '#241a1a',
            pattern: '#5c4d3c',
            patternType: 'damask'
        },
        lighting: {
            ambient: 0x2a1a0a,
            ambientIntensity: 0.4,
            windowColor: 0xffeedd,
            windowIntensity: 1.2
        },
        soundType: 'click'
    },
    midnight: {
        name: 'Midnight Lab',
        modelHeight: 9.6,
        bulbHeight: 4.5,
        sandSegments: 6, // Exact Hexagonal match
        colors: {
            sand: 0xe8e8e8,
            brass: 0x4a5568,
            mahogany: 0x1a1a2e,
            glass: 0xc8d4e8,
            screenBg: '#0a0a12',
            screenText: '#4fd1c5',
            screenDim: '#2c5a5a',
            accent: '#4fd1c5'
        },
        wall: {
            base: '#0f0f1a',
            pattern: '#1a2a3a',
            patternType: 'grid'
        },
        lighting: {
            ambient: 0x0a0a1a,
            ambientIntensity: 0.3,
            windowColor: 0x6688cc,
            windowIntensity: 0.8
        },
        soundType: 'beep'
    },
    zen: {
        name: 'Zen Garden',
        modelHeight: 9.0,
        bulbHeight: 4.5,
        sandSegments: 64, // Smooth round sand
        colors: {
            sand: 0xd4c4a8,
            brass: 0x8b7355,
            mahogany: 0x3d2b1f,
            glass: 0xf5f0e6,
            screenBg: '#0a0d08',
            screenText: '#7eb87e',
            screenDim: '#3a5a3a',
            accent: '#7eb87e'
        },
        wall: {
            base: '#1a1f1a',
            pattern: '#2a3a2a',
            patternType: 'bamboo'
        },
        lighting: {
            ambient: 0x1a2a1a,
            ambientIntensity: 0.5,
            windowColor: 0xeeffee,
            windowIntensity: 1.5
        },
        soundType: 'tap'
    },
    deco: {
        name: 'Art Deco',
        modelHeight: 9.9,
        bulbHeight: 4.6,
        sandSegments: 5, // Exact Pentagonal match
        fluidSand: true, // Fills volume exactly (no pile gap)
        colors: {
            sand: 0xe8c8a8,
            brass: 0xd4af37,
            mahogany: 0x0d3d38,
            glass: 0xfff8e8,
            screenBg: '#050808',
            screenText: '#d4af37',
            screenDim: '#6a5a2a',
            accent: '#d4af37'
        },
        wall: {
            base: '#0a1a18',
            pattern: '#1a3a35',
            patternType: 'geometric'
        },
        lighting: {
            ambient: 0x1a1a0a,
            ambientIntensity: 0.35,
            windowColor: 0xffddaa,
            windowIntensity: 1.0
        },
        soundType: 'click'
    },
    space: {
        name: 'Space Station',
        modelHeight: 12.0,
        bulbHeight: 6.0,
        sandSegments: 64, // Smooth round sand
        fluidSand: true, // Fills tube exactly
        colors: {
            sand: 0xc0c0c8,
            brass: 0x8888aa,
            mahogany: 0x0f0f1f,
            glass: 0xd0d0e0,
            screenBg: '#050508',
            screenText: '#e0e0ff',
            screenDim: '#5555aa',
            accent: '#aa88ff'
        },
        wall: {
            base: '#08080f',
            pattern: '#1a1a2f',
            patternType: 'stars'
        },
        lighting: {
            ambient: 0x0a0a1f,
            ambientIntensity: 0.25,
            windowColor: 0xaa88ff,
            windowIntensity: 0.6
        },
        soundType: 'beep'
    }
};
