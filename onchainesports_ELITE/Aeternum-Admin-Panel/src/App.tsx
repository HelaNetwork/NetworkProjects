import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import TeamsPage from "@/pages/TeamsPage";
import CollectionsPage from "@/pages/CollectionsPage";
import AssetsPage from "@/pages/AssetsPage";
import MatchesPage from "@/pages/MatchesPage";
import MarketsPage from "@/pages/MarketsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="collections" element={<CollectionsPage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="matches" element={<MatchesPage />} />
              <Route path="markets" element={<MarketsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
