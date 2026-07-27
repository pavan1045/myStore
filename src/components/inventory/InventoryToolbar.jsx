import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../common/Input';
import { useCategories } from '../../hooks/useCategories';

export function InventoryToolbar({ search, setSearch, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter }) {
    const { categories } = useCategories();

    return (
        <div className="flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
            <div className="flex-1 w-full">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <Input
                        placeholder="Search by name, SKU or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <div className="w-full md:w-48">
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="all">All Categories</option>
                        {categories?.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full md:w-48">
                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Stock Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="IN">In Stock</option>
                        <option value="LOW">Low Stock</option>
                        <option value="OUT">Out of Stock</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

