"use client";

import { useParams } from "next/navigation";
import soTranslations from "../translations/so.json";
import enTranslations from "../translations/en.json";

type TranslationType = typeof soTranslations;
type NestedValue = string | Record<string, unknown>;

const translations: Record<string, TranslationType> = {
  so: soTranslations,
  en: enTranslations,
};

export function useTranslation() {
  const params = useParams();
  const locale = (params?.locale as string) || "so";

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: NestedValue = translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k] as NestedValue;
      } else {
        return key; // Return the key if translation is not found
      }
    }

    return typeof value === "string" ? value : key;
  };

  return { t, locale };
}
