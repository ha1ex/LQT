/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginScreen } from '../LoginScreen';

// Mock import.meta.env.VITE_APP_PASSWORD
// Vitest automatically supports import.meta.env; we set the env var for the test
vi.stubEnv('VITE_APP_PASSWORD', 'test-password-123');

describe('LoginScreen', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
    localStorage.clear();
  });

  it('renders the login form with title and description', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    expect(screen.getByText('Качество Жизни')).toBeInTheDocument();
    expect(screen.getByText('Введите пароль для входа')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();
  });

  it('has a password input that is initially of type "password"', () => {
    render(<LoginScreen onLogin={mockOnLogin} />);

    const input = screen.getByPlaceholderText('Пароль');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility when the eye button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={mockOnLogin} />);

    const input = screen.getByPlaceholderText('Пароль');
    expect(input).toHaveAttribute('type', 'password');

    // There are two buttons: submit and toggle. The toggle is not type="submit"
    const toggleButton = screen.getAllByRole('button').find(
      btn => btn.getAttribute('type') === 'button'
    )!;

    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');

    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('allows typing into the password field', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={mockOnLogin} />);

    const input = screen.getByPlaceholderText('Пароль');
    await user.type(input, 'my-secret');
    expect(input).toHaveValue('my-secret');
  });

  it('calls onLogin and sets localStorage on correct password', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={mockOnLogin} />);

    const input = screen.getByPlaceholderText('Пароль');
    const submitBtn = screen.getByRole('button', { name: /войти/i });

    await user.type(input, 'test-password-123');
    await user.click(submitBtn);

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('lqt_authenticated')).toBe('true');
  });

  it('shows error message and clears input on wrong password', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={mockOnLogin} />);

    const input = screen.getByPlaceholderText('Пароль');
    const submitBtn = screen.getByRole('button', { name: /войти/i });

    await user.type(input, 'wrong-password');
    await user.click(submitBtn);

    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(screen.getByText('Неверный пароль')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('clears error message when user starts typing again', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={mockOnLogin} />);

    const input = screen.getByPlaceholderText('Пароль');
    const submitBtn = screen.getByRole('button', { name: /войти/i });

    // Trigger error
    await user.type(input, 'wrong');
    await user.click(submitBtn);
    expect(screen.getByText('Неверный пароль')).toBeInTheDocument();

    // Start typing again
    await user.type(input, 'a');
    expect(screen.queryByText('Неверный пароль')).not.toBeInTheDocument();
  });

  it('submits on form enter key press', async () => {
    const user = userEvent.setup();
    render(<LoginScreen onLogin={mockOnLogin} />);

    const input = screen.getByPlaceholderText('Пароль');
    await user.type(input, 'test-password-123{Enter}');

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });
});
