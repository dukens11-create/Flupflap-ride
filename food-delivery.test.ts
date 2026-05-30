import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AddressInfo } from 'node:net';
import { randomUUID } from 'node:crypto';
import { createApp } from './app';

async function withServer(run: (baseUrl: string) => Promise<void>) {
  const { httpServer } = createApp();
  await new Promise<void>(resolve => {
    httpServer.listen(0, '127.0.0.1', () => resolve());
  });
  try {
    const address = httpServer.address() as AddressInfo;
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      httpServer.close(err => (err ? reject(err) : resolve()));
    });
  }
}

async function postJson(baseUrl: string, path: string, body: Record<string, unknown>, token?: string) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify(body)
  });
}

async function putJson(baseUrl: string, path: string, body: Record<string, unknown>, token?: string) {
  return fetch(`${baseUrl}${path}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: 'Bearer ' + token } : {})
    },
    body: JSON.stringify(body)
  });
}

async function getJson(baseUrl: string, path: string, token?: string) {
  return fetch(`${baseUrl}${path}`, {
    headers: token ? { authorization: 'Bearer ' + token } : {}
  });
}

async function signup(baseUrl: string, role: 'rider' | 'driver' | 'merchant' = 'rider') {
  const res = await postJson(baseUrl, '/api/auth/signup', {
    email: `${role}-${randomUUID()}@example.com`,
    password: 'password123',
    role
  });
  assert.equal(res.status, 200);
  const body = await res.json() as any;
  assert.equal(body.ok, true);
  return body as { user: { id: string }; accessToken: string };
}

async function loginAdmin(baseUrl: string) {
  const res = await postJson(baseUrl, '/api/auth/login', {
    email: 'admin@drive.com',
    password: 'change_me_admin_password'
  });
  const body = await res.json() as any;
  return body.accessToken as string;
}

test('GET /api/restaurants/health returns ok', async () => {
  await withServer(async baseUrl => {
    const res = await getJson(baseUrl, '/api/restaurants/health');
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.ok, true);
    assert.equal(body.module, 'restaurant');
  });
});

test('GET /api/food-orders/health returns ok', async () => {
  await withServer(async baseUrl => {
    const res = await getJson(baseUrl, '/api/food-orders/health');
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.ok, true);
    assert.equal(body.module, 'food-order');
  });
});

test('POST /api/restaurants/register creates restaurant', async () => {
  await withServer(async baseUrl => {
    const { accessToken } = await signup(baseUrl, 'merchant');
    const res = await postJson(baseUrl, '/api/restaurants/register', {
      name: 'Test Burger',
      address: '123 Main St',
      cuisineTypes: ['burgers', 'american'],
      phone: '+15551234567',
      deliveryFeeCents: 250,
      minimumOrderCents: 1000
    }, accessToken);
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.ok, true);
    assert.equal(body.restaurant.name, 'Test Burger');
    assert.equal(body.restaurant.status, 'pending');
  });
});

test('GET /api/restaurants/:id returns restaurant', async () => {
  await withServer(async baseUrl => {
    const { accessToken } = await signup(baseUrl, 'merchant');
    const createRes = await postJson(baseUrl, '/api/restaurants/register', {
      name: 'Pizza Palace',
      address: '456 Elm Ave',
      cuisineTypes: ['pizza', 'italian']
    }, accessToken);
    const created = await createRes.json() as any;
    const restaurantId = created.restaurant.id;

    const res = await getJson(baseUrl, `/api/restaurants/${restaurantId}`);
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.ok, true);
    assert.equal(body.restaurant.id, restaurantId);
    assert.equal(body.restaurant.name, 'Pizza Palace');
  });
});

test('GET /api/restaurants returns list', async () => {
  await withServer(async baseUrl => {
    const res = await getJson(baseUrl, '/api/restaurants');
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.ok, true);
    assert.ok(Array.isArray(body.restaurants));
  });
});

test('POST /api/restaurants/:id/categories creates menu category', async () => {
  await withServer(async baseUrl => {
    const { accessToken } = await signup(baseUrl, 'merchant');
    const r = await postJson(baseUrl, '/api/restaurants/register', { name: 'Taco Town', address: '789 Oak Blvd' }, accessToken);
    const { restaurant } = await r.json() as any;

    const res = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/categories`, {
      name: 'Tacos',
      sortOrder: 1
    }, accessToken);
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.ok, true);
    assert.equal(body.category.name, 'Tacos');
    assert.equal(body.category.restaurantId, restaurant.id);
  });
});

test('POST /api/restaurants/:id/items creates menu item', async () => {
  await withServer(async baseUrl => {
    const { accessToken } = await signup(baseUrl, 'merchant');
    const r = await postJson(baseUrl, '/api/restaurants/register', { name: 'Sushi House', address: '10 River Rd' }, accessToken);
    const { restaurant } = await r.json() as any;
    const catRes = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/categories`, { name: 'Rolls', sortOrder: 0 }, accessToken);
    const { category } = await catRes.json() as any;

    const res = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/items`, {
      categoryId: category.id,
      name: 'California Roll',
      priceCents: 1200,
      allergens: ['shellfish'],
      preparationMinutes: 10
    }, accessToken);
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.ok, true);
    assert.equal(body.item.name, 'California Roll');
    assert.equal(body.item.priceCents, 1200);
  });
});

test('GET /api/restaurants/:id/menu returns full menu', async () => {
  await withServer(async baseUrl => {
    const { accessToken } = await signup(baseUrl, 'merchant');
    const r = await postJson(baseUrl, '/api/restaurants/register', { name: 'Ramen Bar', address: '5 Noodle Ln' }, accessToken);
    const { restaurant } = await r.json() as any;
    await postJson(baseUrl, `/api/restaurants/${restaurant.id}/categories`, { name: 'Ramen', sortOrder: 0 }, accessToken);

    const res = await getJson(baseUrl, `/api/restaurants/${restaurant.id}/menu`);
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.ok, true);
    assert.ok(Array.isArray(body.menu));
  });
});

test('Full food order flow: create → confirm → prepare → ready → pickup → deliver → rate', async () => {
  await withServer(async baseUrl => {
    // Setup: admin approves restaurant, rider places order
    const adminToken = await loginAdmin(baseUrl);
    const { accessToken: merchantToken } = await signup(baseUrl, 'merchant');
    const { accessToken: riderToken } = await signup(baseUrl, 'rider');
    const { accessToken: driverToken, user: driverUser } = await signup(baseUrl, 'driver');

    // Register restaurant
    const regRes = await postJson(baseUrl, '/api/restaurants/register', {
      name: 'FastFood Place',
      address: '1 Fast Ave',
      cuisineTypes: ['fast food'],
      deliveryFeeCents: 200,
      minimumOrderCents: 500,
      taxRatePercent: 10
    }, merchantToken);
    const { restaurant } = await regRes.json() as any;

    // Admin approves
    const approveRes = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/approve`, {}, adminToken);
    const approved = await approveRes.json() as any;
    assert.equal(approved.restaurant.status, 'active');

    // Set restaurant open
    await putJson(baseUrl, `/api/restaurants/${restaurant.id}/open`, { isOpen: true }, merchantToken);

    // Add category and item
    const catRes = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/categories`, { name: 'Burgers', sortOrder: 0 }, merchantToken);
    const { category } = await catRes.json() as any;
    const itemRes = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/items`, {
      categoryId: category.id,
      name: 'Classic Burger',
      priceCents: 999
    }, merchantToken);
    const { item } = await itemRes.json() as any;

    // Rider places order
    const orderRes = await postJson(baseUrl, '/api/food-orders', {
      restaurantId: restaurant.id,
      items: [{ menuItemId: item.id, quantity: 2 }],
      deliveryAddress: '42 Customer St',
      paymentMethod: 'card'
    }, riderToken);
    assert.equal(orderRes.status, 200);
    const { order } = await orderRes.json() as any;
    assert.equal(order.status, 'placed');
    assert.equal(order.subtotalCents, 1998);

    // Restaurant confirms
    const confirmRes = await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'confirmed' }, merchantToken);
    const confirmed = await confirmRes.json() as any;
    assert.equal(confirmed.order.status, 'confirmed');

    // Restaurant starts preparing
    await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'preparing' }, merchantToken);

    // Restaurant marks ready
    await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'ready' }, merchantToken);

    // Assign driver
    await putJson(baseUrl, `/api/food-orders/${order.id}/assign-driver`, { driverId: driverUser.id }, adminToken);

    // Driver picks up
    await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'picked_up' }, driverToken);

    // Driver delivers
    const deliverRes = await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'delivered' }, driverToken);
    const delivered = await deliverRes.json() as any;
    assert.equal(delivered.order.status, 'delivered');
    assert.equal(delivered.order.paymentStatus, 'paid');

    // Track order
    const trackRes = await getJson(baseUrl, `/api/food-orders/${order.id}/track`, riderToken);
    const tracked = await trackRes.json() as any;
    assert.equal(tracked.ok, true);
    assert.equal(tracked.status, 'delivered');

    // Customer rates
    const rateRes = await postJson(baseUrl, `/api/food-orders/${order.id}/rate`, {
      rating: 5,
      review: 'Excellent food!'
    }, riderToken);
    const rated = await rateRes.json() as any;
    assert.equal(rated.ok, true);
    assert.equal(rated.order.customerRating, 5);

    // Restaurant analytics should reflect this order
    const analyticsRes = await getJson(baseUrl, `/api/restaurants/${restaurant.id}/analytics`, merchantToken);
    const analytics = await analyticsRes.json() as any;
    assert.equal(analytics.ok, true);
    assert.equal(analytics.analytics.deliveredOrders, 1);
    assert.equal(analytics.analytics.reviewCount, 1);
    assert.equal(analytics.analytics.avgRating, 5);

    // Check order history for rider
    const histRes = await getJson(baseUrl, '/api/food-orders/history', riderToken);
    const hist = await histRes.json() as any;
    assert.equal(hist.ok, true);
    assert.equal(hist.orders.length, 1);
    assert.equal(hist.orders[0].id, order.id);
  });
});

test('Food order cancel - only allowed before preparing', async () => {
  await withServer(async baseUrl => {
    const adminToken = await loginAdmin(baseUrl);
    const { accessToken: merchantToken } = await signup(baseUrl, 'merchant');
    const { accessToken: riderToken } = await signup(baseUrl, 'rider');

    const regRes = await postJson(baseUrl, '/api/restaurants/register', {
      name: 'Kebab Shop', address: '99 Grill Rd', deliveryFeeCents: 150, minimumOrderCents: 500
    }, merchantToken);
    const { restaurant } = await regRes.json() as any;
    await postJson(baseUrl, `/api/restaurants/${restaurant.id}/approve`, {}, adminToken);
    await putJson(baseUrl, `/api/restaurants/${restaurant.id}/open`, { isOpen: true }, merchantToken);

    const catRes = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/categories`, { name: 'Mains', sortOrder: 0 }, merchantToken);
    const { category } = await catRes.json() as any;
    const itemRes = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/items`, { categoryId: category.id, name: 'Doner', priceCents: 800 }, merchantToken);
    const { item } = await itemRes.json() as any;

    const orderRes = await postJson(baseUrl, '/api/food-orders', {
      restaurantId: restaurant.id,
      items: [{ menuItemId: item.id, quantity: 1 }],
      deliveryAddress: '5 Customer Ave'
    }, riderToken);
    const { order } = await orderRes.json() as any;

    // Can cancel when placed
    const cancelRes = await putJson(baseUrl, `/api/food-orders/${order.id}/cancel`, { reason: 'Changed my mind' }, riderToken);
    const canceled = await cancelRes.json() as any;
    assert.equal(canceled.ok, true);
    assert.equal(canceled.order.status, 'canceled');
  });
});

test('Restaurant search and nearby work', async () => {
  await withServer(async baseUrl => {
    const res = await getJson(baseUrl, '/api/restaurants/search?q=burger');
    assert.equal(res.status, 200);
    const body = await res.json() as any;
    assert.equal(body.ok, true);
    assert.ok(Array.isArray(body.restaurants));

    const nearbyRes = await getJson(baseUrl, '/api/restaurants/nearby?lat=40.7128&lng=-74.0060&radiusKm=5');
    assert.equal(nearbyRes.status, 200);
    const nearbyBody = await nearbyRes.json() as any;
    assert.equal(nearbyBody.ok, true);
    assert.ok(Array.isArray(nearbyBody.restaurants));
  });
});

test('Restaurant earnings calculation', async () => {
  await withServer(async baseUrl => {
    const adminToken = await loginAdmin(baseUrl);
    const { accessToken: merchantToken } = await signup(baseUrl, 'merchant');
    const { accessToken: riderToken } = await signup(baseUrl, 'rider');

    const regRes = await postJson(baseUrl, '/api/restaurants/register', {
      name: 'Earnings Test', address: '1 Revenue Rd', deliveryFeeCents: 0, minimumOrderCents: 0, taxRatePercent: 0, commissionRatePercent: 20
    }, merchantToken);
    const { restaurant } = await regRes.json() as any;
    await postJson(baseUrl, `/api/restaurants/${restaurant.id}/approve`, {}, adminToken);
    await putJson(baseUrl, `/api/restaurants/${restaurant.id}/open`, { isOpen: true }, merchantToken);

    const catRes = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/categories`, { name: 'Food', sortOrder: 0 }, merchantToken);
    const { category } = await catRes.json() as any;
    const itemRes = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/items`, { categoryId: category.id, name: 'Meal', priceCents: 1000 }, merchantToken);
    const { item } = await itemRes.json() as any;

    const orderRes = await postJson(baseUrl, '/api/food-orders', {
      restaurantId: restaurant.id, items: [{ menuItemId: item.id, quantity: 1 }], deliveryAddress: 'X'
    }, riderToken);
    const { order } = await orderRes.json() as any;
    await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'confirmed' }, merchantToken);
    await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'preparing' }, merchantToken);
    await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'ready' }, merchantToken);
    await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'picked_up' }, merchantToken);
    await putJson(baseUrl, `/api/food-orders/${order.id}/status`, { status: 'delivered' }, merchantToken);

    const earnRes = await getJson(baseUrl, `/api/restaurants/${restaurant.id}/earnings`, merchantToken);
    const earned = await earnRes.json() as any;
    assert.equal(earned.ok, true);
    assert.equal(earned.earnings.grossRevenueCents, 1000);
    assert.equal(earned.earnings.commissionCents, 200);
    assert.equal(earned.earnings.netRevenueCents, 800);
  });
});

test('Restaurant promo creation', async () => {
  await withServer(async baseUrl => {
    const { accessToken: merchantToken } = await signup(baseUrl, 'merchant');
    const r = await postJson(baseUrl, '/api/restaurants/register', { name: 'Promo Place', address: '7 Deal St' }, merchantToken);
    const { restaurant } = await r.json() as any;

    const promoRes = await postJson(baseUrl, `/api/restaurants/${restaurant.id}/promos`, {
      code: 'SAVE10',
      description: '10% off',
      discountType: 'percent',
      discountValue: 10,
      minimumOrderCents: 1000
    }, merchantToken);
    assert.equal(promoRes.status, 200);
    const body = await promoRes.json() as any;
    assert.equal(body.ok, true);
    assert.equal(body.promo.code, 'SAVE10');
  });
});
