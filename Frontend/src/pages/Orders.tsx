import { useEffect, useState } from 'react';
import { getBills, generateBill, deleteBill, getCategories, getProductsByCategory } from '../services/api';
import type { Bill, Category, Product, ProductDetail } from '../types';
import Modal from '../components/Modal';
import { Input, Select, Button } from '../components/FormField';
import { FiPlus, FiTrash2, FiFileText, FiDownload, FiShoppingCart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Orders() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<ProductDetail[]>([]);
    const [form, setForm] = useState({ name: '', email: '', contactNumber: '', paymentMethod: 'Cash' });
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('1');

    const load = () => {
        setLoading(true);
        Promise.all([getBills(), getCategories('true')])
            .then(([bRes, cRes]) => {
                setBills(bRes.data);
                setCategories(cRes.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const onCategoryChange = async (catId: string) => {
        setSelectedCategory(catId);
        setSelectedProduct('');
        if (catId) {
            try {
                const res = await getProductsByCategory(Number(catId));
                setProducts(res.data);
            } catch { setProducts([]); }
        } else {
            setProducts([]);
        }
    };

    const addToCart = () => {
        const prod = products.find((p) => String(p.id) === selectedProduct);
        if (!prod) return;
        const cat = categories.find((c) => String(c.id) === selectedCategory);
        const qty = Number(quantity) || 1;
        setCart([...cart, {
            id: prod.id, name: prod.name, category: cat?.name || '',
            quantity: qty, price: prod.price, total: prod.price * qty,
        }]);
        setSelectedProduct('');
        setQuantity('1');
    };

    const removeFromCart = (index: number) => setCart(cart.filter((_, i) => i !== index));
    const grandTotal = cart.reduce((sum, item) => sum + item.total, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) { toast.error('Add items to the order'); return; }
        try {
            await generateBill({
                ...form, totalAmount: String(grandTotal),
                productDetails: JSON.stringify(cart),
            });
            toast.success('Order placed!');
            setModalOpen(false);
            setCart([]);
            setForm({ name: '', email: '', contactNumber: '', paymentMethod: 'Cash' });
            load();
        } catch {
            toast.error('Failed to place order');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this bill?')) return;
        try {
            await deleteBill(id);
            toast.success('Bill deleted');
            load();
        } catch {
            toast.error('Delete failed');
        }
    };

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm({ ...form, [key]: e.target.value });

    const parseDetails = (detail: string): ProductDetail[] => {
        try { return JSON.parse(detail); } catch { return []; }
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Orders</h1>
                    <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Track and create orders</p>
                </div>
                <Button onClick={() => setModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiPlus /> New Order
                </Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--light-roast)' }}>Loading...</div>
            ) : bills.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 60, background: 'white',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
                }}>
                    <FiFileText style={{ fontSize: 48, color: 'var(--caramel)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--light-roast)', fontSize: 16 }}>No orders yet</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {bills.map((bill, i) => {
                        const items = parseDetails(bill.productDetail);
                        return (
                            <div key={bill.id} className="slide-in" style={{
                                background: 'white', borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(44,24,16,0.04)',
                                overflow: 'hidden', animationDelay: `${i * 0.05}s`, animationFillMode: 'both',
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '16px 20px', flexWrap: 'wrap', gap: 12,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{
                                            width: 42, height: 42, borderRadius: 'var(--radius-sm)',
                                            background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: 16,
                                        }}>
                                            <FiDownload />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 15 }}>{bill.name}</p>
                                            <p style={{ fontSize: 12, color: 'var(--light-roast)' }}>
                                                {bill.uuid} · {bill.paymentMethod}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <span style={{
                                            fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif",
                                            color: 'var(--espresso)',
                                        }}>
                                            ${bill.total}
                                        </span>
                                        <button onClick={() => handleDelete(bill.id)} style={{
                                            background: 'rgba(231,76,60,0.08)', border: 'none', borderRadius: 6,
                                            width: 34, height: 34, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)',
                                        }}>
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                {items.length > 0 && (
                                    <div style={{
                                        padding: '0 20px 16px', display: 'flex', gap: 8, flexWrap: 'wrap',
                                    }}>
                                        {items.map((item, j) => (
                                            <span key={j} style={{
                                                padding: '4px 10px', borderRadius: 20, fontSize: 12,
                                                background: 'var(--latte)', color: 'var(--medium-roast)',
                                            }}>
                                                {item.name} × {item.quantity}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Order">
                <form onSubmit={handleSubmit}>
                    <Input label="Customer Name" value={form.name} onChange={set('name')} placeholder="John Doe" required />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="john@email.com" required />
                        <Input label="Phone" value={form.contactNumber} onChange={set('contactNumber')} placeholder="+1 234 567" required />
                    </div>
                    <Select label="Payment Method" value={form.paymentMethod} onChange={set('paymentMethod')}>
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                    </Select>

                    {/* Add items */}
                    <div style={{
                        padding: 16, background: 'var(--latte)', borderRadius: 'var(--radius-sm)',
                        marginBottom: 16,
                    }}>
                        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--medium-roast)' }}>
                            <FiShoppingCart style={{ marginRight: 6 }} /> Add Items
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <Select label="Category" value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)}>
                                <option value="">Select</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Select>
                            <Select label="Product" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                                <option value="">Select</option>
                                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Select>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <Input label="Qty" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                            </div>
                            <Button type="button" variant="secondary" onClick={addToCart} style={{ marginBottom: 16, whiteSpace: 'nowrap' }}>
                                + Add
                            </Button>
                        </div>
                    </div>

                    {/* Cart */}
                    {cart.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                            {cart.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 0', borderBottom: '1px solid rgba(44,24,16,0.06)',
                                }}>
                                    <div>
                                        <span style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</span>
                                        <span style={{ fontSize: 12, color: 'var(--light-roast)', marginLeft: 8 }}>
                                            × {item.quantity}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ fontWeight: 600 }}>${item.total}</span>
                                        <button type="button" onClick={() => removeFromCart(i)} style={{
                                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4,
                                        }}>
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                                fontWeight: 700, fontSize: 16, borderTop: '2px solid var(--espresso)',
                                marginTop: 8,
                            }}>
                                <span>Total</span>
                                <span>${grandTotal}</span>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Place Order</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
