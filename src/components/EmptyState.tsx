import React from 'react';

export const EmptyState: React.FC = () => (
    <div className="empty-state">
        <div className="empty-state__icon" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                <path
                    d="M22 32h20M32 22v20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.3"
                />
            </svg>
        </div>
        <p className="empty-state__title">No tasks yet</p>
        <p className="empty-state__subtitle">
            Add your first task above to start planning your day
        </p>
    </div>
);
