import api from "@/lib/axios";
import { ISiteTemplate } from "@/types/site-builder";

const getAllTemplates = async (): Promise<ISiteTemplate[]> => {
  const response = await api.get("/site-templates");
  return response.data.data;
};

const getSingleTemplate = async (id: string): Promise<ISiteTemplate> => {
  const response = await api.get(`/site-templates/${id}`);
  return response.data.data;
};

const createTemplate = async (data: FormData): Promise<ISiteTemplate> => {
  const response = await api.post("/site-templates", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

const updateTemplate = async (id: string, data: FormData): Promise<ISiteTemplate> => {
  const response = await api.patch(`/site-templates/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

const deleteTemplate = async (id: string): Promise<void> => {
  await api.delete(`/site-templates/${id}`);
};

export const SiteTemplateService = {
  getAllTemplates,
  getSingleTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};