import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check, RefreshCw, Aperture } from 'lucide-react';

export function CameraModal({ isOpen, onClose, onCapture }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
            setCapturedImage(null);
            setError(null);
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 480, height: 480, facingMode: "user" }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Unable to access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            const { videoWidth, videoHeight } = videoRef.current;

            // Set canvas size to match video
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            // Draw video frame to canvas
            context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

            // Convert to data URL
            const imageData = canvasRef.current.toDataURL('image/png');
            setCapturedImage(imageData);
        }
    };

    const handleConfirm = () => {
        onCapture(capturedImage);
        onClose();
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(57, 43, 88, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-panel slide-up" style={{
                width: '90%', maxWidth: '500px',
                background: '#fff', border: 'none',
                padding: '0', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{
                    padding: '1rem 1.5rem', borderBottom: '1px solid #eee',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>Take Photo</h3>
                    <button onClick={onClose} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', textAlign: 'center' }}>

                    {error ? (
                        <div style={{ padding: '2rem', color: '#e11d48', background: '#ffeef2', borderRadius: '8px' }}>
                            {error}
                        </div>
                    ) : (
                        <div style={{
                            width: '100%', aspectRatio: '1/1', background: '#000',
                            borderRadius: '12px', overflow: 'hidden', position: 'relative',
                            marginBottom: '1.5rem'
                        }}>
                            {!capturedImage ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                                />
                            ) : (
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                                />
                            )}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        {!capturedImage ? (
                            <button
                                onClick={capturePhoto}
                                disabled={!!error}
                                className="btn-primary"
                                style={{
                                    width: '64px', height: '64px', borderRadius: '50%', padding: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: error ? 0.5 : 1
                                }}
                            >
                                <Aperture size={32} />
                            </button>
                        ) : (
                            <>
                                <button onClick={handleRetake} style={{
                                    padding: '0.75rem 1.5rem', borderRadius: '50px',
                                    background: '#f5f5f5', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    fontWeight: '500'
                                }}>
                                    <RefreshCw size={18} /> Retake
                                </button>
                                <button onClick={handleConfirm} className="btn-primary" style={{
                                    padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}>
                                    <Check size={18} /> Use Photo
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
