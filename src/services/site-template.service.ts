import api from "@/lib/axios";

export const SiteTemplateService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllTemplates: async (params?: any) => {
    const response = await api.get("/site-templates", { params });
    return response.data?.data;
  },

  getSingleTemplate: async (id: string) => {
    const response = await api.get(`/site-templates/${id}`);
    return response.data?.data;
  },

  createTemplate: async (data: FormData) => {
    const response = await api.post("/site-templates", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.data;
  },

  updateTemplate: async (id: string, data: FormData) => {
    const response = await api.patch(`/site-templates/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.data;
  },

  deleteTemplate: async (id: string) => {
    const response = await api.delete(`/site-templates/${id}`);
    return response.data?.data;
  },
};