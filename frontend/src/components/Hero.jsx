import React from 'react';
import { Feather, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function Hero() {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 50,
                damping: 20
            }
        }
    };

    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{
                textAlign: 'center',
                padding: '6rem 1rem 4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                position: 'relative'
            }}
        >
            {/* Icon Graphic */}
            <motion.div variants={itemVariants} style={{
                color: 'var(--color-primary)',
                marginBottom: '0.5rem',
                opacity: 0.8
            }}>
                <Feather size={56} strokeWidth={1} />
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={itemVariants}>
                <h1 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                    color: 'var(--color-text-main)',
                    maxWidth: '800px',
                    lineHeight: '1.1',
                    letterSpacing: '-0.02em',
                    marginBottom: '1rem'
                }}>
                    Where silence finds <br />
                    <span style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>its voice.</span>
                </h1>
                <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.2rem',
                    color: 'var(--color-text-muted)',
                    maxWidth: '500px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                }}>
                    A sanctuary for poets, dreamers, and storytellers to share their deepest thoughts.
                </p>
            </motion.div>

            {/* CTA Button */}
            <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
                onClick={() => navigate('/signup')}
                style={{
                    marginTop: '1rem',
                    padding: '1rem 3rem',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    cursor: 'pointer'
                }}>
                Start Reading
                <ArrowRight size={18} />
            </motion.button>

            {/* Divider / Transition */}
            <motion.div
                variants={itemVariants}
                style={{
                    width: '100%', maxWidth: '200px', height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
                    marginTop: '5rem', opacity: 0.3
                }}
            />
        </motion.section>
    );
}
