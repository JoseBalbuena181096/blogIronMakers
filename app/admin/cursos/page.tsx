import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Curso } from '@/types/database';
import DeleteCursoButton from './DeleteCursoButton';

export const metadata = {
  title: 'Gestionar Cursos - Admin',
  description: 'Administra los cursos del sistema',
};

export default async function AdminCursosPage() {
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

  // Obtener conteo de lecciones por curso
  const cursosConLecciones = await Promise.all(
    (cursos || []).map(async (curso: Curso) => {
      const { count } = await supabase
        .from('entradas')
        .select('*', { count: 'exact', head: true })
        .eq('curso_id', curso.id);

      return { ...curso, totalLecciones: count || 0 };
    })
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Gestionar Cursos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Administra el catálogo de cursos
              </p>
            </div>
            <Link
              href="/admin/cursos/nuevo"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
            >
              + Nuevo Curso
            </Link>
          </div>

          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/admin" className="hover:text-blue-600">
              Admin
            </Link>
            {' / '}
            <span className="text-gray-900 dark:text-white">Cursos</span>
          </div>

          {/* Cursos List */}
          {cursosConLecciones && cursosConLecciones.length > 0 ? (
            <div className="space-y-4">
              {cursosConLecciones.map((curso: any) => (
                <div
                  key={curso.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <div className="flex items-start gap-6">
                    {/* Portada */}
                    <div className="flex-shrink-0">
                      {curso.imagen_portada ? (
                        <img
                          src={curso.imagen_portada}
                          alt={curso.titulo}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-5xl">
                          📚
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {curso.titulo}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                            Orden: {curso.orden}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {curso.descripcion || 'Sin descripción'}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span>📖 {curso.totalLecciones} lecciones</span>
                        <span>⏱️ {curso.duracion_estimada || 0} min</span>
                        <span>🔗 /{curso.slug}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/cursos/${curso.slug}`}
                          target="_blank"
                          className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          👁️ Ver
                        </Link>
                        <Link
                          href={`/admin/cursos/editar/${curso.slug}`}
                          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          ✏️ Editar
                        </Link>
                        <Link
                          href={`/admin/entradas?curso=${curso.id}`}
                          className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          📝 Lecciones
                        </Link>
                        <DeleteCursoButton
                          cursoId={curso.id}
                          cursoTitulo={curso.titulo}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No hay cursos creados
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Comienza creando tu primer curso
              </p>
              <Link
                href="/admin/cursos/nuevo"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Crear Primer Curso
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
