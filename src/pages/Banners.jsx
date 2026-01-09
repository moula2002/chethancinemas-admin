import React, { useEffect, useState } from "react";
import { db, storage } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { 
  FaUpload, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff, 
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaImage 
} from "react-icons/fa";

function Banners() {
  const [banners, setBanners] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [notification, setNotification] = useState(null);

  const bannersRef = collection(db, "banners");

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ================= FETCH BANNERS ================= */
  const fetchBanners = async () => {
    try {
      const q = query(bannersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBanners(data);
    } catch (error) {
      showNotification("Failed to fetch banners", "error");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ================= IMAGE UPLOAD ================= */
  const handleUpload = async () => {
    if (!imageFile) {
      showNotification("Please select an image", "warning");
      return;
    }

    if (!imageFile.type.startsWith('image/')) {
      showNotification("Please select a valid image file", "warning");
      return;
    }

    try {
      setLoading(true);

      const fileName = `banners/${Date.now()}-${imageFile.name}`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, imageFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error("Upload error:", error);
          showNotification("Upload failed", "error");
          setLoading(false);
          setPreview(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(bannersRef, {
            imageUrl: downloadURL,
            isActive: true,
            createdAt: serverTimestamp(),
          });

          setImageFile(null);
          setUploadProgress(0);
          setLoading(false);
          setPreview(null);
          fetchBanners();
          showNotification("Banner uploaded successfully!", "success");
        }
      );
    } catch (err) {
      console.error(err);
      showNotification("Upload failed", "error");
      setLoading(false);
    }
  };

  /* ================= IMAGE PREVIEW ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ================= TOGGLE ACTIVE ================= */
  const toggleBanner = async (id, status) => {
    try {
      await updateDoc(doc(db, "banners", id), {
        isActive: !status,
      });
      fetchBanners();
      showNotification(`Banner ${!status ? "activated" : "deactivated"}`, "success");
    } catch (error) {
      showNotification("Failed to update banner", "error");
    }
  };

  /* ================= DELETE ================= */
  const deleteBanner = async (id) => {
    try {
      await deleteDoc(doc(db, "banners", id));
      fetchBanners();
      showNotification("Banner deleted successfully", "success");
    } catch (error) {
      showNotification("Failed to delete banner", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 animate-fadeIn">
      {/* Notification */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideInRight ${
            notification.type === "success" ? "bg-green-500" :
            notification.type === "error" ? "bg-red-500" :
            notification.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
          } text-white`}
        >
          {notification.type === "success" && <FaCheckCircle className="text-xl" />}
          {notification.type === "error" && <FaExclamationCircle className="text-xl" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center animate-slideDown">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Banner Management
          </h1>
          <p className="text-gray-600 text-lg">
            Upload and manage your promotional banners
          </p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8 animate-slideUp">
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FaUpload className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Upload New Banner
                </h3>
                <p className="text-gray-500">
                  Supports JPG, PNG, WEBP (Max 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* File Upload Area */}
            <label className={`
              block cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
              ${preview 
                ? 'border-green-400 border-solid' 
                : 'border-blue-300 hover:border-blue-400 animate-pulse-border'
              }
              hover:scale-[1.02] hover:shadow-lg
            `}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {preview ? (
                <div className="animate-zoomIn">
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-64 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
                  />
                  <p className="mt-4 text-green-600 font-semibold text-lg">
                    ✓ Image selected
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex p-4 bg-gray-100 rounded-full">
                    <FaImage className="text-gray-400 text-4xl" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-xl">
                      Click to select an image
                    </p>
                    <p className="text-gray-500 mt-2">
                      or drag and drop
                    </p>
                  </div>
                </div>
              )}
            </label>

            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="animate-fadeIn">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span className="font-medium">Uploading...</span>
                  <span className="font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={loading || !imageFile}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300
                flex items-center justify-center gap-3
                ${loading || !imageFile
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl hover:scale-[1.02] active:scale-95'
                }
                shadow-lg
              `}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-xl" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FaUpload className="text-xl" />
                  <span>Upload Banner</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Banner Grid */}
        {banners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
            {banners.map((banner, index) => (
              <div 
                key={banner.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slideIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt="Banner"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`
                      px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                      ${banner.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                      }
                    `}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                   

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 font-medium rounded-lg hover:bg-red-50 transition-all duration-200"
                    >
                      <FaTrash className="text-lg" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fadeIn">
            <div className="inline-flex p-6 bg-gray-100 rounded-full mb-6">
              <FaImage className="text-gray-400 text-6xl" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
              No banners yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto text-lg">
              Upload your first banner to get started. Banners will appear here once uploaded.
            </p>
          </div>
        )}
      </div>

      {/* Add custom animations to your global CSS or create a separate animation CSS file */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes zoomIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse-border {
          0%, 100% { border-color: #d1d5db; }
          50% { border-color: #3b82f6; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
        
        .animate-slideDown {
          animation: slideDown 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-zoomIn {
          animation: zoomIn 0.3s ease;
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default Banners;