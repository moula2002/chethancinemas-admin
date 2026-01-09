import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  FiImage,
  FiGrid,
  FiFolder,
  FiChevronRight,
  FiTrendingUp,
  FiActivity,
  FiBarChart2,
  FiPlus,
  FiUpload,
  FiEye,
  FiMenu,
  FiX
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [banners, setBanners] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bannersSnap, gallerySnap, projectsSnap] = await Promise.all([
          getDocs(collection(db, "banners")),
          getDocs(collection(db, "gallery")),
          getDocs(collection(db, "projects"))
        ]);

        setBanners(bannersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setGallery(gallerySnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setProjects(projectsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* ---------------- COUNT CARDS ---------------- */
  const CountSection = ({ title, data, link, color, icon, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="relative overflow-hidden group"
    >
      <Link to={link} className="block h-full">
        <div className={`${color} rounded-2xl p-4 md:p-5 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between`}>
          <div className="absolute -top-8 -right-8 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full group-hover:scale-150 transition-all duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="text-2xl md:text-3xl text-white/90 p-2 md:p-3 rounded-xl bg-white/10 backdrop-blur-sm w-fit">
                {icon}
              </div>
              <div className="px-2 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
                Live
              </div>
            </div>
            
            <div className="mb-3">
              <h3 className="text-white text-base md:text-lg font-semibold mb-1">{title}</h3>
              <p className="text-white/80 text-sm">Currently active</p>
            </div>
          </div>
          
          <div className="relative z-10 flex items-end justify-between">
            <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {loading ? (
                <div className="h-8 md:h-10 w-16 md:w-20 bg-white/20 rounded-lg animate-pulse"></div>
              ) : (
                data.length
              )}
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/90">
                <FiTrendingUp className="text-sm md:text-base" />
                <span className="text-sm md:text-base font-semibold">
                  {loading ? "..." : "+" + Math.floor(Math.random() * 30) + "%"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  /* ---------------- QUICK ACTIONS ---------------- */
  const quickActions = [
    { 
      title: "Add Banner", 
      subtitle: "Upload new banner", 
      link: "/admin/banners?action=add", 
      icon: <FiPlus />, 
      color: "from-blue-500 to-cyan-400",
      bgColor: "bg-blue-500"
    },
    { 
      title: "Upload Gallery", 
      subtitle: "Add new images", 
      link: "/admin/gallery?action=add", 
      icon: <FiUpload />, 
      color: "from-purple-500 to-pink-400",
      bgColor: "bg-purple-500"
    },
    { 
      title: "New Project", 
      subtitle: "Create project", 
      link: "/admin/projects?action=add", 
      icon: <FiFolder />, 
      color: "from-green-500 to-emerald-400",
      bgColor: "bg-green-500"
    },
    { 
      title: "View Stats", 
      subtitle: "See analytics", 
      link: "/admin/dashboard", 
      icon: <FiEye />, 
      color: "from-orange-500 to-red-400",
      bgColor: "bg-orange-500"
    },
  ];

  const recentActivities = [
    { id: 1, action: "Updated banner image", time: "2 hours ago", color: "bg-blue-500", type: "banner", link: "/admin/banners" },
    { id: 2, action: "Added new project", time: "5 hours ago", color: "bg-purple-500", type: "project", link: "/admin/projects" },
    { id: 3, action: "Uploaded gallery images", time: "Yesterday", color: "bg-green-500", type: "gallery", link: "/admin/gallery" },
    { id: 4, action: "Updated dashboard", time: "2 days ago", color: "bg-orange-500", type: "dashboard", link: "/admin/dashboard" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen"
    >
      {/* ----------- MOBILE HEADER ----------- */}
      <div className="lg:hidden sticky top-0 z-40 bg-white shadow-md p-4 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Content Management</p>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <FiMenu className="text-xl text-gray-700" />
        </button>
      </div>

      {/* ----------- HEADER ----------- */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 hidden lg:block">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm md:text-base hidden lg:block">Manage and monitor your content efficiently</p>
      </div>

      {/* ----------- STATS GRID ----------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        <CountSection 
          title="Banners" 
          data={banners} 
          link="/admin/banners" 
          color="bg-gradient-to-br from-blue-600 to-blue-400" 
          icon={<FiImage />} 
          delay={0.1} 
        />
        <CountSection 
          title="Projects" 
          data={projects} 
          link="/admin/projects" 
          color="bg-gradient-to-br from-purple-600 to-purple-400" 
          icon={<FiFolder />} 
          delay={0.15} 
        />
        <CountSection 
          title="Gallery" 
          data={gallery} 
          link="/admin/gallery" 
          color="bg-gradient-to-br from-emerald-600 to-emerald-400" 
          icon={<FiGrid />} 
          delay={0.2} 
        />
        <CountSection 
          title="Total Content" 
          data={[...banners, ...gallery, ...projects]} 
          link="/admin/dashboard" 
          color="bg-gradient-to-br from-orange-600 to-orange-400" 
          icon={<FiBarChart2 />} 
          delay={0.25} 
        />
      </div>

      {/* ----------- QUICK ACTIONS ----------- */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">Quick Actions</h2>
          <span className="text-sm text-gray-500 hidden md:block">Click to navigate</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {quickActions.map((action, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => navigate(action.link)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className={`${action.bgColor} text-white w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <span className="text-lg md:text-xl">{action.icon}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base mb-1">{action.title}</h3>
              <p className="text-gray-500 text-xs md:text-sm">{action.subtitle}</p>
              <div className="mt-3 flex items-center text-blue-600 text-xs md:text-sm font-medium">
                Go to page
                <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ----------- MAIN CONTENT GRID ----------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1">Recent Activity</h2>
              <p className="text-gray-500 text-sm">Latest updates and changes</p>
            </div>
            <FiActivity className="text-blue-500 text-xl md:text-2xl" />
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {recentActivities.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.id * 0.1 }}
                onClick={() => navigate(item.link)}
                className="flex items-center gap-3 p-3 md:p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${item.color} flex items-center justify-center text-white shrink-0`}>
                  {item.type === 'banner' ? <FiImage /> : 
                   item.type === 'project' ? <FiFolder /> : 
                   item.type === 'gallery' ? <FiGrid /> : 
                   <FiActivity />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm md:text-base mb-1">{item.action}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm text-gray-500">{item.time}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${item.color.replace('bg-', 'bg-')} bg-opacity-10 text-${item.color.replace('bg-', '')}`}>
                      {item.type}
                    </span>
                  </div>
                </div>
                <FiChevronRight className="text-gray-400 shrink-0" />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button 
              onClick={() => navigate("/admin/activities")}
              className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
            >
              View all activities →
            </button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-bold mb-1">Performance & Storage</h2>
              <p className="text-gray-300 text-sm">Usage statistics and growth</p>
            </div>
            <FiTrendingUp className="text-emerald-400 text-xl md:text-2xl" />
          </div>
          
          <div className="space-y-5 md:space-y-6 mb-6 md:mb-8">
            {[
              { label: "Content Growth", value: 75, color: "bg-emerald-400", icon: "📈" },
              { label: "User Engagement", value: 65, color: "bg-blue-400", icon: "👥" },
              { label: "Storage Usage", value: 68, color: "bg-purple-400", icon: "💾" },
              { label: "Performance", value: 82, color: "bg-amber-400", icon: "⚡" }
            ].map((metric, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{metric.icon}</span>
                    <span className="text-sm md:text-base">{metric.label}</span>
                  </div>
                  <span className="font-bold text-lg">{metric.value}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={`h-full ${metric.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 md:pt-6 border-t border-gray-700">
            <h3 className="font-medium mb-3 md:mb-4">Content Summary</h3>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-800/50">
                <div className="text-xl md:text-2xl font-bold text-blue-300">{banners.length}</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">Banners</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/50">
                <div className="text-xl md:text-2xl font-bold text-purple-300">{projects.length}</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">Projects</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-800/50">
                <div className="text-xl md:text-2xl font-bold text-emerald-300">{gallery.length}</div>
                <div className="text-xs md:text-sm text-gray-400 mt-1">Gallery</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ----------- BOTTOM INFO BAR ----------- */}
      <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-700 font-medium">Total Items:</span>
              <span className="ml-2 text-blue-600 font-bold">{banners.length + projects.length + gallery.length}</span>
            </div>
            <div className="hidden md:block text-sm">
              <span className="text-gray-700 font-medium">Status:</span>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------- MOBILE MENU MODAL ----------- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-white p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-gray-800">Navigation</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
              
              <div className="space-y-2">
                {[
                  { name: "Dashboard", icon: <FiBarChart2 />, path: "/admin/dashboard" },
                  { name: "Banners", icon: <FiImage />, path: "/admin/banners" },
                  { name: "Projects", icon: <FiFolder />, path: "/admin/projects" },
                  { name: "Gallery", icon: <FiGrid />, path: "/admin/gallery" },
                  { name: "Add Banner", icon: <FiPlus />, path: "/admin/banners?action=add" },
                  { name: "Upload Images", icon: <FiUpload />, path: "/admin/gallery?action=add" },
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors text-gray-700"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>
              
              <div className="absolute bottom-5 left-5 right-5">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    Logged in as <span className="font-semibold">Admin</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;