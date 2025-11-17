'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Curso } from '@/types/database';

interface CursoFormProps {
  curso?: Curso;
  isEdit?: boolean;
}

export default function CursoForm({ curso, isEdit = false }: CursoFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    titulo: curso?.titulo || '',
    slug: curso?.slug || '',
    descripcion: curso?.descripcion || '',
    imagen_portada: curso?.imagen_portada || '',
    duracion_estimada: curso?.duracion_estimada || 0,
    orden: curso?.orden || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      if (isEdit && curso) {
        // Actualizar curso existente
        const { error: updateError } = await supabase
          .from('cursos')
          .update(formData)
          .eq('id', curso.id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo curso
        const { error: insertError } = await supabase
          .from('cursos')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      router.push('/admin/cursos');
      router.refresh();
    } catch (err: any) {
      console.error('Error al guardar curso:', err);
      setError(err.message || 'Error al guardar el curso');
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

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Título del Curso *
          </label>
          <input
            type="text"
            required
            value={formData.titulo}
            onChange={(e) => handleTituloChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="ej: Introducción a Python"
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
            placeholder="introduccion-python"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            URL: /cursos/{formData.slug || 'slug-del-curso'}
          </p>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Describe el contenido y objetivos del curso..."
          />
        </div>

        {/* Imagen Portada */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            URL de Imagen de Portada
          </label>
          <input
            type="url"
            value={formData.imagen_portada}
            onChange={(e) => setFormData({ ...formData, imagen_portada: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        {/* Grid de Duración y Orden */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Duración Estimada (minutos)
            </label>
            <input
              type="number"
              min="0"
              value={formData.duracion_estimada}
              onChange={(e) =>
                setFormData({ ...formData, duracion_estimada: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Orden (posición en listado)
            </label>
            <input
              type="number"
              min="0"
              value={formData.orden}
              onChange={(e) =>
                setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-8">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : isEdit ? 'Actualizar Curso' : 'Crear Curso'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
