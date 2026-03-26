import { AuthGuard } from "@/components/AuthGuard";
import DispatcherWorkflowDashboard from "@/src/features/dispatcher/Dashboard";

export default function DispatcherDashboardPage() {
  return (
    <AuthGuard allowedRoles={["Dispatcher"]}>
      <DispatcherWorkflowDashboard />
    </AuthGuard>
  );
}
