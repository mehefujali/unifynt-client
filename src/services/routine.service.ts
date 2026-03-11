/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const RoutineService = {
  createRoutine: async (data: any) => {
    const response = await api.post("/routines", data);
    return response.data;
  },
  getAllRoutines: async (params?: any) => {
    const response = await api.get("/routines", { params });
    return response.data;
  },
  updateRoutine: async (id: string, data: any) => {
    const response = await api.patch(`/routines/${id}`, data);
    return response.data;
  },
  deleteRoutine: async (id: string) => {
    const response = await api.delete(`/routines/${id}`);
    return response.data;
  },
  getAvailableTeachers: async (day: string, periodId: string) => {
    const response = await api.get("/routines/available-teachers", {
      params: { day, periodId },
    });
    return response.data;
  },
  /** Adjust a class for a specific date (cancel or substitute) */
  adjustClass: async (data: {
    routineId: string;
    date: string;
    action: "CANCELLED" | "SUBSTITUTED";
    substitutedTeacherId?: string;
    reason?: string;
  }) => {
    const response = await api.post("/routines/adjust", data);
    return response.data;
  },
  /** Get all adjustments, optionally filtered by date */
  getAdjustments: async (params?: { date?: string; routineId?: string }) => {
    const response = await api.get("/routines/adjustments", { params });
    return response.data;
  },
  /** Revert an adjustment back to the default schedule */
  revertAdjustment: async (adjustmentId: string) => {
    const response = await api.delete(`/routines/adjustments/${adjustmentId}`);
    return response.data;
  },
};
