import { useEffect, useState } from 'react';
import { addRating, getMyRatings, getAllRatings } from '../services/api';
import type { Rating } from '../types';
import { Button } from '../components/FormField';
import { FiStar, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CustomerRatings() {
    const [myRatings, setMyRatings] = useState<Rating[]>([]);
    const [allRatings, setAllRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [hoverScore, setHoverScore] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [tab, setTab] = useState<'mine' | 'all'>('mine');

    const load = () => {
        setLoading(true);
        Promise.all([getMyRatings(), getAllRatings()])
            .then(([mRes, aRes]) => {
                setMyRatings(mRes.data);
                setAllRatings(aRes.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (score === 0) { toast.error('Please select a rating'); return; }
        setSubmitting(true);
        try {
            await addRating({ score: String(score), comment });
            toast.success('Thanks for your feedback! ☕');
            setScore(0);
            setComment('');
            load();
        } catch {
            toast.error('Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    const ratings = tab === 'mine' ? myRatings : allRatings;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Ratings & Reviews</h1>
                <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Share your experience with us</p>
            </div>

            {/* Submit Rating */}
            <div style={{
                background: 'white', borderRadius: 'var(--radius-lg)', padding: 28,
                boxShadow: 'var(--shadow-md)', marginBottom: 24,
            }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Leave a Review</h3>
                <form onSubmit={handleSubmit}>
                    {/* Star selector */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s} type="button"
                                onClick={() => setScore(s)}
                                onMouseEnter={() => setHoverScore(s)}
                                onMouseLeave={() => setHoverScore(0)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                                    fontSize: 28, transition: 'transform 0.15s',
                                    transform: (hoverScore || score) >= s ? 'scale(1.15)' : 'scale(1)',
                                    color: (hoverScore || score) >= s ? '#F39C12' : '#ddd',
                                }}
                                aria-label={`Rate ${s} stars`}
                            >
                                <FiStar fill={(hoverScore || score) >= s ? '#F39C12' : 'none'} />
                            </button>
                        ))}
                        {score > 0 && (
                            <span style={{ marginLeft: 8, fontSize: 14, color: 'var(--light-roast)', alignSelf: 'center' }}>
                                {score}/5
                            </span>
                        )}
                    </div>

                    <textarea
                        value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience..."
                        rows={3}
                        style={{
                            width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid rgba(44,24,16,0.12)', fontSize: 14,
                            fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                            marginBottom: 16,
                        }}
                    />

                    <Button type="submit" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiSend size={14} /> {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </form>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['mine', 'all'] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                        border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                        background: tab === t ? 'linear-gradient(135deg, var(--caramel), var(--gold))' : 'white',
                        color: tab === t ? 'white' : 'var(--medium-roast)',
                        boxShadow: tab === t ? '0 4px 12px rgba(212,165,116,0.3)' : 'var(--shadow-sm)',
                    }}>
                        {t === 'mine' ? 'My Reviews' : 'All Reviews'}
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--light-roast)' }}>Loading...</div>
            ) : ratings.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: 40, background: 'white',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
                }}>
                    <FiStar style={{ fontSize: 40, color: 'var(--caramel)', marginBottom: 12 }} />
                    <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>
                        {tab === 'mine' ? 'You haven\'t left any reviews yet' : 'No reviews yet'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {ratings.map((r, i) => (
                        <div key={r.id} className="slide-in" style={{
                            background: 'white', borderRadius: 'var(--radius-md)', padding: '18px 20px',
                            boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(44,24,16,0.04)',
                            animationDelay: `${i * 0.04}s`, animationFillMode: 'both',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: `linear-gradient(135deg, hsl(${(r.id * 67) % 360}, 60%, 70%), hsl(${(r.id * 67 + 40) % 360}, 50%, 60%))`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: 14, fontWeight: 700,
                                    }}>
                                        {r.customerName?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{r.customerName}</p>
                                        <p style={{ fontSize: 11, color: 'var(--light-roast)' }}>
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <FiStar key={s} size={14}
                                            fill={s <= r.score ? '#F39C12' : 'none'}
                                            color={s <= r.score ? '#F39C12' : '#ddd'}
                                        />
                                    ))}
                                </div>
                            </div>
                            {r.comment && (
                                <p style={{ fontSize: 14, color: 'var(--medium-roast)', lineHeight: 1.6 }}>{r.comment}</p>
                            )}
                            {(r.reviewType === 'product' || r.reviewType === 'bill') && (
                                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                                    <span style={{
                                        fontSize: 11, padding: '2px 8px', borderRadius: 8,
                                        background: r.reviewType === 'product' ? 'rgba(155,89,182,0.1)' : 'rgba(52,152,219,0.1)',
                                        color: r.reviewType === 'product' ? '#9B59B6' : '#3498DB',
                                        fontWeight: 600,
                                    }}>
                                        {r.reviewType === 'product' ? `Product: ${r.productName}` : 'Order Review'}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
