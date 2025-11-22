'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function UserProgress({ userId }: { userId: string }) {
    const [progreso, setProgreso] = useState<any[]>([]);
    const [intentosQuiz, setIntentosQuiz] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        cargarDatos();
    }, [userId]);

    const cargarDatos = async () => {
        const supabase = createClient();

        // Cargar progreso de lecciones
        const { data: progresoData } = await supabase
            .from('progreso_lecciones')
            .select('*, entradas(titulo, curso_id, cursos(titulo))')
            .eq('user_id', userId)
            .eq('completado', true);

        // Cargar intentos de quiz
        const { data: quizData } = await supabase
            .from('quiz_intentos')
            .select('*, entradas(titulo)')
            .eq('user_id', userId)
            .order('fecha_intento', { ascending: false });

        if (progresoData) setProgreso(progresoData);
        if (quizData) setIntentosQuiz(quizData);
        setLoading(false);
    };

    const handleResetLeccion = async (entradaId: string) => {
        if (!confirm('¿Resetear el progreso de esta lección? El usuario tendrá que completarla de nuevo.')) return;
        setProcessing(true);
        const supabase = createClient();

        try {
            // Borrar progreso
            await supabase
                .from('progreso_lecciones')
                .delete()
                .eq('user_id', userId)
                .eq('entrada_id', entradaId);

            // Borrar intentos de quiz asociados
            await supabase
                .from('quiz_intentos')
                .delete()
                .eq('user_id', userId)
                .eq('entrada_id', entradaId);

            await cargarDatos();
            alert('Progreso de lección reseteado.');
        } catch (error) {
            console.error(error);
            alert('Error al resetear lección');
        } finally {
            setProcessing(false);
        }
    };

    const handleResetCurso = async (cursoId: string) => {
        if (!confirm('¿Resetear TODO el progreso de este curso? Se borrarán todas las lecciones completadas y quizes.')) return;
        setProcessing(true);
        const supabase = createClient();

        try {
            // Obtener entradas del curso
            const { data: entradas } = await supabase
                .from('entradas')
                .select('id')
                .eq('curso_id', cursoId);

            const entradaIds = entradas?.map(e => e.id) || [];

            if (entradaIds.length > 0) {
                // Borrar progreso
                await supabase
                    .from('progreso_lecciones')
                    .delete()
                    .eq('user_id', userId)
                    .in('entrada_id', entradaIds);

                // Borrar intentos de quiz
                await supabase
                    .from('quiz_intentos')
                    .delete()
                    .eq('user_id', userId)
                    .in('entrada_id', entradaIds);
            }

            // Resetear inscripción a 'inscrito' si estaba 'completado'
            await supabase
                .from('inscripciones')
                .update({ estado: 'inscrito', fecha_completado: null })
                .eq('user_id', userId)
                .eq('curso_id', cursoId);

            await cargarDatos();
            alert('Curso reseteado completamente.');
        } catch (error) {
            console.error(error);
            alert('Error al resetear curso');
        } finally {
            setProcessing(false);
        }
    };

    // Agrupar progreso por curso
    const progresoPorCurso = progreso.reduce((acc: any, curr) => {
        const cursoTitulo = curr.entradas?.cursos?.titulo || 'Sin Curso';
        const cursoId = curr.entradas?.curso_id;
        if (!acc[cursoTitulo]) {
            acc[cursoTitulo] = { id: cursoId, lecciones: [] };
        }
        acc[cursoTitulo].lecciones.push(curr);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            {/* Progreso de Cursos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Progreso por Curso
                </h3>

                {loading ? (
                    <p>Cargando...</p>
                ) : Object.keys(progresoPorCurso).length === 0 ? (
                    <p className="text-gray-500 italic">No hay progreso registrado.</p>
                ) : (
                    Object.entries(progresoPorCurso).map(([titulo, data]: [string, any]) => (
                        <div key={titulo} className="mb-6 last:mb-0 border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400">{titulo}</h4>
                                <button
                                    onClick={() => handleResetCurso(data.id)}
                                    disabled={processing}
                                    className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition"
                                >
                                    Resetear Curso Completo
                                </button>
                            </div>

                            <div className="space-y-2">
                                {data.lecciones.map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                        <span className="text-gray-700 dark:text-gray-300">
                                            ✅ {p.entradas?.titulo}
                                        </span>
                                        <button
                                            onClick={() => handleResetLeccion(p.entrada_id)}
                                            disabled={processing}
                                            className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                            Resetear Lección
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Historial de Quizes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Historial de Quizes
                </h3>

                {intentosQuiz.length === 0 ? (
                    <p className="text-gray-500 italic">No hay intentos de quiz registrados.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b dark:border-gray-700">
                                    <th className="pb-2">Lección</th>
                                    <th className="pb-2">Puntuación</th>
                                    <th className="pb-2">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {intentosQuiz.map((intento) => (
                                    <tr key={intento.id} className="border-b dark:border-gray-700 last:border-0">
                                        <td className="py-3 text-gray-900 dark:text-white">
                                            {intento.entradas?.titulo}
                                        </td>
                                        <td className="py-3">
                                            <span className={`font-bold ${intento.puntuacion >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                                                {intento.puntuacion}/100
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-500">
                                            {new Date(intento.fecha_intento).toLocaleDateString()} {new Date(intento.fecha_intento).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
