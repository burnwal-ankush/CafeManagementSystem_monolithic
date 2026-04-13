import { useEffect, useState } from 'react';
import { getMyOrders, addRating, getRatingsByBill } from '../services/api';
import type { Bill, ProductDetail, Rating } from '../types';
import Modal from '../components/Modal';
import { Button } from '../components/FormField';
import { FiShoppingBag, FiCalendar, FiCreditCard, FiStar, FiSend } from 'react-icons/fi';
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

export default function CustomerOrders() {
    const [orders, setOrders] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState<{ type: 'bill' | 'product'; billId?: number; productId?: number; productName?: string } | null>(null);
    const [score, setScore] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [billReviews, setBillReviews] = useState<Record<number, Rating[]>>({});
    const [expandedBill, setExpandedBill] = useState<number | null>(null);

    const load = () => {
        setLoading(true);
        getMyOrders()
            .then((res) => setOrders(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const parseDetails = (detail: string): ProductDetail[] => {
        try { return JSON.parse(detail); } catch { return []; }
    };

    const openReview = (type: 'bill' | 'product', billId?: number, productId?: number, productName?: string) => {
        setReviewModal({ type, billId, productId, productName });
        setScore(0);
        setComment('');
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (score === 0) { toast.error('Please select a rating'); return; }
        if (!reviewModal) return;
        setSubmitting(true);
        try {
            const data: Record<string, string> = {
                score: String(score),
                comment,
                reviewType: reviewModal.type,
            };
            if (reviewModal.type === 'bill' && reviewModal.billId) {
                data.billId = String(reviewModal.billId);
            }
            if (reviewModal.type === 'product' && reviewModal.productId) {
                data.productId = String(reviewModal.productId);
                data.productName = reviewModal.productName || '';
            }
            await addRating(data);
            toast.success('Review submitted! ☕');
            setReviewModal(null);
            // Refresh reviews for this bill
            if (reviewModal.billId && expandedBill === reviewModal.billId) {
                loadBillReviews(reviewModal.billId);
            }
        } catch {
            toast.error('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const loadBillReviews = async (billId: number) => {
        try {
            const res = await getRatingsByBill(billId);
            setBillReviews((prev) => ({ ...prev, [billId]: res.data }));
        } catch { /* ignore */ }
    };

    const toggleBillReviews = (billId: number) => {
        if (expandedBill === billId) {
            setExpandedBill(null);
        } else {
            setExpandedBill(billId);
            if (!billReviews[billId]) loadBillReviews(billId);
        }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>My Orders</h1>
                <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Your order history — leave reviews for orders and products</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--light-roast)' }}>Loading...</div>
            ) : orders.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 60, background: 'white',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
                }}>
                    <FiShoppingBag style={{ fontSize: 48, color: 'var(--caramel)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--light-roast)', fontSize: 16 }}>No orders yet</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.map((order, i) => {
                        const items = parseDetails(order.productDetail);
                        const reviews = billReviews[order.id] || [];
                        const isExpanded = expandedBill === order.id;
                        return (
                            <div key={order.id} className="slide-in" style={{
                                background: 'white', borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(44,24,16,0.04)',
                                overflow: 'hidden', animationDelay: `${i * 0.05}s`, animationFillMode: 'both',
                            }}>
                                {/* Header */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '18px 20px', borderBottom: '1px solid rgba(44,24,16,0.04)',
                                    flexWrap: 'wrap', gap: 12,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 'var(--radius-sm)',
                                            background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontSize: 18,
                                        }}>
                                            <FiShoppingBag />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 15 }}>{order.uuid}</p>
                                            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--light-roast)', marginTop: 2 }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <FiCalendar size={12} />
                                                    {order.billCreatedDttm ? new Date(order.billCreatedDttm).toLocaleDateString() : '—'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <FiCreditCard size={12} /> {order.paymentMethod}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                                            ${order.total}
                                        </span>
                                        <button onClick={() => openReview('bill', order.id)} style={{
                                            background: 'linear-gradient(135deg, #F39C12, #E67E22)', border: 'none',
                                            borderRadius: 'var(--radius-sm)', padding: '6px 12px',
                                            color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
                                        }}>
                                            <FiStar size={12} /> Review Order
                                        </button>
                                    </div>
                                </div>

                                {/* Items with individual review buttons */}
                                {items.length > 0 && (
                                    <div style={{ padding: '14px 20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {items.map((item, j) => (
                                                <div key={j} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '8px 12px', background: 'var(--latte)', borderRadius: 'var(--radius-sm)',
                                                }}>
                                                    <div>
                                                        <span style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</span>
                                                        <span style={{ fontSize: 12, color: 'var(--light-roast)', marginLeft: 8 }}>× {item.quantity}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <span style={{ fontWeight: 600, fontSize: 14 }}>${item.total}</span>
                                                        <button onClick={() => openReview('product', order.id, item.id, item.name)} style={{
                                                            background: 'none', border: '1px solid rgba(243,156,18,0.3)',
                                                            borderRadius: 6, padding: '3px 8px', color: '#F39C12',
                                                            fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'inherit',
                                                        }}>
                                                            <FiStar size={10} /> Rate
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* View/hide reviews */}
                                <div style={{
                                    padding: '10px 20px', borderTop: '1px solid rgba(44,24,16,0.04)',
                                    display: 'flex', justifyContent: 'center',
                                }}>
                                    <button onClick={() => toggleBillReviews(order.id)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: 12, fontWeight: 500, color: 'var(--caramel)', fontFamily: 'inherit',
                                    }}>
                                        {isExpanded ? 'Hide Reviews' : 'View Reviews'}
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: '0 20px 16px' }}>
                                        {reviews.length === 0 ? (
                                            <p style={{ fontSize: 13, color: 'var(--light-roast)', textAlign: 'center', padding: 12 }}>
                                                No reviews yet for this order
                                            </p>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {reviews.map((r) => (
                                                    <div key={r.id} style={{
                                                        padding: '10px 14px', background: 'rgba(243,156,18,0.04)',
                                                        borderRadius: 'var(--radius-sm)', border: '1px solid rgba(243,156,18,0.1)',
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <span style={{ fontSize: 13, fontWeight: 600 }}>{r.customerName}</span>
                                                                {r.reviewType === 'product' && r.productName && (
                                                                    <span style={{
                                                                        fontSize: 11, padding: '1px 6px', borderRadius: 8,
                                                                        background: 'rgba(212,165,116,0.15)', color: 'var(--medium-roast)',
                                                                    }}>
                                                                        {r.productName}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ display: 'flex', gap: 2 }}>
                                                                {[1, 2, 3, 4, 5].map((s) => (
                                                                    <FiStar key={s} size={12} fill={s <= r.score ? '#F39C12' : 'none'} color={s <= r.score ? '#F39C12' : '#ddd'} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {r.comment && <p style={{ fontSize: 13, color: 'var(--medium-roast)' }}>{r.comment}</p>}
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
            )}

            {/* Review Modal */}
            <Modal open={!!reviewModal} onClose={() => setReviewModal(null)}
                title={reviewModal?.type === 'product' ? `Review: ${reviewModal.productName}` : 'Review Order'}>
                <form onSubmit={handleSubmitReview}>
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        <p style={{ fontSize: 14, color: 'var(--light-roast)', marginBottom: 12 }}>
                            {reviewModal?.type === 'product' ? 'How was this item?' : 'How was your order experience?'}
                        </p>
                        <StarPicker value={score} onChange={setScore} size={32} />
                    </div>
                    <textarea
                        value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows={3}
                        style={{
                            width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid rgba(44,24,16,0.12)', fontSize: 14,
                            fontFamily: 'inherit', outline: 'none', resize: 'vertical', marginBottom: 16,
                        }}
                    />
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <Button variant="secondary" type="button" onClick={() => setReviewModal(null)}>Cancel</Button>
                        <Button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FiSend size={14} /> {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
