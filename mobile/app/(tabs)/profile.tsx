import { useRouter } from 'expo-router';
import { Pressable, Switch, Text, View } from 'react-native';
import { useState } from 'react';

import { TEXT_SCALE_OPTIONS, useAccessibilitySettings } from '../../src/context/AccessibilityContext';
import { useAuth } from '../../src/context/AuthContext';
import { useDriveRealtime } from '../../src/context/DriveRealtimeContext';
import { driverStatusMeta } from '../../src/utils/driveStatus';

const textScaleLabel: Record<(typeof TEXT_SCALE_OPTIONS)[number], string> = {
  default: 'Default',
  large: 'Large',
  extraLarge: 'Extra large',
};

export default function ProfileScreen() {
  const { profile } = useDriveRealtime();
  const router = useRouter();
  const { signOut, onboardingStep, onboardingProfile } = useAuth();
  const { highContrastEnabled, setHighContrastEnabled, textScale, setTextScale, maxFontSizeMultiplier } = useAccessibilitySettings();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const documentsUploaded = (onboardingProfile?.documents ?? []).length;
  const verificationStatus =
    onboardingProfile?.verificationState === 'verified'
      ? 'Verified'
      : onboardingProfile?.verificationState === 'rejected'
        ? 'Needs review'
        : onboardingProfile?.verificationState === 'kyc_pending'
          ? 'In progress'
          : 'Pending';

  const handleSignOut = async () => {
    setSignOutError(null);
    try {
      await signOut();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out right now.');
    }
  };

  return (
    <View className={`flex-1 p-4 ${highContrastEnabled ? 'bg-black' : 'bg-zinc-50 dark:bg-zinc-950'}`}>
      <View className={`rounded-3xl p-5 shadow-soft ${highContrastEnabled ? 'border border-white bg-black' : 'bg-white dark:bg-zinc-900'}`}>
        <Text className={`text-xl font-bold ${highContrastEnabled ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>{profile.name}</Text>
        {profile.email ? <Text className={`mt-1 text-sm ${highContrastEnabled ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>{profile.email}</Text> : null}
        <Text className={`mt-2 text-sm ${highContrastEnabled ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Status: {driverStatusMeta[profile.status].label}</Text>
        <Text className={`mt-1 text-sm ${highContrastEnabled ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Onboarding: {onboardingStep}</Text>
        <Text className={`mt-1 text-sm ${highContrastEnabled ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Vehicle health: {profile.vehicleStatus === 'good' ? 'Good to drive' : 'Service soon'}</Text>
      </View>

      <View className={`mt-4 rounded-3xl p-5 shadow-soft ${highContrastEnabled ? 'border border-white bg-black' : 'bg-white dark:bg-zinc-900'}`}>
        <Text className={`text-base font-semibold ${highContrastEnabled ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Verification</Text>
        <Text className={`mt-2 text-sm ${highContrastEnabled ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Documents uploaded: {documentsUploaded}</Text>
        <Text className={`mt-1 text-sm ${highContrastEnabled ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Review status: {verificationStatus}</Text>
        <Text className={`mt-1 text-sm ${highContrastEnabled ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Safety tools: SOS, trip sharing, and support live on Home.</Text>
        <View className={`mt-4 rounded-2xl p-4 ${highContrastEnabled ? 'border border-white bg-black' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
          <Text className={`text-sm font-semibold ${highContrastEnabled ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Accessibility</Text>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className={`text-sm ${highContrastEnabled ? 'text-white' : 'text-zinc-700 dark:text-zinc-200'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>High contrast mode</Text>
            <Switch
              value={highContrastEnabled}
              onValueChange={setHighContrastEnabled}
              accessibilityLabel="Enable high contrast mode"
              accessibilityRole="switch"
              trackColor={{ false: '#71717A', true: '#FACC15' }}
            />
          </View>
          <Text className={`mt-4 text-sm ${highContrastEnabled ? 'text-white' : 'text-zinc-700 dark:text-zinc-200'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Text size</Text>
          <View className="mt-2 flex-row gap-2">
            {TEXT_SCALE_OPTIONS.map((option) => (
              <Pressable
                key={option}
                className={`flex-1 rounded-xl px-3 py-2 ${textScale === option ? 'bg-emerald-500' : highContrastEnabled ? 'border border-white bg-black' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                onPress={() => setTextScale(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: textScale === option }}
                accessibilityLabel={`Set text size to ${option}`}
              >
                <Text className={`text-center text-xs font-semibold ${textScale === option || highContrastEnabled ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>
                  {textScaleLabel[option]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        {onboardingStep !== 'ready' ? (
          <Pressable className="mt-4 rounded-2xl bg-emerald-500 px-4 py-3" onPress={() => router.push('/onboarding')} accessibilityRole="button" accessibilityLabel="Continue onboarding steps">
            <Text className="text-center font-semibold text-white" maxFontSizeMultiplier={maxFontSizeMultiplier}>Continue onboarding</Text>
          </Pressable>
        ) : null}
        <Pressable className={`mt-4 rounded-2xl px-4 py-3 ${highContrastEnabled ? 'border border-white bg-black' : 'bg-zinc-200 dark:bg-zinc-800'}`} onPress={() => void handleSignOut()} accessibilityRole="button" accessibilityLabel="Sign out">
          <Text className={`text-center font-semibold ${highContrastEnabled ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`} maxFontSizeMultiplier={maxFontSizeMultiplier}>Sign out</Text>
        </Pressable>
        {signOutError ? <Text className="mt-2 text-sm text-rose-500 dark:text-rose-300" maxFontSizeMultiplier={maxFontSizeMultiplier}>{signOutError}</Text> : null}
      </View>
    </View>
  );
}
