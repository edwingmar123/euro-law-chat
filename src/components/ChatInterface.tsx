
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale, Send, Plus, Settings, LogOut } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ConversationHistory from "./ConversationHistory";
import ApiConfigModal from "./ApiConfigModal";
import { useToast } from "@/hooks/use-toast";
import { 
  supabase, 
  saveMessage, 
  getMessagesByConversation, 
  createConversation,
  getConversations,
  Message as SupabaseMessage
} from '../lib/Supabase';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  user_id: string;
}

interface ChatInterfaceProps {
  onLogout: () => void;
  user: any; // Asegúrate de pasar el objeto de usuario desde App
}

const SYSTEM_PROMPT = "You are LexIA, a legal assistant specialized in Spanish and European law. Reply using clear and technical language. When relevant, mention the applicable norm (Law, EU Directive, article) and key jurisprudence. Be concise but thorough. If asked about other countries, indicate that you can only provide advice on Spanish/European legislation.";

const ChatInterface = ({ onLogout, user }: ChatInterfaceProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupabaseMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState<"openai" | "gemini">("openai");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Cargar conversaciones al iniciar o cuando cambia el usuario
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Cargar mensajes cuando cambia la conversación actual
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      const conversations = await getConversations(user.id);
      setConversations(conversations);
      
      // Seleccionar la conversación más reciente si existe
      if (conversations.length > 0) {
        setCurrentConversationId(conversations[0].id);
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load conversations", 
        variant: "destructive" 
      });
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const messages = await getMessagesByConversation(conversationId);
      setMessages(messages);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to load messages", 
        variant: "destructive" 
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startNewConversation = async () => {
    try {
      const newConversation = await createConversation(
        user.id, 
        "New Conversation"
      );
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      
      toast({ 
        title: "Success", 
        description: "New conversation started" 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to create new conversation", 
        variant: "destructive" 
      });
    }
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!apiKey) {
      toast({ 
        title: "Error", 
        description: "Please configure your API key first", 
        variant: "destructive" 
      });
      setIsApiModalOpen(true);
      return;
    }

    // Si no hay conversación actual, crear una nueva
    let conversationId = currentConversationId;
    if (!conversationId) {
      try {
        const newConversation = await createConversation(
          user.id, 
          inputMessage.substring(0, 30) + "..."
        );
        
        conversationId = newConversation.id;
        setCurrentConversationId(conversationId);
        setConversations(prev => [newConversation, ...prev]);
      } catch (error) {
        toast({ 
          title: "Error", 
          description: "Failed to create conversation", 
          variant: "destructive" 
        });
        return;
      }
    }

    const userMessage: SupabaseMessage = {
      role: "user",
      content: inputMessage,
      user_id: user.id,
      conversation_id: conversationId
    };

    // Guardar mensaje del usuario
    try {
      const savedMessage = await saveMessage(userMessage);
      setMessages(prev => [...prev, savedMessage]);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save message", 
        variant: "destructive" 
      });
      return;
    }

    setInputMessage("");
    setIsLoading(true);

    try {
      // Simulación de respuesta del asistente (REEMPLAZAR CON LLAMADA REAL A LA API)
      const assistantResponse = `Como LexIA, asistente legal especializado en derecho español y europeo, puedo ayudarte con tu consulta: "${inputMessage}". 
        Esta es una respuesta simulada. Para respuestas reales, necesitarías integrar con la API de OpenAI o Gemini usando tu clave API configurada.`;
      
      const assistantMessage: SupabaseMessage = {
        role: "assistant",
        content: assistantResponse,
        user_id: user.id,
        conversation_id: conversationId
      };

      // Guardar respuesta del asistente
      const savedAssistantMessage = await saveMessage(assistantMessage);
      setMessages(prev => [...prev, savedAssistantMessage]);
      
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to get response from AI", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    supabase.auth.signOut().then(() => {
      onLogout();
    });
  };

  const saveApiConfig = (key: string, provider: "openai" | "gemini") => {
    setApiKey(key);
    setApiProvider(provider);
    localStorage.setItem('lexia-api-key', key);
    localStorage.setItem('lexia-api-provider', provider);
    setIsApiModalOpen(false);
    toast({ 
      title: "Success", 
      description: "API configuration saved" 
    });
  };

  // Cargar configuración de API al montar
  useEffect(() => {
    const savedApiKey = localStorage.getItem('lexia-api-key');
    const savedProvider = localStorage.getItem('lexia-api-provider');
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedProvider) setApiProvider(savedProvider as "openai" | "gemini");
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Query History</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ConversationHistory
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
        />
        
        <div className="p-4 mt-auto">
          <Button
            onClick={startNewConversation}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Query
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">LexIA - Legal Assistant</h1>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configure API Key</span>
            </Button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4" style={{ height: '70vh' }}>
          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Scale className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Welcome to LexIA</p>
                <p className="text-sm">Start a new conversation to get legal assistance</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble 
                  key={index} 
                  message={{
                    role: message.role,
                    content: message.content,
                    timestamp: new Date(message.created_at || new Date())
                  }} 
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex space-x-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask your legal question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onSave={saveApiConfig}
        currentKey={apiKey}
        currentProvider={apiProvider}
      />
    </div>
  );
};

export default ChatInterface;