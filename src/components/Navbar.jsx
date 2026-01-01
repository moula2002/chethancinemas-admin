import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  return (
    <div
      className="
        sticky top-0 z-50
        w-full h-16
        bg-white
        shadow
        flex items-center justify-between
        px-6
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">
          Chethan Cinemas – Admin
        </h1>
      </div>

      {/* CENTER SEARCH */}
      <div className="hidden md:flex items-center bg-gray-100 rounded px-3 py-1 w-96">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search movies, users, bookings..."
          className="bg-transparent outline-none px-2 w-full text-sm"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* Notification */}
        <div className="relative cursor-pointer">
          <BellIcon className="w-6 h-6 text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
            3
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="https://i.pravatar.cc/40"
            alt="Admin"
            className="w-9 h-9 rounded-full border"
          />
          <div className="hidden md:block">
            <p className="text-sm font-semibold">Admin</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
