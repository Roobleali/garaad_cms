"use client";

import React, { createContext, useContext } from 'react';
import { useTranslation } from '../hooks/useTranslation';

type TranslationContextType = {
    t: (key: string) => string;
    locale: string;
};

const TranslationContext = createContext<TranslationContextType | null>(null);

export function useTranslationContext() {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslationContext must be used within a TranslationProvider');
    }
    return context;
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
    const translation = useTranslation();

    return (
        <TranslationContext.Provider value={translation}>
            {children}
        </TranslationContext.Provider>
    );
} 