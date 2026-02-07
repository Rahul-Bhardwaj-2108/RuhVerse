import React from 'react';

export function SkeletonCard() {
    // Shimmer effect styles
    const shimmerStyle = {
        background: 'linear-gradient(90deg, var(--color-surface) 0%, var(--color-bg) 50%, var(--color-surface) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        borderRadius: '4px',
    };

    const cardStyle = {
        background: 'var(--color-surface)',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
        border: '1px solid var(--color-border)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    };

    return (
        <div style={cardStyle}>
            <style>
                {`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                `}
            </style>

            {/* Quote Icon Placeholder */}
            <div style={{ ...shimmerStyle, width: '40px', height: '40px', borderRadius: '50%', marginBottom: '1.5rem', opacity: 0.5 }}></div>

            {/* Content Text Lines */}
            <div style={{ marginBottom: '2rem', flex: 1 }}>
                <div style={{ ...shimmerStyle, width: '100%', height: '24px', marginBottom: '1rem' }}></div>
                <div style={{ ...shimmerStyle, width: '90%', height: '24px', marginBottom: '1rem' }}></div>
                <div style={{ ...shimmerStyle, width: '95%', height: '24px', marginBottom: '1rem' }}></div>
            </div>

            {/* Footer / Author section */}
            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ ...shimmerStyle, width: '40px', height: '40px', borderRadius: '50%' }}></div>
                    <div>
                        <div style={{ ...shimmerStyle, width: '100px', height: '16px', marginBottom: '0.25rem' }}></div>
                        <div style={{ ...shimmerStyle, width: '60px', height: '12px' }}></div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ ...shimmerStyle, width: '32px', height: '32px', borderRadius: '50%' }}></div>
                    <div style={{ ...shimmerStyle, width: '32px', height: '32px', borderRadius: '50%' }}></div>
                </div>
            </div>
        </div>
    );
}

// Helper to render multiple skeletons
export function SkeletonGrid({ count = 6 }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '3rem',
            marginBottom: '4rem',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

export function ProfileHeaderSkeleton() {
    const shimmerStyle = {
        background: 'linear-gradient(90deg, var(--color-surface) 0%, var(--color-bg) 50%, var(--color-surface) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        borderRadius: '4px',
    };

    return (
        <div style={{
            textAlign: 'center', marginBottom: '4rem',
            padding: '3rem', background: 'rgba(255,255,255,0.05)',
            borderRadius: '24px', border: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
            <style>
                {`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                `}
            </style>

            {/* Avatar */}
            <div style={{ ...shimmerStyle, width: '120px', height: '120px', borderRadius: '50%', marginBottom: '1.5rem' }}></div>

            {/* Name */}
            <div style={{ ...shimmerStyle, width: '200px', height: '40px', marginBottom: '1rem' }}></div>

            {/* Stats */}
            <div style={{ ...shimmerStyle, width: '300px', height: '20px', marginBottom: '1.5rem' }}></div>

            {/* Button */}
            <div style={{ ...shimmerStyle, width: '120px', height: '40px', borderRadius: '50px' }}></div>
        </div>
    );
}
