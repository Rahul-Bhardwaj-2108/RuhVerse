import React, { useRef, useState, useEffect } from 'react';
import { Heart, Share2, Download, Trash2, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import html2canvas from 'html2canvas';
import { useShayaris } from '../hooks/useShayaris';

export function ShayariCard({ shayari }) {
    const { user, toggleFavorite, toggleLike } = useAuth();
    const { deleteShayari } = useShayaris();
    const { addToast } = useToast();
    const cardRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Like Count (Public Heart)
    // Now comes from 'likes' relation
    const initialCount = shayari.likes && shayari.likes[0] ? shayari.likes[0].count : 0;
    const [likeCount, setLikeCount] = useState(initialCount);

    useEffect(() => {
        if (shayari.likes && shayari.likes[0]) {
            setLikeCount(shayari.likes[0].count);
        }
    }, [shayari.likes]);

    const isLiked = user?.likes?.includes(shayari.id);
    const isFavorited = user?.favorites?.includes(shayari.id);

    // Handle Public Like (Heart)
    const handleLike = async () => {
        if (!user) {
            addToast("Please login to like posts", "info");
            return;
        }

        const previousCount = likeCount;
        setLikeCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);

        try {
            const isNowLiked = await toggleLike(shayari.id);
        } catch (error) {
            console.error(error);
            setLikeCount(previousCount);
            addToast(`Action failed: ${error.message}`, "error");
        }
    };

    // Handle Private Favorite (Bookmark)
    const handleFavorite = async () => {
        if (!user) {
            addToast("Please login to see bookmarks", "info");
            return;
        }

        try {
            const isNowFav = await toggleFavorite(shayari.id);
            addToast(isNowFav ? "Saved to favorites" : "Removed from favorites", "success");
        } catch (error) {
            console.error(error);
            addToast("Failed to update favorite", "error");
        }
    };

    const handleShare = async () => {
        const authorName = shayari.author_name || shayari.author || 'Anonymous';
        const shareData = {
            title: `Shayari by ${authorName}`,
            text: `"${shayari.content}" - ${authorName}\n\nRead more on RuhVerse:`,
            url: `${window.location.origin}/profile/${encodeURIComponent(authorName)}`
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                addToast("Shared successfully!", "success");
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                    fallbackShare(shareData.text + " " + shareData.url);
                }
            }
        } else {
            fallbackShare(shareData.text + " " + shareData.url);
        }
    };

    const fallbackShare = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            addToast("Copied to clipboard!", "success");
        }).catch(() => {
            addToast("Failed to copy", "error");
        });
    };

    const handleDownloadImage = async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: null,
                onclone: (clonedDoc) => {
                    const clonedCard = clonedDoc.querySelector('.shayari-card');
                    if (clonedCard) {
                        clonedCard.style.height = 'auto';
                        clonedCard.style.minHeight = 'auto';
                        clonedCard.style.width = '600px';
                        clonedCard.style.maxWidth = 'none';

                        const isDark = document.documentElement.classList.contains('dark-theme');

                        if (isDark) {
                            clonedCard.style.background = '#0f172a';
                            clonedCard.style.color = '#e2e8f0';
                            clonedCard.style.border = '2px solid #fbbf24';
                        } else {
                            clonedCard.style.background = '#fffaf0';
                            clonedCard.style.color = '#1f1f1f';
                            clonedCard.style.border = '2px solid #d4af37';
                        }

                        clonedCard.style.padding = '3rem';
                        clonedCard.style.borderRadius = '20px';
                        clonedCard.style.boxShadow = 'none';
                        clonedCard.style.transform = 'none';
                        clonedCard.style.margin = '0';

                        const actions = clonedCard.querySelector('.card-actions');
                        if (actions) actions.style.display = 'none';

                        const content = clonedCard.querySelector('p');
                        if (content) {
                            content.style.fontSize = '1.5rem';
                            content.style.lineHeight = '1.8';
                            content.style.color = isDark ? '#f1f5f9' : '#000000';
                        }

                        // Add Watermark
                        const footer = document.createElement('div');
                        footer.style.marginTop = '2.5rem';
                        footer.style.paddingTop = '1.5rem';
                        footer.style.borderTop = `1px solid ${isDark ? '#334155' : '#e5e5e5'}`;
                        footer.style.display = 'flex';
                        footer.style.justifyContent = 'space-between';
                        footer.style.alignItems = 'center';

                        const brand = document.createElement('span');
                        brand.innerText = 'RuhVerse';
                        brand.style.fontFamily = 'serif';
                        brand.style.fontSize = '1rem';
                        brand.style.letterSpacing = '0.2em';
                        brand.style.textTransform = 'uppercase';
                        brand.style.color = isDark ? '#fbbf24' : '#d4af37';
                        brand.style.fontWeight = 'bold';

                        const date = document.createElement('span');
                        date.innerText = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                        date.style.fontSize = '0.8rem';
                        date.style.color = isDark ? '#94a3b8' : '#8c7b70';

                        footer.appendChild(brand);
                        footer.appendChild(date);
                        clonedCard.appendChild(footer);
                    }
                }
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            const author = shayari.author_name || shayari.author || 'Anonymous';
            link.download = `ruhverse-${author}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            addToast("Image downloaded!", "success");
        } catch (error) {
            console.error("Download failed:", error);
            addToast("Could not generate image.", "error");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this writing?")) {
            const success = await deleteShayari(shayari.id);
            if (success) {
                addToast("Writing deleted", "info");
            }
        }
    };

    return (
        <div
            ref={cardRef}
            className="shayari-card slide-up"
        >
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ color: 'var(--color-primary)', fontSize: '3rem', lineHeight: '1', fontFamily: 'serif', marginBottom: '0.5rem', opacity: '0.4' }}>“</div>
                {(shayari.media_url || shayari.mediaUrl) && (
                    <div style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                        {(shayari.media_type || shayari.mediaType)?.startsWith('video') ? (
                            <video
                                src={shayari.media_url || shayari.mediaUrl}
                                controls
                                playsInline
                                style={{ width: '100%', display: 'block', borderRadius: '12px' }}
                            />
                        ) : (
                            <img
                                src={shayari.media_url || shayari.mediaUrl}
                                alt="Shared moment"
                                style={{ width: '100%', display: 'block', borderRadius: '12px' }}
                            />
                        )}
                    </div>
                )}

                <style>{`
                    @media (max-width: 600px) {
                        .shayari-content {
                            font-size: 1.1rem !important;
                            line-height: 1.5 !important;
                        }
                    }
                `}</style>
                <p className="shayari-content" style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1.25rem',
                    color: 'var(--color-text-main)',
                    lineHeight: '1.6',
                    fontWeight: '400',
                    whiteSpace: 'pre-wrap'
                }}>
                    {shayari.content}
                </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Link to={`/profile/${encodeURIComponent(shayari.author)}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e5e5e5', overflow: 'hidden' }}>
                            <img
                                src={shayari.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${shayari.author_name || shayari.author}`}
                                alt="avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{shayari.author_name || shayari.author || 'Anonymous'}</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                {shayari.profiles?.is_admin ? 'Admin' : 'Aspiring Poet'}
                                <span style={{ margin: '0 0.5rem', opacity: 0.4 }}>•</span>
                                <span style={{ opacity: 0.8 }}>
                                    {new Date(shayari.created_at).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </span>
                        </div>
                    </Link>
                </div>

                <div
                    className="card-actions"
                    data-html2canvas-ignore={isDownloading ? "true" : "false"}
                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                    {user?.id === shayari.user_id && (
                        <button
                            onClick={handleDelete}
                            className="btn-icon"
                            title="Delete"
                            style={{ color: 'var(--color-text-muted)', marginRight: '0.5rem' }}
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button onClick={handleFavorite} className="btn-icon" title="Save for later" style={{
                        color: isFavorited ? '#d4af37' : 'var(--color-text-muted)',
                        marginRight: '0.25rem'
                    }}>
                        <Bookmark size={20} fill={isFavorited ? '#d4af37' : 'none'} />
                    </button>
                    <button onClick={handleDownloadImage} className="btn-icon" title="Save as Image">
                        <Download size={20} />
                    </button>
                    <button onClick={handleLike} className="btn-icon" style={{
                        color: isLiked ? '#e11d48' : 'var(--color-text-muted)',
                        background: isLiked ? 'rgba(225, 29, 72, 0.1)' : 'transparent',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <Heart size={20} fill={isLiked ? '#e11d48' : 'none'} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{likeCount > 0 ? likeCount : ''}</span>
                    </button>
                    <button onClick={handleShare} className="btn-icon">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
