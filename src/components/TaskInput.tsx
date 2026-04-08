import React, { useState, useRef, useEffect } from 'react';
import { useTaskStore } from '../store';

export const TaskInput: React.FC = () => {
    const [value, setValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const addTask = useTaskStore((s) => s.addTask);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        addTask(value);
        setValue('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && value.trim()) {
            handleSubmit(e);
        }
    };

    return (
        <div className="task-input-wrapper">
            <form className="task-input" onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="text"
                    className="task-input__field"
                    placeholder="What's on your plan today?"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-label="New task"
                    autoComplete="off"
                    maxLength={200}
                />
                {value.trim() && (
                    <button
                        type="submit"
                        className="task-input__btn"
                        aria-label="Add task"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                )}
            </form>
            {value.trim() && (
                <span className="task-input__hint">
                    Press <kbd>Enter</kbd> to add
                </span>
            )}
        </div>
    );
};
