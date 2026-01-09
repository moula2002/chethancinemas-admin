import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import {
  HomeIcon,
  FolderIcon,
  PhotoIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/admin/dashboard", icon: HomeIcon, label: "Dashboard" },
    { path: "/admin/Banners", icon: HomeIcon, label: "Banners" },
    { path: "/admin/projects", icon: FolderIcon, label: "Projects" },
    { path: "/admin/gallery", icon: PhotoIcon, label: "Gallery" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("adminEmail");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* --- MOBILE TOP BAR --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <span className="text-white font-semibold">Admin Panel</span>
        </div>

        {/* Hamburger Icon */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-7 h-7" />
          ) : (
            <Bars3Icon className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-[50]
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:sticky lg:h-screen
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white text-xl font-bold">A</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold leading-tight">Admin</h1>
              <p className="text-blue-400 text-xs font-medium">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all duration-200 group"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Spacer for Mobile (prevents content from hiding behind the fixed header) */}
      <div className="lg:hidden h-16 w-full" />
    </>
  );
};

export default Sidebar;