import express from "express";
const router = express.Router();
import * as pantryController from "../controllers/pantry.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

// All routes are protected
router.use(authMiddleware);

router.get("/", pantryController.getPantryItems);
router.get("/stats", pantryController.getPantryStatsController);
router.get("/expiring-soon", pantryController.getExpiringSoon);
router.post("/", pantryController.addPantryItem);
router.put("/:id", pantryController.updatePantryItemController);
router.delete("/:id", pantryController.deletePantryItemController);

export default router;
