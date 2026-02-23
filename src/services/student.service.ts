/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/lib/axios";

export const StudentService = {
  getAllStudents: async (params?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    classId?: string;
    sectionId?: string;
    [key: string]: any;
  }) => {
    const response = await axiosInstance.get("/students", { params });
    return response.data;
  },

  getStudentById: async (id: string) => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },

  getSingleStudent: async (id: string) => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },

  createStudent: async (data: any) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.post("/students", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  },

  updateStudent: async (id: string, data: any) => {
    const isFormData = data instanceof FormData;
    const response = await axiosInstance.patch(`/students/${id}`, data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  },

  deleteStudent: async (id: string) => {
    const response = await axiosInstance.delete(`/students/${id}`);
    return response.data;
  },
};