import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";

import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          
          {/* Top Navbar */}
          <Navbar />

          {/* Page Content */}
          <div className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>

        </div>
      </div>
    </Router>
  );
}

export default App;
