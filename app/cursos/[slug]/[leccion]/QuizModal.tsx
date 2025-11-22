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
  tipo: 'multiple' | 'verdadero_falso' | 'abierta';
  opciones: Opcion[];
  criterios_evaluacion?: string;
  orden: number;
}

interface QuizModalProps {
  entradaId: string;
  onQuizComplete: (passed: boolean) => void;
  onClose: () => void;
}

export default function QuizModal({ entradaId, onQuizComplete, onClose }: QuizModalProps) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  // Respuestas ahora pueden ser número (índice) o string (texto abierta)
  const [respuestas, setRespuestas] = useState<Record<string, number | string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultado, setResultado] = useState<{ puntuacion: number; aprobado: boolean; feedback?: string } | null>(null);
  const [calificacionMinima, setCalificacionMinima] = useState(100);

  useEffect(() => {
    cargarDatos();
  }, [entradaId]);

  const cargarDatos = async () => {
    const supabase = createClient();

    // Cargar preguntas
    const { data: preguntasData } = await supabase
      .from('quiz_preguntas')
      .select('*')
      .eq('entrada_id', entradaId)
      .order('orden');

    // Cargar configuración de entrada (nota mínima)
    const { data: entradaData } = await supabase
      .from('entradas')
      .select('calificacion_minima')
      .eq('id', entradaId)
      .single();

    if (preguntasData) {
      setPreguntas(preguntasData);
    }
    if (entradaData) {
      setCalificacionMinima(entradaData.calificacion_minima || 100);
    }

    setLoading(false);
  };

  const handleSelectOpcion = (preguntaId: string, valor: number | string) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));
  };

  const handleSubmit = async () => {
    // Verificar que todas las preguntas estén respondidas
    if (Object.keys(respuestas).length !== preguntas.length) {
      alert('Por favor responde todas las preguntas antes de enviar');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      let puntuacionTotal = 0;
      let feedbackGeneral = "";

      // Evaluar cada pregunta
      for (const pregunta of preguntas) {
        const respuestaUsuario = respuestas[pregunta.id];

        if (pregunta.tipo === 'abierta') {
          // Evaluar con IA
          try {
            // Usar fetch directo al endpoint de backend
            // Nota: Asumimos que el endpoint está en la misma URL base o configurada
            // En este entorno, el backend corre en otro puerto, así que usamos la URL completa o proxy
            // Para simplificar, usaremos la Edge Function 'chat-proxy' si existiera una para esto, 
            // o llamamos directamente al backend si es posible desde el cliente (CORS).
            // Dado que 'chat-proxy' existe, lo ideal sería crear una 'quiz-proxy' o usar la URL directa si CORS lo permite.
            // Vamos a intentar llamar al backend directamente asumiendo que CORS está configurado, 
            // si no, usaremos una Edge Function existente como proxy genérico o fallaremos.

            // IMPORTANTE: En el plan original no creamos una Edge Function nueva.
            // Asumiremos que el backend permite CORS o usamos el proxy existente modificándolo.
            // Como no modificamos el proxy, intentaremos fetch directo al backend.
            // Si falla por CORS, el usuario tendrá que configurar el proxy.

            // URL del backend (hardcoded o env var)
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-python-ia-production.up.railway.app';

            const response = await fetch(`${BACKEND_URL}/api/v1/evaluate-quiz`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                question: pregunta.pregunta,
                user_answer: respuestaUsuario as string,
                criteria: pregunta.criterios_evaluacion
              })
            });

            if (response.ok) {
              const data = await response.json();
              puntuacionTotal += data.score;
              if (data.feedback) feedbackGeneral += `P${pregunta.orden + 1}: ${data.feedback}\n`;
            } else {
              console.error('Error evaluando pregunta abierta');
              // Fallback: dar 0 o marcar error
            }
          } catch (e) {
            console.error('Error conectando con IA:', e);
          }
        } else {
          // Evaluar localmente (multiple o V/F)
          const indiceSeleccionado = respuestaUsuario as number;
          if (pregunta.opciones[indiceSeleccionado]?.es_correcta) {
            puntuacionTotal += 100; // 100 puntos por pregunta correcta
          }
        }
      }

      // Promediar puntuación
      const puntuacionFinal = Math.round(puntuacionTotal / preguntas.length);
      const aprobado = puntuacionFinal >= calificacionMinima;

      // Guardar intento
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('quiz_intentos').insert({
          user_id: user.id,
          entrada_id: entradaId,
          puntuacion: puntuacionFinal,
          respuestas: respuestas as any // Cast simple para JSONB
        });
      }

      setResultado({ puntuacion: puntuacionFinal, aprobado, feedback: feedbackGeneral });

      if (aprobado) {
        setTimeout(() => {
          onQuizComplete(true);
        }, 3000);
      }
    } catch (error) {
      console.error('Error en submit:', error);
      alert('Ocurrió un error al evaluar el quiz');
    } finally {
      setSubmitting(false);
    }
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
            <h3 className={`text-2xl font-bold mb-2 ${resultado.aprobado ? 'text-green-600' : 'text-red-600'
              }`}>
              {resultado.aprobado ? '¡Aprobado!' : 'No aprobado'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
              Tu calificación: <span className="font-bold">{resultado.puntuacion}/100</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {resultado.aprobado
                ? 'Has completado esta lección exitosamente.'
                : `Necesitas ${calificacionMinima}/100 para aprobar. Inténtalo nuevamente.`
              }
            </p>

            {resultado.feedback && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-left mb-6">
                <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Feedback de IA:</h4>
                <pre className="whitespace-pre-wrap text-sm text-blue-700 dark:text-blue-300 font-sans">
                  {resultado.feedback}
                </pre>
              </div>
            )}

            {!resultado.aprobado && (
              <button
                onClick={() => {
                  setResultado(null);
                  setRespuestas({});
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Intentar de nuevo
              </button>
            )}
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
              Responde las preguntas para completar la lección. Calificación mínima: <strong>{calificacionMinima}/100</strong>.
            </p>

            <div className="space-y-8">
              {preguntas.map((pregunta, idx) => (
                <div key={pregunta.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
                    {idx + 1}. {pregunta.pregunta}
                  </h4>

                  {pregunta.tipo === 'abierta' ? (
                    <textarea
                      value={(respuestas[pregunta.id] as string) || ''}
                      onChange={(e) => handleSelectOpcion(pregunta.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white min-h-[100px]"
                      placeholder="Escribe tu respuesta aquí..."
                    />
                  ) : (
                    <div className="space-y-3">
                      {pregunta.opciones.map((opcion, opcionIdx) => (
                        <label
                          key={opcionIdx}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition border-2 ${respuestas[pregunta.id] === opcionIdx
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600'
                              : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                          <input
                            type="radio"
                            name={`pregunta-${pregunta.id}`}
                            checked={respuestas[pregunta.id] === opcionIdx}
                            onChange={() => handleSelectOpcion(pregunta.id, opcionIdx)}
                            className="w-5 h-5 text-blue-600 mr-3"
                          />
                          <span className="text-gray-700 dark:text-gray-300 text-lg">
                            {opcion.texto}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(respuestas).length !== preguntas.length}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
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
