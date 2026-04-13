import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { FiCoffee, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login({ email, password });
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            if (data.token) {
                loginUser(data.token);
                toast.success('Welcome back! ☕');
                navigate('/dashboard');
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: 'linear-gradient(135deg, var(--espresso) 0%, var(--dark-roast) 50%, var(--medium-roast) 100%)',
        }}>
            {/* Left decorative panel */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                alignItems: 'center', padding: 60, color: 'white', position: 'relative', overflow: 'hidden',
            }} className="login-hero">
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(212,165,116,0.15) 0%, transparent 70%)',
                    top: -100, right: -100,
                }} />
                <div style={{
                    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%)',
                    bottom: -50, left: -50,
                }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
                        background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 36, boxShadow: '0 8px 30px rgba(212,165,116,0.4)',
                    }}>
                        <FiCoffee />
                    </div>
                    {/* Steam animation */}
                    <div style={{ position: 'relative', height: 40, marginBottom: 16 }}>
                        {[0, 1, 2].map((i) => (
                            <div key={i} style={{
                                position: 'absolute', left: `calc(50% + ${(i - 1) * 16}px)`,
                                bottom: 0, width: 3, height: 20, borderRadius: 2,
                                background: 'rgba(255,255,255,0.3)',
                                animation: `steamRise 2s ease-in-out ${i * 0.4}s infinite`,
                            }} />
                        ))}
                    </div>
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif", fontSize: 42,
                        fontWeight: 700, marginBottom: 12, letterSpacing: '-1px',
                    }}>
                        Café Bliss
                    </h1>
                    <p style={{ fontSize: 16, opacity: 0.6, maxWidth: 300, lineHeight: 1.7 }}>
                        Where every cup tells a story and every order is crafted with care
                    </p>
                </div>
            </div>

            {/* Right form panel */}
            <div style={{
                width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', padding: '40px 48px',
                background: 'white', borderRadius: '24px 0 0 24px',
            }} className="fade-in">
                <h2 style={{
                    fontFamily: "'Playfair Display', serif", fontSize: 28,
                    fontWeight: 700, marginBottom: 8, color: 'var(--espresso)',
                }}>
                    Welcome Back
                </h2>
                <p style={{ color: 'var(--light-roast)', marginBottom: 32, fontSize: 14 }}>
                    Sign in to manage your café
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--medium-roast)' }}>
                            Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiMail style={{
                                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--light-roast)', fontSize: 16,
                            }} />
                            <input
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com" required
                                style={{
                                    width: '100%', padding: '12px 14px 12px 42px',
                                    borderRadius: 'var(--radius-sm)', border: '1.5px solid rgba(44,24,16,0.12)',
                                    fontSize: 14, fontFamily: 'inherit', outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--caramel)';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.15)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(44,24,16,0.12)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--medium-roast)' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{
                                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--light-roast)', fontSize: 16,
                            }} />
                            <input
                                type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••" required
                                style={{
                                    width: '100%', padding: '12px 40px 12px 42px',
                                    borderRadius: 'var(--radius-sm)', border: '1.5px solid rgba(44,24,16,0.12)',
                                    fontSize: 14, fontFamily: 'inherit', outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--caramel)';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.15)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(44,24,16,0.12)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--light-roast)', fontSize: 16, padding: 4,
                                    display: 'flex', alignItems: 'center',
                                }}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: 24 }}>
                        <Link to="/forgot-password" style={{
                            fontSize: 13, color: 'var(--caramel)', textDecoration: 'none', fontWeight: 500,
                        }}>
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)',
                        background: loading ? 'var(--light-roast)' : 'linear-gradient(135deg, var(--caramel), var(--gold))',
                        color: 'white', border: 'none', fontSize: 15, fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 4px 15px rgba(212,165,116,0.35)',
                        transition: 'all 0.2s ease',
                    }}>
                        {loading ? 'Brewing...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--light-roast)' }}>
                    New here?{' '}
                    <Link to="/signup" style={{ color: 'var(--caramel)', textDecoration: 'none', fontWeight: 600 }}>
                        Create an account
                    </Link>
                </p>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .login-hero { display: none !important; }
          div[style*="borderRadius: '24px 0 0 24px'"] { max-width: 100% !important; border-radius: 0 !important; }
        }
      `}</style>
        </div>
    );
}
