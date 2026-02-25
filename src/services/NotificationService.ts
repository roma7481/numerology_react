import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const CHANNEL_ID = 'daily-numerology';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export class NotificationService {
    static async registerForPushNotificationsAsync() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
                name: 'Daily Numerology',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#9d4edd',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            return finalStatus === 'granted';
        }
        return false;
    }

    static async scheduleDailyNotification(hour: number, minute: number, title: string, body: string) {
        await this.cancelAllNotifications();

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
                ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });
    }

    static async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
}
