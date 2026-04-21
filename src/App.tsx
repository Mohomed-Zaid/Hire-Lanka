import React, { useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation, Routes, Route, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthContext } from './auth/AuthProvider';
import { 
  LandingPage,
  BecomeSellerPage,
  CreateGigPage,
  SignInPage,
  JoinNowPage,
  CheckoutPage,
  OrderStatusPage,
  BrowseRequestsPage,
  CreateRequestPage,
  SellerDashboardPage,
  FreelancerProfilePage,
  TalentPage,
  InvoiceDetailPage,
} from './components/Pages';
import { MarketplacePage, GigDetailPage, ClientDashboard, ChatSystem } from './components/Marketplace';
import { PaymentPage, AdminDashboardPage, AdminLoginPage } from './components/Payments';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  const { session, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!session) {
    return <Navigate to="/auth/signin" replace state={{ from: location }} />;
  }
  return children;
}

function RoleProtectedRoute({ children, role }: { children: React.ReactElement; role: 'client' | 'freelancer' }) {
  const location = useLocation();
  const { session, user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!session) {
    return <Navigate to="/auth/signin" replace state={{ from: location }} />;
  }
  const meta = ((user?.user_metadata || {}) as any) || {};
  const currentRole = meta.role === 'freelancer' ? 'freelancer' : 'client';
  if (currentRole !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function SmartDashboard() {
  const { user } = useContext(AuthContext);
  const meta = ((user?.user_metadata || {}) as any) || {};
  const role = meta.role === 'freelancer' ? 'freelancer' : 'client';
  return role === 'freelancer' ? <SellerDashboardPage /> : <ClientDashboard />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/talent" element={<TalentPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/join" element={<JoinNowPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/payments" element={<AdminDashboardPage />} />
        <Route path="/requests" element={<BrowseRequestsPage />} />
        <Route
          path="/requests/new"
          element={
            <RoleProtectedRoute role="client">
              <CreateRequestPage />
            </RoleProtectedRoute>
          }
        />
        <Route path="/freelancer/:handle" element={<FreelancerProfilePage />} />
        <Route path="/become-seller" element={<BecomeSellerPage />} />
        <Route
          path="/seller/create-gig"
          element={
            <RoleProtectedRoute role="freelancer">
              <CreateGigPage />
            </RoleProtectedRoute>
          }
        />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:orderId" element={<OrderStatusPage />} />
        <Route path="/gig/:id" element={<GigDetailPage />} />
        <Route
          path="/invoice/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <SmartDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ChatSystem />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
