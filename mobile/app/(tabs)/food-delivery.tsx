import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../src/context/AuthContext';
import { useLocale } from '../../src/context/LocaleContext';
import { useScreenTracking } from '../../src/hooks/useScreenTracking';
import { logEvent } from '../../src/services/observability';
import { apiBaseUrl } from '../../src/services/config/apiConfig';

type FoodDeliveryOrder = {
  id: string;
  restaurantName: string;
  restaurantId: string;
  status: string;
  totalCents: number;
  deliveryAddress: string;
  items: Array<{ menuItemName: string; quantity: number }>;
  createdAt: string;
  customerId: string;
};

const STATUS_COLORS: Record<string, string> = {
  ready: '#10B981',
  picked_up: '#06B6D4',
  delivered: '#16A34A',
  canceled: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  ready: 'Ready for Pickup',
  picked_up: 'En Route to Customer',
  delivered: 'Delivered',
  canceled: 'Canceled',
};

export default function FoodDeliveryScreen() {
  useScreenTracking('food_delivery');
  const { t } = useLocale();
  const { accessToken, user } = useAuth() as any;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [availableOrders, setAvailableOrders] = useState<FoodDeliveryOrder[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<FoodDeliveryOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'mine'>('available');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailable = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/food-orders/driver/available`, {
        headers: { authorization: 'Bearer ' + String(accessToken) }
      });
      const data = await res.json() as any;
      if (data.ok) setAvailableOrders(data.orders || []);
    } catch {
      // keep demo
      setAvailableOrders([
        { id: 'fo-demo-1', restaurantName: 'The Burger Spot', restaurantId: 'r1', status: 'ready', totalCents: 2498, deliveryAddress: '42 Customer St, Apt 3B', items: [{ menuItemName: 'Classic Burger', quantity: 2 }, { menuItemName: 'Fries', quantity: 1 }], createdAt: new Date().toISOString(), customerId: 'c1' },
        { id: 'fo-demo-2', restaurantName: 'Pizza Palace', restaurantId: 'r2', status: 'ready', totalCents: 3199, deliveryAddress: '99 Oak Ave', items: [{ menuItemName: 'Margherita Pizza', quantity: 1 }], createdAt: new Date().toISOString(), customerId: 'c2' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const fetchMyDeliveries = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/food-orders/driver/mine`, {
        headers: { authorization: 'Bearer ' + String(accessToken) }
      });
      const data = await res.json() as any;
      if (data.ok) setMyDeliveries(data.orders || []);
    } catch {
      setMyDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const onRefresh = useCallback(() => {
    logEvent('food_delivery_refresh_tapped');
    if (activeTab === 'available') void fetchAvailable();
    else void fetchMyDeliveries();
  }, [activeTab, fetchAvailable, fetchMyDeliveries]);

  const acceptDelivery = useCallback(async (order: FoodDeliveryOrder) => {
    if (!accessToken || !user?.id) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/food-orders/${order.id}/assign-driver`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + String(accessToken) },
        body: JSON.stringify({ driverId: user.id })
      });
      const data = await res.json() as any;
      if (data.ok) {
        logEvent('food_delivery_accepted', { orderId: order.id });
        setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
        setMyDeliveries(prev => [data.order, ...prev]);
        setActiveTab('mine');
        Alert.alert('Delivery Accepted!', `Head to ${order.restaurantName} to pick up the order.`);
      }
    } catch {
      Alert.alert('Error', 'Could not accept this delivery. Please try again.');
    }
  }, [accessToken, user]);

  const updateDeliveryStatus = useCallback(async (order: FoodDeliveryOrder, newStatus: string) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/food-orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + String(accessToken) },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json() as any;
      if (data.ok) {
        logEvent('food_delivery_status_updated', { orderId: order.id, status: newStatus });
        setMyDeliveries(prev => prev.map(o => o.id === order.id ? data.order : o));
        if (newStatus === 'delivered') {
          Alert.alert('Delivery Complete! 🎉', `Order #${order.id.slice(-6)} has been delivered. Great job!`);
        }
      }
    } catch {
      Alert.alert('Error', 'Could not update status.');
    }
  }, [accessToken]);

  const currency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="px-5 pb-2 pt-14">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">🛵 Food Delivery</Text>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Pick up and deliver food orders</Text>
      </View>

      {/* Tab Switch */}
      <View className="mx-5 mb-3 flex-row rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-1">
        {([['available', '📦 Available'], ['mine', '🗺️ My Deliveries']] as const).map(([tab, label]) => (
          <Pressable
            key={tab}
            onPress={() => {
              setActiveTab(tab);
              if (tab === 'available') void fetchAvailable();
              else void fetchMyDeliveries();
            }}
            className={`flex-1 rounded-xl py-2 ${activeTab === tab ? 'bg-white dark:bg-zinc-700 shadow-soft' : ''}`}
          >
            <Text className={`text-center text-xs font-semibold ${activeTab === tab ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'available' ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#16A34A" />}
        >
          {availableOrders.length === 0 ? (
            <View className="mt-16 items-center gap-3">
              <Ionicons name="restaurant-outline" size={48} color={isDark ? '#52525B' : '#D4D4D8'} />
              <Text className="text-center text-base font-semibold text-zinc-500 dark:text-zinc-400">No available deliveries</Text>
              <Text className="text-center text-sm text-zinc-400 dark:text-zinc-500">Pull to refresh and check for new orders</Text>
            </View>
          ) : (
            availableOrders.map(order => (
              <View key={order.id} className="rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-soft">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-zinc-900 dark:text-zinc-100">{order.restaurantName}</Text>
                    <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{order.items.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}</Text>
                  </View>
                  <Text className="text-base font-bold text-emerald-600">{currency(order.totalCents)}</Text>
                </View>
                <View className="mt-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="location-outline" size={14} color="#16A34A" />
                    <Text className="flex-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">Pickup: {order.restaurantName}</Text>
                  </View>
                  <View className="mt-1 flex-row items-center gap-2">
                    <Ionicons name="home-outline" size={14} color="#EF4444" />
                    <Text className="flex-1 text-xs text-zinc-500 dark:text-zinc-400">Drop-off: {order.deliveryAddress}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => Alert.alert('Accept Delivery?', `Pick up from ${order.restaurantName} and deliver to:\n${order.deliveryAddress}\n\nEarnings: ${currency(Math.round(order.totalCents * 0.15))}`, [
                    { text: 'Accept', onPress: () => void acceptDelivery(order) },
                    { text: 'Skip', style: 'cancel' }
                  ])}
                  className="mt-3 rounded-xl bg-emerald-600 py-3"
                >
                  <Text className="text-center text-sm font-bold text-white">Accept Delivery • {currency(Math.round(order.totalCents * 0.15))}</Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#16A34A" />}
        >
          {myDeliveries.length === 0 ? (
            <View className="mt-16 items-center gap-3">
              <Ionicons name="bag-outline" size={48} color={isDark ? '#52525B' : '#D4D4D8'} />
              <Text className="text-center text-base font-semibold text-zinc-500 dark:text-zinc-400">No active deliveries</Text>
              <Text className="text-center text-sm text-zinc-400 dark:text-zinc-500">Accept an available order to start delivering</Text>
            </View>
          ) : (
            myDeliveries.map(order => (
              <View key={order.id} className="rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-soft">
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-zinc-900 dark:text-zinc-100">{order.restaurantName}</Text>
                    <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Order #{order.id.slice(-6)}</Text>
                  </View>
                  <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: (STATUS_COLORS[order.status] ?? '#71717A') + '20' }}>
                    <Text className="text-xs font-semibold" style={{ color: STATUS_COLORS[order.status] ?? '#71717A' }}>{STATUS_LABELS[order.status] ?? order.status}</Text>
                  </View>
                </View>

                <View className="mt-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="location" size={14} color="#16A34A" />
                    <Text className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Pickup: {order.restaurantName}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="home" size={14} color="#EF4444" />
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400">Drop-off: {order.deliveryAddress}</Text>
                  </View>
                </View>

                <View className="mt-3 flex-row gap-2">
                  {order.status === 'ready' && (
                    <Pressable onPress={() => void updateDeliveryStatus(order, 'picked_up')} className="flex-1 rounded-xl bg-blue-600 py-3">
                      <Text className="text-center text-sm font-bold text-white">Confirm Pickup ✓</Text>
                    </Pressable>
                  )}
                  {order.status === 'picked_up' && (
                    <Pressable onPress={() => void updateDeliveryStatus(order, 'delivered')} className="flex-1 rounded-xl bg-emerald-600 py-3">
                      <Text className="text-center text-sm font-bold text-white">Confirm Delivery 🏠</Text>
                    </Pressable>
                  )}
                  {(order.status === 'delivered' || order.status === 'canceled') && (
                    <View className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 py-3">
                      <Text className="text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                        {order.status === 'delivered' ? '✅ Completed' : '❌ Canceled'}
                      </Text>
                    </View>
                  )}
                  <Pressable
                    onPress={() => Alert.alert('Navigate', `Navigate to ${order.status === 'ready' ? order.restaurantName : order.deliveryAddress}`, [{ text: 'OK' }])}
                    className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-3"
                  >
                    <Ionicons name="navigate-outline" size={18} color="#16A34A" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
