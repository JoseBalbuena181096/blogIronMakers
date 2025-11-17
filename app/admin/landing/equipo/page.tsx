import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EquipoManager from './EquipoManager';

export const metadata = {
  title: 'Gestionar Equipo - Admin',
  description: 'Administra los miembros del equipo',
};

export default async function AdminEquipoPage() {
  const profile = await getUserProfile();

  if (!profile || profile.rol !== 'admin') {
    redirect('/');
  }

  const supabase = await createClient();

  const { data: integrantes } = await supabase
    .from('integrantes_equipo')
    .select('*')
    .order('orden');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Gestionar Equipo
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra los miembros del equipo mostrados en la landing
            </p>
          </div>

          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/admin" className="hover:text-blue-600">Admin</Link>
            {' / '}
            <Link href="/admin/landing" className="hover:text-blue-600">Landing</Link>
            {' / '}
            <span className="text-gray-900 dark:text-white">Equipo</span>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              <Link
                href="/admin/landing"
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Secciones de Texto
              </Link>
              <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-semibold">
                Equipo
              </button>
              <Link
                href="/admin/landing/proyectos"
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Proyectos
              </Link>
            </div>
          </div>

          <EquipoManager integrantes={integrantes || []} />
        </div>
      </main>
    </>
  );
}
