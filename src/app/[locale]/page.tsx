"use client";

import { useTranslationContext } from "../../providers/TranslationProvider";

export default function HomePage() {
    const { t } = useTranslationContext();

    return (
        <div>
            <h1>{t('onboarding.form.occupation.label')}</h1>
            {/* Rest of your page content */}
        </div>
    );
} 