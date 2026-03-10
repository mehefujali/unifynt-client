import api from "@/lib/axios";

// --- Types & Interfaces ---
export interface EmailStats {
  availableCredits: number;
  totalSentCredits: number;
  totalCampaigns: number;
  deliveryRate: number;
}

export interface EmailPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  isActive: boolean;
}

export interface EmailTransaction {
  id: string;
  createdAt: string;
  type: "PURCHASE" | "USAGE";
  description: string;
  credits: number;
  amount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  package?: { name: string };
}

export interface PaginatedEmailResponse {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: EmailTransaction[];
}

export interface CreatePackagePayload {
  name: string;
  credits: number;
  price: number;
  isActive: boolean;
}

// --- Email API Service ---
export const EmailService = {
  getStats: async (): Promise<EmailStats> => {
    const response = await api.get("/email/stats");
    return response.data?.data;
  },

  getPackages: async (): Promise<EmailPackage[]> => {
    const response = await api.get("/email/packages");
    return response.data?.data;
  },

  createPackage: async (payload: CreatePackagePayload): Promise<EmailPackage> => {
    const response = await api.post("/email/packages", payload);
    return response.data?.data;
  },

  // NEW: Update existing package
  updatePackage: async (
    id: string,
    payload: Partial<CreatePackagePayload>,
  ): Promise<EmailPackage> => {
    const response = await api.patch(`/email/packages/${id}`, payload);
    return response.data?.data;
  },

  // NEW: Delete a package
  deletePackage: async (id: string) => {
    const response = await api.delete(`/email/packages/${id}`);
    return response.data?.data;
  },

  initiateRecharge: async (payload: { packageId: string }) => {
    const response = await api.post("/email/recharge/initiate", payload);
    return response.data?.data;
  },

  verifyAndCompleteRecharge: async (payload: {
    transactionId: string;
    referenceId: string;
  }) => {
    const response = await api.post("/email/recharge/verify", payload);
    return response.data?.data;
  },

  getEmailTransactions: async (params: {
    page: number;
    limit: number;
  }): Promise<PaginatedEmailResponse> => {
    const response = await api.get("/email/transactions", { params });
    return response.data?.data;
  },
  assignPackageToSchool: async (payload: {
    schoolId: string;
    packageId: string;
    referenceId?: string;
  }) => {
    const response = await api.post("/email/assign", payload);
    return response.data;
  },
  sendEmailMessage: async (payload: {
    targetType: "STUDENTS" | "TEACHERS";
    classId?: string;
    sectionId?: string;
    subject: string;
    message: string;
  }) => {
    const response = await api.post("/email/send", payload);
    return response.data?.data;
  },
};
