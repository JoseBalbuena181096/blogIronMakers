'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Proyecto {
  id: string;
  titulo: string;
  descripcion: string;
  tecnologias: string[];
  imagen_url: string | null;
  url_proyecto: string | null;
  orden: number;
  visible: boolean;
}

export default function ProyectosManager({ proyectos: proyectosIniciales }: { proyectos: Proyecto[] }) {
  const router = useRouter();
  const [proyectos, setProyectos] = useState(proyectosIniciales);
  const [editando, setEditando] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (proyecto: Proyecto) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('proyectos_destacados')
        .update(proyecto)
        .eq('id', proyecto.id);

      if (error) throw error;
      setEditando(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const updateProyecto = (id: string, field: string, value: any) => {
    setProyectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="space-y-4">
      {proyectos.map((proyecto) => (
        <div key={proyecto.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {proyecto.titulo}
              </h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={proyecto.visible}
                  onChange={(e) => {
                    updateProyecto(proyecto.id, 'visible', e.target.checked);
                    handleSave({ ...proyecto, visible: e.target.checked });
                  }}
                  className="rounded"
                />
                <span className="text-gray-600 dark:text-gray-400">Visible</span>
              </label>
            </div>

            {editando === proyecto.id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(proyecto)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => setEditando(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditando(proyecto.id)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
              >
                ✏️ Editar
              </button>
            )}
          </div>

          {editando === proyecto.id ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={proyecto.titulo}
                  onChange={(e) => updateProyecto(proyecto.id, 'titulo', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Descripción
                </label>
                <textarea
                  value={proyecto.descripcion}
                  onChange={(e) => updateProyecto(proyecto.id, 'descripcion', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Tecnologías (separadas por comas)
                </label>
                <input
                  type="text"
                  value={proyecto.tecnologias.join(', ')}
                  onChange={(e) =>
                    updateProyecto(
                      proyecto.id,
                      'tecnologias',
                      e.target.value.split(',').map((t) => t.trim())
                    )
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  URL Imagen
                </label>
                <input
                  type="url"
                  value={proyecto.imagen_url || ''}
                  onChange={(e) => updateProyecto(proyecto.id, 'imagen_url', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  URL Proyecto
                </label>
                <input
                  type="url"
                  value={proyecto.url_proyecto || ''}
                  onChange={(e) => updateProyecto(proyecto.id, 'url_proyecto', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400 space-y-2">
              <p><strong>Descripción:</strong> {proyecto.descripcion}</p>
              <p>
                <strong>Tecnologías:</strong> {proyecto.tecnologias.join(', ')}
              </p>
              {proyecto.url_proyecto && (
                <p><strong>URL:</strong> {proyecto.url_proyecto}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
