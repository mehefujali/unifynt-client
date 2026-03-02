/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const CustomFormService = {
  createForm: async (data: any) => {
    const response = await api.post("/forms", data);
    return response.data;
  },
  getAllForms: async (params?: any) => {
    const response = await api.get("/forms", { params });
    return response.data;
  },
  getFormBySlug: async (slug: string) => {
    const response = await api.get(`/forms/public/${slug}`);
    return response.data;
  },
  updateForm: async (id: string, data: any) => {
    const response = await api.patch(`/forms/${id}`, data);
    return response.data;
  },
  deleteForm: async (id: string) => {
    const response = await api.delete(`/forms/${id}`);
    return response.data;
  },
  getFormSubmissions: async (formId: string, params?: any) => {
    const response = await api.get(`/forms/${formId}/submissions`, { params });
    return response.data;
  },
  getGoogleAuthUrl: async () => {
    const response = await api.get("/forms/google/auth-url");
    return response.data;
  },
  checkGoogleStatus: async () => {
    const response = await api.get("/forms/google/status");
    return response.data;
  },
  disconnectGoogle: async () => {
    const response = await api.delete("/forms/google/disconnect");
    return response.data;
  },
};
