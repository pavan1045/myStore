import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ItemForm from './pages/ItemForm';
import Orders from './pages/Orders';
import Settings from './pages/Settings';

// App Root
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="items" element={<Inventory />} />
        <Route path="items/new" element={<ItemForm />} />
        <Route path="items/edit/:id" element={<ItemForm />} />
        <Route path="orders" element={<Orders />} />
        <Route path="settings" element={<Settings />} />
        {/* Redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
