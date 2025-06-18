"use client";

import { TranslationProvider } from "../providers/TranslationProvider";
import ClientAuthGuard from "../app/components/ClientAuthGuard";

export default function ClientWrapper({
    children,
    locale,
}: {
    children: React.ReactNode;
    locale: string;
}) {
    return (
        <TranslationProvider>
            <ClientAuthGuard>{children}</ClientAuthGuard>
        </TranslationProvider>
    );
} 