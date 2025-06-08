import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fkwxlaoeebmkeritxitl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrd3hsYW9lZWJta2VyaXR4aXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzk2OTAsImV4cCI6MjA2NDc1NTY5MH0.IhdHTWkMDtMhdrjmcQTU9Ggd6eXz5nymwPFOU5-ovaE";

// SINGLETON: Asegurar solo una instancia de Supabase
let supabaseInstance: any = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabase();

// Tipos TypeScript actualizados para coincidir con la base de datos
export interface Message {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  conversation_id: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  last_message: string;
  message_count: number;
}

// CORRECCIÓN: Función para obtener conversaciones (FALTANTE)
// ... (código previo)

// CORRECCIÓN DEFINITIVA: Función para obtener conversaciones
export const getConversations = async (
  userId: string | undefined
): Promise<ConversationSummary[]> => {
  try {
    // Verificar si userId es válido
    if (!userId || !isValidUUID(userId)) {
      console.warn("ID de usuario inválido:", userId);
      return [];
    }

    console.log("[getConversations] Invocando RPC para user:", userId);

    // CORRECCIÓN: Usar .select() después de rpc()
    const { data, error } = await supabase
      .rpc("get_conversation_summary", { user_id: userId })
      .select('*');

    console.log("[getConversations] Respuesta RPC completa:", data, error);

    if (error) {
      console.error("Error RPC:", error);
      throw new Error(`Error al cargar conversaciones: ${error.message}`);
    }

    // CORRECCIÓN: Asegurar que siempre es un array
    const resultData = Array.isArray(data) ? data : [data];

    return resultData.map(conv => ({
      id: conv.id,
      title: conv.title || "Nueva conversación",
      last_message: conv.last_message ? new Date(conv.last_message).toISOString() : new Date().toISOString(),
      message_count: conv.message_count || 0,
    }));
  } catch (error: any) {
    console.error("Error cargando conversaciones:", error);
    return [];
  }
};


// Función auxiliar para validar UUIDs
const isValidUUID = (uuid: string | undefined) => {
  if (!uuid) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
};


// ... (resto del código)
// Crear nueva conversación
export const createNewConversation = async (
  userId: string
): Promise<string> => {
  try {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId
      )
    ) {
      throw new Error("ID de usuario inválido");
    }

    // CORRECCIÓN: Usar .single() correctamente
    const { data, error } = await supabase
      .rpc("create_new_conversation", { user_id: userId })
      .single();

    if (error) throw new Error(`Error RPC: ${error.message}`);

    return data;
  } catch (error: any) {
    console.error("Error creando conversación:", error.message);
    throw new Error(`No se pudo crear la conversación: ${error.message}`);
  }
};

// Obtener mensajes por conversación
export const getMessagesByConversation = async (
  conversationId: string
): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  } catch (error: any) {
    console.error("Error cargando mensajes:", error.message);
    return [];
  }
};

// Guardar mensaje
export const saveMessage = async (
  message: Omit<Message, "id" | "created_at">
): Promise<Message> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          ...message,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error: any) {
    console.error("Error guardando mensaje:", error.message);
    throw new Error(`No se pudo guardar el mensaje: ${error.message}`);
  }
};

// Función adicional: Obtener usuario autenticado
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Función adicional: Verificar sesión
export const checkAuthSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
