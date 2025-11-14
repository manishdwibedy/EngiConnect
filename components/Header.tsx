import React from 'react';
// FIX: The `signOut` function is a method on the auth instance in Firebase v8.
// import { signOut } from 'firebase/auth';
import { auth, analytics } from '../firebase/config';
import { ThemeToggle } from './ThemeToggle';
// FIX: The `logEvent` function is a method on the analytics instance in Firebase v8.
// import { logEvent } from 'firebase/analytics';

export const Header = ({ user, currentView, setView, theme, toggleTheme }) => {
    const handleSignOut = () => {
        // FIX: Use Firebase v8 `auth.signOut()` method.
        auth.signOut().then(() => {
            analytics.then(instance => {
                // FIX: Use Firebase v8 `instance.logEvent()` method.
                if (instance) instance.logEvent('logout');
            });
        }).catch((error) => {
            console.error("Sign out error", error);
        });
    };

    const handleSetView = (newView) => {
        setView(newView);
        analytics.then(instance => {
            if (instance) {
                // FIX: Use Firebase v8 `instance.logEvent()` method.
                instance.logEvent('select_content', {
                    content_type: 'view',
                    item_id: newView,
                });
            }
        });
    };

    return (
        <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-md">
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        <span>EngiConnect</span>
                    </h1>
                    <nav className="flex space-x-2">
                        <button
                            onClick={() => handleSetView('tutor')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentView === 'tutor'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            AI Tutor
                        </button>
                        <button
                            onClick={() => handleSetView('study')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentView === 'study'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            Study Room
                        </button>
                    </nav>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden sm:block">Welcome, {user.displayName || 'User'}</span>
                    <img className="h-8 w-8 rounded-full" src={user.photoURL} alt="User avatar" />
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                    <button onClick={handleSignOut} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-purple-500 dark:focus:ring-white" aria-label="Sign out">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
};