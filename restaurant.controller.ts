import * as service from './restaurant.service';

export function health(_req: any, res: any) { res.json({ module: 'restaurant', ok: true }); }
export async function register(req: any, res: any) { res.json(await service.register({ ...req.body, actor: req.user })); }
export async function get(req: any, res: any) { res.json(await service.get({ ...req.body, actor: req.user }, req.params)); }
export async function update(req: any, res: any) { res.json(await service.update({ ...req.body, actor: req.user }, req.params)); }
export async function list(req: any, res: any) { res.json(await service.list(req.body, req.params, req.query)); }
export async function search(req: any, res: any) { res.json(await service.search(req.body, req.params, req.query)); }
export async function nearby(req: any, res: any) { res.json(await service.nearby(req.body, req.params, req.query)); }
export async function featured(req: any, res: any) { res.json(await service.featured(req.body)); }
export async function approve(req: any, res: any) { res.json(await service.approve({ ...req.body, actor: req.user }, req.params)); }
export async function suspend(req: any, res: any) { res.json(await service.suspend({ ...req.body, actor: req.user }, req.params)); }
export async function setOpen(req: any, res: any) { res.json(await service.setOpen({ ...req.body, actor: req.user }, req.params)); }
export async function createCategory(req: any, res: any) { res.json(await service.createCategory({ ...req.body, actor: req.user }, req.params)); }
export async function listCategories(req: any, res: any) { res.json(await service.listCategories(req.body, req.params)); }
export async function updateCategory(req: any, res: any) { res.json(await service.updateCategory({ ...req.body, actor: req.user }, req.params)); }
export async function deleteCategory(req: any, res: any) { res.json(await service.deleteCategory(req.body, req.params)); }
export async function createItem(req: any, res: any) { res.json(await service.createItem({ ...req.body, actor: req.user }, req.params)); }
export async function listItems(req: any, res: any) { res.json(await service.listItems(req.body, req.params, req.query)); }
export async function updateItem(req: any, res: any) { res.json(await service.updateItem({ ...req.body, actor: req.user }, req.params)); }
export async function deleteItem(req: any, res: any) { res.json(await service.deleteItem(req.body, req.params)); }
export async function getMenu(req: any, res: any) { res.json(await service.getMenu(req.body, req.params)); }
export async function listReviews(req: any, res: any) { res.json(await service.listReviews(req.body, req.params)); }
export async function analytics(req: any, res: any) { res.json(await service.analytics({ ...req.body, actor: req.user }, req.params)); }
export async function earnings(req: any, res: any) { res.json(await service.earnings({ ...req.body, actor: req.user }, req.params)); }
export async function createPromo(req: any, res: any) { res.json(await service.createPromo({ ...req.body, actor: req.user }, req.params)); }
export async function listPromos(req: any, res: any) { res.json(await service.listPromos(req.body, req.params)); }
export async function restaurantOrders(req: any, res: any) { res.json(await service.restaurantOrders({ ...req.body, actor: req.user }, req.params, req.query)); }
export async function adminList(req: any, res: any) { res.json(await service.adminList(req.body, req.params, req.query)); }
