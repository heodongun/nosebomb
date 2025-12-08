'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import styles from './NoseGame.module.css';
import { playClickSound, playExplosionSound, playInhaleSound, playSquishSound, playBlockSound } from '../utils/sound';

type GameState = 'SETUP' | 'PLAYING' | 'GAME_OVER';

export default function NoseGame() {
    const [gameState, setGameState] = useState<GameState>('SETUP');
    const [players, setPlayers] = useState<string[]>([]);
    const [introVideo, setIntroVideo] = useState(true); // Optional: if we had a video
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
    const [isSneezeBuildup, setIsSneezeBuildup] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [isSnotSwing, setIsSnotSwing] = useState(false);
    const [showSaved, setShowSaved] = useState(false); // Used to show Block Success state
    const [showSpacePrompt, setShowSpacePrompt] = useState(false);
    const [sneezeDeadline, setSneezeDeadline] = useState(0); // For difficulty tracking

    const sneezeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (gameState !== 'PLAYING') return;

            // SPACEBAR BLOCKING LOGIC
            if (e.code === 'Space') {
                e.preventDefault();
                if (isSneezeBuildup) {
                    handleSuccessfulBlock();
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [gameState, isSneezeBuildup]);

    useEffect(() => {
        return () => {
            if (sneezeTimeoutRef.current) clearTimeout(sneezeTimeoutRef.current);
        };
    }, []);

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

    const handleSuccessfulBlock = () => {
        if (sneezeTimeoutRef.current) clearTimeout(sneezeTimeoutRef.current);
        setIsSneezeBuildup(false);
        setShowSpacePrompt(false);
        setShowSaved(true);
        playBlockSound();

        // Reset tension and pass turn
        setClickCount(0);
        setTimeout(() => setShowSaved(false), 2000);
        setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    };

    const handleHit = (e: React.MouseEvent) => {
        if (gameState !== 'PLAYING') return;
        if (isSneezeBuildup) return; // Ignore clicks during buildup, wait for Space

        // Visual reactions
        setIsScrunching(true);
        setIsPokeAnim(true);
        setIsSnotSwing(true);
        setIsShaking(true);

        // Reset animation triggers
        setTimeout(() => setIsScrunching(false), 150);
        setTimeout(() => setIsPokeAnim(false), 200);
        setTimeout(() => setIsSnotSwing(false), 1000);
        setTimeout(() => setIsShaking(false), 200);

        // Snot Splatter
        triggerSnotSplatter(e.clientX, e.clientY);

        const newCount = clickCount + 1;
        // Calculate tension for sound
        const currentTension = Math.min(newCount / 20, 1);
        playSquishSound(currentTension);

        setClickCount(newCount);

        if (newCount >= popLimit) {
            // DIFFICULTY LOGIC
            // 20% chance of a "Fake Sneeze" (handled by resetting without explosion) - maybe later feature
            // Random duration between 400ms (Very Hard) and 1200ms (Easy)
            const randomDuration = Math.max(400, Math.random() * 1200);

            // PRE-SNEEZE SUSPENSE START
            setIsSneezeBuildup(true);
            setShowSpacePrompt(true); // SHOW QTE PROMPT
            playInhaleSound(randomDuration);
            setSneezeDeadline(Date.now() + randomDuration);

            // Delay explosion
            sneezeTimeoutRef.current = setTimeout(() => {
                setShowExplosion(true);
                setGameState('GAME_OVER');
                setIsSneezeBuildup(false);
                setShowSpacePrompt(false);
                playExplosionSound();
                triggerConfetti();
            }, randomDuration);

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
        <div className={`${styles.container} glass-panel relative ${isShaking ? styles.containerShake : ''}`}>

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
                        내기에 참여할 플레이어를 추가하세요!
                    </div>

                    <div className={styles.instructionsBox}>
                        <h3>🤧 게임 방법</h3>
                        <p>1. 마우스 클릭으로 코를 간지럽히세요.</p>
                        <p>2. 코가 <b>"에... 에취..."</b> 할 때!</p>
                        <p>3. <b>[스페이스바]</b>를 연타해서 휴지로 막으세요!</p>
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
                <div
                    className={styles.gameContainer}
                    onMouseMove={handleMouseMove}
                    style={{ position: 'relative', cursor: 'none' }} // Hide default cursor here
                >
                    {/* CUSTOM CURSOR - Always Feather unless blocking logic needed visually, but simplifying for QTE */}
                    <div
                        className={`${styles.featherCursor} ${isPokeAnim ? styles.featherPoke : ''}`}
                        style={{
                            left: mousePos.x,
                            top: mousePos.y,
                            transform: 'translate(-0%, -100%) rotate(-20deg)',
                        }}
                    >
                        <Image
                            src="/feather.png"
                            alt="Feather"
                            width={100}
                            height={100}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>

                    <div className={styles.turnIndicator}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>현재 차례</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{players[currentPlayerIndex]}</div>
                    </div>

                    {/* NOSE WRAPPER */}
                    <div
                        className={styles.noseWrapper}
                        onClick={handleHit}
                    >

                        {/* The Nose - Dynamic Tension Styles */}
                        <div
                            className={`${styles.nose} ${isScrunching ? styles.noseScrunch : ''} ${isSneezeBuildup ? styles.nosePreSneeze : ''} ${showSaved ? styles.blockedNose : ''}`}
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
                            {showSaved && (
                                <>
                                    <div className={styles.savedText}>휴지로 막았다!</div>
                                    <div className={styles.blockVisual}>
                                        <Image src="/tissue.png" alt="Blocked" width={200} height={200} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* The Snot */}
                        <div
                            className={`${styles.snotContainer} ${isSnotSwing ? styles.snotSwing : ''}`}
                            style={{ opacity: snotOpacity }}
                        >
                            <div
                                className={styles.snotBody}
                                style={{
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
                    </div>

                    <div style={{ textAlign: 'center', opacity: 0.7 }}>
                        <p className={styles.tensionText} style={{ opacity: Math.max(0.3, tension), fontSize: isSneezeBuildup ? '2rem' : '1rem', fontWeight: isSneezeBuildup ? 'bold' : 'normal', color: isSneezeBuildup ? 'var(--primary)' : 'inherit' }}>
                            {isSneezeBuildup ? "에... 에... 에취...!" : (tension > 0.8 ? "코가 떨리고 있어요..." : "깃털로 코를 간지럽히세요...")}
                        </p>
                    </div>

                    {showSpacePrompt && (
                        <div className={styles.spacePrompt}>
                            스페이스바를 누르세요!
                        </div>
                    )}

                    <button className={`btn btn-danger ${styles.fullWidth}`} onClick={() => setGameState('SETUP')}>
                        게임 중단
                    </button>
                </div>
            )}

            {/* GAME OVER STAGE - CODE REMAINS SAME */}
            {
                gameState === 'GAME_OVER' && (
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

                            <h2 className={`${styles.boomText} glow-text`}>에취!!!</h2>
                            <div className={styles.loserText}>
                                <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{players[currentPlayerIndex]}</span> 님이 졌습니다!
                            </div>
                            <p style={{ opacity: 0.5, marginTop: '0.5rem' }}>{clickCount}번 간지럽혔네요.</p>
                        </div>

                        <div className={styles.actionButtons}>
                            <button className="btn" style={{ flex: 1 }} onClick={resetGame}>새 게임</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                                setClickCount(0);
                                const limit = Math.floor(Math.random() * 20) + 5;
                                setPopLimit(limit);
                                setCurrentPlayerIndex(0);
                                setGameState('PLAYING');
                                setShowExplosion(false);
                            }}>다시 하기</button>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
