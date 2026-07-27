import React from 'react';
import { CategoryCard } from './CategoryCard';
import { EmptyState } from '../common/EmptyState';
import { Layers } from 'lucide-react';

export function CategoryGrid({ categories, items, onEdit, onDelete }) {
    if (categories.length === 0) {
        return <EmptyState icon={Layers} title="No categories found" message="Add your first category to start organizing items." />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
                <CategoryCard
                    key={cat.id}
                    category={cat}
                    itemCount={items.filter(i => i.categoryId === cat.id).length}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
