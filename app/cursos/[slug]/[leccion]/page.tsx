import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';

import { getUser, getUserProfile } from '@/lib/supabase/auth';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Curso, Entrada, ProgresoLeccion } from '@/types/database';
import ContentRenderer from './ContentRenderer';
import CompleteButton from './CompleteButton';
import AIChatWidget from '@/components/chat/AIChatWidget';

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

      // Check if previous lesson is completed
      if (prevEntrada) {
        const { data: prevProgreso } = await supabase
          .from('progreso_lecciones')
          .select('completado')
          .eq('user_id', user.id)
          .eq('entrada_id', prevEntrada.id)
          .single();

        if (!prevProgreso?.completado) {
          // Redirect to course page if previous lesson is not completed
          redirect(`/cursos/${slug}`);
        }
      }

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

  // Access Control for Paid Courses
  if (curso.is_paid) {
    const profile = await getUserProfile();
    const isAdmin = profile?.rol === 'admin';

    if (!inscripcionId && !isAdmin) {
      // User is not enrolled and not an admin
      // Redirect to course page or show access denied
      // For now, redirect to course page which will show "Contact Admin" or similar (implied by no enroll button)
      // Or maybe we should show a specific "Access Denied" page?
      // Redirecting to course page is safer.
      redirect(`/cursos/${slug}`);
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

          {/* Draft Banner */}
          {!entrada.publicado && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8 rounded shadow-sm" role="alert">
              <div className="flex items-center">
                <div className="py-1"><svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg></div>
                <div>
                  <p className="font-bold">Modo Borrador</p>
                  <p className="text-sm">Esta lección no es visible para el público. Solo los administradores pueden verla.</p>
                </div>
              </div>
            </div>
          )}

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

      {/* AI Chat Widget - Flotante en la esquina */}
      <AIChatWidget entradaId={entrada.id} />
    </>
  );
}
