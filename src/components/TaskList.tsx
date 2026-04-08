import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTaskStore } from '../store';
import { SortableTaskItem } from './SortableTaskItem';
import { EmptyState } from './EmptyState';

export const TaskList: React.FC = () => {
    const tasks = useTaskStore((s) => s.tasks);
    const reorderTasks = useTaskStore((s) => s.reorderTasks);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 4 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            reorderTasks(String(active.id), String(over.id));
        }
    };

    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);

    if (tasks.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="task-list">
            {pending.length > 0 && (
                <div className="task-list__section">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={pending.map((t) => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="task-list__items" role="list" aria-label="Pending tasks">
                                {pending.map((task) => (
                                    <SortableTaskItem key={task.id} task={task} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {completed.length > 0 && (
                <div className="task-list__section task-list__section--completed">
                    <div className="task-list__section-header">
                        <span className="task-list__section-label">
                            Completed ({completed.length})
                        </span>
                        <button
                            className="task-list__archive-btn"
                            onClick={() => useTaskStore.getState().archiveCompleted()}
                            aria-label="Archive completed tasks"
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M2 4h12M3 4v9a1 1 0 001 1h8a1 1 0 001-1V4M6 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Archive
                        </button>
                    </div>
                    <div className="task-list__items" role="list" aria-label="Completed tasks">
                        {completed.map((task) => (
                            <div key={task.id}>
                                <SortableTaskItem task={task} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
