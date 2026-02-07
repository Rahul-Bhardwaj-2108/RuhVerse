import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, X, Heart, Wind } from 'lucide-react'; // 'Wine' as a bottle metaphor, or maybe 'Scroll'
import { useShayaris } from '../hooks/useShayaris';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function WhisperingSea() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentShayari, setCurrentShayari] = useState(null);
    const { shayaris } = useShayaris();
    const { user, toggleFavorite } = useAuth();
    const { addToast } = useToast();

    const findBottle = () => {
        if (shayaris.length === 0) {
            addToast("The sea is quiet today...", "info");
            return;
        }
        const randomIndex = Math.floor(Math.random() * shayaris.length);
        setCurrentShayari(shayaris[randomIndex]);
        setIsOpen(true);
    };

    const handleKeep = () => {
        if (!user) {
            addToast("Login to keep this treasure.", "info");
            return;
        }
        if (currentShayari) {
            const isLiked = user.favorites?.includes(currentShayari.id);
            if (!isLiked) {
                toggleFavorite(currentShayari.id);
                addToast("Saved to your collection.", "success");
            } else {
                addToast("Already in your collection.", "info");
            }
            setIsOpen(false);
        }
    };

    const handleRelease = () => {
        setIsOpen(false);
        setTimeout(() => setCurrentShayari(null), 300); // Clear after animation
        addToast("Released back to the sea.", "info");
    };

    return (
        <>
            {/* Animated Sea Waves */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '120px',
                pointerEvents: 'none',
                zIndex: 80,
                overflow: 'hidden'
            }}>
                <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    fill: 'var(--color-primary)',
                    opacity: 0.1
                }}>
                    <motion.path
                        animate={{
                            d: [
                                "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                                "M0,192L48,186.7C96,181,192,171,288,176C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,170.7C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                                "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            ]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                </svg>
            </div>

            {/* Floating Bottle Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                onClick={findBottle}
                style={{
                    position: 'fixed',
                    bottom: '3rem',
                    right: '3rem',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 90
                }}
                className="whispering-sea-btn"
            >
                <Wine size={28} style={{ transform: 'rotate(15deg)' }} />
            </motion.button>

            {/* The Message in a Bottle Modal */}
            <AnimatePresence>
                {isOpen && currentShayari && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', // Deep sea vibe
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1000
                        }}
                        onClick={handleRelease} // Clicking outside releases it
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            onClick={(e) => e.stopPropagation()} // Don't close when clicking paper
                            style={{
                                width: '90%', maxWidth: '400px',
                                maxHeight: '80vh', // Prevent overflow
                                overflowY: 'auto', // Enable scrolling
                                padding: '3rem 2rem',
                                background: '#fffbf0', // Old paper color
                                backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")', // Subtle noise if available, else fallback
                                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                                borderRadius: '2px', // Paper edges
                                position: 'relative',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                color: '#4a3b32',
                                fontFamily: 'var(--font-serif)',
                                border: '1px solid #e6dace',
                                scrollbarWidth: 'none', // Firefox hide scrollbar for clean look
                                msOverflowStyle: 'none' // IE/Edge hide scrollbar
                            }}
                        >
                            {/* Paper visual details */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.1), transparent)'
                            }}></div>

                            <h3 style={{
                                fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.2rem',
                                marginBottom: '2rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                                <Wind size={16} /> A Whisper Found
                            </h3>

                            <div style={{ marginBottom: '2.5rem', width: '100%' }}>
                                <p style={{
                                    fontSize: '1.4rem', lineHeight: '1.8', fontStyle: 'italic',
                                    marginBottom: '1.5rem', whiteSpace: 'pre-wrap'
                                }}>
                                    "{currentShayari.content}"
                                </p>
                                <p style={{ fontSize: '1rem', color: 'rgba(74, 59, 50, 0.8)', fontFamily: 'var(--font-sans)', fontWeight: '500' }}>
                                    — {currentShayari.author_name || currentShayari.author || 'Anonymous'}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <button
                                    onClick={handleRelease}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#94a3b8', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <div style={{ padding: '10px', borderRadius: '50%', border: '1px solid #e2e8f0' }}>
                                        <Wind size={20} />
                                    </div>
                                    Release
                                </button>

                                <button
                                    onClick={handleKeep}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#e11d48', cursor: 'pointer',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <div style={{ padding: '10px', borderRadius: '50%', background: '#ffeeee' }}>
                                        <Heart size={20} fill="#e11d48" />
                                    </div>
                                    Keep
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
