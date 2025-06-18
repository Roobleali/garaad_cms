"use client";

import dynamic from 'next/dynamic';

const AuthGuard = dynamic(() => import('./AuthGuard'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    ),
});

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
} 