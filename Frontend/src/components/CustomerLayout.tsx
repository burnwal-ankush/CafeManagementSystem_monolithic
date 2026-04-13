import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiShoppingBag, FiCoffee, FiStar, FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CustomerLayout() {
    const { logout, userName } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('See you next time! ☕');
        navigate('/login');
    };

    const displayName = userName || 'Customer';
    const initial = displayName.charAt(0).toUpperCase();

    const navItems = [
        { to: '/c/home', icon: <FiHome />, label: 'Home' },
        { to: '/c/menu', icon: <FiCoffee />, label: 'Menu' },
        { to: '/c/orders', icon: <FiShoppingBag />, label: 'My Orders' },
        { to: '/c/ratings', icon: <FiStar />, label: 'Reviews' },
        { to: '/c/account', icon: <FiUser />, label: 'Account' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40, display: 'none' }}
                    className="c-mobile-overlay" />
            )}

            <aside style={{
                width: 260, background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
                color: 'white', display: 'flex', flexDirection: 'column', position: 'fixed',
                top: 0, left: sidebarOpen ? 0 : -260, bottom: 0, zIndex: 50,
                transition: 'left 0.3s ease', boxShadow: 'var(--shadow-xl)',
            }} className="c-sidebar-desktop">
                <div style={{
                    padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #e8a87c, #d4a574)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, boxShadow: '0 4px 15px rgba(232,168,124,0.4)',
                    }}>
                        <FiCoffee />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', fontFamily: "'Playfair Display', serif" }}>
                            Café Bliss
                        </h2>
                        <span style={{ fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            Customer
                        </span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} style={{
                        marginLeft: 'auto', background: 'none', border: 'none', color: 'white',
                        cursor: 'pointer', fontSize: 20, display: 'none',
                    }} className="c-sidebar-close">
                        <FiX />
                    </button>
                </div>

                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                            style={({ isActive }) => ({
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                                textDecoration: 'none', fontSize: 14, fontWeight: 500,
                                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                                background: isActive ? 'linear-gradient(135deg, rgba(232,168,124,0.25), rgba(212,165,116,0.15))' : 'transparent',
                                border: isActive ? '1px solid rgba(232,168,124,0.3)' : '1px solid transparent',
                                transition: 'all 0.2s ease',
                            })}
                        >
                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                        padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                        background: 'rgba(231,76,60,0.15)', border: '1px solid rgba(231,76,60,0.2)',
                        color: '#ff8a80', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                        fontFamily: 'inherit', transition: 'all 0.2s ease',
                    }}>
                        <FiLogOut style={{ fontSize: 18 }} /> Sign Out
                    </button>
                </div>
            </aside>

            <main style={{ flex: 1, marginLeft: 0, transition: 'margin 0.3s ease' }} className="c-main-content">
                <header style={{
                    padding: '16px 24px', background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(44,24,16,0.06)',
                    display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 30,
                }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                        background: 'none', border: 'none', fontSize: 22, cursor: 'pointer',
                        color: 'var(--espresso)', padding: 4,
                    }}>
                        <FiMenu />
                    </button>
                    <div
                        onClick={() => navigate('/c/account')}
                        style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    >
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #e8a87c, #d4a574)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: 14, fontWeight: 600,
                        }}>{initial}</div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--medium-roast)' }}>{displayName}</span>
                    </div>
                </header>
                <div style={{ padding: 24 }}>
                    <Outlet />
                </div>
            </main>

            <style>{`
        @media (min-width: 768px) {
          .c-sidebar-desktop { left: 0 !important; }
          .c-main-content { margin-left: 260px !important; }
        }
        @media (max-width: 767px) {
          .c-mobile-overlay { display: block !important; }
          .c-sidebar-close { display: block !important; }
        }
      `}</style>
        </div>
    );
}
