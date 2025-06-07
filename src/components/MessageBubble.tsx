
import { Scale } from "lucide-react";
import { Message } from "./ChatInterface";
import { useUser } from "@supabase/auth-helpers-react"; 

interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const user = useUser();
  const isUser = message.role === "user";
  
  // Formatear hora
  const time = new Date(message.timestamp).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-gray-200 border border-gray-300">
          {isUser ? (
            <span className="text-gray-700 font-medium">
              {getUserInitials()}
            </span>
          ) : (
            <Scale className="h-4 w-4 text-gray-600" />
          )}
        </div>

        {/* Burbuja de mensaje */}
        <div
          className={`px-4 py-3 rounded-xl ${
            isUser
              ? 'bg-blue-100 text-gray-800 rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className="mb-1 last:mb-0">
                {line}
              </p>
            ))}
          </div>
          <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {time}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;