"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/common/Navbar";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Monitor, RefreshCw, AlertCircle } from "lucide-react";

export default function QueueMonitor() {
  const { token } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchQueueData = async () => {
    if (!token) {
      setError("Waiting for authentication token...");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/queue`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let serverErrorMsg = `HTTP Error ${res.status}`;
        try {
          const errorData = await res.json();
          serverErrorMsg =
            errorData.error || errorData.message || serverErrorMsg;
        } catch (e) {
          serverErrorMsg = "Unable to parse server error payload.";
        }
        throw new Error(`Backend Failure: ${serverErrorMsg}`);
      }

      const data = await res.json();
      setTokens(data);
      setError("");
    } catch (err) {
      console.error("Queue poll fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchQueueData();

      const intervalId = setInterval(() => {
        fetchQueueData();
        setRefreshCount((prev) => prev + 1);
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [token]);

  const groupedTokens = tokens.reduce((groups, token) => {
    const docId = token.doctorId;
    if (!groups[docId]) {
      groups[docId] = {
        doctorName: token.doctor?.name || "Unknown",
        specialization: token.doctor?.specialization || "General",
        calling: null,
        waiting: [],
      };
    }

    if (token.status === "CALLING") {
      groups[docId].calling = token;
    } else if (token.status === "WAITING") {
      groups[docId].waiting.push(token);
    }
    return groups;
  }, {});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F0] selection:bg-[#D3F23A] selection:text-[#3D4532] overflow-hidden relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#D3F23A]/10 blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#FF5E29]/5 blur-[100px] -z-10 pointer-events-none" />

      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-sm border border-[#3D4532]/10 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#D3F23A] text-[#3D4532] rounded-xl shadow-sm">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#3D4532] tracking-tight uppercase">
                Active Queue Monitor
              </h1>
              <p className="text-xs text-[#3D4532]/60 font-bold mt-0.5">
                Real-time physician calling sequences.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#FDF8F0] px-3 py-2 rounded-lg border border-[#3D4532]/10">
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-[#FF5E29] animate-spin" />
              <span className="text-[#3D4532] text-[10px] font-black uppercase tracking-widest">
                Syncing
              </span>
            </div>
            <div className="w-px h-3 bg-[#3D4532]/20" />
            <div className="text-[#3D4532]/50 text-[10px] font-mono font-bold">
              TX: {refreshCount}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-rose-50 border-l-4 border-rose-500 text-rose-700 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    System Halt
                  </span>
                </div>
                <div className="text-xs font-mono font-medium ml-7 bg-white/50 p-1.5 rounded">
                  {error}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-[#FF5E29] animate-spin mb-3" />
            <p className="text-xs font-bold text-[#3D4532]/40 uppercase tracking-widest animate-pulse">
              Initializing Network...
            </p>
          </div>
        ) : Object.keys(groupedTokens).length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/40 backdrop-blur p-10 text-center rounded-2xl border-2 border-dashed border-[#3D4532]/10"
          >
            <Bell className="h-10 w-10 text-[#3D4532]/20 mx-auto mb-4" />
            <h3 className="text-lg font-black text-[#3D4532] uppercase tracking-tight">
              Queue is Empty
            </h3>
            <p className="mt-1 text-[#3D4532]/50 text-xs font-semibold max-w-sm mx-auto">
              No patients are currently checked in or waiting. The system is
              idle.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Object.entries(groupedTokens).map(([docId, docInfo]) => (
              <motion.div
                layout
                key={docId}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-md border border-[#3D4532]/10 overflow-hidden flex flex-col h-full"
              >
                <div className="bg-[#3D4532] px-4 py-3">
                  <h3 className="font-black text-lg text-white tracking-tight truncate">
                    {docInfo.doctorName}
                  </h3>
                  <p className="text-[10px] text-[#D3F23A] font-bold uppercase tracking-widest mt-0.5 truncate">
                    {docInfo.specialization}
                  </p>
                </div>

                <div className="p-4 flex-1 flex flex-col gap-4">
                  <motion.div layout>
                    <h4 className="text-[10px] font-black text-[#3D4532]/40 uppercase tracking-widest mb-2">
                      Now Calling
                    </h4>

                    <AnimatePresence mode="popLayout">
                      {docInfo.calling ? (
                        <motion.div
                          key={`calling-${docInfo.calling.id}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                          className="bg-[#D3F23A] rounded-xl p-4 text-center shadow-sm relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-2.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5E29] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5E29]"></span>
                            </span>
                          </div>
                          <span className="block text-5xl font-black text-[#3D4532] tracking-tighter">
                            {docInfo.calling.tokenNumber}
                          </span>
                          <span className="block text-xs font-extrabold text-[#FF5E29] uppercase tracking-wide mt-1 truncate">
                            {docInfo.calling.patient?.name || "Unknown"}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-[#FDF8F0] border-2 border-dashed border-[#3D4532]/10 p-5 rounded-xl text-center"
                        >
                          <span className="block text-sm font-black text-[#3D4532]/30 uppercase tracking-widest">
                            Available
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div layout className="mt-auto">
                    <h4 className="text-[10px] font-black text-[#3D4532]/40 uppercase tracking-widest mb-2">
                      Up Next
                    </h4>

                    <div className="bg-[#FDF8F0] rounded-lg p-3 min-h-[60px]">
                      {docInfo.waiting.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          <AnimatePresence>
                            {docInfo.waiting.map((token) => (
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                key={token.id}
                                className="px-2 py-1 rounded bg-white border border-[#3D4532]/10 text-xs font-black text-[#3D4532] shadow-sm"
                              >
                                {token.tokenNumber}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-[10px] font-bold text-[#3D4532]/30 uppercase tracking-wider">
                          Queue Empty
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
