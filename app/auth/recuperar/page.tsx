import Link from 'next/link';
import RecuperarForm from './RecuperarForm';

export const metadata = {
  title: 'Recuperar Contraseña - Iron Makers & AI',
  description: 'Recupera el acceso a tu cuenta',
};

export default function RecuperarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <img 
              src="https://zksisjytdffzxjtplwsd.supabase.co/storage/v1/object/public/images/team/logo_imakers.svg" 
              alt="Iron Makers" 
              className="w-10 h-10 rounded-full"
            />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Iron Makers & AI
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        <RecuperarForm />

        <div className="mt-6 text-center text-sm">
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
