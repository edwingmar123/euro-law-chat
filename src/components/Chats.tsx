import { useState, useEffect, useRef } from 'react';
import { supabase, Message } from '../lib/Supabase';
import { queryLLM } from '../serivice/LlmService';
import LoadingSpinner from '../lib/LoadingSpinner';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obtener usuario autenticado
  const getCurrentUser = () => {
    const session = supabase.auth.getSession();
    return session?.user || null;
  };

  // Cargar historial al iniciar
  useEffect(() => {
    const loadHistory = async () => {
      const user = getCurrentUser();
      if (!user) return;

      const history = await getMessages(user.id);
      setMessages(history);
    };

    loadHistory();
  }, []);

  // Desplazar al último mensaje
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const user = getCurrentUser();
    if (!user) {
      alert('Por favor inicia sesión primero');
      return;
    }

    setLoading(true);
    const userMessage: Omit<Message, 'id' | 'created_at'> = {
      user_id: user.id,
      role: 'user',
      content: input
    };

    // Guardar mensaje del usuario
    const savedUserMsg = await saveMessage(userMessage);
    if (savedUserMsg) {
      setMessages(prev => [...prev, savedUserMsg]);
    }

    try {
      // Obtener respuesta de la IA
      const aiResponse = await queryLLM([
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input }
      ]);

      // Guardar respuesta de la IA
      const aiMessage: Omit<Message, 'id' | 'created_at'> = {
        user_id: user.id,
        role: 'assistant',
        content: aiResponse
      };

      const savedAiMsg = await saveMessage(aiMessage);
      if (savedAiMsg) {
        setMessages(prev => [...prev, savedAiMsg]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error procesando tu consulta');
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={message ${msg.role}}>
            {msg.content}
          </div>
        ))}
        {loading && <LoadingSpinner />}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu consulta jurídica..."
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
}