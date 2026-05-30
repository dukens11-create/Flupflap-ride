import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { useAccessibilitySettings } from '../../src/context/AccessibilityContext';
import { useAuth } from '../../src/context/AuthContext';

const iconByRoute: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  trips: 'car',
  earnings: 'cash',
  inbox: 'mail',
  profile: 'person',
};
export default function TabLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { highContrastEnabled } = useAccessibilitySettings();
  const { state, onboardingStep } = useAuth();

  if (state !== 'signed_in') {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (onboardingStep !== 'ready') {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: highContrastEnabled ? '#FACC15' : '#16A34A',
        tabBarInactiveTintColor: highContrastEnabled ? '#FFFFFF' : isDark ? '#A1A1AA' : '#52525B',
        tabBarStyle: {
          backgroundColor: highContrastEnabled ? '#000000' : isDark ? '#111827' : '#FFFFFF',
          borderTopColor: highContrastEnabled ? '#FFFFFF' : isDark ? '#27272A' : '#E4E4E7',
          height: 72,
          paddingTop: 10,
          paddingBottom: 10,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarLabelPosition: 'below-icon',
        tabBarItemStyle: { paddingBottom: 2 },
        tabBarIcon: ({ color, size }) => <Ionicons name={iconByRoute[route.name]} size={size} color={color} />,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarAccessibilityLabel: 'Home tab' }} />
      <Tabs.Screen name="trips" options={{ title: 'Trips', tabBarAccessibilityLabel: 'Trips tab' }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarAccessibilityLabel: 'Earnings tab' }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox', tabBarAccessibilityLabel: 'Inbox tab' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarAccessibilityLabel: 'Profile tab' }} />
    </Tabs>
  );
}
