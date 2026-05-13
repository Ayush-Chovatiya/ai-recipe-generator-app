import express from "express";
const router = express.Router();
import * as recipeController from "../controllers/recipe.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

// All routes are protected
router.use(authMiddleware);

// AI generation
router.post("/generate", recipeController.generateRecipe);
router.get("/suggestions", recipeController.getPantrySuggestions);

// CRUD operations
router.get("/", recipeController.getRecipes);
router.get("/recent", recipeController.getRecentRecipesController);
router.get("/stats", recipeController.getRecipeStatsController);
router.get("/:id", recipeController.getRecipe);
router.post("/", recipeController.saveRecipe);
router.put("/:id", recipeController.updateRecipeController);
router.delete("/:id", recipeController.deleteRecipeController);

export default router;
