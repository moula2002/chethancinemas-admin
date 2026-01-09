import { useState, useEffect, useRef } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";
import { storage, db } from "../firebase/firebase";
import {
  Upload,
  Trash2,
  Download,
  Info,
  X,
  CheckCircle,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  Sparkles,
  Grid3x3,
  Clock,
} from "lucide-react";

const Gallery = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imageCount, setImageCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  /* ================= FETCH ALL IMAGES ================= */
  const fetchImages = async () => {
    try {
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setImages(data);
      setImageCount(snapshot.size);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  /* ================= FILE SELECT ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return;
    }
    
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setUploadProgress(0);
    setUploadSuccess(false);
  };

  const clearSelection = () => {
    setImage(null);
    setPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ================= UPLOAD IMAGE ================= */
  const uploadImage = async () => {
    if (!image) return;
    setLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      const storagePath = `gallery/${Date.now()}-${image.name}`;
      const imageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(imageRef, image);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          alert("Upload failed");
          setLoading(false);
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, "gallery"), {
            imageUrl: downloadURL,
            storagePath,
            createdAt: serverTimestamp(),
            title: image.name,
            size: (image.size / (1024 * 1024)).toFixed(2) + " MB",
          });

          clearSelection();
          fetchImages();
          setLoading(false);
          setIsUploading(false);
          setUploadSuccess(true);
          
          // Auto-hide success message after 3 seconds
          setTimeout(() => setUploadSuccess(false), 3000);
        }
      );

    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed");
      setLoading(false);
      setIsUploading(false);
    }
  };

  /* ================= DELETE IMAGE ================= */
 /* ================= DELETE IMAGE ================= */
const deleteImage = async (img) => {
  setDeleteLoading(img.id);

  try {
    // Delete from Firebase Storage
    if (img.storagePath) {
      const imageRef = ref(storage, img.storagePath);
      await deleteObject(imageRef);
    } 
    else if (img.imageUrl) {
      const decodedUrl = decodeURIComponent(img.imageUrl);
      const path = decodedUrl.split("/o/")[1].split("?")[0];
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
    }

    // Delete Firestore document
    await deleteDoc(doc(db, "gallery", img.id));

    // Refresh images
    fetchImages();
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete image. Please check Firebase rules.");
  } finally {
    setDeleteLoading(null);
  }
};

  /* ================= DOWNLOAD IMAGE ================= */
  const downloadImage = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name || "gallery-image";
    a.click();
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Success Toast Notification */}
      {uploadSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-bold">Upload Successful!</p>
              <p className="text-sm opacity-90">Image has been added to gallery</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Grid3x3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Gallery Management
              </h1>
            </div>
            <p className="text-gray-500">Upload, manage, and organize your images</p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 min-w-[140px]">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-500">Total Images</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{imageCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 min-w-[140px]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-500">Last Updated</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Just now</p>
            </div>
          </div>
        </div>

        {/* ================= UPLOAD SECTION ================= */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload New Image</h2>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>

            {!preview ? (
              <div
                onClick={() => fileInputRef.current.click()}
                className="relative border-3 border-dashed border-gray-300 hover:border-blue-400 p-12 rounded-2xl text-center cursor-pointer transition-all duration-300 hover:bg-blue-50/50 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-100/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:via-blue-100/30 group-hover:to-blue-50/50 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-800 mb-2">Drop or click to upload</p>
                  <p className="text-gray-500 mb-4">Supports JPG, PNG, GIF, WebP (Max 5MB)</p>
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow">
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
                  <img
                    src={preview}
                    alt="preview"
                    className="relative rounded-2xl w-full h-72 object-cover shadow-lg"
                  />
                  <button
                    onClick={clearSelection}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg transition-transform hover:scale-110"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                
                {/* Progress Bar */}
                {isUploading && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Uploading...</span>
                      <span className="font-bold text-blue-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out shadow-inner"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={uploadImage}
                    disabled={!image || loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload Image
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= IMAGES GRID ================= */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">All Images ({imageCount})</h2>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">Sorted by: Newest</span>
            </div>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-3xl">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">No images yet</h3>
              <p className="text-gray-500">Upload your first image to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-100"
                  onMouseEnter={() => setHoveredImage(img.id)}
                  onMouseLeave={() => setHoveredImage(null)}
                >
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={img.imageUrl}
                      alt="gallery"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4`}>
                      <div className="text-white">
                        <p className="font-bold truncate">{img.title || "Untitled"}</p>
                        <p className="text-sm opacity-90">{img.size || "Unknown size"}</p>
                        <p className="text-xs opacity-75">{formatDate(img.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => downloadImage(img.imageUrl, img.title || "image")}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button
                        onClick={() => deleteImage(img)}
                        disabled={deleteLoading === img.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md disabled:opacity-50"
                      >
                        {deleteLoading === img.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {deleteLoading === img.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Gallery;