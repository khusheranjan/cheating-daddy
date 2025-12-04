import React from 'react';
import { createRoot } from 'react-dom/client';
import CheatingDaddyApp from './components/app/CheatingDaddyApp.jsx';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <CheatingDaddyApp />
    </React.StrictMode>
);
