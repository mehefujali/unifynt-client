/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const SiteConfigService = {
  getSiteConfig: async (schoolId?: string) => {
    const response = await api.get("/site-config", { params: { schoolId } });
    return response.data?.data;
  },

  updateSiteConfig: async (data: any) => {
    const response = await api.patch("/site-config", data);
    return response.data?.data;
  },

  saveBuilderData: async (data: any) => {
    const response = await api.post("/site-config/builder", data);
    return response.data?.data;
  },

  // Fix: Added the missing getPublicConfig method
  getPublicConfig: async (schoolId: string) => {
    const response = await api.get(`/site-config/public/${schoolId}`);
    return response; // Returning full response so `res.data` works in page.tsx
  },
};
