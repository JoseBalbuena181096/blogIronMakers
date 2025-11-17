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

  // Fetch redes sociales
  const { data: redesSociales } = await supabase
    .from('redes_sociales')
    .select('*')
    .eq('visible', true)
    .order('orden');

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
              <div className="flex flex-wrap justify-center gap-8">
                {integrantes.map((integrante) => (
                  <div
                    key={integrante.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center w-full sm:w-80"
                  >
                    {integrante.foto_url ? (
                      <img
                        src={integrante.foto_url}
                        alt={integrante.nombre}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                        {integrante.nombre.charAt(0)}
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
                      {integrante.nombre}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
                      {integrante.rol}
                    </p>
                    {integrante.bio && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {integrante.bio}
                      </p>
                    )}
                    {integrante.linkedin_url && (
                      <a
                        href={integrante.linkedin_url.startsWith('http') ? integrante.linkedin_url : `https://${integrante.linkedin_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        LinkedIn
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
                    {proyecto.imagen_url ? (
                      <img
                        src={proyecto.imagen_url}
                        alt={proyecto.titulo}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <span className="text-6xl">🤖</span>
                      </div>
                    )}
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

        {/* Redes Sociales */}
        {redesSociales && redesSociales.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                Síguenos en Redes Sociales
              </h2>
              <div className="flex flex-wrap justify-center gap-6">
                {redesSociales.map((red) => {
                  const getIconoConfig = (icono: string | null) => {
                    switch (icono?.toLowerCase()) {
                      case 'facebook':
                        return {
                          bg: 'bg-blue-600 hover:bg-blue-700',
                          svg: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        };
                      case 'tiktok':
                        return {
                          bg: 'bg-black hover:bg-gray-800',
                          svg: <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        };
                      case 'instagram':
                        return {
                          bg: 'bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600',
                          svg: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        };
                      case 'twitter':
                      case 'x':
                        return {
                          bg: 'bg-black hover:bg-gray-800',
                          svg: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        };
                      case 'linkedin':
                        return {
                          bg: 'bg-blue-700 hover:bg-blue-800',
                          svg: <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        };
                      case 'youtube':
                        return {
                          bg: 'bg-red-600 hover:bg-red-700',
                          svg: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        };
                      default:
                        return {
                          bg: 'bg-gray-600 hover:bg-gray-700',
                          svg: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        };
                    }
                  };

                  const config = getIconoConfig(red.icono);
                  
                  return (
                    <a
                      key={red.id}
                      href={red.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-16 h-16 ${config.bg} rounded-full flex items-center justify-center transition shadow-lg`}>
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            {config.svg}
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                          {red.nombre}
                        </span>
                      </div>
                    </a>
                  );
                })}
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
            <p>© 2025 Iron Makers & AI. Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>
    </>
  );
}

