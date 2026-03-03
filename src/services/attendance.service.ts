/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const attendanceService = {
  getDailyGrid: async (params: Record<string, any>) => {
    const res = await api.get("/attendance/grid", { params });
    return res.data.data;
  },
  saveDailyAttendance: async (data: Record<string, any>) => {
    const res = await api.post("/attendance/save", data);
    return res.data;
  },
  getAttendanceReport: async (params: Record<string, any>) => {
    const res = await api.get("/attendance/report", { params });
    return res.data.data;
  },
};