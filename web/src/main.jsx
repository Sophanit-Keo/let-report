// Entry point: loads styles, keeps the app sized to the visible screen, and mounts <App />.
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { App } from './App.jsx';

// Real visible height (fixes the 100vh problem with mobile browser toolbars).
function setHeight() { document.documentElement.style.setProperty('--app-h', window.innerHeight + 'px'); }
setHeight();
window.addEventListener('resize', setHeight);
window.addEventListener('orientationchange', () => setTimeout(setHeight, 250));

createRoot(document.getElementById('root')).render(<App />);
