import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useShayaris } from '../hooks/useShayaris';
import { useAuth } from '../context/AuthContext';
import { ShayariCard } from '../components/ShayariCard';
import { SkeletonGrid, ProfileHeaderSkeleton } from '../components/SkeletonCard';
import { Header } from '../components/Header';
import { UserPlus, UserCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function PublicProfile() {
    const { authorName } = useParams();
    const navigate = useNavigate();
    const { shayaris } = useShayaris();
    const { user, followUser, unfollowUser } = useAuth();
    const { addToast } = useToast();
    const [profile, setProfile] = useState(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Decode URI component in case names have spaces
    const decodedName = decodeURIComponent(authorName);

    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                // 1. Get Profile Details
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('full_name', decodedName)
                    .single();

                if (profileError) {
                    console.error("Error fetching profile:", profileError);
                    // Fallback if profile doesn't exist but has posts (legacy)
                    setProfile({ full_name: decodedName });
                } else {
                    setProfile(profileData);

                    // 2. Get Follower Count
                    const { count, error: countError } = await supabase
                        .from('follows')
                        .select('*', { count: 'exact', head: true })
                        .eq('following_id', profileData.id);

                    if (!countError) {
                        setFollowerCount(count || 0);
                    }
                }
            } catch (error) {
                console.error("Profile load error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [decodedName]);


    // Filter posts: Check both author_name (new) and author (legacy)
    const authorShayaris = shayaris.filter(s =>
        (s.author_name === decodedName) || (s.author === decodedName)
    );

    const isFollowing = user?.following?.includes(decodedName);
    const isMe = user?.name === decodedName;

    const handleFollowToggle = async () => {
        if (!user) {
            addToast("Please log in to follow poets", "info");
            navigate('/signup');
            return;
        }

        // Optimistic update for UI
        if (isFollowing) {
            await unfollowUser(decodedName);
            setFollowerCount(prev => Math.max(0, prev - 1));
            addToast(`Unfollowed ${decodedName}`, "success");
        } else {
            await followUser(decodedName);
            setFollowerCount(prev => prev + 1);
            addToast(`Following ${decodedName}`, "success");
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fdfbf7' }}>
                <Header />
                <main className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
                    <div style={{ marginBottom: '2rem', height: '24px' }}></div>
                    <ProfileHeaderSkeleton />
                    <SkeletonGrid count={3} />
                </main>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fdfbf7' }}>
            <Header />

            <main className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="hover-scale"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        marginBottom: '2rem', color: 'var(--color-text-muted)',
                        fontSize: '0.9rem', cursor: 'pointer', background: 'none', border: 'none'
                    }}
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Profile Header */}
                <div className="fade-in" style={{
                    textAlign: 'center', marginBottom: '4rem',
                    padding: '3rem', background: 'rgba(255,255,255,0.5)',
                    borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.1)'
                }}>
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 1.5rem',
                        overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                    }}>
                        <img
                            src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${decodedName}`}
                            alt={decodedName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                        {decodedName}
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                        <span>{authorShayaris.length} writings published</span>
                        <>
                            <span style={{ width: '4px', height: '4px', background: 'var(--color-text-muted)', borderRadius: '50%' }}></span>
                            <span>{followerCount} followers</span>
                        </>
                    </p>

                    {!isMe && (
                        <button
                            onClick={handleFollowToggle}
                            className="btn-primary"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                background: isFollowing ? '#fff' : 'var(--color-primary)',
                                color: isFollowing ? 'var(--color-text-main)' : '#fff',
                                border: isFollowing ? '1px solid var(--color-border)' : 'none'
                            }}
                        >
                            {isFollowing ? <><UserCheck size={18} /> Following</> : <><UserPlus size={18} /> Follow</>}
                        </button>
                    )}
                </div>

                {/* Content Grid */}
                <div className="slide-up" style={{ animationDelay: '0.1s' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
                        Published Works
                    </h3>

                    {authorShayaris.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                            <p>This poet hasn't shared anything yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', maxWidth: '600px', margin: '0 auto' }}>
                            {authorShayaris.map(shayari => (
                                <ShayariCard key={shayari.id} shayari={shayari} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
