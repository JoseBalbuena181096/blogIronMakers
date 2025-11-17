'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ContenidoLanding {
  id: string;
  seccion: string;
  contenido: any;
  orden: number;
  visible: boolean;
}

interface LandingEditorProps {
  contenidos: ContenidoLanding[];
}

export default function LandingEditor({ contenidos: contenidosIniciales }: LandingEditorProps) {
  const router = useRouter();
  const [contenidos, setContenidos] = useState(contenidosIniciales);
  const [editando, setEditando] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = (contenido: ContenidoLanding) => {
    setEditando(contenido.id);
    setError('');
  };

  const handleSave = async (contenido: ContenidoLanding) => {
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      // Parsear contenido si es string
      let contenidoParsed = contenido.contenido;
      if (typeof contenidoParsed === 'string') {
        try {
          contenidoParsed = JSON.parse(contenidoParsed);
        } catch (e) {
          // Si no es JSON válido, dejarlo como está
        }
      }

      const { error: updateError } = await supabase
        .from('contenido_landing')
        .update({
          contenido: contenidoParsed,
          visible: contenido.visible,
        })
        .eq('id', contenido.id);

      if (updateError) throw updateError;

      setEditando(null);
      router.refresh();
    } catch (err: any) {
      console.error('Error al guardar:', err);
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditando(null);
    setError('');
    router.refresh();
  };

  const updateContenido = (id: string, field: string, value: any) => {
    setContenidos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const getSectionTitle = (seccion: string) => {
    const titles: Record<string, string> = {
      hero: 'Hero (Sección Principal)',
      quienes_somos: 'Quiénes Somos',
      mision: 'Misión',
      vision: 'Visión',
      cta: 'Call to Action',
    };
    return titles[seccion] || seccion;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {contenidos.map((contenido) => (
        <div
          key={contenido.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {getSectionTitle(contenido.seccion)}
              </h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={contenido.visible}
                  onChange={(e) => {
                    updateContenido(contenido.id, 'visible', e.target.checked);
                    if (editando === contenido.id) {
                      handleSave({ ...contenido, visible: e.target.checked });
                    }
                  }}
                  className="rounded"
                />
                <span className="text-gray-600 dark:text-gray-400">Visible</span>
              </label>
            </div>

            {editando === contenido.id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(contenido)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleEdit(contenido)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                ✏️ Editar
              </button>
            )}
          </div>

          {editando === contenido.id ? (
            <div className="space-y-4">
              {contenido.seccion === 'hero' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={contenido.contenido?.titulo || ''}
                      onChange={(e) =>
                        updateContenido(contenido.id, 'contenido', {
                          ...contenido.contenido,
                          titulo: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={contenido.contenido?.subtitulo || ''}
                      onChange={(e) =>
                        updateContenido(contenido.id, 'contenido', {
                          ...contenido.contenido,
                          subtitulo: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={contenido.contenido?.descripcion || ''}
                      onChange={(e) =>
                        updateContenido(contenido.id, 'contenido', {
                          ...contenido.contenido,
                          descripcion: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {contenido.seccion === 'quienes_somos' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={contenido.contenido?.titulo || ''}
                      onChange={(e) =>
                        updateContenido(contenido.id, 'contenido', {
                          ...contenido.contenido,
                          titulo: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Contenido
                    </label>
                    <textarea
                      value={contenido.contenido?.contenido || ''}
                      onChange={(e) =>
                        updateContenido(contenido.id, 'contenido', {
                          ...contenido.contenido,
                          contenido: e.target.value,
                        })
                      }
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(contenido.contenido, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}

      {/* Preview Button */}
      <div className="flex justify-center">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
        >
          👁️ Ver Preview de Landing
        </Link>
      </div>
    </div>
  );
}
