import api from "@/lib/axios";

export interface IInquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  schoolId: string;
  createdAt: string;
}

interface IResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

export const InquiryService = {
  submitInquiry: async (schoolId: string, data: { name: string; email: string; message: string }) => {
    const res = await api.post<IResponse<IInquiry>>(`/inquiries/public/${schoolId}`, data);
    return res.data;
  },

  getInquiries: async () => {
    const res = await api.get<IResponse<IInquiry[]>>(`/inquiries`);
    return res.data;
  },
};

