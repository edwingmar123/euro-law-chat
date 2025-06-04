
import { Scale, User } from "lucide-react";
import { Message } from "./ChatInterface";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const time = message.timestamp.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const getUserInitials = () => {
    const user = localStorage.getItem('lexia-user');
    if (user) {
      const userData = JSON.parse(user);
      const email = userData.email;
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start space-x-2 max-w-[70%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {getUserInitials()}
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col">
          <div
            className={`px-4 py-3 rounded-lg ${
              isUser
                ? 'bg-blue-100 text-gray-800 rounded-tr-none'
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <span className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
