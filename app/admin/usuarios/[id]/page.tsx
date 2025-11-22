import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UserProfileEditor from './UserProfileEditor';
import UserEnrollments from './UserEnrollments';
import UserProgress from './UserProgress';

export const metadata = {
    title: 'Detalle de Usuario - Admin',
    description: 'Gestionar detalles de usuario',
};

export default async function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: userId } = await params;
    const profile = await getUserProfile();

    if (!profile || profile.rol !== 'admin') {
        redirect('/');
    }

    const supabase = await createClient();

    // Obtener perfil del usuario
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (!userProfile) {
        return <div>Usuario no encontrado</div>;
    }

    // Obtener cursos disponibles para el selector de inscripción
    const { data: cursos } = await supabase
        .from('cursos')
        .select('id, titulo')
        .order('titulo');

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <Link
                                    href="/admin/usuarios"
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    ← Volver
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {userProfile.nombre || userProfile.email}
                                </h1>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 ml-10">
                                ID: {userProfile.id} • Registrado: {new Date(userProfile.fecha_registro).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Profile & Status */}
                        <div className="lg:col-span-1 space-y-8">
                            <UserProfileEditor user={userProfile} />
                        </div>

                        {/* Right Column: Enrollments & Progress */}
                        <div className="lg:col-span-2 space-y-8">
                            <UserEnrollments userId={userId} cursos={cursos || []} />
                            <UserProgress userId={userId} />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
