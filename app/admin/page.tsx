import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Panel de Administración - Iron Makers & AI',
  description: 'Gestiona cursos, usuarios y contenido',
};

export default async function AdminDashboardPage() {
  const profile = await getUserProfile();

  if (!profile || profile.rol !== 'admin') {
    redirect('/');
  }

  const supabase = await createClient();

  // Obtener estadísticas
  const { count: totalUsuarios } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalCursos } = await supabase
    .from('cursos')
    .select('*', { count: 'exact', head: true });

  const { count: totalInscripciones } = await supabase
    .from('inscripciones')
    .select('*', { count: 'exact', head: true });

  const { count: inscripcionesActivas } = await supabase
    .from('inscripciones')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'inscrito');

  const { count: cursosCompletados } = await supabase
    .from('inscripciones')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'completado');

  const { count: totalCertificados } = await supabase
    .from('certificados')
    .select('*', { count: 'exact', head: true });

  const { count: totalLecciones } = await supabase
    .from('entradas')
    .select('*', { count: 'exact', head: true });

  // Actividad reciente
  const { data: inscripcionesRecientes } = await supabase
    .from('inscripciones')
    .select(`
      *,
      profiles:user_id (nombre, email),
      cursos:curso_id (titulo)
    `)
    .order('fecha_inscripcion', { ascending: false })
    .limit(5);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona el contenido y visualiza estadísticas del sistema
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">👥</div>
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Usuarios
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {totalUsuarios || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total registrados
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📚</div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  Cursos
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {totalCursos || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {totalLecciones || 0} lecciones totales
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">🎯</div>
                <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  Inscripciones
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {inscripcionesActivas || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {totalInscripciones || 0} totales
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">🏆</div>
                <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                  Certificados
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {totalCertificados || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {cursosCompletados || 0} cursos completados
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/admin/cursos"
              className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition"
            >
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-xl font-bold mb-2">Gestionar Cursos</h3>
              <p className="text-blue-100 text-sm">
                Crear, editar y organizar cursos
              </p>
            </Link>

            <Link
              href="/admin/entradas"
              className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition"
            >
              <div className="text-4xl mb-3">✍️</div>
              <h3 className="text-xl font-bold mb-2">Gestionar Lecciones</h3>
              <p className="text-green-100 text-sm">
                Crear y editar contenido de lecciones
              </p>
            </Link>

            <Link
              href="/admin/landing"
              className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition"
            >
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="text-xl font-bold mb-2">Editar Landing</h3>
              <p className="text-purple-100 text-sm">
                Personalizar página principal
              </p>
            </Link>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Inscripciones Recientes
            </h2>

            {inscripcionesRecientes && inscripcionesRecientes.length > 0 ? (
              <div className="space-y-4">
                {inscripcionesRecientes.map((inscripcion: any) => (
                  <div
                    key={inscripcion.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {inscripcion.profiles?.nombre || 'Usuario'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        se inscribió en{' '}
                        <span className="font-medium">
                          {inscripcion.cursos?.titulo}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(inscripcion.fecha_inscripcion).toLocaleDateString(
                        'es-ES',
                        {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No hay actividad reciente
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
