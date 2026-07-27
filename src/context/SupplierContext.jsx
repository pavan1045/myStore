import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supplierService } from '../services/supplierService';
import { useAuth } from '../auth/AuthContext';

const SupplierContext = createContext();

export function SupplierProvider({ children }) {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [bills, setBills] = useState([]);
  const [metrics, setMetrics] = useState({
    total_outstanding: 0,
    pending_bills_count: 0,
    partially_paid_bills_count: 0,
    paid_bills_this_month_count: 0,
    total_purchase_this_month: 0,
    total_payments_this_month: 0,
    total_suppliers_count: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    setIsLoading(true);
    try {
      const [supData, billData, metricData] = await Promise.all([
        supplierService.getSuppliers(),
        supplierService.getBills(),
        supplierService.getDashboardMetrics()
      ]);
      setSuppliers(supData || []);
      setBills(billData || []);
      if (metricData) setMetrics(metricData);
    } catch (error) {
      console.error('Error loading supplier data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const addSupplier = async (data) => {
    const newSup = await supplierService.addSupplier(data);
    await fetchAllData();
    return newSup;
  };

  const updateSupplier = async (id, data) => {
    const updated = await supplierService.updateSupplier(id, data);
    await fetchAllData();
    return updated;
  };

  const deleteSupplier = async (id) => {
    await supplierService.deleteSupplier(id);
    await fetchAllData();
  };

  const addBill = async (data) => {
    const newBill = await supplierService.addBill(data);
    await fetchAllData();
    return newBill;
  };

  const updateBill = async (id, data) => {
    const updated = await supplierService.updateBill(id, data);
    await fetchAllData();
    return updated;
  };

  const deleteBill = async (id) => {
    await supplierService.deleteBill(id);
    await fetchAllData();
  };

  const recordPayment = async (data) => {
    const result = await supplierService.recordPayment(data);
    await fetchAllData();
    return result;
  };

  const updatePayment = async (id, data) => {
    const result = await supplierService.updatePayment(id, data);
    await fetchAllData();
    return result;
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        bills,
        metrics,
        isLoading,
        refreshAll: fetchAllData,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addBill,
        updateBill,
        deleteBill,
        recordPayment,
        updatePayment
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSupplier must be used within a SupplierProvider');
  }
  return context;
}
