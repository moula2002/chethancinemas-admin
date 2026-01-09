import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Dashboard from "./components/Dashboard";
import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import Banners from "./pages/Banners";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔁 Default redirect */}
        <Route path="/" element={<Navigate to="/admin/login" />} />
        
        {/* 🔐 Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* 🔒 Protected Admin Panel */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          {/* Default admin page */}
          <Route index element={<Navigate to="dashboard" />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="banners" element={<Banners />} />
          <Route path="projects" element={<Projects />} />
          <Route path="gallery" element={<Gallery />} />
        </Route>
        
        {/* ❌ Fallback */}
        <Route path="*" element={<Navigate to="/admin/login" />} />
      </Routes>
    </Router>
  );
}

export default App;