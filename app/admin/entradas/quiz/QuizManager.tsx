'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface Opcion {
  texto: string;
  es_correcta: boolean;
}

interface Pregunta {
  id?: string;
  pregunta: string;
  tipo: 'multiple' | 'verdadero_falso' | 'abierta';
  opciones: Opcion[];
  criterios_evaluacion?: string;
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
  const [calificacionMinima, setCalificacionMinima] = useState(100);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    const { data } = await supabase
      .from('entradas')
      .select('calificacion_minima')
      .eq('id', entradaId)
      .single();

    if (data) {
      setCalificacionMinima(data.calificacion_minima || 100);
    }
  };

  const guardarConfiguracion = async () => {
    await supabase
      .from('entradas')
      .update({ calificacion_minima: calificacionMinima })
      .eq('id', entradaId);
    alert('Configuración guardada');
  };

  const nuevaPregunta = (): Pregunta => ({
    pregunta: '',
    tipo: 'multiple',
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

    if (pregunta.tipo === 'multiple') {
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
    } else if (pregunta.tipo === 'verdadero_falso') {
      const correctas = pregunta.opciones.filter(o => o.es_correcta);
      if (correctas.length !== 1) {
        alert('Selecciona si es Verdadero o Falso');
        return;
      }
    } else if (pregunta.tipo === 'abierta') {
      if (!pregunta.criterios_evaluacion?.trim()) {
        alert('Debes definir los criterios de evaluación para la IA');
        return;
      }
    }

    setGuardando(true);

    try {
      const datosPregunta = {
        entrada_id: entradaId,
        pregunta: pregunta.pregunta,
        tipo: pregunta.tipo,
        opciones: pregunta.tipo === 'abierta' ? [] : pregunta.opciones,
        criterios_evaluacion: pregunta.tipo === 'abierta' ? pregunta.criterios_evaluacion : null,
        orden: pregunta.orden,
      };

      if (pregunta.id) {
        await supabase
          .from('quiz_preguntas')
          .update(datosPregunta)
          .eq('id', pregunta.id);
      } else {
        const { data } = await supabase
          .from('quiz_preguntas')
          .insert(datosPregunta)
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
      setPreguntas(preguntas.filter((_, i) => i !== index));
    }
    setEditando(null);
  };

  const actualizarPregunta = (index: number, campo: string, valor: any) => {
    const nuevasPreguntas = [...preguntas];
    (nuevasPreguntas[index] as any)[campo] = valor;

    // Resetear opciones al cambiar tipo
    if (campo === 'tipo') {
      if (valor === 'multiple') {
        nuevasPreguntas[index].opciones = [
          { texto: '', es_correcta: false },
          { texto: '', es_correcta: false },
          { texto: '', es_correcta: false },
          { texto: '', es_correcta: false },
        ];
      } else if (valor === 'verdadero_falso') {
        nuevasPreguntas[index].opciones = [
          { texto: 'Verdadero', es_correcta: false },
          { texto: 'Falso', es_correcta: false },
        ];
      } else {
        nuevasPreguntas[index].opciones = [];
      }
    }

    setPreguntas(nuevasPreguntas);
  };

  const actualizarOpcion = (preguntaIdx: number, opcionIdx: number, campo: keyof Opcion, valor: string | boolean) => {
    const nuevasPreguntas = [...preguntas];
    if (campo === 'texto') {
      nuevasPreguntas[preguntaIdx].opciones[opcionIdx].texto = valor as string;
    } else if (campo === 'es_correcta') {
      nuevasPreguntas[preguntaIdx].opciones[opcionIdx].es_correcta = valor as boolean;
      if (valor === true) {
        nuevasPreguntas[preguntaIdx].opciones.forEach((op, idx) => {
          if (idx !== opcionIdx) op.es_correcta = false;
        });
      }
    }
    setPreguntas(nuevasPreguntas);
  };

  return (
    <div className="space-y-6">
      {/* Configuración General */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Configuración del Quiz</h3>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Calificación Mínima para Aprobar (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={calificacionMinima}
              onChange={(e) => setCalificacionMinima(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={guardarConfiguracion}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Guardar Configuración
          </button>
        </div>
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-4">
        {preguntas.map((pregunta, idx) => (
          <div
            key={pregunta.id || idx}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            {editando === idx ? (
              // Modo edición
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
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
                      Tipo de Pregunta
                    </label>
                    <select
                      value={pregunta.tipo}
                      onChange={(e) => actualizarPregunta(idx, 'tipo', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="multiple">Opción Múltiple</option>
                      <option value="verdadero_falso">Verdadero / Falso</option>
                      <option value="abierta">Abierta (Evaluada por IA)</option>
                    </select>
                  </div>
                </div>

                {pregunta.tipo === 'abierta' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Criterios de Evaluación para la IA
                    </label>
                    <textarea
                      value={pregunta.criterios_evaluacion || ''}
                      onChange={(e) => actualizarPregunta(idx, 'criterios_evaluacion', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Describe qué debe contener la respuesta para ser considerada correcta..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Estos criterios no serán visibles para el estudiante, solo para la IA evaluadora.
                    </p>
                  </div>
                ) : (
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
                            readOnly={pregunta.tipo === 'verdadero_falso'} // V/F text is fixed
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleGuardar(idx)}
                    disabled={guardando}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {guardando ? 'Guardando...' : 'Guardar Pregunta'}
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
                  <div className="flex-1 w-full min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 uppercase flex-shrink-0">
                        {pregunta.tipo === 'multiple' ? 'Opción Múltiple' :
                          pregunta.tipo === 'verdadero_falso' ? 'Verdadero/Falso' : 'Abierta (IA)'}
                      </span>
                      <div className="font-semibold text-gray-900 dark:text-white flex-1">
                        <span className="mr-2">{idx + 1}.</span>
                        <div className="inline-block w-full align-top">
                          <MarkdownRenderer content={pregunta.pregunta} preserveWhitespace={true} />
                        </div>
                      </div>
                    </div>

                    {pregunta.tipo === 'abierta' ? (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Criterios de Evaluación:</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">{pregunta.criterios_evaluacion}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {pregunta.opciones.map((opcion, opcionIdx) => (
                          <div
                            key={opcionIdx}
                            className={`p-2 rounded ${opcion.es_correcta
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
                    )}
                  </div>
                  <div className="flex gap-2 ml-4 flex-shrink-0">
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
