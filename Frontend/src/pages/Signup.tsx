import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/api';
import { FiCoffee, FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Signup() {
    const [form, setForm] = useState({ name: '', contactNumber: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [key]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await signup(form);
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            toast.success(data.message || 'Registration successful! Wait for admin approval.');
            navigate('/login');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { key: 'name', label: 'Full Name', icon: <FiUser />, type: 'text', placeholder: 'John Doe' },
        { key: 'email', label: 'Email', icon: <FiMail />, type: 'email', placeholder: 'john@cafe.com' },
        { key: 'contactNumber', label: 'Phone', icon: <FiPhone />, type: 'tel', placeholder: '+1 234 567 890' },
        { key: 'password', label: 'Password', icon: <FiLock />, type: 'password', placeholder: '••••••••' },
    ];

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--espresso) 0%, var(--dark-roast) 50%, var(--medium-roast) 100%)',
            padding: 20,
        }}>
            <div className="fade-in" style={{
                background: 'white', borderRadius: 'var(--radius-xl)', padding: '40px 44px',
                width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-xl)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, color: 'white', boxShadow: '0 4px 15px rgba(212,165,116,0.4)',
                    }}>
                        <FiCoffee />
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
                        Join Café Bliss
                    </h2>
                    <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Create your account to get started</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {fields.map((f) => (
                        <div key={f.key} style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                                {f.label}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--light-roast)', fontSize: 16,
                                }}>{f.icon}</span>
                                <input
                                    type={f.type === 'password' ? (showPassword ? 'text' : 'password') : f.type}
                                    value={form[f.key as keyof typeof form]}
                                    onChange={set(f.key)} placeholder={f.placeholder} required
                                    style={{
                                        width: '100%', padding: f.type === 'password' ? '11px 40px 11px 42px' : '11px 14px 11px 42px',
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
                                {f.type === 'password' && (
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
                                )}
                            </div>
                        </div>
                    ))}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', marginTop: 8,
                        background: loading ? 'var(--light-roast)' : 'linear-gradient(135deg, var(--caramel), var(--gold))',
                        color: 'white', border: 'none', fontSize: 15, fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 4px 15px rgba(212,165,116,0.35)',
                    }}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--light-roast)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--caramel)', textDecoration: 'none', fontWeight: 600 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
