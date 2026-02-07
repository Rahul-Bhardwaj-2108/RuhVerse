import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShayaris } from '../hooks/useShayaris';
import { Header } from '../components/Header';
import { Check, X, Shield, Clock, Users, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';

export function AdminDashboard() {
    const { user } = useAuth();
    const { shayaris } = useShayaris();
    const { addToast } = useToast();
    const [verificationRequests, setVerificationRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.isAdmin) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('verification_requests')
                .select('*, profiles:user_id(email)') // Fetch email from profiles if possible, or just use what we have
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVerificationRequests(data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const approveRequest = async (requestId, userId) => {
        try {
            // 1. Update request status
            const { error: reqError } = await supabase
                .from('verification_requests')
                .update({ status: 'approved' })
                .eq('id', requestId);

            if (reqError) throw reqError;

            // 2. Update user profile to verified
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ is_verified: true })
                .eq('id', userId);

            if (profileError) throw profileError;

            addToast("User verified successfully", "success");
            setVerificationRequests(prev => prev.filter(r => r.id !== requestId));
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
            setVerificationRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error) {
            console.error("Rejection failed:", error);
            addToast("Failed to reject request", "error");
        }
    };

    if (!user?.isAdmin) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#fdfbf7' }}>
            <Header />

            <main className="container" style={{ padding: '2rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Shield size={24} style={{ color: 'var(--color-primary)' }} />
                    <h1 style={{ fontFamily: 'var(--font-serif)', margin: 0 }}>Admin Dashboard</h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Total Users</span>
                            <Users size={20} />
                        </div>
                        <span style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)' }}>1,248</span>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Active Today</span>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                        </div>
                        <span style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)' }}>42</span>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Total Writings</span>
                            <BookOpen size={20} />
                        </div>
                        <span style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-main)' }}>{shayaris.length}</span>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Pending Reviews</span>
                            <Shield size={20} />
                        </div>
                        <span style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>{verificationRequests.length}</span>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} /> Pending Requests ({verificationRequests.length})
                    </h3>

                    {loading ? (
                        <p>Loading requests...</p>
                    ) : verificationRequests.length === 0 ? (
                        <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No pending verification requests.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {verificationRequests.map(request => (
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
                                            {/* Note: request.profiles might be an array or object depending on join */}
                                            <span><strong>Email:</strong> {request.profiles?.email || 'N/A'}</span>
                                            <span><strong>Phone:</strong> {request.phone}</span>
                                            <span><strong>User ID:</strong> <small>{request.user_id}</small></span>
                                            <span><strong>Date:</strong> {new Date(request.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
