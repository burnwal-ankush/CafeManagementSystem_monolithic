import { useEffect, useState } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, updateProductStatus, getCategories } from '../services/api';
import type { Product, Category } from '../types';
import Modal from '../components/Modal';
import { Input, Select, Button } from '../components/FormField';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState({ name: '', categoryId: '', description: '', price: '' });

    const load = () => {
        setLoading(true);
        Promise.all([getProducts(), getCategories()])
            .then(([pRes, cRes]) => {
                setProducts(pRes.data);
                setCategories(cRes.data);
            })
            .catch(() => toast.error('Failed to load data'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openAdd = () => {
        setEditing(null);
        setForm({ name: '', categoryId: categories[0]?.id?.toString() || '', description: '', price: '' });
        setModalOpen(true);
    };

    const openEdit = (p: Product) => {
        setEditing(p);
        setForm({
            name: p.name, categoryId: String(p.customerId),
            description: p.description || '', price: String(p.price),
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateProduct({ id: String(editing.id), ...form });
                toast.success('Product updated');
            } else {
                await addProduct(form);
                toast.success('Product added');
            }
            setModalOpen(false);
            load();
        } catch {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this product?')) return;
        try {
            await deleteProduct(id);
            toast.success('Product deleted');
            load();
        } catch {
            toast.error('Delete failed');
        }
    };

    const toggleStatus = async (p: Product) => {
        try {
            await updateProductStatus({ id: String(p.id), status: p.status === 'true' ? 'false' : 'true' });
            toast.success('Status updated');
            load();
        } catch {
            toast.error('Update failed');
        }
    };

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm({ ...form, [key]: e.target.value });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Products</h1>
                    <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Manage your menu items</p>
                </div>
                <Button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiPlus /> Add Product
                </Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--light-roast)' }}>Loading...</div>
            ) : products.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 60, background: 'white',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
                }}>
                    <FiPackage style={{ fontSize: 48, color: 'var(--caramel)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--light-roast)', fontSize: 16 }}>No products yet. Start building your menu!</p>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--latte)' }}>
                                    {['Name', 'Category', 'Description', 'Price', 'Status', 'Actions'].map((h) => (
                                        <th key={h} style={{
                                            padding: '14px 16px', textAlign: 'left', fontSize: 12,
                                            fontWeight: 600, color: 'var(--medium-roast)',
                                            textTransform: 'uppercase', letterSpacing: '0.5px',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p, i) => (
                                    <tr key={p.id} className="slide-in" style={{
                                        borderBottom: '1px solid rgba(44,24,16,0.04)',
                                        animationDelay: `${i * 0.03}s`, animationFillMode: 'both',
                                        transition: 'background 0.15s',
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245,230,211,0.3)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '14px 16px', fontWeight: 500, fontSize: 14 }}>{p.name}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                                                background: 'rgba(212,165,116,0.15)', color: 'var(--medium-roast)',
                                            }}>
                                                {p.customerName || '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--light-roast)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {p.description || '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 14 }}>
                                            ${p.price}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <button onClick={() => toggleStatus(p)} style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                color: p.status === 'true' ? 'var(--success)' : 'var(--danger)',
                                                fontSize: 13, fontWeight: 500,
                                            }}>
                                                {p.status === 'true' ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                                {p.status === 'true' ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => openEdit(p)} style={{
                                                    background: 'var(--latte)', border: 'none', borderRadius: 6,
                                                    width: 32, height: 32, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', cursor: 'pointer', color: 'var(--medium-roast)',
                                                }}>
                                                    <FiEdit2 size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(p.id)} style={{
                                                    background: 'rgba(231,76,60,0.08)', border: 'none', borderRadius: 6,
                                                    width: 32, height: 32, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)',
                                                }}>
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'New Product'}>
                <form onSubmit={handleSubmit}>
                    <Input label="Product Name" value={form.name} onChange={set('name')} placeholder="e.g. Cappuccino" required />
                    <Select label="Category" value={form.categoryId} onChange={set('categoryId')} required>
                        <option value="">Select category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <Input label="Description" value={form.description} onChange={set('description')} placeholder="A rich, creamy coffee..." />
                    <Input label="Price ($)" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} placeholder="4.99" required />
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                        <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit">{editing ? 'Update' : 'Add'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
