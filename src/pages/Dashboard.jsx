import React from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { DashboardActivityPanel } from '../components/dashboard/DashboardActivityPanel';
import { Button } from '../components/common/Button';
import { Plus, LayoutGrid, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">Command center for your store's inventory and stock health.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Button variant="secondary" onClick={() => navigate('/categories')}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button onClick={() => navigate('/items/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Quick Actions & Info */}
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-all border-b-4 border-b-blue-500">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform">
                <Package size={28} />
              </div>
              <h3 className="text-gray-900 dark:text-white text-lg font-bold">Inventory Control</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] mt-2 leading-relaxed">
                Real-time tracking of SKUs and stock levels across all shelf locations.
              </p>
              <Button variant="outline" size="sm" className="mt-6 font-bold" onClick={() => navigate('/items')}>
                View Inventory
              </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center group hover:shadow-md transition-all border-b-4 border-b-gray-300 dark:border-b-gray-600">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-full mb-4 text-gray-400 dark:text-gray-300 group-hover:rotate-12 transition-transform">
                <LayoutGrid size={28} />
              </div>
              <h3 className="text-gray-900 dark:text-white text-lg font-bold">Catalog Structure</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[240px] mt-2 leading-relaxed">
                Organize your catalog with custom categories and descriptions.
              </p>
              <Button variant="outline" size="sm" className="mt-6 font-bold" onClick={() => navigate('/categories')}>
                Browse Categories
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Automated Stock Alerts</h3>
              <p className="text-blue-100 text-sm max-w-md">
                The system automatically highlights items that fall below your minimum threshold.
                Stay ahead of supply chain issues with real-time monitoring.
              </p>
              <Button variant="secondary" size="sm" className="mt-6 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm" onClick={() => navigate('/items')}>
                Check Alerts Now
              </Button>
            </div>
            <Package className="absolute -bottom-8 -right-8 text-white/10 w-48 h-48 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="xl:col-span-1">
          <DashboardActivityPanel />
        </div>
      </div>
    </div>
  );
}

