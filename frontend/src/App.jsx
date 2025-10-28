import { Routes, Route, Navigate } from 'react-router-dom';
import { SignIn, SignUp, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import JobsBoard from './pages/JobsBoard';
import TeamManagement from './pages/TeamManagement';
import NotificationsCenter from './pages/NotificationsCenter';
import Analytics from './pages/Analytics';
import Clients from './pages/Clients';
import Revenue from './pages/Revenue';
import Messaging from './pages/Messaging';
import Automations from './pages/Automations';
import Settings from './pages/Settings';

function App() {
  return (
    <>
      <Toaster position="top-right" />

      <SignedOut>
        <Routes>
          <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
          <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </SignedOut>

      <SignedIn>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<JobsBoard />} />
              <Route path="team" element={<TeamManagement />} />
              <Route path="notifications" element={<NotificationsCenter />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="clients" element={<Clients />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="messaging" element={<Messaging />} />
              <Route path="automations" element={<Automations />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </SignedIn>
    </>
  );
}

export default App;
