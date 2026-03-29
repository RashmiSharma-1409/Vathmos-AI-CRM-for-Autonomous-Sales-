import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/topbar";

export function AppShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-80">
        <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-80 w-80 rounded-full bg-accent-orange/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent-teal/10 blur-3xl" />
      </div>
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-[0.08]" style={{ backgroundSize: "42px 42px" }} />

      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-[21.5rem]">
        <TopBar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
