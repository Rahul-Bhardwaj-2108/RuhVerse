import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--color-text-muted)',
            borderTop: '1px solid var(--color-border)',
            marginTop: 'auto'
        }}>
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                Made with <Heart size={14} fill="var(--color-primary)" stroke="none" /> in RuhVerse
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
                © {new Date().getFullYear()} RuhVerse. All rights reserved.
            </p>
        </footer>
    );
}
