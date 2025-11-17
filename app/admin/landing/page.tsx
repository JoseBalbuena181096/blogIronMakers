import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LandingEditor from './LandingEditor';

export const metadata = {
  title: 'Editar Landing Page - Admin',
  description: 'Personaliza el contenido de la página principal',
};

export default async function AdminLandingPage() {
  const profile = await getUserProfile();

  if (!profile || profile.rol !== 'admin') {
    redirect('/');
  }

  const supabase = await createClient();

  // Obtener todo el contenido de landing
  const { data: contenidos } = await supabase
    .from('contenido_landing')
    .select('*')
    .order('orden');

  // Obtener integrantes del equipo
  const { data: integrantes } = await supabase
    .from('integrantes_equipo')
    .select('*')
    .order('orden');

  // Obtener proyectos destacados
  const { data: proyectos } = await supabase
    .from('proyectos_destacados')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  // Obtener redes sociales
  const { data: redesSociales } = await supabase
    .from('redes_sociales')
    .select('*')
    .order('orden');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Editar Landing Page
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Personaliza el contenido de la página principal
            </p>
          </div>

          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/admin" className="hover:text-blue-600">
              Admin
            </Link>
            {' / '}
            <span className="text-gray-900 dark:text-white">Landing Page</span>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-semibold">
                Secciones de Texto
              </button>
              <Link
                href="/admin/landing/equipo"
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Equipo ({integrantes?.length || 0})
              </Link>
              <Link
                href="/admin/landing/proyectos"
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Proyectos ({proyectos?.length || 0})
              </Link>
              <Link
                href="/admin/landing/redes"
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Redes Sociales ({redesSociales?.length || 0})
              </Link>
            </div>
          </div>

          {/* Editor de Secciones */}
          <LandingEditor contenidos={contenidos || []} />
        </div>
      </main>
    </>
  );
}
