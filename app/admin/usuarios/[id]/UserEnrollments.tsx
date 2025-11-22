'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UserEnrollments({ userId, cursos }: { userId: string, cursos: any[] }) {
    const [inscripciones, setInscripciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCurso, setSelectedCurso] = useState('');
    const [processing, setProcessing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        cargarInscripciones();
    }, [userId]);

    const cargarInscripciones = async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from('inscripciones')
            .select('*, cursos(titulo)')
            .eq('user_id', userId);

        if (data) setInscripciones(data);
        setLoading(false);
    };

    const handleInscribir = async () => {
        if (!selectedCurso) return;
        setProcessing(true);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('inscripciones')
                .insert({
                    user_id: userId,
                    curso_id: selectedCurso,
                    estado: 'inscrito'
                });

            if (error) throw error;

            await cargarInscripciones();
            setSelectedCurso('');
            alert('Usuario inscrito correctamente');
            router.refresh();
        } catch (error: any) {
            if (error.code === '23505') { // Unique violation
                alert('El usuario ya está inscrito en este curso');
            } else {
                console.error('Error enrolling:', error);
                alert('Error al inscribir usuario');
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleDesinscribir = async (inscripcionId: string) => {
        if (!confirm('¿Estás seguro de desinscribir al usuario de este curso? Se perderá el progreso asociado.')) return;

        setProcessing(true);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('inscripciones')
                .delete()
                .eq('id', inscripcionId);

            if (error) throw error;

            await cargarInscripciones();
            alert('Usuario desinscrito correctamente');
            router.refresh();
        } catch (error) {
            console.error('Error unenrolling:', error);
            alert('Error al desinscribir usuario');
        } finally {
            setProcessing(false);
        }
    };

    // Filtrar cursos en los que NO está inscrito para el selector
    const cursosDisponibles = cursos.filter(c => !inscripciones.some(i => i.curso_id === c.id));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Inscripciones
            </h3>

            {/* Lista de Inscripciones */}
            <div className="space-y-4 mb-8">
                {loading ? (
                    <p className="text-gray-500">Cargando...</p>
                ) : inscripciones.length === 0 ? (
                    <p className="text-gray-500 italic">El usuario no está inscrito en ningún curso.</p>
                ) : (
                    inscripciones.map((inscripcion) => (
                        <div key={inscripcion.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {inscripcion.cursos?.titulo}
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Estado: <span className="capitalize">{inscripcion.estado}</span> • Inscrito: {new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDesinscribir(inscripcion.id)}
                                disabled={processing}
                                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                                Desinscribir
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Formulario de Inscripción */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                    Inscribir en nuevo curso
                </h4>
                <div className="flex gap-2">
                    <select
                        value={selectedCurso}
                        onChange={(e) => setSelectedCurso(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Seleccionar curso...</option>
                        {cursosDisponibles.map(curso => (
                            <option key={curso.id} value={curso.id}>
                                {curso.titulo}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleInscribir}
                        disabled={!selectedCurso || processing}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                        Inscribir
                    </button>
                </div>
            </div>
        </div>
    );
}
