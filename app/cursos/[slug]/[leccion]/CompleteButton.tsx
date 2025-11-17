'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function CompleteButton({
  userId,
  entradaId,
  cursoSlug,
  nextLeccionSlug,
}: {
  userId: string;
  entradaId: string;
  cursoSlug: string;
  nextLeccionSlug?: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setLoading(true);

    try {
      const supabase = createClient();

      // Marcar como completado
      const { error } = await supabase
        .from('progreso_lecciones')
        .update({
          completado: true,
          fecha_completado: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('entrada_id', entradaId);

      if (error) throw error;

      // Si hay siguiente lección, redirigir
      if (nextLeccionSlug) {
        router.push(`/cursos/${cursoSlug}/${nextLeccionSlug}`);
      } else {
        // Si es la última, volver al curso
        router.push(`/cursos/${cursoSlug}`);
      }

      router.refresh();
    } catch (err) {
      console.error('Error al completar lección:', err);
      alert('Error al marcar la lección como completada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Guardando...' : '✓ Marcar como Completada'}
    </button>
  );
}
