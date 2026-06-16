"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "../sidebar/sidebar";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Overlay - visible only on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 max-[900px]:block hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="app-shell__content flex flex-col min-w-0 flex-1">
        
        {/* Mobile Header - only visible on max 900px */}
        <div className="hidden max-[900px]:flex items-center p-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-b border-slate-800 shrink-0">
          <button 
            className="p-2 mr-3 bg-transparent text-white rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer border-none" 
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-base">Mi ERP</span>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
