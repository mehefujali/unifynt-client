/* eslint-disable react-hooks/set-state-in-effect */
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthUser {
  userId: string;
  email: string;
  role: string;
  schoolId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const useAuth = () => {
  const router = useRouter();
  const [tokenData, setTokenData] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        setTokenData(JSON.parse(jsonPayload));
      } catch (e) {
        localStorage.removeItem("accessToken");
      }
    }
  }, []);

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;

      const res = await api.get("/users/me");
      return res.data.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  const authUser = user || tokenData;

  return { user: authUser, isLoading, isError, error, logout };
};
