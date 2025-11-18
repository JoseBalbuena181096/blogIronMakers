import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Curso, Inscripcion, Certificado, IntegranteEquipo, Profile } from '@/types/database';
import DownloadCertificateButton from './DownloadCertificateButton';

export const metadata = {
  title: 'Mis Cursos - Iron Makers & AI',
  description: 'Gestiona tu progreso y accede a tus certificados',
};

export default async function MisCursosPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const supabase = await createClient();

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre')
    .eq('id', user.id)
    .single();

  // Obtener el primer instructor (será quien certifica los cursos)
  const { data: instructor } = await supabase
    .from('integrantes_equipo')
    .select('nombre, rol')
    .order('orden', { ascending: true })
    .limit(1)
    .single();

  // Obtener inscripciones con información del curso
  const { data: inscripciones } = await supabase
    .from('inscripciones')
    .select(`
      *,
      cursos:curso_id (*)
    `)
    .eq('user_id', user.id)
    .order('fecha_inscripcion', { ascending: false });

  // Obtener certificados
  const { data: certificados } = await supabase
    .from('certificados')
    .select(`
      *,
      cursos:curso_id (*)
    `)
    .eq('user_id', user.id)
    .order('fecha_emision', { ascending: false });

  const cursosActivos = inscripciones?.filter(
    (i: any) => i.estado === 'inscrito'
  ) || [];
  const cursosCompletados = inscripciones?.filter(
    (i: any) => i.estado === 'completado'
  ) || [];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Mis Cursos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Continúa con tu aprendizaje o revisa tus certificados
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {inscripciones?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total de cursos
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {cursosActivos.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                En progreso
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {certificados?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Certificados
              </div>
            </div>
          </div>

          {/* Cursos en Progreso */}
          {cursosActivos.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Cursos en Progreso
              </h2>
              <div className="space-y-4">
                {cursosActivos.map((inscripcion: any) => {
                  const curso = inscripcion.cursos as Curso;
                  const progreso = 0; // Se calculará desde progreso_lecciones

                  return (
                    <div
                      key={inscripcion.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                    >
                      <div className="flex items-start gap-6">
                        {/* Portada */}
                        <div className="flex-shrink-0">
                          {curso.imagen_portada ? (
                            <img
                              src={curso.imagen_portada}
                              alt={curso.titulo}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-4xl">
                              📚
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {curso.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {curso.descripcion}
                          </p>

                          {/* Barra de progreso */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">
                                Progreso
                              </span>
                              <span className="font-semibold text-blue-600">
                                {progreso}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${progreso}%` }}
                              />
                            </div>
                          </div>

                          {/* Botón continuar */}
                          <Link
                            href={`/cursos/${curso.slug}`}
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Continuar →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Cursos Completados */}
          {cursosCompletados.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Cursos Completados
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cursosCompletados.map((inscripcion: any) => {
                  const curso = inscripcion.cursos as Curso;

                  return (
                    <div
                      key={inscripcion.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                    >
                      {/* Portada */}
                      <div className="h-32 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center relative">
                        <span className="text-5xl">✅</span>
                        <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Completado
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {curso.titulo}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                          Completado el{' '}
                          {new Date(inscripcion.fecha_completado).toLocaleDateString('es-ES')}
                        </p>
                        <Link
                          href={`/cursos/${curso.slug}`}
                          className="block text-center bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          Revisar curso
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Certificados */}
          {certificados && certificados.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Mis Certificados
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {certificados.map((certificado: any) => {
                  const curso = certificado.cursos as Curso;

                  return (
                    <div
                      key={certificado.id}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-4xl mb-2">🏆</div>
                          <h3 className="text-xl font-bold mb-1">{curso.titulo}</h3>
                          <p className="text-sm text-blue-100">
                            Emitido el{' '}
                            {new Date(certificado.fecha_emision).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/20 rounded p-3 mb-4">
                        <p className="text-xs text-blue-100 mb-1">Código de verificación</p>
                        <p className="font-mono font-bold">
                          {certificado.codigo_verificacion}
                        </p>
                      </div>

                      <DownloadCertificateButton
                        certificateData={{
                          studentName: profile?.nombre || user.email || 'Estudiante',
                          courseName: curso.titulo,
                          duration: curso.duracion_estimada,
                          verificationCode: certificado.codigo_verificacion,
                          issueDate: certificado.fecha_emision,
                          instructorName: instructor?.nombre || 'Instructor',
                          instructorRole: instructor?.rol || 'Instructor Principal',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty State */}
          {(!inscripciones || inscripciones.length === 0) && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Aún no tienes cursos
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Explora nuestro catálogo y comienza tu aprendizaje
              </p>
              <Link
                href="/cursos"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Ver Cursos Disponibles
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
