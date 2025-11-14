import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';

const container = document.getElementById('root');

if (container) {
    // FIX: The `ReactDOM.render` API is deprecated in React 18. Updated to use the new `createRoot` API.
    const root = createRoot(container);
    root.render(<App />);
}
