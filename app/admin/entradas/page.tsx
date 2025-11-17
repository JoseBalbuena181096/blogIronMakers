import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Entrada, Curso } from '@/types/database';

export const metadata = {
  title: 'Gestionar Lecciones - Admin',
  description: 'Administra las lecciones de los cursos',
};

export default async function AdminEntradasPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string }>;
}) {
  const { curso: cursoId } = await searchParams;
  const profile = await getUserProfile();

  if (!profile || profile.rol !== 'admin') {
    redirect('/');
  }

  const supabase = await createClient();

  // Obtener todos los cursos
  const { data: cursos } = await supabase
    .from('cursos')
    .select('*')
    .order('orden');

  // Obtener entradas filtradas por curso si se especifica
  let entradasQuery = supabase
    .from('entradas')
    .select(`
      *,
      cursos:curso_id (titulo)
    `)
    .order('orden_en_curso');

  if (cursoId) {
    entradasQuery = entradasQuery.eq('curso_id', cursoId);
  }

  const { data: entradas } = await entradasQuery;

  const cursoSeleccionado = cursoId
    ? cursos?.find((c: Curso) => c.id === cursoId)
    : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Gestionar Lecciones
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Administra el contenido de las lecciones
              </p>
            </div>
            {cursoId && (
              <Link
                href={`/admin/entradas/nuevo?curso=${cursoId}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                + Nueva Lección
              </Link>
            )}
          </div>

          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/admin" className="hover:text-blue-600">
              Admin
            </Link>
            {' / '}
            <span className="text-gray-900 dark:text-white">Lecciones</span>
          </div>

          {/* Filtro de Curso */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Filtrar por Curso
            </label>
            <select
              value={cursoId || ''}
              onChange={(e) => {
                if (e.target.value) {
                  window.location.href = `/admin/entradas?curso=${e.target.value}`;
                } else {
                  window.location.href = '/admin/entradas';
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

          {/* Lista de Lecciones */}
          {entradas && entradas.length > 0 ? (
            <div className="space-y-3">
              {entradas.map((entrada: any) => (
                <div
                  key={entrada.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                          #{entrada.orden_en_curso}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {entrada.titulo}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Curso: <span className="font-medium">{entrada.cursos?.titulo}</span>
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>⏱️ {entrada.duracion_estimada || 0} min</span>
                        <span>🔗 /{entrada.slug}</span>
                        <span>
                          📦{' '}
                          {Array.isArray(entrada.contenido)
                            ? entrada.contenido.length
                            : 0}{' '}
                          bloques
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/admin/entradas/editar/${entrada.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        ✏️ Editar
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cursoId ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No hay lecciones en este curso
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Crea la primera lección para {cursoSeleccionado?.titulo}
              </p>
              <Link
                href={`/admin/entradas/nuevo?curso=${cursoId}`}
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Crear Primera Lección
              </Link>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Selecciona un curso
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Elige un curso del selector para ver y gestionar sus lecciones
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
