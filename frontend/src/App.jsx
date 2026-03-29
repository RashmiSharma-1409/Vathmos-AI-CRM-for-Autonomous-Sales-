import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader } from "@/components/loader";
import { AppShell } from "@/layouts/AppShell";
import { useAppStore } from "@/store/useAppStore";

const DashboardPage = lazy(() => import("@/pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const LeadIntelligencePage = lazy(() => import("@/pages/LeadIntelligencePage").then((module) => ({ default: module.LeadIntelligencePage })));
const DealIntelligencePage = lazy(() => import("@/pages/DealIntelligencePage").then((module) => ({ default: module.DealIntelligencePage })));
const OutreachAgentPage = lazy(() => import("@/pages/OutreachAgentPage").then((module) => ({ default: module.OutreachAgentPage })));
const ChurnPredictionPage = lazy(() => import("@/pages/ChurnPredictionPage").then((module) => ({ default: module.ChurnPredictionPage })));
const RetentionAgentPage = lazy(() => import("@/pages/RetentionAgentPage").then((module) => ({ default: module.RetentionAgentPage })));
const CompetitiveInsightsPage = lazy(() => import("@/pages/CompetitiveInsightsPage").then((module) => ({ default: module.CompetitiveInsightsPage })));
const TimelinePage = lazy(() => import("@/pages/TimelinePage").then((module) => ({ default: module.TimelinePage })));

export default function App() {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.body.classList.toggle("light", theme === "light");
  }, [theme]);

  return (
    <AppShell>
      <Suspense fallback={<Loader label="Loading Vathmos workspace" className="min-h-[60vh]" />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/lead-intelligence" element={<LeadIntelligencePage />} />
          <Route path="/deal-intelligence" element={<DealIntelligencePage />} />
          <Route path="/outreach-agent" element={<OutreachAgentPage />} />
          <Route path="/churn-prediction" element={<ChurnPredictionPage />} />
          <Route path="/retention-agent" element={<RetentionAgentPage />} />
          <Route path="/competitive-insights" element={<CompetitiveInsightsPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
