import api from "@/lib/axios";

export interface GatewayStatus {
  isConfigured: boolean;
  isPaymentEnabled: boolean;
  maskedKeyId: string | null;
  keyMode: "LIVE" | "TEST" | null;
}

export interface SaveGatewayPayload {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  isPaymentEnabled: boolean;
}

const getGatewayStatus = async (): Promise<GatewayStatus> => {
  const res = await api.get("/financial/gateway/status");
  return res.data.data;
};

const saveGatewayConfig = async (payload: SaveGatewayPayload): Promise<void> => {
  await api.post("/financial/gateway", payload);
};

const togglePaymentEnabled = async (isPaymentEnabled: boolean): Promise<void> => {
  await api.patch("/financial/gateway/toggle", { isPaymentEnabled });
};

const testGatewayConnection = async (): Promise<{ success: boolean; message: string }> => {
  const res = await api.post("/financial/gateway/test");
  return { success: res.data.data?.success, message: res.data.message };
};

const removeGatewayConfig = async (): Promise<void> => {
  await api.delete("/financial/gateway");
};

export const FinancialService = {
  getGatewayStatus,
  saveGatewayConfig,
  togglePaymentEnabled,
  testGatewayConnection,
  removeGatewayConfig,
};
