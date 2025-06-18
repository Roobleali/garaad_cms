"use client";
import { useEffect, useState, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { api } from "../api";
import dynamic from 'next/dynamic';

const LoadingScreen = dynamic(() => import("./LoadingScreen"), {
    loading: () => (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    ),
});

function isTokenValid(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = payload.exp * 1000;
        return (expirationTime - Date.now()) > 5 * 60 * 1000;
    } catch {
        return false;
    }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        const response = await api.post("auth/refresh/", { refresh: refreshToken });
        return response.data.access;
    } catch (error) {
        console.error("Failed to refresh token:", error);
        return null;
    }
}

function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { setTokens, clearTokens } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        const checkAuth = async () => {
            try {
                if (pathname === "/login") {
                    setIsChecking(false);
                    return;
                }

                const token = localStorage.getItem("token");
                const refreshToken = localStorage.getItem("refreshToken");
                let valid = token && isTokenValid(token);

                if (!valid && refreshToken) {
                    const newToken = await refreshAccessToken(refreshToken);
                    if (newToken && mounted) {
                        const user = JSON.parse(localStorage.getItem("user") || "null");
                        setTokens(newToken, refreshToken, user);
                        valid = true;
                    } else if (mounted) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("refreshToken");
                        clearTokens();
                        router.replace("/login");
                    }
                }

                if (mounted) {
                    if (pathname === "/login") {
                        if (valid && refreshToken) {
                            router.replace("/");
                        }
                    } else if (!valid || !refreshToken) {
                        router.replace("/login");
                    }

                    // Set a timeout to prevent infinite loading state
                    timeoutId = setTimeout(() => {
                        if (mounted) {
                            setIsChecking(false);
                        }
                    }, 5000);
                }
            } catch (error) {
                console.error("Auth check error:", error);
                if (mounted && pathname !== "/login") {
                    router.replace("/login");
                }
                if (mounted) {
                    setIsChecking(false);
                }
            }
        };

        checkAuth();

        return () => {
            mounted = false;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [router, pathname, setTokens, clearTokens]);

    if (isChecking && pathname !== "/login") {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}

export default memo(AuthGuard); 