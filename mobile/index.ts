import * as Notifications from 'expo-notifications';

import './src/services/background/locationTask';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

import 'expo-router/entry';
