import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./lib/Supabase";
import AuthScreen from "./components/AuthScreen";
import ChatInterface from "./components/ChatInterface";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión al cargar y escuchar cambios de autenticación
  useEffect(() => {
    // 1. Verificar sesión existente al cargar
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoading(false);
      }
    };

    checkSession();

    // 2. Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                user ? 
                  <ChatInterface 
                    onLogout={() => supabase.auth.signOut()} 
                    user={user} 
                  /> : 
                  <Navigate to="/auth" replace />
              } 
            />
            <Route 
              path="/auth" 
              element={
                user ? 
                  <Navigate to="/" replace /> : 
                  <AuthScreen onLogin={setUser} />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;