import React, { useEffect } from 'react';
import { useTaskStore } from './store';
import { Header, TaskInput, TaskList, ProgressBar } from './components';

const App: React.FC = () => {
    const theme = useTaskStore((s) => s.theme);

    // Apply theme to <html> for CSS vars
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className="app">
            <Header />
            <TaskInput />
            <ProgressBar />
            <TaskList />
        </div>
    );
};

export default App;
