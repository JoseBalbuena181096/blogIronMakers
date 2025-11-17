'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface RedSocial {
  id: string;
  nombre: string;
  url: string;
  icono: string | null;
  orden: number;
  visible: boolean;
}

interface NuevaRed {
  nombre: string;
  url: string;
  icono: string;
}

export default function RedesSocialesManager({ redesSociales: redesIniciales }: { redesSociales: RedSocial[] }) {
  const router = useRouter();
  const [redes, setRedes] = useState(redesIniciales);
  const [editando, setEditando] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creando, setCreando] = useState(false);
  const [nuevaRed, setNuevaRed] = useState<NuevaRed>({
    nombre: '',
    url: '',
    icono: ''
  });

  const handleSave = async (id: string) => {
    setLoading(true);
    try {
      const red = redes.find(r => r.id === id);
      if (!red) return;

      const supabase = createClient();
      const { error } = await supabase
        .from('redes_sociales')
        .update({
          nombre: red.nombre,
          url: red.url,
          icono: red.icono,
          orden: red.orden,
          visible: red.visible
        })
        .eq('id', red.id);

      if (error) throw error;
      setEditando(null);
      alert('✅ Red social guardada correctamente');
      router.refresh();
    } catch (err: any) {
      alert('❌ Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const updateRed = (id: string, field: string, value: any) => {
    setRedes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleCrear = async () => {
    if (!nuevaRed.nombre || !nuevaRed.url) {
      alert('⚠️ El nombre y la URL son obligatorios');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      
      const maxOrden = redes.length > 0 ? Math.max(...redes.map(r => r.orden)) : 0;
      
      const { error } = await supabase
        .from('redes_sociales')
        .insert({
          nombre: nuevaRed.nombre,
          url: nuevaRed.url,
          icono: nuevaRed.icono || null,
          orden: maxOrden + 1,
          visible: true
        });

      if (error) throw error;
      
      setCreando(false);
      setNuevaRed({ nombre: '', url: '', icono: '' });
      alert('✅ Red social creada correctamente');
      router.refresh();
    } catch (err: any) {
      alert('❌ Error al crear: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar ${nombre}?`)) {
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('redes_sociales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('✅ Red social eliminada correctamente');
      router.refresh();
    } catch (err: any) {
      alert('❌ Error al eliminar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón para crear nueva red social */}
      <div className="flex justify-end">
        <button
          onClick={() => setCreando(!creando)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
        >
          {creando ? '❌ Cancelar' : '+ Nueva Red Social'}
        </button>
      </div>

      {/* Formulario de creación */}
      {creando && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-blue-500">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ➕ Crear Nueva Red Social
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={nuevaRed.nombre}
                onChange={(e) => setNuevaRed({ ...nuevaRed, nombre: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Facebook, Instagram, Twitter, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                URL *
              </label>
              <input
                type="url"
                value={nuevaRed.url}
                onChange={(e) => setNuevaRed({ ...nuevaRed, url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Icono (facebook, tiktok, instagram, twitter, linkedin, youtube)
              </label>
              <input
                type="text"
                value={nuevaRed.icono}
                onChange={(e) => setNuevaRed({ ...nuevaRed, icono: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="facebook"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCrear}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {loading ? 'Creando...' : '✅ Crear Red Social'}
              </button>
              <button
                onClick={() => {
                  setCreando(false);
                  setNuevaRed({ nombre: '', url: '', icono: '' });
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de redes sociales */}
      {redes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No hay redes sociales
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Crea la primera red social para mostrar en la landing
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {redes.map((red) => (
            <div key={red.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {red.nombre}
                  </h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={red.visible}
                      onChange={async (e) => {
                        const newVisible = e.target.checked;
                        updateRed(red.id, 'visible', newVisible);
                        
                        const supabase = createClient();
                        await supabase
                          .from('redes_sociales')
                          .update({ visible: newVisible })
                          .eq('id', red.id);
                        router.refresh();
                      }}
                      className="rounded"
                    />
                    <span className="text-gray-600 dark:text-gray-400">Visible</span>
                  </label>
                </div>

                {editando === red.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(red.id)}
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
                    onClick={() => setEditando(red.id)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
                  >
                    ✏️ Editar
                  </button>
                )}
              </div>

              {editando === red.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={red.nombre}
                      onChange={(e) => updateRed(red.id, 'nombre', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={red.url}
                      onChange={(e) => updateRed(red.id, 'url', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Icono
                    </label>
                    <input
                      type="text"
                      value={red.icono || ''}
                      onChange={(e) => updateRed(red.id, 'icono', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-400 space-y-2">
                  <p><strong>URL:</strong> {red.url}</p>
                  <p><strong>Icono:</strong> {red.icono || 'Sin icono'}</p>
                </div>
              )}

              {/* Botón de eliminar */}
              {editando !== red.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEliminar(red.id, red.nombre)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition text-sm"
                  >
                    🗑️ Eliminar
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
