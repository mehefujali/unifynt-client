/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const PeriodService = {
    createPeriod: async (data: any) => {
        const response = await api.post("/periods", data);
        return response.data;
    },
    getAllPeriods: async (params?: any) => {
        const response = await api.get("/periods", { params });
        return response.data;
    },
    updatePeriod: async (id: string, data: any) => {
        const response = await api.patch(`/periods/${id}`, data);
        return response.data;
    },
    deletePeriod: async (id: string) => {
        const response = await api.delete(`/periods/${id}`);
        return response.data;
    },
};