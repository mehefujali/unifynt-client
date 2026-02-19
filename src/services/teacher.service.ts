/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const TeacherService = {
  getAllTeachers: async () => {
    const response = await api.get("/teachers?limit=1000");
    return response.data.data;
  },

  createTeacher: async (data: any) => {
    const response = await api.post("/teachers", data);
    return response.data;
  },

  deleteTeacher: async (id: string) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },
};
