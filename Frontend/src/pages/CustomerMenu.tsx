import { useEffect, useState } from 'react';
import { getMenu } from '../services/api';
import type { Product } from '../types';
import { FiCoffee } from 'react-icons/fi';

export default function CustomerMenu() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMenu()
            .then((res) => setProducts(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Group by category
    const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
        const cat = p.customerName || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Our Menu</h1>
                <p style={{ color: 'var(--light-roast)', fontSize: 14 }}>Browse what we have to offer</p>
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
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16,
                        }}>
                            {items.map((p, i) => (
                                <div key={p.id} className="scale-in" style={{
                                    background: 'white', borderRadius: 'var(--radius-md)', padding: 20,
                                    boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(44,24,16,0.04)',
                                    animationDelay: `${i * 0.05}s`, animationFillMode: 'both',
                                    transition: 'box-shadow 0.2s, transform 0.2s',
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{p.name}</h3>
                                        <span style={{
                                            fontSize: 18, fontWeight: 700, color: 'var(--caramel)',
                                            fontFamily: "'Playfair Display', serif",
                                        }}>
                                            ${p.price}
                                        </span>
                                    </div>
                                    {p.description && (
                                        <p style={{ fontSize: 13, color: 'var(--light-roast)', lineHeight: 1.5 }}>
                                            {p.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
