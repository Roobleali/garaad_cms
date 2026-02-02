"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../api";
import DashboardLayout from "../components/DashboardLayout";
import Questions from "../components/Questions";
import { Plus } from "lucide-react";

export default function SualahaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                            Su&apos;aalaha
                        </h1>
                        <p className="text-gray-600 text-base sm:text-lg">
                            Halkan waxaad ka maamuli kartaa su&apos;aalaha iyo dhibaatooyinka. Dooro ama raadso su&apos;aal si aad u bilowdo.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push('/sualaha/cusub')}
                        className="flex-shrink-0 h-14 px-8 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-3 transform hover:-translate-y-1 active:scale-95"
                    >
                        <Plus className="w-6 h-6" />
                        <span>Su&apos;aal cusub</span>
                    </button>
                </div>

                <Questions />
            </div>
        </DashboardLayout>
    );
}
