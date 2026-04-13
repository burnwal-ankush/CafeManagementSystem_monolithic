import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import { FiCoffee, FiMail, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword({ email });
            toast.success('Password reset link sent to your email!');
        } catch {
            toast.error('Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--espresso) 0%, var(--dark-roast) 50%, var(--medium-roast) 100%)',
            padding: 20,
        }}>
            <div className="fade-in" style={{
                background: 'white', borderRadius: 'var(--radius-xl)', padding: '40px 44px',
                width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-xl)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, color: 'white',
                    }}>
                        <FiCoffee />
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                        Reset Password
                    </h2>
                    <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--light-roast)' }} />
                            <input
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com" required
                                style={{
                                    width: '100%', padding: '12px 14px 12px 42px',
                                    borderRadius: 'var(--radius-sm)', border: '1.5px solid rgba(44,24,16,0.12)',
                                    fontSize: 14, fontFamily: 'inherit', outline: 'none',
                                }}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                        color: 'white', border: 'none', fontSize: 15, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <Link to="/login" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    marginTop: 20, fontSize: 14, color: 'var(--caramel)', textDecoration: 'none', fontWeight: 500,
                }}>
                    <FiArrowLeft /> Back to login
                </Link>
            </div>
        </div>
    );
}
