import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fkwxlaoeebmkeritxitl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrd3hsYW9lZWJta2VyaXR4aXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzk2OTAsImV4cCI6MjA2NDc1NTY5MH0.IhdHTWkMDtMhdrjmcQTU9Ggd6eXz5nymwPFOU5-ovaE";

// SINGLETON: Asegurar solo una instancia de Supabase
let supabaseInstance: any = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabase();

// Tipos TypeScript actualizados para coincidir con la base de datos
export interface Message {
  id: string; // Cambiado a string (UUID)
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  conversation_id: string; // Ahora es obligatorio
}

export interface ConversationSummary {
  id: string; // Cambiado de conversation_id a id
  title: string;
  last_message: string; // Mantenemos como string para simplificar
  message_count: number;
}

// Obtener resumen de conversaciones - CORREGIDO
export const getConversations = async (userId: string): Promise<ConversationSummary[]> => {
  try {
    // Validación de UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      throw new Error("ID de usuario inválido");
    }

    const { data, error } = await supabase
      .rpc('get_conversation_summary', { user_id: userId })
      .select('*'); // Añadir select para formato adecuado

    if (error) {
      console.error('Supabase RPC error:', {
        message: error.message,
        details: error.details,
        code: error.code
      });
      throw new Error(`Error al cargar conversaciones: ${error.message}`);
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error cargando conversaciones:', error.message);
    return [];
  }
};

// Crear nueva conversación - CORREGIDO
export const createNewConversation = async (userId: string): Promise<string> => {
  try {
    // Validación de UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      throw new Error("ID de usuario inválido");
    }

    const { data, error } = await supabase
      .rpc('create_new_conversation', { user_id: userId })
      .single(); // Obtener resultado simple

    if (error) {
      throw new Error(`Error RPC: ${error.message}`);
    }
    
    return data;
  } catch (error: any) {
    console.error('Error creando conversación:', error.message);
    throw new Error(`No se pudo crear la conversación: ${error.message}`);
  }
};

// Obtener mensajes por conversación - CORREGIDO
export const getMessagesByConversation = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  } catch (error: any) {
    console.error('Error cargando mensajes:', error.message);
    return [];
  }
};

// Guardar mensaje - CORREGIDO
export const saveMessage = async (message: Omit<Message, 'id' | 'created_at'>): Promise<Message> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        ...message,
        created_at: new Date().toISOString() // Añadir timestamp automático
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error: any) {
    console.error('Error guardando mensaje:', error.message);
    throw new Error(`No se pudo guardar el mensaje: ${error.message}`);
  }
};

// Función adicional: Obtener usuario autenticado
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Función adicional: Verificar sesión
export const checkAuthSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};