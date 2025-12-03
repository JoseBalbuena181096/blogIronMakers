import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Curso, Entrada, Inscripcion, ProgresoLeccion } from '@/types/database';
import EnrollButton from './EnrollButton';

export default async function CursoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Obtener curso
  const { data: curso } = await supabase
    .from('cursos')
    .select('*, responsable:profiles(nombre, avatar_url, bio, rol)')
    .eq('slug', slug)
    .single();

  if (!curso) {
    notFound();
  }

  // Obtener lecciones del curso
  const { data: entradas } = await supabase
    .from('entradas')
    .select('*')
    .eq('curso_id', curso.id)
    .order('orden_en_curso');

  // Si hay usuario autenticado, verificar inscripción y progreso
  let inscripcion: Inscripcion | null = null;
  let progreso: ProgresoLeccion[] = [];
  let leccionesCompletadas = 0;

  if (user) {
    const { data: inscripcionData } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('user_id', user.id)
      .eq('curso_id', curso.id)
      .single();

    inscripcion = inscripcionData;

    if (inscripcion) {
      const { data: progresoData } = await supabase
        .from('progreso_lecciones')
        .select('*')
        .eq('user_id', user.id)
        .in(
          'entrada_id',
          entradas?.map((e: Entrada) => e.id) || []
        );

      progreso = progresoData || [];
      leccionesCompletadas = progreso.filter((p) => p.completado).length;
    }
  }

  const totalLecciones = entradas?.length || 0;
  const porcentajeProgreso =
    totalLecciones > 0 ? (leccionesCompletadas / totalLecciones) * 100 : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Draft Banner */}
          {!curso.publicado && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded shadow-sm" role="alert">
              <div className="flex items-center">
                <div className="py-1"><svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg></div>
                <div>
                  <p className="font-bold">Modo Borrador</p>
                  <p className="text-sm">Este curso no es visible para el público. Solo los administradores pueden verlo.</p>
                </div>
              </div>
            </div>
          )}

          {/* Header del curso */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
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
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {curso.titulo}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {curso.descripcion}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <span className="flex items-center gap-1">
                    📖 {totalLecciones} lecciones
                  </span>
                  <span className="flex items-center gap-1">
                    ⏱️ {curso.duracion_estimada} min
                  </span>
                  {curso.responsable && (
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                      {curso.responsable.avatar_url ? (
                        <img
                          src={curso.responsable.avatar_url}
                          alt={curso.responsable.nombre}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">
                          {curso.responsable.nombre?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">Instructor</span>
                        <span className="text-blue-700 dark:text-blue-300 font-medium leading-none">
                          {curso.responsable.nombre || 'Sin nombre'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progreso o botón de inscripción */}
                {user ? (
                  inscripcion ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progreso del curso
                        </span>
                        <span className="font-bold text-blue-600">
                          {leccionesCompletadas}/{totalLecciones} lecciones
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all"
                          style={{ width: `${porcentajeProgreso}%` }}
                        />
                      </div>
                      {inscripcion.estado === 'completado' && (
                        <p className="mt-3 text-green-600 dark:text-green-400 font-semibold flex items-center gap-2">
                          ✅ Curso completado - Certificado disponible
                        </p>
                      )}
                    </div>
                  ) : (
                    !curso.is_paid && <EnrollButton cursoId={curso.id} cursoTitulo={curso.titulo} />
                  )
                ) : (
                  !curso.is_paid && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                        💡 Regístrate para llevar el control de tu progreso y obtener un
                        certificado al finalizar
                      </p>
                      <Link
                        href="/auth/register"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Crear Cuenta Gratis
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Lista de lecciones */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Contenido del Curso
            </h2>

            {entradas && entradas.length > 0 ? (
              <div className="space-y-3">
                {entradas.map((entrada: Entrada, index: number) => {
                  const estaCompletada = progreso.find(
                    (p) => p.entrada_id === entrada.id && p.completado
                  );

                  // Logic for locking:
                  // Locked if:
                  // 1. User is not enrolled (handled by general access, but here we visualize)
                  // 2. Previous lesson is NOT completed (unless it's the first lesson)

                  let isLocked = false;
                  if (index > 0) {
                    const prevEntrada = entradas[index - 1];
                    const prevProgreso = progreso.find(p => p.entrada_id === prevEntrada.id);
                    if (!prevProgreso?.completado) {
                      isLocked = true;
                    }
                  }

                  // If user is not logged in or not enrolled, everything might be locked or open depending on business logic.
                  // Assuming "audit" mode is allowed, we might not lock. 
                  // But user request implies strict locking. 
                  // If no user/subscription, we probably shouldn't show progress locks, but maybe just "Enroll to start".
                  // However, let's stick to the requested logic: "if user can access next lesson only if previous is completed".
                  // If user is NOT enrolled, they probably can't see lessons anyway or they are all locked?
                  // Let's assume if they are seeing this list, they might be enrolled or previewing.
                  // If they are enrolled (inscripcion exists), we apply the lock.

                  if (inscripcion && isLocked) {
                    return (
                      <div
                        key={entrada.id}
                        className="block bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 opacity-75 cursor-not-allowed"
                      >
                        <div className="flex items-center gap-4">
                          {/* Lock Icon */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                            🔒
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-500 dark:text-gray-400 mb-1">
                              {entrada.titulo}
                            </h3>
                            <div className="text-sm text-gray-400 dark:text-gray-500">
                              ⏱️ {entrada.duracion_estimada} min
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={entrada.id}
                      href={`/cursos/${slug}/${entrada.slug}`}
                      className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    >
                      <div className="flex items-center gap-4">
                        {/* Número y estado */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${estaCompletada
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                          }`}>
                          {estaCompletada ? '✓' : index + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {entrada.titulo}
                            </h3>
                            {!entrada.publicado && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Borrador
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ⏱️ {entrada.duracion_estimada} min
                          </div>
                        </div>

                        {/* Icono */}
                        <div className="text-blue-600 dark:text-blue-400">
                          →
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                Este curso aún no tiene lecciones disponibles
              </p>
            )}
          </div>

          {/* Botón volver */}
          <div className="mt-8">
            <Link
              href="/cursos"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Volver a todos los cursos
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
