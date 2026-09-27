import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import LandingPage from './pages/LandingPage';
import StoreSelection from './pages/StoreSelection';
import StoreDashboard from './pages/StoreDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/store" element={<StoreSelection />} />
            <Route path="/dashboard" element={<StoreDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/owner" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </StoreProvider>
  );
}

export default App;
