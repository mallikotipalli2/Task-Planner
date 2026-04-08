import React, { useEffect } from 'react';
import { useTaskStore } from './store';
import { Header, TaskInput, TaskList, ProgressBar, ProductivityChart, ArchiveView } from './components';

const App: React.FC = () => {
    const theme = useTaskStore((s) => s.theme);
    const ready = useTaskStore((s) => s.ready);
    const init = useTaskStore((s) => s.init);
    const showArchive = useTaskStore((s) => s.showArchive);
    const archivedTasks = useTaskStore((s) => s.archivedTasks);
    const toggleArchiveView = useTaskStore((s) => s.toggleArchiveView);

    // Initialise DB (migrate localStorage → IndexedDB, load tasks)
    useEffect(() => {
        init();
    }, [init]);

    // Apply theme to <html> for CSS vars
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    if (!ready) {
        return (
            <div className="app app--loading">
                <span className="app__loader">Loading…</span>
            </div>
        );
    }

    if (showArchive) {
        return (
            <div className="app">
                <ArchiveView />
            </div>
        );
    }

    return (
        <div className="app">
            <Header />
            <TaskInput />
            <ProgressBar />
            <TaskList />
            <div className="app__footer">
                <button
                    className={`app__archive-link ${archivedTasks.length > 0 ? 'app__archive-link--active' : ''}`}
                    onClick={toggleArchiveView}
                    aria-label="View archived tasks"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M2 4h12M3 4v9a1 1 0 001 1h8a1 1 0 001-1V4M6 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    View Archive{archivedTasks.length > 0 ? ` (${archivedTasks.length})` : ''}
                </button>
            </div>
            <ProductivityChart />
        </div>
    );
};

export default App;
