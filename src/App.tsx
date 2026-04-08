import React, { useEffect } from 'react';
import { useTaskStore } from './store';
import { useAuthStore } from './authStore';
import { Header, TaskInput, TaskList, ProgressBar, ProductivityChart, ArchiveView, AuthPage, AuthModal, ProfileModal } from './components';

const App: React.FC = () => {
    const theme = useTaskStore((s) => s.theme);
    const ready = useTaskStore((s) => s.ready);
    const init = useTaskStore((s) => s.init);
    const sync = useTaskStore((s) => s.sync);
    const showArchive = useTaskStore((s) => s.showArchive);
    const archivedTasks = useTaskStore((s) => s.archivedTasks);
    const toggleArchiveView = useTaskStore((s) => s.toggleArchiveView);

    const authMode = useAuthStore((s) => s.mode);
    const authLoading = useAuthStore((s) => s.loading);
    const authResolved = useAuthStore((s) => s.resolved);
    const showAuthModal = useAuthStore((s) => s.showAuthModal);
    const showProfileModal = useAuthStore((s) => s.showProfileModal);
    const initAuth = useAuthStore((s) => s.initAuth);

    // Init auth first
    useEffect(() => {
        initAuth();
    }, [initAuth]);

    // Init (or re-init) task store when auth resolves or mode changes
    useEffect(() => {
        if (authResolved) {
            init();
        }
    }, [authResolved, authMode, init]);

    // Apply theme to <html> for CSS vars
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Auto-sync: poll every 30s + refresh on tab focus (authenticated users only)
    useEffect(() => {
        if (!ready || authMode !== 'authenticated') return;

        const interval = setInterval(() => { sync(); }, 5_000);

        const onVisibility = () => {
            if (document.visibilityState === 'visible') sync();
        };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [ready, authMode, sync]);

    // Show loading while auth is initialising
    if (authLoading) {
        return (
            <div className="app app--loading">
                <span className="app__loader">Loading…</span>
            </div>
        );
    }

    // Show auth page until user picks login or guest
    if (!authResolved) {
        return <AuthPage />;
    }

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
                {showAuthModal && <AuthModal />}
                {showProfileModal && <ProfileModal />}
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
            {showAuthModal && <AuthModal />}
            {showProfileModal && <ProfileModal />}
        </div>
    );
};

export default App;
