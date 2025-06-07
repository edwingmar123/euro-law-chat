import { useCallback } from 'react';

export const llmService = (apiKey: string, apiProvider: string) =>
  useCallback(async (messagesForLLM: { role: string; content: string }[]) => {
    if (!apiKey) throw new Error('API Key no configurada');

    let endpoint = '';
    let payload: any;
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };

    switch (apiProvider) {
      case 'openai':
        endpoint = 'https://api.openai.com/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        payload = {
          model: 'gpt-4-turbo',
          messages: messagesForLLM,
          temperature: 0.4,
          max_tokens: 8000,
        };
        break;

      case 'gemini':
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        payload = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: messagesForLLM.map(m => `${m.role}: ${m.content}`).join('\n'),
                },
              ],
            },
          ],
        };
        break;

      case 'mistral':
        endpoint = 'https://api.mistral.ai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        payload = {
          model: 'mistral-tiny',
          messages: messagesForLLM,
          temperature: 0.7,
        };
        break;

      case 'ollama':
        endpoint = 'http://localhost:11434/api/chat';
        payload = {
          model: 'llama3',
          messages: messagesForLLM,
          stream: false,
        };
        break;

      case 'openrouter':
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        payload = {
          model: 'mistralai/mistral-7b-instruct',
          messages: messagesForLLM,
        };
        break;

      case 'openchat':
        endpoint = 'https://openchat.team/api/chat'; // confirmar endpoint real
        payload = { messages: messagesForLLM };
        break;

      default:
        throw new Error('Proveedor de API no soportado');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Respuesta adecuada por proveedor
    switch (apiProvider) {
      case 'openai':
        return data.choices[0].message.content;
      case 'gemini':
        return data.candidates[0].content.parts[0].text;
      case 'mistral':
      case 'openrouter':
      case 'ollama':
      case 'openchat':
        return data.choices?.[0]?.message?.content || data.message?.content || '[Sin respuesta]';
      default:
        return '[Proveedor no soportado]';
    }
  }, [apiKey, apiProvider]);
