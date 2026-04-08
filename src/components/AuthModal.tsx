import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../authStore';

type AuthTab = 'login' | 'register';

export const AuthModal: React.FC = () => {
    const [tab, setTab] = useState<AuthTab>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = useAuthStore((s) => s.login);
    const register = useAuthStore((s) => s.register);
    const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
    const error = useAuthStore((s) => s.error);
    const loading = useAuthStore((s) => s.loading);
    const clearError = useAuthStore((s) => s.clearError);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAuthModal();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [closeAuthModal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tab === 'login') {
            login(username.trim(), password);
        } else {
            register(username.trim(), password);
        }
    };

    const switchTab = (t: AuthTab) => {
        setTab(t);
        clearError();
    };

    return (
        <div className="auth-overlay" onClick={closeAuthModal}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal__header">
                    <h2 className="auth-modal__title">
                        {tab === 'login' ? 'Welcome back' : 'Create account'}
                    </h2>
                    <button className="auth-modal__close" onClick={closeAuthModal} aria-label="Close">
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <p className="auth-modal__desc">
                    {tab === 'login'
                        ? 'Login to sync your tasks across devices'
                        : 'Create an account to access your tasks from anywhere'}
                </p>

                <div className="auth-card__tabs">
                    <button
                        className={`auth-card__tab ${tab === 'login' ? 'auth-card__tab--active' : ''}`}
                        onClick={() => switchTab('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-card__tab ${tab === 'register' ? 'auth-card__tab--active' : ''}`}
                        onClick={() => switchTab('register')}
                    >
                        Register
                    </button>
                </div>

                <form className="auth-card__form" onSubmit={handleSubmit}>
                    <div className="auth-card__field">
                        <label className="auth-card__label" htmlFor="modal-username">Username</label>
                        <input
                            id="modal-username"
                            className="auth-card__input"
                            type="text"
                            placeholder="Your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            minLength={3}
                            maxLength={20}
                            autoComplete="username"
                            autoFocus
                            required
                        />
                        <span className="auth-card__hint">3-20 characters</span>
                    </div>

                    <div className="auth-card__field">
                        <label className="auth-card__label" htmlFor="modal-password">Password</label>
                        <input
                            id="modal-password"
                            className="auth-card__input"
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={4}
                            maxLength={64}
                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                            required
                        />
                        <span className="auth-card__hint">4-64 characters</span>
                    </div>

                    {error && (
                        <div className="auth-card__error">{error}</div>
                    )}

                    <button
                        type="submit"
                        className="auth-card__submit"
                        disabled={loading || !username.trim() || !password}
                    >
                        {loading ? 'Please wait...' : tab === 'login' ? 'Login' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};
