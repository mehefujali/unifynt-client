/* eslint-disable @typescript-eslint/no-explicit-any */
import instance from "@/lib/axios";

export const AdmissionService = {
  updateConfig: async (data: any) => {
    const response = await instance.post("/admission/config", data);
    return response.data;
  },

  getMySchoolConfig: async () => {
    const response = await instance.get("/admission/config");
    return response.data;
  },

  getPublicConfig: async (schoolId: string) => {
    const response = await instance.get(`/admission/public-config/${schoolId}`);
    return response.data;
  },

  submitApplication: async (
    schoolId: string,
    payload: any,
    files: Record<string, File>,
  ) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    Object.keys(files).forEach((key) => {
      formData.append(key, files[key]);
    });

    const response = await instance.post(
      `/admission/submit/${schoolId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },
};
