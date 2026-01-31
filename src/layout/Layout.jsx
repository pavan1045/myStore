import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Settings, Database, Menu, X, ShoppingCart } from 'lucide-react';
import { cn } from '../utils/utils';

export function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/items', label: 'Inventory', icon: Package },
    { href: '/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
            <Database className="h-8 w-8" />
            myStore
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-semibold mb-1">Status</p>
              <p className="text-sm text-gray-600">Database Active</p>
           </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
             className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
             onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Drawer */}
          <aside className="relative w-64 bg-white h-full shadow-xl animate-in slide-in-from-left duration-200 flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
                <Database className="h-8 w-8" />
                myStore
              </h1>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

             <div className="p-4 border-t border-gray-100">
               <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-semibold mb-1">Status</p>
                  <p className="text-sm text-gray-600">Database Active</p>
               </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (visible only on small screens) */}
        <header className="bg-white border-b border-gray-200 p-4 md:hidden flex items-center justify-between sticky top-0 z-10">
           <h1 className="font-bold text-lg text-blue-600 flex items-center gap-2">
             <Database className="h-6 w-6" />
             myStore
           </h1>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-gray-100 rounded-md">
             <Menu className="h-6 w-6 text-gray-600" />
           </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
