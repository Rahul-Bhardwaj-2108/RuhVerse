import React, { useState, useEffect } from 'react';
import { compressImage } from '../lib/imageUtils';
import { useAuth } from '../context/AuthContext';
import { useShayaris } from '../hooks/useShayaris';
import { useToast } from '../context/ToastContext';
import { ShayariCard } from '../components/ShayariCard';
import { Header } from '../components/Header';
import { CreateModal } from '../components/CreateModal';
import { SkeletonGrid } from '../components/SkeletonCard';

import { CameraModal } from '../components/CameraModal';
import { User, Save, RefreshCw, PenTool, BookOpen, Camera, Upload, Heart, Image as ImageIcon, LogOut, Shield, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
    const { user, updateUser, logout, verificationRequests } = useAuth();
    const { shayaris, addShayari, loading } = useShayaris();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('collection');
    const [isModalOpen, setIsModalOpen] = useState(false);


    // Profile Form State
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarSeed, setAvatarSeed] = useState('');
    const [avatarImage, setAvatarImage] = useState(null); // Base64 string for preview
    const [avatarFile, setAvatarFile] = useState(null); // Actual File object to upload

    // Camera Feature State
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setAvatarSeed(user.avatarSeed || user.name || 'default');
            setAvatarImage(user.avatarImage || null);
        }
    }, [user]);

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateUser({ name, bio, avatarSeed, avatarImage, avatarFile });
            addToast("Profile updated successfully!", "success");
        } catch (error) {
            console.error("Profile save error:", error);
            addToast(error.message || "Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        addToast("Logged out successfully");
    };

    const handleRandomizeAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        setAvatarSeed(randomSeed);
        setAvatarImage(null); // Clear uploaded image if randomizing
        setAvatarFile(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Compress image before setting state
                const compressedFile = await compressImage(file, 800, 800, 0.8);
                setAvatarFile(compressedFile);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setAvatarImage(reader.result);
                    setShowAvatarMenu(false);
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error("Compression failed:", error);
                // Fallback to original file
                setAvatarFile(file);
                addToast("Image compression failed, using original.", "error");
            }
        }
    };

    const handleCameraCapture = (imageData) => {
        setAvatarImage(imageData);

        // Convert Base64 into a File object for upload
        try {
            const arr = imageData.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], `camera_capture_${Date.now()}.png`, { type: mime });
            setAvatarFile(file);
        } catch (error) {
            console.error("Failed to process camera image:", error);
        }
    };

    const myShayaris = (shayaris || []).filter(s =>
        (user?.id && s.user_id === user.id) ||
        (!s.user_id && s.author === user?.name)
    );

    // Helper to get correct avatar source
    const getAvatarSrc = () => {
        if (user?.avatarImage) return user.avatarImage; // Use user's saved image if available
        if (avatarImage) return avatarImage; // Use currently uploaded image if available
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.avatarSeed || user?.name || 'default'}`;
    };

    if (!user) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>Please log in to view your dashboard.</div>;
    }



    // Admin Actions
    const [adminRequests, setAdminRequests] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'admin' && user?.isAdmin) {
            fetchRequests();
        }
    }, [activeTab, user]);

    const fetchRequests = async () => {
        setAdminLoading(true);
        try {
            const { data, error } = await supabase
                .from('verification_requests')
                .select('*, profiles:user_id(email)')
                .select('*, profiles:user_id(email)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAdminRequests(data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setAdminLoading(false);
        }
    };

    const approveRequest = async (requestId, userId) => {
        try {
            const { error: reqError } = await supabase
                .from('verification_requests')
                .update({ status: 'approved' })
                .eq('id', requestId);

            if (reqError) throw reqError;

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ is_verified: true })
                .eq('id', userId);

            if (profileError) throw profileError;

            addToast("User verified successfully", "success");
            addToast("User verified successfully", "success");
            setAdminRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
        } catch (error) {
            console.error("Approval failed:", error);
            addToast("Failed to approve request", "error");
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            const { error } = await supabase
                .from('verification_requests')
                .update({ status: 'rejected' })
                .eq('id', requestId);

            if (error) throw error;

            addToast("Request rejected", "info");
            addToast("Request rejected", "info");
            setAdminRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
        } catch (error) {
            console.error("Rejection failed:", error);
            addToast("Failed to reject request", "error");
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', transition: 'background-color 0.3s ease' }}>
            <Header onWriteClick={() => setIsModalOpen(true)} />

            <main style={{ flex: 1, paddingBottom: '6rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>

                    {/* Minimalist Header / Profile Section */}
                    <div className="fade-in" style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '3rem' }}>
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.5rem',
                            overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)'
                        }}>
                            <img src={getAvatarSrc()} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: (user?.avatarImage || avatarImage) ? 'none' : 'scale(1.1)' }} />
                        </div>

                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {user.name}
                            {user.isVerified && <span title="Verified Poet" style={{ color: 'var(--color-primary)', display: 'flex' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span>}
                        </h1>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: '1.6', padding: '0 1rem' }}>
                            {user.bio || 'Crafting silence into words.'}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {myShayaris.length} writings
                            </span>

                            <button
                                onClick={handleLogout}
                                className="hover-scale"
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '50px',
                                    padding: '0.5rem 1.25rem',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s',
                                    fontWeight: '500'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#e11d48';
                                    e.currentTarget.style.color = '#e11d48';
                                    e.currentTarget.style.background = '#fff0f2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                                    e.currentTarget.style.color = 'var(--color-text-muted)';
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <LogOut size={14} />
                                Sign Out
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="scroll-tabs" style={{
                        display: 'flex', justifyContent: 'center', gap: '3rem',
                        marginBottom: '4rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1px',
                        overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch'
                    }}>
                        <style>{`
                            @media (max-width: 600px) {
                                .scroll-tabs {
                                    justify-content: flex-start !important;
                                    padding-left: 1rem;
                                    padding-right: 1rem;
                                    gap: 1.5rem !important;
                                }
                                .scroll-tabs button {
                                    font-size: 1rem !important;
                                    padding: 0.75rem 0 !important;
                                }
                            }
                        `}</style>
                        <button
                            onClick={() => setActiveTab('collection')}
                            style={{
                                background: 'none', border: 'none',
                                padding: '1rem 0',
                                fontFamily: 'var(--font-serif)', fontSize: '1.1rem',
                                color: activeTab === 'collection' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                borderBottom: activeTab === 'collection' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                cursor: 'pointer', transition: 'color 0.2s', flexShrink: 0
                            }}
                        >
                            Collection
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            style={{
                                background: 'none', border: 'none',
                                padding: '1rem 0',
                                fontFamily: 'var(--font-serif)', fontSize: '1.1rem',
                                color: activeTab === 'favorites' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                borderBottom: activeTab === 'favorites' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                cursor: 'pointer', transition: 'color 0.2s', flexShrink: 0
                            }}
                        >
                            Favorites
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            style={{
                                background: 'none', border: 'none',
                                padding: '1rem 0',
                                fontFamily: 'var(--font-serif)', fontSize: '1.1rem',
                                color: activeTab === 'settings' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                borderBottom: activeTab === 'settings' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                cursor: 'pointer', transition: 'color 0.2s', flexShrink: 0
                            }}
                        >
                            Edit Profile
                        </button>
                        {user.isAdmin && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                style={{
                                    background: 'none', border: 'none',
                                    padding: '1rem 0',
                                    fontFamily: 'var(--font-serif)', fontSize: '1.1rem',
                                    color: activeTab === 'admin' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                    borderBottom: activeTab === 'admin' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                    cursor: 'pointer', transition: 'color 0.2s', flexShrink: 0
                                }}
                            >
                                Admin Support
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="fade-in">
                        {activeTab === 'collection' && (
                            <div>
                                {loading ? (
                                    <SkeletonGrid count={3} />
                                ) : myShayaris.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
                                        <BookOpen size={48} strokeWidth={1} style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>Your pages are waiting.</p>
                                        {user.isVerified ? (
                                            <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ background: 'var(--color-text-main)', color: '#fff' }}>
                                                Write Something
                                            </button>
                                        ) : (
                                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Verify your account to start writing.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', maxWidth: '600px', margin: '0 auto' }}>
                                        {myShayaris.map(shayari => (
                                            <ShayariCard key={shayari.id} shayari={shayari} />
                                        ))}
                                    </div>
                                )}

                                {myShayaris.length > 0 && user.isVerified && (
                                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                                        <button onClick={() => setIsModalOpen(true)} style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.75rem 1.5rem', background: '#fff', border: '1px solid #ddd', borderRadius: '50px',
                                            color: 'var(--color-text-main)', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                                        }}>
                                            <PenTool size={14} /> Write New Entry
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div>
                                {loading ? (
                                    <SkeletonGrid count={3} />
                                ) : (!user.favorites || user.favorites.length === 0) ? (
                                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
                                        <Heart size={48} strokeWidth={1} style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>No favorites yet.</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Heart items from the feed to save them here.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', maxWidth: '600px', margin: '0 auto' }}>
                                        {shayaris
                                            .filter(s => Array.isArray(user.favorites) && user.favorites.includes(s.id))
                                            .map(shayari => (
                                                <ShayariCard key={shayari.id} shayari={shayari} />
                                            ))
                                        }
                                        {shayaris.filter(s => Array.isArray(user.favorites) && user.favorites.includes(s.id)).length === 0 && user.favorites?.length > 0 && (
                                            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                                Items you favorited may have been removed.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="glass-panel slide-up" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
                                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                    {/* Avatar Section */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                                        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-surface)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                                                <img
                                                    src={avatarImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                                                    alt="preview"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div style={{
                                                position: 'absolute', bottom: '0', right: '0',
                                                zIndex: 10
                                            }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                                                    className="hover-scale"
                                                    style={{
                                                        background: 'var(--color-primary)', color: '#fff', border: 'none',
                                                        width: '36px', height: '36px', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                                                    }}
                                                >
                                                    <Camera size={18} />
                                                </button>

                                                {showAvatarMenu && (
                                                    <div className="fade-in" style={{
                                                        position: 'absolute', top: '100%', right: '-20px', marginTop: '10px',
                                                        background: 'var(--color-surface)', borderRadius: '12px', padding: '0.5rem',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid var(--color-border)',
                                                        width: '180px', display: 'flex', flexDirection: 'column', gap: '0.25rem'
                                                    }}>

                                                        <label style={{
                                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                            padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '8px',
                                                            background: 'hover: #f9f9f9', fontSize: '0.9rem', color: 'var(--color-text-main)',
                                                            transition: 'background 0.2s'
                                                        }} className="menu-item">
                                                            <Upload size={16} /> Upload Photo
                                                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                                        </label>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsCameraModalOpen(true);
                                                                setShowAvatarMenu(false);
                                                            }}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                                                padding: '0.75rem 1rem', cursor: 'pointer', borderRadius: '8px',
                                                                background: 'none', border: 'none', fontSize: '0.9rem',
                                                                color: 'var(--color-text-main)', width: '100%', textAlign: 'left'
                                                            }}
                                                            className="menu-item"
                                                        >
                                                            <Camera size={16} /> Take Photo
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button type="button" onClick={handleRandomizeAvatar} style={{
                                            fontSize: '0.85rem', color: 'var(--color-text-muted)', background: 'none', border: 'none',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.03)'
                                        }} className="hover-scale">
                                            <RefreshCw size={14} /> Generate Random Avatar
                                        </button>
                                    </div>

                                    {/* Inputs Section */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter your name"
                                                style={{
                                                    width: '100%', padding: '1rem',
                                                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                                    borderRadius: '8px', fontSize: '1rem',
                                                    fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)',
                                                    transition: 'all 0.2s'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio</label>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                placeholder="Tell your story..."
                                                style={{
                                                    width: '100%', padding: '1rem',
                                                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                                    borderRadius: '8px', fontSize: '1rem',
                                                    fontFamily: 'var(--font-sans)', lineHeight: '1.6', color: 'var(--color-text-main)',
                                                    minHeight: '120px', resize: 'vertical', transition: 'all 0.2s'
                                                }}
                                            />
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                                                {bio.length}/160 characters
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap-reverse' }}>
                                        <button type="button" onClick={() => setActiveTab('collection')} style={{
                                            padding: '0.75rem 1.5rem', borderRadius: '50px',
                                            background: 'transparent', color: 'var(--color-text-muted)',
                                            border: '1px solid var(--color-border)',
                                            fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500',
                                            flex: '1', textAlign: 'center'
                                        }}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary" disabled={isSaving} style={{
                                            padding: '0.75rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer',
                                            flex: '2', minWidth: '150px',
                                            background: isSaving ? 'var(--color-text-muted)' : 'var(--color-primary)',
                                            color: '#fff'
                                        }}>
                                            {isSaving ? <span className="animate-spin" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}></span> : <Save size={18} />}
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'admin' && user?.isAdmin && (
                            <div>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Shield size={20} /> Verification Requests ({adminRequests.length})
                                </h3>
                                {adminLoading ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading requests...</div>
                                ) : adminRequests.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
                                        <p style={{ fontStyle: 'italic' }}>No verification requests found.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {adminRequests.map(request => (
                                            <div key={request.id} style={{
                                                background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem',
                                                display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '2rem', alignItems: 'center'
                                            }}>
                                                {/* ID Photo Preview */}
                                                <div style={{
                                                    width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden',
                                                    background: '#f5f5f5', border: '1px solid #ddd'
                                                }}>
                                                    {request.id_image_url ? (
                                                        <a href={request.id_image_url} target="_blank" rel="noopener noreferrer">
                                                            <img src={request.id_image_url} alt="ID" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        </a>
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.7rem' }}>No Image</div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div>
                                                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{request.full_name}</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '0.5rem 2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                                        <span><strong>Email:</strong> {request.profiles?.email || 'N/A'}</span>
                                                        <span><strong>Phone:</strong> {request.phone}</span>
                                                        <span><strong>User ID:</strong> <small>{request.user_id}</small></span>
                                                        <span><strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                {/* Actions or Status */}
                                                <div style={{ display: 'flex', gap: '0.5rem', minWidth: '160px', justifyContent: 'flex-end' }}>
                                                    {request.status === 'pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => approveRequest(request.id, request.user_id)}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                                    padding: '0.5rem 1rem', background: '#dcfce7', color: '#166534',
                                                                    border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer'
                                                                }}
                                                            >
                                                                <Check size={16} /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => rejectRequest(request.id)}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                                    padding: '0.5rem 1rem', background: '#fee2e2', color: '#991b1b',
                                                                    border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer'
                                                                }}
                                                            >
                                                                <X size={16} /> Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span style={{
                                                            padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500',
                                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                            background: request.status === 'approved' ? '#dcfce7' : '#f3f4f6',
                                                            color: request.status === 'approved' ? '#166534' : '#374151',
                                                            border: request.status === 'approved' ? '1px solid #bbf7d0' : '1px solid #e5e7eb'
                                                        }}>
                                                            {request.status === 'approved' ? <Check size={16} /> : null}
                                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div >
            </main >

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={addShayari}
            />

            <CameraModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handleCameraCapture}
            />
        </div >
    );
}
