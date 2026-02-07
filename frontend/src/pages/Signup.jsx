import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft } from 'lucide-react';

export function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signup } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name && email && password) {
            try {
                const result = await signup(name, email, password);
                if (result?.session) {
                    addToast(`Welcome to RuhVerse, ${name}!`, "success");
                    navigate('/');
                } else if (result?.user) {
                    addToast("Account created! Please check your email to confirm.", "info");
                    navigate('/login');
                }
            } catch (error) {
                console.error("Signup Error:", error);
                addToast(error.message || "Failed to create account", "error");
            }
        } else {
            addToast("Please fill in all fields", "error");
        }
    };

    return (
        <div className="fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="glass-panel auth-card">
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to Home
                </Link>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '4px', border: '1px solid var(--color-primary)', borderRadius: '50%', display: 'flex' }}>
                            <div style={{ width: '24px', height: '24px', background: 'var(--color-primary)', transform: 'rotate(45deg)', borderRadius: '0 50% 50% 50%' }}></div>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', letterSpacing: '-0.02em', color: 'var(--color-text-main)' }}>
                            Ruh<span style={{ color: 'var(--color-text-muted)' }}>Verse</span>
                        </h1>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-text-main)' }}>
                        Join our community
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                        Begin your poetic journey today
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{
                                width: '100%', padding: '1rem',
                                background: '#fcfcfc', border: '1px solid #e5e5e5', borderRadius: '12px',
                                fontSize: '1rem', outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '1rem',
                                background: '#fcfcfc', border: '1px solid #e5e5e5', borderRadius: '12px',
                                fontSize: '1rem', outline: 'none'
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '1rem',
                                background: '#fcfcfc', border: '1px solid #e5e5e5', borderRadius: '12px',
                                fontSize: '1rem', outline: 'none'
                            }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}>
                        Create Account
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--color-text-main)', fontWeight: '600' }}>Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
