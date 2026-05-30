import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type MapOverlayControlsProps = {
  onEmergency: () => void;
  onRecenter: () => void;
  onShareTrip: () => void;
  onSupport: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOverview: () => void;
  showOverview?: boolean;
  highContrastEnabled?: boolean;
};

const actionAccessibilityLabel: Record<string, string> = {
  SOS: 'Call emergency support',
  Share: 'Share trip status',
  Help: 'Open safety support information',
};

export const MapOverlayControls = ({
  onEmergency,
  onRecenter,
  onShareTrip,
  onSupport,
  onZoomIn,
  onZoomOut,
  onOverview,
  showOverview = false,
  highContrastEnabled = false,
}: MapOverlayControlsProps) => (
  <View className="absolute bottom-80 right-4 z-20 gap-3">
    <QuickActionButton tone="danger" label="SOS" icon="warning" onPress={onEmergency} highContrastEnabled={highContrastEnabled} />
    <QuickActionButton tone="neutral" label="Share" icon="share-social" onPress={onShareTrip} highContrastEnabled={highContrastEnabled} />
    <QuickActionButton tone="neutral" label="Help" icon="help-buoy" onPress={onSupport} highContrastEnabled={highContrastEnabled} />
    {showOverview ? (
      <Pressable
        className={`h-12 w-12 items-center justify-center rounded-2xl shadow-soft ${highContrastEnabled ? 'border border-white bg-black' : 'bg-white dark:bg-zinc-900'}`}
        onPress={onOverview}
        accessibilityRole="button"
        accessibilityLabel="Show full route overview"
      >
        <Ionicons name="map" size={18} color={highContrastEnabled ? '#FACC15' : '#2563EB'} />
      </Pressable>
    ) : null}
    <Pressable
      className={`h-12 w-12 items-center justify-center rounded-2xl shadow-soft ${highContrastEnabled ? 'border border-white bg-black' : 'bg-white dark:bg-zinc-900'}`}
      onPress={onZoomIn}
      accessibilityRole="button"
      accessibilityLabel="Zoom in map"
    >
      <Ionicons name="add" size={20} color={highContrastEnabled ? '#FFFFFF' : '#0F172A'} />
    </Pressable>
    <Pressable
      className={`h-12 w-12 items-center justify-center rounded-2xl shadow-soft ${highContrastEnabled ? 'border border-white bg-black' : 'bg-white dark:bg-zinc-900'}`}
      onPress={onZoomOut}
      accessibilityRole="button"
      accessibilityLabel="Zoom out map"
    >
      <Ionicons name="remove" size={20} color={highContrastEnabled ? '#FFFFFF' : '#0F172A'} />
    </Pressable>
    <Pressable
      className={`h-14 w-14 items-center justify-center rounded-2xl shadow-soft ${highContrastEnabled ? 'border border-white bg-black' : 'bg-white dark:bg-zinc-900'}`}
      onPress={onRecenter}
      accessibilityRole="button"
      accessibilityLabel="Recenter map on driver location"
    >
      <Ionicons name="locate" size={22} color={highContrastEnabled ? '#FACC15' : '#16A34A'} />
    </Pressable>
  </View>
);

const QuickActionButton = ({
  icon,
  label,
  onPress,
  tone,
  highContrastEnabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone: 'danger' | 'neutral';
  highContrastEnabled: boolean;
}) => (
  <Pressable
    className={`items-center rounded-2xl px-2 py-2 shadow-soft ${tone === 'danger' ? 'bg-rose-500' : highContrastEnabled ? 'border border-white bg-black' : 'bg-white dark:bg-zinc-900'}`}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={actionAccessibilityLabel[label] ?? label}
  >
    <Ionicons name={icon} size={18} color={tone === 'danger' ? '#FFFFFF' : highContrastEnabled ? '#FACC15' : '#16A34A'} />
    <Text className={`mt-1 text-[10px] font-semibold ${tone === 'danger' || highContrastEnabled ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>{label}</Text>
  </Pressable>
);
