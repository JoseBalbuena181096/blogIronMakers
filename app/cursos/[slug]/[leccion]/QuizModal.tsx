'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Opcion {
  texto: string;
  es_correcta: boolean;
}

interface Pregunta {
  id: string;
  pregunta: string;
  opciones: Opcion[];
  orden: number;
}

interface QuizModalProps {
  entradaId: string;
  onQuizComplete: (passed: boolean) => void;
  onClose: () => void;
}

export default function QuizModal({ entradaId, onQuizComplete, onClose }: QuizModalProps) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState<{ puntuacion: number; aprobado: boolean } | null>(null);

  useEffect(() => {
    cargarPreguntas();
  }, [entradaId]);

  const cargarPreguntas = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('quiz_preguntas')
      .select('*')
      .eq('entrada_id', entradaId)
      .order('orden');

    if (!error && data) {
      setPreguntas(data);
    }
    setLoading(false);
  };

  const handleSelectOpcion = (preguntaId: string, opcionIndex: number) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: opcionIndex
    }));
  };

  const handleSubmit = async () => {
    // Verificar que todas las preguntas estén respondidas
    if (Object.keys(respuestas).length !== preguntas.length) {
      alert('Por favor responde todas las preguntas antes de enviar');
      return;
    }

    setSubmitting(true);

    // Calcular puntuación
    let correctas = 0;
    preguntas.forEach(pregunta => {
      const respuestaSeleccionada = respuestas[pregunta.id];
      if (pregunta.opciones[respuestaSeleccionada]?.es_correcta) {
        correctas++;
      }
    });

    const puntuacion = Math.round((correctas / preguntas.length) * 100);
    const aprobado = puntuacion === 100;

    // Guardar intento en la base de datos
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('quiz_intentos').insert({
        user_id: user.id,
        entrada_id: entradaId,
        puntuacion,
        respuestas
      });
    }

    setResultado({ puntuacion, aprobado });
    setSubmitting(false);

    // Esperar 2 segundos antes de cerrar
    setTimeout(() => {
      onQuizComplete(aprobado);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (preguntas.length === 0) {
    // No hay quiz, permitir marcar como completado directamente
    onQuizComplete(true);
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full my-8">
        {resultado ? (
          // Mostrar resultado
          <div className="text-center">
            <div className={`text-6xl mb-4 ${resultado.aprobado ? '🎉' : '😔'}`}>
              {resultado.aprobado ? '🎉' : '😔'}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              resultado.aprobado ? 'text-green-600' : 'text-red-600'
            }`}>
              {resultado.aprobado ? '¡Felicitaciones!' : 'No aprobaste'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Obtuviste {resultado.puntuacion}/100
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {resultado.aprobado 
                ? 'Has completado esta lección exitosamente'
                : 'Necesitas 100/100 para completar esta lección. Inténtalo nuevamente.'
              }
            </p>
          </div>
        ) : (
          // Mostrar quiz
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quiz de Evaluación
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Responde todas las preguntas correctamente (100/100) para completar esta lección.
            </p>

            <div className="space-y-6">
              {preguntas.map((pregunta, idx) => (
                <div key={pregunta.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {idx + 1}. {pregunta.pregunta}
                  </h4>
                  <div className="space-y-2">
                    {pregunta.opciones.map((opcion, opcionIdx) => (
                      <label
                        key={opcionIdx}
                        className={`flex items-start p-3 rounded-lg cursor-pointer transition ${
                          respuestas[pregunta.id] === opcionIdx
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-600'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`pregunta-${pregunta.id}`}
                          checked={respuestas[pregunta.id] === opcionIdx}
                          onChange={() => handleSelectOpcion(pregunta.id, opcionIdx)}
                          className="mt-1 mr-3"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          {opcion.texto}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(respuestas).length !== preguntas.length}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Evaluando...' : 'Enviar Respuestas'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
