
import { createClient } from '@supabase/supabase-js';

// SOLUCIÓN TEMPORAL - Reemplazar con variables de entorno en producción
const supabaseUrl = "https://fkwxlaoeebmkeritxitl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrd3hsYW9lZWJta2VyaXR4aXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzk2OTAsImV4cCI6MjA2NDc1NTY5MH0.IhdHTWkMDtMhdrjmcQTU9Ggd6eXz5nymwPFOU5-ovaE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos TypeScript
export interface Message {
  id?: number;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

// Función para guardar un mensaje en Supabase
export const saveMessage = async (message: Omit<Message, 'id' | 'created_at'>): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select();
    
    if (error) {
      console.error('Error saving message:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Unexpected error saving message:', error);
    return null;
  }
};

// Función para obtener mensajes por user_id
export const getMessages = async (userId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error loading messages:', error);
    return [];
  }
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Función para cerrar sesión
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

// Función para iniciar sesión con email y contraseña
export const signInWithPassword = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Función para registrarse con email y contraseña
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Función para obtener la sesión actual
export const getSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Función para escuchar cambios de autenticación
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Función para eliminar una conversación
export const deleteConversation = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
};

// Función para obtener las últimas conversaciones
export const getRecentConversations = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recent conversations:', error);
    return [];
  }
};