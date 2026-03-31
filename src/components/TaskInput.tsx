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

    return (
        <form className="task-input" onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                type="text"
                className="task-input__field"
                placeholder="What needs to be done today?"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-label="New task"
                autoComplete="off"
                maxLength={200}
            />
            <button
                type="submit"
                className="task-input__btn"
                disabled={!value.trim()}
                aria-label="Add task"
            >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>
        </form>
    );
};
