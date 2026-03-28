"use client";

import { useEffect, useMemo, useState } from "react";
import { AssignmentStepper } from "@/components/AssignmentStepper";
import { DeliveryList } from "@/components/DeliveryList";
import { VehicleSelector } from "@/components/VehicleSelector";
import { DriverSelector } from "@/components/DriverSelector";
import { RouteSelector } from "@/components/RouteSelector";
import { assignmentService } from "@/src/services/assignmentService";
import { deliveryService } from "@/src/services/deliveryService";
import { driverService } from "@/src/services/driverService";
import { routeService } from "@/src/services/routeService";
import type { DeliveryItem, DriverItem, RouteItem, VehicleItem } from "@/src/services/types";

export default function DispatcherWorkflowDashboard() {
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [routeAlternatives, setRouteAlternatives] = useState<RouteItem[]>([]);
  const [routeHistory, setRouteHistory] = useState<RouteItem[]>([]);

  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryItem | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleItem | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DriverItem | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);

  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [driverLoading, setDriverLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [deliveryError, setDeliveryError] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [driverError, setDriverError] = useState("");
  const [routeError, setRouteError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null) {
      if ("message" in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === "string" && message.trim().length > 0) {
          return message;
        }
      }

      if ("response" in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          return response.data.message;
        }
      }
    }

    return fallback;
  };

  useEffect(() => {
    void loadDeliveries();
    void loadDrivers();
  }, []);

  const activeStep = useMemo(() => {
    if (!selectedDelivery) return 1;
    if (!selectedVehicle) return 2;
    if (!selectedDriver) return 3;
    if (!selectedRoute) return 4;
    return 5;
  }, [selectedDelivery, selectedVehicle, selectedDriver, selectedRoute]);

  const loadDeliveries = async () => {
    setDeliveryLoading(true);
    setDeliveryError("");
    try {
      const data = await deliveryService.list();
      setDeliveries(data);
    } catch {
      setDeliveryError("Failed to load deliveries.");
    } finally {
      setDeliveryLoading(false);
    }
  };

  const loadDrivers = async () => {
    setDriverLoading(true);
    setDriverError("");
    try {
      const data = await driverService.available();
      setDrivers(data);
    } catch (error) {
      setDriverError(getApiErrorMessage(error, "Failed to load available drivers."));
    } finally {
      setDriverLoading(false);
    }
  };

  const loadRoutes = async (delivery: DeliveryItem) => {
    const origin = delivery.pickupAddress || "Origin";
    const destination = delivery.destination || delivery.deliveryAddress || "Destination";

    setRouteLoading(true);
    setRouteError("");
    try {
      const [alternativesResult, historyResult] = await Promise.allSettled([
        routeService.alternatives(origin, destination),
        routeService.history(origin, destination),
      ]);

      if (alternativesResult.status === "fulfilled") {
        setRouteAlternatives(alternativesResult.value);
      } else {
        setRouteAlternatives([]);
      }

      if (historyResult.status === "fulfilled") {
        setRouteHistory(historyResult.value);
      } else {
        setRouteHistory([]);
      }

      if (alternativesResult.status === "rejected" && historyResult.status === "rejected") {
        setRouteError(getApiErrorMessage(alternativesResult.reason, "Failed to load routes for selected delivery."));
      } else if (alternativesResult.status === "rejected") {
        setRouteError(getApiErrorMessage(alternativesResult.reason, "Failed to load live route alternatives."));
      } else if (historyResult.status === "rejected") {
        setRouteError(getApiErrorMessage(historyResult.reason, "Failed to load route history."));
      }
    } finally {
      setRouteLoading(false);
    }
  };

  const handleDeliverySelect = async (delivery: DeliveryItem) => {
    setSelectedDelivery(delivery);
    setSelectedVehicle(null);
    setSelectedDriver(null);
    setSelectedRoute(null);
    setSuccessMessage("");
    setConfirmError("");

    setVehicleLoading(true);
    setVehicleError("");
    try {
      const recommended = await deliveryService.recommendVehicles(delivery.id);
      setVehicles(recommended);
    } catch (error) {
      setVehicleError(getApiErrorMessage(error, "Failed to load vehicle recommendations."));
      setVehicles([]);
    } finally {
      setVehicleLoading(false);
    }

    await loadRoutes(delivery);
  };

  const canConfirm = Boolean(selectedDelivery && selectedVehicle && selectedDriver && selectedRoute);

  const handleConfirmAssignment = async () => {
    if (!selectedDelivery || !selectedVehicle || !selectedDriver || !selectedRoute) return;

    setConfirmLoading(true);
    setConfirmError("");
    try {
      await assignmentService.create({
        deliveryId: selectedDelivery.id,
        vehicleId: selectedVehicle.id,
        driverId: selectedDriver.id,
        routeId: selectedRoute.id,
      });

      setShowConfirmModal(false);
      setSuccessMessage("Assignment created successfully.");
    } catch (error) {
      setConfirmError(getApiErrorMessage(error, "Failed to create assignment."));
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: "grid", gap: 16 }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dispatcher Workflow</h1>
          <p>Select delivery, vehicle, driver, and route, then confirm assignment.</p>
        </div>
      </div>

      <AssignmentStepper activeStep={activeStep} />

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {confirmError && <div className="alert alert-error">{confirmError}</div>}

      <div style={{ display: "grid", gap: 16 }}>
        <DeliveryList
          deliveries={deliveries}
          loading={deliveryLoading}
          error={deliveryError}
          selectedDeliveryId={selectedDelivery?.id || null}
          onSelect={handleDeliverySelect}
        />

        <VehicleSelector
          vehicles={vehicles}
          loading={vehicleLoading}
          error={vehicleError}
          selectedVehicleId={selectedVehicle?.id || null}
          onSelect={setSelectedVehicle}
        />

        <DriverSelector
          drivers={drivers}
          loading={driverLoading}
          error={driverError}
          selectedDriverId={selectedDriver?.id || null}
          onSelect={setSelectedDriver}
        />

        <RouteSelector
          alternatives={routeAlternatives}
          history={routeHistory}
          loading={routeLoading}
          error={routeError}
          selectedRouteId={selectedRoute?.id || null}
          onSelect={setSelectedRoute}
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Step 5: Confirm Assignment</h2>
        </div>
        <div className="card-body" style={{ display: "grid", gap: 12 }}>
          <p>
            Delivery: <strong>{selectedDelivery?.orderNumber || selectedDelivery?.id || "Not selected"}</strong><br />
            Vehicle: <strong>{selectedVehicle?.licensePlate || selectedVehicle?.id || "Not selected"}</strong><br />
            Driver: <strong>{selectedDriver?.fullName || selectedDriver?.id || "Not selected"}</strong><br />
            Route: <strong>{selectedRoute?.summary || selectedRoute?.id || "Not selected"}</strong>
          </p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canConfirm}
            onClick={() => setShowConfirmModal(true)}
          >
            Confirm Assignment
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div className="card" style={{ width: "100%", maxWidth: 520 }}>
            <div className="card-header"><h2>Confirm Assignment</h2></div>
            <div className="card-body" style={{ display: "grid", gap: 12 }}>
              <p>Do you want to create this assignment now?</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)} disabled={confirmLoading}>Cancel</button>
                <button className="btn btn-primary" onClick={handleConfirmAssignment} disabled={confirmLoading}>
                  {confirmLoading ? "Creating..." : "Yes, Create Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
