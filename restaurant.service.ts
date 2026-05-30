import { makeId, store } from './data.store';

const now = () => new Date().toISOString();

// ─── Restaurant Management ─────────────────────────────────────────────────

export async function register(body: any) {
  const id = makeId('rest');
  const restaurant = {
    id,
    ownerId: body?.ownerId || body?.actor?.id || makeId('usr'),
    name: body?.name || 'Unnamed Restaurant',
    description: body?.description,
    cuisineTypes: body?.cuisineTypes || [],
    address: body?.address || '',
    lat: body?.lat,
    lng: body?.lng,
    phone: body?.phone,
    email: body?.email,
    logoUrl: body?.logoUrl,
    coverImageUrl: body?.coverImageUrl,
    status: 'pending' as const,
    isOpen: false,
    openHours: body?.openHours,
    deliveryFeeCents: Number(body?.deliveryFeeCents || 199),
    minimumOrderCents: Number(body?.minimumOrderCents || 1000),
    estimatedDeliveryMinutes: Number(body?.estimatedDeliveryMinutes || 30),
    taxRatePercent: Number(body?.taxRatePercent || 8.5),
    commissionRatePercent: Number(body?.commissionRatePercent || 15),
    rating: 0,
    ratingCount: 0,
    licenseNumber: body?.licenseNumber,
    healthCertUrl: body?.healthCertUrl,
    tags: body?.tags || [],
    createdAt: now(),
    updatedAt: now()
  };
  store.restaurants.set(id, restaurant);
  return { module: 'restaurant', action: 'register', ok: true, restaurant };
}

export async function get(body: any, params: any) {
  const id = params?.restaurantId || body?.restaurantId;
  const restaurant = store.restaurants.get(id);
  if (!restaurant) return { ok: false, error: 'Restaurant not found' };
  return { module: 'restaurant', action: 'get', ok: true, restaurant };
}

export async function update(body: any, params: any) {
  const id = params?.restaurantId || body?.restaurantId;
  const restaurant = store.restaurants.get(id);
  if (!restaurant) return { ok: false, error: 'Restaurant not found' };
  const updated = { ...restaurant, ...body, id, updatedAt: now() };
  store.restaurants.set(id, updated);
  return { module: 'restaurant', action: 'update', ok: true, restaurant: updated };
}

export async function list(_body: any, _params: any, query: any) {
  let restaurants = Array.from(store.restaurants.values());
  if (query?.cuisine) {
    restaurants = restaurants.filter(r => r.cuisineTypes.includes(query.cuisine));
  }
  if (query?.status) {
    restaurants = restaurants.filter(r => r.status === query.status);
  }
  if (query?.isOpen === 'true') {
    restaurants = restaurants.filter(r => r.isOpen && r.status === 'active');
  }
  return { module: 'restaurant', action: 'list', ok: true, restaurants };
}

export async function search(_body: any, _params: any, query: any) {
  const q = (query?.q || '').toLowerCase();
  const restaurants = Array.from(store.restaurants.values()).filter(r =>
    r.status === 'active' && (
      r.name.toLowerCase().includes(q) ||
      r.cuisineTypes.some(c => c.toLowerCase().includes(q)) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    )
  );
  return { module: 'restaurant', action: 'search', ok: true, restaurants };
}

export async function nearby(_body: any, _params: any, query: any) {
  const lat = Number(query?.lat || 0);
  const lng = Number(query?.lng || 0);
  const radiusKm = Number(query?.radiusKm || 10);

  const restaurants = Array.from(store.restaurants.values()).filter(r => {
    if (r.status !== 'active') return false;
    if (!r.lat || !r.lng) return true;
    const dlat = r.lat - lat;
    const dlng = r.lng - lng;
    const distKm = Math.sqrt(dlat * dlat + dlng * dlng) * 111;
    return distKm <= radiusKm;
  });

  return { module: 'restaurant', action: 'nearby', ok: true, restaurants };
}

export async function featured(_body: any) {
  const restaurants = Array.from(store.restaurants.values())
    .filter(r => r.status === 'active' && r.ratingCount >= 5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);
  return { module: 'restaurant', action: 'featured', ok: true, restaurants };
}

export async function approve(body: any, params: any) {
  const id = params?.restaurantId || body?.restaurantId;
  const restaurant = store.restaurants.get(id);
  if (!restaurant) return { ok: false, error: 'Restaurant not found' };
  const updated = { ...restaurant, status: 'active' as const, updatedAt: now() };
  store.restaurants.set(id, updated);
  return { module: 'restaurant', action: 'approve', ok: true, restaurant: updated };
}

export async function suspend(body: any, params: any) {
  const id = params?.restaurantId || body?.restaurantId;
  const restaurant = store.restaurants.get(id);
  if (!restaurant) return { ok: false, error: 'Restaurant not found' };
  const updated = { ...restaurant, status: 'suspended' as const, updatedAt: now() };
  store.restaurants.set(id, updated);
  return { module: 'restaurant', action: 'suspend', ok: true, restaurant: updated };
}

export async function setOpen(body: any, params: any) {
  const id = params?.restaurantId || body?.restaurantId;
  const restaurant = store.restaurants.get(id);
  if (!restaurant) return { ok: false, error: 'Restaurant not found' };
  const updated = { ...restaurant, isOpen: body?.isOpen !== false, updatedAt: now() };
  store.restaurants.set(id, updated);
  return { module: 'restaurant', action: 'setOpen', ok: true, restaurant: updated };
}

// ─── Menu Categories ───────────────────────────────────────────────────────

export async function createCategory(body: any, params: any) {
  const restaurantId = params?.restaurantId || body?.restaurantId;
  const id = makeId('mcat');
  const category = {
    id,
    restaurantId,
    name: body?.name || 'Category',
    description: body?.description,
    sortOrder: Number(body?.sortOrder || 0),
    available: body?.available !== false,
    createdAt: now()
  };
  store.menuCategories.set(id, category);
  return { module: 'restaurant', action: 'createCategory', ok: true, category };
}

export async function listCategories(_body: any, params: any) {
  const restaurantId = params?.restaurantId;
  const categories = Array.from(store.menuCategories.values())
    .filter(c => c.restaurantId === restaurantId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return { module: 'restaurant', action: 'listCategories', ok: true, categories };
}

export async function updateCategory(body: any, params: any) {
  const id = params?.categoryId || body?.categoryId;
  const category = store.menuCategories.get(id);
  if (!category) return { ok: false, error: 'Category not found' };
  const updated = { ...category, ...body, id, restaurantId: category.restaurantId };
  store.menuCategories.set(id, updated);
  return { module: 'restaurant', action: 'updateCategory', ok: true, category: updated };
}

export async function deleteCategory(_body: any, params: any) {
  const id = params?.categoryId;
  if (!store.menuCategories.has(id)) return { ok: false, error: 'Category not found' };
  store.menuCategories.delete(id);
  return { module: 'restaurant', action: 'deleteCategory', ok: true };
}

// ─── Menu Items ────────────────────────────────────────────────────────────

export async function createItem(body: any, params: any) {
  const restaurantId = params?.restaurantId || body?.restaurantId;
  const id = makeId('mitem');
  const item = {
    id,
    restaurantId,
    categoryId: body?.categoryId || '',
    name: body?.name || 'Item',
    description: body?.description,
    priceCents: Number(body?.priceCents || 0),
    imageUrl: body?.imageUrl,
    ingredients: body?.ingredients || [],
    allergens: body?.allergens || [],
    isAvailable: body?.isAvailable !== false,
    isPopular: body?.isPopular === true,
    variants: body?.variants || [],
    rating: 0,
    ratingCount: 0,
    preparationMinutes: Number(body?.preparationMinutes || 15),
    createdAt: now(),
    updatedAt: now()
  };
  store.menuItems.set(id, item);
  return { module: 'restaurant', action: 'createItem', ok: true, item };
}

export async function listItems(_body: any, params: any, query: any) {
  const restaurantId = params?.restaurantId;
  let items = Array.from(store.menuItems.values()).filter(i => i.restaurantId === restaurantId);
  if (query?.categoryId) items = items.filter(i => i.categoryId === query.categoryId);
  if (query?.available === 'true') items = items.filter(i => i.isAvailable);
  return { module: 'restaurant', action: 'listItems', ok: true, items };
}

export async function updateItem(body: any, params: any) {
  const id = params?.itemId || body?.itemId;
  const item = store.menuItems.get(id);
  if (!item) return { ok: false, error: 'Menu item not found' };
  const updated = { ...item, ...body, id, restaurantId: item.restaurantId, updatedAt: now() };
  store.menuItems.set(id, updated);
  return { module: 'restaurant', action: 'updateItem', ok: true, item: updated };
}

export async function deleteItem(_body: any, params: any) {
  const id = params?.itemId;
  if (!store.menuItems.has(id)) return { ok: false, error: 'Menu item not found' };
  store.menuItems.delete(id);
  return { module: 'restaurant', action: 'deleteItem', ok: true };
}

export async function getMenu(_body: any, params: any) {
  const restaurantId = params?.restaurantId;
  const restaurant = store.restaurants.get(restaurantId);
  if (!restaurant) return { ok: false, error: 'Restaurant not found' };
  const categories = Array.from(store.menuCategories.values())
    .filter(c => c.restaurantId === restaurantId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const items = Array.from(store.menuItems.values()).filter(i => i.restaurantId === restaurantId);
  const menu = categories.map(category => ({
    ...category,
    items: items.filter(item => item.categoryId === category.id)
  }));
  return { module: 'restaurant', action: 'getMenu', ok: true, restaurant, menu };
}

// ─── Restaurant Reviews ────────────────────────────────────────────────────

export async function listReviews(_body: any, params: any) {
  const restaurantId = params?.restaurantId;
  const reviews = store.restaurantReviews.filter(r => r.restaurantId === restaurantId);
  return { module: 'restaurant', action: 'listReviews', ok: true, reviews };
}

// ─── Restaurant Analytics ─────────────────────────────────────────────────

export async function analytics(body: any, params: any) {
  const restaurantId = params?.restaurantId || body?.restaurantId || body?.actor?.restaurantId;
  const orders = Array.from(store.foodOrders.values()).filter(o => o.restaurantId === restaurantId);
  const delivered = orders.filter(o => o.status === 'delivered');
  const totalRevenueCents = delivered.reduce((s, o) => s + o.totalCents, 0);
  const avgOrderValueCents = delivered.length ? Math.round(totalRevenueCents / delivered.length) : 0;
  const reviews = store.restaurantReviews.filter(r => r.restaurantId === restaurantId);
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return {
    module: 'restaurant',
    action: 'analytics',
    ok: true,
    analytics: {
      restaurantId,
      totalOrders: orders.length,
      deliveredOrders: delivered.length,
      canceledOrders: orders.filter(o => o.status === 'canceled').length,
      totalRevenueCents,
      avgOrderValueCents,
      reviewCount: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10
    }
  };
}

export async function earnings(body: any, params: any) {
  const restaurantId = params?.restaurantId || body?.restaurantId || body?.actor?.restaurantId;
  const orders = Array.from(store.foodOrders.values()).filter(
    o => o.restaurantId === restaurantId && o.status === 'delivered'
  );
  const restaurant = store.restaurants.get(restaurantId);
  const commission = restaurant?.commissionRatePercent || 15;
  const grossCents = orders.reduce((s, o) => s + o.subtotalCents, 0);
  const commissionCents = Math.round(grossCents * commission / 100);
  const netCents = grossCents - commissionCents;
  return {
    module: 'restaurant',
    action: 'earnings',
    ok: true,
    earnings: {
      restaurantId,
      ordersCount: orders.length,
      grossRevenueCents: grossCents,
      commissionRatePercent: commission,
      commissionCents,
      netRevenueCents: netCents
    }
  };
}

// ─── Restaurant Promos ─────────────────────────────────────────────────────

export async function createPromo(body: any, params: any) {
  const restaurantId = params?.restaurantId || body?.restaurantId;
  const id = makeId('rpromo');
  const promo = {
    id,
    restaurantId,
    code: (body?.code || makeId('CODE')).toUpperCase(),
    description: body?.description || '',
    discountType: body?.discountType || 'flat' as const,
    discountValue: Number(body?.discountValue || 0),
    minimumOrderCents: Number(body?.minimumOrderCents || 0),
    maxUsages: body?.maxUsages,
    usageCount: 0,
    expiresAt: body?.expiresAt,
    active: true,
    createdAt: now()
  };
  store.restaurantPromos.set(id, promo);
  return { module: 'restaurant', action: 'createPromo', ok: true, promo };
}

export async function listPromos(_body: any, params: any) {
  const restaurantId = params?.restaurantId;
  const promos = Array.from(store.restaurantPromos.values()).filter(p => p.restaurantId === restaurantId);
  return { module: 'restaurant', action: 'listPromos', ok: true, promos };
}

export async function restaurantOrders(body: any, params: any, query: any) {
  const restaurantId = params?.restaurantId || body?.restaurantId || body?.actor?.restaurantId;
  let orders = Array.from(store.foodOrders.values()).filter(o => o.restaurantId === restaurantId);
  if (query?.status) orders = orders.filter(o => o.status === query.status);
  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { module: 'restaurant', action: 'orders', ok: true, orders };
}

export async function adminList(_body: any, _params: any, query: any) {
  let restaurants = Array.from(store.restaurants.values());
  if (query?.status) restaurants = restaurants.filter(r => r.status === query.status);
  restaurants.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { module: 'restaurant', action: 'adminList', ok: true, restaurants };
}
