import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Curso } from '@/types/database';

export const metadata = {
  title: 'Cursos - Blog Educativo',
  description: 'Explora nuestros cursos de Inteligencia Artificial y Robótica',
};

export default async function CursosPage() {
  const supabase = await createClient();

  const { data: cursos } = await supabase
    .from('cursos')
    .select('*')
    .order('orden');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nuestros Cursos
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Todo el contenido es completamente gratuito y público
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              💡 Regístrate para llevar el control de tu progreso y obtener certificados
            </p>
          </div>

          {/* Cursos Grid */}
          {cursos && cursos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cursos.map((curso: Curso) => (
                <Link
                  key={curso.id}
                  href={`/cursos/${curso.slug}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105"
                >
                  {/* Imagen/Portada */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    {curso.imagen_portada ? (
                      <img
                        src={curso.imagen_portada}
                        alt={curso.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-7xl">📚</span>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                      {curso.titulo}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {curso.descripcion}
                    </p>

                    {/* Info adicional */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        ⏱️ {curso.duracion_estimada} min
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        Ver curso →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No hay cursos disponibles por el momento
              </p>
            </div>
          )}

          {/* CTA para no autenticados */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              ¿Quieres llevar el control de tu progreso?
            </h3>
            <p className="mb-6 text-blue-100">
              Regístrate gratis y obtén acceso a seguimiento de progreso, certificados oficiales y más
            </p>
            <Link
              href="/auth/register"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
