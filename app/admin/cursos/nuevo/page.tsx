import Navbar from '@/components/Navbar';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import CursoForm from '../CursoForm';

export const metadata = {
  title: 'Nuevo Curso - Admin',
  description: 'Crear un nuevo curso',
};

export default async function NuevoCursoPage() {
  const profile = await getUserProfile();

  if (!profile || profile.rol !== 'admin') {
    redirect('/');
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Crear Nuevo Curso
          </h1>
          <CursoForm />
        </div>
      </main>
    </>
  );
}
