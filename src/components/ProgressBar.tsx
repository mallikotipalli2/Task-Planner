import React from 'react';
import { useTaskStore } from '../store';

export const ProgressBar: React.FC = () => {
    const tasks = useTaskStore((s) => s.tasks);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;

    if (total === 0) return null;

    const percent = Math.round((completed / total) * 100);

    return (
        <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-bar__info">
                <span className="progress-bar__label">
                    {completed === total
                        ? '🎉 All done!'
                        : `${completed} of ${total} completed`}
                </span>
                <span className="progress-bar__percent">{percent}%</span>
            </div>
            <div className="progress-bar__track">
                <div
                    className="progress-bar__fill"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};
