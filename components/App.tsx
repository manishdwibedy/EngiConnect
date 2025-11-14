import React, { useState, useEffect } from 'react';
// FIX: The `onAuthStateChanged` function is called as a method on the auth instance in Firebase v8.
// import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Header } from './Header';
import { AITutor } from './AITutor';
import { StudyRoom } from './StudyRoom';
import { Login } from './Login';

export const App = () => {
    const [view, setView] = useState('tutor'); // 'tutor' or 'study'
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Check for saved theme in localStorage or user's system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (prefersDark) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };


    useEffect(() => {
        // FIX: Use Firebase v8 `auth.onAuthStateChanged` method.
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xl">Initializing EngiConnect...</span>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
             <Header user={user} currentView={view} setView={setView} theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow overflow-y-auto">
                {view === 'tutor' && <AITutor user={user} />}
                {view === 'study' && <StudyRoom />}
            </main>
        </div>
    );
};