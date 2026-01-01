import Chart from "./Chart";
import {
  PhotoIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const stats = [
    {
      title: "Gallery Images",
      value: 5,
      icon: PhotoIcon,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },
    {
      title: "Total Contacts",
      value: 3,
      icon: EnvelopeIcon,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Unread Messages",
      value: 2,
      icon: ExclamationCircleIcon,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Completed Projects",
      value: 2,
      icon: CheckCircleIcon,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  const contacts = [
    {
      name: "John Doe",
      email: "john@example.com",
      message: "Hello, I would like to inquire about your services.",
      date: "1/1/2026",
      status: "Read",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      message: "I am interested in your portfolio. Can we schedule...",
      date: "1/1/2026",
      status: "Unread",
    },
    {
      name: "Bob Johnson",
      email: "bob@example.com",
      message: "Your work is amazing! I would like to collaborate.",
      date: "1/1/2026",
      status: "Unread",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome back, Admin User!
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl shadow p-6 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg}`}
            >
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">{item.title}</p>
              <p className="text-2xl font-bold text-gray-800">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="xl:col-span-1 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Monthly Bookings
          </h2>
          <Chart />
        </div>

        {/* Recent Contacts */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Recent Contacts
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b text-gray-500 text-sm">
                <tr>
                  <th className="py-3">NAME</th>
                  <th>EMAIL</th>
                  <th>MESSAGE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i} className="border-b last:border-none">
                    <td className="py-4 font-medium">{c.name}</td>
                    <td className="text-gray-600">{c.email}</td>
                    <td className="text-gray-600 max-w-xs truncate">
                      {c.message}
                    </td>
                    <td className="text-gray-600">{c.date}</td>
                    <td>
                      <span
                        className={`px-3 py-1 text-sm rounded-full font-medium
                          ${
                            c.status === "Read"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
