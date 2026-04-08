import React from 'react';
import { useTaskStore } from '../store';
import { formatDateDDMMYYYY } from '../utils';

export const ArchiveView: React.FC = () => {
    const archivedTasks = useTaskStore((s) => s.archivedTasks);
    const clearArchive = useTaskStore((s) => s.clearArchive);
    const deleteArchivedItem = useTaskStore((s) => s.deleteArchivedItem);
    const toggleArchiveView = useTaskStore((s) => s.toggleArchiveView);

    return (
        <div className="archive">
            <div className="archive__header">
                <button
                    className="archive__back-btn"
                    onClick={toggleArchiveView}
                    aria-label="Back to tasks"
                >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back
                </button>
                <h2 className="archive__title">Archive</h2>
                {archivedTasks.length > 0 && (
                    <button
                        className="archive__clear-btn"
                        onClick={clearArchive}
                        aria-label="Clear all archived tasks"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {archivedTasks.length === 0 ? (
                <div className="archive__empty">
                    <p className="archive__empty-text">No archived tasks yet</p>
                    <p className="archive__empty-sub">
                        Completed tasks you archive will appear here
                    </p>
                </div>
            ) : (
                <div className="archive__list">
                    {archivedTasks.map((task) => (
                        <div key={task.id} className="archive__item">
                            <div className="archive__item-check" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                                    <circle cx="11" cy="11" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                                    <path d="M7 11.5L9.5 14L15 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="archive__item-content">
                                <span className="archive__item-text">{task.text}</span>
                                <span className="archive__item-meta">
                                    {formatDateDDMMYYYY(task.date)} · Completed {new Date(task.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <button
                                className="archive__item-delete"
                                onClick={() => deleteArchivedItem(task.id)}
                                aria-label="Delete archived task"
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
