import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect, notFound } from 'next/navigation';
import EntradaForm from '../../EntradaForm';
import IngestButton from '@/components/admin/IngestButton';

export default async function EditarEntradaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getUserProfile();

  if (!profile || profile.rol !== 'admin') {
    redirect('/');
  }

  const supabase = await createClient();

  const { data: entrada } = await supabase
    .from('entradas')
    .select('*')
    .eq('id', id)
    .single();

  if (!entrada) {
    notFound();
  }

  const { data: cursos } = await supabase
    .from('cursos')
    .select('*')
    .order('orden');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Editar Lección
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{entrada.titulo}</p>
            </div>
            <IngestButton entradaId={id} />
          </div>
          <EntradaForm cursos={cursos || []} entrada={entrada} isEdit={true} />
        </div>
      </main>
    </>
  );
}
