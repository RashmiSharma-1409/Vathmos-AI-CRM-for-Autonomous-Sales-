import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, BrainCircuit, BriefcaseBusiness, Clock3, LayoutDashboard, Mail, ShieldAlert, ShieldCheck, Sparkles, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/lead-intelligence", icon: BrainCircuit, label: "Lead Intelligence" },
  { to: "/deal-intelligence", icon: BriefcaseBusiness, label: "Deal Intelligence" },
  { to: "/outreach-agent", icon: Mail, label: "Outreach Agent" },
  { to: "/churn-prediction", icon: ShieldAlert, label: "Churn Prediction" },
  { to: "/retention-agent", icon: ShieldCheck, label: "Retention Agent" },
  { to: "/competitive-insights", icon: BarChart3, label: "Competitive Insights" },
  { to: "/timeline", icon: Clock3, label: "Timeline" },
];

function SidebarBody({ onNavigate }) {
  return (
    <div className="glass-panel surface-ring flex h-full flex-col rounded-[32px] p-5">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-cyan via-accent-teal to-accent-orange text-slate-950 shadow-glow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-white">Vathmos AI</p>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Agent OS</p>
        </div>
      </div>

      <div className="mb-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Revenue cockpit</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-white">Operate every AI agent from one command surface.</h2>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-[24px] border border-accent-cyan/15 bg-gradient-to-br from-accent-cyan/10 to-transparent p-4">
        <p className="text-xs uppercase tracking-[0.28em] text-accent-cyan">Production mode</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">Real Flask endpoints only. No mocked payloads, no filler data, no disconnected UI states.</p>
      </div>
    </div>
  );
}

export function AppSidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-4 lg:left-4 lg:block lg:w-80">
        <SidebarBody />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/70 p-4 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -40, opacity: 0 }} className="h-full max-w-sm">
              <div className="mb-4 flex justify-end">
                <button onClick={onClose} className="rounded-2xl border border-line bg-white/5 p-3 text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarBody onNavigate={onClose} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
