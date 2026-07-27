import React, { useState } from 'react';
import { History, ArrowRight, Search, RefreshCw } from 'lucide-react';
import { ActivityItem } from './ActivityItem';
import { useInventoryContext } from '../../context/InventoryContext';
import { activityService } from '../../services/activityService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';

export function DashboardActivityPanel() {
    const { activities, loading } = useInventoryContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [allActivities, setAllActivities] = useState([]);
    const [loadingAll, setLoadingAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleViewAll = async () => {
        setIsModalOpen(true);
        setLoadingAll(true);
        try {
            const data = await activityService.getRecent(50);
            setAllActivities(data && data.length > 0 ? data : (activities || []));
        } catch (err) {
            console.error('Failed to load all activities:', err);
            setAllActivities(activities || []);
        } finally {
            setLoadingAll(false);
        }
    };

    const filteredActivities = (allActivities.length > 0 ? allActivities : (activities || [])).filter(act => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            act.entityName?.toLowerCase().includes(q) ||
            act.type?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-100 dark:bg-gray-700 rounded mb-6" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full max-h-[600px] overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 sticky top-0 z-10">
                    <div className="flex items-center gap-3 text-gray-900 dark:text-white font-bold text-lg">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <History size={20} />
                        </div>
                        Recent Activity
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleViewAll}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    >
                        View All <ArrowRight size={14} className="ml-1" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    {!activities || activities.length === 0 ? (
                        <div className="py-12">
                            <EmptyState
                                icon={History}
                                title="No activity yet"
                                message="Changes to items and categories will appear here."
                            />
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {activities.map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                    )}
                </div>

                {activities?.length > 0 && (
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-50 dark:border-gray-700 flex justify-center">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            System Logs • Real-time
                        </p>
                    </div>
                )}
            </div>

            {/* View All Activities Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="All Recent Activities"
                maxWidth="max-w-2xl"
            >
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
                        <Input
                            type="text"
                            placeholder="Filter activities by product or action..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 text-xs bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-xl"
                        />
                    </div>

                    {/* Content List */}
                    {loadingAll ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
                        </div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-500">
                            No activities match your search query.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[450px] overflow-y-auto pr-1">
                            {filteredActivities.map((act) => (
                                <ActivityItem key={act.id || act._id} activity={act} />
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}
