'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TableStatus {
  name: string;
  exists: boolean;
  count?: number;
}

export default function DatabaseVerification() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyTables() {
      const supabase = createClient();
      const tableNames = [
        'profiles',
        'cursos',
        'entradas',
        'inscripciones',
        'progreso_lecciones',
        'certificados',
        'contenido_landing',
        'integrantes_equipo',
        'proyectos_destacados'
      ];

      const results: TableStatus[] = [];

      for (const tableName of tableNames) {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          if (error) {
            results.push({ name: tableName, exists: false });
          } else {
            results.push({ name: tableName, exists: true, count: count || 0 });
          }
        } catch (err) {
          results.push({ name: tableName, exists: false });
        }
      }

      setTables(results);
      setLoading(false);
    }

    verifyTables();
  }, []);

  if (loading) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-5">
        <div className="flex items-center gap-3">
          <div className="text-2xl animate-spin">⏳</div>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Verificando base de datos...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  const allExists = tables.every(t => t.exists);
  const totalRecords = tables.reduce((sum, t) => sum + (t.count || 0), 0);

  return (
    <div className={`border-2 rounded-lg p-5 ${
      allExists 
        ? 'bg-green-50 dark:bg-green-900/30 border-green-500' 
        : 'bg-red-50 dark:bg-red-900/30 border-red-500'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{allExists ? '✅' : '❌'}</div>
        <div>
          <h3 className={`font-semibold ${
            allExists ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
          }`}>
            {allExists 
              ? `Base de datos configurada correctamente` 
              : 'Algunas tablas no se encontraron'}
          </h3>
          {allExists && (
            <p className="text-sm text-green-600 dark:text-green-400">
              9 tablas creadas • {totalRecords} registros totales
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        {tables.map((table) => (
          <div 
            key={table.name}
            className={`p-2 rounded ${
              table.exists 
                ? 'bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200' 
                : 'bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="font-semibold">{table.name}</div>
            {table.exists && (
              <div className="text-xs opacity-75">{table.count} registros</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
