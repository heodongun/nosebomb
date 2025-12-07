export const playClickSound = () => {
    // Kept empty as per previous request to remove generic clicks
};

export const playSquishSound = (tension: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    // Wet squish is a short, pitch-dropping sine/triangle with filter movement
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150 + (tension * 100), audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1 + (tension * 0.2), audioContext.currentTime); // Louder as tension up
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.15);
};

export const playExplosionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1000;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(1, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noise.start();
};

export const playInhaleSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 1.5);

    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 1.2);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.5);
};
