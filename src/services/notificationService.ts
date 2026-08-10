import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNotificationStore } from '@/store/notificationStore';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: any = null;

try {
  // Use require so that if the module throws upon evaluation in Expo Go, it is caught here
  Notifications = require('expo-notifications');
  
  // Configure how notifications should be handled in the foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    } as any),
  });
} catch (e) {
  console.log('expo-notifications is not available in this Expo Go environment. Fallbacks will be used.');
}

export class NotificationService {
  /**
   * Request permissions and get the Expo Push Token for remote notifications.
   */
  static async registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (isExpoGo || !Notifications) {
      console.log('Push notifications are not supported in Expo Go. Skipping push registration.');
      return undefined;
    }

    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return undefined;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return undefined;
    }

    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId 
        ?? Constants?.easConfig?.projectId;
        
      if (!projectId) {
        console.warn('Project ID not found. Ensure it is configured in app.json if using EAS.');
      }

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token:', token);
      return token;
    } catch (e) {
      console.log('Error getting push token', e);
      return undefined;
    }
  }

  /**
   * Schedule a local OS notification (appears in the system tray).
   */
  static async scheduleLocalNotification(title: string, body: string, data?: any) {
    if (Notifications) {
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: data || {},
          },
          trigger: null, // Send immediately
        });
      } catch (e) {
        console.log('Failed to schedule local notification:', e);
      }
    }
    
    // Also save it to the in-app notification center
    useNotificationStore.getState().addNotification({
      title,
      body,
      type: 'info',
    });
  }

  /**
   * Show a quick in-app toast message.
   */
  static showToast(
    type: 'success' | 'error' | 'info', 
    title: string, 
    message?: string
  ) {
    Toast.show({
      type,
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 50,
    });
  }

  /**
   * Creates an alert in the Notification Center and shows a Toast.
   */
  static notify(
    type: 'success' | 'error' | 'info' | 'warning', 
    title: string, 
    body: string,
    showToast: boolean = true
  ) {
    // Add to Notification Center history
    useNotificationStore.getState().addNotification({
      title,
      body,
      type,
    });

    // Show toast if requested
    if (showToast) {
      const toastType = type === 'warning' ? 'error' : type; // toast-message uses error for warnings typically
      this.showToast(toastType, title, body);
    }
  }
}
