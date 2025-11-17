'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function EnrollButton({
  cursoId,
  cursoTitulo,
}: {
  cursoId: string;
  cursoTitulo: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEnroll = async () => {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Verificar autenticación
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Crear inscripción
      const { error: enrollError } = await supabase.from('inscripciones').insert({
        user_id: user.id,
        curso_id: cursoId,
        estado: 'inscrito',
      });

      if (enrollError) {
        if (enrollError.code === '23505') {
          // Ya está inscrito (unique constraint violation)
          setError('Ya estás inscrito en este curso');
        } else {
          throw enrollError;
        }
      } else {
        // Refrescar página para mostrar progreso
        router.refresh();
      }
    } catch (err: any) {
      console.error('Error al inscribirse:', err);
      setError(err.message || 'Error al inscribirse al curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Inscribiendo...' : `Inscribirme a ${cursoTitulo}`}
      </button>
      {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
