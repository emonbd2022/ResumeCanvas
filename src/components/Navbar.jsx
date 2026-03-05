import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-[#f79003]" />
              <span className="font-bold text-xl tracking-tight">ResumeCraft</span>
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link to="/about" className="text-gray-600 hover:text-[#f79003] transition-colors">About</Link>
            <Link to="/editor" className="btn-primary">Create Resume</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
