import { useState } from 'react';
import axios from 'axios';
import { X, Mail, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

// Dynamic API base URL for production/development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LeadModal = ({ isOpen, onClose, event }) => {
    const [email, setEmail] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // OTP flow state
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [otp, setOtp] = useState('');

    if (!isOpen || !event) return null;

    // ─── Step 1: Send verification code ───
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_BASE}/api/otp/send`, { email }, { timeout: 30000 });
            setStep('otp');
        } catch (err) {
            console.error('Error sending OTP:', err);
            setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Step 2: Verify OTP and save lead ───
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        try {
            setLoading(true);

            // Verify OTP first
            const verifyRes = await axios.post(`${API_BASE}/api/otp/verify`, { email, otp });

            if (verifyRes.data.success) {
                // ── ORIGINAL LEAD SUBMISSION LOGIC (UNCHANGED) ──
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
                setOtp('');
                setStep('email');
                onClose();
            }
        } catch (err) {
            console.error('Error verifying OTP:', err);
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Resend code handler ───
    const handleResend = async () => {
        setError('');
        try {
            setLoading(true);
            await axios.post(`${API_BASE}/api/otp/send`, { email }, { timeout: 30000 });
            setError(''); // clear any prior error
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── Back to email step ───
    const handleBack = () => {
        setStep('email');
        setOtp('');
        setError('');
    };

    // ─── Close and reset ───
    const handleClose = () => {
        setEmail('');
        setAgreed(false);
        setOtp('');
        setStep('email');
        setError('');
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
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
                        {step === 'email' ? 'Join the Guest List' : 'Verify Your Email'}
                    </h2>
                    <button
                        onClick={handleClose}
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

                    {/* ═══════════ STEP 1: EMAIL ═══════════ */}
                    {step === 'email' && (
                        <>
                            {/* Event Title */}
                            <p style={{
                                fontSize: '14px',
                                color: '#a3a3a3',
                                marginBottom: '24px',
                                lineHeight: 1.5,
                            }}>
                                Enter your email to receive a verification code for <strong style={{ color: '#ffffff' }}>{event.title}</strong>.
                            </p>

                            {/* Form */}
                            <form onSubmit={handleSendCode}>
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

                                {/* Send Code Button */}
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
                                            Sending Code...
                                        </>
                                    ) : (
                                        <>
                                            <Mail style={{ width: '18px', height: '18px' }} />
                                            Send Verification Code
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* ═══════════ STEP 2: OTP ═══════════ */}
                    {step === 'otp' && (
                        <>
                            {/* Instructions */}
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '24px',
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px auto',
                                }}>
                                    <ShieldCheck style={{ width: '24px', height: '24px', color: '#10b981' }} />
                                </div>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#a3a3a3',
                                    lineHeight: 1.5,
                                    margin: 0,
                                }}>
                                    We sent a 6-digit code to{' '}
                                    <strong style={{ color: '#ffffff' }}>{email}</strong>.
                                    <br />Enter it below to continue.
                                </p>
                            </div>

                            {/* OTP Form */}
                            <form onSubmit={handleVerify}>
                                {/* OTP Label */}
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#e5e5e5',
                                    marginBottom: '8px',
                                }}>
                                    Verification Code
                                </label>

                                {/* OTP Input */}
                                <div style={{
                                    position: 'relative',
                                    marginBottom: '16px',
                                }}>
                                    <ShieldCheck style={{
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
                                        type="text"
                                        value={otp}
                                        onChange={(e) => {
                                            // Allow only digits, max 6
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setOtp(val);
                                        }}
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                        autoFocus
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#0a0a0a',
                                            border: '1px solid #404040',
                                            borderRadius: '10px',
                                            padding: '14px 14px 14px 46px',
                                            fontSize: '20px',
                                            fontWeight: 600,
                                            letterSpacing: '6px',
                                            color: '#ffffff',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            textAlign: 'center',
                                        }}
                                    />
                                </div>

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

                                {/* Verify Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#10b981',
                                        color: '#ffffff',
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
                                        marginBottom: '16px',
                                    }}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck style={{ width: '18px', height: '18px' }} />
                                            Verify & Get Tickets
                                        </>
                                    )}
                                </button>

                                {/* Back & Resend Links */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#737373',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: 0,
                                        }}
                                    >
                                        <ArrowLeft style={{ width: '14px', height: '14px' }} />
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#10b981',
                                            fontSize: '13px',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            padding: 0,
                                            opacity: loading ? 0.5 : 1,
                                        }}
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #262626',
                    textAlign: 'center',
                }}>
                    <button
                        onClick={handleClose}
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
