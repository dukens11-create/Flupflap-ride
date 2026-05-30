import { makeId, store } from './data.store';
import type { FoodOrderItem, FoodOrderStatus } from './data.store';

const now = () => new Date().toISOString();

// ─── Order Creation ────────────────────────────────────────────────────────

export async function create(body: any) {
  const customerId = body?.actor?.id || body?.customerId;
  const restaurantId = body?.restaurantId;

  const restaurant = store.restaurants.get(restaurantId);
  if (!restaurant) return { ok: false, error: 'Restaurant not found' };
  if (!restaurant.isOpen || restaurant.status !== 'active') {
    return { ok: false, error: 'Restaurant is currently closed' };
  }

  const rawItems: any[] = body?.items || [];
  if (!rawItems.length) return { ok: false, error: 'Order must have at least one item' };

  const items: FoodOrderItem[] = [];
  let subtotalCents = 0;

  for (const raw of rawItems) {
    const menuItem = store.menuItems.get(raw.menuItemId);
    if (!menuItem || menuItem.restaurantId !== restaurantId) {
      return { ok: false, error: `Menu item ${raw.menuItemId} not found` };
    }
    if (!menuItem.isAvailable) {
      return { ok: false, error: `${menuItem.name} is currently unavailable` };
    }
    const variant = menuItem.variants.find(v => v.id === raw.variantId);
    const variantDeltaCents = variant?.priceDeltaCents || 0;
    const unitPriceCents = menuItem.priceCents + variantDeltaCents;
    const quantity = Number(raw.quantity || 1);
    subtotalCents += unitPriceCents * quantity;
    items.push({
      menuItemId: menuItem.id,
      menuItemName: menuItem.name,
      quantity,
      unitPriceCents: menuItem.priceCents,
      variantId: variant?.id,
      variantName: variant?.name,
      variantDeltaCents,
      specialRequest: raw.specialRequest
    });
  }

  if (subtotalCents < restaurant.minimumOrderCents) {
    return {
      ok: false,
      error: `Minimum order is $${(restaurant.minimumOrderCents / 100).toFixed(2)}`
    };
  }

  const deliveryFeeCents = restaurant.deliveryFeeCents;
  const taxCents = Math.round(subtotalCents * restaurant.taxRatePercent / 100);
  const totalCents = subtotalCents + deliveryFeeCents + taxCents;

  const id = makeId('ford');
  const order = {
    id,
    customerId,
    restaurantId,
    restaurantName: restaurant.name,
    driverId: undefined as string | undefined,
    items,
    status: 'placed' as FoodOrderStatus,
    subtotalCents,
    deliveryFeeCents,
    taxCents,
    totalCents,
    deliveryAddress: body?.deliveryAddress || '',
    deliveryLat: body?.deliveryLat,
    deliveryLng: body?.deliveryLng,
    specialRequest: body?.specialRequest,
    paymentMethod: body?.paymentMethod || 'card',
    paymentStatus: 'pending' as const,
    estimatedDeliveryMinutes: restaurant.estimatedDeliveryMinutes,
    createdAt: now(),
    updatedAt: now()
  };

  store.foodOrders.set(id, order);
  return { module: 'food-order', action: 'create', ok: true, order };
}

export async function get(body: any, params: any) {
  const id = params?.orderId || body?.orderId;
  const order = store.foodOrders.get(id);
  if (!order) return { ok: false, error: 'Order not found' };
  return { module: 'food-order', action: 'get', ok: true, order };
}

export async function history(body: any, _params: any, query: any) {
  const customerId = body?.actor?.id || body?.customerId;
  let orders = Array.from(store.foodOrders.values()).filter(o => o.customerId === customerId);
  if (query?.status) orders = orders.filter(o => o.status === query.status);
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { module: 'food-order', action: 'history', ok: true, orders };
}

export async function cancel(body: any, params: any) {
  const id = params?.orderId || body?.orderId;
  const order = store.foodOrders.get(id);
  if (!order) return { ok: false, error: 'Order not found' };
  const cancellable: FoodOrderStatus[] = ['placed', 'confirmed'];
  if (!cancellable.includes(order.status)) {
    return { ok: false, error: `Cannot cancel order with status: ${order.status}` };
  }
  const updated = {
    ...order,
    status: 'canceled' as FoodOrderStatus,
    canceledAt: now(),
    cancellationReason: body?.reason || 'Customer canceled',
    updatedAt: now()
  };
  store.foodOrders.set(id, updated);
  return { module: 'food-order', action: 'cancel', ok: true, order: updated };
}

export async function updateStatus(body: any, params: any) {
  const id = params?.orderId || body?.orderId;
  const order = store.foodOrders.get(id);
  if (!order) return { ok: false, error: 'Order not found' };
  const status = body?.status as FoodOrderStatus;

  const validTransitions: Record<FoodOrderStatus, FoodOrderStatus[]> = {
    placed: ['confirmed', 'canceled'],
    confirmed: ['preparing', 'canceled'],
    preparing: ['ready'],
    ready: ['picked_up'],
    picked_up: ['delivered'],
    delivered: [],
    canceled: [],
    refunded: []
  };

  if (!validTransitions[order.status]?.includes(status)) {
    return { ok: false, error: `Invalid status transition: ${order.status} → ${status}` };
  }

  const ts = now();
  const timestamps: Record<string, string> = {};
  if (status === 'confirmed') timestamps.confirmedAt = ts;
  if (status === 'preparing') timestamps.preparingAt = ts;
  if (status === 'ready') timestamps.readyAt = ts;
  if (status === 'picked_up') timestamps.pickedUpAt = ts;
  if (status === 'delivered') {
    timestamps.deliveredAt = ts;
    // Mark payment as paid upon delivery
    const updated2 = { ...order, ...timestamps, status, paymentStatus: 'paid' as const, updatedAt: ts };
    store.foodOrders.set(id, updated2);
    return { module: 'food-order', action: 'updateStatus', ok: true, order: updated2 };
  }

  const updated = { ...order, ...timestamps, status, updatedAt: ts };
  store.foodOrders.set(id, updated);
  return { module: 'food-order', action: 'updateStatus', ok: true, order: updated };
}

export async function assignDriver(body: any, params: any) {
  const id = params?.orderId || body?.orderId;
  const order = store.foodOrders.get(id);
  if (!order) return { ok: false, error: 'Order not found' };
  const driverId = body?.driverId;
  if (!driverId) return { ok: false, error: 'driverId is required' };
  const updated = { ...order, driverId, updatedAt: now() };
  store.foodOrders.set(id, updated);
  return { module: 'food-order', action: 'assignDriver', ok: true, order: updated };
}

export async function track(_body: any, params: any) {
  const id = params?.orderId;
  const order = store.foodOrders.get(id);
  if (!order) return { ok: false, error: 'Order not found' };

  // Return status timeline and estimated delivery info
  const timeline = [
    { status: 'placed', label: 'Order Placed', at: order.createdAt, done: true },
    { status: 'confirmed', label: 'Confirmed by Restaurant', at: order.confirmedAt, done: !!order.confirmedAt },
    { status: 'preparing', label: 'Being Prepared', at: order.preparingAt, done: !!order.preparingAt },
    { status: 'ready', label: 'Ready for Pickup', at: order.readyAt, done: !!order.readyAt },
    { status: 'picked_up', label: 'Driver Picked Up', at: order.pickedUpAt, done: !!order.pickedUpAt },
    { status: 'delivered', label: 'Delivered', at: order.deliveredAt, done: !!order.deliveredAt }
  ];

  let driverLocation = null;
  if (order.driverId) {
    const driver = store.drivers.get(order.driverId);
    if (driver?.lat && driver?.lng) {
      driverLocation = { lat: driver.lat, lng: driver.lng };
    }
  }

  return {
    module: 'food-order',
    action: 'track',
    ok: true,
    orderId: id,
    status: order.status,
    estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
    timeline,
    driverLocation,
    restaurantName: order.restaurantName,
    deliveryAddress: order.deliveryAddress
  };
}

export async function rate(body: any, params: any) {
  const id = params?.orderId || body?.orderId;
  const order = store.foodOrders.get(id);
  if (!order) return { ok: false, error: 'Order not found' };
  if (order.status !== 'delivered') return { ok: false, error: 'Can only rate delivered orders' };
  if (order.ratedAt) return { ok: false, error: 'Order already rated' };

  const rating = Number(body?.rating);
  if (rating < 1 || rating > 5) return { ok: false, error: 'Rating must be between 1 and 5' };

  const updated = {
    ...order,
    customerRating: rating,
    customerReview: body?.review,
    ratedAt: now(),
    updatedAt: now()
  };
  store.foodOrders.set(id, updated);

  // Update restaurant review collection and rating average
  const reviewId = makeId('rrev');
  store.restaurantReviews.push({
    id: reviewId,
    restaurantId: order.restaurantId,
    customerId: order.customerId,
    orderId: id,
    rating,
    review: body?.review,
    createdAt: now()
  });

  // Recalculate restaurant rating
  const restaurant = store.restaurants.get(order.restaurantId);
  if (restaurant) {
    const reviews = store.restaurantReviews.filter(r => r.restaurantId === order.restaurantId);
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    store.restaurants.set(order.restaurantId, {
      ...restaurant,
      rating: Math.round(avgRating * 10) / 10,
      ratingCount: reviews.length,
      updatedAt: now()
    });
  }

  return { module: 'food-order', action: 'rate', ok: true, order: updated };
}

export async function refund(body: any, params: any) {
  const id = params?.orderId || body?.orderId;
  const order = store.foodOrders.get(id);
  if (!order) return { ok: false, error: 'Order not found' };
  if (order.paymentStatus === 'refunded') return { ok: false, error: 'Already refunded' };
  const updated = {
    ...order,
    status: 'refunded' as FoodOrderStatus,
    paymentStatus: 'refunded' as const,
    updatedAt: now()
  };
  store.foodOrders.set(id, updated);
  return { module: 'food-order', action: 'refund', ok: true, order: updated };
}

// ─── Driver-facing food delivery endpoints ─────────────────────────────────

export async function driverOrders(body: any) {
  const driverId = body?.actor?.id || body?.driverId;
  const orders = Array.from(store.foodOrders.values()).filter(o => o.driverId === driverId);
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { module: 'food-order', action: 'driverOrders', ok: true, orders };
}

export async function availableForPickup(_body: any) {
  const orders = Array.from(store.foodOrders.values()).filter(
    o => o.status === 'ready' && !o.driverId
  );
  return { module: 'food-order', action: 'availableForPickup', ok: true, orders };
}

// ─── Admin endpoints ───────────────────────────────────────────────────────

export async function adminList(_body: any, _params: any, query: any) {
  let orders = Array.from(store.foodOrders.values());
  if (query?.restaurantId) orders = orders.filter(o => o.restaurantId === query.restaurantId);
  if (query?.status) orders = orders.filter(o => o.status === query.status);
  if (query?.customerId) orders = orders.filter(o => o.customerId === query.customerId);
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const limit = Number(query?.limit || 50);
  return { module: 'food-order', action: 'adminList', ok: true, orders: orders.slice(0, limit), total: orders.length };
}
