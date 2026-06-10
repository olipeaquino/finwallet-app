import * as Haptics from 'expo-haptics';

export const hapticService = {
    light: async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
        }
    },

    medium: async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
        }
    },

    heavy: async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (error) {
        }
    },

    success: async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
        }
    },

    warning: async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (error) {
        }
    },

    error: async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
        }
    },

    selection: async () => {
        try {
            await Haptics.selectionAsync();
        } catch (error) {
        }
    },
};
