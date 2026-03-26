// audio.js - Audio Logic

function toggleSound() {
    settings.soundEnabled = !settings.soundEnabled;
    const toggle = document.querySelector('.toggle-switch');
    toggle.classList.toggle('active', settings.soundEnabled);
    toggle.setAttribute('aria-checked', settings.soundEnabled);
    saveSettings();
    if (settings.soundEnabled) playSound('click');
}

function playSound(type) {
    if (!settings.soundEnabled) return;
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    // Different sounds based on theme
    if (type === 'click') {
        if (settings.theme === 'zen') {
            // Wooden tap
            osc.type = 'sine';
            osc.frequency.value = 800;
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialDecayTo && gain.gain.exponentialDecayTo(0.01, audioContext.currentTime + 0.08);
        } else if (settings.theme === 'midnight' || settings.theme === 'space') {
            // Electronic beep
            osc.type = 'square';
            osc.frequency.value = 1200;
            gain.gain.setValueAtTime(0.05, audioContext.currentTime);
        } else {
            // Soft click (default)
            osc.type = 'sine';
            osc.frequency.value = 600;
            gain.gain.setValueAtTime(0.08, audioContext.currentTime);
        }
    }

    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.1);
}
