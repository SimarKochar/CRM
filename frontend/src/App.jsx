import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Campaigns from "./pages/Campaigns";
import AudienceBuilder from "./pages/AudienceBuilder";
import CampaignHistory from "./pages/CampaignHistory";

// Protected Route component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {isAuthenticated && <Header user={user} onLogout={handleLogout} />}
        <main className="flex-1 w-full">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
              } 
            />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/customers" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Customers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Campaigns />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/audience-builder" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AudienceBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaign-history" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <CampaignHistory />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all - redirect to dashboard if authenticated, login if not */}
            <Route 
              path="*" 
              element={
                isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
