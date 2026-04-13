import { useEffect, useState } from 'react';
import { getDashboardCounts } from '../services/api';
import { FiGrid, FiPackage, FiFileText, FiTrendingUp, FiCoffee } from 'react-icons/fi';
import type { DashboardCounts } from '../types';

export default function Dashboard() {
    const [counts, setCounts] = useState<DashboardCounts>({ category: 0, product: 0, bill: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardCounts()
            .then((res) => setCounts(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        {
            label: 'Categories', value: counts.category, icon: <FiGrid />,
            gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
            shadow: 'rgba(102,126,234,0.3)',
        },
        {
            label: 'Products', value: counts.product, icon: <FiPackage />,
            gradient: 'linear-gradient(135deg, var(--caramel), var(--gold))',
            shadow: 'rgba(212,165,116,0.3)',
        },
        {
            label: 'Bills', value: counts.bill, icon: <FiFileText />,
            gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
            shadow: 'rgba(245,87,108,0.3)',
        },
    ];

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
                <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>
                    Here's what's brewing today
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 20, marginBottom: 32,
            }}>
                {cards.map((card, i) => (
                    <div key={i} className="scale-in" style={{
                        background: 'white', borderRadius: 'var(--radius-lg)',
                        padding: '24px', boxShadow: 'var(--shadow-md)',
                        border: '1px solid rgba(44,24,16,0.04)',
                        animationDelay: `${i * 0.1}s`, animationFillMode: 'both',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Background decoration */}
                        <div style={{
                            position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                            borderRadius: '50%', background: card.gradient, opacity: 0.08,
                        }} />
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            position: 'relative',
                        }}>
                            <div>
                                <p style={{ fontSize: 13, color: 'var(--light-roast)', fontWeight: 500, marginBottom: 8 }}>
                                    {card.label}
                                </p>
                                <p style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                                    {loading ? '—' : card.value}
                                </p>
                            </div>
                            <div style={{
                                width: 52, height: 52, borderRadius: 'var(--radius-md)',
                                background: card.gradient, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'white', fontSize: 22,
                                boxShadow: `0 8px 20px ${card.shadow}`,
                            }}>
                                {card.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Info */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 20,
            }}>
                {/* Welcome Card */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--espresso), var(--dark-roast))',
                    borderRadius: 'var(--radius-lg)', padding: '32px',
                    color: 'white', position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: -30, right: -30, width: 150, height: 150,
                        borderRadius: '50%', background: 'rgba(212,165,116,0.1)',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: -20, width: 100, height: 100,
                        borderRadius: '50%', background: 'rgba(201,169,110,0.08)',
                    }} />
                    <div style={{ position: 'relative' }}>
                        <FiCoffee style={{ fontSize: 32, marginBottom: 16, opacity: 0.8 }} />
                        <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
                            Good to see you!
                        </h3>
                        <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.7 }}>
                            Your café management system is running smoothly. Check your categories,
                            products, and orders from the sidebar.
                        </p>
                    </div>
                </div>

                {/* Activity Summary */}
                <div style={{
                    background: 'white', borderRadius: 'var(--radius-lg)',
                    padding: '28px', boxShadow: 'var(--shadow-md)',
                    border: '1px solid rgba(44,24,16,0.04)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <FiTrendingUp style={{ color: 'var(--caramel)', fontSize: 20 }} />
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Quick Overview</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            { label: 'Menu Categories', count: counts.category, color: '#667eea' },
                            { label: 'Active Products', count: counts.product, color: 'var(--caramel)' },
                            { label: 'Total Orders', count: counts.bill, color: '#f5576c' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%', background: item.color,
                                    flexShrink: 0,
                                }} />
                                <span style={{ flex: 1, fontSize: 14, color: 'var(--medium-roast)' }}>
                                    {item.label}
                                </span>
                                <span style={{ fontSize: 16, fontWeight: 700 }}>
                                    {loading ? '—' : item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
