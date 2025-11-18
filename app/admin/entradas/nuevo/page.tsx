import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import EntradaForm from '../EntradaForm';

export default async function NuevaEntradaPage({
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Crear Nueva Lección
          </h1>
          <EntradaForm cursos={cursos || []} cursoIdInicial={cursoId} />
        </div>
      </main>
    </>
  );
}
