import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { GlobalDataProvider } from "@/contexts/GlobalDataProvider";
import Index from "./pages/Index";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Сохраняем API ключ при запуске приложения
const apiKey = "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";
if (!localStorage.getItem('openai_api_key')) {
  localStorage.setItem('openai_api_key', apiKey);
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <GlobalDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<Settings />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GlobalDataProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
