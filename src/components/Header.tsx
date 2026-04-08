import React from 'react';
import { useTaskStore } from '../store';
import { useAuthStore } from '../authStore';
import { formatDateLabel, formatDateDDMMYYYY, toDateKey } from '../utils';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
    const currentDate = useTaskStore((s) => s.currentDate);
    const setDate = useTaskStore((s) => s.setDate);
    const today = toDateKey();
    const isToday = currentDate === today;

    const authMode = useAuthStore((s) => s.mode);
    const user = useAuthStore((s) => s.user);
    const openAuthModal = useAuthStore((s) => s.openAuthModal);
    const openProfileModal = useAuthStore((s) => s.openProfileModal);

    const goToPrevDay = () => {
        const d = new Date(currentDate + 'T00:00:00');
        d.setDate(d.getDate() - 1);
        setDate(toDateKey(d));
    };

    const goToNextDay = () => {
        const d = new Date(currentDate + 'T00:00:00');
        d.setDate(d.getDate() + 1);
        setDate(toDateKey(d));
    };

    const goToToday = () => {
        setDate(today);
    };

    return (
        <header className="header">
            <div className="header__top">
                <h1 className="header__title">Daily Planner</h1>
                <div className="header__actions">
                    {authMode === 'authenticated' ? (
                        <button
                            className="header__user-badge header__user-badge--auth"
                            onClick={openProfileModal}
                            title="Open profile"
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            {user?.username}
                        </button>
                    ) : (
                        <button
                            className="header__user-badge header__user-badge--guest"
                            onClick={openAuthModal}
                            title="Click to login or register"
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M2 14c0-3.3 2.7-5 6-5s6 1.7 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Guest
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="header__user-arrow">
                                <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                    <ThemeToggle />
                </div>
            </div>
            <div className="header__nav">
                <button
                    className="header__nav-btn"
                    onClick={goToPrevDay}
                    aria-label="Previous day"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <div className="header__date-group">
                    <span className="header__date">{formatDateLabel(currentDate)}</span>
                    <span className="header__date-sub">{formatDateDDMMYYYY(currentDate)}</span>
                    {!isToday && (
                        <button className="header__today-btn" onClick={goToToday}>
                            Go to Today
                        </button>
                    )}
                </div>
                <button
                    className="header__nav-btn"
                    onClick={goToNextDay}
                    aria-label="Next day"
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </header>
    );
};
