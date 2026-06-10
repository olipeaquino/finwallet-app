import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings, DEFAULT_SETTINGS } from '@/types';

interface SettingsState extends UserSettings {
    setTheme: (theme: UserSettings['theme']) => void;
    setCurrency: (currency: UserSettings['currency']) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
    setBiometricEnabled: (enabled: boolean) => void;
    setHasCompletedOnboarding: (completed: boolean) => void;
    resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...DEFAULT_SETTINGS,

            setTheme: (theme) => set({ theme }),
            setCurrency: (currency) => set({ currency }),
            setNotificationsEnabled: (enabled) => set({ notifications_enabled: enabled }),
            setBiometricEnabled: (enabled) => set({ biometric_enabled: enabled }),
            setHasCompletedOnboarding: (completed) => set({ has_completed_onboarding: completed }),
            resetSettings: () => set(DEFAULT_SETTINGS),
        }),
        {
            name: 'finwallet-settings',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
