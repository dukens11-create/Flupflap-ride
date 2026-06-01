import Constants from 'expo-constants';

type ExpoExtra = {
  mapboxToken?: string;
};

const expoExtra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

/**
 * Mapbox public access token.
 * Override at build-time via EXPO_PUBLIC_MAPBOX_TOKEN or expo.extra.mapboxToken.
 * The default value is the project's public token (pk.*) which is safe to bundle.
 */
export const mapboxToken: string =
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ||
  expoExtra.mapboxToken ||
  'pk.eyJ1IjoiZmx1cGZsYXAiLCJhIjoiY21wMjI3M3dpMDN5eTJycHMyeG8yaDZ3OCJ9.VUXlzIoU5Gxfj6-BVjnxag';
