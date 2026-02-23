/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/lib/axios";

export const AcademicService = {
  createClass: async (data: any) => {
    const response = await axiosInstance.post("/academic/classes", data);
    return response.data;
  },

  getAllClasses: async (params?: any) => {
    const response = await axiosInstance.get("/academic/classes", { params });
    return response.data;
  },

  updateClass: async (id: string, data: any) => {
    const response = await axiosInstance.patch(`/academic/classes/${id}`, data);
    return response.data;
  },

  deleteClass: async (id: string) => {
    const response = await axiosInstance.delete(`/academic/classes/${id}`);
    return response.data;
  },

  createSection: async (data: any) => {
    const response = await axiosInstance.post("/academic/sections", data);
    return response.data;
  },

  getAllSections: async (params?: any) => {
    const response = await axiosInstance.get("/academic/sections", { params });
    return response.data;
  },

  updateSection: async (id: string, data: any) => {
    const response = await axiosInstance.patch(`/academic/sections/${id}`, data);
    return response.data;
  },

  deleteSection: async (id: string) => {
    const response = await axiosInstance.delete(`/academic/sections/${id}`);
    return response.data;
  },

  createSubject: async (data: any) => {
    const response = await axiosInstance.post("/academic/subjects", data);
    return response.data;
  },

  getAllSubjects: async (params?: any) => {
    const response = await axiosInstance.get("/academic/subjects", { params });
    return response.data;
  },

  updateSubject: async (id: string, data: any) => {
    const response = await axiosInstance.patch(`/academic/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id: string) => {
    const response = await axiosInstance.delete(`/academic/subjects/${id}`);
    return response.data;
  },

  createAcademicYear: async (data: any) => {
    const response = await axiosInstance.post("/academic/years", data);
    return response.data;
  },

  getAllAcademicYears: async (params?: any) => {
    const response = await axiosInstance.get("/academic/years", { params });
    return response.data;
  },

  updateAcademicYear: async (id: string, data: any) => {
    const response = await axiosInstance.patch(`/academic/years/${id}`, data);
    return response.data;
  },

  deleteAcademicYear: async (id: string) => {
    const response = await axiosInstance.delete(`/academic/years/${id}`);
    return response.data;
  },
};