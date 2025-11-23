'use client';

import UserMenu from './UserMenu';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <img
                src="https://zksisjytdffzxjtplwsd.supabase.co/storage/v1/object/public/images/team/logo_oficial.svg"
                alt="Iron Makers"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Iron Makers &amp; AI
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
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
