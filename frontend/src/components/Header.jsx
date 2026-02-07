import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X } from 'lucide-react';

export function Header({ onWriteClick }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleScrollToFeed = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } else {
            document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleCommunityClick = (e) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        addToast("Community features coming soon!");
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            <header style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--color-border)', transition: 'border-color 0.3s', position: 'relative', zIndex: 40 }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <div style={{ padding: '4px', border: '1px solid var(--color-primary)', borderRadius: '50%', display: 'flex' }}>
                            <div style={{ width: '20px', height: '20px', background: 'var(--color-primary)', transform: 'rotate(45deg)', borderRadius: '0 50% 50% 50%' }}></div>
                        </div>
                        <h1 style={{ fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--color-text-main)' }}>
                            Ruh<span style={{ color: 'var(--color-text-muted)' }}>Verse</span>
                        </h1>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="desktop-nav" style={{ display: 'none', gap: '2rem', color: 'var(--color-text-main)', fontSize: '0.95rem', fontWeight: '500' }}>
                        <style>{`
                            @media (min-width: 769px) {
                                .desktop-nav { display: flex !important; }
                                .mobile-toggle { display: none !important; }
                            }
                        `}</style>
                        <a href="#feed" onClick={handleScrollToFeed} className="nav-link">Poetry</a>
                        {user && (
                            <button
                                onClick={onWriteClick}
                                className="nav-link"
                                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                            >
                                Creativity
                            </button>
                        )}
                        <a href="#" onClick={handleCommunityClick} className="nav-link">Community</a>
                    </nav>

                    {/* Desktop Right Actions */}
                    <div className="desktop-nav" style={{ display: 'none', gap: '1.5rem', alignItems: 'center' }}>
                        <button
                            onClick={toggleTheme}
                            className="hover-scale"
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center'
                            }}
                            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {user ? (
                            <Link to="/dashboard" className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{user.name}</span>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', overflow: 'hidden' }}>
                                    {user.avatarImage ? (
                                        <img src={user.avatarImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        user.avatarSeed ? (
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        ))}
                                </div>
                            </Link>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link to="/login" style={{
                                    padding: '0.5rem 1.25rem', color: 'var(--color-text-muted)', border: '1px solid var(--color-text-muted)', borderRadius: '999px',
                                    fontSize: '0.9rem', textDecoration: 'none'
                                }}>Log in</Link>
                                <Link to="/signup" style={{
                                    padding: '0.5rem 1.25rem', background: 'transparent', color: 'var(--color-text-main)', border: '1px solid var(--color-text-main)', borderRadius: '999px',
                                    fontSize: '0.9rem', textDecoration: 'none'
                                }}>Join now</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button className="mobile-toggle" onClick={toggleMobileMenu} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer' }}>
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>

            {/* Mobile Menu Drawer */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)' }}>Menu</h2>
                    <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                    <a href="#feed" onClick={handleScrollToFeed} style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', textDecoration: 'none' }}>Poetry</a>
                    {user && (
                        <button onClick={() => { onWriteClick(); setIsMobileMenuOpen(false); }} style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', background: 'none', border: 'none', padding: 0, textAlign: 'left', font: 'inherit' }}>
                            Creativity
                        </button>
                    )}
                    <a href="#" onClick={handleCommunityClick} style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', textDecoration: 'none' }}>Community</a>
                </nav>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Theme</span>
                        <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
                        </button>
                    </div>

                    {user ? (
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', background: 'var(--color-bg)', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', overflow: 'hidden' }}>
                                {user.avatarImage ? (
                                    <img src={user.avatarImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user.avatarSeed ? (
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed}`} alt="avatar" style={{ width: '100%', height: '100%' }} />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    ))}
                            </div>
                            <div>
                                <div style={{ color: 'var(--color-text-main)', fontWeight: '600' }}>{user.name}</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>View Dashboard</div>
                            </div>
                        </Link>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={{
                                padding: '0.75rem', textAlign: 'center', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', borderRadius: '8px', textDecoration: 'none'
                            }}>Log in</Link>
                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} style={{
                                padding: '0.75rem', textAlign: 'center', background: 'var(--color-primary)', color: '#0f172a', borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
                            }}>Join now</Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
