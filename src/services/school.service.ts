/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const SchoolService = {
  getAllSchools: async (params: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }) => {
    const response = await api.get("/schools", { params });
    return response.data;
  },

  getSingleSchool: async (id: string) => {
    const response = await api.get(`/schools/${id}`);
    return response.data.data;
  },

  updateSchool: async (id: string, data: any) => {
    const response = await api.patch(`/schools/${id}`, data);
    return response.data;
  },

  renewSubscription: async (id: string, data: any) => {
    const response = await api.patch(`/schools/${id}/renew`, data);
    return response.data;
  },

  createRazorpayOrder: async (id: string, data: any) => {
    const response = await api.post(`/schools/${id}/razorpay/order`, data);
    return response.data.data;
  },

  verifyRazorpayPayment: async (id: string, data: any) => {
    const response = await api.post(`/schools/${id}/razorpay/verify`, data);
    return response.data;
  },

  deleteSchool: async (id: string) => {
    const response = await api.delete(`/schools/${id}`);
    return response.data;
  },
  verifyDns: async (domain: string, subdomain: string) => {
    const response = await api.get(`/schools/verify-dns`, {
      params: { domain, subdomain }
    });
    return response.data; // This will now contain { data: { aRecord, cnameRecord }, serverIp: '...' }
  },
  testSmtp: async (data: any) => {
    const response = await api.post(`/emails/test-smtp`, data);
    return response.data;
  }
};
