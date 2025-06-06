import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Key:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "Existe" : "Falta");
createRoot(document.getElementById("root")!).render(<App />);
