"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth";
import { api, ApiError } from "../api";
import Image from "next/image";

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_premium: boolean;
    is_superuser: boolean;
    has_completed_onboarding: boolean;
}

interface LoginResponse {
    tokens: {
        access: string;
        refresh: string;
    };
    user: User;
}

interface ErrorResponse {
    status?: number;
    data?: {
        message?: string;
        detail?: string;
        error?: string;
    };
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { setTokens, isAuthenticated } = useAuthStore();

    useEffect(() => {
        // Clear any existing tokens on mount
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        if (isAuthenticated()) {
            router.replace("/");
        }
    }, [router, isAuthenticated]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log('Attempting login with email:', email);
            const res = await api.post<LoginResponse>("auth/signin/", { email, password });
            console.log('Login response:', res.data);

            const { tokens, user } = res.data;

            if (tokens.access && tokens.refresh) {
                if (!user.is_superuser) {
                    setError("Only admin users can access this panel");
                    return;
                }

                setTokens(tokens.access, tokens.refresh, user);
                router.replace("/");
            } else {
                throw new Error("Invalid response format - missing tokens");
            }
        } catch (err: unknown) {
            console.error('Login error:', err);

            if (err && typeof err === 'object' && 'response' in err) {
                const response = (err as ApiError).response as ErrorResponse;

                if (response?.status === 404) {
                    setError("Login endpoint not found. Please check the API URL.");
                } else if (response?.status === 401 || response?.status === 403) {
                    setError("Invalid email or password");
                } else if (response?.data?.message) {
                    setError(response.data.message);
                } else if (response?.data?.detail) {
                    setError(response.data.detail);
                } else if (response?.data?.error) {
                    setError(response.data.error);
                } else {
                    setError("An error occurred during login. Please try again.");
                }
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Network error occurred. Please check your connection and try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-8">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 relative">
                        <Image
                            src="https://www.garaad.org/favicon.ico"
                            alt="Garaad Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Garaad Maamul</h1>
                        <p className="mt-2 text-sm text-gray-600">Soo gal si aad u maamusho koorsooyinka</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                            placeholder="email@example.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className={`
                            w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 
                            text-white font-medium transition-all duration-200 transform 
                            ${loading || !email || !password ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5'}
                        `}
                    >
                        {loading ? 'Soo galaya...' : 'Soo gal'}
                    </button>
                </form>
            </div>
        </div>
    );
} 