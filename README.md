# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/e880c8cf-0ce7-47a5-bc79-e83739053f14

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e880c8cf-0ce7-47a5-bc79-e83739053f14) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

## 📑 Tabla de contenido

- [🚀 Pasos para clonar y desplegar](#-pasos-para-clonar-y-desplegar)
- [🔄 Cambiar entre ChatGPT y Gemini](#-cambiar-entre-chatgpt--gemini y entre otras)
- [🚧 Mejoras pendientes](#-mejoras-pendientes)
- [📁 Estructura de archivos](#-estructura-de-archivos)
- [⚖️ Aspectos legales](#️-aspectos-legales)


LexIA - Asistente Jurídico Chatbot
LexIA es un chatbot especializado en derecho español y europeo que permite a los usuarios realizar consultas jurídicas con respuestas precisas y fundamentadas. El sistema integra múltiples proveedores de IA como OpenAI, Gemini y otros, con una interfaz intuitiva y gestión completa del historial de conversaciones.

🚀 Pasos para clonar y desplegar
Requisitos previos
Node.js v18+

npm v9+

Cuenta en Supabase (PostgreSQL)

Cuenta en algún proveedor de IA (OpenAI, Gemini, etc.)

Instalación
bash
# 1. Clonar el repositorio
git clone https://github.com/edwingmar123/euro-law-chat.git
cd euro-law-chat

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus credenciales
VITE_SUPABASE_URL="https://tus-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="tu-key-anon"
Configuración de Supabase
Crear proyecto en supabase.com

Ejecutar el script SQL de inicialización:

sql
-- Tabla de mensajes
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  conversation_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


--
# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Desplegar (ejemplo para Vercel)
vercel deploy
🔄 Cambiar entre ChatGPT y Gemini
Haz clic en el botón "Configurar API" en la esquina superior derecha

Selecciona el proveedor deseado en el dropdown "Provider":

OpenAI: ChatGPT (GPT-3.5/4)

Gemini: Google Gemini

Mistral: Mistral AI

Ollama: Para ejecución local

Ingresa tu API Key correspondiente

Haz clic en "Guardar"

https://api-config-example.png

Configuración manual
Puedes editar directamente en localStorage:

javascript
// En la consola del navegador
localStorage.setItem("lexia-api-provider", "gemini");
localStorage.setItem("lexia-api-key", "tu_api_key_de_gemini");
🚧 Mejoras pendientes
Prioridad Alta
Implementar streaming de respuestas
Mostrar respuestas parciales mientras se generan en lugar de esperar la respuesta completa

Soporte para documentos PDF
Permitir cargar documentos legales para análisis y consultas

Citas legales automáticas
Mejorar el sistema de referencias a leyes y jurisprudencia

Prioridad Media
Búsqueda en historial
Implementar sistema de búsqueda en conversaciones pasadas

Exportación de consultas
Añadir opción para exportar conversaciones en formato PDF o Word

Sistema de plantillas
Crear plantillas para tipos de consultas recurrentes (contratos, demandas, etc.)

Prioridad Baja
Multi-idioma
Añadir soporte para inglés, francés y alemán

Comparativa legislativa
Funcionalidad para comparar legislación entre países UE

Integración con bases de datos legales
Conexión con BOE, bases de jurisprudencia del TJUE

📁 Estructura de archivos
text
src/
├── components/
│   ├── ApiConfigModal.tsx
│   ├── ChatInterface.tsx
│   ├── ConversationHistory.tsx
│   ├── MessageBubble.tsx
│   └── LlmService.tsx
├── lib/
│   ├── Supabase.ts
│   └── LoadingSpinner.tsx
├── App.tsx
└── main.tsx
⚖️ Aspectos legales
LexIA es una herramienta de asistencia jurídica, mas no reemplaza el consejo de un abogado profesional. Las respuestas generadas deben verificarse siempre con fuentes oficiales y profesionales del derecho.