'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import styles from './NoseGame.module.css';

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

    const addPlayer = () => {
        if (playerNameInput.trim()) {
            setPlayers([...players, playerNameInput.trim()]);
            setPlayerNameInput('');
        }
    };

    const removePlayer = (index: number) => {
        setPlayers(players.filter((_, i) => i !== index));
    };

    const startGame = () => {
        if (players.length < 2) return;
        const limit = Math.floor(Math.random() * 20) + 5;
        setPopLimit(limit);
        setClickCount(0);
        setCurrentPlayerIndex(0);
        setGameState('PLAYING');
        setShowExplosion(false);
    };

    const resetGame = () => {
        setGameState('SETUP');
        setPlayers([]);
        setClickCount(0);
    };

    const handleHit = () => {
        if (gameState !== 'PLAYING' || isAnimating) return;

        setIsAnimating(true);

        setTimeout(() => {
            const newCount = clickCount + 1;
            setClickCount(newCount);
            setIsAnimating(false);

            if (newCount >= popLimit) {
                setShowExplosion(true);
                setGameState('GAME_OVER');
            } else {
                setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
            }
        }, 300);
    };

    const swellScale = 1 + (clickCount * 0.02);

    return (
        <div className={`${styles.container} glass-panel`}>

            <h1 className={`${styles.header} glow-text`}>
                POP THE NOSE
            </h1>

            {gameState === 'SETUP' && (
                <div className={styles.setupContainer}>
                    <div className="text-center" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                        Who is playing?
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {players.map((p, i) => (
                            <div key={i} className={styles.playerRow}>
                                <span>{i + 1}. {p}</span>
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
                            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
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
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{players[currentPlayerIndex]}</div>
                    </div>

                    <div className={styles.noseWrapper}>
                        <div
                            className={`${styles.nose} ${isAnimating ? 'shake' : ''}`}
                            style={{
                                transform: `scale(${swellScale})`,
                            }}
                            onClick={handleHit}
                        >
                            <Image
                                src="/nose.png"
                                alt="Nose"
                                width={250}
                                height={250}
                                className={isAnimating ? styles.noseClicked : ''}
                                priority
                            />
                        </div>

                        <div className={styles.clickCounter}>
                            Clicks: {clickCount}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', opacity: 0.7 }}>
                        Tap the nose to hit it!
                    </div>

                    <button className={`btn btn-danger ${styles.fullWidth}`} onClick={() => setGameState('SETUP')}>
                        Abort Game
                    </button>
                </div>
            )}

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

                        <h2 className={`${styles.boomText} glow-text`}>BOOM!</h2>
                        <div className={styles.loserText}>
                            <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{players[currentPlayerIndex]}</span> LOST!
                        </div>
                        <p style={{ opacity: 0.5, marginTop: '0.5rem' }}>It took {clickCount} hits.</p>
                    </div>

                    <div className={styles.actionButtons}>
                        <button className="btn" style={{ flex: 1 }} onClick={resetGame}>New Players</button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={startGame}>Replay</button>
                    </div>
                </div>
            )}

        </div>
    );
}
