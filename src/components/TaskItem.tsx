import React, { useState, useRef, useEffect } from 'react';
import type { Task } from '../types';
import { useTaskStore } from '../store';

interface TaskItemProps {
    task: Task;
    dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
    isDragging?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, dragHandleProps, isDragging }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(task.text);
    const editRef = useRef<HTMLInputElement>(null);
    const toggleTask = useTaskStore((s) => s.toggleTask);
    const updateTask = useTaskStore((s) => s.updateTask);
    const deleteTask = useTaskStore((s) => s.deleteTask);

    useEffect(() => {
        if (isEditing) {
            editRef.current?.focus();
            editRef.current?.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        const trimmed = editValue.trim();
        if (trimmed && trimmed !== task.text) {
            updateTask(task.id, trimmed);
        } else {
            setEditValue(task.text);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') {
            setEditValue(task.text);
            setIsEditing(false);
        }
    };

    const classNames = [
        'task-item',
        task.completed ? 'task-item--completed' : '',
        isDragging ? 'task-item--dragging' : '',
        isEditing ? 'task-item--editing' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classNames} role="listitem">
            {/* Drag handle */}
            <button
                className="task-item__drag"
                aria-label="Drag to reorder"
                {...dragHandleProps}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="6" cy="4" r="1.25" fill="currentColor" />
                    <circle cx="10" cy="4" r="1.25" fill="currentColor" />
                    <circle cx="6" cy="8" r="1.25" fill="currentColor" />
                    <circle cx="10" cy="8" r="1.25" fill="currentColor" />
                    <circle cx="6" cy="12" r="1.25" fill="currentColor" />
                    <circle cx="10" cy="12" r="1.25" fill="currentColor" />
                </svg>
            </button>

            {/* Checkbox */}
            <button
                className="task-item__check"
                onClick={() => toggleTask(task.id)}
                aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                role="checkbox"
                aria-checked={task.completed}
            >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <circle
                        cx="11"
                        cy="11"
                        r="10"
                        className="task-item__check-circle"
                    />
                    {task.completed && (
                        <path
                            d="M7 11.5L9.5 14L15 8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="task-item__check-mark"
                        />
                    )}
                </svg>
            </button>

            {/* Content */}
            {isEditing ? (
                <input
                    ref={editRef}
                    className="task-item__edit"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    maxLength={200}
                    aria-label="Edit task"
                />
            ) : (
                <div className="task-item__content">
                    <span
                        className="task-item__text"
                        onDoubleClick={() => {
                            if (!task.completed) setIsEditing(true);
                        }}
                        title="Double-click to edit"
                    >
                        {task.text}
                    </span>
                    <span className="task-item__created">
                        Created {new Date(task.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )}

            {/* Delete */}
            <button
                className="task-item__delete"
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    );
};
