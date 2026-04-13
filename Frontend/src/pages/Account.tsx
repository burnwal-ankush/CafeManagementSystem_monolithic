import { useEffect, useState } from 'react';
import { getProfile, updateProfile, changePassword } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Account() {
    const { refreshProfile } = useAuth();
    const [profile, setProfile] = useState({ name: '', email: '', contactNumber: '', role: '' });
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPw, setChangingPw] = useState(false);

    useEffect(() => {
        getProfile()
            .then((res) => setProfile(res.data))
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile({ name: profile.name, contactNumber: profile.contactNumber });
            toast.success('Profile updated!');
            refreshProfile();
        } catch {
            toast.error('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPassword !== confirm) {
            toast.error('Passwords do not match');
            return;
        }
        setChangingPw(true);
        try {
            await changePassword(pwForm);
            toast.success('Password changed!');
            setPwForm({ oldPassword: '', newPassword: '' });
            setConfirm('');
        } catch {
            toast.error('Failed to change password');
        } finally {
            setChangingPw(false);
        }
    };

    const roleLabel: Record<string, string> = { admin: 'Administrator', user: 'Staff', customer: 'Customer' };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 60, color: 'var(--light-roast)' }}>Loading...</div>;
    }

    return (
        <div className="fade-in" style={{ maxWidth: 560 }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>My Account</h1>
                <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Manage your profile and security</p>
            </div>

            {/* Profile Card */}
            <div style={{
                background: 'white', borderRadius: 'var(--radius-lg)', padding: 28,
                boxShadow: 'var(--shadow-md)', marginBottom: 20,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 22, fontWeight: 700,
                        boxShadow: '0 4px 15px rgba(212,165,116,0.35)',
                    }}>
                        {profile.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{profile.name}</h3>
                        <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 12,
                            fontSize: 12, fontWeight: 600, marginTop: 4,
                            background: 'rgba(212,165,116,0.12)', color: 'var(--medium-roast)',
                        }}>
                            {roleLabel[profile.role] || profile.role}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleProfileSave}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                            Full Name
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--light-roast)', fontSize: 16 }} />
                            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required
                                style={{
                                    width: '100%', padding: '11px 14px 11px 42px', borderRadius: 'var(--radius-sm)',
                                    border: '1.5px solid rgba(44,24,16,0.12)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--caramel)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.15)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(44,24,16,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                            Email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--light-roast)', fontSize: 16 }} />
                            <input value={profile.email} disabled
                                style={{
                                    width: '100%', padding: '11px 14px 11px 42px', borderRadius: 'var(--radius-sm)',
                                    border: '1.5px solid rgba(44,24,16,0.08)', fontSize: 14, fontFamily: 'inherit',
                                    background: 'var(--latte)', color: 'var(--light-roast)', cursor: 'not-allowed',
                                }}
                            />
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--light-roast)', marginTop: 4 }}>Email cannot be changed</p>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                            Phone Number
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiPhone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--light-roast)', fontSize: 16 }} />
                            <input value={profile.contactNumber} onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })} required
                                style={{
                                    width: '100%', padding: '11px 14px 11px 42px', borderRadius: 'var(--radius-sm)',
                                    border: '1.5px solid rgba(44,24,16,0.12)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--caramel)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.15)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(44,24,16,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={saving} style={{
                        width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                        color: 'white', border: 'none', fontSize: 14, fontWeight: 600,
                        cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 4px 15px rgba(212,165,116,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        <FiSave size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Password Section */}
            <div style={{
                background: 'white', borderRadius: 'var(--radius-lg)', padding: 28,
                boxShadow: 'var(--shadow-md)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <FiShield style={{ fontSize: 18, color: 'var(--caramel)' }} />
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Change Password</h3>
                </div>

                <form onSubmit={handlePasswordChange}>
                    {[
                        { label: 'Current Password', value: pwForm.oldPassword, key: 'oldPassword' },
                        { label: 'New Password', value: pwForm.newPassword, key: 'newPassword' },
                        { label: 'Confirm New Password', value: confirm, key: 'confirm' },
                    ].map((field) => (
                        <div key={field.key} style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                                {field.label}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--light-roast)', fontSize: 16 }} />
                                <input
                                    type={showPw[field.key] ? 'text' : 'password'} value={field.value} required
                                    onChange={(e) => {
                                        if (field.key === 'confirm') setConfirm(e.target.value);
                                        else setPwForm({ ...pwForm, [field.key]: e.target.value });
                                    }}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%', padding: '11px 40px 11px 42px', borderRadius: 'var(--radius-sm)',
                                        border: '1.5px solid rgba(44,24,16,0.12)', fontSize: 14, fontFamily: 'inherit', outline: 'none',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                    }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--caramel)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.15)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(44,24,16,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                                <button type="button" onClick={() => setShowPw({ ...showPw, [field.key]: !showPw[field.key] })}
                                    aria-label={showPw[field.key] ? 'Hide password' : 'Show password'}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--light-roast)', fontSize: 16, padding: 4, display: 'flex', alignItems: 'center',
                                    }}>
                                    {showPw[field.key] ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>
                    ))}

                    <button type="submit" disabled={changingPw} style={{
                        width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)',
                        background: 'var(--latte)', color: 'var(--espresso)',
                        border: '1px solid rgba(44,24,16,0.1)', fontSize: 14, fontWeight: 600,
                        cursor: changingPw ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        <FiLock size={14} /> {changingPw ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
