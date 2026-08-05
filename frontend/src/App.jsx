/**
 * App.jsx — Root router
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import WorkspacePage from './pages/WorkspacePage';
import useAppStore from './store/useAppStore';
import Spinner from './components/UI/Spinner';

function RouteGuard({ children, isPrivate }) {
  const user = useAppStore((state) => state.user);
  const authChecking = useAppStore((state) => state.authChecking);
  const sandboxId = useAppStore((state) => state.sandboxId);

  if (authChecking) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: '#0d0e12', color: '#fff' }}>
        <Spinner size={32} />
        <span style={{ marginLeft: '12px', fontSize: '16px' }}>Loading...</span>
      </div>
    );
  }

  if (isPrivate) {
    // If not logged in, redirect to landing
    if (!user) {
      return <Navigate to="/" replace />;
    }
    // If logged in but no active sandbox, redirect to landing
    if (!sandboxId) {
      return <Navigate to="/" replace />;
    }
    return children;
  } else {
    // Public route (Landing page)
    // If logged in and has active sandbox session, redirect to workspace
    if (user && sandboxId) {
      return <Navigate to="/workspace" replace />;
    }
    return children;
  }
}

export default function App() {
  const checkAuth = useAppStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RouteGuard isPrivate={false}>
              <LandingPage />
            </RouteGuard>
          }
        />
        <Route
          path="/workspace"
          element={
            <RouteGuard isPrivate={true}>
              <WorkspacePage />
            </RouteGuard>
          }
        />
        {/* Catch-all: redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
