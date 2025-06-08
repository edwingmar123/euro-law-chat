import { supabase, ConversationSummary, getConversations } from "../lib/Supabase";
import { useEffect, useState } from "react";
import LoadingSpinner from "../lib/LoadingSpinner";

interface ConversationHistoryProps {
  userId: string; 
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationHistory = ({
  userId,
  currentConversationId,
  onSelectConversation,
}: ConversationHistoryProps) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Cargando conversaciones para userId:", userId);
      const data = await getConversations(userId);
      console.log("Datos recibidos de getConversations:", data);
      
      setConversations(data);
    } catch (err: any) {
      console.error("Error loading conversations:", err);
      setError("Error al cargar las conversaciones: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();

    const channel = supabase
      .channel("conversations_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log("Cambio detectado, recargando conversaciones...");
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Nueva conversación"
        : date.toLocaleDateString("es-ES", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
    } catch (e) {
      return "Fecha inválida";
    }
  };

  console.log("Estado actual:", {
    loading,
    error,
    userId,
    conversationsCount: conversations.length
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
            <p className="ml-2">Cargando conversaciones...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={loadConversations}
              className="mt-2 px-4 py-2 bg-gray-100 rounded"
            >
              Reintentar
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center p-4">
            <p>No hay conversaciones aún</p>
            <p className="text-sm mt-1">Comienza un nuevo diálogo</p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`p-3 rounded-lg cursor-pointer border ${
                  currentConversationId === conversation.id
                    ? "bg-blue-50 border-blue-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-gray-800 truncate">
                    {conversation.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                    {formatDate(conversation.last_message)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {conversation.message_count} mensajes
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-2 border-t">
        <button
          onClick={loadConversations}
          className="w-full py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Recargar conversaciones
        </button>
      </div>
    </div>
  );
};

export default ConversationHistory;