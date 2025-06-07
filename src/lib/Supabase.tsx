
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fkwxlaoeebmkeritxitl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrd3hsYW9lZWJta2VyaXR4aXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzk2OTAsImV4cCI6MjA2NDc1NTY5MH0.IhdHTWkMDtMhdrjmcQTU9Ggd6eXz5nymwPFOU5-ovaE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos TypeScript
export interface Message {
  id?: number;
  user_id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at?: string;
}

// Función para crear nueva conversación (SOLUCIÓN AL ERROR)
export const createConversation = async (userId: string, title: string): Promise<Conversation> => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ user_id: userId, title }])
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error creating conversation: ${error.message}`);
  }
  
  return data;
};

// Función para obtener conversaciones
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};

// Función para obtener mensajes por conversación
export const getMessagesByConversation = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Función para guardar mensaje
export const saveMessage = async (message: Omit<Message, 'id' | 'created_at'>): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error saving message: ${error.message}`);
  }
  
  return data;
};

// ... otras funciones que necesites ...