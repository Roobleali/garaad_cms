"use client";

import { useState, useEffect } from "react";
import { api } from "../api";
import DashboardLayout from "../components/DashboardLayout";
import Questions from "../components/Questions";

export default function SualahaPage() {
    const [loading, setLoading] = useState(false);

    return (
        <DashboardLayout>
            <div className="animate-fade-in space-y-6">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-blue-800 bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                        Su'aalaha
                    </h1>
                    <p className="text-gray-600 text-base sm:text-lg">
                        Halkan waxaad ka maamuli kartaa su'aalaha iyo dhibaatooyinka. Dooro ama raadso su'aal si aad u bilowdo.
                    </p>
                </div>

                <Questions />
            </div>
        </DashboardLayout>
    );
}
