import React from 'react';
import { ThemeProvider } from './providers/ThemeProvider';
import { RouterProvider } from './providers/RouterProvider';
import { ErrorBoundary } from './ErrorBoundary';

const App: React.FC = () => (
  <ThemeProvider>
    <ErrorBoundary>
      <RouterProvider />
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
