import api from "@/lib/axios";

export const SiteConfigService = {
  getMyConfig: async () => {
    const response = await api.get("/site-config/my-config");
    return response.data?.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateMyConfig: async (data: any) => {
    const response = await api.patch("/site-config/my-config", data);
    return response.data?.data;
  },
  
  getPublicSiteData: async (domain: string) => {
    const response = await api.get(`/site-config/public/${domain}`);
    return response.data?.data;
  }
};