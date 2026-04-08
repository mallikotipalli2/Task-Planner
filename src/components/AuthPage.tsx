import React, { useState } from 'react';
import { useAuthStore } from '../authStore';

type AuthTab = 'login' | 'register';

export const AuthPage: React.FC = () => {
    const [tab, setTab] = useState<AuthTab>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = useAuthStore((s) => s.login);
    const register = useAuthStore((s) => s.register);
    const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
    const error = useAuthStore((s) => s.error);
    const loading = useAuthStore((s) => s.loading);
    const clearError = useAuthStore((s) => s.clearError);

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
        <div className="auth-page">
            <div className="auth-card">
                <h1 className="auth-card__title">Daily Planner</h1>
                <p className="auth-card__subtitle">
                    Plan your day, track your progress
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
                        <label className="auth-card__label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            className="auth-card__input"
                            type="text"
                            placeholder="Pick a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            minLength={3}
                            maxLength={20}
                            autoComplete="username"
                            required
                        />
                        <span className="auth-card__hint">3-20 characters</span>
                    </div>

                    <div className="auth-card__field">
                        <label className="auth-card__label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="auth-card__input"
                            type="password"
                            placeholder="Enter password"
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

                <div className="auth-card__divider">
                    <span>or</span>
                </div>

                <button
                    className="auth-card__guest"
                    onClick={continueAsGuest}
                >
                    Continue as Guest
                </button>
                <p className="auth-card__guest-hint">
                    Guest data is stored locally in this browser only
                </p>
            </div>
        </div>
    );
};
