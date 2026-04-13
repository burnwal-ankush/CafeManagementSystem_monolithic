import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

const baseStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1.5px solid rgba(44,24,16,0.12)', fontSize: 14,
    fontFamily: 'inherit', background: 'var(--foam)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
};

export function Input({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                {label}
            </label>
            <input
                {...props}
                style={baseStyle}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--caramel)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,165,116,0.15)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(44,24,16,0.12)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            />
        </div>
    );
}

export function Select({ label, children, ...props }: { label: string } & SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--medium-roast)' }}>
                {label}
            </label>
            <select {...props} style={{ ...baseStyle, cursor: 'pointer' }}>
                {children}
            </select>
        </div>
    );
}

export function Button({ variant = 'primary', children, ...props }: {
    variant?: 'primary' | 'secondary' | 'danger';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const styles: Record<string, React.CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, var(--caramel), var(--gold))',
            color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(212,165,116,0.35)',
        },
        secondary: {
            background: 'var(--latte)', color: 'var(--espresso)', border: '1px solid rgba(44,24,16,0.1)',
        },
        danger: {
            background: 'linear-gradient(135deg, #E74C3C, #C0392B)',
            color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(231,76,60,0.3)',
        },
    };

    return (
        <button
            {...props}
            style={{
                padding: '10px 20px', borderRadius: 'var(--radius-sm)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s ease', fontFamily: 'inherit',
                ...styles[variant], ...props.style,
            }}
        >
            {children}
        </button>
    );
}
