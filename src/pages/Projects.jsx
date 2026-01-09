import { useEffect, useState } from "react";
import { db, storage } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  PlusCircle,
  Search,
  Filter,
  Grid,
  List,
  Edit2,
  Trash2,
  Eye,
  X,
  Loader2,
  Calendar,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle,
  CalendarDays,
  TrendingUp,
  Link as LinkIcon,
  ExternalLink,
  Globe
} from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    link: "",
    image: null,
  });

  /* ---------------- FETCH PROJECTS ---------------- */
  const fetchProjects = async () => {
    try {
      const q = query(
        collection(db, "projects"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        year: d.data().year || new Date().getFullYear(),
        createdAt: d.data().createdAt?.toDate() || new Date(),
        updatedAt: d.data().updatedAt?.toDate() || new Date(),
      }));
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ---------------- GET UNIQUE YEARS ---------------- */
  const getUniqueYears = () => {
    const years = projects
      .map(p => p.year)
      .filter(year => year)
      .sort((a, b) => b - a); // Sort descending
    return ["All", ...new Set(years)];
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setFormData({ 
      name: "", 
      year: new Date().getFullYear(),
      link: "",
      image: null 
    });
    setEditingProject(null);
    setImagePreview(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setFormData({
      name: p.name || "",
      year: p.year || new Date().getFullYear(),
      link: p.link || "",
      image: null,
    });
    setImagePreview(p.imageUrl);
    setEditingProject(p);
    setShowModal(true);
  };

  const openViewModal = (p) => {
    setSelectedProject(p);
  };

  /* ---------------- VALIDATE URL ---------------- */
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /* ---------------- SAVE ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Project name required");
    
    // Validate year
    const year = parseInt(formData.year);
    if (!year || year < 2000 || year > 2100) {
      return alert("Please enter a valid year between 2000 and 2100");
    }

    // Validate link if provided
    if (formData.link && !isValidUrl(formData.link)) {
      return alert("Please enter a valid URL (include http:// or https://)");
    }

    setSubmitting(true);
    try {
      let imageUrl = editingProject?.imageUrl;

      if (formData.image) {
        const imgRef = ref(
          storage,
          `projects/${Date.now()}_${formData.image.name}`
        );
        await uploadBytes(imgRef, formData.image);
        imageUrl = await getDownloadURL(imgRef);

        if (editingProject?.imageUrl) {
          try {
            await deleteObject(ref(storage, editingProject.imageUrl));
          } catch { }
        }
      }

      const projectData = {
        name: formData.name,
        year: year, // Store as number
        link: formData.link || "",
        imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), projectData);
      } else {
        await addDoc(collection(db, "projects"), {
          ...projectData,
          status: "Pending",
          progress: 0,
          createdAt: serverTimestamp(),
        });
      }

      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (p) => {
    try {
      if (p.imageUrl) await deleteObject(ref(storage, p.imageUrl));
      await deleteDoc(doc(db, "projects", p.id));
      fetchProjects();
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error(e);
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredProjects = projects.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch = name.includes(search);
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    const matchesYear = filterYear === "All" || p.year?.toString() === filterYear;

    return matchesSearch && matchesStatus && matchesYear;
  });


  /* ---------------- YEAR BADGE STYLE ---------------- */
  const getYearBadge = (year) => {
    const currentYear = new Date().getFullYear();
    if (year === currentYear) return "bg-blue-100 text-blue-800";
    if (year === currentYear - 1) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  /* ---------------- LOADING SKELETON ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 space-y-4">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-2">Manage and track all your projects</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <PlusCircle size={20} />
            Add New Project
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow" : "hover:bg-gray-200"}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow" : "hover:bg-gray-200"}`}
                >
                  <List size={20} />
                </button>
              </div>

              <div className="flex gap-3">

                <div className="relative">
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer min-w-[120px]"
                  >
                    {getUniqueYears().map(year => (
                      <option key={year} value={year}>
                        {year === "All" ? "All Years" : year}
                      </option>
                    ))}
                  </select>
                  <CalendarDays className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Year-wise Distribution */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Projects by Year</h3>
            <div className="flex flex-wrap gap-2">
              {getUniqueYears()
                .filter(year => year !== "All")
                .map(year => {
                  const count = projects.filter(p => p.year?.toString() === year).length;
                  return (
                    <div
                      key={year}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 ${getYearBadge(parseInt(year))}`}
                    >
                      <CalendarDays size={14} />
                      <span className="font-medium">{year}</span>
                      <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full">
                        {count}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-6">Try changing your filters or add a new project</p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <PlusCircle size={20} />
              Create Your First Project
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-gray-400" size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getYearBadge(project.year)}`}>
                      <CalendarDays size={10} className="inline mr-1" />
                      {project.year}
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 truncate">{project.name}</h3>
                  
                  {/* Project Link */}
                  {project.link && (
                    <div className="mb-4">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                      >
                        <Globe size={16} />
                        <span className="truncate max-w-[200px]">{project.link}</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-gray-500 text-sm mb-6">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      <span>Created {project.createdAt?.toLocaleDateString()}</span>
                    </div>
                    {project.progress > 0 && (
                      <div className="flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        <span>{project.progress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <button
                      onClick={() => openViewModal(project)}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Eye size={18} />
                      <span>View</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(project)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(project.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Project</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Year</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Link</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Status</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Created</th>
                    <th className="py-4 px-6 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                            {project.imageUrl ? (
                              <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="text-gray-400" size={20} />
                              </div>
                            )}
                          </div>
                          <div className="font-semibold text-gray-900">{project.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getYearBadge(project.year)}`}>
                          <CalendarDays size={12} className="inline mr-1" />
                          {project.year}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {project.link ? (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                          >
                            <LinkIcon size={14} />
                            <span className="truncate max-w-[150px]">Link</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">No link</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {project.createdAt?.toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(project)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openEditModal(project)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(project.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Project Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Project Image
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon size={32} />
                          <span className="text-xs mt-2">No image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <ImageIcon size={20} />
                        Choose Image
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        Recommended: 16:9 ratio, max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="2000"
                    max="2100"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the year when the project was/will be completed
                  </p>
                </div>

                {/* Project Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Link
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="url"
                      name="link"
                      value={formData.link}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Add a link to your project (live demo, GitHub, etc.)
                  </p>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : editingProject ? (
                      <>
                        <CheckCircle size={20} />
                        Update Project
                      </>
                    ) : (
                      <>
                        <PlusCircle size={20} />
                        Create Project
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Project Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slideUp">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Project Image */}
                {selectedProject.imageUrl && (
                  <div className="rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={selectedProject.imageUrl}
                      alt={selectedProject.name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedProject.name}</h3>
                    
                    {/* Project Link */}
                    {selectedProject.link && (
                      <div className="mb-6">
                        <a
                          href={selectedProject.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl transition-colors"
                        >
                          <Globe size={20} />
                          <span className="font-medium">View Project</span>
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 mb-1">Year</div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getYearBadge(selectedProject.year)}`}>
                        <CalendarDays size={16} />
                        {selectedProject.year}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 mb-1">Created Date</div>
                      <div className="font-medium">
                        {selectedProject.createdAt?.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                      <div className="font-medium">
                        {selectedProject.updatedAt?.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {selectedProject.progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{selectedProject.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${selectedProject.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedProject(null);
                    openEditModal(selectedProject);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all"
                >
                  <Edit2 size={20} />
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="text-red-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Project</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this project? This action cannot be undone.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(projects.find(p => p.id === showDeleteConfirm))}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-medium transition-all"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Showing {filteredProjects.length} of {projects.length} projects
          {filterYear !== "All" && ` in ${filterYear}`}
          {filterStatus !== "All" && ` (${filterStatus})`}
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Projects;