import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { uploadToCloudinary } from '../lib/cloudinary';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [favorites, setFavorites] = useState([]);
    const [likes, setLikes] = useState([]);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin, is_verified, avatar_url, bio')
                    .eq('id', session.user.id)
                    .single();

                // Fetch favorites (Bookmarks)
                const { data: favs } = await supabase
                    .from('favorites')
                    .select('shayari_id')
                    .eq('user_id', session.user.id);

                setFavorites(favs ? favs.map(f => f.shayari_id) : []);

                // Fetch likes (Hearts)
                const { data: userLikes } = await supabase
                    .from('likes')
                    .select('shayari_id')
                    .eq('user_id', session.user.id);

                setLikes(userLikes ? userLikes.map(l => l.shayari_id) : []);

                // Fetch following
                let followingNames = [];
                const { data: followsData } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', session.user.id);

                if (followsData && followsData.length > 0) {
                    const ids = followsData.map(f => f.following_id);
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .in('id', ids);

                    if (profilesData) {
                        followingNames = profilesData.map(p => p.full_name);
                    }
                }

                setUser({
                    ...session.user,
                    isAdmin: profile?.is_admin || false,
                    isVerified: profile?.is_verified || false,
                    avatarImage: profile?.avatar_url || session.user.user_metadata?.avatar_url,
                    bio: profile?.bio || session.user.user_metadata?.bio,
                    followersCount: 0, // Placeholder
                    following: followingNames,
                    likes: userLikes ? userLikes.map(l => l.shayari_id) : []
                });
            } else {
                setUser(null);
                setFavorites([]);
                setLikes([]);
            }
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin, is_verified, avatar_url')
                    .eq('id', session.user.id)
                    .single();

                const { data: favs } = await supabase
                    .from('favorites')
                    .select('shayari_id')
                    .eq('user_id', session.user.id);

                setFavorites(favs ? favs.map(f => f.shayari_id) : []);

                const { data: userLikes } = await supabase
                    .from('likes')
                    .select('shayari_id')
                    .eq('user_id', session.user.id);
                setLikes(userLikes ? userLikes.map(l => l.shayari_id) : []);

                // Fetch following (Duplicate logic for auth change)
                let followingNames = [];
                const { data: followsData } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', session.user.id);

                if (followsData && followsData.length > 0) {
                    const ids = followsData.map(f => f.following_id);
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .in('id', ids);

                    if (profilesData) {
                        followingNames = profilesData.map(p => p.full_name);
                    }
                }

                setUser({
                    ...session.user,
                    isAdmin: profile?.is_admin || false,
                    isVerified: profile?.is_verified || false,
                    avatarImage: profile?.avatar_url || session.user.user_metadata?.avatar_url,
                    bio: profile?.bio || session.user.user_metadata?.bio,
                    followersCount: 0,
                    following: followingNames,
                    likes: userLikes ? userLikes.map(l => l.shayari_id) : []
                });
            } else {
                setUser(null);
                setFavorites([]);
                setLikes([]);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signup = async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
                },
            },
        });
        if (error) throw error;
        if (data?.session) {
            setUser(data.session.user);
            setFavorites([]);
        }
        return data;
    };

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setFavorites([]);
    };

    const toggleFavorite = async (shayariId) => {
        if (!user) return false;

        // Logic for BOOKMARKS (Private)
        const isFavorited = favorites.includes(shayariId);

        // Optimistic Update
        const newFavorites = isFavorited
            ? favorites.filter(id => id !== shayariId)
            : [...favorites, shayariId];

        setFavorites(newFavorites);

        try {
            if (isFavorited) {
                // Remove from DB
                const { error } = await supabase
                    .from('favorites')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('shayari_id', shayariId);
                if (error) throw error;
            } else {
                // Add to DB
                const { error } = await supabase
                    .from('favorites')
                    .insert([{ user_id: user.id, shayari_id: shayariId }]);
                if (error) throw error;
            }
            return !isFavorited;
        } catch (error) {
            console.error("Error toggling favorite:", error);
            // Revert on error
            setFavorites(favorites);
            throw error;
        }
    };

    const toggleLike = async (shayariId) => {
        if (!user) return false;
        // Logic for LIKES (Public)
        const isLiked = likes.includes(shayariId);
        const newLikes = isLiked ? likes.filter(id => id !== shayariId) : [...likes, shayariId];
        setLikes(newLikes);

        // Update user object locally for consistency
        setUser(prev => ({ ...prev, likes: newLikes }));

        try {
            if (isLiked) {
                const { error } = await supabase.from('likes').delete().eq('user_id', user.id).eq('shayari_id', shayariId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('likes').insert([{ user_id: user.id, shayari_id: shayariId }]);
                if (error) throw error;
            }
            return !isLiked;
        } catch (error) {
            console.error("Error toggling like:", error);
            setLikes(likes);
            setUser(prev => ({ ...prev, likes: likes }));
            throw error;
        }
    };

    const updateUser = async (updates) => {
        if (!user) return;

        let avatarUrl = user.user_metadata.avatar_url;

        // If a new avatar file is provided, upload it
        if (updates.avatarFile) {
            try {
                const uploadResult = await uploadToCloudinary(updates.avatarFile);
                avatarUrl = uploadResult.url;
            } catch (error) {
                console.error("Avatar upload failed:", error);
                throw new Error("Failed to upload avatar image.");
            }
        }
        // Typically, if no file but manual seed change, we use dicebear
        else if (updates.avatarSeed && updates.avatarSeed !== user.user_metadata.avatar_url) {
            // Only update if explicit seed change and no file
            avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${updates.avatarSeed}`;
        }
        // If user explicitly asks to remove avatar (not handled in UI currently but good practice)

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                full_name: updates.name,
                avatar_url: avatarUrl,
                bio: updates.bio,
                updated_at: new Date()
            }, { onConflict: 'id' });

        if (error) throw error;
        setUser(prev => ({
            ...prev,
            ...updates,
            user_metadata: { ...prev.user_metadata, avatar_url: avatarUrl, full_name: updates.name, bio: updates.bio }
        }));
    };

    const submitVerification = async ({ phone, idImage, fullName }) => {
        if (!user) return;
        let idImageUrl = null;
        if (idImage) {
            try {
                // If idImage is a blob URL (from FileReader), we need to fetch it to get a blob, 
                // OR ideally, handleImageUpload should store the File object, not just base64/blob.
                // Assuming idImage is a base64 string or blob url which we can fetch.
                const res = await fetch(idImage);
                const blob = await res.blob();
                const file = new File([blob], `id_${user.id}_${Date.now()}.png`, { type: blob.type });

                const uploadResult = await uploadToCloudinary(file);
                idImageUrl = uploadResult.url;
            } catch (error) {
                console.error("ID Upload failed:", error);
                throw new Error("Failed to upload ID document.");
            }
        }

        const { error } = await supabase
            .from('verification_requests')
            .insert([{
                user_id: user.id,
                full_name: fullName,
                phone: phone,
                id_image_url: idImageUrl,
                status: 'pending'
            }]);

        if (error) {
            console.error("Verification submit error:", error);
            throw error;
        }
    };

    const value = {
        user: user ? {
            ...user,
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
            email: user.email,
            favorites: favorites, // Bookmarks
            likes: likes // Hearts
        } : null,
        loading,
        signup,
        login,
        logout,
        toggleFavorite,
        toggleLike,
        updateUser,
        verificationRequests: [], // Placeholder
        submitVerification,

        // Follow System
        followUser: async (targetName) => {
            if (!user) return;
            try {
                // 1. Resolve Name to ID
                const { data: targetProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('full_name', targetName)
                    .single();

                if (profileError || !targetProfile) throw new Error("User not found");

                // 2. Insert Follow
                const { error: followError } = await supabase
                    .from('follows')
                    .insert([{ follower_id: user.id, following_id: targetProfile.id }]);

                if (followError) throw followError;

                // 3. Update Local State (Optimistic or Refetch)
                setUser(prev => ({
                    ...prev,
                    following: [...(prev.following || []), targetName]
                }));
            } catch (error) {
                console.error("Follow error:", error);
                throw error;
            }
        },

        unfollowUser: async (targetName) => {
            if (!user) return;
            try {
                // 1. Resolve Name to ID
                const { data: targetProfile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('full_name', targetName)
                    .single();

                if (profileError || !targetProfile) throw new Error("User not found");

                // 2. Delete Follow
                const { error: unfollowError } = await supabase
                    .from('follows')
                    .delete()
                    .eq('follower_id', user.id)
                    .eq('following_id', targetProfile.id);

                if (unfollowError) throw unfollowError;

                // 3. Update Local State
                setUser(prev => ({
                    ...prev,
                    following: (prev.following || []).filter(name => name !== targetName)
                }));
            } catch (error) {
                console.error("Unfollow error:", error);
                throw error;
            }
        }
    };

    return (
        <AuthContext.Provider value={value} >
            {!loading && children
            }
        </AuthContext.Provider >
    );
}
