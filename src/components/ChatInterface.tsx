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
  createNewConversation,
  getConversations,
  type Message as SupabaseMessage,
  type ConversationSummary,
} from "../lib/Supabase";

// Importar servicio LLM
import { useLlmService, type LLMMessage } from "./LlmService";

interface ChatInterfaceProps {
  onLogout: () => void;
  user: any;
}
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = "Eres LexIA, un asistente jurídico especializado en Derecho español y europeo. Responde con lenguaje claro y técnico. Cuando sea relevante, menciona la norma aplicable (Ley, Directiva UE, artículo) y jurisprudencia clave. Sé conciso pero exhaustivo. Si te preguntan sobre otros países, indica que solo puedes asesorar sobre legislación española/europea.";

const ChatInterface = ({ onLogout, user }: ChatInterfaceProps) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(() => {
    return localStorage.getItem('currentConversationId');
  });
  const [messages, setMessages] = useState<SupabaseMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState<string>("openai");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Usar el servicio LLM
  const callLlm = useLlmService(apiKey, apiProvider);

  // Cargar conversaciones al iniciar o cuando cambia el usuario
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user]);

  // Cargar mensajes cuando cambia la conversación actual
  useEffect(() => {
    if (currentConversationId) {
      localStorage.setItem('currentConversationId', currentConversationId);
      loadMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  const loadConversations = useCallback(async () => {
    try {
      const conversations = await getConversations(user.id);
      setConversations(conversations);

      if (!currentConversationId && conversations.length > 0) {
        setCurrentConversationId(conversations[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las conversaciones",
        variant: "destructive",
      });
    }
  }, [user, currentConversationId, toast]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const messages = await getMessagesByConversation(conversationId);
      setMessages(messages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los mensajes",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startNewConversation = useCallback(async () => {
    try {
      const newConversationId = await createNewConversation(user.id);
      setCurrentConversationId(newConversationId);
      setMessages([]);
      setTimeout(() => loadConversations(), 300);
      
      toast({
        title: "Éxito",
        description: "Nueva conversación iniciada",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la conversación",
        variant: "destructive",
      });
    }
  }, [user, loadConversations, toast]);

  const handleSelectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Por favor, configura tu clave API primero",
        variant: "destructive",
      });
      setIsApiModalOpen(true);
      return;
    }

    // Crear nueva conversación si no existe
    let conversationId = currentConversationId;
    if (!conversationId) {
      try {
        conversationId = await createNewConversation(user.id);
        setCurrentConversationId(conversationId);
        await loadConversations();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "No se pudo crear la conversación",
          variant: "destructive",
        });
        return;
      }
    }

    // Guardar mensaje del usuario
    const userMessage: Omit<SupabaseMessage, "id" | "created_at"> = {
      role: "user",
      content: inputMessage,
      user_id: user.id,
      conversation_id: conversationId!,
    };

    try {
      const userMessageSaved = await saveMessage(userMessage);
      setMessages((prev) => [...prev, userMessageSaved]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el mensaje",
        variant: "destructive",
      });
      return;
    }

    setInputMessage("");
    setIsLoading(true);

    try {
      // Preparar mensajes para el LLM
      const messagesForLLM: LLMMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map(m => ({ 
          role: m.role, 
          content: m.content 
        }) as LLMMessage),
        { role: "user", content: inputMessage }
      ];

      // Obtener respuesta usando el servicio LLM
      const assistantContent = await callLlm(messagesForLLM);

      // Guardar respuesta del asistente
      const assistantMessage: Omit<SupabaseMessage, "id" | "created_at"> = {
        role: "assistant",
        content: assistantContent,
        user_id: user.id,
        conversation_id: conversationId!,
      };

      const savedAssistantMessage = await saveMessage(assistantMessage);
      setMessages((prev) => [...prev, savedAssistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error de API",
        description: error.message || "No se pudo obtener respuesta de la IA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, apiKey, currentConversationId, user, messages, callLlm, toast, loadConversations]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('currentConversationId');
    supabase.auth.signOut().then(() => {
      onLogout();
    });
  }, [onLogout]);

  const saveApiConfig = useCallback((key: string, provider: string) => {
    setApiKey(key);
    setApiProvider(provider);
    localStorage.setItem("lexia-api-key", key);
    localStorage.setItem("lexia-api-provider", provider);
    setIsApiModalOpen(false);
    toast({
      title: "Éxito",
      description: "Configuración de API guardada",
    });
  }, [toast]);

  // Cargar configuración de API al montar
  useEffect(() => {
    const savedApiKey = localStorage.getItem("lexia-api-key");
    const savedProvider = localStorage.getItem("lexia-api-provider");
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedProvider) setApiProvider(savedProvider);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Historial de Consultas
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500"
              aria-label="Cerrar sesión"
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
            aria-label="Nueva consulta"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Consulta
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
              <h1 className="text-xl font-bold text-gray-800">
                LexIA - Asistente Jurídico
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center space-x-2"
              aria-label="Configurar API"
            >
              <Settings className="h-4 w-4" />
              <span>Configurar API</span>
            </Button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: "70vh" }}>
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Scale className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Bienvenido a LexIA</p>
              <p className="text-sm mt-2 text-center">
                Comience una nueva conversación para obtener asistencia jurídica
              </p>
              <Button 
                onClick={startNewConversation}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Comenzar Conversación
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={`${message.id}-${index}`}
                  message={{
                    role: message.role,
                    content: message.content,
                    timestamp: new Date(message.created_at),
                  }}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4 max-w-md">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <span className="ml-2 text-sm text-gray-600">LexIA está pensando...</span>
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
              placeholder="Escriba su pregunta jurídica..."
              className="flex-1"
              disabled={isLoading}
              aria-label="Escriba su pregunta jurídica"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
              aria-label="Enviar mensaje"
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