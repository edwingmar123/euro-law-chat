import { createClient } from '@supabase/supabase-js';

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
  conversation_id?: string;
}

export interface ConversationSummary {
  conversation_id: string;
  title: string;
  last_message: string;
  message_count: number;
}

// Obtener resumen de conversaciones
export const getConversations = async (userId: string): Promise<ConversationSummary[]> => {
  try {
    const { data, error } = await supabase.rpc('get_conversation_summary', {
      user_id: userId
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
};

// Crear nueva conversación
export const createNewConversation = async (userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('create_new_conversation', {
      user_id: userId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Obtener mensajes por conversación
export const getMessagesByConversation = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
};

// Guardar mensaje
export const saveMessage = async (message: Omit<Message, 'id' | 'created_at'>): Promise<Message> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};