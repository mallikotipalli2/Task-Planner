import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../authStore';

export const ProfileModal: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const closeProfileModal = useAuthStore((s) => s.closeProfileModal);
    const changePassword = useAuthStore((s) => s.changePassword);
    const error = useAuthStore((s) => s.error);
    const loading = useAuthStore((s) => s.loading);
    const profileSuccess = useAuthStore((s) => s.profileSuccess);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeProfileModal();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [closeProfileModal]);

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        changePassword(currentPassword, newPassword).then(() => {
            setCurrentPassword('');
            setNewPassword('');
        });
    };

    return (
        <div className="auth-overlay" onClick={closeProfileModal}>
            <div className="auth-modal profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="auth-modal__header">
                    <h2 className="auth-modal__title">Profile</h2>
                    <button className="auth-modal__close" onClick={closeProfileModal} aria-label="Close">
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="profile-modal__user">
                    <div className="profile-modal__avatar">
                        <svg width="24" height="24" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="profile-modal__info">
                        <span className="profile-modal__username">{user?.username}</span>
                        <span className="profile-modal__label">Username cannot be changed</span>
                    </div>
                </div>

                <div className="profile-modal__section">
                    <h3 className="profile-modal__section-title">Change Password</h3>
                    <form className="auth-card__form" onSubmit={handleChangePassword}>
                        <div className="auth-card__field">
                            <label className="auth-card__label" htmlFor="profile-current-pw">Current Password</label>
                            <input
                                id="profile-current-pw"
                                className="auth-card__input"
                                type="password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        <div className="auth-card__field">
                            <label className="auth-card__label" htmlFor="profile-new-pw">New Password</label>
                            <input
                                id="profile-new-pw"
                                className="auth-card__input"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={4}
                                maxLength={64}
                                autoComplete="new-password"
                                required
                            />
                            <span className="auth-card__hint">4-64 characters</span>
                        </div>

                        {error && <div className="auth-card__error">{error}</div>}
                        {profileSuccess && <div className="profile-modal__success">{profileSuccess}</div>}

                        <button
                            type="submit"
                            className="auth-card__submit"
                            disabled={loading || !currentPassword || !newPassword}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                <div className="profile-modal__footer">
                    <button className="profile-modal__logout-btn" onClick={logout}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2M10.5 12l3.5-4-3.5-4M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};
