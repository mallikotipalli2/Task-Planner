import React from 'react';
import { useTaskStore } from '../store';
import { formatDateLabel, formatDateDDMMYYYY, toDateKey } from '../utils';
import { ThemeToggle } from './ThemeToggle';

export const Header: React.FC = () => {
    const currentDate = useTaskStore((s) => s.currentDate);
    const setDate = useTaskStore((s) => s.setDate);
    const today = toDateKey();
    const isToday = currentDate === today;

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
                <ThemeToggle />
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
