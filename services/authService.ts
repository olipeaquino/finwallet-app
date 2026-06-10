import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'biometric_auth_enabled';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export const authService = {
    async isAvailable(): Promise<boolean> {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            return compatible && enrolled;
        } catch (error) {
            console.error('Error checking biometric availability:', error);
            return false;
        }
    },

    async getBiometricType(): Promise<BiometricType> {
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                return 'facial';
            }
            if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                return 'fingerprint';
            }
            if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                return 'iris';
            }
            return 'none';
        } catch (error) {
            return 'none';
        }
    },

    async getBiometricLabel(): Promise<string> {
        const type = await this.getBiometricType();
        switch (type) {
            case 'facial':
                return 'Face ID';
            case 'fingerprint':
                return 'Digital';
            case 'iris':
                return 'Íris';
            default:
                return 'Biometria';
        }
    },

    async authenticate(promptMessage?: string): Promise<{ success: boolean; error?: string }> {
        try {
            const isAvailable = await this.isAvailable();
            if (!isAvailable) {
                return { success: false, error: 'Biometria não disponível neste dispositivo' };
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: promptMessage || 'Autentique para acessar o FinWallet',
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false,
                fallbackLabel: 'Usar senha',
            });

            if (result.success) {
                return { success: true };
            }

            if (result.error === 'user_cancel') {
                return { success: false, error: 'Autenticação cancelada' };
            }
            if (result.error === 'lockout') {
                return { success: false, error: 'Muitas tentativas. Tente novamente mais tarde.' };
            }

            return { success: false, error: 'Falha na autenticação' };
        } catch (error) {
            console.error('Authentication error:', error);
            return { success: false, error: 'Erro durante autenticação' };
        }
    },

    async isEnabled(): Promise<boolean> {
        try {
            const enabled = await AsyncStorage.getItem(STORAGE_KEY);
            return enabled === 'true';
        } catch {
            return false;
        }
    },

    async setEnabled(enabled: boolean): Promise<void> {
        await AsyncStorage.setItem(STORAGE_KEY, enabled.toString());
    },
};
