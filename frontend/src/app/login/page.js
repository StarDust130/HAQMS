"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Activity,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const { login, error: authError, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Strict client-side validation enforced
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setValidationError("Email address is strictly required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setValidationError("Provide a valid email format including a domain.");
      return;
    }

    if (password.length < 8) {
      setValidationError(
        "Password must meet the 8-character minimum requirement.",
      );
      return;
    }

    const result = await login(email, password);
    if (!result?.success) {
      setValidationError(
        result?.error || "Authentication failed. Verify your credentials.",
      );
    }
  };

  // Orchestrated animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="flex flex-col min-h-screen justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FDF8F0] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <motion.div
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#D3F23A]/20 blur-[100px] -z-10 pointer-events-none"
      />
      <motion.div
        animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FF5E29]/10 blur-[100px] -z-10 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#FF5E29] font-extrabold text-3xl group"
        >
          <Activity className="h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
          <span className="tracking-tight">HAQMS</span>
        </Link>
        <h2 className="mt-6 text-3xl sm:text-4xl font-serif font-extrabold text-[#3D4532] tracking-tight">
          System Access
        </h2>
        <p className="mt-2 text-sm text-[#3D4532]/60 font-medium">
          Authenticate to enter the secure portal.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mt-8 w-full max-w-md z-10"
      >
        <div className="bg-white/70 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl shadow-[#3D4532]/5 rounded-[2rem] border border-[#3D4532]/10 relative overflow-hidden">
          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            <AnimatePresence>
              {(validationError || authError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="flex items-center gap-3 p-3.5 text-sm bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-medium"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{validationError || authError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={fadeUp}>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[#3D4532] mb-2"
              >
                Corporate Email
              </label>
              <div className="relative rounded-xl shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#3D4532]/40 group-focus-within:text-[#FF5E29] transition-colors duration-300">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-[#3D4532]/10 bg-white/50 focus:bg-white rounded-xl text-[#3D4532] placeholder-[#3D4532]/30 focus:outline-none focus:ring-2 focus:ring-[#D3F23A] focus:border-transparent transition-all duration-300 text-sm font-medium"
                  placeholder="admin@haqms.com"
                />
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[#3D4532] mb-2"
              >
                Security Key
              </label>
              <div className="relative rounded-xl shadow-sm group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#3D4532]/40 group-focus-within:text-[#FF5E29] transition-colors duration-300">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3.5 border border-[#3D4532]/10 bg-white/50 focus:bg-white rounded-xl text-[#3D4532] placeholder-[#3D4532]/30 focus:outline-none focus:ring-2 focus:ring-[#D3F23A] focus:border-transparent transition-all duration-300 text-sm font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#3D4532]/40 hover:text-[#3D4532] focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-[#FF5E29]/20 text-sm font-bold text-white bg-[#3D4532] hover:bg-[#FF5E29] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5E29] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? "Verifying..." : "Initialize Session"}
                {!loading && (
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </motion.div>
          </form>

          {/* Streamlined Demo Credentials */}
          <motion.div
            variants={fadeUp}
            className="mt-8 pt-6 border-t border-[#3D4532]/10 relative z-10"
          >
            <h4 className="text-[10px] font-bold text-[#3D4532]/50 uppercase tracking-widest mb-4 text-center">
              Quick Inject Variables
            </h4>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {[
                { role: "Admin", email: "admin@haqms.com" },
                { role: "Reception", email: "reception1@haqms.com" },
                { role: "Doctor", email: "doctor1@haqms.com" },
              ].map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword("password123");
                    setValidationError("");
                  }}
                  className="px-4 py-2 rounded-full bg-white border border-[#3D4532]/10 hover:bg-[#D3F23A] hover:border-[#D3F23A] text-[#3D4532] font-semibold transition-all duration-200 shadow-sm"
                >
                  {cred.role}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
