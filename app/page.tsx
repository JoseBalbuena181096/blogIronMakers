import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();

  // Fetch contenido de landing page
  const { data: heroData } = await supabase
    .from('contenido_landing')
    .select('contenido')
    .eq('seccion', 'hero')
    .single();

  const { data: quienesSomosData } = await supabase
    .from('contenido_landing')
    .select('contenido')
    .eq('seccion', 'quienes_somos')
    .single();

  // Fetch integrantes del equipo
  const { data: integrantes } = await supabase
    .from('integrantes_equipo')
    .select('*')
    .order('orden');

  // Fetch proyectos destacados
  const { data: proyectos } = await supabase
    .from('proyectos_destacados')
    .select('*')
    .eq('visible', true)
    .order('orden')
    .limit(6);

  // Fetch cursos para mostrar en preview
  const { data: cursos } = await supabase
    .from('cursos')
    .select('*')
    .order('orden')
    .limit(3);

  const hero = heroData?.contenido as any;
  const quienesSomos = quienesSomosData?.contenido as any;

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {hero?.titulo || 'Aprende IA y Robótica'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {hero?.subtitulo || 'Cursos prácticos con seguimiento de progreso y certificados oficiales'}
            </p>
            <Link
              href={hero?.cta_url || '/cursos'}
              className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg"
            >
              {hero?.cta_texto || 'Explorar Cursos'} →
            </Link>
          </div>
        </section>

        {/* Cursos Preview */}
        {cursos && cursos.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                Cursos Destacados
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {cursos.map((curso) => (
                  <Link
                    key={curso.id}
                    href={`/cursos/${curso.slug}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                  >
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-6xl">📚</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        {curso.titulo}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {curso.descripcion}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>⏱️ {curso.duracion_estimada} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href="/cursos"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Ver Todos los Cursos →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Quiénes Somos */}
        {quienesSomos && (
          <section id="quienes-somos" className="py-16 bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                {quienesSomos?.titulo || 'Quiénes Somos'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                {quienesSomos?.contenido}
              </p>
            </div>
          </section>
        )}

        {/* Integrantes del Equipo */}
        {integrantes && integrantes.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                Nuestro Equipo
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {integrantes.map((integrante) => (
                  <div
                    key={integrante.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                      {integrante.nombre.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
                      {integrante.nombre}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                      {integrante.rol}
                    </p>
                    {integrante.bio && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {integrante.bio}
                      </p>
                    )}
                    {integrante.linkedin_url && (
                      <a
                        href={integrante.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        LinkedIn →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Proyectos Destacados */}
        {proyectos && proyectos.length > 0 && (
          <section className="py-16 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                Proyectos Destacados
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {proyectos.map((proyecto) => (
                  <div
                    key={proyecto.id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <span className="text-6xl">🤖</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        {proyecto.titulo}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {proyecto.descripcion}
                      </p>
                      {proyecto.url_proyecto && (
                        <a
                          href={proyecto.url_proyecto}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
                        >
                          Ver Proyecto →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Final */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              ¿Listo para comenzar tu viaje en IA y Robótica?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Regístrate ahora y lleva el control de tu progreso, obtén certificados oficiales
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg"
              >
                Crear Cuenta Gratis
              </Link>
              <Link
                href="/cursos"
                className="bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition border-2 border-white"
              >
                Explorar Cursos
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>© 2025 Blog Educativo - IA y Robótica. Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>
    </>
  );
}

