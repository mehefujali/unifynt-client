/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/lib/axios";

export const AdmissionService = {
  getPublicData: async (schoolId: string) => {
    const res = await axiosInstance.get(`/admission/public-config/${schoolId}`);
    return res.data;
  },

  submitApplication: async (schoolId: string, formData: FormData) => {
    const res = await axiosInstance.post(
      `/admission/submit/${schoolId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  },

  getApplications: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    classId?: string;
  }) => {
    const res = await axiosInstance.get(`/admission/applications`, {
      params,
    });
    return res.data;
  },

  getApplicationById: async (id: string) => {
    const res = await axiosInstance.get(`/admission/applications/${id}`);
    return res.data;
  },

  approveApplication: async (data: { id: string; sectionId: string }) => {
    const res = await axiosInstance.patch(`/admission/approve/${data.id}`, {
      sectionId: data.sectionId,
    });
    return res.data;
  },

  getConfig: async () => {
    const res = await axiosInstance.get(`/admission/config`);
    return res.data;
  },

  updateConfig: async (data: any) => {
    const res = await axiosInstance.post(`/admission/config`, data);
    return res.data;
  },

  exportApplications: async (params?: {
    status?: string;
    search?: string;
    classId?: string;
  }) => {
    const res = await axiosInstance.get(`/admission/applications/export`, {
      params,
    });
    return res.data;
  },

  verifyPayment: async (schoolId: string, data: any) => {
    const res = await axiosInstance.post(
      `/admission/verify-payment/${schoolId}`,
      data
    );
    return res.data;
  },

  updateStatus: async (id: string, data: { status?: string; paymentStatus?: string }) => {
    const res = await axiosInstance.patch(`/admission/status/${id}`, data);
    return res.data;
  },
};