'use client';

import { useRouter } from 'next/navigation';
import type { Curso } from '@/types/database';

interface CursoFilterProps {
  cursos: Curso[] | null;
  cursoId?: string;
}

export default function CursoFilter({ cursos, cursoId }: CursoFilterProps) {
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
        Filtrar por Curso
      </label>
      <select
        value={cursoId || ''}
        onChange={(e) => {
          if (e.target.value) {
            router.push(`/admin/entradas?curso=${e.target.value}`);
          } else {
            router.push('/admin/entradas');
          }
        }}
        className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="">Todos los cursos</option>
        {cursos?.map((curso: Curso) => (
          <option key={curso.id} value={curso.id}>
            {curso.titulo}
          </option>
        ))}
      </select>
    </div>
  );
}
