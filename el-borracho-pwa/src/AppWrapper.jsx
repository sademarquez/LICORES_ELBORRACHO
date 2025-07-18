
import React, { Suspense, lazy } from 'react';

// Lazy load the 3D background to improve initial load time
const Background3D = lazy(() => import('./components/Background3D'));

export const AppWrapper = () => {
  return (
    <Suspense fallback={<div style={{backgroundColor: '#111', height: '100vh'}} />}>
      <Background3D />
      {/* Here you can add other global components that should be outside the main App if needed */}
    </Suspense>
  );
};
