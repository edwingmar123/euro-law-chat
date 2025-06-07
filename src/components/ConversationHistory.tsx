
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase, Message } from '../lib/Supabase';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../lib/LoadingSpinner';

// Interfaz para una conversación agrupada
interface Conversation {
  id: string;
  date: Date;
  title: string;
  preview: string;
  message_count: number;
}

interface ConversationHistoryProps {
  userId: string;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationHistory = ({
  userId,
  currentConversationId,
  onSelectConversation
}: ConversationHistoryProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('created_at, content')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const grouped = data.reduce((acc, message) => {
          const dateStr = new Date(message.created_at).toISOString().split('T')[0];

          if (!acc[dateStr]) {
            acc[dateStr] = {
              id: dateStr,
              date: new Date(dateStr),
              title: `Conversation ${dateStr}`,
              preview: message.content.substring(0, 50),
              message_count: 0
            };
          }

          acc[dateStr].message_count++;
          return acc;
        }, {} as Record<string, Conversation>);

        setConversations(Object.values(grouped));
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) loadConversations();
  }, [userId]);

  // ✅ Función para formatear la fecha de forma legible
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new query to begin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                  currentConversationId === conversation.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-1">
                    {conversation.title}
                  </h4>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatDate(conversation.date)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {conversation.preview}
                </p>
                <div className="text-xs text-gray-400 mt-1">
                  {conversation.message_count} messages
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ConversationHistory;
