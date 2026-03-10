import React from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { RouterProvider } from './providers/RouterProvider';

const App: React.FC = () => (
  <ThemeProvider>
    <RouterProvider />
  </ThemeProvider>
);

export default App;
