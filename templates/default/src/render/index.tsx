import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootDiv = document.createElement('div');
rootDiv.setAttribute('id', 'root');
document.body.appendChild(rootDiv);

const root = createRoot(rootDiv);
root.render(<App />);
