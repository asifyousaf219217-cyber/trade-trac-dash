import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Ticker from "./components/Ticker";
import Home from "./pages/Home";
import Markets from "./pages/Markets";
import Currencies from "./pages/Currencies";
import Trends from "./pages/Trends";
import News from "./pages/News";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <Ticker />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/currencies" element={<Currencies />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/news" element={<News />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
