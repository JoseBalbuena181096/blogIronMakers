'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Opcion {
  texto: string;
  es_correcta: boolean;
}

interface Pregunta {
  id?: string;
  pregunta: string;
  opciones: Opcion[];
  orden: number;
}

export default function QuizManager({
  entradaId,
  preguntas: preguntasIniciales,
}: {
  entradaId: string;
  preguntas: any[];
}) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>(preguntasIniciales);
  const [editando, setEditando] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const router = useRouter();

  const nuevaPregunta = (): Pregunta => ({
    pregunta: '',
    opciones: [
      { texto: '', es_correcta: false },
      { texto: '', es_correcta: false },
      { texto: '', es_correcta: false },
      { texto: '', es_correcta: false },
    ],
    orden: preguntas.length,
  });

  const handleAgregarPregunta = () => {
    setPreguntas([...preguntas, nuevaPregunta()]);
    setEditando(preguntas.length);
  };

  const handleEliminarPregunta = async (index: number) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;

    const pregunta = preguntas[index];
    if (pregunta.id) {
      const supabase = createClient();
      await supabase.from('quiz_preguntas').delete().eq('id', pregunta.id);
    }

    const nuevasPreguntas = preguntas.filter((_, i) => i !== index);
    setPreguntas(nuevasPreguntas);
    router.refresh();
  };

  const handleGuardar = async (index: number) => {
    const pregunta = preguntas[index];

    // Validaciones
    if (!pregunta.pregunta.trim()) {
      alert('La pregunta no puede estar vacía');
      return;
    }

    const opcionesVacias = pregunta.opciones.filter(o => !o.texto.trim());
    if (opcionesVacias.length > 0) {
      alert('Todas las opciones deben tener texto');
      return;
    }

    const correctas = pregunta.opciones.filter(o => o.es_correcta);
    if (correctas.length !== 1) {
      alert('Debe haber exactamente una opción correcta');
      return;
    }

    setGuardando(true);

    try {
      const supabase = createClient();

      if (pregunta.id) {
        // Actualizar
        await supabase
          .from('quiz_preguntas')
          .update({
            pregunta: pregunta.pregunta,
            opciones: pregunta.opciones,
            orden: pregunta.orden,
          })
          .eq('id', pregunta.id);
      } else {
        // Crear
        const { data } = await supabase
          .from('quiz_preguntas')
          .insert({
            entrada_id: entradaId,
            pregunta: pregunta.pregunta,
            opciones: pregunta.opciones,
            orden: pregunta.orden,
          })
          .select()
          .single();

        if (data) {
          const nuevasPreguntas = [...preguntas];
          nuevasPreguntas[index] = { ...pregunta, id: data.id };
          setPreguntas(nuevasPreguntas);
        }
      }

      setEditando(null);
      router.refresh();
    } catch (error) {
      console.error('Error al guardar pregunta:', error);
      alert('Error al guardar la pregunta');
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = (index: number) => {
    const pregunta = preguntas[index];
    if (!pregunta.id) {
      // Si es nueva y se cancela, eliminarla
      setPreguntas(preguntas.filter((_, i) => i !== index));
    }
    setEditando(null);
  };

  const actualizarPregunta = (index: number, campo: string, valor: any) => {
    const nuevasPreguntas = [...preguntas];
    (nuevasPreguntas[index] as any)[campo] = valor;
    setPreguntas(nuevasPreguntas);
  };

  const actualizarOpcion = (preguntaIdx: number, opcionIdx: number, campo: keyof Opcion, valor: any) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[preguntaIdx].opciones[opcionIdx][campo] = valor;
    
    // Si se marca una como correcta, desmarcar las demás
    if (campo === 'es_correcta' && valor === true) {
      nuevasPreguntas[preguntaIdx].opciones.forEach((op, idx) => {
        if (idx !== opcionIdx) op.es_correcta = false;
      });
    }
    
    setPreguntas(nuevasPreguntas);
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>📋 Nota:</strong> Si agregas preguntas de quiz, los estudiantes deberán responderlas correctamente (100/100) para poder completar esta lección.
        </p>
      </div>

      {/* Lista de preguntas */}
      {preguntas.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No hay preguntas de quiz
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Esta lección se puede completar sin realizar un quiz
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {preguntas.map((pregunta, idx) => (
            <div
              key={pregunta.id || idx}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              {editando === idx ? (
                // Modo edición
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Pregunta {idx + 1}
                    </label>
                    <textarea
                      value={pregunta.pregunta}
                      onChange={(e) => actualizarPregunta(idx, 'pregunta', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={2}
                      placeholder="Escribe la pregunta..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Opciones (marca la correcta)
                    </label>
                    <div className="space-y-2">
                      {pregunta.opciones.map((opcion, opcionIdx) => (
                        <div key={opcionIdx} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correcta-${idx}`}
                            checked={opcion.es_correcta}
                            onChange={() => actualizarOpcion(idx, opcionIdx, 'es_correcta', true)}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            value={opcion.texto}
                            onChange={(e) => actualizarOpcion(idx, opcionIdx, 'texto', e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder={`Opción ${opcionIdx + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleGuardar(idx)}
                      disabled={guardando}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {guardando ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => handleCancelar(idx)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {idx + 1}. {pregunta.pregunta}
                      </h3>
                      <div className="space-y-2">
                        {pregunta.opciones.map((opcion, opcionIdx) => (
                          <div
                            key={opcionIdx}
                            className={`p-2 rounded ${
                              opcion.es_correcta
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-700/50'
                            }`}
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {opcion.es_correcta && '✓ '}
                              {opcion.texto}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditando(idx)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleEliminarPregunta(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botón agregar */}
      <button
        onClick={handleAgregarPregunta}
        disabled={editando !== null}
        className="w-full px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Agregar Pregunta
      </button>
    </div>
  );
}
