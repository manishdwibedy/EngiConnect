import React from 'react';
// FIX: The `signInWithPopup` function is a method on the auth instance in Firebase v8.
// import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, analytics } from '../firebase/config';
// FIX: The `logEvent` function is a method on the analytics instance in Firebase v8.
// import { logEvent } from 'firebase/analytics';

export const Login = () => {
    const handleGoogleSignIn = async () => {
        try {
            // FIX: Use Firebase v8 `auth.signInWithPopup()` method.
            const result = await auth.signInWithPopup(googleProvider);
            analytics.then(instance => {
                if (instance) {
                    // FIX: Use Firebase v8 `instance.logEvent()` method.
                    instance.logEvent('login', { method: 'Google', user_id: result.user.uid });
                }
            });
        } catch (error) {
            console.error("Authentication error:", error);
            analytics.then(instance => {
                if (instance) {
                    // FIX: Use Firebase v8 `instance.logEvent()` method.
                    instance.logEvent('login_failed', { method: 'Google', error_message: error.message });
                }
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center space-x-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>Welcome to EngiConnect</span>
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Your AI-powered collaborative learning platform.</p>
                </div>
                <button 
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 transition-transform transform hover:scale-105"
                >
                    <svg className="w-5 h-5 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                    Sign In with Google
                </button>
            </div>
        </div>
    );
};