import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Header } from '../components/Header';
import { ArrowRight, Lock } from 'lucide-react';

export function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Remove artificial delay for a faster experience, or keep a small one if desired for UX smoothing
            // await new Promise(resolve => setTimeout(resolve, 500)); 

            await login(email, password);

            addToast("Welcome back!", "success");
            if (email === 'admin@ruhverse.com') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error("Login error:", error);
            addToast(error.message || "Invalid email or password", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
            <Header />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="scale-up auth-card">
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                            Welcome back
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>Sign in to continue your journey</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)', color: 'var(--color-text-main)', outline: 'none', transition: 'border 0.2s', fontSize: '1rem'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-main)' }}>Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border)',
                                    background: 'var(--color-bg)', color: 'var(--color-text-main)', outline: 'none', transition: 'border 0.2s', fontSize: '1rem'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary"
                            style={{
                                marginTop: '1rem', width: '100%', justifyContent: 'center', padding: '1rem',
                                opacity: isLoading ? 0.8 : 1
                            }}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>Join now</Link>
                    </div>


                </div>
            </main>
        </div>
    );
}
