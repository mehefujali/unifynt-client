/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const examService = {
  createExam: async (data: any) => {
    const res = await api.post("/exams", data);
    return res.data;
  },
  getAllExams: async (params?: any) => {
    const res = await api.get("/exams", { params });
    return res.data;
  },
  updateExam: async (id: string, data: any) => {
    const res = await api.patch(`/exams/${id}`, data);
    return res.data;
  },
  deleteExam: async (id: string) => {
    const res = await api.delete(`/exams/${id}`);
    return res.data;
  },

  createExamGrade: async (data: any) => {
    const res = await api.post("/exam-grade", data);
    return res.data;
  },
  getAllExamGrades: async (params?: any) => {
    const res = await api.get("/exam-grade", { params });
    return res.data?.data || res.data;
  },
  updateExamGrade: async (id: string, data: any) => {
    const res = await api.patch(`/exam-grade/${id}`, data);
    return res.data;
  },
  deleteExamGrade: async (id: string) => {
    const res = await api.delete(`/exam-grade/${id}`);
    return res.data;
  },

  createExamSchedule: async (data: any) => {
    const res = await api.post("/exam-schedules", data);
    return res.data;
  },
  getExamSchedules: async (params?: any) => {
    const res = await api.get("/exam-schedules", { params });
    return res.data?.data || res.data;
  },
  updateExamSchedule: async (id: string, data: any) => {
    const res = await api.patch(`/exam-schedules/${id}`, data);
    return res.data;
  },
  deleteExamSchedule: async (id: string) => {
    const res = await api.delete(`/exam-schedules/${id}`);
    return res.data;
  },

  getMarksGrid: async (scheduleId: string) => {
    const res = await api.get(`/marks-entry/grid/${scheduleId}`);
    return res.data?.data || res.data;
  },
  saveMarks: async (data: any) => {
    const res = await api.post("/marks-entry/save", data);
    return res.data;
  },
  lockMarks: async (data: any) => {
    const res = await api.post("/marks-entry/lock", data);
    return res.data;
  },
  calculateResults: async (data: any) => {
    const res = await api.post("/exam-results/calculate", data);
    return res.data;
  },
  getClassResults: async (params: any) => {
    const res = await api.get("/exam-results/class", { params });
    return res.data?.data || res.data;
  },
  getStudentMarksheet: async (params: any) => {
    const res = await api.get("/exam-results/marksheet", { params });
    return res.data?.data || res.data;
  },
  unlockMarks: async (data: any) => {
    const res = await api.post("/marks-entry/unlock", data);
    return res.data;
  },
};
