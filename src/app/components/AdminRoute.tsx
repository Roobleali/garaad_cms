"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth';

interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const router = useRouter();
    const { isAuthenticated, isSuperuser } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace('/login');
            return;
        }

        if (!isSuperuser()) {
            router.replace('/login');
        }
    }, [router, isAuthenticated, isSuperuser]);

    return <>{children}</>;
} 