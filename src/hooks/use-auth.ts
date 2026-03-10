/* eslint-disable react-hooks/set-state-in-effect */
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  // null = not yet checked, false = no token, true = token exists
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [tokenData, setTokenData] = useState<AuthUser | null>(null);

  // Read token on mount (client-only, runs once)
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
        setHasToken(true);
      } catch {
        localStorage.removeItem("accessToken");
        setHasToken(false);
      }
    } else {
      setHasToken(false);
    }
  }, []);

  const {
    data: user,
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await api.get("/users/me");
      return res.data.data;
    },
    // Only fire the API call once we've confirmed a token exists in localStorage
    enabled: hasToken === true,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logout = () => {
    localStorage.removeItem("accessToken");
    // Reset in-memory auth state so the sidebar doesn't flash stale data
    setHasToken(false);
    setTokenData(null);
    // Clear cached user data from React Query
    queryClient.removeQueries({ queryKey: ["authUser"] });
    router.push("/login");
  };

  // isLoading is true in two scenarios:
  // 1. localStorage hasn't been checked yet (hasToken === null) — SSR/hydration phase
  // 2. Token exists and the /users/me API call is still in flight
  const isLoading = hasToken === null || (hasToken === true && isQueryLoading);

  // Use full API user data when available; fall back to decoded JWT payload
  // so the sidebar role/permissions are immediately available after token check
  const authUser = user || tokenData;

  return { user: authUser, isLoading, isError, error, logout };
};
