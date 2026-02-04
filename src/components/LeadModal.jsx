import { useState } from 'react';
import axios from 'axios';
import { X, Mail, Loader2 } from 'lucide-react';

// Dynamic API base URL for production/development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LeadModal = ({ isOpen, onClose, event }) => {
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !event) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            setLoading(true);

            // Save lead to backend
            await axios.post(`${API_BASE}/api/leads`, {
                email,
                eventId: event._id,
                eventTitle: event.title,
                sourceUrl: event.sourceUrl,
            });

            // Open ticket page
            window.open(event.sourceUrl, '_blank');

            // Reset and close
            setEmail('');
            setAgreed(false);
            onClose();
        } catch (err) {
            console.error('Error saving lead:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                padding: '24px',
            }}
        >
            {/* Modal Container */}
            <div style={{
                backgroundColor: '#171717',
                borderRadius: '16px',
                border: '1px solid #262626',
                width: '100%',
                maxWidth: '420px',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px 24px',
                    borderBottom: '1px solid #262626',
                }}>
                    <h2 style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#ffffff',
                        margin: 0,
                    }}>
                        Join the Guest List
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#737373',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    {/* Event Title */}
                    <p style={{
                        fontSize: '14px',
                        color: '#a3a3a3',
                        marginBottom: '24px',
                        lineHeight: 1.5,
                    }}>
                        Enter your email to proceed to the official booking page for <strong style={{ color: '#ffffff' }}>{event.title}</strong>.
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Email Label */}
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#e5e5e5',
                            marginBottom: '8px',
                        }}>
                            Email Address
                        </label>

                        {/* Email Input */}
                        <div style={{
                            position: 'relative',
                            marginBottom: '16px',
                        }}>
                            <Mail style={{
                                position: 'absolute',
                                left: '14px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '18px',
                                height: '18px',
                                color: '#525252',
                                pointerEvents: 'none',
                            }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                style={{
                                    width: '100%',
                                    backgroundColor: '#0a0a0a',
                                    border: '1px solid #404040',
                                    borderRadius: '10px',
                                    padding: '14px 14px 14px 46px',
                                    fontSize: '15px',
                                    color: '#ffffff',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {/* Checkbox */}
                        <label style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            fontSize: '13px',
                            color: '#a3a3a3',
                            marginBottom: '24px',
                            cursor: 'pointer',
                            lineHeight: 1.4,
                        }}>
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    marginTop: '2px',
                                    accentColor: '#10b981',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                }}
                            />
                            <span>I agree to receive event updates and promotional emails</span>
                        </label>

                        {/* Error Message */}
                        {error && (
                            <p style={{
                                fontSize: '13px',
                                color: '#ef4444',
                                marginBottom: '16px',
                            }}>
                                {error}
                            </p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                fontWeight: 600,
                                fontSize: '15px',
                                padding: '14px 20px',
                                borderRadius: '10px',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                                    Processing...
                                </>
                            ) : (
                                'Join Guest List & Get Tickets'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #262626',
                    textAlign: 'center',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#737373',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadModal;
