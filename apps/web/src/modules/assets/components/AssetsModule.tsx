import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AssetsDashboard from './AssetsDashboard';
import AssetInventory from './AssetInventory';
import HardwareTracking from './HardwareTracking';
import SoftwareLicenses from './SoftwareLicenses';
import MaintenanceSchedule from './MaintenanceSchedule';
import AssetCheckout from './AssetCheckout';
import QRCodeManager from './QRCodeManager';
import VendorManagement from './VendorManagement';

export default function AssetsModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen relative transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AssetsDashboard />} />
        <Route path="inventory" element={<AssetInventory />} />
        <Route path="hardware" element={<HardwareTracking />} />
        <Route path="software" element={<SoftwareLicenses />} />
        <Route path="maintenance" element={<MaintenanceSchedule />} />
        <Route path="checkout" element={<AssetCheckout />} />
        <Route path="qr-codes" element={<QRCodeManager />} />
        <Route path="vendors" element={<VendorManagement />} />
      </Routes>
    </div>
  );
}