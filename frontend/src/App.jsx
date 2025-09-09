import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Login from "./pages/Login";
import AudienceBuilder from "./pages/AudienceBuilder";
import CampaignHistory from "./pages/CampaignHistory";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<AudienceBuilder />} />
            <Route path="/audience-builder" element={<AudienceBuilder />} />
            <Route path="/campaign-history" element={<CampaignHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
