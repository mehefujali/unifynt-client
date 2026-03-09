/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const TeacherService = {
  // Fetch all teachers (For Data Table)
  getAllTeachers: async (params?: any) => {
    const response = await api.get("/teachers", { params });
    return response.data?.data;
  },

  // Fetch a single teacher by ID (For View/Edit Modal)
  getSingleTeacher: async (id: string) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data?.data;
  },

  // Create a new teacher (For Add Modal)
  createTeacher: async (data: any) => {
    const response = await api.post("/teachers", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.data;
  },

  // Update an existing teacher (For Edit Modal)
  updateTeacher: async (id: string, data: any) => {
    const response = await api.patch(`/teachers/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.data;
  },

  // Delete a teacher (For Data Table Action)
  deleteTeacher: async (id: string) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data?.data;
  },
};