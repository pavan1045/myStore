import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './layout/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ItemForm from './pages/ItemForm';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import SupplierPayments from './pages/SupplierPayments';
import SupplierBillDetail from './pages/SupplierBillDetail';
import PurchaseList from './pages/PurchaseList';
import { InventoryProvider } from './context/InventoryContext';
import { SupplierProvider } from './context/SupplierContext';
import { TeamProvider } from './context/TeamContext';
import { AuthProvider } from './auth/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TeamProvider>
          <InventoryProvider>
            <SupplierProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Dashboard />} />
                  <Route path="items" element={<Inventory />} />
                  <Route path="items/new" element={<ItemForm />} />
                  <Route path="items/edit/:id" element={<ItemForm />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="purchase-list" element={<PurchaseList />} />
                  <Route path="supplier-payments" element={<SupplierPayments />} />
                  <Route path="supplier-payments/bills/:id" element={<SupplierBillDetail />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </SupplierProvider>
          </InventoryProvider>
        </TeamProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
