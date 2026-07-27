import React from 'react';
import { History, PlusCircle, Edit3, DollarSign, CheckCircle2, Trash2 } from 'lucide-react';

export function BillActivityTimeline({ timeline = [] }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        No activity logged for this bill yet.
      </div>
    );
  }

  const getActionBadge = (action) => {
    switch (action) {
      case 'BILL_CREATED':
        return { icon: PlusCircle, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800' };
      case 'BILL_UPDATED':
        return { icon: Edit3, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800' };
      case 'PAYMENT_ADDED':
      case 'PAYMENT_UPDATED':
        return { icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800' };
      case 'BILL_CLEARED':
        return { icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-800' };
      case 'BILL_DELETED':
        return { icon: Trash2, color: 'text-red-600 bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-800' };
      default:
        return { icon: History, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' };
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
      {timeline.map((item) => {
        const { icon: Icon, color } = getActionBadge(item.action);

        return (
          <div key={item.id || item._id} className="relative group">
            {/* Timeline Dot */}
            <div className={`absolute -left-[35px] top-0.5 p-1.5 rounded-full border ${color}`}>
              <Icon size={16} />
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {formatDate(item.timestamp)}
                </p>
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  by {item.performed_by || 'Admin'}
                </span>
              </div>

              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.description}
              </p>

              {/* Display Old vs New Values if present */}
              {item.old_value && item.new_value && (
                <div className="mt-2 grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-900/60 rounded-lg text-xs border border-gray-200/60 dark:border-gray-700/60">
                  <div>
                    <span className="font-bold text-red-500 block mb-1">Old Value</span>
                    <pre className="font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {JSON.stringify(item.old_value, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="font-bold text-green-500 block mb-1">New Value</span>
                    <pre className="font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {JSON.stringify(item.new_value, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
