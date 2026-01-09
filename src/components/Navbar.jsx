import { useState, useEffect } from "react";
import {  MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [adminData, setAdminData] = useState({
    name: "Admin",
    email: "",
    role: "Super Admin",
    photoURL: ""
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch admin data from Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Get admin document from Firestore
        const adminRef = doc(db, "admins", user.uid);
        
        const unsubscribeSnapshot = onSnapshot(adminRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAdminData({
              name: data.displayName || data.name || user.displayName || "Admin",
              email: data.email || user.email || "",
              role: data.role || "Super Admin",
              photoURL: data.photoURL || user.photoURL || "https://i.pravatar.cc/40"
            });
          } else {
            // If no admin document, use auth data
            setAdminData({
              name: user.displayName || "Admin",
              email: user.email || "",
              role: "Super Admin",
              photoURL: user.photoURL || "https://i.pravatar.cc/40"
            });
          }
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        // If not logged in, redirect to login
        navigate("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Fallback while loading
  if (loading) {
    return (
      <div className="sticky top-0 z-50 w-full h-16 bg-white shadow flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-gray-800">Chethan Cinemas – Admin</h1>
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-300 rounded-full"></div>
          <div className="hidden md:block">
            <div className="h-4 w-20 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 w-full h-16 bg-white shadow flex items-center justify-between px-6">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">
          Chethan Cinemas – Admin
        </h1>
      </div>

    

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
      
        {/* Admin Profile with Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-3 cursor-pointer">
            <img
              src={adminData.photoURL}
              alt="Admin"
              className="w-9 h-9 rounded-full border-2 border-blue-500 object-cover"
            />
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-800">
                {adminData.name}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                {adminData.email}
              </p>
              <p className="text-xs text-blue-600 font-medium">
                {adminData.role}
              </p>
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-3 border-b">
              <p className="text-sm font-semibold">{adminData.name}</p>
              <p className="text-xs text-gray-500 truncate">{adminData.email}</p>
              <p className="text-xs text-blue-600 mt-1">{adminData.role}</p>
            </div>
            <div className="py-1">
              <button 
                onClick={() => navigate("/admin/dashboard")}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                📊 Dashboard
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                🔓 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}