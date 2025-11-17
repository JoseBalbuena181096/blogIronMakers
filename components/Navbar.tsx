import UserMenu from './UserMenu';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Blog Educativo
              </span>
            </a>
            <div className="hidden md:flex gap-6">
              <a
                href="/cursos"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
              >
                Cursos
              </a>
              <a
                href="/#quienes-somos"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition"
              >
                Quiénes Somos
              </a>
            </div>
          </div>
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
