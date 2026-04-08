import api from "@/services/api";
import type { AssignmentPayload } from "@/src/services/types";

export const assignmentService = {
  create: async (payload: AssignmentPayload): Promise<unknown> => {
    const { data } = await api.post("/assignment/api/assignments", payload);
    return data;
  },
  getActiveForDriver: async (driverId: number): Promise<any> => {
    try {
      const { data } = await api.get(`/assignment/api/assignments/driver/${driverId}/active`);
      return data?.data;
    } catch {
      return null;
    }
  }
};
