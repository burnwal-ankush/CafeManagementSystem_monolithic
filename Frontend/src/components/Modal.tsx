import { type ReactNode } from 'react';
import { FiX } from 'react-icons/fi';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(44,24,16,0.5)',
                backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 100, padding: 20,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="scale-in"
                style={{
                    background: 'white', borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: 480,
                    maxHeight: '90vh', overflow: 'auto',
                }}
            >
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', borderBottom: '1px solid rgba(44,24,16,0.06)',
                }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'var(--latte)', border: 'none', borderRadius: '50%',
                        width: 32, height: 32, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: 'var(--medium-roast)',
                    }}>
                        <FiX />
                    </button>
                </div>
                <div style={{ padding: '20px 24px' }}>{children}</div>
            </div>
        </div>
    );
}
