import { RouteObject } from 'react-router-dom';
import { createElement } from 'react';
import Home from './components/Home';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: createElement(Home),
  },
];
