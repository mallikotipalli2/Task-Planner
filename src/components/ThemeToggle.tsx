import React from 'react';
import { useTaskStore } from '../store';

export const ThemeToggle: React.FC = () => {
    const theme = useTaskStore((s) => s.theme);
    const toggleTheme = useTaskStore((s) => s.toggleTheme);

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                        d="M17.293 13.293A8 8 0 016.707 2.707a8.003 8.003 0 1010.586 10.586z"
                        fill="currentColor"
                    />
                </svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="4" fill="currentColor" />
                    <path
                        d="M10 1v2M10 17v2M1 10h2M17 10h2M3.93 3.93l1.41 1.41M14.66 14.66l1.41 1.41M3.93 16.07l1.41-1.41M14.66 5.34l1.41-1.41"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </button>
    );
};
