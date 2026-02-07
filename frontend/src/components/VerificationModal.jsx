import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function VerificationModal({ isOpen, onClose }) {
    const { user, submitVerification } = useAuth();
    const { addToast } = useToast();

    const [phone, setPhone] = useState('');
    const [idImage, setIdImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await submitVerification({
                phone,
                idImage,
                email: user.email,
                fullName: user.name
            });
            addToast("Verification request submitted successfully!", "success");
            onClose();
        } catch (error) {
            console.error("Submission failed:", error);
            addToast("Failed to submit verification request.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(74, 59, 50, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="scale-up" style={{
                background: '#fff', padding: '2rem', borderRadius: '16px',
                width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-text-main)' }}>
                        Apply for Verification
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Full Name</label>
                        <input
                            type="text"
                            value={user.name}
                            disabled
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #eee',
                                background: '#f9f9f9', color: 'var(--color-text-muted)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd',
                                background: '#fff', color: 'var(--color-text-main)'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>Government ID / Photo</label>
                        <div style={{
                            border: '2px dashed #ddd', borderRadius: '8px', padding: '1.5rem',
                            textAlign: 'center', cursor: 'pointer', position: 'relative',
                            background: idImage ? `url(${idImage}) center/cover no-repeat` : '#fafafa',
                            height: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <input type="file" accept="image/*" required onChange={handleImageUpload} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                            {!idImage && (
                                <>
                                    <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Click to upload ID photo</span>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{
                            width: '100%', padding: '1rem', marginTop: '1rem',
                            opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
}
