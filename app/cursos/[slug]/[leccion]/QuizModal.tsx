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

interface DetalleResultado {
  preguntaId: string;
  preguntaTexto: string;
  tipo: string;
  esCorrecta: boolean;
  puntuacion: number;
  respuestaUsuario: string;
  respuestaCorrecta?: string;
  feedback?: string;
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
  const [resultado, setResultado] = useState<{
    puntuacion: number;
    aprobado: boolean;
    detalles: DetalleResultado[]
  } | null>(null);
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
    if (Object.keys(respuestas).length !== preguntas.length) {
      alert('Por favor responde todas las preguntas antes de enviar');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      let puntuacionTotal = 0;
      const detalles: DetalleResultado[] = [];

      for (const pregunta of preguntas) {
        const respuestaUsuario = respuestas[pregunta.id];
        let puntosPregunta = 0;
        let esCorrecta = false;
        let feedback = "";
        let respuestaCorrectaTexto = "";
        let respuestaUsuarioTexto = "";

        if (pregunta.tipo === 'abierta') {
          respuestaUsuarioTexto = respuestaUsuario as string;
          try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-python-ia-production.up.railway.app';
            const response = await fetch(`${BACKEND_URL}/api/v1/evaluate-quiz`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question: pregunta.pregunta,
                user_answer: respuestaUsuario as string,
                criteria: pregunta.criterios_evaluacion
              })
            });

            if (response.ok) {
              const data = await response.json();
              puntosPregunta = data.score;
              feedback = data.feedback;
              // Consideramos correcta si tiene más de 60 puntos (o configurable)
              esCorrecta = puntosPregunta >= 60;
            }
          } catch (e) {
            console.error('Error IA:', e);
          }
        } else {
          // Multiple o V/F
          const indice = respuestaUsuario as number;
          const opcionSeleccionada = pregunta.opciones[indice];
          const opcionCorrecta = pregunta.opciones.find(o => o.es_correcta);

          respuestaUsuarioTexto = opcionSeleccionada?.texto || "";
          respuestaCorrectaTexto = opcionCorrecta?.texto || "";

          if (opcionSeleccionada?.es_correcta) {
            puntosPregunta = 100;
            esCorrecta = true;
          }
        }

        puntuacionTotal += puntosPregunta;
        detalles.push({
          preguntaId: pregunta.id,
          preguntaTexto: pregunta.pregunta,
          tipo: pregunta.tipo,
          esCorrecta,
          puntuacion: puntosPregunta,
          respuestaUsuario: respuestaUsuarioTexto,
          respuestaCorrecta: respuestaCorrectaTexto,
          feedback
        });
      }

      const puntuacionFinal = Math.round(puntuacionTotal / preguntas.length);
      const aprobado = puntuacionFinal >= calificacionMinima;

      // Guardar intento
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('quiz_intentos').insert({
          user_id: user.id,
          entrada_id: entradaId,
          puntuacion: puntuacionFinal,
          respuestas: respuestas as any
        });
      }

      setResultado({ puntuacion: puntuacionFinal, aprobado, detalles });

    } catch (error) {
      console.error('Error en submit:', error);
      alert('Error al evaluar el quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizar = () => {
    if (resultado?.aprobado) {
      onQuizComplete(true);
    } else {
      onClose(); // O simplemente cerrar si no aprobó y quiere salir
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (preguntas.length === 0) {
    onQuizComplete(true);
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4 pt-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full my-8 shadow-xl">
        {resultado ? (
          // VISTA DE RESULTADOS DETALLADOS
          <div className="space-y-6">
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className={`text-6xl mb-4 ${resultado.aprobado ? 'animate-bounce' : ''}`}>
                {resultado.aprobado ? '🎉' : '🤔'}
              </div>
              <h3 className={`text-3xl font-bold mb-2 ${resultado.aprobado ? 'text-green-600' : 'text-orange-600'}`}>
                {resultado.aprobado ? '¡Aprobado!' : 'Inténtalo de nuevo'}
              </h3>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                Calificación Final: <span className={`font-bold ${resultado.aprobado ? 'text-green-600' : 'text-red-600'}`}>{resultado.puntuacion}/100</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Mínimo para aprobar: {calificacionMinima}/100
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-lg text-gray-900 dark:text-white">Desglose de Resultados:</h4>
              {resultado.detalles.map((detalle, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${detalle.esCorrecta ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' : 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 min-w-[24px] ${detalle.esCorrecta ? 'text-green-600' : 'text-red-600'}`}>
                      {detalle.esCorrecta ? '✅' : '❌'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">
                        {idx + 1}. {detalle.preguntaTexto}
                      </p>

                      <div className="text-sm space-y-1">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Tu respuesta:</span> {detalle.respuestaUsuario}
                        </p>

                        {!detalle.esCorrecta && detalle.tipo !== 'abierta' && (
                          <p className="text-green-700 dark:text-green-400">
                            <span className="font-medium">Respuesta correcta:</span> {detalle.respuestaCorrecta}
                          </p>
                        )}

                        {detalle.tipo === 'abierta' && (
                          <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Evaluación IA ({detalle.puntuacion}/100)</p>
                            <p className="text-gray-600 dark:text-gray-400 italic">"{detalle.feedback}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
              {!resultado.aprobado ? (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setResultado(null);
                      setRespuestas({});
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Intentar de nuevo
                  </button>
                </>
              ) : (
                <button
                  onClick={handleFinalizar}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-lg shadow-lg"
                >
                  Finalizar y Continuar 🚀
                </button>
              )}
            </div>
          </div>
        ) : (
          // VISTA DEL QUIZ (PREGUNTAS)
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Evaluación
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
