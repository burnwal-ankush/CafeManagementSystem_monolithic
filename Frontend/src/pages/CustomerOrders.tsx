import { useEffect, useState } from 'react';
import { getMyOrders } from '../services/api';
import type { Bill, ProductDetail } from '../types';
import { FiShoppingBag, FiCalendar, FiCreditCard } from 'react-icons/fi';

export default function CustomerOrders() {
    const [orders, setOrders] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyOrders()
            .then((res) => setOrders(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const parseDetails = (detail: string): ProductDetail[] => {
        try { return JSON.parse(detail); } catch { return []; }
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>My Orders</h1>
                <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Your complete order history</p>
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
                                                    <FiCreditCard size={12} />
                                                    {order.paymentMethod}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif",
                                        color: 'var(--espresso)',
                                    }}>
                                        ${order.total}
                                    </span>
                                </div>

                                {/* Items */}
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
                                                    <span style={{ fontWeight: 600, fontSize: 14 }}>${item.total}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
