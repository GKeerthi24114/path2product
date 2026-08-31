import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navigation, Menu, X, BarChart3, LayoutDashboard, Home } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-slate-800/50 py-3' 
        : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Navigation className="h-5 w-5 rotate-45" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              SmartStore
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                isActive('/') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
            >
              <Home className="h-4 w-4" /> Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                isActive('/dashboard') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Store Dashboard
            </Link>
            <Link 
              to="/admin" 
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                isActive('/admin') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Admin Analytics
            </Link>
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-700" />
            <DarkModeToggle />
          </div>

          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center gap-3">
            <DarkModeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-base text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <Home className="h-5 w-5" /> Home
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-base text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <LayoutDashboard className="h-5 w-5" /> Store Dashboard
          </Link>
          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-base text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <BarChart3 className="h-5 w-5" /> Admin Analytics
          </Link>
        </div>
      )}
    </nav>
  );
}
