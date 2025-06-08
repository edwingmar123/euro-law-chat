import { useCallback } from "react";

// Tipo para mensajes
interface LLMMessage {
  role: string;
  content: string;
}


export const useLlmService = (apiKey: string, apiProvider: string) => {
  console.log("⚠️ Provider actual:", apiProvider); // Para depuración

  const callLlm = useCallback(
    async (messagesForLLM: LLMMessage[]) => {
      if (!apiKey) throw new Error("API Key no configurada");

      const endpointMap: Record<string, string> = {
        openai: "https://api.openai.com/v1/chat/completions",
        gemini: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        mistral: "https://api.mistral.ai/v1/chat/completions",
        ollama: "http://localhost:11434/api/chat",
        openrouter: "https://openrouter.ai/api/v1/chat/completions",
        openchat: "https://openchat.team/api/chat",
      };

      const endpoint = endpointMap[apiProvider];
      if (!endpoint) throw new Error("Proveedor de API no soportado");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (
        apiProvider === "mistral" ||
        apiProvider === "openai" ||
        apiProvider === "openrouter"
      ) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      if (apiProvider === "openrouter") {
        headers["HTTP-Referer"] = "https://your-app-domain.com"; // Reemplaza si usas dominio real
        headers["X-Title"] = "LexIA";
      }

      

      const payloadMap: Record<string, any> = {
        openai: {
          model: "gpt-4-turbo",
          messages: messagesForLLM,
          temperature: 0.4,
          max_tokens: 8000,
        },
        gemini: {
          contents: [
            {
              parts: [
                {
                  text: messagesForLLM.map((m) => m.content).join("\n\n"),
                },
              ],
            },
          ],
        },
        mistral: {
          model: "mistral-small",
          messages: messagesForLLM,
          temperature: 0.7,
          max_tokens: 8000,
        },
        ollama: {
          model: "llama3",
          messages: messagesForLLM,
          stream: false,
        },
        openrouter: {
          model: "mistralai/mistral-7b-instruct:free",
          messages: messagesForLLM,
          temperature: 0.4,
          max_tokens: 8000,
        },
        openchat: {
          model: "openchat_3.5",
          messages: messagesForLLM,
          temperature: 0.4,
        },
      };

      const payload = payloadMap[apiProvider];

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorDetails = `Status: ${response.status}`;
          try {
            const errorBody = await response.json();
            errorDetails += ` | Body: ${JSON.stringify(errorBody)}`;
          } catch (e) {
            const errorText = await response.text();
            errorDetails += ` | Text: ${errorText.substring(0, 100)}`;
          }

          throw new Error(`API Error: ${errorDetails}`);
        }

        const data = await response.json();

        switch (apiProvider) {
          case "openai":
            return data.choices[0].message.content;
          case "gemini":
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "[Sin respuesta]";
          case "mistral":
            return data.choices[0].message.content;
          case "openrouter":
          case "ollama":
          case "openchat":
            return (
              data.choices?.[0]?.message?.content ||
              data.message?.content ||
              data.content ||
              data.output ||
              "[Respuesta no reconocida]"
            );
          default:
            return "[Proveedor no soportado]";
        }
      } catch (error: any) {
        console.error("LLM Service Error:", {
          provider: apiProvider,
          error: error.message,
          endpoint,
          payload,
        });
        throw new Error(`Error en ${apiProvider}: ${error.message}`);
      }
    },
    [apiKey, apiProvider]
  );

  return callLlm;
};
