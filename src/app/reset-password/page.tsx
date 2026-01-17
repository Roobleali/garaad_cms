"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../api";
import Image from "next/image";
import Link from "next/link";
import { Loader2, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("Link-gan ma shaqaynayo ama ma jiro token. Fadlan isku day markale.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            setError("Sirtaadu (password) waa inay ka kooban tahay ugu yaraan 8 xaraf.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Labadan sir (passwords) isma waafaqsana.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await api.post("auth/reset-password/", {
                token: token,
                new_password: newPassword
            });
            setSuccess(true);

            // Redirect after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            console.error("Reset password error:", err);
            setError(err.response?.data?.error || "Link-gu wuu dhacay ama waa la isticmaalay.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Guul!</h2>
                    <p className="text-gray-600">
                        Sirtaadii si guul leh ayaa loo bedelay. Hadda waad soo geli kartaa adigoo isticmaalaya sirtaada cusub.
                    </p>
                    <div className="text-sm text-blue-600 font-medium animate-pulse">
                        Waxaa lagugu celinayaa bogga soo gelidda...
                    </div>
                    <Link
                        href="/login"
                        className="inline-block w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                        Soo gal hadda
                    </Link>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold text-gray-900">Bedelka Sirta</h1>
                        <p className="mt-2 text-sm text-gray-600">Geli sirtaada cusub qaybaha hoose.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Sirta Cusub (New Password)
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading || !token}
                                />
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 italic">Ugu yaraan 8 xaraf.</p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Xaqiiji Sirta (Confirm Password)
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading || !token}
                                />
                                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token || !newPassword || !confirmPassword}
                        className={`
                            w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 
                            text-white font-medium transition-all duration-200 flex items-center justify-center
                            ${loading || !token || !newPassword || !confirmPassword ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-md shadow-blue-200'}
                        `}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {loading ? 'Cusbooneysiinaya...' : 'Bedel Sirta'}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            Ku laabo Soo gal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
