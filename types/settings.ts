export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    currency: 'BRL' | 'USD' | 'EUR';
    notifications_enabled: boolean;
    biometric_enabled: boolean;
    has_completed_onboarding: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
    theme: 'system',
    currency: 'BRL',
    notifications_enabled: true,
    biometric_enabled: false,
    has_completed_onboarding: false,
};
