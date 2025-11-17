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

interface NuevoProyecto {
  titulo: string;
  descripcion: string;
  tecnologias: string;
  imagen_url: string;
  url_proyecto: string;
}

export default function ProyectosManager({ proyectos: proyectosIniciales }: { proyectos: Proyecto[] }) {
  const router = useRouter();
  const [proyectos, setProyectos] = useState(proyectosIniciales);
  const [editando, setEditando] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creando, setCreando] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState<NuevoProyecto>({
    titulo: '',
    descripcion: '',
    tecnologias: '',
    imagen_url: '',
    url_proyecto: ''
  });

  const handleSave = async (id: string) => {
    setLoading(true);
    try {
      const proyecto = proyectos.find(p => p.id === id);
      if (!proyecto) return;

      const supabase = createClient();
      const { error } = await supabase
        .from('proyectos_destacados')
        .update({
          titulo: proyecto.titulo,
          descripcion: proyecto.descripcion,
          tecnologias: proyecto.tecnologias,
          imagen_url: proyecto.imagen_url,
          url_proyecto: proyecto.url_proyecto,
          orden: proyecto.orden,
          visible: proyecto.visible
        })
        .eq('id', proyecto.id);

      if (error) throw error;
      setEditando(null);
      alert('✅ Proyecto guardado correctamente');
      router.refresh();
    } catch (err: any) {
      alert('❌ Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const updateProyecto = (id: string, field: string, value: any) => {
    setProyectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleCrear = async () => {
    if (!nuevoProyecto.titulo || !nuevoProyecto.descripcion) {
      alert('⚠️ El título y la descripción son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      
      // Obtener el siguiente orden
      const maxOrden = proyectos.length > 0 ? Math.max(...proyectos.map(p => p.orden)) : 0;
      
      const { error } = await supabase
        .from('proyectos_destacados')
        .insert({
          titulo: nuevoProyecto.titulo,
          descripcion: nuevoProyecto.descripcion,
          tecnologias: nuevoProyecto.tecnologias.split(',').map(t => t.trim()).filter(t => t),
          imagen_url: nuevoProyecto.imagen_url || null,
          url_proyecto: nuevoProyecto.url_proyecto || null,
          orden: maxOrden + 1,
          visible: true
        });

      if (error) throw error;
      
      setCreando(false);
      setNuevoProyecto({
        titulo: '',
        descripcion: '',
        tecnologias: '',
        imagen_url: '',
        url_proyecto: ''
      });
      alert('✅ Proyecto creado correctamente');
      router.refresh();
    } catch (err: any) {
      alert('❌ Error al crear: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de eliminar el proyecto "${titulo}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('proyectos_destacados')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Proyecto eliminado correctamente');
      router.refresh();
    } catch (err: any) {
      alert('❌ Error al eliminar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón para crear nuevo proyecto */}
      <div className="flex justify-end">
        <button
          onClick={() => setCreando(!creando)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
        >
          {creando ? '❌ Cancelar' : '+ Nuevo Proyecto'}
        </button>
      </div>

      {/* Formulario de creación */}
      {creando && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-blue-500">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ➕ Crear Nuevo Proyecto
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Título *
              </label>
              <input
                type="text"
                value={nuevoProyecto.titulo}
                onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, titulo: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Nombre del proyecto"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Descripción *
              </label>
              <textarea
                value={nuevoProyecto.descripcion}
                onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, descripcion: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Descripción del proyecto"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Tecnologías (separadas por comas)
              </label>
              <input
                type="text"
                value={nuevoProyecto.tecnologias}
                onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, tecnologias: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="React, Node.js, MongoDB"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                URL Imagen
              </label>
              <input
                type="url"
                value={nuevoProyecto.imagen_url}
                onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, imagen_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                URL Proyecto
              </label>
              <input
                type="url"
                value={nuevoProyecto.url_proyecto}
                onChange={(e) => setNuevoProyecto({ ...nuevoProyecto, url_proyecto: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://github.com/usuario/proyecto"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCrear}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Creando...' : '✅ Crear Proyecto'}
              </button>
              <button
                onClick={() => {
                  setCreando(false);
                  setNuevoProyecto({
                    titulo: '',
                    descripcion: '',
                    tecnologias: '',
                    imagen_url: '',
                    url_proyecto: ''
                  });
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de proyectos existentes */}
      {proyectos.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No hay proyectos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Crea el primer proyecto para mostrar en la landing
          </p>
        </div>
      ) : (
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
                  onChange={async (e) => {
                    const newVisible = e.target.checked;
                    updateProyecto(proyecto.id, 'visible', newVisible);
                    
                    const supabase = createClient();
                    await supabase
                      .from('proyectos_destacados')
                      .update({ visible: newVisible })
                      .eq('id', proyecto.id);
                    router.refresh();
                  }}
                  className="rounded"
                />
                <span className="text-gray-600 dark:text-gray-400">Visible</span>
              </label>
            </div>

            {editando === proyecto.id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(proyecto.id)}
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

          {/* Botón de eliminar */}
          {editando !== proyecto.id && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleEliminar(proyecto.id, proyecto.titulo)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition text-sm"
              >
                🗑️ Eliminar Proyecto
              </button>
            </div>
          )}
        </div>
      ))}
        </div>
      )}
    </div>
  );
}
