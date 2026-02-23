import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// Suppress Chrome extension errors
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'chrome-extension-error') {
    return; // Silently ignore Chrome extension messages
  }
}, true);

// Suppress unhandled promise rejections from extensions
window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('Could not establish connection')) {
    event.preventDefault();
    return false;
  }
}, true);

// Suppress extension-related unhandled rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Could not establish connection') || 
      event.reason?.message?.includes('Receiving end does not exist')) {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
