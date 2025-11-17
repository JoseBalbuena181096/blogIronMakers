'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DeleteCursoButton({
  cursoId,
  cursoTitulo,
}: {
  cursoId: string;
  cursoTitulo: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.from('cursos').delete().eq('id', cursoId);

      if (error) throw error;

      router.refresh();
      setShowConfirm(false);
    } catch (err: any) {
      console.error('Error al eliminar curso:', err);
      alert(err.message || 'Error al eliminar el curso');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="inline-flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? 'Eliminando...' : '✓ Confirmar'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-sm bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
        >
          ✗ Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
    >
      🗑️ Eliminar
    </button>
  );
}
