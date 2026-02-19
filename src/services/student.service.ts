/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const StudentService = {
  getAllStudents: async (params?: any) => {
    const response = await api.get("/students", { params });
    return response.data;
  },
  getSingleStudent: async (id: string) => {
    const response = await api.get(`/students/${id}`);
    return response.data?.data;
  },
  createStudent: async (data: any) => {
    const response = await api.post("/students", data);
    return response.data?.data;
  },
  updateStudent: async (id: string, data: any) => {
    const response = await api.patch(`/students/${id}`, data);
    return response.data?.data;
  },
  deleteStudent: async (id: string) => {
    const response = await api.delete(`/students/${id}`);
    return response.data?.data;
  },
};
