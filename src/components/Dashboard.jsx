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
  FiEye
} from "react-icons/fi";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [banners, setBanners] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="relative overflow-hidden group"
    >
      <Link to={link}>
        <div className={`${color} rounded-2xl p-6 shadow-xl h-full`}>
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-all duration-500"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-all duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl text-white/90 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                {icon}
              </div>
              <motion.div 
                className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 + delay }}
              >
                Live
              </motion.div>
            </div>
            
            <div className="mb-2">
              <h3 className="text-white text-xl font-bold mb-1">{title}</h3>
              <p className="text-white/80 text-sm">Currently active</p>
            </div>
            
            <div className="flex items-end justify-between">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 + delay }}
              >
                <div className="text-5xl font-bold text-white drop-shadow-lg">
                  {loading ? (
                    <div className="h-12 w-24 bg-white/20 rounded-lg animate-pulse"></div>
                  ) : (
                    data.length
                  )}
                </div>
              </motion.div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-white/90">
                  <FiTrendingUp className="text-lg" />
                  <span className="text-lg font-semibold">
                    {loading ? "..." : "+" + Math.floor(Math.random() * 30) + "%"}
                  </span>
                </div>
                <p className="text-white/70 text-xs">This month</p>
              </div>
            </div>
            
            <motion.div 
              className="mt-4 pt-4 border-t border-white/20"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.3 + delay }}
            >
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm">View details</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 1 + delay }}
                >
                  <FiChevronRight className="text-white text-xl" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  /* ---------------- QUICK ACTIONS ---------------- */
  const quickActions = [
    { 
      title: "Add New Banner", 
      subtitle: "Upload Images", 
      link: "/admin/banners?action=add",
      icon: <FiPlus className="text-2xl" />,
      color: "bg-gradient-to-br from-blue-500 to-cyan-400",
      delay: 0.6
    },
    { 
      title: "Upload Images", 
      subtitle: "Add to Gallery", 
      link: "/admin/gallery?action=add",
      icon: <FiUpload className="text-2xl" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-400",
      delay: 0.7
    },
    { 
      title: "Create Project", 
      subtitle: "Portfolio Item", 
      link: "/admin/projects?action=add",
      icon: <FiFolder className="text-2xl" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-400",
      delay: 0.8
    },
    { 
      title: "View All", 
      subtitle: "See Everything", 
      link: "/admin/dashboard",
      icon: <FiEye className="text-2xl" />,
      color: "bg-gradient-to-br from-orange-500 to-red-400",
      delay: 0.9
    },
  ];

  /* ---------------- RECENT ACTIVITY ITEMS ---------------- */
  const recentActivities = [
    { 
      id: 1,
      action: "Updated homepage banner", 
      time: "2 hours ago", 
      color: "bg-blue-500",
      type: "banner",
      link: "/admin/banners"
    },
    { 
      id: 2,
      action: "Added new project to portfolio", 
      time: "5 hours ago", 
      color: "bg-purple-500",
      type: "project",
      link: "/admin/projects"
    },
    { 
      id: 3,
      action: "Uploaded 5 gallery images", 
      time: "Yesterday", 
      color: "bg-green-500",
      type: "gallery",
      link: "/admin/gallery"
    },
    { 
      id: 4,
      action: "Modified project categories", 
      time: "2 days ago", 
      color: "bg-orange-500",
      type: "project",
      link: "/admin/projects"
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen"
    >
      {/* ----------- HEADER ----------- */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your content.</p>
      </motion.div>

      {/* ----------- STATS GRID ----------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <CountSection 
          title="Banners" 
          data={banners} 
          link="/admin/banners" 
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
          icon={<FiImage />}
          delay={0.1}
        />
        <CountSection 
          title="Projects" 
          data={projects} 
          link="/admin/projects" 
          color="bg-gradient-to-br from-purple-500 to-pink-500"
          icon={<FiFolder />}
          delay={0.2}
        />
        <CountSection 
          title="Gallery" 
          data={gallery} 
          link="/admin/gallery" 
          color="bg-gradient-to-br from-green-500 to-emerald-500"
          icon={<FiGrid />}
          delay={0.3}
        />
        <CountSection 
          title="Total Content" 
          data={[...banners, ...gallery, ...projects]} 
          link="/admin/dashboard" 
          color="bg-gradient-to-br from-orange-500 to-red-500"
          icon={<FiBarChart2 />}
          delay={0.4}
        />
      </div>

      {/* ----------- QUICK ACTIONS ----------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
          <span className="text-sm text-gray-500">Click to navigate</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: action.delay }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.link)}
              className="cursor-pointer"
            >
              <div className={`${action.color} rounded-2xl p-6 shadow-lg h-full hover:shadow-xl transition-shadow duration-300`}>
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      {action.icon}
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: index * 0.5 }}
                    >
                      <FiChevronRight className="text-white/80 text-xl" />
                    </motion.div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-2">{action.title}</h3>
                    <p className="text-white/80 text-sm">{action.subtitle}</p>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-white/20">
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 text-sm">Click to start</span>
                      <div className="text-xs text-white/70 px-2 py-1 rounded-full bg-white/20">
                        Go →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ----------- SUMMARY CARDS ----------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <div className="flex items-center gap-2">
              <FiActivity className="text-blue-500 text-xl" />
              <span className="text-sm text-gray-500">{recentActivities.length} activities</span>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivities.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                whileHover={{ x: 5, backgroundColor: "rgba(0,0,0,0.02)" }}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(item.link)}
              >
                <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center`}>
                  {item.type === 'banner' && <FiImage className="text-white" />}
                  {item.type === 'project' && <FiFolder className="text-white" />}
                  {item.type === 'gallery' && <FiGrid className="text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.action}</p>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </div>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="text-gray-400"
                >
                  <FiChevronRight />
                </motion.div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button 
              onClick={() => navigate('/admin/banners')}
              className="w-full py-3 text-center text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              View All Activities →
            </button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Performance Summary</h2>
              <p className="text-gray-300 text-sm">This month's performance</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10">
              <FiTrendingUp className="text-cyan-300 text-xl" />
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-gray-300">Content Growth</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-xs text-gray-400">Active</span>
                  </div>
                </div>
                <span className="font-bold text-green-400 text-lg">+28%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ duration: 1, delay: 1.5 }}
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-gray-300">Engagement Rate</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-xs text-gray-400">High</span>
                  </div>
                </div>
                <span className="font-bold text-blue-400 text-lg">+42%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 1, delay: 1.6 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-gray-300">Storage Usage</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    <span className="text-xs text-gray-400">Manage</span>
                  </div>
                </div>
                <span className="font-bold text-purple-400 text-lg">68%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1, delay: 1.7 }}
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{banners.length}</div>
                <div className="text-xs text-gray-400">Banners</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{projects.length}</div>
                <div className="text-xs text-gray-400">Projects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{gallery.length}</div>
                <div className="text-xs text-gray-400">Images</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;