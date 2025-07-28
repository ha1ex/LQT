import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalDataProvider } from "@/contexts/GlobalDataProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Ratings from "./pages/Ratings";
import Analytics from "./pages/Analytics";
import Strategies from "./pages/Strategies";
import AICoach from "./pages/AICoach";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GlobalDataProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              {/* Actual pages */}
              <Route path="/ratings" element={<Ratings />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/ai-coach" element={<AICoach />} />
              <Route path="/help" element={<Index />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </GlobalDataProvider>
  </QueryClientProvider>
);

export default App;
