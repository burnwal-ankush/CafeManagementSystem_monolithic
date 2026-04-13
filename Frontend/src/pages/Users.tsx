import { useEffect, useState } from 'react';
import { getAllUsers, updateUser, addStaff, updateRole } from '../services/api';
import type { User } from '../types';
import Modal from '../components/Modal';
import { Input, Button } from '../components/FormField';
import { FiUsers, FiMail, FiPhone, FiToggleLeft, FiToggleRight, FiPlus, FiEye, FiEyeOff, FiArrowUp, FiArrowDown, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const roleBadge = (role: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
        user: { bg: 'rgba(52,152,219,0.1)', color: '#3498DB', label: 'Staff' },
        customer: { bg: 'rgba(155,89,182,0.1)', color: '#9B59B6', label: 'Customer' },
    };
    const s = styles[role] || { bg: 'rgba(149,165,166,0.1)', color: '#95A5A6', label: role };
    return (
        <span style={{
            display: 'inline-block', padding: '2px 8px', borderRadius: 12,
            fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, marginLeft: 6,
        }}>
            {s.label}
        </span>
    );
};

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', contactNumber: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [filter, setFilter] = useState<'all' | 'user' | 'customer'>('all');
    const [search, setSearch] = useState('');

    const load = () => {
        setLoading(true);
        getAllUsers()
            .then((res) => setUsers(res.data))
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const filtered = (filter === 'all' ? users : users.filter((u) => u.role === filter))
        .filter((u) => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.contactNumber.includes(q);
        });

    const toggleStatus = async (user: User) => {
        const newStatus = user.status === 'true' ? 'false' : 'true';
        try {
            await updateUser({ id: String(user.id), status: newStatus });
            toast.success(`User ${newStatus === 'true' ? 'activated' : 'deactivated'}`);
            load();
        } catch {
            toast.error('Update failed');
        }
    };

    const toggleRole = async (user: User) => {
        const newRole = user.role === 'customer' ? 'user' : 'customer';
        try {
            await updateRole({ id: String(user.id), role: newRole });
            toast.success(`${user.name} is now a ${newRole === 'user' ? 'Staff member' : 'Customer'}`);
            load();
        } catch {
            toast.error('Role update failed');
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await addStaff(form);
            const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            toast.success(data.message || 'Staff member added!');
            setModalOpen(false);
            setForm({ name: '', email: '', contactNumber: '', password: '' });
            load();
        } catch (err: unknown) {
            const error = err as { response?: { data?: string } };
            let msg = 'Failed to add staff';
            if (error.response?.data) {
                try { msg = JSON.parse(error.response.data).message; } catch { /* ignore */ }
            }
            toast.error(msg);
        }
    };

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [key]: e.target.value });

    const staffCount = users.filter((u) => u.role === 'user').length;
    const customerCount = users.filter((u) => u.role === 'customer').length;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Users</h1>
                    <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>
                        {users.length} total — {staffCount} staff, {customerCount} customers
                    </p>
                </div>
                <Button onClick={() => { setForm({ name: '', email: '', contactNumber: '', password: '' }); setModalOpen(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiPlus /> Add Staff
                </Button>
            </div>

            {/* Search and filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
                    <FiSearch style={{
                        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--light-roast)', fontSize: 16,
                    }} />
                    <input
                        type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or phone..."
                        style={{
                            width: '100%', padding: '9px 14px 9px 40px',
                            borderRadius: 20, border: '1.5px solid rgba(44,24,16,0.1)',
                            fontSize: 13, fontFamily: 'inherit', outline: 'none',
                            background: 'white', transition: 'border-color 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = 'var(--caramel)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.12)';
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(44,24,16,0.1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {([
                        { key: 'all', label: `All (${users.length})` },
                        { key: 'user', label: `Staff (${staffCount})` },
                        { key: 'customer', label: `Customers (${customerCount})` },
                    ] as const).map((t) => (
                        <button key={t.key} onClick={() => setFilter(t.key)} style={{
                            padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                            background: filter === t.key ? 'linear-gradient(135deg, var(--caramel), var(--gold))' : 'white',
                            color: filter === t.key ? 'white' : 'var(--medium-roast)',
                            boxShadow: filter === t.key ? '0 4px 12px rgba(212,165,116,0.3)' : 'var(--shadow-sm)',
                            transition: 'all 0.2s ease',
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--light-roast)' }}>Loading...</div>
            ) : filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 60, background: 'white',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
                }}>
                    <FiUsers style={{ fontSize: 48, color: 'var(--caramel)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--light-roast)', fontSize: 16 }}>No users found</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filtered.map((user, i) => (
                        <div key={user.id} className="scale-in" style={{
                            background: 'white', borderRadius: 'var(--radius-md)',
                            padding: '20px', boxShadow: 'var(--shadow-sm)',
                            border: '1px solid rgba(44,24,16,0.04)',
                            animationDelay: `${i * 0.05}s`, animationFillMode: 'both',
                            transition: 'box-shadow 0.2s, transform 0.2s',
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: user.role === 'customer'
                                        ? `linear-gradient(135deg, hsl(${(user.id * 67) % 360}, 50%, 75%), hsl(${(user.id * 67 + 40) % 360}, 40%, 65%))`
                                        : `linear-gradient(135deg, hsl(${(user.id * 67) % 360}, 60%, 70%), hsl(${(user.id * 67 + 40) % 360}, 50%, 60%))`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontSize: 18, fontWeight: 700,
                                }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <p style={{ fontWeight: 600, fontSize: 15 }}>{user.name}</p>
                                        {roleBadge(user.role)}
                                    </div>
                                    <span style={{
                                        display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                                        fontSize: 11, fontWeight: 600, marginTop: 4,
                                        background: user.status === 'true' ? 'rgba(76,175,80,0.1)' : 'rgba(231,76,60,0.1)',
                                        color: user.status === 'true' ? 'var(--success)' : 'var(--danger)',
                                    }}>
                                        {user.status === 'true' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--light-roast)' }}>
                                    <FiMail size={14} /> {user.email}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--light-roast)' }}>
                                    <FiPhone size={14} /> {user.contactNumber}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => toggleStatus(user)} style={{
                                    flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                                    background: user.status === 'true' ? 'rgba(231,76,60,0.06)' : 'rgba(76,175,80,0.06)',
                                    border: `1px solid ${user.status === 'true' ? 'rgba(231,76,60,0.15)' : 'rgba(76,175,80,0.15)'}`,
                                    color: user.status === 'true' ? 'var(--danger)' : 'var(--success)',
                                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    fontFamily: 'inherit',
                                }}>
                                    {user.status === 'true' ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                                    {user.status === 'true' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button onClick={() => toggleRole(user)} style={{
                                    flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                                    background: user.role === 'customer' ? 'rgba(52,152,219,0.06)' : 'rgba(155,89,182,0.06)',
                                    border: `1px solid ${user.role === 'customer' ? 'rgba(52,152,219,0.15)' : 'rgba(155,89,182,0.15)'}`,
                                    color: user.role === 'customer' ? '#3498DB' : '#9B59B6',
                                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    fontFamily: 'inherit',
                                }}>
                                    {user.role === 'customer' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                                    {user.role === 'customer' ? 'Make Staff' : 'Make Customer'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Member">
                <form onSubmit={handleAddStaff}>
                    <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="John Doe" required />
                    <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="john@cafe.com" required />
                    <Input label="Phone" value={form.contactNumber} onChange={set('contactNumber')} placeholder="+1 234 567 890" required />
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPw ? 'text' : 'password'} value={form.password}
                                onChange={set('password')} placeholder="••••••••" required
                                style={{
                                    width: '100%', padding: '10px 40px 10px 14px', borderRadius: 'var(--radius-sm)',
                                    border: '1.5px solid rgba(44,24,16,0.12)', fontSize: 14,
                                    fontFamily: 'inherit', background: 'var(--foam)', outline: 'none',
                                }}
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                aria-label={showPw ? 'Hide password' : 'Show password'}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--light-roast)', fontSize: 16, padding: 4,
                                    display: 'flex', alignItems: 'center',
                                }}>
                                {showPw ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                        <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Add Staff</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
