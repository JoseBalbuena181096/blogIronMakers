'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Curso, Entrada, ContenidoBloque } from '@/types/database';
import BlockList from '@/components/BlockEditor/BlockList';

interface EntradaFormProps {
  cursos: Curso[];
  entrada?: Entrada;
  isEdit?: boolean;
  cursoIdInicial?: string;
}

export default function EntradaForm({
  cursos,
  entrada,
  isEdit = false,
  cursoIdInicial,
}: EntradaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    titulo: entrada?.titulo || '',
    slug: entrada?.slug || '',
    curso_id: entrada?.curso_id || cursoIdInicial || '',
    duracion_estimada: entrada?.duracion_estimada || 0,
    orden_en_curso: entrada?.orden_en_curso || 1,
  });

  const [contenido, setContenido] = useState<ContenidoBloque[]>(
    entrada?.contenido || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar contenido (opcional)
      if (!Array.isArray(contenido)) {
        throw new Error('El contenido debe ser una lista de bloques');
      }

      const supabase = createClient();

      const dataToSave = {
        ...formData,
        contenido,
      };

      if (isEdit && entrada) {
        const { error: updateError } = await supabase
          .from('entradas')
          .update(dataToSave)
          .eq('id', entrada.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('entradas')
          .insert([dataToSave]);

        if (insertError) throw insertError;
      }

      router.push(`/admin/entradas?curso=${formData.curso_id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Error al guardar lección:', err);
      setError(err.message || 'Error al guardar la lección');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (titulo: string) => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTituloChange = (titulo: string) => {
    setFormData((prev) => ({
      ...prev,
      titulo,
      slug: generateSlug(titulo),
    }));
  };

  const agregarBloque = (tipo: string) => {
    const orden = contenido.length;

    let nuevoBloque: any = {
      id: `bloque_${Date.now()}`,
      tipo,
      orden,
      contenido: {},
    };

    switch (tipo) {
      case 'texto':
        nuevoBloque.contenido = { texto: '', formato: 'normal' };
        break;
      case 'codigo':
        nuevoBloque.contenido = {
          codigo: '',
          lenguaje: 'python',
          mostrarLineas: true,
        };
        break;
      case 'latex':
        nuevoBloque.contenido = { formula: '', inline: false };
        break;
      case 'imagen':
        nuevoBloque.contenido = {
          url: '',
          alt: '',
          caption: '',
        };
        break;
      case 'video':
        nuevoBloque.contenido = {
          tipo: 'youtube',
          videoId: '',
          url: '',
        };
        break;
    }

    setContenido([...contenido, nuevoBloque]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Metadatos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Información de la Lección
          </h2>

          {/* Curso */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Curso *
            </label>
            <select
              required
              value={formData.curso_id}
              onChange={(e) => setFormData({ ...formData, curso_id: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>
                  {curso.titulo}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Título de la Lección *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => handleTituloChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="ej: Introducción a las variables"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="introduccion-variables"
            />
          </div>

          {/* Duración y Orden */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Duración (min)
              </label>
              <input
                type="number"
                min="0"
                value={formData.duracion_estimada}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duracion_estimada: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Orden
              </label>
              <input
                type="number"
                min="1"
                value={formData.orden_en_curso}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orden_en_curso: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Agregar Bloques */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Agregar Bloque de Contenido
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => agregarBloque('texto')}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                📝 Texto
              </button>
              <button
                type="button"
                onClick={() => agregarBloque('codigo')}
                className="px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm hover:bg-green-200 dark:hover:bg-green-800"
              >
                💻 Código
              </button>
              <button
                type="button"
                onClick={() => agregarBloque('latex')}
                className="px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-sm hover:bg-purple-200 dark:hover:bg-purple-800"
              >
                🔢 LaTeX
              </button>
              <button
                type="button"
                onClick={() => agregarBloque('imagen')}
                className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-sm hover:bg-yellow-200 dark:hover:bg-yellow-800"
              >
                🖼️ Imagen
              </button>
              <button
                type="button"
                onClick={() => agregarBloque('video')}
                className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800"
              >
                🎥 Video
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Lección'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Columna Derecha: Editor JSON */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Contenido de la Lección
          </h2>
          <BlockList blocks={contenido} onChange={setContenido} />
        </div>
      </div>
    </form>
  );
}
