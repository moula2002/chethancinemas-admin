import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ADMIN_UID = "mZozAM2GGpdIajf9XKDnCl5Jlos2";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- REMEMBER EMAIL ---------------- */
  useEffect(() => {
    const savedEmail = localStorage.getItem("adminEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  /* ---------------- LOGIN HANDLER ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔐 Firebase Auth Login
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // ❌ UID CHECK
      if (user.uid !== ADMIN_UID) {
        setError("Access Denied: You are not an admin");
        return;
      }

      // 🔥 FIRESTORE ADMIN AUTO CREATE
      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        // 🆕 First time admin → create document
        await setDoc(adminRef, {
          uid: user.uid,
          email: user.email,
          role: "super_admin",
          status: "active",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        // 🔄 Existing admin → update last login
        await updateDoc(adminRef, {
          lastLogin: serverTimestamp(),
        });
      }

      // 💾 Remember Me
      if (rememberMe) {
        localStorage.setItem("adminEmail", email);
      } else {
        localStorage.removeItem("adminEmail");
      }

      // ✅ SUCCESS
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-gray-500 mt-2">
            Enter your credentials to access the dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                className="absolute right-3 top-3.5 text-gray-400"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* REMEMBER */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4"
            />
            <label className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Admin access only
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
