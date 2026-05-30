import * as service from './food-order.service';

export function health(_req: any, res: any) { res.json({ module: 'food-order', ok: true }); }
export async function create(req: any, res: any) { res.json(await service.create({ ...req.body, actor: req.user })); }
export async function get(req: any, res: any) { res.json(await service.get({ ...req.body, actor: req.user }, req.params)); }
export async function history(req: any, res: any) { res.json(await service.history({ ...req.body, actor: req.user }, req.params, req.query)); }
export async function cancel(req: any, res: any) { res.json(await service.cancel({ ...req.body, actor: req.user }, req.params)); }
export async function updateStatus(req: any, res: any) { res.json(await service.updateStatus({ ...req.body, actor: req.user }, req.params)); }
export async function assignDriver(req: any, res: any) { res.json(await service.assignDriver({ ...req.body, actor: req.user }, req.params)); }
export async function track(req: any, res: any) { res.json(await service.track({ ...req.body, actor: req.user }, req.params)); }
export async function rate(req: any, res: any) { res.json(await service.rate({ ...req.body, actor: req.user }, req.params)); }
export async function refund(req: any, res: any) { res.json(await service.refund({ ...req.body, actor: req.user }, req.params)); }
export async function driverOrders(req: any, res: any) { res.json(await service.driverOrders({ ...req.body, actor: req.user })); }
export async function availableForPickup(req: any, res: any) { res.json(await service.availableForPickup({ ...req.body, actor: req.user })); }
export async function adminList(req: any, res: any) { res.json(await service.adminList(req.body, req.params, req.query)); }
