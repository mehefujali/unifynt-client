import api from "@/lib/axios";

// --- Types & Interfaces ---
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

export interface CreatePackagePayload {
  name: string;
  credits: number;
  price: number;
  isActive: boolean;
}

// --- SMS API Service ---
export const SmsService = {
  getStats: async (): Promise<SmsStats> => {
    const response = await api.get("/sms/stats");
    return response.data?.data;
  },

  getPackages: async (): Promise<SmsPackage[]> => {
    const response = await api.get("/sms/packages");
    return response.data?.data;
  },

  createPackage: async (payload: CreatePackagePayload): Promise<SmsPackage> => {
    const response = await api.post("/sms/packages", payload);
    return response.data?.data;
  },

  // NEW: Update existing package
  updatePackage: async (
    id: string,
    payload: Partial<CreatePackagePayload>,
  ): Promise<SmsPackage> => {
    const response = await api.patch(`/sms/packages/${id}`, payload);
    return response.data?.data;
  },

  // NEW: Delete a package
  deletePackage: async (id: string) => {
    const response = await api.delete(`/sms/packages/${id}`);
    return response.data?.data;
  },

  initiateRecharge: async (payload: { packageId: string }) => {
    const response = await api.post("/sms/recharge/initiate", payload);
    return response.data?.data;
  },

  verifyAndCompleteRecharge: async (payload: {
    transactionId: string;
    referenceId: string;
  }) => {
    const response = await api.post("/sms/recharge/verify", payload);
    return response.data?.data;
  },

  getSmsTransactions: async (params: {
    page: number;
    limit: number;
  }): Promise<PaginatedSmsResponse> => {
    const response = await api.get("/sms/transactions", { params });
    return response.data?.data;
  },
  assignPackageToSchool: async (payload: {
    schoolId: string;
    packageId: string;
    referenceId?: string;
  }) => {
    const response = await api.post("/sms/assign", payload);
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
