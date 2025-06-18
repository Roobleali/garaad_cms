"use client";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-600 font-medium">Soo loading...</p>
            </div>
        </div>
    );
} 