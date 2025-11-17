import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect, notFound } from 'next/navigation';
import CursoForm from '../../CursoForm';

export default async function EditarCursoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getUserProfile();

  if (!profile || profile.rol !== 'admin') {
    redirect('/');
  }

  const supabase = await createClient();

  const { data: curso } = await supabase
    .from('cursos')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!curso) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Editar Curso
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{curso.titulo}</p>
          <CursoForm curso={curso} isEdit={true} />
        </div>
      </main>
    </>
  );
}
