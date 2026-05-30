import { Router } from 'express';
import * as controller from './food-order.controller';
import { requireAuth, requireRole } from './auth.middleware';

const router = Router();

router.get('/health', controller.health);
router.use(requireAuth);

// Customer order endpoints
router.post('/', requireRole('rider'), controller.create);
router.get('/history', requireRole('rider'), controller.history);
router.get('/driver/mine', requireRole('driver'), controller.driverOrders);
router.get('/driver/available', requireRole('driver'), controller.availableForPickup);
router.get('/admin/all', requireRole('admin'), controller.adminList);
router.get('/:orderId/track', controller.track);
router.get('/:orderId', controller.get);
router.put('/:orderId/cancel', requireRole('rider'), controller.cancel);
router.put('/:orderId/status', controller.updateStatus);
router.put('/:orderId/assign-driver', controller.assignDriver);
router.post('/:orderId/rate', requireRole('rider'), controller.rate);
router.post('/:orderId/refund', requireRole('admin'), controller.refund);

export default router;
