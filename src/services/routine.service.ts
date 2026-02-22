/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const RoutineService = {
  createRoutine: async (data: any) => {
    const res = await api.post("/routines", data);
    return res.data;
  },

  getAllRoutines: async (params: {
    page?: number;
    limit?: number;
    classId?: string;
    sectionId?: string;
    day?: string;
    startTime?: string;
    searchTerm?: string;
  }) => {
    const res = await api.get("/routines", { params });
    return res.data;
  },

  updateRoutine: async (id: string, data: any) => {
    const res = await api.patch(`/routines/${id}`, data);
    return res.data;
  },

  deleteRoutine: async (id: string) => {
    const res = await api.delete(`/routines/${id}`);
    return res.data;
  },
};
