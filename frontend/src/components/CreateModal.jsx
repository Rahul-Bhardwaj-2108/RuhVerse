import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CreateModal({ isOpen, onClose, onSubmit }) {
    const [content, setContent] = useState('');

    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            // Create local preview URL
            const url = URL.createObjectURL(file);
            setMediaPreview({ url, type: file.type });
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (content.trim() || mediaFile) {
            setIsSubmitting(true);
            try {
                // Remove hard timeout. Let the network request fetch/fail naturally.
                // We can add a "taking long" UI indicator if needed, but killing it is bad UX for slow uploads.
                const success = await onSubmit(content, null, mediaFile);

                if (success) {
                    setContent('');
                    setMediaFile(null);
                    setMediaPreview(null);
                    onClose();
                } else {
                    // Stay open, let user try again. The alert is handled in useShayaris usually or valid here.
                    // If onSubmit returns false, it usually alerted already.
                }
            } catch (error) {
                console.error("Failed to publish:", error);
                alert("Error: " + (error.message || "Failed to publish"));
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="glass-panel"
                        style={{
                            width: '90%', maxWidth: '500px', padding: '2.5rem',
                            background: 'var(--color-surface)', // Use variable for dark mode support
                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '16px' // Ensure consistency
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.75rem', color: 'var(--color-text-main)', fontFamily: 'var(--font-serif)' }}>Pen Your Thoughts</h2>
                            <button onClick={onClose} className="btn-icon" style={{ color: 'var(--color-text-muted)' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <textarea
                                placeholder="Pour your heart out..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                style={{
                                    width: '100%', minHeight: '150px',
                                    background: 'var(--color-bg)', // Dynamic bg
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px', padding: '1.25rem',
                                    color: 'var(--color-text-main)',
                                    fontSize: '1.15rem',
                                    fontFamily: 'var(--font-serif)',
                                    lineHeight: '1.6',
                                    resize: 'vertical',
                                    marginBottom: '1rem',
                                    outline: 'none',
                                    transition: 'border 0.2s',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                }}
                                autoFocus
                            />

                            {/* Author name is now automatically taken from profile */}

                            {/* Media Upload */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label
                                    htmlFor="media-upload"
                                    className="btn-secondary"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        border: '1px dashed var(--color-border)',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '0.9rem',
                                        width: '100%',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span>📷 🎥 Add Photo or Video</span>
                                    <input
                                        id="media-upload"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                {mediaPreview && (
                                    <div style={{ marginTop: '1rem', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                        {mediaPreview.type.startsWith('video') ? (
                                            <video src={mediaPreview.url} controls style={{ width: '100%', display: 'block' }} />
                                        ) : (
                                            <img src={mediaPreview.url} alt="Preview" style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'cover' }} />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                                            style={{
                                                position: 'absolute', top: '8px', right: '8px',
                                                background: 'rgba(0,0,0,0.6)', color: '#fff',
                                                border: 'none', borderRadius: '50%',
                                                width: '24px', height: '24px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'end', gap: '1rem' }}>
                                <button type="button" onClick={onClose} style={{
                                    color: 'var(--color-text-muted)', padding: '0.75rem 1.5rem',
                                    fontWeight: '500', fontSize: '0.95rem', background: 'none', border: 'none', cursor: 'pointer'
                                }}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.7 : 1
                                }}>
                                    {isSubmitting ? 'Publishing...' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
