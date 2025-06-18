"use client";

import ClientWrapper from "../../components/ClientWrapper";

export default function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    return (
        <ClientWrapper locale={params.locale}>
            {children}
        </ClientWrapper>
    );
} 