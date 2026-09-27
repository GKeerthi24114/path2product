import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Mail, Phone, MapPin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/10">
                <Navigation className="h-4 w-4 rotate-45" />
              </div>
              <span className="font-extrabold text-lg text-white">Path2Product</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Interactive indoor maps powered by Dijkstra pathfinding algorithms. Designed for frictionless retail search.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/store" className="hover:text-blue-400 transition-colors">Select Store</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Navigator Map</Link></li>
              <li><Link to="/admin" className="hover:text-blue-400 transition-colors">Shopkeeper Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 3: Tech Stack */}
          <div>
            <h4 className="text-white font-bold mb-4">Tech Stack</h4>
            <ul className="space-y-2 text-sm">
              <li>React.js (Vite)</li>
              <li>Tailwind CSS</li>
              <li>Express.js Server</li>
              <li>Dijkstra Pathfinding</li>
            </ul>
          </div>

          {/* Col 4: Contact & Info */}
          <div className="space-y-3 text-sm">
            <h4 className="text-white font-bold mb-4">Contact Info</h4>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <span>support@path2product.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-500" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span>San Francisco, CA</span>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            &copy; {new Date().getFullYear()} Path2Product. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" /> GitHub Repository
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
