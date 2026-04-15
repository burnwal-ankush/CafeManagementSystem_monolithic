import { useEffect, useState } from 'react';
import { getCategories, addCategory, updateCategory } from '../services/api';
import type { Category } from '../types';
import Modal from '../components/Modal';
import { Input, Button } from '../components/FormField';
import { FiPlus, FiEdit2, FiGrid } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [name, setName] = useState('');

    const load = () => {
        setLoading(true);
        getCategories()
            .then((res) => setCategories(res.data))
            .catch(() => toast.error('Failed to load categories'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setName(''); setModalOpen(true); };
    const openEdit = (cat: Category) => { setEditing(cat); setName(cat.name); setModalOpen(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateCategory({ id: String(editing.id), name });
                toast.success('Category updated');
            } else {
                await addCategory({ name });
                toast.success('Category added');
            }
            setModalOpen(false);
            load();
        } catch {
            toast.error('Operation failed');
        }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Categories</h1>
                    <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Organize your menu</p>
                </div>
                <Button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiPlus /> Add Category
                </Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--light-roast)' }}>Loading...</div>
            ) : categories.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 60, background: 'white',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
                }}>
                    <FiGrid style={{ fontSize: 48, color: 'var(--caramel)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--light-roast)', fontSize: 16 }}>No categories yet. Add your first one!</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16,
                }}>
                    {categories.map((cat, i) => (
                        <div key={cat.id} className="scale-in" style={{
                            background: 'white', borderRadius: 'var(--radius-md)',
                            padding: '20px', boxShadow: 'var(--shadow-sm)',
                            border: '1px solid rgba(44,24,16,0.04)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            animationDelay: `${i * 0.05}s`, animationFillMode: 'both',
                            transition: 'box-shadow 0.2s, transform 0.2s',
                            cursor: 'default',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                                    background: `hsl(${(cat.id * 47) % 360}, 60%, 92%)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18, color: `hsl(${(cat.id * 47) % 360}, 50%, 40%)`,
                                }}>
                                    <FiGrid />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: 15 }}>{cat.name}</p>
                                    <p style={{ fontSize: 12, color: 'var(--light-roast)' }}>ID: {cat.id}</p>
                                </div>
                            </div>
                            <button onClick={() => openEdit(cat)} style={{
                                background: 'var(--latte)', border: 'none', borderRadius: '50%',
                                width: 34, height: 34, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', color: 'var(--medium-roast)',
                                transition: 'background 0.2s',
                            }}>
                                <FiEdit2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

                <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
                    <form onSubmit={handleSubmit}>
                        <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hot Beverages" required />
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                            <Button type="submit">{editing ? 'Update' : 'Add'}</Button>
                        </div>
                    </form>
                </Modal>
        </div>
    );
}
