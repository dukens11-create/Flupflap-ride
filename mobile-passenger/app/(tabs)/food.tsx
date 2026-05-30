import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, TextInput, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../src/context/AuthContext';
import { useLocale } from '../../src/context/LocaleContext';
import { useScreenTracking } from '../../src/hooks/useScreenTracking';
import { logEvent } from '../../src/services/observability';
import { apiBaseUrl } from '../../src/services/config/apiConfig';

type Restaurant = {
  id: string;
  name: string;
  cuisineTypes: string[];
  rating: number;
  estimatedDeliveryMinutes: number;
  deliveryFeeCents: number;
  isOpen: boolean;
  address: string;
};

type FoodOrder = {
  id: string;
  restaurantName: string;
  status: string;
  totalCents: number;
  items: Array<{ menuItemName: string; quantity: number; unitPriceCents: number }>;
  createdAt: string;
};

const DEMO_RESTAURANTS: Restaurant[] = [
  { id: 'demo-1', name: 'The Burger Spot', cuisineTypes: ['burgers', 'american'], rating: 4.7, estimatedDeliveryMinutes: 25, deliveryFeeCents: 199, isOpen: true, address: '123 Main St' },
  { id: 'demo-2', name: 'Pizza Palace', cuisineTypes: ['pizza', 'italian'], rating: 4.5, estimatedDeliveryMinutes: 35, deliveryFeeCents: 249, isOpen: true, address: '456 Elm Ave' },
  { id: 'demo-3', name: 'Sushi House', cuisineTypes: ['sushi', 'japanese'], rating: 4.8, estimatedDeliveryMinutes: 40, deliveryFeeCents: 299, isOpen: false, address: '789 Oak Blvd' },
  { id: 'demo-4', name: 'Taco Town', cuisineTypes: ['tacos', 'mexican'], rating: 4.3, estimatedDeliveryMinutes: 20, deliveryFeeCents: 149, isOpen: true, address: '10 River Rd' },
  { id: 'demo-5', name: 'Noodle Bar', cuisineTypes: ['ramen', 'asian'], rating: 4.6, estimatedDeliveryMinutes: 30, deliveryFeeCents: 199, isOpen: true, address: '5 Noodle Ln' },
];

const CUISINE_FILTERS = ['All', 'Burgers', 'Pizza', 'Sushi', 'Mexican', 'Asian', 'Healthy'];

const STATUS_COLORS: Record<string, string> = {
  placed: '#F59E0B',
  confirmed: '#3B82F6',
  preparing: '#8B5CF6',
  ready: '#10B981',
  picked_up: '#06B6D4',
  delivered: '#16A34A',
  canceled: '#EF4444',
};

export default function FoodScreen() {
  useScreenTracking('food');
  const { t } = useLocale();
  const { accessToken } = useAuth() as any;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [restaurants, setRestaurants] = useState<Restaurant[]>(DEMO_RESTAURANTS);
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [activeTab, setActiveTab] = useState<'discover' | 'orders'>('discover');
  const [isLoading, setIsLoading] = useState(false);

  const fetchRestaurants = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const url = query
        ? `${apiBaseUrl}/api/restaurants/search?q=${encodeURIComponent(query)}`
        : `${apiBaseUrl}/api/restaurants/nearby`;
      const res = await fetch(url);
      const data = await res.json() as any;
      if (data.ok && data.restaurants?.length) {
        setRestaurants(data.restaurants);
      }
    } catch {
      // keep demo data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/food-orders/history`, {
        headers: { authorization: 'Bearer ' + String(accessToken) }
      });
      const data = await res.json() as any;
      if (data.ok) setOrders(data.orders || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const onRefresh = useCallback(() => {
    logEvent('food_refresh_tapped');
    if (activeTab === 'discover') {
      void fetchRestaurants(searchQuery);
    } else {
      void fetchOrders();
    }
  }, [activeTab, fetchRestaurants, fetchOrders, searchQuery]);

  const filteredRestaurants = restaurants.filter(r => {
    if (selectedCuisine !== 'All' && !r.cuisineTypes.some(c => c.toLowerCase().includes(selectedCuisine.toLowerCase()))) return false;
    if (searchQuery && !r.name.toLowerCase().includes(searchQuery.toLowerCase()) && !r.cuisineTypes.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    return true;
  });

  const currency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <View className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <View className="px-5 pb-2 pt-14">
        <Text className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">🍔 Food Delivery</Text>
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Order from local restaurants</Text>
      </View>

      {/* Tab Switch */}
      <View className="mx-5 mb-3 flex-row rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-1">
        {(['discover', 'orders'] as const).map(tab => (
          <Pressable
            key={tab}
            onPress={() => {
              setActiveTab(tab);
              if (tab === 'orders') void fetchOrders();
            }}
            className={`flex-1 rounded-xl py-2 ${activeTab === tab ? 'bg-white dark:bg-zinc-700 shadow-soft' : ''}`}
          >
            <Text className={`text-center text-sm font-semibold ${activeTab === tab ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
              {tab === 'discover' ? '🔍 Discover' : '📦 My Orders'}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'discover' ? (
        <>
          {/* Search Bar */}
          <View className="mx-5 mb-3 flex-row items-center gap-2 rounded-2xl bg-white dark:bg-zinc-900 px-4 py-3 shadow-soft">
            <Ionicons name="search-outline" size={18} color={isDark ? '#A1A1AA' : '#71717A'} />
            <TextInput
              value={searchQuery}
              onChangeText={q => { setSearchQuery(q); void fetchRestaurants(q); }}
              placeholder="Search restaurants or cuisines..."
              placeholderTextColor={isDark ? '#52525B' : '#A1A1AA'}
              className="flex-1 text-sm text-zinc-900 dark:text-zinc-100"
              returnKeyType="search"
              onSubmitEditing={() => void fetchRestaurants(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => { setSearchQuery(''); setRestaurants(DEMO_RESTAURANTS); }}>
                <Ionicons name="close-circle" size={18} color={isDark ? '#A1A1AA' : '#71717A'} />
              </Pressable>
            )}
          </View>

          {/* Cuisine Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
            {CUISINE_FILTERS.map(cuisine => (
              <Pressable
                key={cuisine}
                onPress={() => setSelectedCuisine(cuisine)}
                className={`rounded-full px-4 py-2 ${selectedCuisine === cuisine ? 'bg-emerald-600' : 'bg-white dark:bg-zinc-800'}`}
              >
                <Text className={`text-xs font-semibold ${selectedCuisine === cuisine ? 'text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>{cuisine}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Restaurant List */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#16A34A" />}
          >
            {filteredRestaurants.length === 0 ? (
              <View className="mt-16 items-center gap-3">
                <Ionicons name="restaurant-outline" size={48} color={isDark ? '#52525B' : '#D4D4D8'} />
                <Text className="text-center text-base font-semibold text-zinc-500 dark:text-zinc-400">No restaurants found</Text>
                <Text className="text-center text-sm text-zinc-400 dark:text-zinc-500">Try a different search or cuisine filter</Text>
              </View>
            ) : (
              filteredRestaurants.map(restaurant => (
                <Pressable
                  key={restaurant.id}
                  onPress={() => Alert.alert(restaurant.name, `${restaurant.cuisineTypes.join(', ')}\n${restaurant.address}\n⭐ ${restaurant.rating} · 🚀 ${restaurant.estimatedDeliveryMinutes} min · 🛵 ${currency(restaurant.deliveryFeeCents)} delivery\n\n${restaurant.isOpen ? '🟢 Open now' : '🔴 Currently closed'}`, [{ text: 'View Menu', onPress: () => logEvent('food_menu_viewed', { restaurantId: restaurant.id }) }, { text: 'Close', style: 'cancel' }])}
                  className="rounded-2xl bg-white dark:bg-zinc-900 shadow-soft overflow-hidden"
                >
                  {/* Cover placeholder */}
                  <View className="h-28 items-center justify-center bg-gradient-to-br from-emerald-900/40 to-zinc-800">
                    <Text className="text-4xl">🍽️</Text>
                  </View>
                  <View className="p-4">
                    <View className="flex-row items-start justify-between gap-2">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-zinc-900 dark:text-zinc-100">{restaurant.name}</Text>
                        <Text className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{restaurant.cuisineTypes.join(', ')}</Text>
                      </View>
                      <View className={`rounded-full px-2 py-0.5 ${restaurant.isOpen ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <Text className={`text-xs font-semibold ${restaurant.isOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                          {restaurant.isOpen ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-3 flex-row gap-4">
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{restaurant.rating.toFixed(1)}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="time-outline" size={12} color={isDark ? '#A1A1AA' : '#71717A'} />
                        <Text className="text-xs text-zinc-500 dark:text-zinc-400">{restaurant.estimatedDeliveryMinutes} min</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Ionicons name="bicycle-outline" size={12} color={isDark ? '#A1A1AA' : '#71717A'} />
                        <Text className="text-xs text-zinc-500 dark:text-zinc-400">{currency(restaurant.deliveryFeeCents)}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </>
      ) : (
        /* My Orders Tab */
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 12 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#16A34A" />}
        >
          {orders.length === 0 ? (
            <View className="mt-16 items-center gap-3">
              <Ionicons name="bag-outline" size={48} color={isDark ? '#52525B' : '#D4D4D8'} />
              <Text className="text-center text-base font-semibold text-zinc-500 dark:text-zinc-400">No food orders yet</Text>
              <Text className="text-center text-sm text-zinc-400 dark:text-zinc-500">Discover restaurants and place your first order!</Text>
              <Pressable onPress={() => setActiveTab('discover')} className="mt-2 rounded-2xl bg-emerald-600 px-6 py-3">
                <Text className="text-sm font-semibold text-white">Browse Restaurants</Text>
              </Pressable>
            </View>
          ) : (
            orders.map(order => (
              <Pressable
                key={order.id}
                onPress={() => Alert.alert('Order Details', `Order #${order.id.slice(-6)}\nStatus: ${order.status}\nTotal: ${currency(order.totalCents)}\nPlaced: ${new Date(order.createdAt).toLocaleDateString()}`)}
                className="rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-soft"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-zinc-900 dark:text-zinc-100">{order.restaurantName}</Text>
                    <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {order.items?.map(i => `${i.quantity}x ${i.menuItemName}`).join(', ')}
                    </Text>
                  </View>
                  <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: (STATUS_COLORS[order.status] ?? '#71717A') + '20' }}>
                    <Text className="text-xs font-semibold capitalize" style={{ color: STATUS_COLORS[order.status] ?? '#71717A' }}>{order.status.replace('_', ' ')}</Text>
                  </View>
                </View>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-emerald-600">{currency(order.totalCents)}</Text>
                  <Text className="text-xs text-zinc-400 dark:text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
                {order.status === 'delivered' && (
                  <Pressable
                    onPress={() => Alert.alert('Rate Order', 'How was your order?', [
                      { text: '⭐ 5 Stars', onPress: () => logEvent('food_order_rated', { orderId: order.id, rating: 5 }) },
                      { text: 'Cancel', style: 'cancel' }
                    ])}
                    className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 py-2"
                  >
                    <Text className="text-center text-xs font-semibold text-amber-600 dark:text-amber-400">⭐ Rate this order</Text>
                  </Pressable>
                )}
                {(order.status === 'picked_up' || order.status === 'preparing' || order.status === 'ready') && (
                  <View className="mt-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 py-2 px-3">
                    <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">🛵 Order on its way! Tap to track live.</Text>
                  </View>
                )}
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
