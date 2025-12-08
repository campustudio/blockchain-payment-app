/**
 * Main Application Component
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { Payment } from "@/pages/Payment";
import { Analytics } from "@/pages/Analytics";
import { MLSystem } from "@/pages/MLSystem";
import { Layout } from "@/components/layout/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="payment" element={<Payment />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="ml-system" element={<MLSystem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
