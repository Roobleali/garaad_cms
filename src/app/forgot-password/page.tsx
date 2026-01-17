"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../api";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post("auth/forgot-password/", { email });
            setSubmitted(true);
        } catch (err: any) {
            console.error("Forgot password error:", err);
            setError("Khalad ayaa dhacay. Fadlan xaqiiji in email-kaagu sax yahay.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Email ayaa la diray</h2>
                    <p className="text-gray-600">
                        Haddii email-kaas uu nala diiwaangashan yahay, waxaan ku soo dirnay linkigii aad sirta ku bedelan lahayd.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                        Ku laabo Soo gal (Login)
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
                        <h1 className="text-2xl font-bold text-gray-900">Soo celinta Sirta</h1>
                        <p className="mt-2 text-sm text-gray-600">Geli email-kaaga si aan kuugu soo dirno linkiga dib loogu soo celiyo sirta.</p>
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

                    <button
                        type="submit"
                        disabled={loading || !email}
                        className={`
                            w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 
                            text-white font-medium transition-all duration-200 flex items-center justify-center
                            ${loading || !email ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 shadow-md shadow-blue-200'}
                        `}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {loading ? 'Diraya...' : 'Dir Linkiga'}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Ku laabo Soo gal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
