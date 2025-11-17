'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Integrante {
  id: string;
  nombre: string;
  rol: string;
  bio: string;
  foto_url: string | null;
  linkedin_url: string | null;
  orden: number;
  visible: boolean;
}

export default function EquipoManager({ integrantes: integrantesIniciales }: { integrantes: Integrante[] }) {
  const router = useRouter();
  const [integrantes, setIntegrantes] = useState(integrantesIniciales);
  const [editando, setEditando] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (integrante: Integrante) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('integrantes_equipo')
        .update(integrante)
        .eq('id', integrante.id);

      if (error) throw error;
      setEditando(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const updateIntegrante = (id: string, field: string, value: any) => {
    setIntegrantes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  return (
    <div className="space-y-4">
      {integrantes.map((integrante) => (
        <div key={integrante.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {integrante.nombre}
              </h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={integrante.visible}
                  onChange={(e) => {
                    updateIntegrante(integrante.id, 'visible', e.target.checked);
                    handleSave({ ...integrante, visible: e.target.checked });
                  }}
                  className="rounded"
                />
                <span className="text-gray-600 dark:text-gray-400">Visible</span>
              </label>
            </div>

            {editando === integrante.id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(integrante)}
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
                onClick={() => setEditando(integrante.id)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
              >
                ✏️ Editar
              </button>
            )}
          </div>

          {editando === integrante.id ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={integrante.nombre}
                  onChange={(e) => updateIntegrante(integrante.id, 'nombre', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Rol
                </label>
                <input
                  type="text"
                  value={integrante.rol}
                  onChange={(e) => updateIntegrante(integrante.id, 'rol', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Bio
                </label>
                <textarea
                  value={integrante.bio}
                  onChange={(e) => updateIntegrante(integrante.id, 'bio', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  URL Foto
                </label>
                <input
                  type="url"
                  value={integrante.foto_url || ''}
                  onChange={(e) => updateIntegrante(integrante.id, 'foto_url', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={integrante.linkedin_url || ''}
                  onChange={(e) => updateIntegrante(integrante.id, 'linkedin_url', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400 space-y-2">
              <p><strong>Rol:</strong> {integrante.rol}</p>
              <p><strong>Bio:</strong> {integrante.bio}</p>
              {integrante.linkedin_url && (
                <p><strong>LinkedIn:</strong> {integrante.linkedin_url}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
