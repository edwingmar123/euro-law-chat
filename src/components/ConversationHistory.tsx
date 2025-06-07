
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase, Message } from '../lib/Supabase';
import LoadingSpinner from '../lib/LoadingSpinner';
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  date: Date;
}

interface ConversationHistoryProps {
  conversations: Conversation[];
  currentConversation: string | null;
  onSelectConversation: (id: string) => void;
}

const ConversationHistory = ({ 
  conversations, 
  currentConversation, 
  onSelectConversation 
}: ConversationHistoryProps) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getPreview = (conversation: Conversation) => {
    if (conversation.messages.length === 0) return "New conversation";
    const firstMessage = conversation.messages[0];
    return firstMessage.content.length > 50 
      ? firstMessage.content.substring(0, 50) + "..."
      : firstMessage.content;
  };

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
                  currentConversation === conversation.id
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
                  {getPreview(conversation)}
                </p>
                {conversation.messages.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ConversationHistory;
