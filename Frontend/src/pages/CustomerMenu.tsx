import { useEffect, useState } from 'react';
import { getMenu, getRatingsByProduct, addRating } from '../services/api';
import type { Product, Rating } from '../types';
import Modal from '../components/Modal';
import { Button } from '../components/FormField';
import { FiCoffee, FiStar, FiSend, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

function StarPicker({ value, onChange, size = 24 }: { value: number; onChange: (v: number) => void; size?: number }) {
    const [hover, setHover] = useState(0);
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => onChange(s)}
                    onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                        fontSize: size, color: (hover || value) >= s ? '#F39C12' : '#ddd',
                        transform: (hover || value) >= s ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.15s',
                    }}
                    aria-label={`Rate ${s} stars`}
                >
                    <FiStar fill={(hover || value) >= s ? '#F39C12' : 'none'} />
                </button>
            ))}
        </div>
    );
}

export default function CustomerMenu() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
    const [score, setScore] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [productReviews, setProductReviews] = useState<Record<number, Rating[]>>({});
    const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

    useEffect(() => {
        getMenu()
            .then((res) => setProducts(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
        const cat = p.customerName || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    const openReview = (p: Product) => {
        setReviewProduct(p);
        setScore(0);
        setComment('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (score === 0 || !reviewProduct) { toast.error('Please select a rating'); return; }
        setSubmitting(true);
        try {
            await addRating({
                score: String(score), comment,
                reviewType: 'product',
                productId: String(reviewProduct.id),
                productName: reviewProduct.name,
            });
            toast.success('Review submitted! ☕');
            setReviewProduct(null);
            if (expandedProduct === reviewProduct.id) loadReviews(reviewProduct.id);
        } catch {
            toast.error('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const loadReviews = async (productId: number) => {
        try {
            const res = await getRatingsByProduct(productId);
            setProductReviews((prev) => ({ ...prev, [productId]: res.data }));
        } catch { /* ignore */ }
    };

    const toggleReviews = (productId: number) => {
        if (expandedProduct === productId) {
            setExpandedProduct(null);
        } else {
            setExpandedProduct(productId);
            if (!productReviews[productId]) loadReviews(productId);
        }
    };

    const avgRating = (reviews: Rating[]) => {
        if (!reviews || reviews.length === 0) return null;
        return (reviews.reduce((s, r) => s + r.score, 0) / reviews.length).toFixed(1);
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Our Menu</h1>
                <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Browse and review our offerings</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--light-roast)' }}>Loading...</div>
            ) : products.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 60, background: 'white',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
                }}>
                    <FiCoffee style={{ fontSize: 48, color: 'var(--caramel)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--light-roast)', fontSize: 16 }}>Menu is being prepared...</p>
                </div>
            ) : (
                Object.entries(grouped).map(([category, items]) => (
                    <div key={category} style={{ marginBottom: 28 }}>
                        <h2 style={{
                            fontSize: 18, fontWeight: 600, marginBottom: 14, color: 'var(--espresso)',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                                display: 'inline-block',
                            }} />
                            {category}
                        </h2>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16,
                        }}>
                            {items.map((p, i) => {
                                const reviews = productReviews[p.id];
                                const avg = avgRating(reviews || []);
                                const isExpanded = expandedProduct === p.id;
                                return (
                                    <div key={p.id} className="scale-in" style={{
                                        background: 'white', borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(44,24,16,0.04)',
                                        animationDelay: `${i * 0.05}s`, animationFillMode: 'both',
                                        transition: 'box-shadow 0.2s, transform 0.2s', overflow: 'hidden',
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ padding: 20 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                                <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{p.name}</h3>
                                                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--caramel)', fontFamily: "'Playfair Display', serif" }}>
                                                    ${p.price}
                                                </span>
                                            </div>
                                            {p.description && (
                                                <p style={{ fontSize: 13, color: 'var(--light-roast)', lineHeight: 1.5, marginBottom: 12 }}>
                                                    {p.description}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <button onClick={() => openReview(p)} style={{
                                                    background: 'linear-gradient(135deg, #F39C12, #E67E22)', border: 'none',
                                                    borderRadius: 6, padding: '5px 10px', color: 'white',
                                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
                                                }}>
                                                    <FiStar size={11} /> Review
                                                </button>
                                                <button onClick={() => toggleReviews(p.id)} style={{
                                                    background: 'none', border: '1px solid rgba(44,24,16,0.1)',
                                                    borderRadius: 6, padding: '5px 10px', color: 'var(--medium-roast)',
                                                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
                                                }}>
                                                    <FiMessageCircle size={11} /> {isExpanded ? 'Hide' : 'Reviews'}
                                                </button>
                                                {avg && (
                                                    <span style={{ fontSize: 12, color: '#F39C12', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                        <FiStar size={11} fill="#F39C12" /> {avg}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div style={{ padding: '0 20px 16px', borderTop: '1px solid rgba(44,24,16,0.04)', paddingTop: 12 }}>
                                                {!reviews || reviews.length === 0 ? (
                                                    <p style={{ fontSize: 13, color: 'var(--light-roast)', textAlign: 'center' }}>No reviews yet</p>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {reviews.map((r) => (
                                                            <div key={r.id} style={{
                                                                padding: '8px 12px', background: 'var(--latte)', borderRadius: 'var(--radius-sm)',
                                                            }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                                                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.customerName}</span>
                                                                    <div style={{ display: 'flex', gap: 1 }}>
                                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                                            <FiStar key={s} size={10} fill={s <= r.score ? '#F39C12' : 'none'} color={s <= r.score ? '#F39C12' : '#ddd'} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {r.comment && <p style={{ fontSize: 12, color: 'var(--medium-roast)' }}>{r.comment}</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}

            <Modal open={!!reviewProduct} onClose={() => setReviewProduct(null)} title={`Review: ${reviewProduct?.name || ''}`}>
                <form onSubmit={handleSubmit}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <p style={{ fontSize: 14, color: 'var(--light-roast)', marginBottom: 12 }}>How was this item?</p>
                        <StarPicker value={score} onChange={setScore} size={32} />
                    </div>
                    <textarea
                        value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts..." rows={3}
                        style={{
                            width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid rgba(44,24,16,0.12)', fontSize: 14,
                            fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: 16,
                        }}
                    />
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <Button variant="secondary" type="button" onClick={() => setReviewProduct(null)}>Cancel</Button>
                        <Button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiSend size={14} /> {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
