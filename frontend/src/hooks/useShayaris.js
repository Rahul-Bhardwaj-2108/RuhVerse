import { useState, useEffect } from 'react';
import { uploadToCloudinary } from '../lib/cloudinary';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useShayaris() {
  const [shayaris, setShayaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Get current user

  // Fetch initial data
  const fetchShayaris = async () => {
    try {
      const { data, error } = await supabase
        .from('shayaris')
        .select(`
          *,
          profiles (
            is_admin,
            avatar_url
          ),
          likes (count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching shayaris:", error);
      } else {
        setShayaris(data || []);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShayaris();

    // Realtime subscription
    const channel = supabase
      .channel('public:shayaris')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'shayaris' }, (payload) => {
        setShayaris((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addShayari = async (content, author, mediaFile = null) => {
    let mediaUrl = null;
    let mediaType = null;

    // Use provided author or fall back to user name or Anonymous
    const finalAuthorName = author || user?.name || "Anonymous";

    if (mediaFile) {
      console.log("Starting media upload...", mediaFile.name);
      try {
        const uploadResult = await uploadToCloudinary(mediaFile);
        mediaUrl = uploadResult.url;
        mediaType = uploadResult.type;
        console.log("Media URL retrieved:", mediaUrl);
      } catch (error) {
        console.error("Upload process failed:", error);
        alert(`Failed to upload media: ${error.message}`);
        return false;
      }
    }

    console.log("Inserting shayari record...");
    try {
      const { error } = await supabase
        .from('shayaris')
        .insert([
          {
            content,
            author_name: finalAuthorName,
            user_id: user?.id || null, // Explicitly link to user
            media_url: mediaUrl,
            media_type: mediaType
          }
        ]);

      if (error) {
        console.error("Database insert error:", error);
        throw error;
      }

      console.log("Shayari inserted successfully.");
      return true;
    } catch (error) {
      console.error("Error adding shayari:", error);
      alert("Failed to post: " + (error.message || "Unknown error"));
      return false;
    }
  };
  const deleteShayari = async (id) => {
    try {
      const { error } = await supabase
        .from('shayaris')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Optimistic update or wait for realtime
      // For now, let's manually filter it out to be instant
      setShayaris(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting shayari:", error);
      alert("Failed to delete: " + (error.message || "Unknown error"));
      return false;
    }
  };

  return { shayaris, addShayari, deleteShayari, loading };
}
