import { Message } from '../lib/Supabase';

const SYSTEM_PROMPT = `Eres LexIA, asistente jurídico especializado en Derecho español y europeo...`;

export const queryLLM = async (
  messages: Pick<Message, 'role' | 'content'>[],
  provider: 'OpenAI' | 'Gemini' = 'OpenAI'
): Promise<string> => {
  const apiKey = localStorage.getItem('LEXIA_API_KEY');
  
  if (!apiKey) throw new Error('API Key no configurada');

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages
  ];

  try {
    // Código mejorado para OpenAI
    if (provider === 'OpenAI') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo', // Mejor modelo para jurídico
          messages: fullMessages,
          temperature: 0.4,
          max_tokens: 8000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error en OpenAI API');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } 
    // Código para Gemini
    else {
      // Implementación similar mejorada
    }
  } catch (error) {
    console.error('Error en LLM:', error);
    throw new Error('Error procesando la solicitud. Verifica tu API Key');
  }
};