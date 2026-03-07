/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const StaffService = {
  getAllStaff: async () => {
    const response = await api.get("/staff");
    return response.data.data;
  },

  getSingleStaff: async (id: string) => {
    const response = await api.get(`/staff/${id}`);
    return response.data.data;
  },

  createStaff: async (data: any) => {
    const response = await api.post("/staff", data);
    return response.data.data;
  },

  updateStaff: async (id: string, data: any) => {
    const response = await api.patch(`/staff/${id}`, data);
    return response.data.data;
  },

  deleteStaff: async (id: string) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data.data;
  },
};
