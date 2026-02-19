/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const AcademicService = {
  getAllAcademicYears: async () => {
    // Corrected the endpoint to /academic/years
    const response = await api.get("/academic/years");
    return response.data?.data;
  },

  getAllClasses: async () => {
    // Corrected the endpoint to /academic/classes
    const response = await api.get("/academic/classes");
    return response.data?.data;
  },

  getAllSections: async (classId?: string) => {
    // Corrected the endpoint to /academic/sections
    const params = classId ? { classId } : {};
    const response = await api.get("/academic/sections", { params });
    return response.data?.data;
  },
};
