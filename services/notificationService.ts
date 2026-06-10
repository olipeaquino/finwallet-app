// @ts-nocheck
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const STORAGE_KEYS = {
    DAILY_REMINDER: 'notification_daily_reminder',
    GOAL_ALERTS: 'notification_goal_alerts',
    REMINDER_TIME: 'notification_reminder_time',
};

export const notificationService = {
    async requestPermission(): Promise<boolean> {
        if (!Device.isDevice) {
            console.log('Notifications require a physical device');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Permission not granted for notifications');
            return false;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'FinWallet',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#047857',
            });
        }

        return true;
    },

    async scheduleDailyReminder(hour: number = 20, minute: number = 0): Promise<string | null> {
        try {
            await this.cancelDailyReminder();

            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '💰 Registre suas despesas',
                    body: 'Não esqueça de registrar os gastos de hoje no FinWallet!',
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour,
                    minute,
                },
            });

            await AsyncStorage.setItem(STORAGE_KEYS.DAILY_REMINDER, identifier);
            await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_TIME, JSON.stringify({ hour, minute }));

            console.log('Daily reminder scheduled:', identifier);
            return identifier;
        } catch (error) {
            console.error('Error scheduling daily reminder:', error);
            return null;
        }
    },

    async cancelDailyReminder(): Promise<void> {
        try {
            const identifier = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER);
            if (identifier) {
                await Notifications.cancelScheduledNotificationAsync(identifier);
                await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_REMINDER);
            }
        } catch (error) {
            console.error('Error canceling daily reminder:', error);
        }
    },

    async isDailyReminderEnabled(): Promise<boolean> {
        const identifier = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_REMINDER);
        return !!identifier;
    },

    async getReminderTime(): Promise<{ hour: number; minute: number }> {
        try {
            const time = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_TIME);
            if (time) {
                return JSON.parse(time);
            }
        } catch (error) {
            console.error('Error getting reminder time:', error);
        }
        return { hour: 20, minute: 0 };
    },

    async scheduleGoalAlert(goalId: string, goalName: string, deadline: Date): Promise<string | null> {
        try {
            const alertDate = new Date(deadline);
            alertDate.setDate(alertDate.getDate() - 7);

            if (alertDate <= new Date()) {
                return null;
            }

            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🎯 Meta próxima do vencimento',
                    body: `Sua meta "${goalName}" vence em 7 dias! Continue firme! 💪`,
                    data: { goalId },
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: alertDate,
                },
            });

            const alerts = await this.getGoalAlerts();
            alerts[goalId] = identifier;
            await AsyncStorage.setItem(STORAGE_KEYS.GOAL_ALERTS, JSON.stringify(alerts));

            console.log('Goal alert scheduled:', identifier);
            return identifier;
        } catch (error) {
            console.error('Error scheduling goal alert:', error);
            return null;
        }
    },

    async cancelGoalAlert(goalId: string): Promise<void> {
        try {
            const alerts = await this.getGoalAlerts();
            const identifier = alerts[goalId];
            if (identifier) {
                await Notifications.cancelScheduledNotificationAsync(identifier);
                delete alerts[goalId];
                await AsyncStorage.setItem(STORAGE_KEYS.GOAL_ALERTS, JSON.stringify(alerts));
            }
        } catch (error) {
            console.error('Error canceling goal alert:', error);
        }
    },

    async getGoalAlerts(): Promise<Record<string, string>> {
        try {
            const alerts = await AsyncStorage.getItem(STORAGE_KEYS.GOAL_ALERTS);
            return alerts ? JSON.parse(alerts) : {};
        } catch (error) {
            return {};
        }
    },

    async sendInstantNotification(title: string, body: string): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: null,
        });
    },

    async getAllScheduled(): Promise<Notifications.NotificationRequest[]> {
        return await Notifications.getAllScheduledNotificationsAsync();
    },

    async cancelAll(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_REMINDER);
        await AsyncStorage.removeItem(STORAGE_KEYS.GOAL_ALERTS);
    },
};
