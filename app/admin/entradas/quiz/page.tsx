import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import QuizManager from './QuizManager';

export const metadata = {
  title: 'Gestionar Quiz - Admin',
  description: 'Administra las preguntas del quiz de la lección',
};

export default async function AdminQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ entrada?: string }>;
}) {
  const profile = await getUserProfile();

  if (!profile || profile.rol !== 'admin') {
    redirect('/');
  }

  const params = await searchParams;
  const entradaId = params.entrada;

  if (!entradaId) {
    redirect('/admin/entradas');
  }

  const supabase = await createClient();

  // Obtener información de la entrada
  const { data: entrada } = await supabase
    .from('entradas')
    .select(`
      *,
      cursos:curso_id (
        id,
        titulo,
        slug
      )
    `)
    .eq('id', entradaId)
    .single();

  if (!entrada) {
    redirect('/admin/entradas');
  }

  // Obtener preguntas del quiz
  const { data: preguntas } = await supabase
    .from('quiz_preguntas')
    .select('*')
    .eq('entrada_id', entradaId)
    .order('orden');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Gestionar Quiz
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {entrada.titulo}
            </p>
          </div>

          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            {' / '}
            <Link href="/admin/entradas" className="hover:text-blue-600">Entradas</Link>
            {' / '}
            <Link
              href={`/admin/entradas?curso=${(entrada as any).cursos?.id}`}
              className="hover:text-blue-600"
            >
              {(entrada as any).cursos?.titulo}
            </Link>
            {' / '}
            <span className="text-gray-900 dark:text-white">Quiz</span>
          </div>

          <QuizManager 
            entradaId={entradaId} 
            preguntas={preguntas || []}
          />
        </div>
      </main>
    </>
  );
}
