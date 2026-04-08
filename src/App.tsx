import React, { useEffect } from 'react';
import { useTaskStore } from './store';
import { Header, TaskInput, TaskList, ProgressBar, ProductivityChart } from './components';

const App: React.FC = () => {
    const theme = useTaskStore((s) => s.theme);
    const ready = useTaskStore((s) => s.ready);
    const init = useTaskStore((s) => s.init);

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

    return (
        <div className="app">
            <Header />
            <TaskInput />
            <ProgressBar />
            <TaskList />
            <ProductivityChart />
        </div>
    );
};

export default App;
