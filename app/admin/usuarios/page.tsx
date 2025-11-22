import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
    title: 'Gestión de Usuarios - Admin',
    description: 'Administra los usuarios de la plataforma',
};

export default async function AdminUsuariosPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const { q: query, page } = await searchParams;
    const profile = await getUserProfile();

    if (!profile || profile.rol !== 'admin') {
        redirect('/');
    }

    const supabase = await createClient();
    const pageNumber = parseInt(page || '1');
    const pageSize = 10;
    const from = (pageNumber - 1) * pageSize;
    const to = from + pageSize - 1;

    let usuariosQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('fecha_registro', { ascending: false })
        .range(from, to);

    if (query) {
        usuariosQuery = usuariosQuery.or(`email.ilike.%${query}%,nombre.ilike.%${query}%`);
    }

    const { data: usuarios, count } = await usuariosQuery;
    const totalPages = count ? Math.ceil(count / pageSize) : 1;

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Gestión de Usuarios
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Administra perfiles, roles y accesos
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <form className="flex gap-2">
                            <input
                                name="q"
                                defaultValue={query}
                                placeholder="Buscar por nombre o correo..."
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Buscar
                            </button>
                            {query && (
                                <Link
                                    href="/admin/usuarios"
                                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center"
                                >
                                    Limpiar
                                </Link>
                            )}
                        </form>
                    </div>

                    {/* Users List */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Rol
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Nivel Educativo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {usuarios?.map((usuario) => (
                                        <tr key={usuario.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400">
                                                        {usuario.avatar_url ? (
                                                            <img src={usuario.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                                                        ) : (
                                                            (usuario.nombre?.[0] || usuario.email[0]).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {usuario.nombre || 'Sin nombre'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {usuario.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.rol === 'admin'
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    }`}>
                                                    {usuario.rol}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {usuario.nivel_educativo || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.activo !== false
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                    {usuario.activo !== false ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/usuarios/${usuario.id}`}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    Gestionar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <Link
                                        href={`/admin/usuarios?page=${Math.max(1, pageNumber - 1)}${query ? `&q=${query}` : ''}`}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${pageNumber === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                    >
                                        Anterior
                                    </Link>
                                    <Link
                                        href={`/admin/usuarios?page=${Math.min(totalPages, pageNumber + 1)}${query ? `&q=${query}` : ''}`}
                                        className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${pageNumber === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                    >
                                        Siguiente
                                    </Link>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700 dark:text-gray-400">
                                            Mostrando <span className="font-medium">{from + 1}</span> a <span className="font-medium">{Math.min(to + 1, count || 0)}</span> de <span className="font-medium">{count}</span> resultados
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {Array.from({ length: totalPages }).map((_, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={`/admin/usuarios?page=${idx + 1}${query ? `&q=${query}` : ''}`}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNumber === idx + 1
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {idx + 1}
                                                </Link>
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
