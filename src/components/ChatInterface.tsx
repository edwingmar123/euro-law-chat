
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale, Send, Plus, Settings, LogOut } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ConversationHistory from "./ConversationHistory";
import ApiConfigModal from "./ApiConfigModal";
import { useToast } from "@/hooks/use-toast";

export interface Message {
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

interface ChatInterfaceProps {
  onLogout: () => void;
}

const SYSTEM_PROMPT = "You are LexIA, a legal assistant specialized in Spanish and European law. Reply using clear and technical language. When relevant, mention the applicable norm (Law, EU Directive, article) and key jurisprudence. Be concise but thorough. If asked about other countries, indicate that you can only provide advice on Spanish/European legislation.";

const ChatInterface = ({ onLogout }: ChatInterfaceProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState<"openai" | "gemini">("openai");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load conversations from localStorage
    const savedConversations = localStorage.getItem('lexia-conversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed.map((conv: any) => ({
        ...conv,
        date: new Date(conv.date),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })));
    }

    // Load API configuration
    const savedApiKey = localStorage.getItem('lexia-api-key');
    const savedProvider = localStorage.getItem('lexia-api-provider');
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedProvider) setApiProvider(savedProvider as "openai" | "gemini");
  }, []);

  useEffect(() => {
    // Save conversations to localStorage
    localStorage.setItem('lexia-conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, currentConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentMessages = (): Message[] => {
    if (!currentConversation) return [];
    const conversation = conversations.find(c => c.id === currentConversation);
    return conversation?.messages || [];
  };

  const startNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: "New Query",
      messages: [],
      date: new Date()
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newId);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!apiKey) {
      toast({ title: "Error", description: "Please configure your API key first", variant: "destructive" });
      setIsApiModalOpen(true);
      return;
    }

    let convId = currentConversation;
    if (!convId) {
      startNewConversation();
      convId = Date.now().toString();
    }

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    // Update conversation with user message
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        const updatedMessages = [...conv.messages, userMessage];
        return {
          ...conv,
          title: conv.title === "New Query" ? inputMessage.slice(0, 30) + "..." : conv.title,
          messages: updatedMessages
        };
      }
      return conv;
    }));

    setInputMessage("");
    setIsLoading(true);

    try {
      // Simulate API call (replace with actual API integration)
      setTimeout(() => {
        const assistantMessage: Message = {
          role: "assistant",
          content: `Como LexIA, asistente legal especializado en derecho español y europeo, puedo ayudarte con tu consulta: "${userMessage.content}". Esta es una respuesta simulada. Para respuestas reales, necesitarías integrar con la API de OpenAI o Gemini usando tu clave API configurada.`,
          timestamp: new Date()
        };

        setConversations(prev => prev.map(conv => {
          if (conv.id === convId) {
            return {
              ...conv,
              messages: [...conv.messages, assistantMessage]
            };
          }
          return conv;
        }));
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lexia-user');
    onLogout();
  };

  const saveApiConfig = (key: string, provider: "openai" | "gemini") => {
    setApiKey(key);
    setApiProvider(provider);
    localStorage.setItem('lexia-api-key', key);
    localStorage.setItem('lexia-api-provider', provider);
    setIsApiModalOpen(false);
    toast({ title: "Success", description: "API configuration saved" });
  };

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
          currentConversation={currentConversation}
          onSelectConversation={setCurrentConversation}
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
          {getCurrentMessages().length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Scale className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Welcome to LexIA</p>
                <p className="text-sm">Start a new conversation to get legal assistance</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {getCurrentMessages().map((message, index) => (
                <MessageBubble key={index} message={message} />
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
