import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      
      {/* Sidebar (Desktop only) */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </div>
      </div>

    </div>
  );
}

export default AdminLayout;
