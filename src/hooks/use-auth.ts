import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (!token) return null;
      }
      try {
        const res = await api.get("/user/me");
        return res.data.data;
      } catch (err) {
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  return { user, isLoading, isError, error, logout };
};
