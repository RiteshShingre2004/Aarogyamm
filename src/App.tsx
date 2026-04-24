import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useAppContext } from './context/AppContext';
import SideNav from './components/SideNav';
import ToastProvider from './components/ToastProvider';

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Step1Metrics = lazy(() => import('./pages/onboarding/Step1Metrics'));
const Step2Goal = lazy(() => import('./pages/onboarding/Step2Goal'));
const Step3FitnessLevel = lazy(() => import('./pages/onboarding/Step3FitnessLevel'));
const Step4Profile = lazy(() => import('./pages/onboarding/Step4Profile'));
const PlanGenerating = lazy(() => import('./pages/onboarding/PlanGenerating'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkoutPlayer = lazy(() => import('./pages/WorkoutPlayer'));
const MealPlan = lazy(() => import('./pages/MealPlan'));
const Progress = lazy(() => import('./pages/Progress'));
const Profile = lazy(() => import('./pages/Profile'));

// Routes that show the sidebar nav
const MAIN_ROUTES = ['/dashboard', '/workout', '/meal', '/progress', '/profile'];

// Loading fallback
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF5F8' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '4px solid rgba(212,65,142,0.2)',
          borderTopColor: '#D4418E',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontFamily: 'Kalam, cursive', fontSize: 18, color: '#D4418E' }}>Loading... 🌸</p>
      </div>
    </div>
  );
}

// Protected route — redirects to /login if not authed
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { state } = useAppContext();
  const { userData, isDataLoading } = state;

  if (authLoading || (user && isDataLoading)) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  // Check onboarding status
  const onboardingComplete = userData?.profile?.onboardingComplete === true;
  const isTargetingOnboarding = window.location.pathname.startsWith('/onboarding');

  if (!onboardingComplete && !isTargetingOnboarding) {
    return <Navigate to="/onboarding/step1" replace />;
  }

  return <>{children}</>;
}

// Redirects authenticated users away from auth pages
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { state } = useAppContext();
  const { userData, isDataLoading } = state;

  if (authLoading || (user && isDataLoading)) return <PageLoader />;

  if (user) {
    const onboardingComplete = userData?.profile?.onboardingComplete === true;
    if (onboardingComplete) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/onboarding/step1" replace />;
    }
  }

  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  const showNav = MAIN_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <>
      <ToastProvider />
      {showNav ? (
        // Desktop: sidebar + content
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FFF5F8' }}>
          <SideNav />
          <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/workout" element={<ProtectedRoute><WorkoutPlayer /></ProtectedRoute>} />
                <Route path="/meal" element={<ProtectedRoute><MealPlan /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      ) : (
        // Full-screen for auth / onboarding / landing
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/onboarding/step1" element={<ProtectedRoute><Step1Metrics /></ProtectedRoute>} />
            <Route path="/onboarding/step2" element={<ProtectedRoute><Step2Goal /></ProtectedRoute>} />
            <Route path="/onboarding/step3" element={<ProtectedRoute><Step3FitnessLevel /></ProtectedRoute>} />
            <Route path="/onboarding/step4" element={<ProtectedRoute><Step4Profile /></ProtectedRoute>} />
            <Route path="/onboarding/generating" element={<ProtectedRoute><PlanGenerating /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
