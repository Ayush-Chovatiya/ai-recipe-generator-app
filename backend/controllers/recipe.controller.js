// controllers/recipe.controller.js

import {
  createRecipe,
  getRecipeById,
  findRecipesByUserId,
  getRecentRecipes,
  updateRecipe,
  deleteRecipe,
  getRecipeStats,
} from "../models/recipe.model.js";

import {
  findItemByUserId,
  getItemsExpiringSoon,
} from "../models/pantryItem.model.js";

import {
  generateRecipe as generateRecipeAI,
  generatePantrySuggestions as generatePantrySuggestionsAI,
} from "../utils/gemini.js";

/**
 * Generate recipe using AI
 */
export const generateRecipe = async (req, res, next) => {
  try {
    const {
      ingredients = [],
      usePantryIngredients = false,
      dietaryRestrictions = [],
      cuisineType = "any",
      servings = 4,
      cookingTime = "medium",
    } = req.body;

    let finalIngredients = [...ingredients];

    // Add pantry ingredients if requested
    if (usePantryIngredients) {
      const pantryItems = await findItemByUserId(req.user.id);

      const pantryIngredientNames = pantryItems.map((item) => item.name);

      finalIngredients = [
        ...new Set([...finalIngredients, ...pantryIngredientNames]),
      ];
    }

    if (finalIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient",
      });
    }

    const recipe = await generateRecipeAI({
      ingredients: finalIngredients,
      dietaryRestrictions,
      cuisineType,
      servings,
      cookingTime,
    });

    res.json({
      success: true,
      message: "Recipe generated successfully",
      data: { recipe },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pantry suggestions
 */
export const getPantrySuggestions = async (req, res, next) => {
  try {
    const pantryItems = await findItemByUserId(req.user.id);

    const expiringItems = await getItemsExpiringSoon(req.user.id, 7);

    const expiringNames = expiringItems.map((item) => item.name);

    const suggestions = await generatePantrySuggestionsAI(
      pantryItems,
      expiringNames,
    );

    res.json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save recipe
 */
export const saveRecipe = async (req, res, next) => {
  try {
    const recipe = await createRecipe(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Recipe saved successfully",
      data: { recipe },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all recipes
 */
export const getRecipes = async (req, res, next) => {
  try {
    const {
      search,
      cuisine_type,
      difficulty,
      dietary_tag,
      max_cook_time,
      sort_by,
      sort_order,
      limit,
      offset,
    } = req.query;

    const recipes = await findRecipesByUserId(req.user.id, {
      search,
      cuisine_type,
      difficulty,
      dietary_tag,
      max_cook_time: max_cook_time ? parseInt(max_cook_time) : undefined,
      sort_by,
      sort_order,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
    });

    res.json({
      success: true,
      data: { recipes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent recipes
 */
export const getRecentRecipesController = async (req, res, next) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 5);

    const recipes = await getRecentRecipes(req.user.id, limit);

    res.json({
      success: true,
      data: { recipes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recipe by ID
 */
export const getRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await getRecipeById(id, req.user.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.json({
      success: true,
      data: { recipe },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update recipe
 */
export const updateRecipeController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await updateRecipe(id, req.user.id, req.body);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.json({
      success: true,
      message: "Recipe updated successfully",
      data: { recipe },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete recipe
 */
export const deleteRecipeController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recipe = await deleteRecipe(id, req.user.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.json({
      success: true,
      message: "Recipe deleted successfully",
      data: { recipe },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recipe stats
 */
export const getRecipeStatsController = async (req, res, next) => {
  try {
    const stats = await getRecipeStats(req.user.id);

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};
