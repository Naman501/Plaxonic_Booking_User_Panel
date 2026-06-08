import { Suspense } from "react";
import EmployeeDashboard from "./DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>Loading…</div>}>
      <EmployeeDashboard />
    </Suspense>
  );
}