import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Curso, Entrada, ProgresoLeccion } from '@/types/database';
import ContentRenderer from './ContentRenderer';
import CompleteButton from './CompleteButton';

export default async function LeccionPage({
  params,
}: {
  params: Promise<{ slug: string; leccion: string }>;
}) {
  const { slug, leccion } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Obtener curso
  const { data: curso } = await supabase
    .from('cursos')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!curso) {
    notFound();
  }

  // Obtener entrada/lección
  const { data: entrada } = await supabase
    .from('entradas')
    .select('*')
    .eq('curso_id', curso.id)
    .eq('slug', leccion)
    .single();

  if (!entrada) {
    notFound();
  }

  // Obtener todas las lecciones del curso para navegación
  const { data: todasEntradas } = await supabase
    .from('entradas')
    .select('*')
    .eq('curso_id', curso.id)
    .order('orden_en_curso');

  const currentIndex = todasEntradas?.findIndex((e: Entrada) => e.id === entrada.id) || 0;
  const prevEntrada = currentIndex > 0 ? todasEntradas?.[currentIndex - 1] : null;
  const nextEntrada =
    todasEntradas && currentIndex < todasEntradas.length - 1
      ? todasEntradas[currentIndex + 1]
      : null;

  // Verificar progreso si está autenticado
  let progresoLeccion: ProgresoLeccion | null = null;
  let inscripcionId: string | null = null;

  if (user) {
    const { data: inscripcion } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('user_id', user.id)
      .eq('curso_id', curso.id)
      .single();

    if (inscripcion) {
      inscripcionId = inscripcion.id;

      const { data: progresoData } = await supabase
        .from('progreso_lecciones')
        .select('*')
        .eq('user_id', user.id)
        .eq('entrada_id', entrada.id)
        .single();

      progresoLeccion = progresoData;

      // Si no existe progreso, crearlo
      if (!progresoData) {
        await supabase.from('progreso_lecciones').insert({
          user_id: user.id,
          entrada_id: entrada.id,
          completado: false,
          tiempo_dedicado: 0,
        });
      }
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/cursos" className="hover:text-blue-600">
              Cursos
            </Link>
            {' / '}
            <Link href={`/cursos/${slug}`} className="hover:text-blue-600">
              {curso.titulo}
            </Link>
            {' / '}
            <span className="text-gray-900 dark:text-white">{entrada.titulo}</span>
          </div>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {entrada.titulo}
            </h1>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span>⏱️ {entrada.duracion_estimada} min</span>
              {progresoLeccion?.completado && (
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  ✅ Completada
                </span>
              )}
            </div>
          </div>

          {/* Contenido de la lección */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <ContentRenderer content={entrada.contenido} />
          </div>

          {/* Botón completar (solo si está inscrito) */}
          {user && inscripcionId && !progresoLeccion?.completado && (
            <div className="mb-8">
              <CompleteButton
                userId={user.id}
                entradaId={entrada.id}
                cursoSlug={slug}
                nextLeccionSlug={nextEntrada?.slug}
              />
            </div>
          )}

          {/* Navegación prev/next */}
          <div className="flex items-center justify-between">
            <div>
              {prevEntrada ? (
                <Link
                  href={`/cursos/${slug}/${prevEntrada.slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ← {prevEntrada.titulo}
                </Link>
              ) : (
                <Link
                  href={`/cursos/${slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ← Volver al curso
                </Link>
              )}
            </div>

            <div>
              {nextEntrada ? (
                <Link
                  href={`/cursos/${slug}/${nextEntrada.slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {nextEntrada.titulo} →
                </Link>
              ) : (
                <Link
                  href={`/cursos/${slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver todas las lecciones →
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
