import api from "@/lib/axios";

export interface SmsStats {
  availableCredits: number;
  totalSentCredits: number;
  totalCampaigns: number;
  deliveryRate: number;
}

export interface SmsPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  isActive: boolean;
}

export interface SmsTransaction {
  id: string;
  createdAt: string;
  type: "PURCHASE" | "USAGE";
  description: string;
  credits: number;
  amount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  package?: { name: string };
}

export interface PaginatedSmsResponse {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: SmsTransaction[];
}

export const SmsService = {
  getStats: async (): Promise<SmsStats> => {
    const response = await api.get("/sms/stats");
    return response.data?.data;
  },

  getPackages: async (): Promise<SmsPackage[]> => {
    const response = await api.get("/sms/packages");
    return response.data?.data;
  },

  initiateRecharge: async (packageId: string) => {
    const response = await api.post("/sms/recharge/initiate", { packageId });
    return response.data?.data;
  },

  verifyRecharge: async (transactionId: string, referenceId: string) => {
    const response = await api.post("/sms/recharge/verify", {
      transactionId,
      referenceId,
    });
    return response.data?.data;
  },

  getTransactions: async (
    page = 1,
    limit = 10,
  ): Promise<PaginatedSmsResponse> => {
    const response = await api.get(
      `/sms/transactions?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  sendSmsMessage: async (payload: {
    targetType: "STUDENTS" | "TEACHERS";
    classId?: string;
    sectionId?: string;
    message: string;
  }) => {
    const response = await api.post("/sms/send", payload);
    return response.data?.data;
  },
};
