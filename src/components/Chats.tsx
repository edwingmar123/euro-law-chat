import { Button } from "@/components/ui/button";
import { Scale, LogIn } from "lucide-react";
import ConversationHistory from "./ConversationHistory";
import MessageBubble from "./MessageBubble";
import { useNavigate } from "react-router-dom";

const Chats = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/authscreen");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-[30%] bg-white border-r border-gray-200 flex flex-col justify-between">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Scale className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Acceso al Historial
            </h2>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Para ver tu historial de consultas jurídicas, por favor inicia
            sesión o crea una cuenta.
          </p>
        </div>

        <div className="p-4">
          <Button
            onClick={handleLoginRedirect}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Iniciar Sesión
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <Scale className="h-16 w-16 text-blue-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          LexIA - Asistente Jurídico
        </h1>
        <p className="text-gray-600 max-w-xl">
          Asistente legal especializado en Derecho español y europeo. Para
          acceder a nuestros servicios completos, inicia sesión o crea una
          cuenta.
        </p>
        <Button
          onClick={handleLoginRedirect}
          className="mt-6 bg-blue-600 hover:bg-blue-700"
        >
          Iniciar Sesión
        </Button>
      </div>
    </div>
  );
};

export default Chats;
