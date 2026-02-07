import React, { createContext, useContext, useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            {/* Toast Container */}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                zIndex: 2000
            }}>
                {toasts.map((toast) => (
                    <div key={toast.id} className="slide-up" style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-text-main)',
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        border: '1px solid var(--color-primary)',
                        minWidth: '250px'
                    }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
