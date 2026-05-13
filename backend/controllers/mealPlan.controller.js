import {
  createMealPlan,
  getWeeklyMealPlan,
  getUpcomingMeals,
  deleteMealPlan,
  getMealPlanStats,
} from "../models/mealPlan.model.js";

/**
 * Add recipe to meal plan
 */
export const addToMealPlan = async (req, res, next) => {
  try {
    const mealPlan = await createMealPlan(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Recipe added to meal plan",
      data: { mealPlan },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get weekly meal plan
 */
export const getWeeklyMealPlanController = async (req, res, next) => {
  try {
    const { start_date, weekStartDate } = req.query;

    const startDate = start_date || weekStartDate;

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide start_date or weekStartDate",
      });
    }

    // validate date
    const parsedDate = new Date(startDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const mealPlans = await getWeeklyMealPlan(req.user.id, startDate);

    res.json({
      success: true,
      data: { mealPlans },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get upcoming meals
 */
export const getUpcomingMealsController = async (req, res, next) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit) || 5);

    const meals = await getUpcomingMeals(req.user.id, limit);

    res.json({
      success: true,
      data: { meals },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete meal plan
 */
export const deleteMealPlanController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mealPlan = await deleteMealPlan(id, req.user.id);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan entry not found",
      });
    }

    res.json({
      success: true,
      message: "Meal plan entry deleted",
      data: { mealPlan },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get meal plan stats
 */
export const getMealPlanStatsController = async (req, res, next) => {
  try {
    const stats = await getMealPlanStats(req.user.id);

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};
