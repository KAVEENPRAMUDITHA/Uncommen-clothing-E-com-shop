import url from 'url';
import categories from './_handlers/categories.js';
import discounts from './_handlers/discounts.js';
import orders from './_handlers/orders.js';
import productImages from './_handlers/product-images.js';
import products from './_handlers/products.js';
import reviews from './_handlers/reviews.js';
import settings from './_handlers/settings.js';
import signup from './_handlers/signup.js';
import stats from './_handlers/stats.js';
import upload from './_handlers/upload.js';
import users from './_handlers/users.js';

const handlers = {
  categories,
  discounts,
  orders,
  'product-images': productImages,
  products,
  reviews,
  settings,
  signup,
  stats,
  upload,
  users,
};

export default async function handler(req, res) {
  const parsed = url.parse(req.url, true);
  let route = req.query?.route;

  if (!route) {
    const match = parsed.pathname.match(/^\/api\/([^/?]+)/);
    if (match) route = match[1];
  }

  if (Array.isArray(route)) route = route[0];
  if (route && route.startsWith('/')) route = route.slice(1);
  if (route && route.endsWith('/')) route = route.slice(0, -1);

  const routeHandler = handlers[route];
  if (!routeHandler) {
    return res.status(404).json({ error: `API route '${route || parsed.pathname}' not found` });
  }

  if (req.query) {
    const cleanQuery = { ...req.query, ...parsed.query };
    delete cleanQuery.route;
    req.query = cleanQuery;
  }

  return routeHandler(req, res);
}
