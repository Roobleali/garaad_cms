"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle screen size changes
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 lg:flex">
            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-40 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
                    >
                        {isSidebarOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <img src="https://www.garaad.org/favicon.ico" alt="Garaad Logo" className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">
                            Garaad Maamul
                        </span>
                    </div>
                </div>
            </div>

            {/* Sidebar container */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0
                    transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    ${isMobile ? "w-[280px]" : "w-[280px] lg:w-[300px] xl:w-[320px]"}
                `}
            >
                <Sidebar />
            </aside>

            {/* Overlay */}
            {isSidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <main className={`
                flex-1 min-h-screen transition-all duration-300 ease-in-out
                pt-20 lg:pt-8 px-4 sm:px-6 lg:px-8 pb-8
                ${isSidebarOpen && isMobile ? 'opacity-50 lg:opacity-100' : 'opacity-100'}
            `}>
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
} 