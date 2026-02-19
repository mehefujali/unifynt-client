/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const PlanService = {
  getAllPlans: async () => {
    const response = await api.get("/plans");
    return response.data.data;
  },

  createPlan: async (data: any) => {
    const response = await api.post("/plans", data);
    return response.data;
  },

  updatePlan: async (id: string, data: any) => {
    const response = await api.patch(`/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id: string) => {
    const response = await api.delete(`/plans/${id}`);
    return response.data;
  },
};
