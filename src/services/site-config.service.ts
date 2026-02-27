import api from "@/lib/axios";
import { ISchoolSiteConfig, IUpdateSiteConfigPayload } from "@/types/site-builder";

const getMyConfig = async (): Promise<ISchoolSiteConfig> => {
  const response = await api.get("/site-config/me");
  return response.data.data;
};

const updateConfig = async (payload: IUpdateSiteConfigPayload): Promise<ISchoolSiteConfig> => {
  const response = await api.post("/site-config/update", payload);
  return response.data.data;
};

const getPublicConfig = async (schoolId: string): Promise<ISchoolSiteConfig> => {
  const response = await api.get(`/site-config/public/${schoolId}`);
  return response.data.data;
};

export const SiteConfigService = {
  getMyConfig,
  updateConfig,
  getPublicConfig,
};