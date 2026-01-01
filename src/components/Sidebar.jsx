import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  Squares2X2Icon,
  PhotoIcon,
  EnvelopeIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/", icon: HomeIcon },
    { name: "Projects", path: "/projects", icon: Squares2X2Icon },
    { name: "Gallery", path: "/gallery", icon: PhotoIcon },
    { name: "Contact", path: "/contact", icon: EnvelopeIcon },
    { name: "Profile", path: "/profile", icon: UserIcon },
  ];

  return (
    <div className="w-64 min-h-screen bg-white border-r px-4 py-6">
      
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <img
          src="/logo.png"
          alt="Chethan Cinemas"
          className="w-10 h-10 rounded"
        />
        <h1 className="text-xl font-bold text-gray-800">
          Admin Panel
        </h1>
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl transition
              ${
                isActive
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-base font-medium">
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-10 px-2">
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600">
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
