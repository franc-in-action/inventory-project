// backend/routes/ecommerceRoutes.js
import express from "express";
import categoriesRouter from "./categories.js";
import customersRouter from "./customers.js";
import locationsRouter from "./locations.js";
import paymentsRouter from "./payments.js";
import productsRouter from "./products.js";
import purchasesRouter from "./purchases.js";
import rolesRouter from "./roles.js";
import salesRouter from "./sales.js";
import stockRouter from "./stock.js";
import usersRouter from "./users.js";
import vendorsRouter from "./vendors.js";

// Map module names to routers
const ROUTERS = {
  categories: categoriesRouter,
  customers: customersRouter,
  locations: locationsRouter,
  payments: paymentsRouter,
  products: productsRouter,
  purchases: purchasesRouter,
  roles: rolesRouter,
  sales: salesRouter,
  stock: stockRouter,
  users: usersRouter,
  vendors: vendorsRouter,
};

/**
 * Create a router that mounts only selected modules
 * @param {Array<string>} modules - list of module names to mount, or undefined for all
 * @returns express.Router
 */
export function createEcommerceRouter(modules) {
  const router = express.Router();

  const selectedModules =
    modules && modules.length ? modules : Object.keys(ROUTERS);

  selectedModules.forEach((name) => {
    const subRouter = ROUTERS[name];
    if (subRouter) {
      router.use(`/${name}`, subRouter);
    } else {
      console.warn(`[ecommerceRoutes] No router found for module: ${name}`);
    }
  });

  return router;
}

// Default export mounts all routes
export default createEcommerceRouter();
