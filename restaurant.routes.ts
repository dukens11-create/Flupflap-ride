import { Router } from 'express';
import * as controller from './restaurant.controller';
import { requireAuth, requireRole } from './auth.middleware';

const router = Router();

router.get('/health', controller.health);

// Admin-only static routes (must precede /:restaurantId param routes)
router.get('/admin/list', requireAuth, requireRole('admin'), controller.adminList);

// Public discovery endpoints
router.get('/search', controller.search);
router.get('/nearby', controller.nearby);
router.get('/featured', controller.featured);
router.get('/:restaurantId/menu', controller.getMenu);
router.get('/:restaurantId/reviews', controller.listReviews);
router.get('/:restaurantId', controller.get);
router.get('/', controller.list);

// Authenticated endpoints
router.use(requireAuth);

// Restaurant registration (any authenticated user can register a restaurant)
router.post('/register', controller.register);

// Restaurant management (merchants/restaurant owners)
router.put('/:restaurantId/open', controller.setOpen);
router.put('/:restaurantId', controller.update);

// Menu categories
router.post('/:restaurantId/categories', controller.createCategory);
router.get('/:restaurantId/categories', controller.listCategories);
router.put('/:restaurantId/categories/:categoryId', controller.updateCategory);
router.delete('/:restaurantId/categories/:categoryId', controller.deleteCategory);

// Menu items
router.post('/:restaurantId/items', controller.createItem);
router.get('/:restaurantId/items', controller.listItems);
router.put('/:restaurantId/items/:itemId', controller.updateItem);
router.delete('/:restaurantId/items/:itemId', controller.deleteItem);

// Restaurant orders
router.get('/:restaurantId/orders', controller.restaurantOrders);

// Analytics and earnings
router.get('/:restaurantId/analytics', controller.analytics);
router.get('/:restaurantId/earnings', controller.earnings);

// Promotions
router.post('/:restaurantId/promos', controller.createPromo);
router.get('/:restaurantId/promos', controller.listPromos);

// Admin-only param routes
router.post('/:restaurantId/approve', requireRole('admin'), controller.approve);
router.post('/:restaurantId/suspend', requireRole('admin'), controller.suspend);

export default router;
