import { Pressable, Text, View } from 'react-native';

import { useAuth } from '../../src/context/AuthContext';
import { useDriveRealtime } from '../../src/context/DriveRealtimeContext';
import { driverStatusMeta } from '../../src/utils/driveStatus';

export default function ProfileScreen() {
  const { profile } = useDriveRealtime();
  const { signOut, onboardingStep } = useAuth();

  return (
    <View className="flex-1 bg-zinc-50 p-4 dark:bg-zinc-950">
      <View className="rounded-3xl bg-white p-5 shadow-soft dark:bg-zinc-900">
        <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{profile.name}</Text>
        {profile.email ? <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{profile.email}</Text> : null}
        <Text className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Status: {driverStatusMeta[profile.status].label}</Text>
        <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Onboarding: {onboardingStep}</Text>
        <Text className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Vehicle health: {profile.vehicleStatus === 'good' ? 'Good to drive' : 'Service soon'}</Text>
        <Pressable className="mt-4 rounded-2xl bg-zinc-200 px-4 py-3 dark:bg-zinc-800" onPress={() => void signOut()}>
          <Text className="text-center font-semibold text-zinc-900 dark:text-zinc-100">Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}
