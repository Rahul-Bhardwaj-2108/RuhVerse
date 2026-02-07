import React, { useState } from 'react';
import { Hero } from '../components/Hero';
import { ShayariCard } from '../components/ShayariCard';
import { CreateModal } from '../components/CreateModal';
import { Footer } from '../components/Footer';
import { useShayaris } from '../hooks/useShayaris';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { WhisperingSea } from '../components/WhisperingSea';
import { Header } from '../components/Header';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { SkeletonGrid } from '../components/SkeletonCard';

export function Home() {
    const { shayaris, addShayari, loading } = useShayaris();
    const { user } = useAuth(); // Get user status
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);

    // Search Users Effect
    React.useEffect(() => {
        const searchUsers = async () => {
            if (!searchTerm.trim()) {
                setSearchedUsers([]);
                return;
            }

            setIsSearchingUsers(true);
            try {
                let query = supabase
                    .from('profiles')
                    .select('full_name, id')
                    .ilike('full_name', `%${searchTerm}%`)
                    .limit(5);

                if (user?.id) {
                    query = query.neq('id', user.id);
                }

                const { data, error } = await query;

                if (data) {
                    setSearchedUsers(data);
                }
            } catch (error) {
                console.error("User search error:", error);
            } finally {
                setIsSearchingUsers(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);



    // Filter Logic
    let displayShayaris = shayaris;

    if (!user) {
        // Guest View: Show latest 2 posts from anyone
        displayShayaris = shayaris.slice(0, 2);
    }

    const filteredShayaris = displayShayaris.filter(shayari => {
        if (!shayari) return false;
        const content = shayari.content || '';
        const author = shayari.author || '';
        const term = searchTerm.toLowerCase();
        return content.toLowerCase().includes(term) ||
            author.toLowerCase().includes(term);
    });

    return (
        <div className="page-home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header onWriteClick={() => setIsModalOpen(true)} />

            {!user && <Hero />}

            <main className="container" id="feed" style={{ paddingBottom: '6rem', paddingTop: '3rem', flex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{
                        fontFamily: 'var(--font-sans)', fontSize: '0.8rem', letterSpacing: '0.2em',
                        textTransform: 'uppercase', color: 'var(--color-primary)', display: 'block', marginBottom: '1rem'
                    }}>
                        Latest Writings
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-main)', marginBottom: '2rem' }}>
                        Echoes of the Soul
                    </h3>

                    {/* Search & Filter UI */}
                    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Search Bar */}
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search by words or poet..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    borderRadius: '50px',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)',
                                    color: 'var(--color-text-main)',
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                            />
                        </div>

                        {/* Filter Pills */}

                    </div>
                </div>

                {/* User Search Results */}
                {searchedUsers.length > 0 && (
                    <div className="fade-in" style={{ marginBottom: '3rem' }}>
                        <h4 style={{
                            fontFamily: 'var(--font-serif)',
                            color: 'var(--color-text-muted)',
                            marginBottom: '1rem',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'center'
                        }}>
                            Found Poets <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>({searchedUsers.length})</span>
                        </h4>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '1rem' }}>
                            {searchedUsers.map(u => (
                                <Link
                                    key={u.id}
                                    to={`/profile/${encodeURIComponent(u.full_name || 'User')}`}
                                    className="hover-card"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1.25rem',
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '50px',
                                        textDecoration: 'none',
                                        minWidth: '200px'
                                    }}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
                                        background: 'var(--color-primary)', flexShrink: 0
                                    }}>
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.full_name || 'User'}`}
                                            alt={u.full_name || 'User'}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </div>
                                    <span style={{ color: 'var(--color-text-main)', fontWeight: '500' }}>
                                        {u.full_name || 'Anonymous'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <SkeletonGrid count={6} />
                ) : filteredShayaris.length === 0 ? (
                    <div className="glass-panel slide-up" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                        <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>No writings match your search. (Debug: {shayaris.length} items)</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            style={{ marginTop: '1rem', color: 'var(--color-primary)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    <>
                        <motion.div
                            className="feed"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: '3rem',
                                maxWidth: '600px',
                                margin: '0 auto 4rem auto'
                            }}
                        >
                            {filteredShayaris.map((shayari) => (
                                <ShayariCard key={shayari.id} shayari={shayari} />
                            ))}
                        </motion.div>

                        {!user && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="glass-panel"
                                style={{
                                    textAlign: 'center',
                                    padding: '4rem 2rem',
                                    maxWidth: '800px',
                                    margin: '0 auto',
                                    borderRadius: '24px',
                                    border: '1px solid var(--color-primary)',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                                }}
                            >
                                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                                    The Universe Awaits
                                </h3>
                                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                                    Join RuhVerse to explore unlimited poetry, share your own soul's voice, and connect with a galaxy of poets.
                                </p>
                                <Link to="/signup" className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', textDecoration: 'none', display: 'inline-block' }}>
                                    Join Now
                                </Link>
                                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                                    Already a traveler? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Log in</Link>
                                </p>
                            </motion.div>
                        )}
                    </>
                )}
            </main>

            <Footer />

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={addShayari}
            />

            <WhisperingSea />
        </div>
    );
}
