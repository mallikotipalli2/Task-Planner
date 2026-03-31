import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import { TaskItem } from './TaskItem';

interface SortableTaskItemProps {
    task: Task;
}

export const SortableTaskItem: React.FC<SortableTaskItemProps> = ({ task }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <TaskItem
                task={task}
                isDragging={isDragging}
                dragHandleProps={listeners}
            />
        </div>
    );
};
