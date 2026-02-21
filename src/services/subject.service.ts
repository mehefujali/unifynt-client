/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const SubjectService = {
  createSubject: async (data: any) => {
    const res = await api.post("/subjects", data);
    return res.data;
  },

  getAllSubjects: async (params?: {
    searchTerm?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get("/subjects", { params });
    return res.data;
  },

  getSingleSubject: async (id: string) => {
    const res = await api.get(`/subjects/${id}`);
    return res.data;
  },

  updateSubject: async (id: string, data: any) => {
    const res = await api.patch(`/subjects/${id}`, data);
    return res.data;
  },

  deleteSubject: async (id: string) => {
    const res = await api.delete(`/subjects/${id}`);
    return res.data;
  },
};
