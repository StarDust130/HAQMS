"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/common/Navbar";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CalendarDays,
  Activity,
  Search,
  UserPlus,
  Trash2,
  ClipboardList,
  TrendingUp,
  Award,
  Clock,
  ShieldAlert,
  Inbox,
  FileSearch,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user, token, API_BASE_URL } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const [activeTab, setActiveTab] = useState(
    user?.role === "ADMIN"
      ? "reports"
      : user?.role === "RECEPTIONIST"
        ? "patients"
        : "appointments",
  );

  // Receptionist State
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [patientGender, setPatientGender] = useState("All");
  const [patientsPagination, setPatientsPagination] = useState({
    page: 1,
    totalPages: 1,
  });

  // Reg Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAge, setRegAge] = useState("");
  const [regGender, setRegGender] = useState("Male");
  const [regHistory, setRegHistory] = useState("");
  const [regMessage, setRegMessage] = useState("");

  // Booking State
  const [doctorsList, setDoctorsList] = useState([]);
  const [bookingPatientId, setBookingPatientId] = useState("");
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [checkinMessage, setCheckinMessage] = useState("");

  // Doctor State
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [doctorQueue, setDoctorQueue] = useState([]);

  // Admin State
  const [adminReportData, setAdminReportData] = useState(null);
  const [adminReportLoading, setAdminReportLoading] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");

  // --- Network Functions ---
  const fetchPatients = async (page = 1) => {
    setPatientsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/patients?page=${page}&limit=5&search=${patientSearch}&gender=${patientGender}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
        setPatientsPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPatientsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "RECEPTIONIST" || user?.role === "ADMIN") {
      const timer = setTimeout(() => fetchPatients(1), 300);
      return () => clearTimeout(timer);
    }
  }, [patientSearch, patientGender, user?.role]);

  const fetchDoctorsDropdown = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDoctorsList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDoctorsDropdown();
  }, []);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setRegMessage("");
    if (!regName || !regPhone || !regAge) {
      setRegMessage("Error: Name, Age and Phone number are strictly required.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phoneNumber: regPhone,
          age: regAge,
          gender: regGender,
          medicalHistory: regHistory,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRegMessage("Success: Patient registered successfully!");
        setRegName("");
        setRegEmail("");
        setRegPhone("");
        setRegAge("");
        setRegHistory("");
        fetchPatients(1);
      } else {
        setRegMessage(`Error: ${data.error || "Failed to register"}`);
      }
    } catch (err) {
      setRegMessage(`Error: ${err.message}`);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingMessage("");
    if (!bookingPatientId || !bookingDoctorId || !bookingDate) {
      setBookingMessage(
        "Error: Patient, Physician, and Date are strictly required.",
      );
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: bookingPatientId,
          doctorId: bookingDoctorId,
          appointmentDate: bookingDate,
          reason: bookingReason,
        }),
      });
      if (res.ok) {
        setBookingMessage("Success: Appointment secured.");
        setBookingReason("");
      } else {
        setBookingMessage("Error: Failed to finalize booking.");
      }
    } catch (err) {
      setBookingMessage(`Error: ${err.message}`);
    }
  };

  const handleDeletePatient = async (id) => {
    if (!confirm("Confirm hard deletion of this record?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPatients(patientsPagination.page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQueueCheckin = async (
    patientId,
    doctorId,
    appointmentId = null,
  ) => {
    setCheckinMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/queue/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ patientId, doctorId, appointmentId }),
      });
      const data = await res.json();
      if (res.ok) {
        setCheckinMessage(
          `Check-in successful. Assigned Token #${data.token.tokenNumber}`,
        );
        if (user?.role === "DOCTOR") fetchDoctorWorklist();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctorWorklist = async () => {
    if (user?.role !== "DOCTOR") return;
    try {
      const matchedDoc = doctorsList.find((d) => d.userId === user?.id);
      if (!matchedDoc) return;
      const appRes = await fetch(
        `${API_BASE_URL}/appointments?doctorId=${matchedDoc.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const queueRes = await fetch(
        `${API_BASE_URL}/queue?doctorId=${matchedDoc.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (appRes.ok)
        setDoctorAppointments((await appRes.json()).appointments || []);
      if (queueRes.ok) setDoctorQueue((await queueRes.json()) || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user?.role === "DOCTOR" && doctorsList.length > 0)
      fetchDoctorWorklist();
  }, [doctorsList, user?.role]);

  const handleUpdateQueueStatus = async (tokenId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/queue/${tokenId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchDoctorWorklist();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteAppointment = async (appId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${appId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) fetchDoctorWorklist();
    } catch (e) {
      console.error(e);
    }
  };

  const generateSystemReport = async () => {
    setAdminReportLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reports/doctor-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAdminReportData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAdminReportLoading(false);
    }
  };

  const searchPhysiciansAdmin = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/doctors?search=${adminSearchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (Array.isArray(data)) setDoctorsList(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return null;

  // --- Animation Variants ---
  const tabVariants = {
    hidden: { opacity: 0, y: 15 },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    enter: { opacity: 1, y: 0 },
  };

  // --- Reusable Empty State Component ---
  const EmptyState = ({ icon: Icon, title, message }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white/40 rounded-[2rem] border-2 border-dashed border-[#3D4532]/20"
    >
      <div className="h-16 w-16 bg-[#FDF8F0] rounded-full flex items-center justify-center mb-4 shadow-inner border border-[#3D4532]/5">
        <Icon className="h-8 w-8 text-[#3D4532]/40" />
      </div>
      <h3 className="text-xl font-black text-[#3D4532] tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm text-[#3D4532]/60 font-medium max-w-sm">
        {message}
      </p>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F0] selection:bg-[#D3F23A] selection:text-[#3D4532]">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-8">
        {/* Workspace Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#3D4532] tracking-tight">
            Welcome, <span className="text-[#FF5E29]">{user.name}</span>
          </h1>
          <p className="text-sm sm:text-base text-[#3D4532]/60 mt-2 font-medium">
            Manage operational workflows from your secure workspace.
          </p>
        </motion.div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b-2 border-[#3D4532]/10 mb-8 overflow-x-auto gap-2 sm:gap-4 hide-scrollbar pb-2 relative">
          {[
            { id: "reports", label: "System Audits", roles: ["ADMIN"] },
            { id: "physicians", label: "Physician Registry", roles: ["ADMIN"] },
            {
              id: "patients",
              label: "Patient Directory",
              roles: ["RECEPTIONIST", "ADMIN"],
            },
            {
              id: "book",
              label: "Scheduling Portal",
              roles: ["RECEPTIONIST", "ADMIN"],
            },
            { id: "appointments", label: "My Bookings", roles: ["DOCTOR"] },
            { id: "queue", label: "Active Queue", roles: ["DOCTOR"] },
          ]
            .filter((t) => t.roles.includes(user.role))
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-2.5 px-4 sm:px-6 rounded-full font-bold text-xs sm:text-sm transition-all whitespace-nowrap z-10 ${
                  activeTab === tab.id
                    ? "text-[#3D4532]"
                    : "text-[#3D4532]/60 hover:text-[#3D4532]"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#D3F23A] rounded-full -z-10 shadow-sm border border-[#D3F23A]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            ))}
        </div>

        {/* Global Notifications */}
        <AnimatePresence>
          {checkinMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 mb-6 rounded-xl bg-[#D3F23A] text-[#FF5E29] border border-[#3D4532]/10 font-bold flex flex-col sm:flex-row sm:items-center justify-between text-sm shadow-sm gap-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{checkinMessage}</span>
              </div>
              <button
                onClick={() => setCheckinMessage("")}
                className="underline text-xs text-[#3D4532] hover:text-[#FF5E29] self-end sm:self-auto"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* TAB: PATIENTS */}
          {activeTab === "patients" && (
            <motion.div
              key="patients"
              variants={tabVariants}
              initial="hidden"
              animate="enter"
              exit="exit"
              className="space-y-8"
            >
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                <motion.div
                  variants={itemVariants}
                  className="lg:col-span-2 space-y-6 bg-white/60 backdrop-blur p-4 sm:p-6 rounded-[2rem] shadow-xl shadow-[#3D4532]/5 border border-[#3D4532]/10"
                >
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#3D4532] flex items-center gap-2 mb-4 sm:mb-6">
                    <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5E29]" />
                    Patient Lookup Directory
                  </h3>

                  {/* Responsive Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3D4532]/40 group-focus-within:text-[#FF5E29] transition-colors" />
                      <input
                        type="text"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder="Search records by name or contact..."
                        className="w-full pl-11 pr-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D3F23A] focus:outline-none transition-all shadow-sm"
                      />
                    </div>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full sm:w-auto px-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D3F23A] focus:outline-none transition-all shadow-sm"
                    >
                      <option value="All">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {patientsLoading ? (
                    <div className="h-48 flex items-center justify-center bg-white/40 rounded-xl border border-[#3D4532]/5">
                      <span className="flex items-center gap-2 text-sm font-bold text-[#3D4532]/40 uppercase tracking-widest animate-pulse">
                        <Activity className="h-4 w-4" /> Fetching Records...
                      </span>
                    </div>
                  ) : patients.length === 0 ? (
                    <EmptyState
                      icon={FileSearch}
                      title="No Records Found"
                      message="No patient data matches your current search filters. Adjust your parameters or register a new profile."
                    />
                  ) : (
                    <>
                      {/* MOBILE VIEW: Stacked Cards */}
                      <div className="block md:hidden space-y-4">
                        <AnimatePresence>
                          {patients.map((p) => (
                            <motion.div
                              key={p.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="bg-white p-4 rounded-xl border border-[#3D4532]/10 shadow-sm space-y-3"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-[#3D4532] text-lg">
                                    {p.name}
                                  </p>
                                  <p className="text-xs text-[#3D4532]/50">
                                    {p.email || "No email on file"}
                                  </p>
                                </div>
                                <span className="px-2 py-1 bg-[#FDF8F0] text-[#3D4532]/60 text-[10px] font-black uppercase rounded">
                                  {p.age}y / {p.gender.charAt(0)}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-[#3D4532]/70">
                                📞 {p.phoneNumber}
                              </div>
                              <div className="pt-3 border-t border-[#3D4532]/5 flex gap-2">
                                <button
                                  onClick={() =>
                                    handleQueueCheckin(p.id, doctorsList[0]?.id)
                                  }
                                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-[#D3F23A] text-[#3D4532] active:scale-95 transition-transform"
                                >
                                  Check In
                                </button>
                                <button
                                  onClick={() => handleDeletePatient(p.id)}
                                  className="px-4 py-2 text-rose-500 bg-rose-50 active:bg-rose-100 rounded-lg transition-colors flex items-center justify-center"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* DESKTOP VIEW: Table */}
                      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#3D4532]/10 bg-white">
                        <table className="min-w-[600px] w-full text-left text-sm">
                          <thead className="bg-[#FDF8F0] text-[#3D4532]/60 uppercase text-[10px] font-extrabold tracking-widest">
                            <tr>
                              <th className="px-4 py-3">Name & Email</th>
                              <th className="px-4 py-3">Contact</th>
                              <th className="px-4 py-3">Demographics</th>
                              <th className="px-4 py-3 text-right">
                                Operations
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#3D4532]/5">
                            <AnimatePresence>
                              {patients.map((p) => (
                                <motion.tr
                                  key={p.id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="hover:bg-[#FDF8F0]/50 transition-colors"
                                >
                                  <td className="px-4 py-3">
                                    <p className="font-bold text-[#3D4532] whitespace-nowrap">
                                      {p.name}
                                    </p>
                                    <p className="text-xs text-[#3D4532]/50 whitespace-nowrap">
                                      {p.email || "No email on file"}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3 font-medium text-[#3D4532]/70 whitespace-nowrap">
                                    {p.phoneNumber}
                                  </td>
                                  <td className="px-4 py-3 font-medium text-[#3D4532]/70 whitespace-nowrap">
                                    {p.age}y / {p.gender}
                                  </td>
                                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                    <button
                                      onClick={() =>
                                        handleQueueCheckin(
                                          p.id,
                                          doctorsList[0]?.id,
                                        )
                                      }
                                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#D3F23A] text-[#3D4532] hover:scale-105 transition-transform"
                                    >
                                      Check In
                                    </button>
                                    <button
                                      onClick={() => handleDeletePatient(p.id)}
                                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-flex align-middle"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </td>
                                </motion.tr>
                              ))}
                            </AnimatePresence>
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </motion.div>

                {/* REGISTRATION FORM (Right Column) - Keep unchanged */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white/60 backdrop-blur p-4 sm:p-6 rounded-[2rem] shadow-xl shadow-[#3D4532]/5 border border-[#3D4532]/10 h-fit"
                >
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#3D4532] flex items-center gap-2 mb-4 sm:mb-6">
                    <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5E29]" />
                    Register Profile
                  </h3>

                  {regMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 text-xs font-bold rounded-xl mb-4 border ${regMessage.includes("Success") ? "bg-[#D3F23A] text-[#3D4532]" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                    >
                      {regMessage}
                    </motion.div>
                  )}

                  <form
                    onSubmit={handleRegisterPatient}
                    className="space-y-4 text-sm font-bold text-[#3D4532]"
                  >
                    <div>
                      <label className="block mb-1.5">Full Name</label>
                      <input
                        required
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Bruce Wayne"
                        className="w-full px-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl focus:ring-2 focus:ring-[#D3F23A] outline-none placeholder:text-[#3D4532]/30 font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1.5">Age</label>
                        <input
                          required
                          type="number"
                          value={regAge}
                          onChange={(e) => setRegAge(e.target.value)}
                          placeholder="e.g. 35"
                          className="w-full px-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl focus:ring-2 focus:ring-[#D3F23A] outline-none placeholder:text-[#3D4532]/30 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5">Gender</label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl focus:ring-2 focus:ring-[#D3F23A] outline-none font-medium"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1.5">Contact Number</label>
                      <input
                        required
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. 555-0199"
                        className="w-full px-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl focus:ring-2 focus:ring-[#D3F23A] outline-none placeholder:text-[#3D4532]/30 font-medium"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3.5 bg-[#FF5E29] text-white font-extrabold rounded-xl shadow-lg shadow-[#FF5E29]/20 mt-4"
                    >
                      Initialize Profile
                    </motion.button>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* TAB: BOOKING (No Tables, untouched) */}
          {activeTab === "book" && (
            <motion.div
              key="book"
              variants={tabVariants}
              initial="hidden"
              animate="enter"
              exit="exit"
              className="grid gap-6 lg:gap-8 lg:grid-cols-2"
            >
              <motion.div
                variants={itemVariants}
                className="bg-white/60 backdrop-blur p-4 sm:p-6 rounded-[2rem] shadow-xl shadow-[#3D4532]/5 border border-[#3D4532]/10"
              >
                <h3 className="text-lg sm:text-xl font-extrabold text-[#3D4532] flex items-center gap-2 mb-4 sm:mb-6">
                  <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5E29]" />
                  Schedule Appointment
                </h3>
                {bookingMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-3 text-xs font-bold rounded-xl mb-4 border ${bookingMessage.includes("Success") ? "bg-[#D3F23A] text-[#3D4532]" : "bg-rose-50 text-rose-600 border-rose-200"}`}
                  >
                    {bookingMessage}
                  </motion.div>
                )}
                <form
                  onSubmit={handleBookAppointment}
                  className="space-y-4 text-sm font-bold text-[#3D4532]"
                >
                  <div>
                    <label className="block mb-1.5">Select Patient</label>
                    <select
                      required
                      value={bookingPatientId}
                      onChange={(e) => setBookingPatientId(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl outline-none font-medium"
                    >
                      <option value="">-- Require Selection --</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5">Select Physician</label>
                    <select
                      required
                      value={bookingDoctorId}
                      onChange={(e) => setBookingDoctorId(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl outline-none font-medium"
                    >
                      <option value="">-- Require Selection --</option>
                      {doctorsList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialization})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5">Date & Time</label>
                    <input
                      required
                      type="datetime-local"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl outline-none font-medium"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    className="w-full py-3.5 bg-[#FF5E29] text-white font-extrabold rounded-xl shadow-lg mt-4"
                  >
                    Confirm Slot
                  </motion.button>
                </form>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-[#3D4532] p-4 sm:p-6 rounded-[2rem] shadow-xl border border-[#3D4532]/10 text-white"
              >
                <h3 className="text-lg sm:text-xl font-extrabold flex items-center gap-2 mb-2 text-[#D3F23A]">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                  Live Walk-in Override
                </h3>
                <p className="text-sm text-white/60 mb-6">
                  Bypass scheduling. Force immediate queue insertion.
                </p>
                <div className="space-y-4 font-bold text-sm">
                  <div>
                    <label className="block mb-1.5 text-white/80">
                      Target Patient
                    </label>
                    <select
                      id="w-pat"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none font-medium"
                    >
                      <option value="" className="text-black">
                        -- Select --
                      </option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id} className="text-black">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-white/80">
                      Target Physician
                    </label>
                    <select
                      id="w-doc"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none font-medium"
                    >
                      <option value="" className="text-black">
                        -- Select --
                      </option>
                      {doctorsList.map((d) => (
                        <option key={d.id} value={d.id} className="text-black">
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      const p = document.getElementById("w-pat").value;
                      const d = document.getElementById("w-doc").value;
                      if (p && d) handleQueueCheckin(p, d);
                    }}
                    className="w-full py-3.5 bg-[#D3F23A] text-[#3D4532] font-extrabold rounded-xl mt-4 active:scale-95 transition-transform"
                  >
                    Execute Immediate Token
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* TAB: DOCTOR APPOINTMENTS */}
          {activeTab === "appointments" && (
            <motion.div
              key="appointments"
              variants={tabVariants}
              initial="hidden"
              animate="enter"
              exit="exit"
              className="bg-white/60 backdrop-blur p-4 sm:p-6 rounded-[2rem] shadow-xl border border-[#3D4532]/10"
            >
              <h3 className="text-lg sm:text-xl font-extrabold text-[#3D4532] flex items-center gap-2 mb-4 sm:mb-6">
                <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5E29]" />
                Scheduled Daily Bookings List
              </h3>

              {doctorAppointments.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="Schedule Clear"
                  message="You have no appointments booked for today. Enjoy the downtime or check the active queue for walk-ins."
                />
              ) : (
                <>
                  {/* MOBILE VIEW: Stacked Cards */}
                  <div className="block md:hidden space-y-4">
                    <AnimatePresence>
                      {doctorAppointments.map((app) => (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-white p-4 rounded-xl border border-[#3D4532]/10 shadow-sm flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-[#3D4532] text-lg">
                                {app.patient?.name || "Unknown"}
                              </p>
                              <p className="font-mono text-sm font-bold text-[#3D4532]/60">
                                {new Date(
                                  app.appointmentDate,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${app.status === "COMPLETED" ? "bg-[#D3F23A] text-[#3D4532]" : "bg-[#FDF8F0] text-[#3D4532]/60"}`}
                            >
                              {app.status}
                            </span>
                          </div>

                          {app.status === "PENDING" && (
                            <div className="pt-3 border-t border-[#3D4532]/5 flex gap-2">
                              <button
                                onClick={() => {
                                  const matchedDoc = doctorsList.find(
                                    (d) => d.userId === user.id,
                                  );
                                  handleQueueCheckin(
                                    app.patientId,
                                    matchedDoc.id,
                                    app.id,
                                  );
                                }}
                                className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-[#D3F23A] text-[#3D4532] active:scale-95 transition-transform"
                              >
                                Check In
                              </button>
                              <button
                                onClick={() =>
                                  handleCompleteAppointment(app.id)
                                }
                                className="flex-1 py-2.5 text-xs font-bold rounded-lg bg-[#3D4532] text-white active:scale-95 transition-transform"
                              >
                                Complete
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* DESKTOP VIEW: Table */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-[#3D4532]/10 bg-white">
                    <table className="min-w-[600px] w-full text-left text-sm">
                      <thead className="bg-[#FDF8F0] text-[#3D4532]/60 uppercase text-[10px] font-extrabold tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Time</th>
                          <th className="px-4 py-3">Patient</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3D4532]/5">
                        <AnimatePresence>
                          {doctorAppointments.map((app) => (
                            <motion.tr
                              key={app.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-[#FDF8F0]/50 transition-colors"
                            >
                              <td className="px-4 py-3 font-mono font-bold text-[#3D4532] whitespace-nowrap">
                                {new Date(
                                  app.appointmentDate,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p className="font-bold text-[#3D4532]">
                                  {app.patient?.name || "Unknown"}
                                </p>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${app.status === "COMPLETED" ? "bg-[#D3F23A] text-[#3D4532]" : "bg-[#FDF8F0] text-[#3D4532]/60"}`}
                                >
                                  {app.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                {app.status === "PENDING" && (
                                  <>
                                    <button
                                      onClick={() => {
                                        const matchedDoc = doctorsList.find(
                                          (d) => d.userId === user.id,
                                        );
                                        handleQueueCheckin(
                                          app.patientId,
                                          matchedDoc.id,
                                          app.id,
                                        );
                                      }}
                                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#D3F23A] text-[#3D4532] hover:scale-105 transition-transform"
                                    >
                                      Check In
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleCompleteAppointment(app.id)
                                      }
                                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#3D4532] text-white hover:scale-105 transition-transform"
                                    >
                                      Complete
                                    </button>
                                  </>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB: DOCTOR QUEUE (Already uses cards, left mostly untouched) */}
          {activeTab === "queue" && (
            <motion.div
              key="queue"
              variants={tabVariants}
              initial="hidden"
              animate="enter"
              exit="exit"
              className="bg-white/60 backdrop-blur p-4 sm:p-6 rounded-[2rem] shadow-xl border border-[#3D4532]/10"
            >
              <h3 className="text-lg sm:text-xl font-extrabold text-[#3D4532] flex items-center gap-2 mb-4 sm:mb-6">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5E29]" />
                Live Sequence Monitor
              </h3>

              {doctorQueue.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Queue Empty"
                  message="There are currently no patients waiting in your physical queue line."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence>
                    {doctorQueue.map((t) => (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`p-5 rounded-2xl border-2 shadow-sm flex flex-col justify-between ${t.status === "CALLING" ? "border-[#FF5E29] bg-[#FF5E29]/5" : "border-[#3D4532]/10 bg-white"}`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-3xl font-black text-[#3D4532]">
                              #{t.tokenNumber}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-[10px] font-black tracking-widest uppercase ${t.status === "CALLING" ? "bg-[#FF5E29] text-white shadow-sm" : "bg-[#FDF8F0] text-[#3D4532]/60"}`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <p className="font-bold text-[#3D4532] text-lg leading-tight truncate">
                            {t.patient.name}
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {t.status === "WAITING" && (
                            <button
                              onClick={() =>
                                handleUpdateQueueStatus(t.id, "CALLING")
                              }
                              className="flex-1 min-w-[100px] py-3 bg-[#D3F23A] text-[#3D4532] font-extrabold rounded-xl text-xs active:scale-95 transition-transform shadow-sm"
                            >
                              Call Next
                            </button>
                          )}
                          {t.status === "CALLING" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateQueueStatus(t.id, "COMPLETED")
                                }
                                className="flex-1 min-w-[80px] py-3 bg-[#3D4532] text-white font-extrabold rounded-xl text-xs active:scale-95 transition-transform shadow-sm"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateQueueStatus(t.id, "SKIPPED")
                                }
                                className="flex-1 min-w-[80px] py-3 bg-rose-50 text-rose-600 font-extrabold rounded-xl text-xs active:scale-95 transition-transform"
                              >
                                Skip
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: ADMIN REPORTS */}
          {activeTab === "reports" && (
            <motion.div
              key="reports"
              variants={tabVariants}
              initial="hidden"
              animate="enter"
              exit="exit"
              className="bg-white/60 backdrop-blur p-4 sm:p-6 rounded-[2rem] shadow-xl border border-[#3D4532]/10"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#3D4532] flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5E29]" />
                    Revenue Aggregation
                  </h3>
                  <p className="text-xs sm:text-sm text-[#3D4532]/60 font-medium mt-1">
                    Compile system-wide financial and operational metrics.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateSystemReport}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#3D4532] text-white font-extrabold rounded-xl shadow-lg active:scale-95 md:hover:bg-[#FF5E29] transition-colors whitespace-nowrap"
                >
                  {adminReportLoading ? "Processing..." : "Execute Audit"}
                </motion.button>
              </div>

              {!adminReportData && !adminReportLoading && (
                <EmptyState
                  icon={TrendingUp}
                  title="Awaiting Execution"
                  message="Click 'Execute Audit' above to compile current system revenue and performance aggregates."
                />
              )}

              {adminReportLoading && (
                <div className="h-48 flex items-center justify-center bg-white/40 rounded-2xl border border-[#3D4532]/5">
                  <span className="flex items-center gap-2 text-sm font-bold text-[#3D4532]/40 uppercase tracking-widest animate-pulse">
                    <Activity className="h-4 w-4" /> Crunching Metrics...
                  </span>
                </div>
              )}

              {adminReportData && !adminReportLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="p-4 sm:p-6 bg-[#FDF8F0] rounded-2xl border border-[#3D4532]/10">
                      <p className="text-[10px] sm:text-xs font-black text-[#3D4532]/40 uppercase tracking-widest">
                        Gross Revenue
                      </p>
                      <p className="text-3xl sm:text-4xl font-black text-[#FF5E29] mt-2">
                        $
                        {adminReportData.data.reduce(
                          (sum, i) => sum + i.revenue,
                          0,
                        )}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6 bg-[#FDF8F0] rounded-2xl border border-[#3D4532]/10">
                      <p className="text-[10px] sm:text-xs font-black text-[#3D4532]/40 uppercase tracking-widest">
                        Total Physicians
                      </p>
                      <p className="text-3xl sm:text-4xl font-black text-[#3D4532] mt-2">
                        {adminReportData.data.length}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6 bg-[#FDF8F0] rounded-2xl border border-[#3D4532]/10">
                      <p className="text-[10px] sm:text-xs font-black text-[#3D4532]/40 uppercase tracking-widest">
                        Appointments
                      </p>
                      <p className="text-3xl sm:text-4xl font-black text-[#3D4532] mt-2">
                        {adminReportData.data.reduce(
                          (sum, i) => sum + i.totalAppointments,
                          0,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* MOBILE VIEW: Stacked Cards */}
                  <div className="block md:hidden space-y-4">
                    {adminReportData.data.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-4 rounded-xl border border-[#3D4532]/10 shadow-sm flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-[#3D4532] text-lg">
                              {item.name}
                            </p>
                            <p className="text-xs font-bold text-[#FF5E29] uppercase tracking-wider">
                              {item.specialization}
                            </p>
                          </div>
                          <span className="font-black text-[#3D4532] text-lg">
                            ${item.revenue}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-[#3D4532]/5 text-sm font-medium text-[#3D4532]/70">
                          {item.completedAppointments} /{" "}
                          {item.totalAppointments} Consults Completed
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP VIEW: Table */}
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-[#3D4532]/10 bg-white">
                    <table className="min-w-[600px] w-full text-left text-sm">
                      <thead className="bg-[#FDF8F0] text-[#3D4532]/60 uppercase text-[10px] font-extrabold tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Physician</th>
                          <th className="px-4 py-3">Consultations</th>
                          <th className="px-4 py-3 text-right">
                            Revenue Generated
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3D4532]/5">
                        {adminReportData.data.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-[#FDF8F0]/50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="font-bold text-[#3D4532]">
                                {item.name}
                              </p>
                              <p className="text-[10px] sm:text-xs font-bold text-[#FF5E29] uppercase tracking-wider">
                                {item.specialization}
                              </p>
                            </td>
                            <td className="px-4 py-3 font-medium text-[#3D4532]/70 whitespace-nowrap">
                              {item.completedAppointments} /{" "}
                              {item.totalAppointments} Completed
                            </td>
                            <td className="px-4 py-3 text-right font-black text-[#3D4532] whitespace-nowrap">
                              ${item.revenue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB: PHYSICIAN REGISTRY (Already uses cards, untouched) */}
          {activeTab === "physicians" && (
            <motion.div
              key="physicians"
              variants={tabVariants}
              initial="hidden"
              animate="enter"
              exit="exit"
              className="bg-white/60 backdrop-blur p-4 sm:p-6 rounded-[2rem] shadow-xl border border-[#3D4532]/10"
            >
              <h3 className="text-lg sm:text-xl font-extrabold text-[#3D4532] flex items-center gap-2 mb-4 sm:mb-6">
                <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5E29]" />
                Staff Physicians Registry
              </h3>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3D4532]/40 group-focus-within:text-[#FF5E29] transition-colors" />
                  <input
                    type="text"
                    value={adminSearchQuery}
                    onChange={(e) => setAdminSearchQuery(e.target.value)}
                    placeholder="Execute name search..."
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#3D4532]/10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#D3F23A] focus:outline-none transition-all shadow-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={searchPhysiciansAdmin}
                  className="w-full sm:w-auto px-6 py-3 bg-[#3D4532] text-white font-extrabold rounded-xl shadow-lg active:scale-95 transition-colors"
                >
                  Search
                </motion.button>
              </div>

              <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex flex-col sm:flex-row gap-3 text-sm shadow-sm">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <div>
                  <strong className="block font-black uppercase tracking-wider mb-1">
                    Vulnerability Alert
                  </strong>
                  This search route utilizes raw SQL interpolation. It is
                  intentionally vulnerable to injection.
                </div>
              </div>

              {doctorsList.length === 0 ? (
                <EmptyState
                  icon={Stethoscope}
                  title="No Physicians Listed"
                  message="Execute a search query to load staff records."
                />
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {doctorsList.map((doc) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 rounded-2xl bg-white border border-[#3D4532]/10 shadow-sm"
                      >
                        <span className="inline-block px-2 py-1 bg-[#FDF8F0] text-[#FF5E29] text-[10px] font-black uppercase tracking-widest rounded mb-3">
                          {doc.department}
                        </span>
                        <h4 className="font-black text-lg text-[#3D4532] truncate">
                          {doc.name}
                        </h4>
                        <p className="text-xs text-[#3D4532]/60 font-bold mb-4 truncate">
                          {doc.specialization}
                        </p>
                        <div className="pt-4 border-t border-[#3D4532]/10 flex justify-between items-center text-xs">
                          <span className="font-medium text-[#3D4532]/60">
                            Exp: {doc.experience}y
                          </span>
                          <span className="font-black text-[#3D4532]">
                            Fee: ${doc.consultationFee}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
