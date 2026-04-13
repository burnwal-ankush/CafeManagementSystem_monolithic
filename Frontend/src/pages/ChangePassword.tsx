import { useState } from 'react';
import { changePassword } from '../services/api';
import { FiLock, FiShield, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ChangePassword() {
    const [form, setForm] = useState({ oldPassword: '', newPassword: '' });
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState<Record<string, boolean>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.newPassword !== confirm) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await changePassword(form);
            toast.success('Password changed successfully');
            setForm({ oldPassword: '', newPassword: '' });
            setConfirm('');
        } catch {
            toast.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Change Password</h1>
                <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Keep your account secure</p>
            </div>

            <div style={{
                maxWidth: 480, background: 'white', borderRadius: 'var(--radius-lg)',
                padding: '32px', boxShadow: 'var(--shadow-md)',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
                    padding: '16px', background: 'rgba(212,165,116,0.08)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid rgba(212,165,116,0.15)',
                }}>
                    <FiShield style={{ fontSize: 20, color: 'var(--caramel)' }} />
                    <p style={{ fontSize: 13, color: 'var(--medium-roast)' }}>
                        Choose a strong password with at least 8 characters
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {[
                        { label: 'Current Password', value: form.oldPassword, key: 'oldPassword' },
                        { label: 'New Password', value: form.newPassword, key: 'newPassword' },
                        { label: 'Confirm New Password', value: confirm, key: 'confirm' },
                    ].map((field) => (
                        <div key={field.key} style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                                {field.label}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FiLock style={{
                                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                                    color: 'var(--light-roast)', fontSize: 16,
                                }} />
                                <input
                                    type={showPw[field.key] ? 'text' : 'password'} value={field.value} required
                                    onChange={(e) => {
                                        if (field.key === 'confirm') setConfirm(e.target.value);
                                        else setForm({ ...form, [field.key]: e.target.value });
                                    }}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%', padding: '11px 40px 11px 42px',
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
                                    onClick={() => setShowPw({ ...showPw, [field.key]: !showPw[field.key] })}
                                    aria-label={showPw[field.key] ? 'Hide password' : 'Show password'}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--light-roast)', fontSize: 16, padding: 4,
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    {showPw[field.key] ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                    ))}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '13px', borderRadius: 'var(--radius-sm)', marginTop: 8,
                        background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                        color: 'white', border: 'none', fontSize: 15, fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 4px 15px rgba(212,165,116,0.35)',
                    }}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
