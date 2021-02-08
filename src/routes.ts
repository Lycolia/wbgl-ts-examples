import App from './App';
import { Triangle } from './components/triangle/triangle';

export const routes = [
  {
    path: '/',
    exact: true,
    component: App,
  },
  {
    path: '/triangle',
    exact: true,
    component: Triangle,
  },
];
