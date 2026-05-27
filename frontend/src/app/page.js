"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, MonitorPlay, Users, ArrowRight } from "lucide-react";

export default function Home() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDF8F0] overflow-hidden relative">
      {/* Navbar/Header */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12 max-w-7xl mx-auto w-full"
      >
        <div className="flex items-center gap-2 text-[#3D4532] font-extrabold text-2xl tracking-tight">
          <Activity className="h-6 w-6 text-[#FF5E29]" />
          <span className="font-serif">HAQMS</span>
        </div>
        <div className="hidden md:flex gap-8 font-semibold text-[#3D4532] items-center">
          <Link
            href="#health"
            className="hover:text-[#FF5E29] transition-colors"
          >
            Health
          </Link>
          <Link href="#team" className="hover:text-[#FF5E29] transition-colors">
            Team
          </Link>
          <Link
            href="/login"
            className="px-6 py-2 rounded-full border border-[#3D4532] hover:bg-[#3D4532] hover:text-white transition-all shadow-sm"
          >
            Book A Demo
          </Link>
        </div>
      </motion.nav>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 py-12 lg:py-4">
        {/* Left Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start text-left"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D3F23A] text-[#3D4532] text-xs sm:text-sm font-bold shadow-sm mb-6 transform -rotate-1"
          >
            <span className="text-lg sm:text-xl">☀️</span>
            Wishing you healthy happy life
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-serif text-[#3D4532] leading-[1.1] max-w-xl"
          >
            Elegant mission <br />
            to <span className="italic text-[#FF5E29]">wellness</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-base sm:text-lg lg:text-xl text-[#3D4532]/70 max-w-md font-medium"
          >
            Conquer your health goals, one step at a time. Health professionals
            you can genuinely trust with modern infrastructure.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#FF5E29] text-white font-bold hover:bg-[#E04B18] transition-colors shadow-lg shadow-[#FF5E29]/20 w-full"
              >
                Portal Access
                <ArrowRight className="h-5 w-5" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/queue"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-[#3D4532] font-bold border border-[#3D4532]/10 hover:bg-[#D3F23A] hover:border-[#D3F23A] transition-colors shadow-sm w-full"
              >
                <MonitorPlay className="h-5 w-5" />
                Live Queue Tracking
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 flex items-center gap-4 sm:gap-6 p-4 rounded-3xl bg-white/40 backdrop-blur border border-[#3D4532]/10 w-full sm:w-fit"
          >
            <div className="flex -space-x-3 sm:-space-x-4">
              <img
                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full border-2 border-[#FDF8F0] shadow-sm"
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80"
                alt="Doctor"
              />
              <img
                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full border-2 border-[#FDF8F0] shadow-sm"
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80"
                alt="Doctor"
              />
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#FDF8F0] bg-[#D3F23A] flex items-center justify-center text-[#3D4532] font-bold shadow-sm text-sm sm:text-base">
                +
              </div>
            </div>
            <div>
              <p className="font-bold text-[#3D4532] text-sm sm:text-base">
                Become a trainer
              </p>
              <p className="text-xs sm:text-sm text-[#3D4532]/60">
                Join our medical team today
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Content / Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative h-[350px] sm:h-[450px] lg:h-[600px] w-full mt-10 lg:mt-0 flex justify-center lg:justify-end"
        >
          {/* Top Right Image */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-0 right-0 sm:right-4 lg:right-10 w-[55%] sm:w-64 lg:w-72 h-[60%] sm:h-80 lg:h-96 rounded-[2rem] overflow-hidden shadow-2xl transform rotate-3 z-20 border-4 border-white"
          >
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80"
              className="object-cover w-full h-full"
              alt="Wellness"
            />
          </motion.div>

          {/* Bottom Left Image */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-4 sm:bottom-0 left-0 sm:left-4 lg:left-10 w-[60%] sm:w-72 lg:w-80 h-[55%] sm:h-64 lg:h-72 rounded-[2rem] overflow-hidden shadow-2xl transform -rotate-2 z-10 border-4 border-white"
          >
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80"
              className="object-cover w-full h-full"
              alt="Therapy"
            />
          </motion.div>

          {/* Floating decorations */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="absolute top-1/3 sm:top-1/2 left-0 sm:-left-4 lg:-left-12 transform -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#D3F23A] flex items-center justify-center shadow-lg border border-[#D3F23A] z-30 cursor-pointer"
          >
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-bold text-[#3D4532]">
                12$
              </span>
              <span className="text-[10px] sm:text-xs text-[#3D4532]/60 tracking-wider uppercase font-semibold">
                Subscription
              </span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute right-0 sm:right-4 lg:right-0 bottom-10 sm:bottom-20 p-3 sm:p-4 rounded-2xl bg-white border border-[#3D4532]/10 shadow-xl z-30 flex items-center gap-3"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FF5E29] flex items-center justify-center text-white">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="font-bold text-[#3D4532] text-sm sm:text-base">
                3M+
              </p>
              <p className="text-[10px] sm:text-xs text-[#3D4532]/60">
                Lives touched
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background decorations */}
      <div className="fixed top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#D3F23A]/10 blur-[100px] -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#FF5E29]/5 blur-[100px] -z-10 pointer-events-none" />
    </div>
  );
}
