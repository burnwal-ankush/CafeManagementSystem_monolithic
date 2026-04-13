import { useEffect, useState } from 'react';
import { getMyOrders, getMyRatings } from '../services/api';
import type { Bill, Rating } from '../types';
import { FiShoppingBag, FiStar, FiCoffee, FiDollarSign } from 'react-icons/fi';

export default function CustomerDashboard() {
    const [orders, setOrders] = useState<Bill[]>([]);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getMyOrders(), getMyRatings()])
            .then(([oRes, rRes]) => {
                setOrders(oRes.data);
                setRatings(rRes.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    const cards = [
        { label: 'My Orders', value: orders.length, icon: <FiShoppingBag />, gradient: 'linear-gradient(135deg, var(--caramel), var(--gold))', shadow: 'rgba(212,165,116,0.3)' },
        { label: 'Total Spent', value: `$${totalSpent}`, icon: <FiDollarSign />, gradient: 'linear-gradient(135deg, #667eea, #764ba2)', shadow: 'rgba(102,126,234,0.3)' },
        { label: 'My Reviews', value: ratings.length, icon: <FiStar />, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', shadow: 'rgba(245,87,108,0.3)' },
    ];

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Welcome Back!</h1>
                <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Here's your café activity</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
                {cards.map((card, i) => (
                    <div key={i} className="scale-in" style={{
                        background: 'white', borderRadius: 'var(--radius-lg)', padding: 24,
                        boxShadow: 'var(--shadow-md)', border: '1px solid rgba(44,24,16,0.04)',
                        position: 'relative', overflow: 'hidden',
                        animationDelay: `${i * 0.1}s`, animationFillMode: 'both',
                    }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: card.gradient, opacity: 0.08 }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                            <div>
                                <p style={{ fontSize: 13, color: 'var(--light-roast)', fontWeight: 500, marginBottom: 8 }}>{card.label}</p>
                                <p style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                                    {loading ? '—' : card.value}
                                </p>
                            </div>
                            <div style={{
                                width: 48, height: 48, borderRadius: 'var(--radius-md)', background: card.gradient,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: 20, boxShadow: `0 8px 20px ${card.shadow}`,
                            }}>{card.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div style={{
                background: 'white', borderRadius: 'var(--radius-lg)', padding: 28,
                boxShadow: 'var(--shadow-md)', marginBottom: 24,
            }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiCoffee style={{ color: 'var(--caramel)' }} /> Recent Orders
                </h3>
                {orders.length === 0 ? (
                    <p style={{ color: 'var(--light-roast)', fontSize: 14, textAlign: 'center', padding: 24 }}>
                        No orders yet. Visit us and place your first order!
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {orders.slice(0, 5).map((order) => (
                            <div key={order.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', background: 'var(--latte)', borderRadius: 'var(--radius-sm)',
                            }}>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: 14 }}>{order.uuid}</p>
                                    <p style={{ fontSize: 12, color: 'var(--light-roast)' }}>{order.paymentMethod}</p>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: 16, fontFamily: "'Playfair Display', serif" }}>
                                    ${order.total}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
