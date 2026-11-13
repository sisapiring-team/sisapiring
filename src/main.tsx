import 'lenis/dist/lenis.css';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {
  destroySmoothScroll,
  initSmoothScroll,
} from './lib/smoothScroll.ts';
import './index.css';

initSmoothScroll();

if (import.meta.hot) {
  import.meta.hot.dispose(destroySmoothScroll);
}

createRoot(document.getElementById('root')!).render(<App />);
