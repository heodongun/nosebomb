'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import styles from './NoseGame.module.css';
import { playClickSound, playExplosionSound, playInhaleSound } from '../utils/sound';

type GameState = 'SETUP' | 'PLAYING' | 'GAME_OVER';

export default function NoseGame() {
    const [gameState, setGameState] = useState<GameState>('SETUP');
    const [players, setPlayers] = useState<string[]>([]);
    const [playerNameInput, setPlayerNameInput] = useState('');
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [clickCount, setClickCount] = useState(0);
    const [popLimit, setPopLimit] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showExplosion, setShowExplosion] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isScrunching, setIsScrunching] = useState(false);
    const [isPokeAnim, setIsPokeAnim] = useState(false);
    const [isSneezeBuildup, setIsSneezeBuildup] = useState(false); // New state for 'Ah... ah...'

    useEffect(() => {
        // Initial theme setup logic if needed, usually managed locally
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    /* ... inside NoseGame component ... */

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // Fix for Korean IME (double submission)
            if (e.nativeEvent.isComposing) return;
            addPlayer();
        }
    };

    const addPlayer = () => {
        if (playerNameInput.trim()) {
            setPlayers([...players, playerNameInput.trim()]);
            setPlayerNameInput('');
            playClickSound();
        }
    };

    const removePlayer = (index: number) => {
        setPlayers(players.filter((_, i) => i !== index));
        playClickSound();
    };

    const startGame = () => {
        if (players.length < 2) return;
        const limit = Math.floor(Math.random() * 20) + 5;
        setPopLimit(limit);
        setClickCount(0);
        setCurrentPlayerIndex(0);
        setGameState('PLAYING');
        setShowExplosion(false);
        playClickSound();
    };

    const resetGame = () => {
        setGameState('SETUP');
        setPlayers([]);
        setClickCount(0);
        playClickSound();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        // Update custom cursor position relative to the container
        // We'll use absolute positioning within the relative container
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleHit = (e: React.MouseEvent) => {
        if (gameState !== 'PLAYING' || isSneezeBuildup) return;

        // Visual reactions
        setIsScrunching(true);
        setIsPokeAnim(true);
        setTimeout(() => setIsScrunching(false), 150);
        setTimeout(() => setIsPokeAnim(false), 200);

        // Snot Splatter
        triggerSnotSplatter(e.clientX, e.clientY);

        const newCount = clickCount + 1;
        setClickCount(newCount);

        if (newCount >= popLimit) {
            // PRE-SNEEZE SUSPENSE START
            setIsSneezeBuildup(true);
            playInhaleSound();

            // Delay explosion by ~1.5s for the "Ah... ah..."
            setTimeout(() => {
                setShowExplosion(true);
                setGameState('GAME_OVER');
                setIsSneezeBuildup(false);
                playExplosionSound();
                triggerConfetti();
            }, 1500);

        } else {
            setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        }
    };

    const triggerSnotSplatter = (x: number, y: number) => {
        // Normalize coordinates to 0-1 for confetti source
        const xRatio = x / window.innerWidth;
        const yRatio = y / window.innerHeight;

        confetti({
            particleCount: 8,
            spread: 40,
            startVelocity: 20,
            origin: { x: xRatio, y: yRatio },
            colors: ['#aaff00', '#00ff55', '#ccff33'], // Snot colors
            scalar: 0.8,
            gravity: 2,
            drift: 0,
            ticks: 50, // Disappear fast
            disableForReducedMotion: true
        });
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff0055', '#00e5ff', '#ffffff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff0055', '#00e5ff', '#ffffff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    };

    // Tension Calculation (0 to 1 range approx)
    // Becomes more red and intense as clicks go up
    const tension = Math.min(clickCount / 20, 1);

    // Dynamic styles based on tension
    const noseStyle = {
        filter: `
      brightness(${1 + tension * 0.2})
      sepia(${tension * 0.5})
      hue-rotate(-${tension * 30}deg)
      saturate(${1 + tension * 2})
      drop-shadow(0 0 ${tension * 20}px rgba(255, 0, 0, ${tension * 0.5}))
    `,
        transform: `scale(${1 + tension * 0.1})`, // Slight growth adds to tension
    };

    const snotScaleY = Math.min(clickCount / 10, 1.5) * (1 + tension);
    const snotOpacity = clickCount > 1 ? 1 : 0;

    return (
        <div className={`${styles.container} glass-panel relative`}>

            {/* Theme Toggle code remains same... */}
            <button
                onClick={toggleTheme}
                className={styles.themeToggle}
                title="Toggle Theme"
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <h1 className={`${styles.header} glow-text`}>
                MAKE IT SNEEZE
            </h1>

            {/* SETUP STAGE - CODE REMAINS SAME */}
            {gameState === 'SETUP' && (
                <div className={styles.setupContainer}>
                    <div className="text-center" style={{ fontSize: '1.2rem', marginBottom: '1rem', opacity: 0.8 }}>
                        Add players to the bet!
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {players.map((p, i) => (
                            <div key={i} className={styles.playerRow}>
                                <span style={{ fontWeight: 600 }}>{i + 1}. {p}</span>
                                <button onClick={() => removePlayer(i)} className={styles.removeBtn}>✕</button>
                            </div>
                        ))}
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter Name"
                            value={playerNameInput}
                            onChange={(e) => setPlayerNameInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button className="btn" onClick={addPlayer}>Add</button>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                        <button
                            className={`btn btn-primary ${styles.fullWidth}`}
                            disabled={players.length < 2}
                            style={{ opacity: players.length < 2 ? 0.5 : 1 }}
                            onClick={startGame}
                        >
                            START GAME
                        </button>
                    </div>
                    {players.length < 2 && <p style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.9rem', marginTop: '0.5rem' }}>Add at least 2 players</p>}
                </div>
            )}

            {gameState === 'PLAYING' && (
                <div className={styles.gameContainer}>

                    <div className={styles.turnIndicator}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>CURRENT TURN</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{players[currentPlayerIndex]}</div>
                    </div>

                    {/* NOSE WRAPPER: Now tracks mouse for feather */}
                    <div
                        className={styles.noseWrapper}
                        onMouseMove={handleMouseMove}
                        onClick={handleHit}
                    >
                        {/* Custom Feather Cursor Element */}
                        <div
                            className={`${styles.featherCursor} ${isPokeAnim ? styles.featherPoke : ''}`}
                            style={{
                                left: mousePos.x,
                                top: mousePos.y,
                                // Offset so the tip of feather is at the cursor
                                transform: 'translate(-0%, -100%) rotate(-20deg)',
                            }}
                        >
                            <Image
                                src="/feather.png"
                                alt="Feature"
                                width={100}
                                height={100}
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>

                        {/* The Nose - Dynamic Tension Styles */}
                        <div
                            className={`${styles.nose} ${isScrunching ? styles.noseScrunch : ''} ${isSneezeBuildup ? styles.nosePreSneeze : ''}`}
                            style={noseStyle}
                        >
                            <Image
                                src="/nose.png"
                                alt="Nose"
                                width={250}
                                height={250}
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* The Snot - Grows and throbs */}
                        <div
                            className={styles.snot}
                            style={{
                                opacity: snotOpacity,
                                transform: `scaleY(${Math.max(0.1, snotScaleY)})`,
                            }}
                        >
                            <Image
                                src="/snot.png"
                                alt="Snot"
                                width={60}
                                height={100}
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', opacity: 0.7 }}>
                        <p className={styles.tensionText} style={{ opacity: Math.max(0.3, tension), fontSize: isSneezeBuildup ? '2rem' : '1rem', fontWeight: isSneezeBuildup ? 'bold' : 'normal', color: isSneezeBuildup ? 'var(--primary)' : 'inherit' }}>
                            {isSneezeBuildup ? "AH... AH... AH...!" : (tension > 0.8 ? "It's trembling..." : "Tickle the nose with the feather...")}
                        </p>
                    </div>

                    <button className={`btn btn-danger ${styles.fullWidth}`} onClick={() => setGameState('SETUP')}>
                        Abort Game
                    </button>
                </div>
            )}

            {/* GAME OVER STAGE - CODE REMAINS SAME */}
            {gameState === 'GAME_OVER' && (
                <div className={styles.gameOverContainer}>

                    <div style={{ textAlign: 'center', position: 'relative' }}>
                        {showExplosion && (
                            <div className="pop-anim" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                                <Image
                                    src="/explosion.png"
                                    alt="Explosion"
                                    width={300}
                                    height={300}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        )}

                        <h2 className={`${styles.boomText} glow-text`}>ACHOOO!</h2>
                        <div className={styles.loserText}>
                            <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{players[currentPlayerIndex]}</span> LOST!
                        </div>
                        <p style={{ opacity: 0.5, marginTop: '0.5rem' }}>It took {clickCount} tickles.</p>
                    </div>

                    <div className={styles.actionButtons}>
                        <button className="btn" style={{ flex: 1 }} onClick={resetGame}>New Players</button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                            setClickCount(0);
                            const limit = Math.floor(Math.random() * 20) + 5;
                            setPopLimit(limit);
                            setCurrentPlayerIndex(0);
                            setGameState('PLAYING');
                            setShowExplosion(false);
                        }}>Replay Same Players</button>
                    </div>
                </div>
            )}

        </div>
    );
}
