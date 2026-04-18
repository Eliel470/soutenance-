import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route 
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import HotelList from './pages/HotelList';
import HotelDetails from './pages/HotelDetails';
import GerantDashboard from './pages/GerantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateHotel from './pages/CreateHotel';
import ManageRooms from './pages/ManageRooms';

import ErrorBoundary from './components/common/ErrorBoundary';
import MyReservations from './pages/MyReservations';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<HotelList />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/gerant/setup" 
            element={
              <ProtectedRoute allowedRoles={['gerant']}>
                <CreateHotel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gerant/hotels/:hotelId/rooms" 
            element={
              <ProtectedRoute allowedRoles={['gerant']}>
                <ManageRooms />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-reservations" 
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            } 
          />
          
          {/* Gérant Routes */}
        <Route 
          path="/gerant/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['gerant']}>
              <GerantDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 404 */}
        <Route path="*" element={<div className="p-20 text-center">404 - Page non trouvée</div>} />
      </Routes>
    </main>
    
    <footer className="bg-white border-t border-border-base py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="text-xl font-extrabold text-text-main mb-4 italic opacity-20">HôteEase</div>
        <div className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
          &copy; 2026 HôteEase Booking - Soutenance Licence SIL
        </div>
      </div>
    </footer>
  </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
