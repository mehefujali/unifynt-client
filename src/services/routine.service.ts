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
};
