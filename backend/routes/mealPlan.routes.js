import express from "express";
const router = express.Router();
import * as mealPlanController from "../controllers/mealPlan.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

// All routes are protected
router.use(authMiddleware);

router.get("/weekly", mealPlanController.getWeeklyMealPlanController);
router.get("/upcoming", mealPlanController.getUpcomingMealsController);
router.get("/stats", mealPlanController.getMealPlanStatsController);
router.post("/", mealPlanController.addToMealPlan);
router.delete("/:id", mealPlanController.deleteMealPlanController);

export default router;
