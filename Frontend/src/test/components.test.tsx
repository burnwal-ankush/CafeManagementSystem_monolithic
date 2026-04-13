import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../components/Modal';
import { Input, Select, Button } from '../components/FormField';

describe('Modal', () => {
    it('renders nothing when closed', () => {
        const { container } = render(<Modal open={false} onClose={() => { }} title="Test">Content</Modal>);
        expect(container.innerHTML).toBe('');
    });

    it('renders title and content when open', () => {
        render(<Modal open={true} onClose={() => { }} title="Test Modal">Modal Content</Modal>);
        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', () => {
        const onClose = vi.fn();
        render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>);
        fireEvent.click(screen.getByRole('button'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop clicked', () => {
        const onClose = vi.fn();
        const { container } = render(<Modal open={true} onClose={onClose} title="Test">Content</Modal>);
        fireEvent.click(container.firstChild!);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onClose when inner content clicked', () => {
        const onClose = vi.fn();
        render(<Modal open={true} onClose={onClose} title="Test"><span data-testid="inner">Inner</span></Modal>);
        fireEvent.click(screen.getByTestId('inner'));
        expect(onClose).not.toHaveBeenCalled();
    });
});

describe('Input', () => {
    it('renders label and input', () => {
        render(<Input label="Email" placeholder="Enter email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('handles value changes', () => {
        const onChange = vi.fn();
        render(<Input label="Name" value="test" onChange={onChange} />);
        fireEvent.change(screen.getByDisplayValue('test'), { target: { value: 'new' } });
        expect(onChange).toHaveBeenCalled();
    });

    it('applies focus styles on focus', () => {
        render(<Input label="Test" data-testid="inp" />);
        const input = screen.getByRole('textbox');
        fireEvent.focus(input);
        expect(input.style.borderColor).toBe('var(--caramel)');
        expect(input.style.boxShadow).toBe('0 0 0 3px rgba(212,165,116,0.15)');
    });

    it('removes focus styles on blur', () => {
        render(<Input label="Test" />);
        const input = screen.getByRole('textbox');
        fireEvent.focus(input);
        fireEvent.blur(input);
        expect(input.style.borderColor).toContain('rgba');
        expect(input.style.boxShadow).toBe('none');
    });
});

describe('Select', () => {
    it('renders label and options', () => {
        render(
            <Select label="Category">
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
            </Select>
        );
        expect(screen.getByText('Category')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('handles change events', () => {
        const onChange = vi.fn();
        render(
            <Select label="Cat" onChange={onChange}>
                <option value="1">A</option>
                <option value="2">B</option>
            </Select>
        );
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
        expect(onChange).toHaveBeenCalled();
    });
});

describe('Button', () => {
    it('renders primary variant by default', () => {
        render(<Button>Click Me</Button>);
        const btn = screen.getByText('Click Me');
        expect(btn).toBeInTheDocument();
        expect(btn.style.background).toContain('linear-gradient');
    });

    it('renders secondary variant', () => {
        render(<Button variant="secondary">Cancel</Button>);
        const btn = screen.getByText('Cancel');
        expect(btn.style.background).toBe('var(--latte)');
    });

    it('renders danger variant', () => {
        render(<Button variant="danger">Delete</Button>);
        const btn = screen.getByText('Delete');
        expect(btn.style.background).toContain('linear-gradient');
    });

    it('handles click events', () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click</Button>);
        fireEvent.click(screen.getByText('Click'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByText('Disabled')).toBeDisabled();
    });

    it('merges custom style prop', () => {
        render(<Button style={{ marginTop: 10 }}>Styled</Button>);
        expect(screen.getByText('Styled').style.marginTop).toBe('10px');
    });
});
