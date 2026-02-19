/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const SiteConfigService = {
  getSiteConfig: async (schoolId?: string) => {
    const url = schoolId ? `/site-config/${schoolId}` : "/site-config/me";
    const response = await api.get(url);
    return response.data;
  },

  updateSiteConfig: async (data: any) => {
    const response = await api.patch("/site-config/me", data);
    return response.data;
  },

  saveBuilderData: async (data: {
    gjsComponents: any;
    gjsStyles: any;
    gjsHtml: string;
    gjsCss: string;
    gjsAssets: any;
  }) => {
    const response = await api.patch("/site-config/builder", data);
    return response.data;
  },
};
